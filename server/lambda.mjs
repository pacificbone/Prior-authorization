// API Gateway HTTP API payload v2. Configure a JWT authorizer in AWS before exposure.
import {handleApi} from './api.mjs';
export async function handler(event) {
  if(!event.requestContext?.authorizer?.jwt?.claims?.sub) return {statusCode:401,body:'Authentication required.'};
  if(!process.env.APP_ORIGIN) return {statusCode:503,body:'Origin configuration required.'};
  const url=new URL(event.rawPath||'/',process.env.APP_ORIGIN);
  const method=event.requestContext.http.method;
  const request=new Request(url,{method,headers:event.headers||{},...(!['GET','HEAD'].includes(method)?{body:event.isBase64Encoded?Buffer.from(event.body||'','base64'):event.body||''}:{})});
  const response=await handleApi(request,process.env);
  return {statusCode:response.status,headers:Object.fromEntries(response.headers),body:await response.text(),isBase64Encoded:false};
}
