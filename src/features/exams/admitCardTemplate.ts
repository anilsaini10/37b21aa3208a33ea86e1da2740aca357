/** HTML template for the admit card PDF — rendered by react-native-html-to-pdf. */

export interface AdmitCardData {
  schoolName: string;
  examTitle: string;
  examDescription?: string;
  studentName: string;
  rollNo: number;
  className: string;
  validFrom: string;
  validTo: string;
  profilePhotoUrl?: string;
}

export function buildAdmitCardHtml(data: AdmitCardData): string {
  const photoHtml = data.profilePhotoUrl
    ? `<img src="${data.profilePhotoUrl}" class="photo" />`
    : `<div class="photo-placeholder">${data.studentName.charAt(0).toUpperCase()}</div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f5f5f5; padding: 20px; }
  .card { background: #fff; border-radius: 16px; overflow: hidden; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
  .header { background: linear-gradient(135deg, #1a73e8, #1557b0); padding: 28px 24px; text-align: center; }
  .header .school-icon { font-size: 32px; margin-bottom: 4px; }
  .header h1 { color: #fff; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .admit-badge { display: inline-block; background: #fff; color: #1a73e8; font-size: 12px; font-weight: 700; letter-spacing: 2px; padding: 4px 18px; border-radius: 20px; }
  .photo-section { text-align: center; padding: 24px 0 8px; }
  .photo { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #1a73e8; object-fit: cover; }
  .photo-placeholder { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #1a73e8; background: #e8f0fe; display: inline-flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 700; color: #1a73e8; }
  .student-name { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-top: 8px; }
  .divider { height: 1px; background: #e0e0e0; margin: 0 24px; }
  .details { padding: 16px 24px; }
  .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { font-size: 13px; color: #666; }
  .detail-value { font-size: 14px; font-weight: 600; color: #1a1a1a; text-align: right; }
  .validity { background: #e8f0fe; padding: 16px 24px; text-align: center; }
  .validity-label { font-size: 12px; font-weight: 600; color: #1a73e8; letter-spacing: 1px; margin-bottom: 4px; }
  .validity-dates { font-size: 15px; font-weight: 700; color: #1a1a1a; }
  .footer { padding: 14px 24px; text-align: center; border-top: 1px solid #f0f0f0; }
  .footer p { font-size: 11px; color: #999; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="school-icon">🏫</div>
    <h1>${escapeHtml(data.schoolName)}</h1>
    <span class="admit-badge">ADMIT CARD</span>
  </div>

  <div class="photo-section">
    ${photoHtml}
    <div class="student-name">${escapeHtml(data.studentName)}</div>
  </div>

  <div class="divider"></div>

  <div class="details">
    <div class="detail-row">
      <span class="detail-label">Exam</span>
      <span class="detail-value">${escapeHtml(data.examTitle)}</span>
    </div>
    ${data.examDescription ? `<div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${escapeHtml(data.examDescription)}</span></div>` : ''}
    <div class="detail-row">
      <span class="detail-label">Roll Number</span>
      <span class="detail-value">${data.rollNo}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Class</span>
      <span class="detail-value">${escapeHtml(data.className)}</span>
    </div>
  </div>

  <div class="validity">
    <div class="validity-label">📅 VALID PERIOD</div>
    <div class="validity-dates">${escapeHtml(data.validFrom)} — ${escapeHtml(data.validTo)}</div>
  </div>

  <div class="footer">
    <p>This is a digitally generated admit card from ${escapeHtml(data.schoolName)}.</p>
  </div>
</div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
