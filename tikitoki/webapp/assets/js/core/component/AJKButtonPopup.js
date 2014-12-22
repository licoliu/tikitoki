$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.core.component.AJKButtonPopup extends Object",

	AJKButtonPopup : function(dataObj) {
		this.domRootEl = dataObj.domRootEl;
		this.domButton = dataObj.domButton;
		this.id = dataObj.id;
		this.domCloseButtons = $(this.domRootEl).find("a.close").get();
		this.observers = new Array();
		this.open = false;
		this.controller = dataObj.controller;
		this.animateStartTop = -100;
		this.animateEndTop = 40;
	},
	init : function() {
		var self = this;
		$(self.domCloseButtons).click(function() {
			self.hide();
			self.controller.popupDidClose();
			return false;
		});
		return self;
	},
	display : function() {
		var self = this;
		var rightOffset = theAJKWindowResizeEvent.lastWindowSize.width - assets.js.core.utils.AJKHelpers.getCoordsOfDomEl({
			domEl : self.domButton
		}).x + self.controller.adjustFunc();
		rightOffset -= parseInt($(self.domButton).parent().width() / 2);
		if ($.browser.msie && $.browser.version < 9) {
			$(self.domRootEl).css({
				top : self.animateStartTop,
				display : "block",
				right : rightOffset
			}).animate({
				top : self.animateEndTop
			}, 250, function() {
			});
		} else {
			$(self.domRootEl).css({
				opacity : 0,
				top : self.animateStartTop,
				display : "block",
				right : rightOffset
			}).animate({
				top : self.animateEndTop,
				opacity : 1
			}, 250, function() {
			});
		}
		self.open = true;
	},
	hide : function() {
		var self = this;
		if ($.browser.msie && $.browser.version < 9) {
			$(self.domRootEl).animate({
				top : self.animateStartTop
			}, 250, function() {
				$(this).css({
					display : "none"
				});
			});
		} else {
			$(self.domRootEl).animate({
				top : self.animateStartTop,
				opacity : 0
			}, 250, function() {
				$(this).css({
					display : "none"
				});
			});
		}
		self.open = false;
	}
});