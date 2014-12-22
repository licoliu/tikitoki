$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.core.setting.TLSettings extends Object",

	TLSettings : function() {
		var self = this;
		self.observers = new Array();
		self.currentDate = new Date();
		self.visibleStartDate = "";
		self.visibleEndDate = "";
		self.visibleDateRange = "";
		self.windowSize = assets.js.core.utils.AJKHelpers.viewportSize();
		self.animateTime = 1000;
		self.onlyMouseScrollIfAlone = true;
		self.lastSelectedStory = "";
		self.flickrApiKey = "1eed7e0b716c8554acfe67108c57952e";
		self.flickrReplacementImage = "assets/ui/flickr-r2.gif";
	},
	sliderDraggerMinWidth : 36,
	init : function() {
		var self = this;
		theAJKWindowResizeEvent.registerAsObserver({
			observer : self
		});
		theAJKMouseScrollEvent.registerAsObserver({
			observer : self
		});
		return self;
	},
	limitDateToRange : function(data) {
		var self = this;
		var aDate = data.aDate;
		aDate = (aDate.getTime() < self.visibleStartDate.getTime()) ? self.visibleStartDate : aDate;
		aDate = (aDate.getTime() > self.visibleEndDate.getTime()) ? self.visibleEndDate : aDate;
		return aDate;
	},
	mouseDidScroll : function(data) {
		var self = this;
		var delta = -data.delta;
		var dateRange = self.visibleEndDate.getTime() - self.visibleStartDate.getTime();
		var change = Math.round(delta / 50 * dateRange / 2);
		var newDate = new Date();
		newDate.setTime(self.currentDate.getTime() + change);
		newDate = self.limitDateToRange({
			aDate : newDate
		});
		if ($.browser.msie) {
			setTimeout(function() {
				self.setCurrentDate({
					date : newDate,
					extraInfo : {
						updateHash : false
					}
				});
			}, 50);
		} else {
			if (!self.testTimeout) {
				self.testTimeout = setTimeout(function() {
					self.setCurrentDate({
						date : newDate,
						extraInfo : {
							updateHash : false,
							viewOnlySpeed : 1
						}
					});
					self.testTimeout = "";
				}, 1);
			}
		}
		self.lastSelectedStory = "";
	},
	windowDidResize : function(data) {
		var self = this;
		self.windowSize = data.newSize;
	},
	setCurrentDate : function(data) {
		var self = this;
		var date = data.date;
		var extraInfo = data.extraInfo;
		var animate = data.animate;
		var callback = data.callback;
		var instantly = data.instantly;
		var speed = (data.speed) ? data.speed : self.animateTime;
		if (animate && !instantly) {
			$({
				date : self.currentDate.getTime()
			}).animate({
				date : date.getTime()
			}, {
				duration : speed,
				step : function() {
					var aDate = new Date();
					aDate.setTime(this.date);
					self.currentDate = assets.js.core.utils.AJKHelpers.cloneDate({
						date : aDate
					});
					self.informObservers({
						extraInfo : extraInfo
					});
				},
				complete : function() {
					var aDate = new Date();
					aDate.setTime(this.date);
					self.currentDate = assets.js.core.utils.AJKHelpers.cloneDate({
						date : aDate
					});
					self.informObservers({
						extraInfo : extraInfo
					});
					if (callback) {
						callback();
					}
				}
			});
		} else {
			self.currentDate = assets.js.core.utils.AJKHelpers.cloneDate({
				date : date
			});
			self.informObservers({
				extraInfo : extraInfo
			});
		}
	},
	informObservers : function(data) {
		var self = this;
		var extraInfo = data.extraInfo;
		if (self.observers["currentDate"]) {
			$.each(self.observers["currentDate"], function() {
				if (this.currentDateWasUpdatedTo) {
					this.currentDateWasUpdatedTo({
						date : self.currentDate,
						extraInfo : extraInfo
					});
				}
			});
		}
	},
	ensureCurrentDateIsWithinVisibleRange : function() {
		var self = this;
		self.currentDate = self.limitDateToRange({
			aDate : self.currentDate
		});
	},
	timeInfo : {
		start : "",
		end : "",
		msecs : "",
		secs : "",
		mins : "",
		hours : "",
		days : "",
		months : "",
		years : "",
		decades : ""
	},
	registerAsObserver : function(data) {
		var self = this;
		var type = data.type;
		var observer = data.observer;
		if (!self.observers[type]) {
			self.observers[type] = new Array();
		}
		self.observers[type] = assets.js.core.utils.AJKHelpers.removeItemFromArray({
			anArray : self.observers[type],
			item : observer
		});
		self.observers[type].push(observer);
	},
	removeAsObserver : function(data) {
		var self = this;
		var type = data.type;
		var observer = data.observer;
		if (self.observers[type]) {
			self.observers[type] = assets.js.core.utils.AJKHelpers.removeItemFromArray({
				anArray : self.observers[type],
				item : observer
			});
		}
	}
});