/**
 * Excel ↔ academic-calendar rows (SheetJS). The file is parsed on the device and the rows
 * are POSTed as JSON — the file itself is never uploaded.
 *
 * Columns: title, description (optional), eventType, audience (optional), startDate, endDate (optional).
 * Values can be spreadsheet-friendly ("Govt Holiday", "Teachers", "15/08/2026", an Excel date serial);
 * the backend normalises them.
 */
import * as XLSX from 'xlsx';
import AriseShare from '@core/native/AriseShare';
import type {CalendarImportRow} from '../../shared/types';

export const TEMPLATE_HEADERS = ['title', 'description', 'eventType', 'audience', 'startDate', 'endDate'] as const;

const TEMPLATE_EXAMPLES: string[][] = [
  ['Independence Day', '', 'Govt Holiday', 'All', '15/08/2026', ''],
  ['Summer Vacation', '', 'Vacation', 'All', '20/05/2026', '30/06/2026'],
  ['Parent-Teacher Meeting', 'Term 1 review', 'PTM', 'Parents', '12/09/2026', ''],
];

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Header cell → our field ("Event Type", "event_type", "Type" → eventType). */
function fieldFor(header: string): keyof CalendarImportRow | undefined {
  const key = header.toLowerCase().replace(/[^a-z]/g, '');
  switch (key) {
    case 'title':
    case 'name':
      return 'title';
    case 'description':
    case 'details':
      return 'description';
    case 'eventtype':
    case 'type':
      return 'eventType';
    case 'audience':
      return 'audience';
    case 'startdate':
    case 'start':
    case 'from':
    case 'date':
      return 'startDate';
    case 'enddate':
    case 'end':
    case 'to':
      return 'endDate';
    default:
      return undefined;
  }
}

/** Excel date serial → "YYYY-MM-DD"; anything else → trimmed string. */
function cellToString(value: unknown, isDate: boolean): string {
  if (typeof value === 'number' && isDate) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
    }
  }
  return value == null ? '' : String(value).trim();
}

/** Read a local spreadsheet file (file:// URI) as base64 without a filesystem library. */
async function readAsBase64(uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onloadend = () => {
      const result = String(reader.result ?? '');
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });
}

/** First sheet → rows. Blank rows are skipped. Throws if the sheet has no `title` / `eventType` / `startDate` column. */
export async function readCalendarSpreadsheet(uri: string): Promise<CalendarImportRow[]> {
  const workbook = XLSX.read(await readAsBase64(uri), {type: 'base64'});
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) {
    return [];
  }
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, {header: 1, defval: '', raw: true, blankrows: false});
  if (raw.length === 0) {
    return [];
  }
  const fields = (raw[0] as unknown[]).map(h => fieldFor(String(h ?? '')));
  if (!fields.includes('title') || !fields.includes('eventType') || !fields.includes('startDate')) {
    throw new Error('MISSING_COLUMNS');
  }
  return raw
    .slice(1)
    .map(cells => {
      const row: CalendarImportRow = {title: '', eventType: '', startDate: ''};
      fields.forEach((field, i) => {
        if (field) {
          const isDate = field === 'startDate' || field === 'endDate';
          const value = cellToString((cells as unknown[])[i], isDate);
          if (value || field === 'title' || field === 'eventType' || field === 'startDate') {
            row[field] = value;
          }
        }
      });
      return row;
    })
    .filter(row => row.title || row.eventType || row.startDate);
}

/** Generate the template .xlsx and open the share sheet so the admin can save / send it. */
export async function shareCalendarTemplate(): Promise<void> {
  const sheet = XLSX.utils.aoa_to_sheet([[...TEMPLATE_HEADERS], ...TEMPLATE_EXAMPLES]);
  sheet['!cols'] = [{wch: 28}, {wch: 20}, {wch: 16}, {wch: 12}, {wch: 12}, {wch: 12}];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Calendar');
  const base64 = XLSX.write(workbook, {type: 'base64', bookType: 'xlsx'});
  await AriseShare.open({
    url: `data:${XLSX_MIME};base64,${base64}`,
    filename: 'academic-calendar-template',
    type: XLSX_MIME,
  });
}
