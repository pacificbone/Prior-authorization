import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
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
test('--allow-host outside preview mode and malformed names are refused at startup',async()=>{
 const port=await freePort();
 await assert.rejects(start(['--port',String(port),'--allow-host','preview.example']),/--allow-host requires --preview/);
 await assert.rejects(start(['--preview','--port',String(port),'--allow-host','bad host!']),/Invalid --allow-host name/);
 await assert.rejects(start(['--preview','--port',String(port),'--host','10.0.0.5']),/Invalid preview host/);
});
