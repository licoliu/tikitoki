$import("assets.js.core.utils.AJKHelpers");
Date.parseOrig = Date.parse;
Date.parse = function(input) {
	if (typeof input === "string") {
		input = input.replace("ad", "").replace("AD", "");
		var isBC = (input.toLowerCase().indexOf("bc") != -1);
		input = input.replace("bc", "").replace("BC", "");
		var largeYear = Date.AJKIsStringLargeYear(input);
		if (largeYear) {
			var retDate = new Date();
			if (isBC) {
				retDate.setFullYear(-largeYear);
			} else {
				retDate.setFullYear(largeYear);
			}
			return retDate;
		} else if (isBC) {
			var aDate = Date.parseOrig(input);
			if (!aDate) {
				return aDate;
			}
			aDate.setFullYear(-aDate.getFullYear());
			return aDate;
		} else {
			return Date.parseOrig(input);
		}
	} else {
		return Date.parseOrig(input);
	}
};
Date.STANDARDMAXFULLYEAR = 99999;
Date.MAXFULLYEAR = 999999999999;
Date.AJKLongDateActive = true;
Date.AJKIsStringLargeYear = function(input) {
	input = input.replace(/ /g, "").replace(/,/g, "");
	if (parseInt(input, 10) == input && input > Date.STANDARDMAXFULLYEAR && input < Date.MAXFULLYEAR) {
		return input;
	}
	return false;
};
Date.prototype.origSetFullYear = Date.prototype.setFullYear;
Date.prototype.setFullYear = function(fullYear) {
	if (fullYear > Date.STANDARDMAXFULLYEAR || fullYear < -Date.STANDARDMAXFULLYEAR) {
		this.setFullYear(0);
		this.ajkLongDate = true;
		this.ajkLongDateYear = fullYear;
	} else {
		this.ajkLongDate = false;
		return this.origSetFullYear(fullYear);
	}
};
Date.prototype.origGetFullYear = Date.prototype.getFullYear;
Date.prototype.getFullYear = function(fullYear) {
	return (this.ajkLongDate) ? this.ajkLongDateYear : this.origGetFullYear();
};
Date.prototype.origGetTime = Date.prototype.getTime;
Date.prototype.getTime = function(data) {
	if (!Date.AJKLongDateActive) {
		return this.origGetTime(data);
	} else {
		return (this.ajkLongDate) ? (this.ajkLongDateYear - 1970) * assets.js.core.utils.AJKHelpers.dateOneYearInMS : this.origGetTime();
	}
};
Date.prototype.origSetTime = Date.prototype.setTime;
Date.prototype.setTime = function(data) {
	if (!Date.AJKLongDateActive) {
		return this.origSetTime(data);
	} else {
		var fullYear = data / assets.js.core.utils.AJKHelpers.dateOneYearInMS + 1970;
		if (fullYear > Date.STANDARDMAXFULLYEAR || fullYear < -Date.STANDARDMAXFULLYEAR) {
			this.ajkLongDate = true;
			this.ajkLongDateYear = fullYear;
		} else {
			this.ajkLongDate = false;
			return this.origSetTime(data);
		}
	}
};