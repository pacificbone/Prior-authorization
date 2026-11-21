import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {checkSources,checkSourcesText,sourceCheckMethod,findHmsaDocumentLink,USER_AGENT,HMSA_DIRECTORIES,MAX_BYTES} from '../scripts/check-sources.mjs';
import {PAYER_POLICY_EVIDENCE} from '../shared/payer-policy-evidence.mjs';
// No network: every download goes through a fake fetcher serving fixed bytes.
const pdf=text=>Buffer.from('%PDF-1.7\n'+text);
const sha=b=>createHash('sha256').update(b).digest('hex');
const knee=pdf('fictional knee policy'),gel=pdf('fictional gel policy');
const uhc={id:'uhc-test',payer:'UnitedHealthcare',title:'Fictional UHC policy',sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/test.pdf',sourceSha256:sha(knee)};
const radmd={id:'radmd-test',payer:'HMSA',title:'Fictional Evolent matrix',sourceUrl:'https://www1.radmd.com/sites/default/files/test%20matrix.PDF',sourceSha256:sha(knee)};
const hmsa={id:'hmsa-test',payer:'HMSA',title:'Fictional HMSA policy',sourceUrl:HMSA_DIRECTORIES[1],documentId:'203599459',sourceSha256:sha(gel)};
const web={id:'web-test',payer:'Traditional Medicare',title:'Fictional LCD',sourceUrl:'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=1',documentId:'L1',sourceSha256:null,directoryOnly:true};
const docLink=ti=>`https://documents.hmsa.com/directdownload.php?ti=${ti}&tok=abc&token=$2y$10$xyz&in=1`;
const pageA=`<a href="${docLink('2035994590').replaceAll('&','&amp;')}">Decoy with a longer id</a><a href='/relative.pdf'>x</a>`;
const pageMZ=`<td><a class="doc" href="${docLink('203599459').replaceAll('&','&amp;')}">Prolia (Commercial and QUEST)</a></td>`;
function fakeFetch(routes){
 const calls=[];
 const fetcher=async(url,init)=>{
  calls.push({url,init});
  const r=routes[url];
  if(r instanceof Error)throw r;
  if(typeof r==='function')return r();
  if(!r)return new Response('not found',{status:404});
  return new Response(r,{status:200,headers:{'content-type':Buffer.isBuffer(r)?'application/pdf':'text/html'}});
 };
 return {fetcher,calls};
}
test('an unchanged PDF is reported UNCHANGED with the registered digest, and requests are bounded and identified',async()=>{
 const {fetcher,calls}=fakeFetch({[uhc.sourceUrl]:knee,[radmd.sourceUrl]:knee});
 const out=await checkSources({fetcher,records:[uhc,radmd]});
 assert.deepEqual(out.results.map(x=>[x.id,x.status,x.actual]),[['uhc-test','UNCHANGED',uhc.sourceSha256],['radmd-test','UNCHANGED',uhc.sourceSha256]]);
 assert.deepEqual(out.counts,{UNCHANGED:2,CHANGED:0,UNREACHABLE:0,SKIPPED:0});assert.equal(out.exitCode,0);
 for(const {init} of calls){
  assert.equal(init.headers['User-Agent'],USER_AGENT);assert.equal(USER_AGENT,'pbj-coverage-desk-source-check');
  assert.equal(init.redirect,'follow');assert.ok(init.signal instanceof AbortSignal);
 }
});
test('a changed PDF is reported CHANGED with the new digest and exit code 1; the registry files are untouched',async()=>{
 const files=['../docs/policy-source-checksums.json','../shared/payer-policy-evidence.mjs'].map(f=>new URL(f,import.meta.url));
 const before=files.map(f=>readFileSync(f,'utf8'));
 const revised=pdf('fictional knee policy, revised');
 const {fetcher}=fakeFetch({[uhc.sourceUrl]:revised,[radmd.sourceUrl]:()=>new Response('gone',{status:410})});
 const out=await checkSources({fetcher,records:[uhc,radmd]});
 assert.equal(out.results[0].status,'CHANGED');assert.equal(out.results[0].actual,sha(revised));assert.equal(out.results[0].expected,uhc.sourceSha256);
 assert.equal(out.exitCode,1,'CHANGED outranks UNREACHABLE');
 const text=checkSourcesText(out);
 assert.match(text,new RegExp(`CHANGED {5}uhc-test — UnitedHealthcare: Fictional UHC policy · new SHA-256 ${sha(revised)} · registered ${uhc.sourceSha256}`));
 assert.match(text,/Re-read its title, scope, version and criteria.*Never accept a new digest automatically/);
 assert.deepEqual(files.map(f=>readFileSync(f,'utf8')),before);
});
test('HTTP errors, network failures, oversize files and non-PDF answers are UNREACHABLE with exit code 2',async()=>{
 const urls=n=>`https://www.uhcprovider.com/content/dam/provider/docs/public/policies/u${n}.pdf`;
 const recs=[1,2,3,4,5].map(n=>({...uhc,id:'u'+n,sourceUrl:urls(n)}));
 const reset=Object.assign(new TypeError('fetch failed'),{cause:{code:'ECONNRESET'}});
 const timeout=Object.assign(new Error('timed out'),{name:'TimeoutError'});
 const {fetcher}=fakeFetch({[urls(2)]:reset,[urls(3)]:timeout,
  [urls(4)]:()=>new Response(knee,{status:200,headers:{'content-length':String(MAX_BYTES+1)}}),
  [urls(5)]:()=>new Response('<html>Please sign in</html>',{status:200,headers:{'content-type':'text/html; charset=utf-8'}})});
 const out=await checkSources({fetcher,records:recs});
 assert.deepEqual(out.results.map(x=>[x.status,x.reason]),[['UNREACHABLE','HTTP 404'],['UNREACHABLE','TypeError (ECONNRESET)'],['UNREACHABLE','TimeoutError (no answer within 60 s)'],['UNREACHABLE','larger than 20 MB'],['UNREACHABLE','response was not a PDF (text/html)']]);
 assert.equal(out.exitCode,2);
 assert.match(checkSourcesText(out),/Checked 5: 0 unchanged, 0 changed, 5 unreachable, 0 skipped\./);
});
test('a streamed body over 20 MB is cut off without a content-length header',async()=>{
 const chunk=new Uint8Array(1024*1024);
 const stream=()=>new ReadableStream({start(c){for(let i=0;i<21;i++)c.enqueue(chunk);c.close();}});
 const {fetcher}=fakeFetch({[uhc.sourceUrl]:()=>new Response(stream(),{status:200})});
 const out=await checkSources({fetcher,records:[uhc]});
 assert.equal(out.results[0].status,'UNREACHABLE');assert.equal(out.results[0].reason,'larger than 20 MB');
});
test('HMSA documents are found on the directory pages by ti=<documentId>, with &amp; unescaped, each page fetched once',async()=>{
 const second={...hmsa,id:'hmsa-test-2',sourceUrl:HMSA_DIRECTORIES[0]};
 const {fetcher,calls}=fakeFetch({[HMSA_DIRECTORIES[0]]:pageA,[HMSA_DIRECTORIES[1]]:pageMZ,[docLink('203599459')]:gel});
 const out=await checkSources({fetcher,records:[hmsa,second]});
 assert.deepEqual(out.results.map(x=>[x.id,x.status,x.url]),[['hmsa-test','UNCHANGED',docLink('203599459')],['hmsa-test-2','UNCHANGED',docLink('203599459')]]);
 assert.deepEqual(calls.map(c=>c.url).filter(u=>HMSA_DIRECTORIES.includes(u)).toSorted(),[...HMSA_DIRECTORIES].toSorted());
 assert.equal(calls.some(c=>c.url.includes('2035994590')),false,'a longer ti number must not match');
 // A policy no longer listed, or directories that cannot be read, are unreachable rather than changed.
 const gone=await checkSources({fetcher:fakeFetch({[HMSA_DIRECTORIES[0]]:pageA,[HMSA_DIRECTORIES[1]]:'<p>moved</p>'}).fetcher,records:[hmsa]});
 assert.equal(gone.results[0].status,'UNREACHABLE');assert.match(gone.results[0].reason,/no link with ti=203599459 on the HMSA directory pages/);
 const down=await checkSources({fetcher:fakeFetch({}).fetcher,records:[hmsa]});
 assert.match(down.results[0].reason,/HMSA directory .*medical-specialty-drug-policies-m-z\/: HTTP 404; HMSA directory .*: HTTP 404/);
 assert.equal(down.exitCode,2);
});
test('web documents and records without an HMSA ti= number are SKIPPED without any download',async()=>{
 const filename={...hmsa,id:'hmsa-file',documentId:'hmsa-prolia-ma.pdf'};
 const pending={...uhc,id:'pending',sourceSha256:null,digestStatus:'unbound-pending-reverification',registerSha256:'a'.repeat(64)};
 const {fetcher,calls}=fakeFetch({});
 const out=await checkSources({fetcher,records:[web,filename,pending]});
 assert.deepEqual(out.results.map(x=>[x.id,x.status]),[['web-test','SKIPPED'],['hmsa-file','SKIPPED'],['pending','SKIPPED']]);
 assert.match(out.results[0].reason,/web document/);assert.match(out.results[1].reason,/not an HMSA ti= number/);assert.match(out.results[2].reason,/pending re-verification/);
 assert.equal(calls.length,0);assert.equal(out.exitCode,0);
});
test('every real fingerprinted record has an automatic route or an explicit skip reason, and web documents are skipped',()=>{
 for(const r of PAYER_POLICY_EVIDENCE){
  const m=sourceCheckMethod(r);
  if(r.sourceSha256===null)assert.equal(m.method,'skip',r.id);
  const host=new URL(r.sourceUrl).hostname;
  if(r.sourceSha256&&['www.uhcprovider.com','www1.radmd.com'].includes(host))assert.equal(m.method,'pdf',r.id);
  if(r.sourceSha256&&host==='www.hmsa.com'&&/^\d+$/.test(r.documentId||''))assert.equal(m.method,'hmsa',r.id);
  if(m.method==='skip')assert.ok(m.reason,r.id);
 }
 assert.equal(findHmsaDocumentLink('<a href="?x=1&amp;ti=42#top">',  '42','https://www.hmsa.com/prc/'),'https://www.hmsa.com/prc/?x=1&ti=42#top');
 assert.equal(findHmsaDocumentLink('<a href="?ti=420">','42','https://www.hmsa.com/prc/'),null);
});
