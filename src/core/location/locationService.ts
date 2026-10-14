/**
 * Current GPS position for "where did this happen" stamps (e.g. teacher check-in).
 *
 * Best-effort by design: asks for when-in-use permission, reads one high-accuracy fix
 * with a timeout, and resolves `null` — never throws — when permission is denied,
 * location is off, or the fix times out. Callers carry on without a location.
 */
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const POSITION_TIMEOUT_MS = 10_000;
/** A fix this recent is good enough — avoids waiting on GPS twice in a row. */
const MAX_POSITION_AGE_MS = 30_000;

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }
  return new Promise(resolve => {
    Geolocation.requestAuthorization(
      () => resolve(true),
      () => resolve(false),
    );
  });
}

function isValid(c: Coordinates): boolean {
  return (
    Number.isFinite(c.latitude) &&
    Number.isFinite(c.longitude) &&
    Math.abs(c.latitude) <= 90 &&
    Math.abs(c.longitude) <= 180
  );
}

/** Current position, or `null` if it can't be had (permission denied, GPS off, timeout). */
export async function getCurrentCoordinates(): Promise<Coordinates | null> {
  if (!(await ensurePermission())) {
    return null;
  }
  return new Promise(resolve => {
    // Safety net — some devices never call back when location services are off.
    const fallback = setTimeout(() => resolve(null), POSITION_TIMEOUT_MS + 2_000);
    Geolocation.getCurrentPosition(
      pos => {
        clearTimeout(fallback);
        const coords = {latitude: pos.coords.latitude, longitude: pos.coords.longitude};
        resolve(isValid(coords) ? coords : null);
      },
      () => {
        clearTimeout(fallback);
        resolve(null);
      },
      {enableHighAccuracy: true, timeout: POSITION_TIMEOUT_MS, maximumAge: MAX_POSITION_AGE_MS},
    );
  });
}

/** URL that opens the device's maps app at a point (Apple Maps on iOS, the `geo:` handler on Android). */
export function mapsUrl({latitude, longitude}: Coordinates): string {
  return Platform.OS === 'ios'
    ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=${latitude},${longitude}`
    : `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
}
