$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");

Class.forName({
	name : "class assets.js.core.setting.HourMinsScaleSettings extends Object",

	"@Getter @Setter private displayDateFormat" : "ddnn MMMM YYYY HH:mm",
	"@Getter @Setter private numItems" : 12,
	"@Getter @Setter private segmentWidth" : 64,
	"@Getter @Setter private roundMinutes" : 5,

	ScaleSettings : function(numItems, segmentWidth, roundMinutes) {
		this.numItems = numItems;
		this.segmentWidth = segmentWidth;
		this.roundMinutes = roundMinutes;
	},

	getStageWidthRatio : function() {
		return this.numItems * this.segmentWidth / assets.js.core.utils.AJKHelpers.dateOneHourInMS;
	},
	getFirstBlockStartDateFromDate : function(data) {
		var aDate = data.date;
		var retDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
			time : aDate.getTime()
		});
		retDate.setMinutes(0);
		retDate.setSeconds(0);
		retDate.setMilliseconds(0);
		return retDate;
	},
	getDateRangeInMS : function(data) {
		var blockStartDate = data.blockStartDate;
		var retDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
			time : blockStartDate.getTime() + assets.js.core.utils.AJKHelpers.dateOneHourInMS
		});
		retDate.setMinutes(0);
		retDate.setSeconds(0);
		retDate.setMilliseconds(0);
		return retDate.getTime() - blockStartDate.getTime();
	},
	getTextForDate : function(data) {
		var aDate = data.date;
		var minutes = aDate.getMinutes();
		var hour = aDate.getHours();
		var lang = theTLMainController.timeline.language;
		var mornAft = assets.js.core.setting.TLConfigText['basic_am'];
		if (lang && lang != "english") {
			mornAft = "";
		} else {
			if (hour > 12) {
				hour -= 12;
				mornAft = assets.js.core.setting.TLConfigText['basic_pm'];
			} else if (hour == 12 && minutes > 0) {
				mornAft = assets.js.core.setting.TLConfigText['basic_pm'];
			}
		}
		if (this.roundMinutes) {
			minutes = parseInt((minutes + this.roundMinutes / 5) / this.roundMinutes, 10) * this.roundMinutes;
		}
		if (minutes == 0 && hour == 12 && !(lang && lang != "english")) {
			return assets.js.core.setting.TLConfigText['basic_Noon'];
		} else if (minutes == 0 && hour == 0) {
			return aDate.getDate() + " " + assets.js.core.utils.AJKHelpers.dateMonthsShortArray[aDate.getMonth()];
		} else {
			return hour + ":" + assets.js.core.utils.AJKHelpers.doubleDigitNum({
				num : minutes
			}) + mornAft;
		}
	}

});
