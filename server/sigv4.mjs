// AWS Signature Version 4, fixed Bedrock service/endpoint only.
const enc=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
const sha=async s=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const hmac=async (key,value)=>{
  const imported=await crypto.subtle.importKey('raw',typeof key==='string'?enc.encode(key):key,{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return crypto.subtle.sign('HMAC',imported,enc.encode(value));
};
export async function signBedrock({region,model,body,accessKey,secretKey,sessionToken,now=new Date()}) {
  if(!/^[a-z]{2}(?:-gov)?-[a-z]+-\d$/.test(region||'')) throw new Error('Invalid AWS region.');
  if(typeof model!=='string'||!model.length||model.length>500||/[\r\n?#]/.test(model)) throw new Error('Invalid Bedrock model ID.');
  if(!accessKey||!secretKey) throw new Error('AWS credentials are not configured.');
  const host=`bedrock-runtime.${region}.amazonaws.com`;
  const path=`/model/${encodeURIComponent(model).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase())}/converse`;
  const timestamp=now.toISOString().replace(/[:-]|\.\d{3}/g,'');
  const day=timestamp.slice(0,8),hash=await sha(body);
  const headers={'content-type':'application/json','host':host,'x-amz-content-sha256':hash,'x-amz-date':timestamp};
  if(sessionToken) headers['x-amz-security-token']=sessionToken;
  const keys=Object.keys(headers).sort(),signedHeaders=keys.join(';');
  const canonicalHeaders=keys.map(k=>`${k}:${headers[k].trim().replace(/\s+/g,' ')}\n`).join('');
  // Bedrock uses standard SigV4 URI double encoding, unlike S3.
  const canonicalPath=path.replace(/%/g,'%25');
  const canonical=['POST',canonicalPath,'',canonicalHeaders,signedHeaders,hash].join('\n');
  const scope=`${day}/${region}/bedrock/aws4_request`;
  const toSign=`AWS4-HMAC-SHA256\n${timestamp}\n${scope}\n${await sha(canonical)}`;
  const kDate=await hmac('AWS4'+secretKey,day),kRegion=await hmac(kDate,region),kService=await hmac(kRegion,'bedrock'),kSigning=await hmac(kService,'aws4_request');
  const signature=hex(await hmac(kSigning,toSign));
  headers.authorization=`AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  delete headers.host; // The HTTP client supplies Host.
  return {url:`https://${host}${path}`,headers};
}
