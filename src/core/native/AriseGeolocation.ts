import {NativeModules} from 'react-native';

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
    speed: number;
    heading: number;
  };
  timestamp: number;
}

interface AriseGeolocationModule {
  getCurrentPosition(
    enableHighAccuracy: boolean,
    timeout: number,
    maximumAge: number,
  ): Promise<GeolocationPosition>;
}

const {AriseGeolocation} = NativeModules;

export default AriseGeolocation as AriseGeolocationModule;
