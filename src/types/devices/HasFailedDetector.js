export const KEEP = 'KEEP';
export const DISCARD = 'DISCARD';
export const NO_MEASUREMENTS_DONE_YET = 'NO_MEASUREMENTS_DONE_YET';

function HasFailedDetector(referenceValue, allowedDiff) {
	this.referenceValue = referenceValue;
	this.allowedDiff = allowedDiff;
	this.hasFailed = false;
	this.count = 0;
}

HasFailedDetector.prototype.addNewMeasurement  = function(measurement) {
	if (this.hasFailed) {
		return;
	}

	this.count += 1;
	this.hasFailed = Math.abs(measurement - this.referenceValue) > this.allowedDiff;
};

HasFailedDetector.prototype.evalPrecision = function() {
	if (!this.count) {
		return NO_MEASUREMENTS_DONE_YET;
	}

	return this.hasFailed ? DISCARD : KEEP;
};

export default HasFailedDetector;
