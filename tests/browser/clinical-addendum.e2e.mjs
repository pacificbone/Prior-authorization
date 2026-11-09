// Run against a local-only server: node server/local.mjs --port 3088.
// Install Playwright separately or set PBJ_PLAYWRIGHT_MODULE to its module path.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const playwright=await import(process.env.PBJ_PLAYWRIGHT_MODULE||'playwright');
const {chromium}=playwright.chromium?playwright:playwright.default;
if(!chromium)throw new Error('Playwright module did not expose chromium; set PBJ_PLAYWRIGHT_MODULE to the installed package entry');
const browser=await chromium.launch({headless:true,...(process.env.PBJ_CHROME_PATH?{executablePath:process.env.PBJ_CHROME_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[],external=[],mutations=[],publicLookups=[];
 await page.route('**/api/formulary/search',async route=>{
  const payload=route.request().postDataJSON();
  assert.deepEqual(Object.keys(payload).sort(),['drug','source']);
  assert.equal(typeof payload.drug,'string');assert.equal(typeof payload.source,'string');
  publicLookups.push(payload);
  await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Synthetic browser test: public lookup intentionally offline'})});
 });
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(new URL(r.url()).origin!=='http://localhost:3088')external.push(r.url());if(r.method()!=='GET'&&new URL(r.url()).pathname!=='/api/formulary/search')mutations.push(r.url());});
 await page.goto('http://localhost:3088');
 await page.locator('#staff-clinical-template').waitFor();
 await page.evaluate(()=>{window.__printCalls=0;window.print=()=>window.__printCalls++;});
 const choices=await page.locator('#staff-clinical-template option').evaluateAll(options=>options.map(o=>({id:o.value,name:o.textContent})).filter(o=>o.id));
 assert.equal(choices.length,67);
 for(const choice of choices){
  await page.selectOption('#staff-clinical-template',choice.id);
  await page.click('[data-action="staff-print-addendum"]');
  const note=await page.locator('#print-region').textContent();
  assert.ok(note.includes('Service: '+choice.name));
  assert.ok(note.includes('SYNTHETIC ONLY — NOT FOR SUBMISSION'));
  assert.ok(note.includes('[NOT DOCUMENTED]'));
  assert.ok(note.includes('DO NOT ORDER'));
  await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
  assert.equal(await page.locator('#print-region').textContent(),'');
 }
 assert.equal(await page.evaluate(()=>window.__printCalls),67);
 await page.selectOption('#staff-payer','HMSA');
 await page.selectOption('#staff-plan-select','hmsa-quest');
 await page.selectOption('#staff-service-select','prolia');
 assert.match(await page.locator('#staff-clinical-addendum').textContent(),/Prolia/);
 assert.equal(await page.locator('#staff-clinical-template').inputValue(),'');
 await page.fill('#staff-service-date','2026-11-07');
 await page.locator('#staff-service-date').dispatchEvent('change');
 assert.match(await page.locator('#staff-clinical-addendum').textContent(),/not uniquely verified/);
 assert.match(await page.locator('#staff-policy-evidence').textContent(),/HMSA Prolia and Biosimilars/);
 assert.match(await page.locator('#staff-policy-evidence').textContent(),/NOT VERIFIED/);
 await page.click('[data-action="staff-print-verification"]');
 const verification=await page.locator('#print-region').textContent();
 assert.match(verification,/PAYER VERIFICATION WORKSHEET/);
 assert.match(verification,/Jubbonti/);
 assert.match(verification,/Ordering: BLOCKED/);
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 const downloadPromise=page.waitForEvent('download');
 await page.click('[data-action="staff-download-addendum"]');
 const download=await downloadPromise;
 assert.match(download.suggestedFilename(),/synthetic-clinical-addendum/);
 await page.click('[data-action="staff-print-addendum"]');
 await page.emulateMedia({media:'print'});
 assert.equal(await page.locator('#print-region').isVisible(),true);
 assert.equal(await page.locator('.app-shell').isVisible(),false);
 if(process.env.PBJ_QA_DIR){
  await mkdir(process.env.PBJ_QA_DIR,{recursive:true});
  await page.pdf({path:process.env.PBJ_QA_DIR+'/prolia-blank-addendum.pdf',format:'Letter'});
 }
 await page.emulateMedia({media:'screen'});
 if(process.env.PBJ_QA_DIR)await page.locator('#staff-clinical-addendum').screenshot({path:process.env.PBJ_QA_DIR+'/clinical-addendum-panel.png'});
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.locator('#staff-clinical-template').isVisible(),true);
 const sourceDetails=page.locator('#staff-policy-evidence details').first();
 await sourceDetails.evaluate(el=>{el.open=true;});
 assert.equal(await page.locator('#staff-policy-evidence').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
 await page.selectOption('#staff-clinical-template','gel-synvisc-one');
 assert.match(await page.locator('#staff-clinical-addendum').textContent(),/Synvisc-One/);
 await page.click('[data-action="staff-print-verification"]');
 await page.selectOption('#staff-service-select','total-knee');
 assert.equal(await page.locator('#print-region').textContent(),'');
 assert.equal(await page.locator('#staff-service-date').inputValue(),'');
 await page.fill('#staff-service-date','2026-11-07');
 await page.locator('#staff-service-date').dispatchEvent('change');
 assert.match(await page.locator('#staff-policy-evidence').textContent(),/Guideline 1763/);
 assert.doesNotMatch(await page.locator('#staff-policy-evidence').textContent(),/Hyaluronate Products/);
 assert.equal(await page.locator('#staff-benefit').isDisabled(),true);
 await page.selectOption('#staff-service-select','prolia');
 await page.selectOption('#staff-benefit','Pharmacy');
 await page.fill('#staff-service-date','2026-11-07');
 await page.locator('#staff-service-date').dispatchEvent('change');
 assert.doesNotMatch(await page.locator('#staff-policy-evidence').textContent(),/Guideline 1763/);
 await page.click('#lock');
 assert.equal(await page.locator('#print-region').textContent(),'');
 assert.equal(await page.locator('#staff-clinical-template').count(),0);
 assert.equal(publicLookups.length,1);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(mutations,[]);
 console.log('PASS: 67 browser print flows; download; date/selection reset; print CSS; mobile; lock cleanup; scoped payer evidence and verification worksheet; no external requests or data writes.');
}finally{await browser.close();}
