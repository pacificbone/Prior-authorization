import {readFile,stat} from 'node:fs/promises';
import {verifyPolicySnapshot} from '../server/policy-snapshot.mjs';
const [id,file]=process.argv.slice(2);
if(!id||!file)throw Error('Usage: node scripts/verify-policy-snapshot.mjs SOURCE_ID PUBLIC_PDF_FILE');
if((await stat(file)).size>15000000)throw Error('Public PDF exceeds snapshot size limit');
console.log(JSON.stringify(await verifyPolicySnapshot(id,await readFile(file)),null,2));
