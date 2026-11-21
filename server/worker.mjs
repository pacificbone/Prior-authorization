import {handleApi} from './api.mjs';
import {accessConfigured,verifyStaffAccess} from './access.mjs';
import {json,logFailure,secureResponse} from './security.mjs';
// REQUIRE_ACCESS='true': every request (assets and /api/*) needs a verified Cloudflare Access JWT,
// so a hostname the Access application does not cover still serves nothing. Only an explicit 'false'
// (wrangler dev via .dev.vars, or a test) turns the gate off. Unset, '' (a dropped var, an env stanza
// without vars), missing Access settings or any other value answer 503 and never serve (fail closed).
export function accessGate(env) {
  const flag=env?.REQUIRE_ACCESS;
  if(flag==='false')return 'off';
  return flag==='true'&&accessConfigured(env)?'on':'misconfigured';
}
// Gate replies carry this header so the page can tell them from a route's own 403/503 errors.
export const GATE_HEADER='X-PBJ-Gate';
const gateReply=(body,status,url)=>{const r=secureResponse(json(body,status),url);r.headers.set(GATE_HEADER,'access');return r;};
// Every path, including unexpected failures, returns JSON with the security headers and no detail.
export function createWorker({verify=verifyStaffAccess,api=handleApi}={}) {
  return {async fetch(request,env={}) {
    let route;
    try {
      route=new URL(request.url).pathname;
      const gate=accessGate(env);
      if(gate==='misconfigured')return gateReply({error:'Staff access enforcement is not configured. Nothing is served until the owner completes the Cloudflare Access settings.'},503,request.url);
      if(gate==='on'&&(await verify(request,env))?.verified!==true)return gateReply({error:'A verified Cloudflare Access staff session is required.'},403,request.url);
      if(route.startsWith('/api/'))return await api(request,env);
      return secureResponse(await env.ASSETS.fetch(request),request.url);
    } catch(error) {logFailure(route,500,error);return secureResponse(json({error:'Request failed.'},500),request.url);}
  }};
}
export default createWorker();
