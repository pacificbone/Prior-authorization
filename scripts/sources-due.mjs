// Prints which captured payer sources are overdue, expired or coming due for their review.
// Usage: npm run sources:due -- [--as-of YYYY-MM-DD] [--horizon DAYS]
// Exit status: 0 nothing overdue or expired, 1 something is overdue or expired, 2 bad arguments.
import {sourcesDueReport,sourcesDueText} from '../shared/sources-due.mjs';
import {policyDay,validPolicyDate} from '../shared/plan-adoption.mjs';
const usage='Usage: npm run sources:due -- [--as-of YYYY-MM-DD] [--horizon DAYS]';
const fail=msg=>{console.error(msg+'\n'+usage);process.exit(2);};
const opts={asOf:policyDay(),horizonDays:30};
const args=process.argv.slice(2);
for(let i=0;i<args.length;i++){
 const [flag,inline]=args[i].split(/=(.*)/s),value=inline??args[++i];
 if(flag==='--as-of'){if(!validPolicyDate(value))fail('--as-of needs a real date written YYYY-MM-DD');opts.asOf=value;}
 else if(flag==='--horizon'){if(!/^\d+$/.test(value||''))fail('--horizon needs a whole number of days');opts.horizonDays=Number(value);}
 else if(flag==='--help'||flag==='-h'){console.log(usage);process.exit(0);}
 else fail('Unknown argument: '+args[i]);
}
const report=sourcesDueReport(opts);
console.log(sourcesDueText(report));
process.exitCode=report.overdue.length?1:0;
