export const ULTRA_PRECISE = 'ULTRA_PRECISE';
export const VERY_PRECISE = 'VERY_PRECISE';
export const PRECISE = 'PRECISE';
export const NO_MEASUREMENTS_DONE_YET = 'NO_MEASUREMENTS_DONE_YET';

function Thermometer(referenceValue) {
	this.referenceValue = referenceValue;
	this.average = 0;
	this.lastAverage = null;
	this.variance = 0;
	this.count = 0;
}

Thermometer.prototype.addNewMeasurement  = function(measurement) {
	this.count += 1;
	this.lastAverage = this.average;
	this.average = this.average + (measurement - this.average) / this.count;
	this.variance = this.variance + (measurement - this.lastAverage) * (measurement - this.average);
};

Thermometer.prototype.getStandardDeviation = function() {
	return Math.sqrt(this.variance / (this.count - 1));
};

Thermometer.prototype.evalPrecision = function() {
	if (!this.count) {
		return NO_MEASUREMENTS_DONE_YET;
	}

	const stDev = this.getStandardDeviation();

	const meanPrecise = Math.abs(this.average - this.referenceValue);

	if (meanPrecise < 0.5) {
		if (stDev < 3) {
			return ULTRA_PRECISE;
		} else if (stDev < 5) {
			return VERY_PRECISE;
		}
	}

	return PRECISE;
};

export default Thermometer;
