// API Gateway HTTP API payload v2. Configure a JWT authorizer in AWS before exposure.
import {handleApi} from './api.mjs';
import {json,secureResponse} from './security.mjs';
const toLambda=async response=>({statusCode:response.status,headers:Object.fromEntries(response.headers),body:await response.text(),isBase64Encoded:false});
export async function handler(event) {
  // Early refusals carry the same JSON and security-header contract as API replies.
  let base='https://origin.invalid/';try{base=new URL(process.env.APP_ORIGIN).href;}catch{}
  const refuse=(error,status)=>toLambda(secureResponse(json({error},status),base));
  try {
    if(!event?.requestContext?.authorizer?.jwt?.claims?.sub) return refuse('Authentication required.',401);
    if(!process.env.APP_ORIGIN) return refuse('Origin configuration required.',503);
    const url=new URL(event.rawPath||'/',process.env.APP_ORIGIN);
    const method=event.requestContext.http.method;
    const request=new Request(url,{method,headers:event.headers||{},...(!['GET','HEAD'].includes(method)?{body:event.isBase64Encoded?Buffer.from(event.body||'','base64'):event.body||''}:{})});
    return toLambda(await handleApi(request,process.env));
  } catch {return refuse('Request failed.',500);}
}
