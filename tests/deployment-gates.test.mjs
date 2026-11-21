import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {assertGatedWorkersBuild,build} from '../scripts/build.mjs';
import {buildCommit,gitShortSha,legacyToolsRequested,setLegacyToolsMeta} from '../server/build-meta.mjs';
const root=new URL('../',import.meta.url);
const parseJsonc=text=>JSON.parse(text.replace(/"(?:\\.|[^"\\])*"|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,m=>m[0]==='"'?m:'').replace(/,(\s*[}\]])/g,'$1'));
test('unattended Cloudflare Workers Builds fail closed unless the acknowledged workflow exported the gate',()=>{
 for(const env of [{WORKERS_CI:'1'},{WORKERS_CI:'true'},{WORKERS_CI:'1',SYNTHETIC_ONLY_ACK:'yes'},{WORKERS_CI:'1',SYNTHETIC_ONLY_ACK:'TRUE'},{WORKERS_CI:'1',SYNTHETIC_ONLY_ACK:''}])
  assert.throws(()=>assertGatedWorkersBuild(env),/not permitted.*gated/s);
 for(const env of [{},{SYNTHETIC_ONLY_ACK:'false'},{WORKERS_CI:'',SYNTHETIC_ONLY_ACK:'false'},{WORKERS_CI:'1',SYNTHETIC_ONLY_ACK:'true'}])
  assert.equal(assertGatedWorkersBuild(env),true);
});
test('the build CLI exits non-zero under WORKERS_CI before touching dist/',async()=>{
 const before=await stat(new URL('dist/',root)).then(s=>s.mtimeMs,()=>null);
 const env={...process.env,WORKERS_CI:'1'};delete env.SYNTHETIC_ONLY_ACK;
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('scripts/build.mjs',root))],{env,encoding:'utf8'});
 assert.notEqual(result.status,0);
 assert.match(result.stderr,/Unattended Cloudflare Workers Builds deploys are not permitted/);
 assert.doesNotMatch(result.stdout,/Built dist/);
 assert.equal(await stat(new URL('dist/',root)).then(s=>s.mtimeMs,()=>null),before);
});
test('wrangler.jsonc disables preview URLs and keeps the synthetic-only vars',async()=>{
 const wrangler=parseJsonc(await readFile(new URL('wrangler.jsonc',root),'utf8'));
 assert.equal(wrangler.preview_urls,false);
 // A deploy cannot skip verification: wrangler itself runs check, tests and the guarded build.
 assert.equal(wrangler.build.command,'npm run check && npm test && npm run build');
 assert.equal(wrangler.name,'prior-authorization');
 assert.equal(wrangler.vars.AI_TRIAL_ENABLED,'false');assert.equal(wrangler.vars.AI_PROVIDER,'none');
 // The Worker enforces Access itself; the owner's two Access secrets are never committed.
 assert.equal(wrangler.vars.REQUIRE_ACCESS,'true');assert.equal(wrangler.vars.LEGACY_TOOLS,'off');
 assert.equal(wrangler.vars.ACCESS_TEAM_DOMAIN,undefined);assert.equal(wrangler.vars.ACCESS_AUD,undefined);
 assert.equal(wrangler.observability.enabled,false);
});
test('build version metadata: commit precedence, validated values and the legacy-tools flag',()=>{
 const git=()=>'abc1234';
 assert.equal(buildCommit({WORKERS_CI_COMMIT_SHA:'0123456789abcdef0123456789abcdef01234567',GITHUB_SHA:'fedcba9876543210'},git),'0123456789abcdef0123456789abcdef01234567');
 assert.equal(buildCommit({GITHUB_SHA:'fedcba9876543210'},git),'fedcba9876543210');
 assert.equal(buildCommit({WORKERS_CI_COMMIT_SHA:'<script>',GITHUB_SHA:'not a sha'},git),'abc1234');
 assert.equal(buildCommit({},()=>null),'unknown');
 assert.equal(gitShortSha('.',()=>({status:0,stdout:'1a2b3c4\n'})),'1a2b3c4');
 for(const run of [()=>({status:128,stdout:''}),()=>({status:0,stdout:'fatal: not a git repository'}),()=>{throw Error('git missing');}])assert.equal(gitShortSha('.',run),null);
 assert.equal(legacyToolsRequested(['node','build.mjs'],{}),false);
 assert.equal(legacyToolsRequested(['node','build.mjs'],{PBJ_LEGACY_TOOLS:'true'}),false);
 assert.equal(legacyToolsRequested(['node','build.mjs','--legacy-tools'],{}),true);
 assert.equal(legacyToolsRequested(['node','build.mjs'],{PBJ_LEGACY_TOOLS:'on'}),true);
 const html='<meta name="pbj-api-mode" content="server">\n<meta name="pbj-legacy-tools" content="off">';
 assert.match(setLegacyToolsMeta(html,true),/<meta name="pbj-legacy-tools" content="on">/);
 assert.match(setLegacyToolsMeta(html.replace('"off"','"on"'),false),/<meta name="pbj-legacy-tools" content="off">/);
 for(const bad of ['<meta name="pbj-api-mode" content="server">',html+html])assert.throws(()=>setLegacyToolsMeta(bad,false),/exactly one/);
});
test('the source index.html ships with legacy tools off next to the API-mode meta',async()=>{
 const html=await readFile(new URL('public/index.html',root),'utf8');
 assert.match(html,/<meta name="pbj-api-mode" content="server">\s*<meta name="pbj-legacy-tools" content="off">/);
});
test('a build writes dist/version.json {commit, builtAt, policyAsOf} and keeps legacy tools off unless asked',async()=>{
 const {asOf}=JSON.parse(await readFile(new URL('docs/coverage-matrix.json',root),'utf8'));
 const env={...process.env};for(const k of ['WORKERS_CI','SYNTHETIC_ONLY_ACK','WORKERS_CI_COMMIT_SHA','PBJ_LEGACY_TOOLS','PATIENT_DATA_ENABLED','PHI_ENABLED','PRODUCTION_RELEASE_ALLOWED','DEPLOYMENT_MODE'])delete env[k];
 // In-process opt-in build first, then the plain CLI build, so dist/ is left in the deployable state.
 const log=console.log;console.log=()=>{};
 try{await build(['node','scripts/build.mjs','--legacy-tools'],{...env,GITHUB_SHA:'0badc0de1234'});}finally{console.log=log;}
 assert.match(await readFile(new URL('dist/index.html',root),'utf8'),/<meta name="pbj-legacy-tools" content="on">/);
 assert.equal(JSON.parse(await readFile(new URL('dist/version.json',root),'utf8')).commit,'0badc0de1234');
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('scripts/build.mjs',root))],{env:{...env,GITHUB_SHA:'1234567abcdef'},encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/Built dist\/.*legacy tools off/);
 const version=JSON.parse(await readFile(new URL('dist/version.json',root),'utf8'));
 assert.deepEqual(Object.keys(version).sort(),['builtAt','commit','policyAsOf']);
 assert.equal(version.commit,'1234567abcdef');assert.equal(version.policyAsOf,asOf);
 // The child runs on the real clock, so only the ISO shape is checked (the suite may run time-shifted).
 assert.match(version.builtAt,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);assert.ok(Number.isFinite(Date.parse(version.builtAt)));
 const html=await readFile(new URL('dist/index.html',root),'utf8');
 assert.match(html,/<meta name="pbj-legacy-tools" content="off">/);assert.match(html,/<meta name="pbj-api-mode" content="server">/);
});
test('the gated deploy workflow pins wrangler exactly and exports the acknowledgment into the build',async()=>{
 const workflow=await readFile(new URL('.github/workflows/deploy-cloudflare-trial.yml',root),'utf8');
 assert.match(workflow,/npx --yes wrangler@\d+\.\d+\.\d+ deploy/);
 assert.doesNotMatch(workflow,/wrangler@4 deploy/);
 assert.match(workflow,/SYNTHETIC_ONLY_ACK: \$\{\{ inputs\.synthetic_only_ack/);
 assert.match(workflow,/if: inputs\.synthetic_only_ack == true/);
 assert.match(workflow,/^on:\n  workflow_dispatch:/m);
});
