export const ULTRA_PRECISE = 'ULTRA_PRECISE';
export const VERY_PRECISE = 'VERY_PRECISE';
export const PRECISE = 'PRECISE';

function Thermometer(realTemperature) {
    this.realTemperature = realTemperature;
	this.workData = 0;
	this.lastWorkData = null;
	this.S = 0;
	this.count = 0;
}

Thermometer.prototype.addMeasurement = function (measurement) {
	this.count += 1;
	this.lastWorkData = this.workData;
	this.workData = this.workData + (measurement - this.workData) / this.count;
	this.S = this.S + (measurement - this.lastWorkData) * (measurement - this.workData);
};

Thermometer.prototype.getStandardDeviation = function () {
	return Math.sqrt(this.S / (this.count - 1));
};

Thermometer.prototype.calcPrecision = function () {
	var stDev = this.getStandardDeviation();

	var meanPrecise = Math.abs(this.workData - this.realTemperature);
	
	if(meanPrecise < 0.5) {
		if (stDev < 3) {
			return ULTRA_PRECISE;
		} else if (stDev < 5) {
			return VERY_PRECISE;
		}
	}

	return PRECISE;
};

Thermometer.prototype.toJSON = Thermometer.prototype.calcPrecision;

export default Thermometer;
