import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
const script=fileURLToPath(new URL('../server/local.mjs',import.meta.url));
const freePort=()=>new Promise((resolve,reject)=>{const s=createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const {port}=s.address();s.close(()=>resolve(port));});});
function start(args){
 return new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[script,...args],{stdio:['ignore','pipe','pipe']});
  let out='';
  child.stdout.on('data',d=>{out+=d;if(out.includes('Patient-data mode is blocked'))resolve({child,out:()=>out});});
  child.stderr.on('data',d=>{out+=d;});
  child.on('exit',code=>reject(new Error('server exited '+code+': '+out)));
 });
}
const get=(port,host,path='/api/status')=>new Promise((resolve,reject)=>{
 const r=http.request({host:'127.0.0.1',port,path,method:'GET',headers:{Host:host}},res=>{let body='';res.on('data',d=>body+=d);res.on('end',()=>resolve({status:res.statusCode,body}));});
 r.on('error',reject);r.end();
});
test('the normal local server (as used by the browser e2e) binds loopback and accepts only loopback Host values',async()=>{
 const port=await freePort();const {child,out}=await start(['--port',String(port)]);
 try{
  assert.doesNotMatch(out(),/Preview mode/);
  assert.equal((await get(port,`localhost:${port}`)).status,200);
  assert.equal(JSON.parse((await get(port,`127.0.0.1:${port}`)).body).phiRelease,'blocked');
  assert.equal((await get(port,'preview.example')).status,403);
  assert.equal((await get(port,`preview.example:${port}`)).status,403);
 }finally{child.kill();}
});
test('preview mode keeps Host validation, defaults to loopback and honours --allow-host',async()=>{
 const port=await freePort();const {child,out}=await start(['--preview','--port',String(port),'--allow-host','preview.example']);
 try{
  assert.match(out(),/Preview mode: bound to 127\.0\.0\.1/);
  assert.equal((await get(port,`localhost:${port}`)).status,200);
  assert.equal((await get(port,'preview.example')).status,200);
  assert.equal((await get(port,`preview.example:${port}`)).status,200);
  assert.equal((await get(port,'evil.example')).status,403);
  assert.equal((await get(port,`evil.example:${port}`)).status,403);
 }finally{child.kill();}
});
const post=(port,path,body)=>new Promise((resolve,reject)=>{
 const r=http.request({host:'127.0.0.1',port,path,method:'POST',headers:{Host:`localhost:${port}`,Origin:`http://localhost:${port}`,'Content-Type':'application/json'}},res=>{let text='';res.on('data',d=>text+=d);res.on('end',()=>resolve({status:res.statusCode,body:text}));});
 r.on('error',reject);r.end(JSON.stringify(body));
});
const policyAsOf=JSON.parse(readFileSync(new URL('../docs/coverage-matrix.json',import.meta.url),'utf8')).asOf;
test('local dev answers /version.json itself and keeps legacy tools off without --legacy-tools',async()=>{
 const port=await freePort();const {child,out}=await start(['--port',String(port)]);
 try{
  assert.doesNotMatch(out(),/Legacy reference tools ON/);
  const version=await get(port,`localhost:${port}`,'/version.json');
  assert.equal(version.status,200);const data=JSON.parse(version.body);
  assert.deepEqual(Object.keys(data).sort(),['builtAt','commit','policyAsOf']);
  assert.match(data.commit,/^(?:[0-9a-f]{4,40}|local)$/);assert.equal(data.policyAsOf,policyAsOf);
  assert.match(data.builtAt,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.equal((await get(port,'evil.example','/version.json')).status,403);
  for(const path of ['/','/index.html'])assert.match((await get(port,`localhost:${port}`,path)).body,/<meta name="pbj-legacy-tools" content="off">/);
  const extract=await post(port,'/api/ai/extract',{sampleId:'osteoporosis-evenity',policyId:'uhc-evenity-2026-11'});
  assert.equal(extract.status,404);assert.deepEqual(JSON.parse(extract.body),{error:'Not available in this build.'});
 }finally{child.kill();}
});
test('--legacy-tools serves index.html with the flag on and opens the AI route to its own configuration checks',async()=>{
 const port=await freePort();const {child,out}=await start(['--port',String(port),'--legacy-tools']);
 try{
  assert.match(out(),/Legacy reference tools ON/);
  const page=await get(port,`localhost:${port}`,'/');
  assert.equal(page.status,200);assert.match(page.body,/<meta name="pbj-legacy-tools" content="on">/);assert.doesNotMatch(page.body,/content="off"/);
  // Past the build flag, the route still needs a configured provider and trial token (none here: 503).
  assert.equal((await post(port,'/api/ai/extract',{sampleId:'osteoporosis-evenity',policyId:'uhc-evenity-2026-11'})).status,503);
  assert.equal((await get(port,`localhost:${port}`,'/version.json')).status,200);
 }finally{child.kill();}
});
test('--allow-host outside preview mode and malformed names are refused at startup',async()=>{
 const port=await freePort();
 await assert.rejects(start(['--port',String(port),'--allow-host','preview.example']),/--allow-host requires --preview/);
 await assert.rejects(start(['--preview','--port',String(port),'--allow-host','bad host!']),/Invalid --allow-host name/);
 await assert.rejects(start(['--preview','--port',String(port),'--host','10.0.0.5']),/Invalid preview host/);
});
