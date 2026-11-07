// Public published formulary records only: no patient data or member eligibility.
export const QUEST_FORMULARY = Object.freeze({
  id:'hmsa-quest-2026-11',
  label:'HMSA QUEST · November 2026',
  payer:'HMSA',
  line:'QUEST / Medicaid',
  benefit:'Pharmacy',
  effective:'2026-11-01',
  // Review cadence is internal; the payer has not published a hard expiration date.
  reviewAfterDays:90,
  sourcePage:'https://www.hmsa.com/prc/pharmacy/hmsa-quest-drug-formulary/',
  sourceUrl:'https://assets.contentstack.io/v3/assets/blt731834369e6b995a/blt1cfd921ba2fdcc8d/6ae4050ff59c3f1d3bce71fc/hmsa-quest-formulary-2026.json',
  planIdType:'HIOS-PLAN-ID'
});
const MAX_SOURCE_BYTES=14*1024*1024;
const MAX_MATCHES=40;
const REFRESH_MS=6*60*60*1000;
const QUERY_RE=/^[a-zA-Z0-9][a-zA-Z0-9 .,+/()-]{1,69}$/;

export function validateSearchInput(input) {
  if(!input || typeof input!=='object' || Array.isArray(input) ||
      Object.keys(input).some(key=>!['source','drug'].includes(key)) ||
      input.source!==QUEST_FORMULARY.id ||
      typeof input.drug!=='string' || input.drug.trim().length<2 ||
      !QUERY_RE.test(input.drug.trim())) {
    throw new Error('Choose the HMSA QUEST public list and search by drug name or RxNorm number (2–70 characters). Do not enter patient information.');
  }
  return input.drug.trim().toLowerCase();
}
async function readPublishedJson(response) {
  if(!response.ok || !response.body)throw new Error('Published source not available.');
  const sizeHeader=Number(response.headers.get('content-length')||0);
  if(sizeHeader>MAX_SOURCE_BYTES)throw new Error('Published source too large.');
  const reader=response.body.getReader();
  const chunks=[];let bytes=0;
  try {
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      bytes+=value.byteLength;
      if(bytes>MAX_SOURCE_BYTES){await reader.cancel();throw new Error('Published source too large.');}
      chunks.push(value);
    }
  } finally {reader.releaseLock();}
  const combined=new Uint8Array(bytes);
  let offset=0;for(const chunk of chunks){combined.set(chunk,offset);offset+=chunk.byteLength;}
  return JSON.parse(new TextDecoder().decode(combined));
}
export function normalizeQuestRows(payload,{minimum=100}={}) {
  if(!Array.isArray(payload) || payload.length<minimum || payload.length>150000)
    throw new Error('Published source did not match the expected record count.');
  const rows=[];
  for(const item of payload){
    if(!item || typeof item!=='object' || typeof item.drug_name!=='string' ||
       !item.drug_name.trim() || item.drug_name.length>450 ||
       typeof item.rxnorm_id!=='string' || !/^[0-9]{1,15}$/.test(item.rxnorm_id) ||
       !Array.isArray(item.plans))throw new Error('Published formulary schema changed.');
    for(const plan of item.plans){
      if(!plan || plan.plan_id_type!==QUEST_FORMULARY.planIdType ||
         typeof plan.plan_id!=='string' || !/^[A-Z0-9-]{3,60}$/.test(plan.plan_id) ||
         typeof plan.drug_tier!=='string' || !/^[A-Z0-9 _-]{1,50}$/i.test(plan.drug_tier) ||
         !Array.isArray(plan.years))throw new Error('Published plan schema changed.');
      if(!plan.years.includes(2026))continue;
      const flag=key=>typeof plan[key]==='boolean'?plan[key]:null;
      rows.push({
        rxnorm:item.rxnorm_id,
        name:item.drug_name.trim(),
        planId:plan.plan_id,
        planIdType:plan.plan_id_type,
        tier:plan.drug_tier.trim(),
        priorAuthorization:flag('prior_authorization'),
        stepTherapy:flag('step_therapy'),
        quantityLimit:flag('quantity_limit')
      });
    }
  }
  if(rows.length<minimum)throw new Error('Published source lacks expected 2026 plan entries.');
  return rows;
}
export function createPublishedFormularyService({fetcher=fetch,now=()=>Date.now(),minimum=100}={}) {
  let cached=null;let expires=0;let pending=null;
  async function load() {
    if(cached && now()<expires)return cached;
    if(pending)return pending;
    pending=(async()=>{
      // This is a fixed, allowlisted public JSON URL. The search term is NEVER sent to the payer.
      const response=await fetcher(QUEST_FORMULARY.sourceUrl,{
        headers:{accept:'application/json'},redirect:'error'
      });
      const normalized=normalizeQuestRows(await readPublishedJson(response),{minimum});
      const latest={rows:normalized,checkedAt:new Date(now()).toISOString()};
      cached=latest;expires=now()+REFRESH_MS;
      return latest;
    })().finally(()=>{pending=null;});
    return pending;
  }
  return async function search(input) {
    const term=validateSearchInput(input);
    const data=await load();
    const matches=data.rows.filter(row=>
      row.name.toLowerCase().includes(term) || row.rxnorm===term
    );
    return {
      source:{...QUEST_FORMULARY},
      sourceType:'public-plan-formulary',
      checkedAt:data.checkedAt,
      reviewOverdue:(now()-Date.parse(QUEST_FORMULARY.effective+'T00:00:00Z'))/86400000>QUEST_FORMULARY.reviewAfterDays,
      searched:input.drug.trim(),
      totalMatches:matches.length,
      truncated:matches.length>MAX_MATCHES,
      matches:matches.slice(0,MAX_MATCHES),
      limitations:'Published pharmacy list only. Not member-specific eligibility, medical-benefit drug coverage, claim payment or authorization approval. No match does not establish exclusion; check the exact plan, strength, formulation and current source.'
    };
  };
}
