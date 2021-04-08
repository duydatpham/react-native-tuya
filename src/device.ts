import { NativeModules, EmitterSubscription } from 'react-native';
import { addEvent, bridge, DEVLISTENER } from './bridgeUtils';

const tuya = NativeModules.TuyaDeviceModule;

export type DevListenerParams = {
  devId: string;
};

export type DevListenerType =
  | 'onDpUpdate'
  | 'onRemoved'
  | 'onStatusChanged'
  | 'onNetworkStatusChanged'
  | 'onDevInfoUpdate'
  | 'onFirmwareUpgradeSuccess'
  | 'onFirmwareUpgradeFailure'
  | 'onFirmwareUpgradeProgress';

let devListenerSubs: { [devId: string]: EmitterSubscription } = {};

export function registerDevListener(
  params: DevListenerParams,
  type: DevListenerType,
  callback: (data: any) => void
) {
  if (!!devListenerSubs[params.devId] && !!devListenerSubs[params.devId][type]) {
    unRegisterDevListener(params.devId, type);
  }

  if (!devListenerSubs[params.devId] || Object.keys(devListenerSubs[params.devId]).length == 0)
    tuya.registerDevListener(params);
  const sub = addEvent(bridge(DEVLISTENER, params.devId), data => {
    if (data.type === type) {
      callback(data);
    }
  });
  if (!devListenerSubs[params.devId]) {
    devListenerSubs[params.devId] = {}
  }
  devListenerSubs[params.devId][type] = sub;
}

export function unRegisterAllDevListeners() {
  for (const devId in devListenerSubs) {
    const sub = devListenerSubs[devId];
    sub.remove();
    tuya.unRegisterDevListener({ devId });
  }
  devListenerSubs = {};
}

export function unRegisterDevListener(devId: string, type: DevListenerType) {
  if (!devListenerSubs[devId] || !devListenerSubs[devId][type]) {
    return
  }
  const sub = devListenerSubs[devId][type];
  sub.remove();

  delete devListenerSubs[devId][type]
  if (!devListenerSubs[devId] || Object.keys(devListenerSubs[devId]).length == 0)
    tuya.unRegisterDevListener({ devId });
}

export type DeviceDpValue = boolean | number | string;
export type DeviceDps = {
  [dpId: string]: DeviceDpValue;
};
export type SendParams = {
  devId: string;
} & DeviceDps;

export function send(params: object) {
  return tuya.send(params);
}

export type RemoveDeviceParams = { devId: string };

export function removeDevice(params: RemoveDeviceParams): Promise<string> {
  return tuya.removeDevice(params);
}

export type RenameDeviceParams = { devId: string; name: string };

export function renameDevice(params: RenameDeviceParams): Promise<string> {
  return tuya.renameDevice(params);
}

export type GetDataPointStatsParams = {
  devId: string;
  DataPointTypeEnum: 'DAY' | 'WEEK' | 'MONTH';
  number: number; // number of historical data result values, up to 50
  dpId: string;
  startTime: number; // in ms
};

export function getDataPointStat(
  params: GetDataPointStatsParams
): Promise<any> {
  return tuya.getDataPointStat(params);
}
