// Re-downloads every fingerprinted payer document and compares its SHA-256 with the evidence registry.
// It NEVER edits shared/payer-policy-evidence.mjs or docs/policy-source-checksums.json: CHANGED means the
// payer revised the document, and a person must re-read title, scope, version and criteria before the
// record and register digest are updated by hand (docs/SOURCE-MAINTENANCE.md).
// Usage: npm run sources:check  (behind an HTTPS proxy on Node 22.21+: NODE_USE_ENV_PROXY=1 npm run sources:check)
// Exit status: 1 any CHANGED, 2 none changed but some UNREACHABLE, 0 otherwise.
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {PAYER_POLICY_EVIDENCE,evidenceDigestStatus} from '../shared/payer-policy-evidence.mjs';
export const USER_AGENT='pbj-coverage-desk-source-check';
export const MAX_BYTES=20*1024*1024;
export const TIMEOUT_MS=60000;
export const PDF_HOSTS=Object.freeze(['www.uhcprovider.com','www1.radmd.com']);
export const HMSA_DIRECTORIES=Object.freeze(['https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/','https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/']);
export const CHECK_STATUSES=Object.freeze(['UNCHANGED','CHANGED','UNREACHABLE','SKIPPED']);
// How a record can be checked: {method:'pdf'|'hmsa'|'skip',reason?}.
export function sourceCheckMethod(r){
 if(!r.sourceSha256)return {method:'skip',reason:evidenceDigestStatus(r)==='unbound-pending-reverification'?'no bound fingerprint (pending re-verification); compare by hand':'web document or directory entry; no file fingerprint'};
 let u;try{u=new URL(r.sourceUrl);}catch{return {method:'skip',reason:'source URL is not a valid URL'};}
 if(u.protocol==='https:'&&PDF_HOSTS.includes(u.hostname)&&u.pathname.toLowerCase().endsWith('.pdf'))return {method:'pdf'};
 if(u.protocol==='https:'&&u.hostname==='www.hmsa.com'&&r.documentId)return /^\d+$/.test(r.documentId)?{method:'hmsa'}:{method:'skip',reason:`documentId "${r.documentId}" is not an HMSA ti= number; check by hand`};
 return {method:'skip',reason:'no automatic download route for this source'};
}
const unescapeHtml=s=>s.replace(/&(amp|#0*38|#x0*26|quot|#0*34|apos|#0*39);/gi,(_,e)=>/^(amp|#0*38|#x0*26)$/i.test(e)?'&':/^(quot|#0*34)$/i.test(e)?'"':"'");
export const pageHrefs=html=>[...html.matchAll(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map(m=>unescapeHtml(m[1]??m[2]));
export function findHmsaDocumentLink(html,documentId,baseUrl){
 const re=new RegExp(`(?:^|[?&])ti=${documentId}(?![0-9])`);
 const href=pageHrefs(html).find(h=>re.test(h.split('#')[0]));
 if(!href)return null;
 try{return new URL(href,baseUrl).href;}catch{return null;}
}
// Error name, plus the network code (ECONNRESET, ENOTFOUND...) that fetch hides behind "fetch failed".
function failure(e){
 if(e?.name==='TimeoutError')return 'TimeoutError (no answer within 60 s)';
 const code=e?.cause?.code||e?.code;
 return (e?.name||'Error')+(code?` (${code})`:'');
}
// Bounded download: {ok:true,bytes,url} or {ok:false,reason}. Never more than MAX_BYTES held in memory.
async function download(fetcher,url){
 try{
  const res=await fetcher(url,{headers:{'User-Agent':USER_AGENT},redirect:'follow',signal:AbortSignal.timeout(TIMEOUT_MS)});
  if(!res.ok)return {ok:false,reason:`HTTP ${res.status}`};
  if(Number(res.headers?.get?.('content-length'))>MAX_BYTES){await res.body?.cancel?.().catch(()=>{});return {ok:false,reason:'larger than 20 MB'};}
  const chunks=[];let size=0;
  if(res.body)for await(const chunk of res.body){
   size+=chunk.byteLength;
   if(size>MAX_BYTES)return {ok:false,reason:'larger than 20 MB'};
   chunks.push(chunk);
  }
  return {ok:true,bytes:Buffer.concat(chunks),url:res.url||url,type:res.headers?.get?.('content-type')||''};
 }catch(e){return {ok:false,reason:failure(e)};}
}
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const isPdf=bytes=>bytes.subarray(0,5).toString('latin1')==='%PDF-';
async function compare(fetcher,r,url){
 const got=await download(fetcher,url);
 if(!got.ok)return {status:'UNREACHABLE',url,reason:got.reason};
 // An HTML error or sign-in page answered with 200 is not a revision of the policy.
 if(!isPdf(got.bytes))return {status:'UNREACHABLE',url,reason:`response was not a PDF${got.type?' ('+got.type.split(';')[0]+')':''}`};
 const actual=sha256(got.bytes);
 return actual===r.sourceSha256?{status:'UNCHANGED',url,actual}:{status:'CHANGED',url,actual,reason:'new SHA-256 '+actual};
}
/**
 * Checks each record's document; returns {results,counts,exitCode}. Never writes files.
 * results[i] = {id,payer,title,status,url,expected,actual?,reason?}; counts = {UNCHANGED,CHANGED,UNREACHABLE,SKIPPED}.
 */
export async function checkSources({fetcher=fetch,records=PAYER_POLICY_EVIDENCE}={}){
 const directories=new Map();
 const directory=url=>{if(!directories.has(url))directories.set(url,download(fetcher,url).then(d=>d.ok?{ok:true,html:d.bytes.toString('utf8'),url:d.url}:d));return directories.get(url);};
 const results=[];
 for(const r of records){
  const base={id:r.id,payer:r.payer,title:r.title,url:r.sourceUrl,expected:r.sourceSha256||null};
  const plan=sourceCheckMethod(r);
  if(plan.method==='skip'){results.push({...base,status:'SKIPPED',reason:plan.reason});continue;}
  if(plan.method==='pdf'){results.push({...base,...await compare(fetcher,r,r.sourceUrl)});continue;}
  // HMSA lists policies on two directory pages; its download links carry ti=<documentId> plus a rotating token.
  const order=[...HMSA_DIRECTORIES].sort((a,b)=>(b===r.sourceUrl)-(a===r.sourceUrl));
  let link=null;const problems=[];
  for(const url of order){
   const page=await directory(url);
   if(!page.ok){problems.push(`HMSA directory ${url}: ${page.reason}`);continue;}
   if((link=findHmsaDocumentLink(page.html,r.documentId,page.url)))break;
  }
  if(link)results.push({...base,...await compare(fetcher,r,link)});
  else results.push({...base,status:'UNREACHABLE',reason:problems.length===HMSA_DIRECTORIES.length?problems.join('; '):`no link with ti=${r.documentId} on the HMSA directory pages (withdrawn or replaced?)${problems.length?'; '+problems.join('; '):''}`});
 }
 const counts=Object.fromEntries(CHECK_STATUSES.map(s=>[s,results.filter(x=>x.status===s).length]));
 return {results,counts,exitCode:counts.CHANGED?1:counts.UNREACHABLE?2:0};
}
export function checkSourcesText({results,counts}){
 return ['SOURCE DOCUMENT FINGERPRINT CHECK — compares fresh downloads with the registered SHA-256. The registry is never modified.',
  'Synthetic-data trial: an unchanged document says nothing about coverage, approval, eligibility or plan adoption.','',
  ...results.map(x=>`${x.status.padEnd(12)}${x.id} — ${x.payer}: ${x.title}${x.reason?' · '+x.reason:''}${x.status==='CHANGED'?' · registered '+x.expected:''}`),'',
  `Checked ${results.length}: ${counts.UNCHANGED} unchanged, ${counts.CHANGED} changed, ${counts.UNREACHABLE} unreachable, ${counts.SKIPPED} skipped.`,
  ...(counts.CHANGED?['CHANGED = the payer revised the document. Re-read its title, scope, version and criteria, then update the record and the register digest by hand. Never accept a new digest automatically.']:[]),
  ...(counts.UNREACHABLE?['UNREACHABLE = no usable download this time. Retry later or open the source page in a browser; a policy missing from its directory may have been withdrawn or replaced.']:[]),
  'Guide: docs/SOURCE-MAINTENANCE.md'].join('\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const result=await checkSources();
 console.log(checkSourcesText(result));
 if(result.counts.UNREACHABLE&&(process.env.HTTPS_PROXY||process.env.https_proxy)&&!process.env.NODE_USE_ENV_PROXY)
  console.log('Note: an HTTPS proxy is configured, but Node fetch only uses it when NODE_USE_ENV_PROXY=1 is set (Node 22.21 or later).');
 process.exitCode=result.exitCode;
}
