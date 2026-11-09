import {PAYER_POLICY_EVIDENCE} from '../shared/payer-policy-evidence.mjs';
// Verifies bytes against a previously reviewed public snapshot. No extraction,
// member-data ingestion or policy approval endpoint is exposed.
export async function verifyPolicySnapshot(sourceId,bytes,registry=PAYER_POLICY_EVIDENCE){
 const matches=registry.filter(s=>s.id===sourceId);
 if(matches.length!==1)throw Error('Unknown or ambiguous public policy source');
 if(!(bytes instanceof Uint8Array)||bytes.byteLength>15000000||new TextDecoder().decode(bytes.subarray(0,5))!=='%PDF-')throw Error('Expected a bounded public PDF snapshot');
 if(!matches[0].sourceSha256)throw Error('No fingerprint on record for '+sourceId+(matches[0].registerSha256?': compare the download against register digest '+matches[0].registerSha256+' in docs/policy-source-checksums.json and bind it after title, scope and version review':'; this is a directory entry or web document without a PDF snapshot'));
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 if(digest!==matches[0].sourceSha256)throw Error('Document mismatch or remote revision: quarantine and review title, scope and version before updating the registry');
 return {sourceId,title:matches[0].title,sha256:digest,snapshotMatches:true,planAdoptionVerified:false,orderingAllowed:false};
}
