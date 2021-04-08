import { NativeModules } from 'react-native';

const tuya = NativeModules.TuyaCoreModule;

export type ApiRequestParams = {
  apiName: string;
  version: string;
  getData?: any;
  postData?: any;
};

export function apiRequest(params: ApiRequestParams): Promise<any> {
  return tuya.apiRequest(params);
}
