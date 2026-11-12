import {NativeModules} from 'react-native';

interface ShareOptions {
  message?: string;
  url?: string;
  type?: string;
  title?: string;
  filename?: string;
}

interface AriseShareModule {
  open(options: ShareOptions): Promise<boolean>;
}

const {AriseShare} = NativeModules;

export default AriseShare as AriseShareModule;
