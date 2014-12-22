$import("assets.js.core.event.AJKEvent");

Class.forName({
	name : "class assets.js.core.event.AJKMouseMoveEvent extends assets.js.core.event.AJKEvent",

	AJKMouseMoveEvent : function() {
	},

	init : function() {
		var self = this;
		return self;
	},
	startEvent : function() {
		var self = this;
		self.mouseMoveBoundFunc = "";
		self.mouseUpBoundFunc = "";
		$(document).bind("mousemove", self.mouseMoveBoundFunc = function(e) {
			e.preventDefault();
			var mousePos = self.getMousePos({
				event : e
			});
			self.informObserversOfMouseMove({
				coords : mousePos
			});
			return false;
		}).bind("mouseup", self.mouseUpBoundFunc = function(e) {
			var mousePos = self.getMousePos({
				event : e
			});
			self.informObserversOfMouseUp({
				coords : mousePos
			});
		});
		self.active = true;
	},
	getMousePos : function(dataObj) {
		var self = this;
		var event = dataObj.event;
		xPos = yPos = false;
		if (document.layers) {
			xPos = event.x;
			yPos = event.y;
		} else if (document.all) {
			xPos = window.event.clientX;
			yPos = window.event.clientY;
		} else if (document.getElementById) {
			xPos = event.clientX;
			yPos = event.clientY;
		}
		return {
			x : xPos,
			y : yPos
		};
	},
	endEvent : function() {
		var self = this;
		$(document).unbind("mousemove", self.mouseMoveBoundFunc);
		$(document).unbind("mouseup", self.mouseUpBoundFunc);
		self.active = false;
	},
	informObserversOfMouseMove : function(dataObj) {
		var self = this;
		var coords = dataObj.coords;
		$.each(self.observers, function() {
			if (this.mouseDidMove) {
				this.mouseDidMove({
					coords : coords
				});
			}
		});
	},
	informObserversOfMouseUp : function(dataObj) {
		var self = this;
		var coords = dataObj.coords;
		$.each(self.observers, function() {
			if (this.mouseDidUp) {
				this.mouseDidUp({
					coords : coords
				});
			}
		});
	}

});
