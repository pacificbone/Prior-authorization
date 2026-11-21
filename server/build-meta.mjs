import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
// Version and build-flag helpers shared by scripts/build.mjs (dist/version.json, index.html meta)
// and server/local.mjs (/version.json, --legacy-tools). Node-only: the Worker never imports this.
// Only a hex commit and ISO dates can reach version.json; no other env or git text is copied.
const SHA=/^[0-9a-f]{4,40}$/i,DAY=/^\d{4}-\d{2}-\d{2}$/;
export function gitShortSha(cwd,run=spawnSync) {
  try {const r=run('git',['rev-parse','--short','HEAD'],{cwd,encoding:'utf8',timeout:5000,stdio:['ignore','pipe','ignore']});const sha=String(r?.stdout??'').trim();return r?.status===0&&SHA.test(sha)?sha:null;}
  catch {return null;}
}
// WORKERS_CI_COMMIT_SHA (Cloudflare Workers Builds), else GITHUB_SHA, else the local checkout, else 'unknown'.
export function buildCommit(env=process.env,git=()=>gitShortSha()) {
  for(const value of [env.WORKERS_CI_COMMIT_SHA,env.GITHUB_SHA])if(typeof value==='string'&&SHA.test(value.trim()))return value.trim();
  return git()||'unknown';
}
export async function readPolicyAsOf(root) {
  const {asOf}=JSON.parse(await readFile(new URL('docs/coverage-matrix.json',root),'utf8'));
  if(typeof asOf!=='string'||!DAY.test(asOf))throw Error('docs/coverage-matrix.json has no asOf date.');
  return asOf;
}
// The note-paste letter builder, AI evidence extractor and encrypted vault stay off unless a build or
// local server is explicitly started with --legacy-tools. index.html must carry exactly one flag meta.
export const legacyToolsRequested=(argv=process.argv,env=process.env)=>argv.includes('--legacy-tools')||env.PBJ_LEGACY_TOOLS==='on';
export function setLegacyToolsMeta(html,on) {
  if((html.match(/name="pbj-legacy-tools"/g)||[]).length!==1||!/<meta name="pbj-legacy-tools" content="[^"]*">/.test(html))
    throw Error('index.html must contain exactly one <meta name="pbj-legacy-tools" content="off"> tag.');
  return html.replace(/<meta name="pbj-legacy-tools" content="[^"]*">/,`<meta name="pbj-legacy-tools" content="${on?'on':'off'}">`);
}
