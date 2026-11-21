import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const dirs=['public','shared','server','scripts','tests'];let count=0;
for(const dir of dirs)for(const file of await readdir(dir))if(file.endsWith('.mjs')){
  const result=spawnSync(process.execPath,['--check',`${dir}/${file}`],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);count++;
}
// Strip // and /* */ comments (outside strings) and trailing commas, then parse JSONC.
function parseJsonc(text){
  return JSON.parse(text.replace(/"(?:\\.|[^"\\])*"|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,m=>m[0]==='"'?m:'').replace(/,(\s*[}\]])/g,'$1'));
}
// Preview URLs would publish every version outside the acknowledged, Access-protected trial path.
const wrangler=parseJsonc(await readFile('wrangler.jsonc','utf8'));
if(wrangler.preview_urls!==false){console.error('wrangler.jsonc must set "preview_urls": false.');process.exit(1);}
console.log(`Syntax checked ${count} JavaScript modules; wrangler.jsonc keeps preview URLs disabled.`);
