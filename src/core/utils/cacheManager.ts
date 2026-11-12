import {NativeModules} from 'react-native';

const {CacheManager} = NativeModules;

export interface CacheSize {
  internal: number;
  external: number;
  total: number;
  formatted: string;
}

export interface ClearResult {
  freedBytes: number;
  freedFormatted: string;
  success: boolean;
}

export interface StorageInfo {
  cacheSize: number;
  cacheSizeFormatted: string;
  dataSize: number;
  dataSizeFormatted: string;
  totalSize: number;
  totalSizeFormatted: string;
}

export interface ImageCacheSize {
  bytes: number;
  formatted: string;
}

export const cacheManager = {
  getCacheSize(): Promise<CacheSize> {
    return CacheManager.getCacheSize();
  },

  clearCache(): Promise<ClearResult> {
    return CacheManager.clearCache();
  },

  clearExpiredCache(maxAgeMs: number): Promise<ClearResult> {
    return CacheManager.clearExpiredCache(maxAgeMs);
  },

  getAppStorageInfo(): Promise<StorageInfo> {
    return CacheManager.getAppStorageInfo();
  },

  cacheImage(remoteUrl: string): Promise<string> {
    return CacheManager.cacheImage(remoteUrl);
  },

  getCachedImage(remoteUrl: string): Promise<string | null> {
    return CacheManager.getCachedImage(remoteUrl);
  },

  removeCachedImage(remoteUrl: string): Promise<boolean> {
    return CacheManager.removeCachedImage(remoteUrl);
  },

  clearImageCache(): Promise<ClearResult> {
    return CacheManager.clearImageCache();
  },

  getImageCacheSize(): Promise<ImageCacheSize> {
    return CacheManager.getImageCacheSize();
  },
};
