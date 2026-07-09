/**
 * PDF generation — thin wrapper around react-native-html-to-pdf.
 *
 * "Dynamic" here means the same as the notifications module: callers pass
 * their own HTML (a fee receipt, a report card, an attendance summary, ...)
 * and a file name, nothing is feature-specific. Any screen that needs a PDF
 * goes through this one function.
 */
import {generatePDF, type PDFOptions} from 'react-native-html-to-pdf';

export interface GeneratePdfInput {
  html: string;
  /** Without extension — react-native-html-to-pdf appends `.pdf` itself. */
  fileName: string;
  /** Defaults to the OS-appropriate documents/cache directory when omitted. */
  directory?: PDFOptions['directory'];
}

/** Render HTML to a PDF file on disk and return its absolute file path. */
export async function generatePdfFromHtml(input: GeneratePdfInput): Promise<string> {
  const result = await generatePDF({
    html: input.html,
    fileName: input.fileName,
    directory: input.directory ?? 'Documents',
    base64: false,
  });
  return result.filePath;
}
