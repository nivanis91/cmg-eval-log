import {
	evaluateLogFile,
	getLinesArrayFromString,
	getReferenceDataAsObjectFromArray,
	createNewDeviceMeasurementsCollector,
	Thermometer,
	HasFailedDetector,
	evaluateLogFileReducer,
} from '../build/cmg_func';

import {
	HUMIDITY,
	MONOXIDE,
	THERMOMETER,
} from './constants';

import {
	ULTRA_PRECISE,
	VERY_PRECISE,
	PRECISE,
	NO_MEASUREMENTS_DONE_YET,
} from './types/devices/Thermometer';
import {
	KEEP,
	DISCARD,
} from './types/devices/HasFailedDetector';

const sampleLogStr = 'reference 70.0 45.0 6\r\nthermometer temp-1\r\n2007-04-05T22:00 70.2';

test('empty log string results in empty object', () => {
	expect(evaluateLogFile('')).toMatchObject({});
});

test('result object matches expected format', () => {
	expect(evaluateLogFile(sampleLogStr)).toMatchObject({'temp-1': PRECISE});
});

test('ref values are mapped to object keys', () => {
	const testInitLine = ['reference', '15', '22.3', '9'];
	const referenceDataObject = getReferenceDataAsObjectFromArray(testInitLine);

	expect(Object.keys(referenceDataObject).length).toEqual(3);
});

test('appropriate device object is created for given name', () => {
	const thermometer = createNewDeviceMeasurementsCollector(THERMOMETER);

	expect(thermometer instanceof Thermometer).toEqual(true);

	const monoxideDetector = createNewDeviceMeasurementsCollector(MONOXIDE);

	expect(monoxideDetector instanceof HasFailedDetector).toEqual(true);

	const humidityDetector = createNewDeviceMeasurementsCollector(HUMIDITY);

	expect(humidityDetector instanceof HasFailedDetector).toEqual(true);
});

test('will logFile be split to array of lines (\\r\\n as lineBreak)', () => {
	expect(getLinesArrayFromString(sampleLogStr).length).toEqual(3);
});

test('Thermometer validation works properly', () => {
	const thermometer1 = createNewDeviceMeasurementsCollector(THERMOMETER, 70);

	thermometer1.addNewMeasurement(69.5);
	thermometer1.addNewMeasurement(70.1);
	thermometer1.addNewMeasurement(71.3);
	thermometer1.addNewMeasurement(71.5);
	thermometer1.addNewMeasurement(69.8);
	expect(thermometer1.evalPrecision()).toEqual(ULTRA_PRECISE);

	const thermometer2 = createNewDeviceMeasurementsCollector(THERMOMETER, 70);

	thermometer2.addNewMeasurement(69.5);
	thermometer2.addNewMeasurement(70.1);
	thermometer2.addNewMeasurement(64);
	thermometer2.addNewMeasurement(76);
	expect(thermometer2.evalPrecision()).toEqual(VERY_PRECISE);

	const thermometer3 = createNewDeviceMeasurementsCollector(THERMOMETER, 70);

	thermometer3.addNewMeasurement(75);
	thermometer3.addNewMeasurement(78);
	thermometer3.addNewMeasurement(71);
	thermometer3.addNewMeasurement(68);
	expect(thermometer3.evalPrecision()).toEqual(PRECISE);
});

test('MonoxideDetector validation works properly', () => {
	const monoxideDetector = createNewDeviceMeasurementsCollector(MONOXIDE, 6);

	monoxideDetector.addNewMeasurement(5);
	monoxideDetector.addNewMeasurement(7);
	monoxideDetector.addNewMeasurement(9);
	expect(monoxideDetector.evalPrecision()).toEqual(KEEP);

	const monoxideDetector2 = createNewDeviceMeasurementsCollector(MONOXIDE, 6);

	monoxideDetector2.addNewMeasurement(2);
	monoxideDetector2.addNewMeasurement(4);
	monoxideDetector2.addNewMeasurement(10);
	monoxideDetector2.addNewMeasurement(8);
	monoxideDetector2.addNewMeasurement(6);
	expect(monoxideDetector2.evalPrecision()).toEqual(DISCARD);
});

test('HumidityDetector validation works properly', () => {
	const humidityDetector = createNewDeviceMeasurementsCollector(HUMIDITY, 45.0);

	humidityDetector.addNewMeasurement(44.4);
	humidityDetector.addNewMeasurement(43.9);
	humidityDetector.addNewMeasurement(44.9);
	humidityDetector.addNewMeasurement(43.8);
	humidityDetector.addNewMeasurement(42.1);
	expect(humidityDetector.evalPrecision()).toEqual(DISCARD);

	const humidityDetector2 = createNewDeviceMeasurementsCollector(HUMIDITY, 45.0);

	humidityDetector2.addNewMeasurement(45.2);
	humidityDetector2.addNewMeasurement(45.3);
	humidityDetector2.addNewMeasurement(45.1);
	expect(humidityDetector2.evalPrecision()).toEqual(KEEP);
});

const evaluateLogFileReducerAccInitVal = {
	result: {},
	currentDeviceName: null,
	referenceDataPerType: {
		THERMOMETER: 70.0,
	},
};

test('evalLogFileReducer adds new device to result', () => {
	const addNewDeviceLine1 = ['thermometer', 'temp-1'];
	const addNewDeviceLine2 = ['thermometer', 'temp-2'];

	let evaluateLogFileReducerAcc = evaluateLogFileReducer(evaluateLogFileReducerAccInitVal, addNewDeviceLine1);

	expect(Object.keys(evaluateLogFileReducerAcc.result).length).toEqual(1);

	evaluateLogFileReducerAcc = evaluateLogFileReducer(evaluateLogFileReducerAccInitVal, addNewDeviceLine2);
	expect(Object.keys(evaluateLogFileReducerAcc.result).length).toEqual(2);
});

test('evalLogFileReducer adds new measurement for given device', () => {
	const deviceType = THERMOMETER;
	const deviceName = 'temp-1';
	const addNewDeviceLine = [deviceType, deviceName];
	const addNewMeasurementLine = ['2007-04-05T22:00', '70.2'];

	let evaluateLogFileReducerAcc = evaluateLogFileReducer(evaluateLogFileReducerAccInitVal, addNewDeviceLine);
	expect(evaluateLogFileReducerAcc.result[deviceName].evalPrecision()).toEqual(NO_MEASUREMENTS_DONE_YET);

	evaluateLogFileReducerAcc = evaluateLogFileReducer(evaluateLogFileReducerAcc, addNewMeasurementLine);
	expect(evaluateLogFileReducerAcc.result[deviceName].evalPrecision()).not.toEqual(NO_MEASUREMENTS_DONE_YET);
});
