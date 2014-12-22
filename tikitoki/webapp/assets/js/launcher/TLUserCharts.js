Class.forName({
	name : "class assets.js.launcher.TLUserCharts extends Object",

	TLUserCharts : function(selector, data) {
		var self = this;
		self.domRoot = $(selector).get()[0];
		self.domLaunch = $(self.domRoot).find(".launch").get()[0];
		self.domMenu = $(self.domRoot).find(".menu-holder").get()[0];
		self.domPanel = $(self.domRoot).find(".tl-uc-panel").get()[0];
		self.animating = false;
		self.launched = false;
		self.menuWidth = 325;
		self.defaultPos = 10;
		self.openPos = 25;
	},

	init : function() {
		var self = this;
		$(self.domLaunch).click(function() {
			if (self.launched) {
				self.close();
			} else {
				self.launch();
			}
			return false;
		});

		$(self.domRoot).find(".close-panel").click(function() {
			self.close();
			return false;
		});
		self.showButton();

		$(self.domLaunch).click();
		return self;
	},
	updateView : function(data) {
	},
	showButton : function() {
		var self = this;
		$(self.domRoot).css({
			display : "block"
		});
	},
	hideButton : function() {
		var self = this;
		$(self.domRoot).css({
			display : "none"
		});
		self.close();
	},
	launch : function() {
		var self = this;
		if (self.animating || self.launched) {
			return;
		}
		self.animating = true;
		if ($.browser.msie) {
			$(self.domPanel).css({
				display : "block"
			});
			/*
			 * $(self.domRoot).css({ right : self.openPos });
			 */

			self.launched = true;
			self.animating = false;
		} else {
			/*
			 * $(self.domRoot).animate({ right : self.openPos }, 500);
			 */
			$(self.domPanel).css({
				opacity : 0,
				display : "block"
			}).animate({
				opacity : 1
			}, 500, function() {
				self.launched = true;
				self.animating = false;
			});
		}
	},
	close : function() {
		var self = this;
		if (self.animating || self.launched == false) {
			return;
		}
		self.animating = true;

		if ($.browser.msie) {
			/*
			 * $(self.domRoot).css({ right : self.defaultPos });
			 */
			$(self.domPanel).css({
				display : "none"
			});
			$(self.domMenu).css({
				display : "none"
			});
			self.launched = false;
			self.animating = false;
			self.blockClosed({
				block : self.selectedBlock
			});
		} else {
			/*
			 * $(self.domRoot).animate({ right : self.defaultPos }, 500);
			 */
			$(self.domPanel).animate({
				opacity : 0
			}, 500, function() {
				$(this).css({
					display : "none"
				});
				self.launched = false;
				self.animating = false;
			});
		}
	}
});