$import("assets.js.core.event.AJKEvent");
Class.forName({
	name : "class assets.js.core.event.AJKWindowBlurEvent extends assets.js.core.event.AJKEvent",

	AJKWindowBlurEvent : function() {
		var self = this;
		self.domBody = $("body").get()[0];
		self.postMessageAvailable = (window.postMessage) ? true : false;
	},
	init : function() {
		var self = this;
		return self;
	},
	startEvent : function() {
		var self = this;
		if (!self.postMessageAvailable) {
			$(self.domBody).bind("mouseleave", function() {
				self.informObserversOfBlur();
			});
		} else {
			$(window).bind("blur", function() {
				if (!$.browser.msie) {
					self.informObserversOfBlur();
				}
			});
			$(document).bind("mouseout", function(e) {
				if (e.toElement == null && e.relatedTarget == null) {
					self.informObserversOfMouseLeave();
				}
			});
		}
	},
	endEvent : function() {
		var self = this;
		if (!self.postMessageAvailable) {
			$(self.domBody).unbind("mouseleave");
		} else {
			$(window).unbind("blur");
		}
	},
	informObserversOfBlur : function() {
		var self = this;
		$.each(self.observers, function() {
			if (this.windowDidBlur) {
				this.windowDidBlur();
			}
		});
	},
	informObserversOfMouseLeave : function() {
		var self = this;
		$.each(self.observers, function() {
			if (this.mouseDidLeavePage) {
				this.mouseDidLeavePage();
			}
		});
	}

});