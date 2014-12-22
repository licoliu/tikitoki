$import("assets.js.core.utils.AJKHelpers");

Class.forName({
	name : "class assets.js.core.utils.Date extends Object",
	alias : "Date",

	"public static parseOrig" : Date.parse,
	"public static parse" : function(input) {
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
	},

	"public static STANDARDMAXFULLYEAR" : 99999,
	"public static MAXFULLYEAR" : 999999999999,
	"public static AJKLongDateActive" : true,
	"public static AJKIsStringLargeYear" : function(input) {
		input = input.replace(/ /g, "").replace(/,/g, "");
		if (parseInt(input, 10) == input && input > Date.STANDARDMAXFULLYEAR && input < Date.MAXFULLYEAR) {
			return input;
		}
		return false;
	},

	origSetFullYear : Date.prototype.setFullYear,
	setFullYear : function(fullYear) {
		if (fullYear > Date.STANDARDMAXFULLYEAR || fullYear < -Date.STANDARDMAXFULLYEAR) {
			this.setFullYear(0);
			this.ajkLongDate = true;
			this.ajkLongDateYear = fullYear;
		} else {
			this.ajkLongDate = false;
			return this.origSetFullYear(fullYear);
		}
	},
	origGetFullYear : Date.prototype.getFullYear,
	getFullYear : function(fullYear) {
		return (this.ajkLongDate) ? this.ajkLongDateYear : this.origGetFullYear();
	},
	origGetTime : Date.prototype.getTime,
	getTime : function(data) {
		if (!Date.AJKLongDateActive) {
			return this.origGetTime(data);
		} else {
			return (this.ajkLongDate) ? (this.ajkLongDateYear - 1970) * assets.js.core.utils.AJKHelpers.dateOneYearInMS : this.origGetTime();
		}
	},
	origSetTime : Date.prototype.setTime,
	setTime : function(data) {
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
	}

});
