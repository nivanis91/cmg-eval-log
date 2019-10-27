import Thermometer from './types/devices/Thermometer';
import HasFailedDetector from './types/devices/HasFailedDetector';
import {
	HUMIDITY,
	MONOXIDE,
	THERMOMETER,
	UNKNOWN_DEVICE,
} from './constants';

export function getReferenceDataAsObjectFromArray(referenceValuesArray) {
	if (referenceValuesArray[0] === 'reference') {
		return {
			[THERMOMETER]: referenceValuesArray[1],
			[HUMIDITY]: referenceValuesArray[2],
			[MONOXIDE]: referenceValuesArray[3],
		};
	}

	return {};
}

export function getLinesArrayFromString(logStr) {
	const linesArray = logStr.split('\r\n');

	return linesArray.reduce((acc, line) => {
		acc.push(line.split(' '));

		return acc;
	}, []);
}

export function createNewDeviceMeasurementsCollector(deviceType, referenceValue) {
	switch (deviceType) {
		case THERMOMETER:
			return new Thermometer(referenceValue);
		case HUMIDITY:
			return new HasFailedDetector(referenceValue, 1);
		case MONOXIDE:
			return new HasFailedDetector(referenceValue, 3);
		default:
			break;
	}
}

const deviceTypesList = [THERMOMETER, HUMIDITY, MONOXIDE];

export function evaluateLogFile(logStr, refData) {
	if (!logStr) {
		return {};
	}

	const logFileLinesArray = getLinesArrayFromString(logStr);

	const evaluateLogFileReducerAccInitVal = {
		result: {},
		currentDeviceName: null,
		referenceDataPerType: refData || getReferenceDataAsObjectFromArray(logFileLinesArray[0])
	};

	const logFileLinesReduced = logFileLinesArray.reduce(evaluateLogFileReducer, evaluateLogFileReducerAccInitVal);

	return Object.keys(logFileLinesReduced.result).reduce((acc, key) => {
		acc[key] = logFileLinesReduced.result[key].evalPrecision();

		return acc;
	}, {});
}

export function evaluateLogFileReducer({result, currentDeviceName, referenceDataPerType}, lineArray) {
	if (deviceTypesList.includes(lineArray[0])) {
		currentDeviceName = lineArray[1];

		// prevent overwriting in case the same device appeared earlier in the log
		if (!result[currentDeviceName]) {
			const deviceType = lineArray[0];
			const referenceValue = referenceDataPerType[deviceType];

			result[currentDeviceName] = createNewDeviceMeasurementsCollector(deviceType, referenceValue);
		}
	} else if (currentDeviceName &&
              result[currentDeviceName] &&
              currentDeviceName !== UNKNOWN_DEVICE) {
		const measurementValue = lineArray[1];

		result[currentDeviceName].addNewMeasurement(measurementValue);
	} else {
		currentDeviceName = UNKNOWN_DEVICE;
	}

	return {result, currentDeviceName, referenceDataPerType};
}

export {Thermometer, HasFailedDetector};
