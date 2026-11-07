import {PUBLISHED_FORMULARIES,QUEST_FORMULARY,getPublishedFormulary} from '../shared/live-formularies.mjs';

export {PUBLISHED_FORMULARIES,QUEST_FORMULARY};

const MAX_SOURCE_BYTES=20*1024*1024;

const MAX_MATCHES=40;

const REFRESH_MS=6*60*60*1000;

const QUERY_RE=/^[a-zA-Z0-9][a-zA-Z0-9 .,+/()-]{1,69}$/;

export function validateSearchInput(input) {
  if(!input || typeof input!=='object' || Array.isArray(input) ||
      Object.keys(input).some(key=>!['source','drug'].includes(key)) ||
      !getPublishedFormulary(input.source) ||
      typeof input.drug!=='string' || input.drug.trim().length<2 ||
      !QUERY_RE.test(input.drug.trim())) {
    throw new Error('Choose a verified public formulary and search by drug name or RxNorm number (2–70 characters). Do not enter patient information.');
  }
  return input.drug.trim().toLowerCase();
}

async function readPublishedJson(response) {
  if(!response.ok || !response.body) throw new Error('Published source unavailable.');
  const bytesExpected=Number(response.headers.get('content-length')||0);
  if(bytesExpected>MAX_SOURCE_BYTES) throw new Error('Published source too large.');
  const reader=response.body.getReader(),chunks=[];
  let count=0;
  try {
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      count+=value.byteLength;
      if(count>MAX_SOURCE_BYTES){await reader.cancel();throw new Error('Published source too large.');}
      chunks.push(value);
    }
  } finally {reader.releaseLock();}
  const combined=new Uint8Array(count);
  let offset=0;
  for(const chunk of chunks){combined.set(chunk,offset);offset+=chunk.byteLength;}
  return JSON.parse(new TextDecoder().decode(combined));
}

export function normalizeQuestRows(payload,{minimum=100,source=QUEST_FORMULARY}={}) {
  if(!Array.isArray(payload)||payload.length<minimum||payload.length>150000)
    throw new Error('Published source did not match expected record count.');
  const rows=[];
  for(const item of payload){
    if(!item || typeof item!=='object' ||typeof item.drug_name!=='string' ||
       !item.drug_name.trim() || item.drug_name.length>450 ||
       typeof item.rxnorm_id!=='string' || !/^[0-9]{1,15}$/.test(item.rxnorm_id) ||
       !Array.isArray(item.plans))throw new Error('Published formulary schema changed.');
    for(const plan of item.plans){
      if(!plan||!['PLAN-ID','HIOS-PLAN-ID','QUEST Medicaid-CHIP Plan Description'].includes(plan.plan_id_type)||typeof plan.plan_id!=='string'||
         !(Array.isArray(plan.years)||typeof plan.years==='string')||typeof plan.drug_tier!=='string')
        throw new Error('Published plan schema changed.');
      // All records must match the explicitly verified source's plan and year.
      const years=Array.isArray(plan.years)?plan.years.map(String):[plan.years];
      if(plan.plan_id_type!==source.planIdType||plan.plan_id!==source.planId||!years.includes(String(source.year)))continue;
      if(!/^[a-zA-Z0-9 _()/+-]{1,70}$/.test(plan.drug_tier))
        throw new Error('Published plan tier format changed.');
      const flag=(key,alias)=>typeof plan[key]==='boolean'?plan[key]:(typeof plan[alias]==='boolean'?plan[alias]:null);
      rows.push({
        rxnorm:item.rxnorm_id,name:item.drug_name.trim(),
        planId:plan.plan_id,planIdType:plan.plan_id_type,
        tier:plan.drug_tier.trim(),priorAuthorization:flag('prior_authorization','PA'),
        stepTherapy:flag('step_therapy','ST'),quantityLimit:flag('quantity_limit','QL')
      });
    }
  }
  if(rows.length<minimum)throw new Error('Published source lacks expected plan-year entries.');
  return rows;
}

export function createPublishedFormularyService({fetcher=fetch,now=()=>Date.now(),minimum=100}={}){
  const caches=new Map(),pending=new Map(),urlCaches=new Map(),urlPending=new Map();
  async function loadRaw(source){
    const url=source.sourceUrl;
    const shared=urlCaches.get(url);
    if(shared&&now()<shared.expires)return shared.payload;
    if(urlPending.has(url))return urlPending.get(url);
    const work=(async()=>{
      // Public allowlisted source only. Multiple exact Kaiser HIOS plans share
      // a JSON document but MUST still be filtered to their own IDs and year.
      const response=await fetcher(url,{headers:{accept:'application/json'},redirect:'error'});
      return readPublishedJson(response);
    })().finally(()=>urlPending.delete(url));
    urlPending.set(url,work);
    return work;
  }
  async function load(source){
    const found=caches.get(source.id);
    if(found&&now()<found.expires)return found;
    if(pending.has(source.id))return pending.get(source.id);
    const work=(async()=>{
      const payload=await loadRaw(source);
      const rows=normalizeQuestRows(payload,{minimum,source});
      const expiry=now()+REFRESH_MS;
      // Cache raw document only after a full schema AND exact plan/year
      // validation succeeds; a malformed source must not be sticky-cached.
      urlCaches.set(source.sourceUrl,{payload,expires:expiry});
      const fresh={rows,checkedAt:new Date(now()).toISOString(),expires:expiry};
      caches.set(source.id,fresh);
      return fresh;
    })().finally(()=>pending.delete(source.id));
    pending.set(source.id,work);
    return work;
  }
  return async function search(input){
    const term=validateSearchInput(input);
    const source=getPublishedFormulary(input.source);
    const cached=await load(source);
    const matches=cached.rows.filter(row=>row.name.toLowerCase().includes(term)||row.rxnorm===term);
    return {
      source:{...source},sourceType:'public-plan-formulary',
      checkedAt:cached.checkedAt,
      reviewOverdue:(now()-Date.parse((source.effective||source.reviewed)+'T00:00:00Z'))/86400000>source.reviewAfterDays,
      searched:input.drug.trim(),totalMatches:matches.length,
      truncated:matches.length>MAX_MATCHES,
      matches:matches.slice(0,MAX_MATCHES),
      limitations:'Not member-specific eligibility. Published pharmacy list for one exact plan/year only; it cannot establish medical-benefit coverage, prior-authorization approval or payment. No match does not establish exclusion; check the plan, strength, formulation and most recent source.'
    };
  };
}
