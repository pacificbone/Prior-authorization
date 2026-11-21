import {handleApi} from './api.mjs';
import {accessConfigured,verifyStaffAccess} from './access.mjs';
import {json,logFailure,secureResponse} from './security.mjs';
// REQUIRE_ACCESS='true': every request (assets and /api/*) needs a verified Cloudflare Access JWT,
// so a hostname the Access application does not cover still serves nothing. Missing Access settings
// or any value other than unset, '' or 'false' answer 503 and never serve (fail closed).
export function accessGate(env) {
  const flag=env?.REQUIRE_ACCESS;
  if(flag===undefined||flag===''||flag==='false')return 'off';
  return flag==='true'&&accessConfigured(env)?'on':'misconfigured';
}
// Every path, including unexpected failures, returns JSON with the security headers and no detail.
export function createWorker({verify=verifyStaffAccess,api=handleApi}={}) {
  return {async fetch(request,env={}) {
    let route;
    try {
      route=new URL(request.url).pathname;
      const gate=accessGate(env);
      if(gate==='misconfigured')return secureResponse(json({error:'Staff access enforcement is not configured. Nothing is served until the owner completes the Cloudflare Access settings.'},503),request.url);
      if(gate==='on'&&(await verify(request,env))?.verified!==true)return secureResponse(json({error:'A verified Cloudflare Access staff session is required.'},403),request.url);
      if(route.startsWith('/api/'))return await api(request,env);
      return secureResponse(await env.ASSETS.fetch(request),request.url);
    } catch(error) {logFailure(route,500,error);return secureResponse(json({error:'Request failed.'},500),request.url);}
  }};
}
export default createWorker();
