// Regenerates docs/COVERAGE-MATRIX.md and docs/coverage-matrix.json from the registries.
// Usage: node scripts/coverage-matrix.mjs [--as-of YYYY-MM-DD] [--check]
import {readFile,writeFile} from 'node:fs/promises';
import {buildCoverageMatrix,renderCoverageMatrixMarkdown} from '../shared/coverage-matrix.mjs';
import {policyDay,validPolicyDate} from '../shared/plan-adoption.mjs';
const args=process.argv.slice(2);
const asOfIndex=args.indexOf('--as-of');
const asOf=asOfIndex>=0?args[asOfIndex+1]:policyDay();
if(!validPolicyDate(asOf))throw Error('Usage: node scripts/coverage-matrix.mjs [--as-of YYYY-MM-DD] [--check]');
const root=new URL('../',import.meta.url);
const matrix=buildCoverageMatrix({asOf});
const markdown=renderCoverageMatrixMarkdown(matrix);
const json=JSON.stringify(matrix,null,1)+'\n';
if(args.includes('--check')){
 const [md,js]=await Promise.all([readFile(new URL('docs/COVERAGE-MATRIX.md',root),'utf8'),readFile(new URL('docs/coverage-matrix.json',root),'utf8')]);
 if(md!==markdown||js!==json){console.error('Coverage matrix is out of date; run npm run matrix -- --as-of '+asOf);process.exit(1);}
 console.log('Coverage matrix matches the registries for '+asOf+'.');
}else{
 await writeFile(new URL('docs/COVERAGE-MATRIX.md',root),markdown);
 await writeFile(new URL('docs/coverage-matrix.json',root),json);
 console.log(`Wrote docs/COVERAGE-MATRIX.md and docs/coverage-matrix.json for ${asOf}: `+Object.entries(matrix.counts).map(([k,v])=>k+'='+v).join(', ')+`; ${matrix.gaps.length} priority services with focus-payer gaps.`);
}
