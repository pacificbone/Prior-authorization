import {handleApi} from './api.mjs';
import {json,secureResponse} from './security.mjs';
// Every path, including unexpected failures, returns JSON with the security headers and no detail.
export default {async fetch(request,env) {
  try {
    if(new URL(request.url).pathname.startsWith('/api/')) return await handleApi(request,env);
    return secureResponse(await env.ASSETS.fetch(request),request.url);
  } catch {return secureResponse(json({error:'Request failed.'},500),request.url);}
}};
