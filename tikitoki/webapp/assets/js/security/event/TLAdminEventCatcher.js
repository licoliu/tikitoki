Class.forName({
	name : "class assets.js.security.event.TLAdminEventCatcher extends Object",

	TLAdminEventCatcher : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.topPos = "";
		self.domCutOffEl = "";
		self.clickFunc = "";
		self.active = false;
	},
	init : function() {
		var self = this;
		self.topPos = AJKHelpers.getCoordsOfDomEl({
			domEl : self.domRoot
		}).y;
		$(self.domRoot).click(function() {
			if (self.clickFunc) {
				self.clickFunc();
			}
		});
		return self;
	},
	deactivate : function() {
		var self = this;
		$(self.domRoot).css({
			height : 0
		});
		theTLMainController.selected3DView.disableHover = false;
		self.active = false;
	},
	activate : function(data) {
		var self = this;
		theTLMainController.selected3DView.disableHover = true;
		var cutOffPos = AJKHelpers.getCoordsOfDomEl({
			domEl : self.domCutOffEl
		}).y;
		$(self.domRoot).css({
			height : cutOffPos - self.topPos
		});
		self.active = true;
	},
	setupAction : function(data) {
		var self = this;
		self.domCutOffEl = data.domCutOffEl;
		self.clickFunc = data.clickFunc;
	},
	fakeClick : function() {
		var self = this;
		$(self.domRoot).click();
	}
});