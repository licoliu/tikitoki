$import("assets.js.core.event.AJKEvent");
$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.core.event.AJKMouseScrollEvent extends assets.js.core.event.AJKEvent",

	AJKMouseScrollEvent : function(data) {
		this.preventCallback = false;
		this.disableScrollPropagation = data.disableScrollPropagation;
		return this;
	},
	init : function() {
		var self = this;
		$("body").mousewheel(function(event, delta) {
			self.informObserversOfScroll({
				delta : delta
			});
			if (self.disableScrollPropagation) {
				return false;
			}
		});
		return self;
	},
	informObserversOfScroll : function(data) {
		var self = this;
		var delta = data.delta;
		delta = (delta > 1) ? 1 : delta;
		delta = (delta < -1) ? -1 : delta;
		$.each(self.observers, function() {
			if (((this.onlyMouseScrollIfAlone && self.observers.length == 1) || !this.onlyMouseScrollIfAlone) && this.mouseDidScroll && !self.preventCallback) {
				this.mouseDidScroll({
					delta : delta
				});
			}
		});
	},
	registerAsObserver : function(data) {
		var self = this;
		var observer = data.observer;
		self.observers = assets.js.core.utils.AJKHelpers.removeItemFromArray({
			anArray : self.observers,
			item : observer
		});
		self.observers.push(observer);
		self.preventCallback = false;
	},
	removeAsObserver : function(data) {
		var self = this;
		var observer = data.observer;
		self.observers = assets.js.core.utils.AJKHelpers.removeItemFromArray({
			anArray : self.observers,
			item : observer
		});
		if (self.observers.length == 1) {
			this.preventCallback = true;
			setTimeout(function() {
				self.preventCallback = false;
			}, 500);
		}
	}
});