$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");

Class.forName({
	name : "class assets.js.core.setting.DecadeYearScaleSettings extends Object",
	"@Getter @Setter private displayDateFormat" : "YYYY",
	"@Getter @Setter private numItems" : 10,
	"@Getter @Setter private segmentWidth" : 64,

	DecadeYearScaleSettings : function(numItems, segmentWidth, segmentWidths) {
		this.numItems = numItems;
		this.segmentWidth = segmentWidth;
		this.segmentWidths = segmentWidths;
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
			if (aYear % 10 == 0) {
				roundedYear = aYear;
			} else {
				roundedYear = parseInt(aYear / 10, 10) * 10 - 10;
			}
		} else {
			roundedYear = parseInt(aYear / 10, 10) * 10;
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
		retDate.setFullYear(blockStartDate.getFullYear() + 10);
		return retDate.getTime() - blockStartDate.getTime();
	},
	getTextForDate : function(data) {
		var aDate = data.date;
		var month = aDate.getMonth();
		if (month > 9) {
			var newDate = assets.js.core.utils.AJKHelpers.cloneDate({
				date : aDate
			});
			newDate.setFullYear(aDate.getFullYear() + 1);
			aDate = newDate;
		}
		return assets.js.core.utils.AJKHelpers.formatFullYearForDate({
			date : aDate
		});
	}

});
