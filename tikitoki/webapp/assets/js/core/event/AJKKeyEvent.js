$import("assets.js.core.event.AJKEvent");

Class.forName({
	name : "class assets.js.core.event.AJKKeyEvent extends assets.js.core.event.AJKEvent",

	AJKKeyEvent : function() {
		var self = this;
		self.isInputFocussed = false;
	},
	init : function() {
		var self = this;
		$(document).keyup(function(e) {
			if (e.target.tagName != "INPUT" && e.target.tagName != "TEXTAREA") {
				self.informObservers({
					key : e.keyCode,
					mode : "keyup"
				});
			}
		});
		return self;
	},
	informObservers : function(data) {
		var self = this;
		$.each(self.observers, function() {
			if (this.keyEventTookPlace) {
				this.keyEventTookPlace(data);
			}
		});
	}

});