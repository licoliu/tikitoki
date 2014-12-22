$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");

Class.forName({
	name : "class assets.js.core.setting.MonthDayScaleSettings extends Object",

	"@Getter @Setter private segmentWidths" : 64,

	"@Getter @Setter private displayDateFormat" : "ddnn MMMM YYYY",
	"@Getter @Setter private offsetNextZebra" : false,
	"@Getter @Setter private offsetWidth" : 64,

	MonthDayScaleSettings : function(segmentWidths, offsetWidth) {
		this.segmentWidths = segmentWidths;
		this.offsetWidth = offsetWidth;
	},

	getStageWidthRatio : function() {
		return this.segmentWidths / assets.js.core.utils.AJKHelpers.dateOneDayInMS;
	},
	getFirstBlockStartDateFromDate : function(data) {
		var aDate = data.date;
		var retDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
			time : aDate.getTime()
		});
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
		var sMonth = blockStartDate.getMonth();
		var sYear = blockStartDate.getFullYear();
		if (sMonth == 11) {
			sMonth = 0;
			sYear++;
		} else {
			sMonth++;
		}
		retDate.setMonth(sMonth);
		retDate.setFullYear(sYear);
		return retDate.getTime() - blockStartDate.getTime();
	},
	getTextForDate : function(data) {
		var aDate = data.date;
		return assets.js.core.utils.AJKHelpers.dateMonthsShortArray[aDate.getMonth()] + " '" + assets.js.core.utils.AJKHelpers.doubleDigitNum({
			num : aDate.getFullYear() % 100
		});
	},

	adjustDomBlock : function(data) {
		var domBlock = data.domBlock;
		var date = data.date;
		if (this.offsetNextZebra) {
			$(domBlock).css({
				backgroundPosition : "-" + (this.offsetWidth + 1) + "px  0"
			});
		}
		var numberOfDaysInMonth = assets.js.core.utils.AJKHelpers.numberOfDaysInMonth({
			aDate : date
		});
		if (numberOfDaysInMonth % 2) {
			this.offsetNextZebra = !this.offsetNextZebra;
		}
	}

});
