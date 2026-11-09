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
// Labels the private service may put on a facility row for each requested setting.
const ROW_SETTINGS={'Office':['office','Office'],'ASC':['asc','ASC'],
 'Hospital outpatient':['outpatient','Hospital outpatient'],'Hospital inpatient':['inpatient','Hospital inpatient']};
// Only messages raised through this class reach staff; every other failure is generic.
export class StaffRateInputError extends Error{}
const reject=message=>{throw new StaffRateInputError(message);};
// Status-page boolean only; the same rule gates the bridge below. Never exposes values.
export const pricingBridgeConfigured=env=>!!env&&typeof env.CUP_PRICE_SERVICE?.fetch==='function'&&
 typeof env.CUP_PRICE_BRIDGE_TOKEN==='string'&&env.CUP_PRICE_BRIDGE_TOKEN.length>=24;
export function validateStaffRateRequest(body){
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(x=>!keys.has(x)))
   reject('Only public plan, procedure and facility codes are allowed. Never enter patient information.');
 const {payer,planId,year,serviceId,benefit,facilityId,setting,code}=body;
 if(typeof payer!=='string'||typeof planId!=='string'||typeof serviceId!=='string'||
   typeof facilityId!=='string'||typeof code!=='string'||typeof setting!=='string'||
   !RATE_CODE.test(code)||!COST_SETTINGS.includes(setting))reject('Choose a validated plan, service, code and setting.');
 if(benefit!=='Medical')reject('The facility/physician rate tool is for medical procedures, not retail pharmacy benefits.');
 let ctx;
 try{ctx=staffContext({payer,planId,year,serviceId,benefit});}catch(e){reject(e.message);}
 if(!ctx.plan||!ctx.service)reject('The selected payer and plan could not be matched.');
 const location=COST_FACILITIES.find(x=>x.id===facilityId);
 if(!location)reject('Unknown facility.');
 if(location.category==='unknown')reject('Choose the actual facility before requesting rate evidence.');
 const codes=ctx.possibleCodes.map(x=>x.code);
 const inpatientDrg=setting==='Hospital inpatient'&&ctx.service.category==='arthroplasty'&&DRGS.has(code);
 if(!codes.includes(code)&&!inpatientDrg)
   reject('Code does not match the selected procedure; inpatient DRGs require separate verification.');
 if(setting==='Hospital inpatient'&&!inpatientDrg)
   reject('Inpatient estimates require an explicitly selected DRG, not an outpatient CPT.');
 if(setting==='Hospital outpatient'&&location.category!=='hospital-mrf')
   reject('Choose the exact hospital; an imaging center or ASC cannot inherit hospital prices.');
 if((setting==='ASC'||setting==='Office')&&location.category==='hospital-mrf')
   reject('An ASC or office cannot inherit hospital prices. Choose the ambulatory or office location, or change the setting to Hospital outpatient.');
 return {payer,planId,year,serviceId,facilityId,setting,code,
   planName:ctx.plan.name,planPrecision:ctx.planPrecision.level};
}

