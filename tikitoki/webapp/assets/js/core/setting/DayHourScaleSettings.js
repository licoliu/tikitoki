$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");

Class.forName({
	name : "class assets.js.core.setting.DayHourScaleSettings extends Object",

	"@Getter @Setter private segmentWidths" : 64,

	DayHourScaleSettings : function(segmentWidths) {
		this.segmentWidths = segmentWidths;
	},

	getStageWidthRatio : function() {
		return this.segmentWidths / assets.js.core.utils.AJKHelpers.dateOneHourInMS;
	},
	getFirstBlockStartDateFromDate : function(data) {
		var aDate = data.date;
		var retDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
			time : aDate.getTime()
		});
		retDate.setHours(0);
		retDate.setMinutes(0);
		retDate.setSeconds(0);
		return retDate;
	},
	getDateRangeInMS : function(data) {
		var blockStartDate = data.blockStartDate;
		var retDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
			time : blockStartDate.getTime() + assets.js.core.utils.AJKHelpers.dateOneDayInMS
		});
		retDate.setMinutes(0);
		retDate.setSeconds(0);
		return retDate.getTime() - blockStartDate.getTime();
	},
	getTextForDate : function(data) {
		var aDate = data.date;
		if (aDate.getHours() > 20) {
			aDate.setTime(aDate.getTime() + assets.js.core.utils.AJKHelpers.dateOneDayInMS);
			aDate.setHours(0);
		}
		return aDate.getDate() + " " + assets.js.core.utils.AJKHelpers.dateMonthsShortArray[aDate.getMonth()];
	}

});
