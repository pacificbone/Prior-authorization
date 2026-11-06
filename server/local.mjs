import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {handleApi} from './api.mjs';
import {SECURITY_HEADERS} from './security.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const preview=process.argv.includes('--preview');
const portFlag=process.argv.indexOf('--port');
const hostFlag=process.argv.indexOf('--host');
const port=Number(portFlag>=0?process.argv[portFlag+1]:(process.env.PORT||3000));
const previewHost=hostFlag>=0?process.argv[hostFlag+1]:'0.0.0.0';
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid port.');
if(preview&&!['127.0.0.1','0.0.0.0','localhost'].includes(previewHost))throw new Error('Invalid preview host.');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
  try {
    const host=req.headers.host||'';
    if(!preview&&!new Set([`localhost:${port}`,`127.0.0.1:${port}`,`[::1]:${port}`]).has(host)) {res.writeHead(403,SECURITY_HEADERS);res.end('Invalid host.');return;}
    const url=new URL(req.url,`http://${host}`);
    if(url.pathname.startsWith('/api/')) {
      let size=0;const chunks=[];
      for await(const chunk of req){size+=chunk.length;if(size>2048){res.writeHead(413,SECURITY_HEADERS);res.end('Request too large.');return;}chunks.push(chunk);}
      const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
      const response=await handleApi(request,process.env);
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,SECURITY_HEADERS);res.end();return;}
    const pathname=decodeURIComponent(url.pathname);
    const base=pathname.startsWith('/shared/')?path.join(root,'shared'):path.join(root,'public');
    const relative=pathname.startsWith('/shared/')?pathname.slice(8):(pathname==='/'?'index.html':pathname.slice(1));
    const target=path.resolve(base,relative);
    if(!target.startsWith(base+path.sep)||!mime[path.extname(target)]) {res.writeHead(404,SECURITY_HEADERS);res.end('Not found.');return;}
    const data=await readFile(target);
    res.writeHead(200,{...SECURITY_HEADERS,'Content-Type':mime[path.extname(target)]});res.end(req.method==='HEAD'?undefined:data);
  } catch {if(!res.headersSent)res.writeHead(404,SECURITY_HEADERS);res.end('Not found.');}
});
server.headersTimeout=10000;server.requestTimeout=15000;server.maxHeadersCount=50;
server.listen(port,preview?previewHost:'127.0.0.1',()=>{console.log(`PBJ synthetic trial: http://localhost:${port}`);console.log('Patient-data mode is blocked. Notes remain in browser memory unless explicitly encrypted and saved.');});
