import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
// Every relative Markdown link in README and docs/ must resolve to a committed file, so a status
// page or runbook can never be "documented" at a path that does not exist.
const root=new URL('../',import.meta.url).pathname;
const files=['README.md',...readdirSync(resolve(root,'docs')).filter(f=>f.endsWith('.md')).map(f=>'docs/'+f)];
test('relative markdown links in README and docs resolve to files in the repository',()=>{
 const broken=[];
 for(const file of files){
  const text=readFileSync(resolve(root,file),'utf8');
  for(const m of text.matchAll(/\]\(([^)\s#]+)(#[^)]*)?\)/g)){
   const target=m[1];
   if(/^[a-z]+:/i.test(target)||target.startsWith('/'))continue;
   if(!existsSync(resolve(root,dirname(file),target)))broken.push(file+' -> '+target);
  }
 }
 assert.deepEqual(broken,[]);
});
