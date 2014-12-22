$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.core.controller.TLHashController extends Object",

	TLHashController : function() {

		var self = this;
		self.lastHash = "";
		self.timeout = "";
		self.timeoutTime = 200;
	},
	init : function() {
		var self = this;
		theTLSettings.registerAsObserver({
			observer : self,
			type : "currentDate"
		});
		self.lastHash = window.location.hash;
		self.lastHash = self.lastHash.replace("#", "");
		self.initiateHashCheck();
		return self;
	},
	setHashToCurrentDate : function() {
		var self = this;
		self.currentDateWasUpdatedTo({
			date : assets.js.core.utils.AJKHelpers.cloneDate({
				date : theTLSettings.currentDate
			})
		});
	},
	setHashToStoryPanel : function(data) {
		var self = this;
		if (theTLMainController.timeline.urlHashing == 1) {
			return;
		}
		var storyId = data.storyId;
		self.lastHash = "vars!panel=" + storyId + "!";
		window.location.hash = self.lastHash;
	},
	currentDateWasUpdatedTo : function(data) {
		var self = this;
		var aDate = data.date;
		var extraInfo = data.extraInfo;
		if (extraInfo && (extraInfo.drag || !extraInfo.updateHash) || theTLMainController.timeline.urlHashing == 1) {
			return;
		}
		self.lastHash = assets.js.core.utils.AJKHelpers.formatDate({
			date : aDate,
			formatString : "YYYY-MM-DD_HH:mm:ss",
			forceFullDate : true,
			language : "base"
		});
		self.lastHash = "vars!date=" + self.lastHash + "!";
		window.location.hash = self.lastHash;
	},
	initiateHashCheck : function() {
		var self = this;
		self.timeout = setTimeout(function() {
			var newHash = window.location.hash;
			newHash = newHash.replace("#", "");
			if (newHash != self.lastHash) {
				self.lastHash = newHash;
				self.translateHash({
					hash : newHash
				});
			}
			var thisFunc = arguments.callee;
			self.timeout = setTimeout(function() {
				thisFunc();
			}, self.timeoutTime);
		}, self.timeoutTime);
	},
	translateHash : function(data) {
		var self = this;
		var storyId = self.getHashPanel({
			hash : data.hash
		});
		if (storyId) {
			theTLMainController.displayPanelForStoryId({
				id : storyId
			});
		} else {
			var aDate = self.getHashDate({
				hash : data.hash
			});
			if (aDate) {
				theTLSettings.setCurrentDate({
					date : aDate
				});
				theTLMainController.hideContentPanelIfVisible();
			}
		}
	},
	getHashDate : function(data) {
		var self = this;
		var aHash = data.hash;
		aHash = aHash.replace("vars!", "!");
		var splitHash = aHash.split("!");
		var aDate = false;
		if (splitHash && splitHash[1]) {
			var info = splitHash[1];
			if (info.indexOf("date=") != -1) {
				var dateTxt = info.split("date=")[1];
				if (dateTxt) {
					dateTxt = dateTxt.replace("_", " ");
					aDate = assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
						dateString : dateTxt
					});
				}
			}
		}
		return aDate;
	},
	getHashPanel : function(data) {
		var self = this;
		var aHash = data.hash;
		aHash = aHash.replace("vars!", "!");
		var splitHash = aHash.split("!");
		var storyId = false;
		if (splitHash && splitHash[1]) {
			var info = splitHash[1];
			if (info.indexOf("panel=") != -1) {
				var panelTxt = info.split("panel=")[1];
				if (panelTxt) {
					storyId = panelTxt;
				}
			}
		}
		return storyId;
	}
});