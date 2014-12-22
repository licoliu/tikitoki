$import("assets.js.core.effect.AJKDraggable");

Class.forName({
	name : "class assets.js.core.component.AJKValueSlider extends Object",

	AJKValueSlider : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.domDragger = data.domDragger;
		self.limitFunc = data.limitFunc;
		self.dragger = "";
		self.value = "";
		self.range = data.range;
		self.callback = data.callback;
		self.name = data.name;
	},
	"public static slidersByName" : [],
	init : function() {
		var self = this;
		AJKValueSlider.slidersByName[self.name] = self;
		self.dragger = new assets.js.core.effect.AJKDraggable({
			domDragEl : self.domDragger,
			limitFunc : self.limitFunc,
			mouseMoveFunc : function(data) {
				var newVal = data.dragElPos.x / self.limitFunc().maxX * (self.range.max - self.range.min) + self.range.min;
				self.callback({
					newVal : newVal
				});
			},
			dragDidStartFunc : function() {
			},
			dragDidEndFunc : function(data) {
			}
		}).init();
		return self;
	},
	setValue : function(data) {
		var self = this;
		self.value = (data.value) ? parseFloat(data.value) : self.range.min;
		var maxPos = self.limitFunc().maxX;
		var pos = (self.value - self.range.min) / (self.range.max - self.range.min) * maxPos;
		$(self.domDragger).css({
			left : pos
		});
	}
});