import {useState, useEffect, useRef} from 'react';
import {cacheManager} from './cacheManager';

export function useCachedImage(remoteUrl: string | undefined | null): string | undefined {
  const [localUri, setLocalUri] = useState<string | undefined>();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!remoteUrl) {
      setLocalUri(undefined);
      lastUrl.current = null;
      return;
    }

    if (remoteUrl.startsWith('file://')) {
      setLocalUri(remoteUrl);
      lastUrl.current = remoteUrl;
      return;
    }

    if (remoteUrl === lastUrl.current) return;
    lastUrl.current = remoteUrl;

    let cancelled = false;

    (async () => {
      try {
        const cached = await cacheManager.getCachedImage(remoteUrl);
        if (cancelled) return;

        if (cached) {
          setLocalUri(cached);
          cacheManager.cacheImage(remoteUrl).catch(() => {});
          return;
        }

        const downloaded = await cacheManager.cacheImage(remoteUrl);
        if (!cancelled) setLocalUri(downloaded);
      } catch {
        if (!cancelled) setLocalUri(remoteUrl);
      }
    })();

    return () => { cancelled = true; };
  }, [remoteUrl]);

  return localUri;
}
