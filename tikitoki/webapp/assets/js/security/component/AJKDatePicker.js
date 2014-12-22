Class.forName({
	name : "class assets.js.security.component.AJKDatePicker extends Object",

	AJKDatePicker : function(data) {
		var self = this;
		self.selectedDateTime = data.startDateTime;
		self.dayBlockClass = data.dayBlockClass;
		self.dayBlockInactiveClass = data.dayBlockInactiveClass;
		self.domRoot = data.domRoot;
		self.domADSelector = data.domADSelector;
		self.domBCSelector = data.domBCSelector;
		self.selectedClassForADBC = data.selectedClassForADBC;
		self.isAD = true;
		self.domSelectedMonthText = data.domSelectedMonthText;
		self.domNextMonthButton = data.domNextMonthButton;
		self.domPrevMonthButton = data.domPrevMonthButton;
		self.domDayBlockStage = data.domDayBlockStage;
		self.createDayBlockFunc = data.createDayBlockFunc;
		self.domYearBox = data.domYearBox;
		self.domHourBox = data.domHourBox;
		self.domMinuteBox = data.domMinuteBox;
		self.domSecondBox = data.domSecondBox;
		self.domDayBlocks = new Array();
		self.callback = data.callback;
		self.dateUsedForVisibleMonth = "";
		self.arrayDayKeyCells = "";
	},
	init : function() {
		var self = this;
		self.generateHTML();
		$(self.domNextMonthButton).click(function() {
			self.displayNextMonth();
			return false;
		});
		$(self.domPrevMonthButton).click(function() {
			self.displayPrevMonth();
			return false;
		});
		$(self.domDayBlocks).click(function() {
			var selectedDay = $(this).text();
			if (selectedDay && selectedDay != "null") {
				self.dayWasClicked({
					day : selectedDay
				});
			}
			return false;
		});
		self.updateDisplayedMonth({
			date : self.selectedDateTime
		});
		self.initYearBox();
		self.initADBC();
		return self;
	},
	initYearBox : function() {
		var self = this;
		$([ self.domYearBox, self.domHourBox, self.domMinuteBox, self.domSecondBox ]).keydown(function(e) {
			var c = e.keyCode;
			if ((c >= 48 && c <= 57) || c == 8 || c == 13 || c == 9 || c == 37 || c == 39 || c == 46 || c == 17 || c == 18) {
				return true;
			} else {
				return false;
			}
		}).keyup(function(e) {
			if (this == self.domYearBox) {
				var newDate = AJKHelpers.cloneDate({
					date : self.dateUsedForVisibleMonth
				});
				var year = parseInt($(this).val(), 10);
				newDate.setFullYear(AJKHelpers.quadrupleDigitNum({
					num : year
				}));
				self.updateDisplayedMonth({
					date : newDate,
					cancelDateTimeBoxUpdate : true
				});
			} else {
				if (this == self.domHourBox) {
					var hour = parseInt($(this).val(), 10);
					if (hour > 23) {
						$(this).val(23);
						hour = 23;
					}
					self.selectedDateTime.setHours(hour);
					self.dateUsedForVisibleMonth.setHours(hour);
				} else if (this == self.domMinuteBox) {
					var minute = parseInt($(this).val(), 10);
					if (minute > 59) {
						$(this).val(59);
						hour = 59;
					}
					self.selectedDateTime.setMinutes(minute);
					self.dateUsedForVisibleMonth.setMinutes(minute);
				} else if (this == self.domSecondBox) {
					var second = parseInt($(this).val(), 10);
					if (second > 59) {
						$(this).val(59);
						second = 59;
					}
					self.selectedDateTime.setSeconds(second);
					self.dateUsedForVisibleMonth.setSeconds(second);
				}
			}
		});
	},
	setInitialDate : function(data) {
		var self = this;
		self.selectedDateTime = AJKHelpers.cloneDate({
			date : data.date
		});
		self.updateDisplayedMonth({
			date : data.date
		});
	},
	generateHTML : function() {
		var self = this;
		for (var counter = 0; counter < 42; counter++) {
			self.domDayBlocks.push(self.createDayBlockFunc({
				index : counter
			}));
		}
		$(self.domDayBlockStage).html(self.domDayBlocks);
	},
	initADBC : function() {
		var self = this;
		$(self.domADSelector).click(function() {
			if (!self.isAD) {
				self.isAD = true;
				$(this).addClass(self.selectedClassForADBC);
				$(self.domBCSelector).removeClass(self.selectedClassForADBC);
				self.updateADBC();
			}
			return false;
		});
		$(self.domBCSelector).click(function() {
			if (self.isAD) {
				self.isAD = false;
				$(this).addClass(self.selectedClassForADBC);
				$(self.domADSelector).removeClass(self.selectedClassForADBC);
				self.updateADBC();
			}
			return false;
		});
	},
	updateADBC : function() {
		var self = this;
		var yearText = parseInt($(self.domYearBox).val(), 10);
		if (!self.isAD) {
			yearText = -yearText;
		}
		var newDate = AJKHelpers.cloneDate({
			date : self.dateUsedForVisibleMonth
		});
		newDate.setFullYear(yearText);
		self.updateDisplayedMonth({
			date : newDate,
			cancelDateTimeBoxUpdate : true
		});
	},
	updateDisplayedMonth : function(data) {
		var self = this;
		self.dateUsedForVisibleMonth = data.date;
		$(this.domSelectedMonthText).text(AJKDatePickerHelper.monthsArray[self.dateUsedForVisibleMonth.getMonth()]);
		var fullYear = self.dateUsedForVisibleMonth.getFullYear();
		if (!data.cancelDateTimeBoxUpdate) {
			var displayYear = AJKHelpers.quadrupleDigitNum({
				num : Math.abs(fullYear)
			});
			var displayHour = AJKHelpers.doubleDigitNum({
				num : self.dateUsedForVisibleMonth.getHours()
			});
			var displayMinute = AJKHelpers.doubleDigitNum({
				num : self.dateUsedForVisibleMonth.getMinutes()
			});
			var displaySecond = AJKHelpers.doubleDigitNum({
				num : self.dateUsedForVisibleMonth.getSeconds()
			});
			$(self.domYearBox).val(displayYear);
			$(self.domHourBox).val(displayHour);
			$(self.domMinuteBox).val(displayMinute);
			$(self.domSecondBox).val(displaySecond);
		}
		if (fullYear < 0) {
			$(self.domADSelector).removeClass(self.selectedClassForADBC);
			$(self.domBCSelector).addClass(self.selectedClassForADBC);
			self.isAD = false;
		} else {
			$(self.domADSelector).addClass(self.selectedClassForADBC);
			$(self.domBCSelector).removeClass(self.selectedClassForADBC);
			self.isAD = true;
		}
		self.arrayDayKeyCells = new Array();
		var calendarArray = AJKDatePickerHelper.getDayArrayForMonthOfYear({
			date : self.dateUsedForVisibleMonth
		});
		var dayOccuredOn = false;
		for (var counter = 0; counter <= 41; counter++) {
			var thisCell = this.domDayBlocks[counter];
			var thisDay = calendarArray[counter];
			if (thisDay) {
				dayOccuredOn = counter;
				var keyStr = AJKDatePickerHelper.leadingZero(thisDay) + "/" + AJKDatePickerHelper.leadingZero(self.dateUsedForVisibleMonth.getMonth()) + "/"
						+ self.dateUsedForVisibleMonth.getFullYear();
				this.arrayDayKeyCells[keyStr] = thisCell;
				$(thisCell).text(thisDay).removeClass(self.dayBlockInactiveClass).removeClass("ajk-dp-day-hide-display").removeClass("ajk-dp-day-selected").removeClass(
						"ajk-dp-day-today");
				var todaysDate = new Date();
				if (thisDay == todaysDate.getDate() && self.dateUsedForVisibleMonth.getMonth() == todaysDate.getMonth()
						&& self.dateUsedForVisibleMonth.getFullYear() == todaysDate.getFullYear()) {
					$(thisCell).addClass("ajk-dp-day-today");
				}
				if (thisDay == self.selectedDateTime.getDate() && self.dateUsedForVisibleMonth.getMonth() == self.selectedDateTime.getMonth()
						&& self.dateUsedForVisibleMonth.getFullYear() == self.selectedDateTime.getFullYear()) {
					$(thisCell).addClass("ajk-dp-day-selected");
				}
			} else {
				var hideClass = (dayOccuredOn && counter >= (dayOccuredOn - (dayOccuredOn % 7) + 7)) ? "ajk-dp-day-hide-display" : self.dayBlockInactiveClass;
				$(thisCell).text("null").removeClass(self.dayBlockInactiveClass).removeClass("ajk-dp-day-hide-display").removeClass("ajk-dp-day-selected").removeClass(
						"ajk-dp-day-today").addClass(hideClass);
			}
		}
		return self;
	},
	displayNextMonth : function() {
		var self = this;
		var newDate = new Date();
		newDate.setTime(self.dateUsedForVisibleMonth.getTime());
		if ((newDate.getMonth + 1) > 11) {
			newDate.setMonth(0);
			newDate.setYear(newDate.getFullYear() + 1);
		} else {
			newDate.setMonth(newDate.getMonth() + 1);
		}
		self.updateDisplayedMonth({
			date : newDate
		});
	},
	displayPrevMonth : function() {
		var self = this;
		var newDate = new Date();
		newDate.setTime(self.dateUsedForVisibleMonth.getTime());
		if ((newDate.getMonth - 1) < 0) {
			newDate.setMonth(11);
			newDate.setYear(newDate.getFullYear() - 1);
		} else {
			newDate.setMonth(newDate.getMonth() - 1);
		}
		self.updateDisplayedMonth({
			date : newDate
		});
	},
	dayWasClicked : function(data) {
		var self = this;
		self.dateUsedForVisibleMonth.setDate(data.day);
		self.callback({
			selectedDate : self.dateUsedForVisibleMonth
		});
	}
});