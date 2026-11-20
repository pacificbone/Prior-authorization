// Shifts the clock so "now" equals FAKE_NOW (ISO) at process start; time still advances.
const target=Date.parse(process.env.FAKE_NOW);const Real=Date;const off=target-Real.now();
class Fake extends Real{constructor(...a){if(a.length===0)super(Real.now()+off);else super(...a);}static now(){return Real.now()+off;}}
globalThis.Date=Fake;
const RF=Intl.DateTimeFormat;
const origFormat=Object.getOwnPropertyDescriptor(RF.prototype,'format');
const origFn=RF.prototype.formatToParts;
RF.prototype.formatToParts=function(d){return origFn.call(this,d===undefined?new Fake():d);};
Object.defineProperty(RF.prototype,'format',{get(){const f=origFormat.get.call(this);return d=>f(d===undefined?new Fake():d);}});
