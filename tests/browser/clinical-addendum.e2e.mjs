// Run against a local-only server: node server/local.mjs --port 3088.
// Install Playwright separately or set PBJ_PLAYWRIGHT_MODULE to its module path. PBJ_FAKE_NOW (ISO) fixes the page's
// clock so CI can prove the flow does not depend on today's date; every date below is read from the page or chosen.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {AUTH_TEMPLATE_CATALOG} from '../../shared/authorization-template-catalog.mjs';
const expectedTemplates=AUTH_TEMPLATE_CATALOG.length;
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
 if(process.env.PBJ_FAKE_NOW)await page.clock.setFixedTime(new Date(process.env.PBJ_FAKE_NOW));
 page.on('request',r=>{if(new URL(r.url()).origin!=='http://localhost:3088')external.push(r.url());if(r.method()!=='GET'&&new URL(r.url()).pathname!=='/api/formulary/search')mutations.push(r.url());});
 await page.goto('http://localhost:3088');
 await page.locator('#staff-clinical-template').waitFor();
 await page.evaluate(()=>{window.__printCalls=0;window.print=()=>window.__printCalls++;});
 const choices=await page.locator('#staff-clinical-template option').evaluateAll(options=>options.map(o=>({id:o.value,name:o.textContent})).filter(o=>o.id));
 assert.equal(choices.length,expectedTemplates);
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
 assert.equal(await page.evaluate(()=>window.__printCalls),expectedTemplates);
 const policyDay=await page.evaluate(()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Pacific/Honolulu',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()));
 // The plan year is chosen, never taken from today's default: HMSA QUEST has an indexed 2026 pharmacy file only.
 await page.selectOption('#staff-year','2026');
 await page.selectOption('#staff-payer','HMSA');
 await page.selectOption('#staff-plan-select','hmsa-quest');
 await page.selectOption('#staff-service-select','prolia');
 assert.match(await page.locator('#staff-clinical-addendum').textContent(),/Prolia/);
 assert.equal(await page.locator('#staff-clinical-template').inputValue(),'');
 // A newly chosen service defaults the planned date to the page's Hawaiʻi policy day, but a date staff never entered
 // is printed as policy context only, never as the planned date of service.
 assert.equal(await page.locator('#staff-service-date').inputValue(),policyDay);
 await page.click('[data-action="staff-print-addendum"]');
 assert.ok((await page.locator('#print-region').textContent()).includes('Planned date of service: [DATE NOT SELECTED — policy context used '+policyDay+']'));
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
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
 await page.waitForFunction(()=>/^Blank clinical addendum downloaded\./.test(document.querySelector('#toast').textContent));
 await page.click('[data-action="staff-print-addendum"]');
 // The printed addendum appends the matching payer documentation prompts, each followed by an approved-system
 // placeholder (never a handwriting line), and prints the date staff entered.
 const printed=await page.locator('#print-region').textContent();
 assert.ok(printed.includes('Planned date of service: 2026-11-07'));
 assert.ok(printed.includes('Payer-policy documentation prompts (public reference; plan adoption not verified)'));
 assert.ok(printed.includes('Request type: Initial'));
 assert.match(printed,/HMSA Commercial\/QUEST Prolia and biosimilars — initial\nSource: HMSA Prolia and Biosimilars/);
 assert.match(printed,/- Indication-specific coverage branch\n\s+\[COMPLETE IN APPROVED CLINICAL SYSTEM\]\n/);
 assert.doesNotMatch(printed.slice(printed.indexOf('Payer-policy documentation prompts')),/^\s+_{20,}$/m);
 assert.ok(printed.includes('SYNTHETIC ONLY — NOT FOR SUBMISSION'));assert.ok(printed.trimEnd().endsWith('Clinician review/signature: ______________________'));
 // Review states, when any reference has one, show as amber badges on the collapsed record summaries.
 for(const badge of await page.locator('#staff-policy-evidence .review-badge[data-review-state]').all())
  assert.equal(await badge.evaluate(el=>el.parentElement.tagName),'SUMMARY');
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
 // A date staff entered survives a service change; it is never silently replaced by the default.
 assert.equal(await page.locator('#staff-service-date').inputValue(),'2026-11-07');
 assert.equal(await page.locator('#staff-service-date').count(),1);
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
 // The public lookup's own 503 is shown inline only; only Access-gate replies are toasted.
 await page.waitForFunction(()=>/intentionally offline/.test(document.querySelector('#staff-requirements')?.textContent||''));
 assert.doesNotMatch(await page.locator('#toast').textContent(),/intentionally offline/);
 // A two-page print never carries the fixed "Skip to workspace" link over a payer-policy prompt.
 await page.selectOption('#staff-payer','UnitedHealthcare');
 await page.selectOption('#staff-plan-select','uhc-ma');
 await page.selectOption('#staff-service-select','evenity');
 await page.click('[data-action="staff-print-addendum"]');
 await page.emulateMedia({media:'print'});
 assert.equal(await page.locator('.skip-link').evaluate(el=>getComputedStyle(el).display),'none');
 const printedText=await page.evaluate(()=>document.body.innerText);
 assert.ok(printedText.includes('UHC Medicare Advantage Part B step therapy — non-preferred osteoporosis agent'));
 assert.ok(!printedText.includes('Skip to workspace'));
 const pdf=(await page.pdf({format:'Letter'})).toString('latin1');
 assert.ok((pdf.match(/\/Type\s*\/Page\b(?!s)/g)||[]).length>=2,'the UHC MA Evenity addendum prints on two or more pages');
 await page.emulateMedia({media:'screen'});
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 await page.click('#lock');
 assert.equal(await page.locator('#print-region').textContent(),'');
 assert.equal(await page.locator('#staff-clinical-template').count(),0);
 assert.equal(publicLookups.length,1);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(mutations,[]);
 console.log('PASS: '+expectedTemplates+' browser print flows; download and toast; payer documentation prompts with approved-system placeholders; date default on selection printed as policy context; entered date kept across a service change; print CSS with no skip link on a two-page print; inline-only route errors; mobile; lock cleanup; scoped payer evidence and verification worksheet; no external requests or data writes.');
}finally{await browser.close();}
