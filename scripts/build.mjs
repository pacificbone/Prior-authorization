import {assertSyntheticBuild} from '../shared/release-boundary.mjs';
assertSyntheticBuild(process.env);
import {mkdir,rm,cp,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
await rm(new URL('dist/',root),{recursive:true,force:true});
await mkdir(new URL('dist/',root),{recursive:true});
await cp(new URL('public/',root),new URL('dist/',root),{recursive:true});
await cp(new URL('shared/',root),new URL('dist/shared/',root),{recursive:true});
if(process.argv.includes('--static-preview')){
  const target=new URL('dist/index.html',root);
  const html=await readFile(target,'utf8');
  await writeFile(target,html.replace('name="pbj-api-mode" content="server"','name="pbj-api-mode" content="static-preview"'));
}
console.log('Built dist/ with local assets only. Server credentials and adapters are excluded.');
