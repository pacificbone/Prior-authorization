import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const dirs=['public','shared','server','scripts','tests'];let count=0;
for(const dir of dirs)for(const file of await readdir(dir))if(file.endsWith('.mjs')){
  const result=spawnSync(process.execPath,['--check',`${dir}/${file}`],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);count++;
}
console.log(`Syntax checked ${count} JavaScript modules.`);
