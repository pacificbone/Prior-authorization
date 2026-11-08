import { getOfflineGuide, assessOfflinePacket } from './offline-auth-guides.mjs';

// Printable, clinician-reviewed companion to an office note. No fabricated findings.
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function renderAuthorizationAddendumHtml(service, answers = {}, metadata = {}) {
  const guide = getOfflineGuide(service);
  if (!guide) throw new Error('Unknown service');
  const assessment = assessOfflinePacket(service, answers);
  const rows = guide.questions.map(([id,label]) => {
    const value = String(answers[id] ?? '').trim();
    return '<tr><th scope="row">' + escapeHtml(label) + '</th><td>' +
      (value ? escapeHtml(value) : '<strong class="missing">NOT DOCUMENTED — complete or mark not applicable with rationale</strong>') +
      '</td></tr>';
  }).join('');
  const missing = assessment.missing.length ? assessment.missing.map(x=>x.label).join('; ') : 'None in the general clinical checklist';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Prior Authorization Addendum</title>' +
    '<style>body{font:12px/1.45 Arial,sans-serif;color:#17212c;max-width:800px;margin:28px auto}h1{font-size:20px}h2{font-size:14px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bac4cc;padding:9px;vertical-align:top;text-align:left}th{width:38%;background:#f2f5f7}.missing{color:#a12828}.warning{padding:10px;border:1px solid #a12828}footer{margin-top:26px}@media print{body{margin:12mm}.print-hide{display:none}}</style></head><body>' +
    '<h1>Prior Authorization — Clinical Documentation Addendum</h1>' +
    '<p><strong>Requested service:</strong> '+escapeHtml(guide.label)+'<br><strong>Patient:</strong> '+escapeHtml(metadata.patientName || '[PATIENT NAME]')+
    '<br><strong>Date of service:</strong> '+escapeHtml(metadata.date || '[DATE]')+
    '<br><strong>Payer / exact plan:</strong> '+escapeHtml(metadata.plan || '[VERIFY EXACT PRODUCT]')+
    '<br><strong>Clinician:</strong> '+escapeHtml(metadata.clinician || '[CLINICIAN]')+'</p>' +
    '<h2>Documented clinical evidence</h2><table>'+rows+'</table>' +
    '<h2>Missing clinical information</h2><p>'+escapeHtml(missing)+'</p>' +
    '<h2>Medical necessity rationale</h2><p>'+escapeHtml(metadata.rationale || '[CLINICIAN MUST ENTER INDIVIDUALIZED RATIONALE]')+'</p>' +
    '<h2>Supporting records</h2><p>'+escapeHtml(metadata.attachments || '[LIST OFFICE NOTE, IMAGING, LABS, TREATMENT RECORDS AS APPLICABLE]')+'</p>' +
    '<p class="warning"><strong>Verification required:</strong> This is a clinical documentation aid, not a coverage determination. The exact plan policy, prior authorization requirement, site of service, and benefit must be checked before submission. Unfilled fields must not be represented as findings.</p>' +
    '<footer>Reviewed by: __________________________ &nbsp; Date: __________</footer>' +
    '<p class="print-hide"><button onclick="window.print()">Print / Save as PDF</button></p></body></html>';
}
