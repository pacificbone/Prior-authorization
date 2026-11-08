import test from 'node:test';
import assert from 'node:assert/strict';
import {releaseBoundary,assertSyntheticBuild} from '../shared/release-boundary.mjs';
import {createApi} from '../server/api.mjs';
test('no environment switch or mutable report can grant a PHI or production release',async()=>{
 const a=releaseBoundary();a.controls[0].status='verified';a.productionReleaseAllowed=true;
 assert.equal(releaseBoundary().productionReleaseAllowed,false);
 assert.equal(releaseBoundary().patientDataEnabled,false);
 assert.equal(releaseBoundary().orderingAllowed,false);
 assert.ok(releaseBoundary().controls.every(c=>c.status==='blocked'));
 const response=await createApi()(new Request('https://app.example/api/status'),{PATIENT_DATA_ENABLED:'true',PHI_ENABLED:'true',PRODUCTION_RELEASE_ALLOWED:'true',DEPLOYMENT_MODE:'production',OPENAI_API_KEY:'must-not-leak'});
 const data=await response.json();assert.equal(data.phiRelease,'blocked');assert.equal(data.releaseReadiness.productionReleaseAllowed,false);assert.doesNotMatch(JSON.stringify(data),/must-not-leak/);
});
for(const key of ['PATIENT_DATA_ENABLED','PHI_ENABLED','PRODUCTION_RELEASE_ALLOWED'])test('build rejects active or unrecognized release flags: '+key,()=>{
 for(const value of ['true','TRUE','1','yes','approved',true,{},1])assert.throws(()=>assertSyntheticBuild({[key]:value}),/blocked/);
 for(const value of [undefined,null,'','false','0','off',false,0])assert.equal(assertSyntheticBuild({[key]:value}),true);
});
test('production deployment modes are rejected by the synthetic build gate',()=>{
 for(const mode of ['production','live','clinical','unknown'])assert.throws(()=>assertSyntheticBuild({DEPLOYMENT_MODE:mode}));
 for(const mode of ['development','test','synthetic-trial'])assert.equal(assertSyntheticBuild({DEPLOYMENT_MODE:mode}),true);
});
test('no patient ingestion, policy upload, order or procurement endpoint was introduced',async()=>{
 let calls=0;const api=createApi({fetcher:async()=>{calls++;throw Error('must not call');}});
 for(const path of ['/api/patients','/api/cases','/api/policies/upload','/api/orders','/api/procurement']){
  const r=await api(new Request('https://app.example'+path,{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json'},body:JSON.stringify({note:'Fictional rejected content'})}),{PATIENT_DATA_ENABLED:'true'});
  assert.equal(r.status,404);assert.doesNotMatch(await r.text(),/Fictional rejected/);
 }
 assert.equal(calls,0);
});
