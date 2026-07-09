/**
 * Sharing to other apps — thin wrapper around react-native-share.
 *
 * Covers plain text and file (PDF, image, ...) sharing through the native
 * share sheet. Everything shown — message, title, file path, mime type — is
 * supplied by the caller, so one set of functions serves any feature that
 * needs to hand content off to another app (WhatsApp, email, Drive, ...).
 *
 * File sharing on Android requires a content:// URI (a bare file:// path is
 * rejected by most apps since Android 7) — react-native-share handles that
 * via its own bundled FileProvider, so callers just pass a normal file path.
 */
import Share from 'react-native-share';
import {generatePdfFromHtml} from './pdfService';

/** Open the native share sheet with plain text (and an optional link). */
export async function shareText(message: string, options?: {title?: string; url?: string}): Promise<void> {
  try {
    await Share.open({
      message,
      title: options?.title,
      url: options?.url,
      failOnCancel: false,
    });
  } catch {
    // User dismissed the share sheet — not an error.
  }
}

/** Convenience: render HTML to a PDF, then open the share sheet with it in one call. */
export async function shareHtmlAsPdf(input: {
  html: string;
  fileName: string;
  title?: string;
  message?: string;
}): Promise<void> {
  const filePath = await generatePdfFromHtml({html: input.html, fileName: input.fileName});
  await shareFile({
    filePath,
    mimeType: 'application/pdf',
    title: input.title,
    message: input.message,
  });
}

export interface ShareFileInput {
  /** Absolute file path, e.g. the result of `generatePdfFromHtml`. */
  filePath: string;
  /** MIME type, e.g. 'application/pdf'. */
  mimeType: string;
  title?: string;
  /** Optional caption shown alongside the file in apps that support it. */
  message?: string;
}

/** Open the native share sheet with a file (PDF, image, ...). */
export async function shareFile(input: ShareFileInput): Promise<void> {
  const url = input.filePath.startsWith('file://') ? input.filePath : `file://${input.filePath}`;
  try {
    await Share.open({
      url,
      type: input.mimeType,
      title: input.title,
      message: input.message,
      failOnCancel: false,
    });
  } catch {
    // User dismissed the share sheet — not an error.
  }
}
