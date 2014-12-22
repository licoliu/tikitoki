$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");

Class.forName({
	name : "class assets.js.core.setting.MilleniumCenturyScaleSettings extends Object",
	"@Getter @Setter private displayDateFormat" : "YYYY",
	"@Getter @Setter private numItems" : 10,
	"@Getter @Setter private segmentWidth" : 256,
	"@Getter @Setter private blockDateRange" : 1000,
	"@Getter @Setter private largeDivider" : 10000,

	MilleniumCenturyScaleSettings : function(segmentWidth, largeDivider) {
		this.segmentWidth = segmentWidth;

		if (largeDivider) {
			this.largeDivider = largeDivider;
			this.blockDateRange = largeDivider / 10;
		}
	},

	getStageWidthRatio : function() {
		return this.segmentWidth * 100 / assets.js.core.utils.AJKHelpers.dateOneYearInMS / this.largeDivider;
	},
	getFirstBlockStartDateFromDate : function(data) {
		var aDate = data.date;
		var retDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
			time : aDate.getTime()
		});
		var aYear = retDate.getFullYear();
		if (aYear < 0) {
			if (aYear % 1000 == 0) {
				var roundedYear = aYear;
			} else {
				var roundedYear = parseInt(aYear / this.blockDateRange, 10) * this.blockDateRange - this.blockDateRange;
			}
		} else {
			var roundedYear = parseInt(aYear / this.blockDateRange, 10) * this.blockDateRange;
		}
		retDate.setFullYear(roundedYear);
		retDate.setMonth(0);
		retDate.setDate(1);
		retDate.setHours(0);
		retDate.setMinutes(0);
		retDate.setSeconds(0);
		retDate.setMilliseconds(0);
		return retDate;
	},
	getDateRangeInMS : function(data) {
		var blockStartDate = data.blockStartDate;
		var retDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
			time : blockStartDate.getTime()
		});
		retDate.setFullYear(blockStartDate.getFullYear() + this.blockDateRange);
		return retDate.getTime() - blockStartDate.getTime();
	},
	getTextForDate : function(data) {
		var aDate = data.date;
		var fullYear = aDate.getFullYear();
		if (fullYear >= 0) {
			var roundedFullYear = parseInt((fullYear + (this.blockDateRange / 100)) / (this.blockDateRange / 10), 10) * (this.blockDateRange / 10);
		} else {
			var roundedFullYear = parseInt((fullYear - (this.blockDateRange / 100)) / (this.blockDateRange / 10), 10) * (this.blockDateRange / 10);
		}
		aDate.setFullYear(roundedFullYear);
		return assets.js.core.utils.AJKHelpers.formatFullYearForDate({
			date : aDate
		});
	},

});
