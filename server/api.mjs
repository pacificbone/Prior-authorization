import {createPublishedFormularyService,validateSearchInput} from './formulary.mjs';
import {samples} from '../shared/fixtures.mjs';
import {policies} from '../shared/catalog.mjs';
import {applyPolicyPathway} from '../shared/domain.mjs';
import {aiConfiguration,extractEvidence} from './ai.mjs';
import {handleStaffRateRequest} from './pricing.mjs';
import {json,readBoundedJson,secureResponse,tokenMatches} from './security.mjs';
// Trial rate limiting is per process/isolate, not a production distributed control.
export function createApi({fetcher=fetch,now=()=>Date.now()}={}) {
  let calls=[];
  const searchPublicFormulary=createPublishedFormularyService({fetcher,now});
  return async function handle(request,env={}) {
    const url=new URL(request.url);
    const reply=(data,status=200)=>secureResponse(json(data,status),request.url);
    if(url.pathname==='/api/status'&&request.method==='GET') return reply({...aiConfiguration(env),storage:'browser-memory-or-explicit-encrypted-vault',phiRelease:'blocked',version:'0.1.0'});
    if(url.pathname==='/api/staff/rates')
      return secureResponse(await handleStaffRateRequest(request,env),request.url);
    if(url.pathname==='/api/formulary/search') {
      if(request.method!=='POST')return reply({error:'Method not allowed.'},405);
      const origin=request.headers.get('origin');
      const allowed=env.APP_ORIGIN||url.origin;
      if(!origin||origin!==allowed||request.headers.get('sec-fetch-site')==='cross-site')
        return reply({error:'Same-origin requests are required.'},403);
      let input;
      try{input=await readBoundedJson(request);validateSearchInput(input);}
      catch{return reply({error:'Use a drug name or RxNorm identifier, not patient information.'},400);}
      try{return reply(await searchPublicFormulary(input));}
      catch{return reply({error:'The official published list could not be verified right now. No formulary conclusion is available. Use the payer source link and try again later.'},503);}
    }
    if(url.pathname!=='/api/ai/extract') return reply({error:'Not found.'},404);
    if(request.method!=='POST') return reply({error:'Method not allowed.'},405);
    const origin=request.headers.get('origin');
    const allowed=env.APP_ORIGIN||url.origin;
    if(!origin||origin!==allowed||request.headers.get('sec-fetch-site')==='cross-site') return reply({error:'Same-origin requests are required.'},403);
    if(!aiConfiguration(env).configured) return reply({error:'AI is not connected. Configure a server-side provider, model, trial token and AI_TRIAL_ENABLED. Local letter drafting works without AI.'},503);
    if(!await tokenMatches(request.headers.get('x-trial-token'),env.TRIAL_ACCESS_TOKEN)) return reply({error:'Enter the trial access token in Connection settings.'},401);
    let input;
    try{input=await readBoundedJson(request);}catch{return reply({error:'Invalid JSON or oversized request.'},400);}
    // Accept identifiers only. Arbitrary notes, uploaded files and custom policies cannot cross this boundary.
    if(!input||Object.keys(input).some(k=>!['sampleId','policyId'].includes(k))||typeof input.sampleId!=='string'||typeof input.policyId!=='string') return reply({error:'Only bundled synthetic case and policy IDs are accepted. Patient notes are blocked.'},400);
    const sample=Object.hasOwn(samples,input.sampleId)?samples[input.sampleId]:null;
    const policy=policies.find(p=>p.id===input.policyId);
    if(!sample||!policy||!policy.drugIds.includes(sample.drugId)||policy.payer!==sample.payer||!policy.lines.includes(sample.line)||policy.benefit!==sample.benefit) return reply({error:'Unknown or mismatched synthetic case/policy.'},400);
    calls=calls.filter(t=>now()-t<60000);
    if(calls.length>=5) return reply({error:'Trial limit reached. Try again in a minute.'},429);
    calls.push(now());
    try {
      const evidence=await extractEvidence(sample,applyPolicyPathway(policy,sample.pathwayId,sample.drugId),env,fetcher);
      return reply({evidence,provider:env.AI_PROVIDER,synthetic:true,requiresClinicianReview:true});
    } catch {return reply({error:'AI extraction failed or returned unsupported evidence. No changes were applied. Check provider/model permissions and server configuration.'},502);}
  };
}
export const handleApi=createApi();
