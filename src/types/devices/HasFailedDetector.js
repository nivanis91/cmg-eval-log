export const KEEP = 'KEEP';
export const DISCARD = 'DISCARD';

function HasFailedDetector(realValue, allowedDiff) {
    this.realValue = realValue;
    this.allowedDiff = allowedDiff;
	this.hasFailed = false;
};

HasFailedDetector.prototype.addMeasurement = function (measurement) {
	if (this.hasFailed) {
		return;
	}

	this.hasFailed = Math.abs(measurement - this.realValue) > this.allowedDiff;
};

HasFailedDetector.prototype.isValid = function () {
	return this.hasFailed ? DISCARD : KEEP;
};

HasFailedDetector.prototype.toJSON = HasFailedDetector.prototype.isValid;

export default HasFailedDetector;
