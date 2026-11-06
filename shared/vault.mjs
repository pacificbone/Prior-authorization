const enc=new TextEncoder(), dec=new TextDecoder();
export const KDF_ITERATIONS=600000;
const b64=bytes=>{let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);};
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function derive(passphrase,salt,usage) {
  const material=await crypto.subtle.importKey('raw',enc.encode(passphrase),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:KDF_ITERATIONS,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,[usage]);
}
export async function sealWorkspace(data,passphrase) {
  if(typeof passphrase!=='string'||passphrase.length<14) throw new Error('Use a passphrase of at least 14 characters.');
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const key=await derive(passphrase,salt,'encrypt');
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode('PBJ-VAULT-1')},key,enc.encode(JSON.stringify(data)));
  return {version:1,kdf:'PBKDF2-SHA256',iterations:KDF_ITERATIONS,cipher:'AES-256-GCM',salt:b64(salt),iv:b64(iv),ciphertext:b64(new Uint8Array(ciphertext))};
}
export async function openWorkspace(envelope,passphrase) {
  if(!envelope||envelope.version!==1||envelope.kdf!=='PBKDF2-SHA256'||envelope.cipher!=='AES-256-GCM'||envelope.iterations!==KDF_ITERATIONS||typeof envelope.ciphertext!=='string'||envelope.ciphertext.length>2000000) throw new Error('Unsupported or oversized encrypted workspace.');
  try {
    const salt=bytes(envelope.salt),iv=bytes(envelope.iv);
    if(salt.length!==16||iv.length!==12) throw new Error('Invalid encryption parameters.');
    const key=await derive(passphrase,salt,'decrypt');
    const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:enc.encode('PBJ-VAULT-1')},key,bytes(envelope.ciphertext));
    return JSON.parse(dec.decode(plaintext));
  } catch { throw new Error('Could not unlock. Check the passphrase and file integrity.'); }
}
