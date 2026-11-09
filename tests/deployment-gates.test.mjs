import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {assertGatedWorkersBuild} from '../scripts/build.mjs';
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
 assert.equal(wrangler.vars.AI_TRIAL_ENABLED,'false');assert.equal(wrangler.vars.AI_PROVIDER,'none');
});
test('the gated deploy workflow pins wrangler exactly and exports the acknowledgment into the build',async()=>{
 const workflow=await readFile(new URL('.github/workflows/deploy-cloudflare-trial.yml',root),'utf8');
 assert.match(workflow,/npx --yes wrangler@\d+\.\d+\.\d+ deploy/);
 assert.doesNotMatch(workflow,/wrangler@4 deploy/);
 assert.match(workflow,/SYNTHETIC_ONLY_ACK: \$\{\{ inputs\.synthetic_only_ack/);
 assert.match(workflow,/if: inputs\.synthetic_only_ack == true/);
 assert.match(workflow,/^on:\n  workflow_dispatch:/m);
});
