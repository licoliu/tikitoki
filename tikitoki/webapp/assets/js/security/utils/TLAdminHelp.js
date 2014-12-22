var TLAdminHelp = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.domAdmin = data.domAdmin;
	self.domOpenClose = data.domOpenClose;
	self.mainController = data.mainController;
	self.domContentHolder = $(self.domRoot).find(".tl-ahh-content").get()[0];
	self.helps = new Array();
	self.helpsByName = new Array();
	self.baseHelp = "";
	self.focusHelp = "";
	self.hoverHelp = "";
	self.selectedHelp = "";
	self.topPos = "";
	self.arrowPadding = 15;
	self.arrowHeight = 800;
	self.minArrowOffset = -self.arrowHeight / 2 + self.arrowPadding + 2;
	self.hidden = true;
	self.updateTimeout = "";
};
TLAdminHelp.prototype = {
	init : function() {
		var self = this;
		$(self.domOpenClose).click(function() {
			if (self.hidden) {
				self.show();
				self.mainController.showHelp = true;
			} else {
				self.hide();
				self.mainController.showHelp = false;
			}
			return false;
		});
		$(self.domRoot).mouseover(function(e) {
			var domFocusEl = e.target;
			if ($(domFocusEl).hasClass("tl-ahh-highlight")) {
				var anId = $(domFocusEl).attr("highlightId");
				if (anId) {
					AJKHelpers.flashDomEl({
						domEl : $("#" + anId).get()[0],
						numRadians : 12
					});
				}
			}
		});
		self.topPos = AJKHelpers.getCoordsOfDomEl({
			domEl : self.domRoot
		}).y;
		$(self.domAdmin).find("#tl-tab-my-timelines-button, #tl-categories-tab-menu-item, #tl-settings-tab-menu-item").click(function() {
			if (self.mainController.timeline.homePage) {
				self.setBaseHelpByName({
					baseName : "timeline-list"
				});
			} else {
				self.setBaseHelpByName({
					baseName : "default"
				});
			}
		});
		$(self.domAdmin).find(".tl-ahh-help-item").each(function() {
			var pointAtId = $(this).find(".tl-ahh-data-point-at-id").text();
			var aHelp = {
				name : $(this).attr("name"),
				domContent : $(this).find(".tl-ahh-data-content").get()[0],
				domHoverItem : this,
				domFocusItem : $(this).find(".ajk-verifier-control").get()[0],
				domPointAt : (pointAtId) ? $("#" + pointAtId).get()[0] : this
			};
			self.helps.push(aHelp);
			if (aHelp.name) {
				self.helpsByName[aHelp.name] = aHelp;
			}
			$(aHelp.domHoverItem).mouseenter(function() {
				self.hoverHelp = aHelp;
				self.updateView();
			}).mouseleave(function() {
				self.hoverHelp = "";
				self.updateTimeout = setTimeout(function() {
					self.updateView();
				}, 100);
			});
			$(aHelp.domFocusItem).focus(function() {
				self.focusHelp = aHelp;
				self.updateView();
			}).blur(function() {
				self.focusHelp = "";
				self.updateView();
			});
		});
		return self;
	},
	showHelp : function(data) {
		var self = this;
		var help = data.help;
		var forceShow = data.forceShow;
		if (self.selectedHelp != help || forceShow) {
			self.selectedHelp = help;
			if (self.hidden) {
				return;
			}
			self.preProcessHelp({
				help : help
			});
			$(self.domRoot).css({
				top : 39
			});
			$(self.domContentHolder).empty().append(help.domContent);
			var aimPos = AJKHelpers.getCoordsOfDomEl({
				domEl : help.domPointAt
			}).y;
			var myHeight = $(self.domRoot).height();
			var arrowOffset = aimPos - self.topPos - 0.5 * self.arrowHeight + 3;
			arrowOffset = (arrowOffset < self.minArrowOffset) ? self.minArrowOffset : arrowOffset;
			var helpTopAdjust = 0;
			var maxArrowOffset = self.minArrowOffset + myHeight - 2 * self.arrowPadding - 20;
			if (arrowOffset > maxArrowOffset) {
				helpTopAdjust = Math.abs(arrowOffset - maxArrowOffset) + 0.5 * (myHeight - 20) - self.arrowPadding;
				arrowOffset = maxArrowOffset - (0.5 * (myHeight - 20) - self.arrowPadding);
			}
			$(self.domRoot).css({
				top : parseInt(self.topPos + helpTopAdjust)
			});
			$(self.domContentHolder).css({
				backgroundPosition : "right " + parseInt(arrowOffset) + "px"
			});
		}
	},
	preProcessHelp : function(data) {
		var self = this;
		var help = data.help;
		$(help.domContent).find(".tl-ahh-timeline-title").text(self.mainController.timeline.title);
	},
	setBaseHelpByName : function(data) {
		var self = this;
		var baseName = data.baseName;
		self.baseHelp = self.helpsByName[baseName];
		self.updateView();
	},
	updateView : function(data) {
		var self = this;
		if (self.updateTimeout) {
			clearTimeout(self.updateTimeout);
			self.updateTimeout = "";
		}
		var forceShow = (data) ? data.forceShow : false;
		if (self.hoverHelp) {
			self.showHelp({
				help : self.hoverHelp,
				forceShow : forceShow
			});
			if (!self.hidden) {
				$(self.domOpenClose).removeClass("tl-ah-hide").addClass("tl-ah-hide");
			}
		} else if (self.focusHelp) {
			self.showHelp({
				help : self.focusHelp,
				forceShow : forceShow
			});
			if (!self.hidden) {
				$(self.domOpenClose).removeClass("tl-ah-hide").addClass("tl-ah-hide");
			}
		} else {
			self.showHelp({
				help : self.baseHelp,
				forceShow : forceShow
			});
			$(self.domOpenClose).removeClass("tl-ah-hide");
		}
	},
	hide : function() {
		var self = this;
		$(self.domRoot).addClass("tl-ahh-hide");
		$(self.domOpenClose).addClass("tl-admin-help-open-close-help-hidden");
		self.hidden = true;
	},
	show : function() {
		var self = this;
		self.hidden = false;
		self.updateView({
			forceShow : true
		});
		$(self.domRoot).removeClass("tl-ahh-hide");
		$(self.domOpenClose).removeClass("tl-admin-help-open-close-help-hidden");
	}
};