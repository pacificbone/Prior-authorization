import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {assertSyntheticBuild} from '../shared/release-boundary.mjs';
import {buildCommit,gitShortSha,legacyToolsRequested,readPolicyAsOf,setLegacyToolsMeta} from '../server/build-meta.mjs';
// Cloudflare Workers Builds (WORKERS_CI=1) runs on every push to every branch and
// would bypass the manual synthetic_only_ack gate. Only the acknowledged GitHub
// workflow exports SYNTHETIC_ONLY_ACK=true, so an unattended build fails closed.
export function assertGatedWorkersBuild(env=process.env){
  if(env.WORKERS_CI&&env.SYNTHETIC_ONLY_ACK!=='true')
    throw Error('Unattended Cloudflare Workers Builds deploys are not permitted for this synthetic-only trial. Use the gated "Deploy Coverage Desk synthetic Cloudflare trial" workflow (workflow_dispatch with synthetic_only_ack confirmed), which exports SYNTHETIC_ONLY_ACK=true.');
  return true;
}
export async function build(argv=process.argv,env=process.env){
  assertGatedWorkersBuild(env);
  assertSyntheticBuild(env);
  const {mkdir,rm,cp,readFile,writeFile}=await import('node:fs/promises');
  const root=new URL('../',import.meta.url);
  // Everything that can fail is resolved before dist/ is touched.
  const policyAsOf=await readPolicyAsOf(root);
  const legacy=legacyToolsRequested(argv,env);
  // The note-paste letter builder and vault are for local builds only: a deploy build (Workers Builds or the gated
  // workflow) never ships them, whatever a dashboard build variable says.
  if(legacy&&(env.WORKERS_CI||env.SYNTHETIC_ONLY_ACK))throw Error('Legacy tools (--legacy-tools or PBJ_LEGACY_TOOLS=on) are refused in a deploy build (WORKERS_CI or SYNTHETIC_ONLY_ACK set); they are for local builds only.');
  let html=setLegacyToolsMeta(await readFile(new URL('public/index.html',root),'utf8'),legacy);
  if(argv.includes('--static-preview'))html=html.replace('name="pbj-api-mode" content="server"','name="pbj-api-mode" content="static-preview"');
  const version={commit:buildCommit(env,()=>gitShortSha(fileURLToPath(root))),builtAt:new Date().toISOString(),policyAsOf};
  await rm(new URL('dist/',root),{recursive:true,force:true});
  await mkdir(new URL('dist/',root),{recursive:true});
  await cp(new URL('public/',root),new URL('dist/',root),{recursive:true});
  await cp(new URL('shared/',root),new URL('dist/shared/',root),{recursive:true});
  await writeFile(new URL('dist/index.html',root),html);
  await writeFile(new URL('dist/version.json',root),JSON.stringify(version)+'\n');
  console.log(`Built dist/ with local assets only (legacy tools ${legacy?'ON':'off'}; commit ${version.commit}; policy as of ${policyAsOf}). Server credentials and adapters are excluded.`);
}
// Run only as `node scripts/build.mjs`; importing the guard performs no build.
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{await build();}catch(error){console.error(error.message);process.exit(1);}
}
