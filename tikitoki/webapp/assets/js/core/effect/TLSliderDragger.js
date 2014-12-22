$import("assets.js.core.effect.AJKDraggable");
Class.forName({
	name : "class assets.js.core.effect.TLSliderDragger extends Object",

	TLSliderDragger : function(data) {
		var self = this;
		self.domEl = data.domEl;
		self.domInner = $(data.domEl).find(".tlsd-inner").get()[0];
		self.domInnerInner = $(data.domEl).find(".tlsd-inner-inner").get()[0];
		self.getStageWidth = data.getStageWidth;
		self.getSliderWidth = data.getSliderWidth;
		self.getSliderScaleWidth = data.getSliderScaleWidth;
		self.width = 0;
		self.minWidth = theTLSettings.sliderDraggerMinWidth;
		self.dragCallback = data.dragCallback;
		self.dragEndedCallback = data.dragEndedCallback;
		self.padding = 15;
		self.draggable = "";
		self.beingDragged = false;
	},
	init : function() {
		var self = this;
		self.updateDraggerSize();
		var draggerTop = parseInt($(self.domEl).css("top"), 10);
		self.draggable = new assets.js.core.effect.AJKDraggable({
			domDragEl : self.domEl,
			limitFunc : function() {
				var limit = {
					minX : 0,
					maxX : self.getSliderWidth() - self.width,
					minY : draggerTop,
					maxY : draggerTop
				};
				return limit;
			},
			mouseMoveFunc : function(data) {
				self.draggedToLeftPos(data);
			},
			dragDidStartFunc : function() {
				self.beingDragged = true;
				theTLSettings.lastSelectedStory = "";
			},
			dragDidEndFunc : function() {
				self.dragEndedCallback();
				setTimeout(function() {
					self.beingDragged = false;
				}, 100);
			}
		}).init();
		return self;
	},
	updateColour : function(data) {
		var self = this;
		var colour = "#" + data.colour;
		$(self.domInner).css({
			borderColor : colour
		});
		$(self.domInner).find(".tlsd-corner").css({
			backgroundColor : colour
		});
	},
	kill : function() {
		var self = this;
		self.draggable.kill();
	},
	draggedToLeftPos : function(data) {
		var self = this;
		var dragElPos = data.dragElPos;
		self.dragCallback({
			xPos : dragElPos.x
		});
	},
	updateDraggerSize : function() {
		var self = this;
		var view3D = theTLMainController.selected3DView;
		if (view3D && view3D.active) {
			self.width = 40;
		} else {
			self.width = parseInt(theTLSettings.windowSize.width / self.getStageWidth() * self.getSliderScaleWidth(), 10);
			self.width = parseInt(self.width / 2, 10) * 2 + self.padding * 2;
			self.width = (self.width > self.minWidth) ? self.width : self.minWidth;
			self.width = (self.width > self.getSliderScaleWidth()) ? self.getSliderScaleWidth() : self.width;
		}
		$(self.domEl).css({
			width : self.width
		});
		$(self.domInner).css({
			width : self.width - 24
		});
	},
	setLeftPosition : function(data) {
		var self = this;
		var pos = data.pos;
		var animate = data.animate;
		var animSpeed = (animate) ? theTLSettings.animateTime : 0;
		$(self.domEl).stop().animate({
			left : pos
		}, animSpeed);
	}
});