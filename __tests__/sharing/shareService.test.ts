import {shareText, shareFile} from '@core/sharing/shareService';

const mockOpen = jest.fn();

jest.mock('react-native', () => ({
  Platform: {OS: 'android', select: (o: Record<string, unknown>) => o.android},
}));

jest.mock('@core/native/AriseShare', () => ({
  __esModule: true,
  default: {open: (...args: unknown[]) => mockOpen(...args)},
}));

jest.mock('@core/sharing/pdfService', () => ({
  generatePdfFromHtml: jest.fn().mockResolvedValue('/data/cache/report.pdf'),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('shareText', () => {
  it('passes message and title to native module', async () => {
    mockOpen.mockResolvedValue(true);

    await shareText('Hello world', {title: 'Greeting'});

    expect(mockOpen).toHaveBeenCalledWith({
      message: 'Hello world',
      title: 'Greeting',
      url: undefined,
    });
  });

  it('swallows errors (user dismissed share sheet)', async () => {
    mockOpen.mockRejectedValue(new Error('User cancelled'));

    await expect(shareText('test')).resolves.toBeUndefined();
  });

  it('passes url when provided', async () => {
    mockOpen.mockResolvedValue(true);

    await shareText('Check this out', {url: 'https://example.com'});

    expect(mockOpen).toHaveBeenCalledWith({
      message: 'Check this out',
      title: undefined,
      url: 'https://example.com',
    });
  });
});

describe('shareFile', () => {
  it('prepends file:// when not present', async () => {
    mockOpen.mockResolvedValue(true);

    await shareFile({filePath: '/data/cache/report.pdf', mimeType: 'application/pdf'});

    expect(mockOpen).toHaveBeenCalledWith({
      url: 'file:///data/cache/report.pdf',
      type: 'application/pdf',
      title: undefined,
      message: undefined,
    });
  });

  it('keeps existing file:// prefix', async () => {
    mockOpen.mockResolvedValue(true);

    await shareFile({filePath: 'file:///data/cache/img.png', mimeType: 'image/png', title: 'Photo'});

    expect(mockOpen).toHaveBeenCalledWith({
      url: 'file:///data/cache/img.png',
      type: 'image/png',
      title: 'Photo',
      message: undefined,
    });
  });

  it('swallows errors (user dismissed share sheet)', async () => {
    mockOpen.mockRejectedValue(new Error('Cancelled'));

    await expect(
      shareFile({filePath: '/x.pdf', mimeType: 'application/pdf'}),
    ).resolves.toBeUndefined();
  });
});
