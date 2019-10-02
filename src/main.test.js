import {
  default as evaluateLogFile, 
  getLinesArrayFromString, 
  readCurrentData,
  addDevice,
  Thermometer,
  HasFailedDetector
} from '../build/cmg_func';

import {
  HUMIDITY,
  MONOXIDE, 
  THERMOMETER
} from './constants';

import {
  ULTRA_PRECISE,
  VERY_PRECISE,
  PRECISE
} from './types/devices/Thermometer';
import {
  KEEP,
  DISCARD
} from './types/devices/HasFailedDetector';

test('empty log string results in empty object', () => {
  expect(evaluateLogFile('')).toMatchObject({});
});

test('readInitLine maps all values to object keys', () => {
    const testInitLine = "reference 15 22.3 9"
    const currentData = readCurrentData(testInitLine);

    expect(Object.keys(currentData).length).toEqual(3);
});

test('appropriate device objectis created for given name', () => {
    const thermometer = addDevice(THERMOMETER);
    expect(thermometer instanceof Thermometer).toEqual(true);

    const monoxideDetector = addDevice(MONOXIDE);
    expect(monoxideDetector instanceof HasFailedDetector).toEqual(true);

    const humidityDetector = addDevice(HUMIDITY);
    expect(humidityDetector instanceof HasFailedDetector).toEqual(true);
});

test('will logFile be split to array of lines (\\r\\n as lineBreak)', () => {
  const sampleLog = 'reference 70.0 45.0 6\r\nthermometer temp-1\r\n2007-04-05T22:00 72.4';

  expect(getLinesArrayFromString(sampleLog).length).toEqual(3);
});

test('Thermometer validation works properly', () => {
  const thermometer1 = addDevice(THERMOMETER, 70);
  thermometer1.addMeasurement(69.5);
  thermometer1.addMeasurement(70.1);
  thermometer1.addMeasurement(71.3);
  thermometer1.addMeasurement(71.5);
  thermometer1.addMeasurement(69.8);
  expect(thermometer1.calcPrecision()).toEqual(ULTRA_PRECISE);

  const thermometer2 = addDevice(THERMOMETER, 70);
  thermometer2.addMeasurement(69.5);
  thermometer2.addMeasurement(70.1);
  thermometer2.addMeasurement(64);
  thermometer2.addMeasurement(76);
  expect(thermometer2.calcPrecision()).toEqual(VERY_PRECISE);

  const thermometer3 = addDevice(THERMOMETER, 70);
  thermometer3.addMeasurement(75);
  thermometer3.addMeasurement(78);
  thermometer3.addMeasurement(71);
  thermometer3.addMeasurement(68);  
  expect(thermometer3.calcPrecision()).toEqual(PRECISE);
});

test('MonoxideDetector validation works properly', () => {
  const monoxideDetector = addDevice(MONOXIDE, 6);
  monoxideDetector.addMeasurement(5);
  monoxideDetector.addMeasurement(7);
  monoxideDetector.addMeasurement(9);
  expect(monoxideDetector.isValid()).toEqual(KEEP);
 
  const monoxideDetector2 = addDevice(MONOXIDE, 6);
  monoxideDetector2.addMeasurement(2);
  monoxideDetector2.addMeasurement(4);
  monoxideDetector2.addMeasurement(10);
  monoxideDetector2.addMeasurement(8);
  monoxideDetector2.addMeasurement(6);
  expect(monoxideDetector2.isValid()).toEqual(DISCARD);
});

test('HumidityDetector validation works properly', () => {
  const humidityDetector = addDevice(HUMIDITY, 45.0);
  humidityDetector.addMeasurement(44.4);
  humidityDetector.addMeasurement(43.9);
  humidityDetector.addMeasurement(44.9);
  humidityDetector.addMeasurement(43.8);
  humidityDetector.addMeasurement(42.1);
  expect(humidityDetector.isValid()).toEqual(DISCARD);
  
  const humidityDetector2 = addDevice(HUMIDITY, 45.0);
  humidityDetector2.addMeasurement(45.2);
  humidityDetector2.addMeasurement(45.3);
  humidityDetector2.addMeasurement(45.1);
  expect(humidityDetector2.isValid()).toEqual(KEEP);
});
