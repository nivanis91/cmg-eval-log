import Thermometer from './types/devices/Thermometer';
import HasFailedDetector from './types/devices/HasFailedDetector';
import {
    HUMIDITY,
    MONOXIDE, 
    THERMOMETER
} from './constants';

export function readCurrentData(initLine) {
    const elems = initLine.split(' ');

    return {
        [THERMOMETER]: elems[1],
        [HUMIDITY]: elems[2],
        [MONOXIDE]: elems[3],
    };
};

export function getLinesArrayFromString(logStr) {
    return logStr.split('\r\n');
};

export function addDevice(deviceName, currentValue) {
    switch (deviceName) {
        case THERMOMETER:
            return new Thermometer(currentValue);
        case HUMIDITY:
            return new HasFailedDetector(currentValue, 1);
        case MONOXIDE:
            return new HasFailedDetector(currentValue, 3);
        default:
            break;
    }
}

var devices = [THERMOMETER, HUMIDITY, MONOXIDE];

function evaluateLogFile(logStr) {
    if(!logStr) {
        return {};
    }
    
    const linesArray = getLinesArrayFromString(logStr);
    
    const currentData = readCurrentData(linesArray[0]);
    linesArray.shift();

    let result = {};
    let currentDevice = null;

    linesArray.forEach(line => {
        const lineElements = line.split(' ');

        if (devices.indexOf(lineElements[0]) > -1) {
            currentDevice = lineElements[1];

            // prevent overwriting in case the same device appears later in log
            if (!result[currentDevice]) {
                const deviceName = lineElements[0];
                const currentValue = currentData[deviceName];

                result[currentDevice] = addDevice(deviceName, currentValue);
            }

            return;
        }
    
        result[currentDevice].addMeasurement(lineElements[1]);
    });

    return result;
};

export {Thermometer, HasFailedDetector};
export default evaluateLogFile;