// Response shaping: every field the staff screen receives is allowlisted and strictly typed.
// A row with any invalid value is dropped; a 0 or malformed amount must never render as a price.
const INVALID=Symbol('invalid');
const optional=(v,check)=>v===null||v===undefined?null:check(v)?v:INVALID;
const money=v=>optional(v,x=>typeof x==='number'&&Number.isFinite(x)&&x>0);
const percent=v=>optional(v,x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=100);
const text=(v,max=200)=>optional(v,x=>typeof x==='string'&&x.length<=max);
const count=v=>optional(v,x=>Number.isInteger(x)&&x>=0);
const httpsUrl=v=>{try{return typeof v==='string'&&v.length<=2048&&new URL(v).protocol==='https:'?v:null;}catch{return null;}};
const row=fields=>Object.values(fields).includes(INVALID)?null:fields;
function facilityRow(x,input){
 if(!x||typeof x!=='object'||x.code!==input.code||!ROW_SETTINGS[input.setting].includes(x.setting)||
    x.facilityId!==undefined&&x.facilityId!==input.facilityId)return null;
 return row({facilityId:input.facilityId,code:input.code,setting:x.setting,payerLabel:text(x.payerLabel),description:text(x.description),
   amount:money(x.amount),percent:percent(x.percent),medianAllowed:money(x.medianAllowed),methodology:text(x.methodology),
   billingClassVerified:x.billingClassVerified===true,sourceUpdated:text(x.sourceUpdated),sourceUrl:httpsUrl(x.sourceUrl)});
}
function professionalRow(x,input){
 if(!x||typeof x!=='object'||x.code!==input.code)return null;
 return row({payer:text(x.payer),planLabel:text(x.planLabel),code:input.code,setting:text(x.setting,40),
   minimum:money(x.minimum),median:money(x.median),maximum:money(x.maximum),observationCount:count(x.observationCount)});
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
   if(!pricingBridgeConfigured(env))
     return respond({error:'Protected Cuptomize Worker binding or matching server secret is not configured. No private rates available.'},503);
   let body;
   try{body=await readBoundedJson(request,1400);}
   catch{return respond({error:'Invalid JSON or oversized request.'},400);}
   let input;
   try{input=validateStaffRateRequest(body);}
   catch(e){return respond({error:e instanceof StaffRateInputError?e.message:'Invalid non-patient query.'},400);}
   const evidenceRequest={payer:input.payer,year:input.year,facilityId:input.facilityId,
     setting:input.setting,code:input.code};
   try{
     const result=await env.CUP_PRICE_SERVICE.fetch(new Request('https://cup-optimize.internal/api/staff-pricing/evidence',{
       method:'POST',
       headers:{'Content-Type':'application/json','X-PBJ-Staff-Bridge':env.CUP_PRICE_BRIDGE_TOKEN},
       body:JSON.stringify(evidenceRequest)
     }));
     if(!result.ok)return respond({error:result.status===403?'Cuptomize private bridge credential was rejected.':'Cuptomize rate evidence is unavailable or not loaded.'},503);
     const raw=await result.text();
     if(raw.length>80000)throw Error('Private rate response unexpectedly large');
     const data=JSON.parse(raw);
     if(data?.status!=='public-rate-evidence-only'||data?.patientQuoteReady!==false||
        data?.applyAutomatically!==false||!Array.isArray(data?.facility)||
        !Array.isArray(data?.professional)||data.facility.length>12||data.professional.length>8||
        data?.request?.payer!==input.payer||data?.request?.code!==input.code||
        data?.request?.facilityId!==input.facilityId||data?.request?.setting!==input.setting||
        data?.request?.year!==input.year)throw Error('Private rate response did not match the requested scope');
     return respond({
       status:'public-rate-evidence-only',request:evidenceRequest,
       facility:data.facility.map(x=>facilityRow(x,input)).filter(Boolean),
       professional:data.professional.map(x=>professionalRow(x,input)).filter(Boolean),
       warnings:Array.isArray(data.warnings)?data.warnings.filter(x=>typeof x==='string'&&x.length<=300).slice(0,10):[],
       builtAt:typeof data.builtAt==='string'&&data.builtAt.length<=40?data.builtAt:null,
       facilityMatches:Number.isInteger(data.facilityMatches)&&data.facilityMatches>=0?data.facilityMatches:null,
       facilityTruncated:data.facilityTruncated===true,
       selectedSourceLabel:input.planName,planPrecision:input.planPrecision,
       rateScope:'payer-level, not plan-specific',
       exactMemberPlanVerified:false,patientQuoteReady:false,applyAutomatically:false});
   }catch{
     return respond({error:'Protected Cuptomize rate response could not be validated. No rate can be used as a patient quote.'},503);
   }
 };
}
export const handleStaffRateRequest=createStaffRateBridge();
