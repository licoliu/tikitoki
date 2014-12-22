Class.forName({
	name : "class assets.js.security.controller.AJKDatePickerController extends Object",

	AJKDatePickerController : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.lightbox = "";
		self.domDatePicker = "";
		self.datePicker = "";
		self.domInput = "";
		self.selectedDate = "";
		self.dateFormatFieldId = "";
		self.formatController = "";
	},
	init : function() {
		var self = this;
		$(".ajk-date-field .tl-ah-input, .ajk-date-field .tlsp-field-input-holder").append('<a href="#" class="tl-ah-date-picker-button">Open date picker</a>');
		$(".ajk-date-field").each(function() {
			var domInput = $(this).find("input").get()[0];
			var domLaunchButton = $(this).find(".tl-ah-date-picker-button").get()[0];
			var dateFormatFieldId = $(this).find(".ajk-date-format-field-id").text();
			$(domLaunchButton).click(function() {
				self.launchLightbox();
				self.domInput = domInput;
				self.dateFormatFieldId = dateFormatFieldId;
				if (self.dateFormatFieldId) {
					$(self.domDateFormat).find("input").val($("#" + self.dateFormatFieldId).val());
					self.formatController.updateFromFieldValue();
					$(self.domDateFormat).css({
						display : "block"
					});
				} else {
					$(self.domDateFormat).css({
						display : "none"
					});
				}
				self.selectedDate = Date.parse($(domInput).val());
				self.selectedDate = (self.selectedDate) ? self.selectedDate : new Date();
				self.datePicker.setInitialDate({
					date : self.selectedDate
				});
				self.showSelectedDate();
				return false;
			});
		});
		return self;
	},
	launchLightbox : function() {
		var self = this;
		if (!self.lightbox) {
			self.initLightbox();
		}
		self.lightbox.openPanel();
	},
	initLightbox : function() {
		var self = this;
		self.generateDatePickerDom();
		self.datePicker = new AJKDatePicker({
			domRoot : self.domDatePicker,
			startDateTime : new Date(),
			dayBlockClass : "ajk-dp-day",
			dayBlockSelectedClass : "ajk-dp-day-selected",
			dayBlockTodayClass : "ajk-dp-day-today",
			dayBlockInactiveClass : "ajk-dp-day-hide-visibility",
			domADSelector : $(self.domDatePicker).find(".ajk-dp-ad-button").get()[0],
			domBCSelector : $(self.domDatePicker).find(".ajk-dp-bc-button").get()[0],
			selectedClassForADBC : "ajk-dp-switch-button-selected",
			domYearBox : $(self.domDatePicker).find(".ajk-dp-header input").get()[0],
			domHourBox : $(self.domDatePicker).find(".ajk-dp-hour-field input").get()[0],
			domMinuteBox : $(self.domDatePicker).find(".ajk-dp-minute-field input").get()[0],
			domSecondBox : $(self.domDatePicker).find(".ajk-dp-second-field input").get()[0],
			domSelectedMonthText : $(self.domDatePicker).find(".ajk-dp-header h3").get()[0],
			domNextMonthButton : $(self.domDatePicker).find(".ajk-dp-header a.ajk-dp-next-month").get()[0],
			domPrevMonthButton : $(self.domDatePicker).find(".ajk-dp-header a.ajk-dp-prev-month").get()[0],
			domDayBlockStage : $(self.domDatePicker).find(".ajk-dp-stage").get()[0],
			createDayBlockFunc : function(data) {
				var index = data.index;
				var dayBlockClass = "ajk-dp-day";
				if (index % 7 == 0) {
					dayBlockClass = (dayBlockClass + " " + dayBlockClass + "-left");
				} else if (index % 7 == 6) {
					dayBlockClass = (dayBlockClass + " " + dayBlockClass + "-right");
				}
				return $('<a href="#" class="' + dayBlockClass + '"></a>').get()[0];
			},
			callback : function(data) {
				self.selectedDate = data.selectedDate;
				self.datePicker.setInitialDate({
					date : self.selectedDate
				});
				self.showSelectedDate();
			}
		}).init();
		self.lightbox = new TLAdminLightbox({
			domClass : "tl-ah-date-picker-lightbox",
			title : TLConfigText['adminDatePicker_Date_picker'],
			intro : "",
			domContent : self.domDatePicker
		}).init();
	},
	showSelectedDate : function() {
		var self = this;
		$(self.domSelectedDateText).text(AJKHelpers.formatDate({
			formatString : "DD MMM YYYY",
			date : self.selectedDate,
			language : "base"
		}));
	},
	generateDatePickerDom : function() {
		var self = this;
		var inHTML = '<div class="ajk-date-picker">';
		inHTML += '<div class="ajk-dp-header">';
		inHTML += '<h3>July 2008</h3>';
		inHTML += '<a href="#" class="ajk-dp-month-arrow ajk-dp-prev-month">Prev</a>';
		inHTML += '<a href="#" class="ajk-dp-month-arrow ajk-dp-next-month">Next</a>';
		inHTML += '<a href="#" class="ajk-dp-ad-button ajk-dp-switch-button-selected ajk-dp-switch-button">AD</a>';
		inHTML += '<a href="#" class="ajk-dp-bc-button ajk-dp-switch-button">BC</a>';
		inHTML += '<div class="tl-ah-input"><div class="tl-ah-f-inner">';
		inHTML += '<input type="text" maxlength="5" class="" />';
		inHTML += '</div><div class="tl-ah-f-right"></div></div>';
		inHTML += '</div>';
		inHTML += '<div class="ajk-dp-middle">';
		inHTML += '<div class="ajk-dp-day-title-holder">';
		inHTML += '<p class="ajk-dp-day-title ajk-dp-day-title-first">' + AJKDatePickerHelper.dateWeekDayArray[1] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[2] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[3] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[4] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[5] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[6] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[0] + '</p>';
		inHTML += '</div>';
		inHTML += '<div class="clear"></div>';
		inHTML += '<div class="ajk-dp-stage">';
		inHTML += '</div>';
		inHTML += '<div class="clear"></div>';
		inHTML += '</div>';
		inHTML += '<div class="ajk-dp-bottom">';
		inHTML += '<div class="ajk-dp-selected-date">';
		inHTML += '<p>' + TLConfigText['adminDatePicker_Selected_date_text'] + ' <span></span></p>';
		inHTML += '<div class="tl-ah-input ajk-dp-time-field ajk-dp-hour-field"><div class="tl-ah-f-inner">';
		inHTML += '<input type="text" maxlength="2" />';
		inHTML += '</div><div class="tl-ah-f-right"></div></div>';
		inHTML += '<div class="tl-ah-input ajk-dp-time-field ajk-dp-minute-field"><div class="tl-ah-f-inner">';
		inHTML += '<input type="text" maxlength="2" />';
		inHTML += '</div><div class="tl-ah-f-right"></div></div>';
		inHTML += '<div class="tl-ah-input ajk-dp-time-field ajk-dp-second-field"><div class="tl-ah-f-inner">';
		inHTML += '<input type="text" maxlength="2" />';
		inHTML += '</div><div class="tl-ah-f-right"></div></div>';
		inHTML += '</div>';
		inHTML += '<div class="ajk-dp-date-format">';
		inHTML += '<p>' + TLConfigText['adminDatePicker_Date_format_text'] + '</p>';
		inHTML += '<div class="tl-ah-input tl-ah-dp-date-format-field"><div class="tl-ah-f-inner">';
		inHTML += '<input type="text" />';
		inHTML += '</div><div class="tl-ah-f-right"></div></div>';
		inHTML += '</div>';
		inHTML += '<div class="tl-ah-form-button-holder">';
		inHTML += '<a href="#" class="rt-button-4 rt-button-align-right ajk-dp-button-confirm">' + TLConfigText['adminDatePicker_Confirm'] + '</a>';
		inHTML += '<a href="#" class="rt-button-4 rt-button-align-right ajk-verifier-revert ajk-dp-button-cancel">' + TLConfigText['adminBasic_Cancel'] + '</a>';
		inHTML += '<div class="tl-clear"></div>';
		inHTML += '</div>';
		inHTML += '</div>';
		inHTML += '</div>';
		self.domDatePicker = $(inHTML).get()[0];
		self.domSelectedDateText = $(self.domDatePicker).find(".ajk-dp-selected-date span").get()[0];
		$(self.domDatePicker).find(".ajk-dp-button-confirm").click(function() {
			self.lightbox.closePanel();
			$(self.domInput).val(AJKHelpers.formatDate({
				formatString : "DD MMM YYYY HH:mm:ss",
				date : self.selectedDate,
				language : "base"
			}));
			$(self.domInput).blur();
			if (self.dateFormatFieldId) {
				var dateFormat = $(self.domDateFormat).find("input").val();
				$("#" + self.dateFormatFieldId).val(dateFormat).blur();
			}
			return false;
		});
		$(self.domDatePicker).find(".ajk-dp-button-cancel").click(function() {
			self.lightbox.closePanel();
			return false;
		});
		self.domDateFormat = $(self.domDatePicker).find(".ajk-dp-date-format").get()[0];
		if (typeof TLDateFormatterField != "undefined") {
			self.formatController = new TLDateFormatterField({
				domRoot : self.domDateFormat
			}).init();
		}
	}
});