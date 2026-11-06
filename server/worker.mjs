import {handleApi} from './api.mjs';
import {secureResponse} from './security.mjs';
export default {async fetch(request,env) {
  if(new URL(request.url).pathname.startsWith('/api/')) return handleApi(request,env);
  return secureResponse(await env.ASSETS.fetch(request),request.url);
}};
