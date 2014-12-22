$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");

Class.forName({
	name : "class assets.js.core.setting.CenturyDecadeScaleSettings extends Object",
	"@Getter @Setter private displayDateFormat" : "YYYY",
	"@Getter @Setter private numItems" : 10,
	"@Getter @Setter private segmentWidth" : 256,
	"@Getter @Setter private segmentWidths" : 25.6,

	DecadeYearScaleSettings : function(numItems, segmentWidth, segmentWidths) {
		this.numItems = numItems;
		this.segmentWidth = segmentWidth;
		this.segmentWidths = segmentWidths || this.segmentWidth / this.numItems;
	},

	getStageWidthRatio : function() {
		return this.segmentWidths / assets.js.core.utils.AJKHelpers.dateOneYearInMS;
	},
	getFirstBlockStartDateFromDate : function(data) {
		var aDate = data.date;
		var retDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
			time : aDate.getTime()
		});
		var aYear = retDate.getFullYear(), roundedYear = 0;
		if (aYear < 0) {
			if (aYear % 100 == 0) {
				roundedYear = aYear;
			} else {
				roundedYear = parseInt(aYear / 100, 10) * 100 - 100;
			}
		} else {
			roundedYear = parseInt(aYear / 100, 10) * 100;
		}
		retDate.setFullYear(roundedYear);
		retDate.setMonth(0);
		retDate.setDate(1);
		retDate.setHours(0);
		retDate.setMinutes(0);
		retDate.setSeconds(0);
		return retDate;
	},
	getDateRangeInMS : function(data) {
		var blockStartDate = data.blockStartDate;
		var retDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
			time : blockStartDate.getTime()
		});
		retDate.setFullYear(blockStartDate.getFullYear() + 100);
		return retDate.getTime() - blockStartDate.getTime();
	},
	getTextForDate : function(data) {
		var aDate = data.date;
		var fullYear = aDate.getFullYear(), roundedFullYear = 0;
		if (fullYear >= 0) {
			roundedFullYear = parseInt((fullYear + 1) / 10, 10) * 10;
		} else {
			roundedFullYear = parseInt((fullYear - 1) / 10, 10) * 10;
		}
		aDate.setFullYear(roundedFullYear);
		return assets.js.core.utils.AJKHelpers.formatFullYearForDate({
			date : aDate
		});
	}

});
