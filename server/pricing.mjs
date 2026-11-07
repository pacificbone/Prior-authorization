// Private Cuptomize evidence bridge. Called only by the authenticated PBJ
// staff screen. This is NEVER a member benefit, member price or authorization
// endpoint. No patient name, DOB, member ID, chart, medication history, or
// document may cross this boundary.
import {verifyStaffAccess} from './access.mjs';
import {staffContext} from '../shared/staff-workflow.mjs';
import {COST_FACILITIES,COST_SETTINGS} from '../shared/patient-cost.mjs';
import {readBoundedJson} from './security.mjs';

const keys=new Set(['payer','planId','year','serviceId','benefit','facilityId','setting','code']);
const DRGS=new Set(['DRG 469','DRG 470','DRG 461','DRG 462']);
const RATE_CODE=/^(?:[0-9]{5}|[A-Z][0-9]{4}|DRG [0-9]{3})$/;
export function validateStaffRateRequest(body){
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(x=>!keys.has(x)))
   throw Error('Only public plan, procedure and facility codes are allowed. Never enter patient information.');
 const {payer,planId,year,serviceId,benefit,facilityId,setting,code}=body;
 if(typeof payer!=='string'||typeof planId!=='string'||typeof serviceId!=='string'||
   typeof facilityId!=='string'||typeof code!=='string'||typeof setting!=='string'||
   !RATE_CODE.test(code)||!COST_SETTINGS.includes(setting))throw Error('Choose a validated plan, service, code and setting.');
 if(benefit!=='Medical')throw Error('The facility/physician rate tool is for medical procedures, not retail pharmacy benefits.');
 const ctx=staffContext({payer,planId,year,serviceId,benefit});
 if(!ctx.plan||!ctx.service)throw Error('The selected payer and plan could not be matched.');
 const location=COST_FACILITIES.find(x=>x.id===facilityId);
 if(!location)throw Error('Unknown facility.');
 const codes=ctx.possibleCodes.map(x=>x.code);
 const inpatientDrg=setting==='Hospital inpatient'&&ctx.service.category==='arthroplasty'&&DRGS.has(code);
 if(!codes.includes(code)&&!inpatientDrg)
   throw Error('Code does not match the selected procedure; inpatient DRGs require separate verification.');
 if(setting==='Hospital inpatient'&&!inpatientDrg)
   throw Error('Inpatient estimates require an explicitly selected DRG, not an outpatient CPT.');
 if(setting==='Hospital outpatient'&&location.category!=='hospital-mrf')
   throw Error('Choose the exact hospital; an imaging center or ASC cannot inherit hospital prices.');
 return {payer,planId,year,serviceId,facilityId,setting,code,
   planName:ctx.plan.name,planPrecision:ctx.planPrecision.level};
}

export function createStaffRateBridge({verify=verifyStaffAccess}={}){
 return async function handleStaffRateRequest(request,env={}){
   const u=new URL(request.url);
   const respond=(value,status=200)=>new Response(JSON.stringify(value),{
     status,headers:{'Content-Type':'application/json; charset=utf-8',
       'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
   if(u.pathname!=='/api/staff/rates')return null;
   if(request.method!=='POST')return respond({error:'Method not allowed'},405);
   if(request.headers.get('Origin')!==(env.APP_ORIGIN||u.origin)||
      request.headers.get('Sec-Fetch-Site')==='cross-site')
     return respond({error:'Same-origin staff request required.'},403);
   const identity=await verify(request,env);
   if(!identity.configured)return respond({error:'Staff pricing is disabled until Cloudflare Access team domain and audience are configured. No rates were queried.'},503);
   if(!identity.verified)return respond({error:'A verified Cloudflare Access staff session is required for private pricing.'},403);
   if(!env.CUP_PRICE_SERVICE||typeof env.CUP_PRICE_SERVICE.fetch!=='function'||
       typeof env.CUP_PRICE_BRIDGE_TOKEN!=='string'||env.CUP_PRICE_BRIDGE_TOKEN.length<24)
     return respond({error:'Protected Cuptomize Worker binding or matching server secret is not configured. No private rates available.'},503);
   let input;
   try{input=validateStaffRateRequest(await readBoundedJson(request,1400));}
   catch(e){return respond({error:e.message||'Invalid non-patient query'},400);}
   const evidenceRequest={payer:input.payer,year:input.year,facilityId:input.facilityId,
     setting:input.setting,code:input.code};
   try{
     const result=await env.CUP_PRICE_SERVICE.fetch(new Request('https://cup-optimize.internal/api/staff-pricing/evidence',{
       method:'POST',
       headers:{'Content-Type':'application/json','X-PBJ-Staff-Bridge':env.CUP_PRICE_BRIDGE_TOKEN},
       body:JSON.stringify(evidenceRequest)
     }));
     if(!result.ok)return respond({error:result.status===403?'Cuptomize private bridge credential was rejected.':'Cuptomize rate evidence is unavailable or not loaded.',upstreamStatus:result.status},503);
     const raw=await result.text();
     if(raw.length>80000)throw Error('Private rate response unexpectedly large');
     const data=JSON.parse(raw);
     if(data?.status!=='public-rate-evidence-only'||data?.patientQuoteReady!==false||
        data?.applyAutomatically!==false||!Array.isArray(data?.facility)||
        !Array.isArray(data?.professional)||data.facility.length>12||data.professional.length>8||
        data?.request?.payer!==input.payer||data?.request?.code!==input.code||
        data?.request?.facilityId!==input.facilityId||data?.request?.setting!==input.setting||
        data?.request?.year!==input.year)throw Error('Private rate response did not match the requested scope');
     return respond({...data,planScope:input.planName,planPrecision:input.planPrecision,
       exactMemberPlanVerified:false,patientQuoteReady:false,applyAutomatically:false});
   }catch{
     return respond({error:'Protected Cuptomize rate response could not be validated. No rate can be used as a patient quote.'},503);
   }
 };
}
export const handleStaffRateRequest=createStaffRateBridge();
