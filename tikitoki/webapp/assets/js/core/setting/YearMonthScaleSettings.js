$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");

Class.forName({
	name : "class assets.js.core.setting.YearMonthScaleSettings extends Object",
	"@Getter @Setter private displayDateFormat" : "MMMM YYYY",
	"@Getter @Setter private numItems" : 12,
	"@Getter @Setter private segmentWidth" : 64,
	YearMonthScaleSettings : function(numItems, segmentWidth, segmentWidths) {
		this.numItems = numItems;
		this.segmentWidth = segmentWidth;
		this.segmentWidths = segmentWidths || this.numItems * this.segmentWidth;
	},

	getStageWidthRatio : function() {
		return this.segmentWidths / assets.js.core.utils.AJKHelpers.dateOneYearInMS;
	},
	getFirstBlockStartDateFromDate : function(data) {
		var aDate = data.date;
		var retDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
			time : aDate.getTime()
		});
		retDate.setMonth(0);
		retDate.setDate(1);
		retDate.setHours(0);
		retDate.setMinutes(1);
		retDate.setSeconds(0);
		return retDate;
	},
	getDateRangeInMS : function(data) {
		var blockStartDate = data.blockStartDate;
		var retDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
			time : blockStartDate.getTime()
		});
		retDate.setFullYear(blockStartDate.getFullYear() + 1);
		return retDate.getTime() - blockStartDate.getTime();
	},
	getTextForDate : function(data) {
		var self = this;
		var aDate = data.date;
		if (data.subItem) {
			var newDate = new Date();
			newDate.setTime(aDate.getTime() + (assets.js.core.utils.AJKHelpers.dateOneDayInMS * 2));
			var formatString = (self.segmentWidth < 128) ? "MMM" : (self.segmentWidth < 256) ? "MMMM" : "MMMM YYYY";
			return assets.js.core.utils.AJKHelpers.formatDate({
				date : newDate,
				formatString : formatString
			});
		} else {
			return assets.js.core.utils.AJKHelpers.formatFullYearForDate({
				date : aDate
			});
		}
	}
});
