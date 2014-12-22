Class.forName({
	name : "class assets.js.security.component.AJKAlert extends Object",

	AJKAlert : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.domContent = $(self.domRoot).find(".ajk-alert-content").get()[0];
		self.domContentHeadline = $(self.domRoot).find(".ajk-alert-content-headline").get()[0];
		self.domContentBody = $(self.domRoot).find(".ajk-alert-content-body").get()[0];
		self.domClose = $(self.domRoot).find(".ajk-alert-close").get()[0];
		self.domContentButtonHolder = $(self.domRoot).find(".ajk-alert-content-button-holder").get()[0];
		self.preDisplaySetupFunc = data.preDisplaySetupFunc;
		self.closeOnBackClick = data.closeOnBackClick;
	},
	init : function() {
		var self = this;
		$(self.domRoot).click(function() {
			if (self.closeOnBackClick) {
				self.close();
			}
			return false;
		});
		$(self.domClose).click(function() {
			self.close();
			return false;
		});
		return self;
	},
	close : function() {
		var self = this;
		$(self.domRoot).css({
			display : "none",
			visibility : "hidden"
		});
	},
	displayMessage : function(data) {
		var self = this;
		var headline = data.headline;
		var body = data.body;
		var buttons = (data.buttons) ? data.buttons : new Array();
		var hideClose = data.hideClose;
		if (hideClose) {
			$(self.domClose).css({
				display : "none"
			});
		} else {
			$(self.domClose).css({
				display : "block"
			});
		}
		$(self.domContentHeadline).html(data.headline);
		$(self.domContentBody).html(data.body);
		$(self.domContentButtonHolder).empty();
		$.each(buttons, function() {
			var button = this;
			var domButton = $(this.html).get()[0];
			$(domButton).click(function() {
				self.close();
				button.action();
				return false;
			});
			$(self.domContentButtonHolder).append(domButton);
		});
		$(self.domRoot).css({
			display : "block"
		});
		if (self.preDisplaySetupFunc) {
			self.preDisplaySetupFunc();
		}
		$(self.domRoot).css({
			visibility : "visible"
		});
	},
	fadeOut : function() {
		var self = this;
		$(self.domRoot).animate({
			opacity : 0
		}, 500, function() {
			self.close();
			$(this).css({
				opacity : 1
			});
		});
	}
});