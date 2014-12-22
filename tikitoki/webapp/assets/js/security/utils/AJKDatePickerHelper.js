$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.security.utils.AJKDatePickerHelper extends Object",

	"public static dateWeekDayArray" : assets.js.core.utils.AJKHelpers.dateWeekDayShortArray,
	"public static daysArray" : assets.js.core.utils.AJKHelpers.dateWeekDayArray,
	"public static daysShortArray" : assets.js.core.utils.AJKHelpers.dateWeekDayShortArray,
	"public static monthsArray" : assets.js.core.utils.AJKHelpers.dateMonthsArray,
	"public static monthsSemiShortArray" : assets.js.core.utils.AJKHelpers.dateMonthsShortArray,
	"public static monthsShortArray" : assets.js.core.utils.AJKHelpers.dateMonthsShortArray,
	"public static daySuffixArray" : assets.js.core.utils.AJKHelpers.dateDaySuffixArray,
	"public static oneDayInMS" : 1000 * 60 * 60 * 24,
	"public static getDayOfWeekStrForDate" : function(data) {
		var thisDate = data.date;
		var dayVersion = data.dayVersion;
		var dayOfWeek = thisDate.getDay();
		if (dayVersion == "short") {
			return this.daysShortArray[dayOfWeek];
		} else {
			return this.daysArray[dayOfWeek];
		}
	},
	"public static leadingZero" : function(nr) {
		if (nr < 10 && nr > 0) {
			nr = "0" + nr;
		} else if (nr == 0) {
			nr = "00";
		}
		return nr;
	},
	"public static getDayArrayForMonthOfYear" : function(data) {
		var selectedMonth = data.date.getMonth();
		var selectedYear = data.date.getFullYear();
		var FOM = new Date(selectedYear, selectedMonth, 1);
		var FOMWeekDay = FOM.getDay();
		var FOMDayOffset = FOMWeekDay - 1;
		if (FOMDayOffset == -1) {
			FOMDayOffset = 6;
		}
		var nextMonth = new Date(selectedYear, (selectedMonth + 1), 1);
		var FOMMonthLength = Math.round(((nextMonth - FOM) / this.oneDayInMS));
		var LDOM = new Date();
		LDOM.setFullYear(selectedYear, selectedMonth, FOMMonthLength);
		var LDOMDayOffset = 7 - LDOM.getDay();
		if (LDOMDayOffset == 7) {
			LDOMDayOffset = 0;
		}
		var calendarArray = new Array();
		for (var counter = 0; counter < FOMDayOffset; counter++) {
			calendarArray[calendarArray.length] = "";
		}
		for (var counter2 = 0; counter2 < FOMMonthLength; counter2++) {
			calendarArray[calendarArray.length] = (counter2 + 1);
		}
		for (var counter3 = 0; counter3 < LDOMDayOffset; counter3++) {
			calendarArray[calendarArray.length] = "";
		}
		return calendarArray;
	}
});