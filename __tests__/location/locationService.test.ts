import {getCurrentCoordinates, mapsUrl} from '@core/location/locationService';

const mockGetCurrentPosition = jest.fn();

jest.mock('react-native', () => ({
  Platform: {OS: 'android', select: (o: Record<string, unknown>) => o.android},
  PermissionsAndroid: {
    request: jest.fn().mockResolvedValue('granted'),
    PERMISSIONS: {ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION'},
    RESULTS: {GRANTED: 'granted'},
  },
}));

jest.mock('@core/native/AriseGeolocation', () => ({
  __esModule: true,
  default: {getCurrentPosition: (...args: unknown[]) => mockGetCurrentPosition(...args)},
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getCurrentCoordinates', () => {
  it('returns coords from a successful fix', async () => {
    mockGetCurrentPosition.mockResolvedValue({
      coords: {latitude: 26.9124, longitude: 75.7873, altitude: 0, accuracy: 5, speed: 0, heading: 0},
      timestamp: Date.now(),
    });

    const result = await getCurrentCoordinates();

    expect(result).toEqual({latitude: 26.9124, longitude: 75.7873});
    expect(mockGetCurrentPosition).toHaveBeenCalledWith(true, 10_000, 30_000);
  });

  it('returns null when the native module rejects (GPS off / timeout)', async () => {
    mockGetCurrentPosition.mockRejectedValue(new Error('TIMEOUT'));

    const result = await getCurrentCoordinates();

    expect(result).toBeNull();
  });

  it('returns null for out-of-range coordinates', async () => {
    mockGetCurrentPosition.mockResolvedValue({
      coords: {latitude: 999, longitude: 999, altitude: 0, accuracy: 0, speed: 0, heading: 0},
      timestamp: Date.now(),
    });

    const result = await getCurrentCoordinates();

    expect(result).toBeNull();
  });

  it('returns null when permission is denied', async () => {
    const {PermissionsAndroid} = jest.requireMock('react-native');
    PermissionsAndroid.request.mockResolvedValueOnce('denied');

    const result = await getCurrentCoordinates();

    expect(result).toBeNull();
    expect(mockGetCurrentPosition).not.toHaveBeenCalled();
  });
});

describe('mapsUrl', () => {
  it('produces a geo: URL on Android', () => {
    const url = mapsUrl({latitude: 26.9124, longitude: 75.7873});
    expect(url).toBe('geo:26.9124,75.7873?q=26.9124,75.7873');
  });
});
