$import("assets.js.core.event.AJKEvent");
$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.core.event.AJKWindowResizeEvent extends assets.js.core.event.AJKEvent",

	AJKWindowResizeEvent : function() {
		var self = this;

		self.lastWindowSize = {
			width : 0,
			height : 0
		};
		self.domBody = $("body").get()[0];
		self.scrollBarsHidden = false;
		self.showScrollBarTimer = "";
	},
	init : function() {
		var self = this;
		var viewportSize = assets.js.core.utils.AJKHelpers.viewportSize();
		self.lastWindowSize.width = viewportSize.width;
		self.lastWindowSize.height = viewportSize.height;
		$(window).resize(function() {
			self.informObservers();
			self.hideScrollBars();
		});
		return self;
	},
	hideScrollBars : function() {
		var self = this;
		if (!self.scrollBarsHidden) {
			$(self.domBody).addClass("tl-overflow-hidden");
			self.scrollBarsHidden = true;
		}
		if (self.showScrollBarTimer) {
			clearTimeout(self.showScrollBarTimer);
		}
		self.showScrollBarTimer = setTimeout(function() {
			$(self.domBody).removeClass("tl-overflow-hidden");
			self.scrollBarsHidden = false;
		}, 200);
	},
	informObservers : function(force) {
		var self = this;
		var informFunc = function() {
			var viewportSize = assets.js.core.utils.AJKHelpers.viewportSize();
			viewportSize.width = (viewportSize.width) ? viewportSize.width : 1;
			viewportSize.height = (viewportSize.height) ? viewportSize.height : 1;
			if (force || !(viewportSize.width == self.lastWindowSize.width && viewportSize.height == self.lastWindowSize.height)) {
				self.lastWindowSize.width = viewportSize.width;
				self.lastWindowSize.height = viewportSize.height;
				$.each(self.observers, function() {
					this.windowDidResize({
						newSize : viewportSize
					});
				});
			}
		};
		if ($.browser.msie) {
			setTimeout(function() {
				informFunc();
			}, 500);
		} else {
			informFunc();
		}
	}
});