// Staff workup flow against a local-only server started WITHOUT --legacy-tools: node server/local.mjs --port 3088.
// Install Playwright separately or set PBJ_PLAYWRIGHT_MODULE to its module path. Dates are read from the page's
// Hawaiʻi policy day, never hard-coded, so the suite passes on any calendar day. PBJ_FAKE_NOW (ISO) fixes the
// page's clock so CI can prove that.
import assert from 'node:assert/strict';
import {STAFF_YEARS} from '../../shared/staff-workflow.mjs';
import {sourcesDueReport} from '../../shared/sources-due.mjs';
const origin=process.env.PBJ_BASE_URL||'http://localhost:3088';
const playwright=await import(process.env.PBJ_PLAYWRIGHT_MODULE||'playwright');
const {chromium}=playwright.chromium?playwright:playwright.default;
if(!chromium)throw new Error('Playwright module did not expose chromium; set PBJ_PLAYWRIGHT_MODULE to the installed package entry');
const browser=await chromium.launch({headless:true,...(process.env.PBJ_CHROME_PATH?{executablePath:process.env.PBJ_CHROME_PATH}:{})});
const NO_MATCH='No match - try a brand, procedure name or code (for example TKA, Synvisc, 27447).';
const CAVEAT="Published policy statements - this member's plan adoption, eligibility and authorization are not verified.";
const PRODUCT_NEEDED='Choose the gel product to see this insurer’s published references, product preferences and prior-authorization statements for that brand.';
const ACCESS_ERROR='A verified Cloudflare Access staff session is required.';
const GENERIC='Something went wrong. Reload the page; nothing was sent anywhere.';
const toastIs=(page,re)=>page.waitForFunction(src=>new RegExp(src).test(document.querySelector('#toast')?.textContent||''),re.source,{timeout:5000});
const noPageScroll=page=>page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 if(process.env.PBJ_FAKE_NOW)await context.clock.setFixedTime(new Date(process.env.PBJ_FAKE_NOW));
 const errors=[],external=[],mutations=[];
 // Request guard (mirrors clinical-addendum.e2e.mjs): local origin only, and nothing but GET apart from the public formulary lookup.
 context.on('request',r=>{const url=new URL(r.url());if(url.origin!==origin)external.push(r.url());if(r.method()!=='GET'&&url.pathname!=='/api/formulary/search')mutations.push(r.url());});
 await context.route('**/api/formulary/search',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Synthetic browser test: public lookup intentionally offline'})}));
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/');
 await page.locator('#staff-payer').waitFor();
 const policyDay=await page.evaluate(()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Pacific/Honolulu',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()));
 // Legacy tools are off by default: no letter-builder nav entry, page link, sample case or vault controls anywhere.
 assert.equal(await page.locator('meta[name="pbj-legacy-tools"]').getAttribute('content'),'off');
 const navLabels=(await page.locator('#navigation .nav-item').allTextContents()).map(x=>x.trim());
 assert.ok(navLabels.some(x=>x.startsWith('Sources due')),JSON.stringify(navLabels));
 assert.ok(!navLabels.some(x=>/Authorization letters/.test(x)),JSON.stringify(navLabels));
 assert.equal(await page.locator('[data-page="authorization"],[data-action="authorization"],[data-action="sample"],[data-action="save"],[data-action="restore-file"]').count(),0);
 // Footer build stamp from /version.json.
 await page.waitForFunction(()=>!/Checking/.test(document.querySelector('#build-version').textContent));
 assert.match(await page.locator('#build-version').textContent(),/^Build [0-9a-z]{4,7} · policy data as of \d{4}-\d{2}-\d{2}$/i);
 // Plan year defaults to the policy-day year limited to the supported years.
 const dayYear=Number(policyDay.slice(0,4)),planYear=STAFF_YEARS.includes(dayYear)?dayYear:STAFF_YEARS.at(-1);
 assert.equal(await page.locator('#staff-year').inputValue(),String(planYear));
 // Search names a gel brand; choosing knee gel presets that brand and the planned service date.
 await page.fill('#staff-service-query','Synvisc-One');
 assert.match(await page.locator('#staff-search-count').textContent(),/^\d+ match(es)?$/);
 await page.selectOption('#staff-payer','HMSA');
 await page.selectOption('#staff-plan-select','hmsa-select-choice');
 await page.selectOption('#staff-service-select','knee-gel');
 assert.equal(await page.locator('#staff-gel').inputValue(),'synvisc-one');
 assert.equal(await page.locator('#staff-service-date').inputValue(),policyDay);
 assert.equal(await page.locator('#staff-service-date').count(),1);
 assert.equal(await page.locator('#staff-requirements #staff-service-date').count(),1);
 const glance=await page.locator('#staff-glance').textContent();
 assert.ok(glance.includes(CAVEAT),glance);
 assert.match(glance,/Preferred\s*Synvisc-One/);
 assert.match(glance,/prior authorization \(precertification\) is required/);
 assert.match(glance,/HMSA Hyaluronate Products/);
 assert.equal(await page.locator('#staff-glance .staff-glance-signals li').count(),1,'PA signals are deduped by signal');
 const step3=await page.locator('#staff-requirements').textContent();
 assert.doesNotMatch(step3,/Not verified for this particular plan and service/);
 assert.match(step3,/Member-level authorization: not verified/);
 // With no brand chosen the glance asks for one instead of saying nothing is indexed.
 await page.selectOption('#staff-gel','');
 assert.ok((await page.locator('#staff-glance').textContent()).includes(PRODUCT_NEEDED));
 assert.doesNotMatch(await page.locator('#staff-glance').textContent(),/No published payer reference is indexed/);
 await page.selectOption('#staff-gel','synvisc-one');
 // A non-preferred brand gets the amber notice with its exception text.
 await page.selectOption('#staff-gel','durolane');
 assert.match(await page.locator('#staff-glance .staff-glance-warn').textContent(),/Durolane is listed as non-preferred[\s\S]*Exception path stated/);
 await page.selectOption('#staff-gel','synvisc-one');
 assert.equal(await page.locator('#staff-glance .staff-glance-warn').count(),0);
 // A date in another year than the plan view is flagged; an empty date asks for one.
 await page.fill('#staff-service-date',`${planYear+1}-01-15`);await page.locator('#staff-service-date').dispatchEvent('change');
 assert.equal((await page.locator('.staff-year-note').textContent()).trim(),`The planned service date is in ${planYear+1}; this plan view is for ${planYear}.`);
 await page.fill('#staff-service-date','');await page.locator('#staff-service-date').dispatchEvent('change');
 assert.match(await page.locator('#staff-glance').textContent(),/Enter a planned service date to see payer references\./);
 await page.fill('#staff-service-date',policyDay);await page.locator('#staff-service-date').dispatchEvent('change');
 assert.equal(await page.locator('.staff-year-note').count(),0);
 // Abbreviation search offers total knee; a nonsense query explains what to type.
 await page.fill('#staff-service-query','TKA');
 assert.equal(await page.locator('#staff-service-select option[value="total-knee"]').count(),1);
 assert.match(await page.locator('#staff-search-count').textContent(),/^\d+ match(es)?$/);
 await page.fill('#staff-service-query','zzqx');
 assert.equal((await page.locator('#staff-search-count').textContent()).trim(),NO_MATCH);
 await page.fill('#staff-service-query','');
 assert.equal((await page.locator('#staff-search-count').textContent()).trim(),'');
 // Copy the patient explanation (clipboard, or a download fallback) and export the packet and cost worksheet.
 await page.click('[data-action="staff-patient-script"]');
 await toastIs(page,/Fictional patient explanation copied\.|Explanation downloaded\./);
 let download=page.waitForEvent('download');
 await page.click('[data-action="staff-export-packet"]');
 assert.match((await download).suggestedFilename(),/^pbj-synthetic-auth-documentation-\d{4}-\d{2}-\d{2}\.txt$/);
 await toastIs(page,/Authorization documentation template exported/);
 download=page.waitForEvent('download');
 await page.click('[data-action="staff-cost-export"]');
 assert.match((await download).suggestedFilename(),/^pbj-synthetic-patient-costs-/);
 await toastIs(page,/Conditional scenario worksheet downloaded/);
 // Sources due: four groups, totals and the nav badge agree with the shared report for the same policy day.
 await page.click('#navigation [data-page="sources"]');
 const report=sourcesDueReport({asOf:policyDay});
 for(const id of ['sources-overdue','sources-due-soon','sources-current','sources-undated'])assert.equal(await page.locator('#'+id).count(),1,id);
 assert.equal(await page.locator('#sources-current .source-due-row').count(),report.current.length);
 assert.equal(await page.locator('#sources-undated .source-due-row').count(),report.undated.length);
 const due=report.overdue.length+report.dueSoon.length;
 assert.equal(await page.locator('#navigation [data-page="sources"] .count').count(),due?1:0);
 if(due)assert.equal((await page.locator('#navigation [data-page="sources"] .count').textContent()).trim(),String(due));
 assert.match(await page.locator('#page').textContent(),/docs\/SOURCE-MAINTENANCE\.md/);
 // Security: deployment status from /api/status, no AI connection panel or vault controls.
 await page.click('#navigation [data-page="security"]');
 const security=await page.locator('#page').textContent();
 assert.match(await page.locator('#deployment-status').textContent(),/ACCESS REQUIRED\s*(Yes|No)[\s\S]*ACCESS CONFIGURED\s*(Yes|No)[\s\S]*PRICE BRIDGE CONFIGURED\s*(Yes|No)[\s\S]*BUILD VERSION\s*Build /);
 assert.doesNotMatch(security,/AI connection|Your local workspace|Unlock browser copy/);
 assert.match(security,/Safeguards & release requirements/);
 // Mobile width: no horizontal page scroll on the workup, sources and security pages.
 await page.setViewportSize({width:390,height:844});
 assert.equal(await noPageScroll(page),true,'security @390');
 await page.click('#navigation [data-page="sources"]');
 assert.equal(await noPageScroll(page),true,'sources @390');
 await page.click('#navigation [data-page="workup"]');
 assert.equal(await page.locator('#staff-glance').isVisible(),true);
 assert.equal(await noPageScroll(page),true,'workup @390');
 // The three nav items wrap instead of pushing "Security & connection" off-screen.
 assert.equal(await page.locator('#navigation').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,'nav @390');
 const navRight=await page.locator('#navigation [data-page="security"]').evaluate(el=>el.getBoundingClientRect().right);
 assert.ok(navRight<=390,'security nav item fits @390');
 // Direct navigation to the hidden letter builder falls back to the staff workup.
 await page.goto('about:blank');
 await page.goto(origin+'/#authorization');
 await page.locator('#staff-payer').waitFor();
 assert.equal(await page.evaluate(()=>location.hash),'#workup');
 assert.equal(await page.locator('#breadcrumb').textContent(),'Staff workup');
 await page.evaluate(()=>{location.hash='authorization';});
 await page.waitForFunction(()=>location.hash==='#workup');
 // Lock screen offers no vault restore.
 await page.click('#lock');
 assert.equal(await page.locator('[data-action="restore-file"]').count(),0);
 assert.equal(await page.locator('[data-action="new-session"]').count(),1);
 assert.deepEqual(errors,[]);
 // Access gate: a 403 JSON {error} marked as a gate reply is shown verbatim in a toast and the footer reads "unavailable".
 const gated=await context.newPage();
 const gatedErrors=[];gated.on('pageerror',e=>gatedErrors.push(e.message));
 await gated.route('**/api/status',route=>route.fulfill({status:403,contentType:'application/json',headers:{'X-PBJ-Gate':'access'},body:JSON.stringify({error:ACCESS_ERROR})}));
 await gated.route('**/version.json',route=>route.fulfill({status:403,contentType:'text/html',body:'<!doctype html><title>Access</title>'}));
 await gated.goto(origin+'/');
 await toastIs(gated,new RegExp('^'+ACCESS_ERROR.replace(/\./g,'\\.')+'$'));
 await gated.waitForFunction(()=>document.querySelector('#build-version').textContent==='Build version unavailable');
 // Refreshing the status keeps the gate's own message instead of replacing it with a generic one.
 await gated.click('#navigation [data-page="security"]');
 await gated.evaluate(()=>{document.querySelector('#toast').textContent='';});
 await gated.click('[data-action="check-connection"]');
 await toastIs(gated,new RegExp('^'+ACCESS_ERROR.replace(/\./g,'\\.')+'$'));
 await gated.waitForTimeout(300);
 assert.equal(await gated.locator('#toast').textContent(),ACCESS_ERROR);
 assert.deepEqual(gatedErrors,[]);
 // Uncaught errors show a generic toast without any error detail.
 const probe=await context.newPage();
 await probe.goto(origin+'/');await probe.locator('#staff-payer').waitFor();
 // queueMicrotask, not setTimeout: a fixed page clock (PBJ_FAKE_NOW) wraps timers and would swallow the throw.
 await probe.evaluate(()=>{queueMicrotask(()=>{throw new Error('synthetic-probe-detail');});});
 await toastIs(probe,new RegExp('^'+GENERIC.replace(/[.;]/g,'\\$&')+'$'));
 await probe.evaluate(()=>{document.querySelector('#toast').textContent='';Promise.reject(new Error('synthetic-rejection-detail'));});
 await toastIs(probe,new RegExp('^'+GENERIC.replace(/[.;]/g,'\\$&')+'$'));
 assert.doesNotMatch(await probe.locator('#toast').textContent(),/synthetic-/);
 assert.deepEqual(external,[]);assert.deepEqual(mutations,[]);
 console.log('PASS: staff workup flow; legacy tools hidden; plan-year, service-date and gel-brand defaults; at-a-glance published statements and the choose-a-brand prompt; search counts; patient explanation and exports; sources due page; deployment status; 390px layout and nav; #authorization fallback; Access-gate toasts kept on refresh and error toasts; no external requests or data writes.');
}finally{await browser.close();}
