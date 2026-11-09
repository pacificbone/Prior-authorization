import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {assertSyntheticBuild} from '../shared/release-boundary.mjs';
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
  await rm(new URL('dist/',root),{recursive:true,force:true});
  await mkdir(new URL('dist/',root),{recursive:true});
  await cp(new URL('public/',root),new URL('dist/',root),{recursive:true});
  await cp(new URL('shared/',root),new URL('dist/shared/',root),{recursive:true});
  if(argv.includes('--static-preview')){
    const target=new URL('dist/index.html',root);
    const html=await readFile(target,'utf8');
    await writeFile(target,html.replace('name="pbj-api-mode" content="server"','name="pbj-api-mode" content="static-preview"'));
  }
  console.log('Built dist/ with local assets only. Server credentials and adapters are excluded.');
}
// Run only as `node scripts/build.mjs`; importing the guard performs no build.
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{await build();}catch(error){console.error(error.message);process.exit(1);}
}
