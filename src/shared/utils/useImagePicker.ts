import {useState, useCallback} from 'react';
import {NativeModules, PermissionsAndroid, Platform} from 'react-native';

const {ImagePicker} = NativeModules;

export type ImageSource = 'gallery' | 'camera';

export interface PickedImage {
  uri: string;
  type: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
}

export interface CompressOptions {
  maxSize?: number;
  quality?: number;
}

const DEFAULT_COMPRESS: CompressOptions = {maxSize: 1600, quality: 80};

async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera Permission',
      message: 'App needs camera access to take photos.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

async function pickRaw(source: ImageSource): Promise<PickedImage> {
  if (source === 'camera') {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) throw {code: 'PERMISSION_DENIED', message: 'Camera permission denied'};
    return await ImagePicker.captureImage();
  }
  return await ImagePicker.pickImage();
}

async function compressIfNeeded(
  image: PickedImage,
  opts: CompressOptions,
): Promise<PickedImage> {
  const {maxSize = 1600, quality = 80} = opts;
  return await ImagePicker.compressImage(image.uri, maxSize, quality);
}

export function useImagePicker(compressOptions?: CompressOptions) {
  const [loading, setLoading] = useState(false);

  const pick = useCallback(
    async (
      source: ImageSource,
      opts?: {compress?: boolean | CompressOptions},
    ): Promise<PickedImage | null> => {
      try {
        setLoading(true);
        const raw = await pickRaw(source);

        const shouldCompress = opts?.compress !== false;
        if (!shouldCompress) return raw;

        const cOpts =
          typeof opts?.compress === 'object'
            ? opts.compress
            : (compressOptions ?? DEFAULT_COMPRESS);
        return await compressIfNeeded(raw, cOpts);
      } catch (e: any) {
        if (e?.code === 'CANCELLED') return null;
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [compressOptions],
  );

  const pickFromGallery = useCallback(
    (opts?: {compress?: boolean | CompressOptions}) => pick('gallery', opts),
    [pick],
  );

  const pickFromCamera = useCallback(
    (opts?: {compress?: boolean | CompressOptions}) => pick('camera', opts),
    [pick],
  );

  return {pick, pickFromGallery, pickFromCamera, loading};
}
