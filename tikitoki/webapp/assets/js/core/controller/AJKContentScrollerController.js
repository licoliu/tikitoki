$import("assets.js.core.effect.AJKDraggable");

Class.forName({
	name : "class assets.js.core.controller.AJKContentScrollerController extends Object",

	AJKContentScrollerController : function(data) {
		this.domRootEl = data.domRootEl;
		this.maxHeight = data.maxHeight;
		this.domStage = $(this.domRootEl).find(".ajk-cs-carousel-stage").get()[0];
		this.domScrollHolder = $(this.domRootEl).find(".ajk-cs-carousel-scroll-holder").get()[0];
		this.domScrollBar = $(this.domRootEl).find(".ajk-cs-scroll-bar").get()[0];
		this.domUpArrow = $(this.domRootEl).find(".ajk-cs-up-arrow").get()[0];
		this.domDownArrow = $(this.domRootEl).find(".ajk-cs-down-arrow").get()[0];
		this.carouselHeight = 0;
		this.stageHeight = 0;
		this.topOffset = 0;
		this.carouselWidth = 0;
		this.arrowPadding = 14;
		this.scrollBarHeight = 0;
		this.scrollDragInitialised = false;
		this.domScrollBarUp = $(this.domScrollHolder).find("a.ajk-cs-up-arrow").get()[0];
		this.domScrollBarDown = $(this.domScrollHolder).find("a.ajk-cs-down-arrow").get()[0];
		this.currentlyScrolling = false;
		this.idealCarouselHeight = 0;
	},
	init : function() {
		var self = this;
		$(self.domScrollBarUp).unbind("click").click(function() {
			self.scrollUp();
			return false;
		});
		$(self.domScrollBarDown).unbind("click").click(function() {
			self.scrollDown();
			return false;
		});
		$(self.domRootEl).hover(function() {
			theAJKMouseScrollEvent.registerAsObserver({
				observer : self
			});
		}, function() {
			theAJKMouseScrollEvent.removeAsObserver({
				observer : self
			});
		});
		return self;
	},
	mouseDidScroll : function(data) {
		var self = this;
		var delta = -data.delta;
		var maxScrollDistance = self.stageHeight - self.carouselHeight;
		var newPos = this.topOffset + delta * maxScrollDistance / 20;
		self.animateToPos({
			pos : newPos,
			instantly : true
		});
	},
	reset : function() {
		var self = this;
		self.topOffset = 0;
		$(self.domStage).css({
			top : 0
		});
		$(self.domScrollBar).css({
			top : self.arrowPadding
		});
	},
	resetSize : function() {
		var self = this;
		self.idealCarouselHeight = false;
		self.enable();
	},
	enable : function() {
		var self = this;
		self.carouselHeight = $(self.domRootEl).height();
		if (self.carouselHeight && !self.idealCarouselHeight) {
			self.idealCarouselHeight = self.carouselHeight;
		}
		self.carouselWidth = $(self.domRootEl).width();
		self.stageHeight = $(self.domStage).height();
		if (self.stageHeight < self.idealCarouselHeight) {
			self.carouselHeight = self.stageHeight;
		} else {
			self.carouselHeight = self.idealCarouselHeight;
		}
		$(self.domRootEl).css({
			height : self.carouselHeight
		});
		self.topOffset = -parseInt($(self.domStage).css("top"), 10);
		if (self.topOffset > (self.stageHeight - self.carouselHeight)) {
			self.topOffset = (self.stageHeight - self.carouselHeight);
			$(self.domStage).css({
				top : -self.topOffset
			});
		}
		if (self.stageHeight > self.carouselHeight) {
			self.displayScroller();
			if (!self.scrollDragInitialised) {
				self.scrollDragInitialised = true;
				var aDraggable = new assets.js.core.effect.AJKDraggable({
					domDragEl : self.domScrollBar,
					limitFunc : function() {
						var limit = {
							minX : 0,
							maxX : 0,
							minY : self.arrowPadding,
							maxY : self.carouselHeight - self.arrowPadding - self.scrollBarHeight
						};
						return limit;
					},
					mouseMoveFunc : function(data) {
						var dragElPos = data.dragElPos;
						self.updateCarouselFromScrollBarPos({
							scrollBarPos : dragElPos
						});
					}
				}).init();
				if (typeof TLGLOBALIsTouchDevice != "undefined" && TLGLOBALIsTouchDevice) {
					var contentDraggable = new assets.js.core.effect.AJKDraggable({
						domDragEl : self.domStage,
						limitFunc : function() {
							var limit = {
								minX : 0,
								maxX : 0,
								minY : -(self.stageHeight - self.carouselHeight),
								maxY : 0
							};
							return limit;
						},
						mouseMoveFunc : function(data) {
							var dragElPos = data.dragElPos;
							self.animateToPos({
								pos : -dragElPos.y,
								instantly : true
							});
						}
					}).init();
				}
			}
		} else {
			self.hideScroller();
		}
	},
	animateToTop : function(data) {
		var self = this;
		var callback = (data) ? data.callback : "";
		self.animateToPos({
			pos : 0,
			callback : function() {
				if (callback) {
					callback();
				}
			}
		});
	},
	animateToPos : function(data) {
		var self = this;
		if (self.currentlyScrolling) {
			return;
		}
		self.currentlyScrolling = true;
		var instantly = (data) ? data.instantly : "";
		var duration = (instantly) ? 0 : 300;
		var callback = (data) ? data.callback : "";
		self.topOffset = data.pos;
		self.topOffset = (self.topOffset < 0) ? 0 : self.topOffset;
		self.topOffset = (self.topOffset > (self.stageHeight - self.carouselHeight)) ? self.stageHeight - self.carouselHeight : self.topOffset;
		if (self.stageHeight != self.carouselHeight) {
			var scrollTopOffset = (self.topOffset / (self.stageHeight - self.carouselHeight) * (self.carouselHeight - 2 * self.arrowPadding - self.scrollBarHeight))
					+ self.arrowPadding;
		} else {
			var scrollTopOffset = 0;
		}
		$(self.domStage).animate({
			top : -self.topOffset
		}, duration, function() {
			self.currentlyScrolling = false;
			if (callback) {
				callback();
			}
		});
		$(self.domScrollBar).animate({
			top : scrollTopOffset
		}, duration, function() {
		});
	},
	scrollUp : function() {
		var self = this;
		self.topOffset = self.topOffset - self.carouselHeight;
		self.animateToPos({
			pos : self.topOffset
		});
	},
	scrollDown : function() {
		var self = this;
		self.topOffset = self.topOffset + self.carouselHeight;
		self.animateToPos({
			pos : self.topOffset
		});
	},
	displayScroller : function() {
		var self = this;
		$(self.domScrollHolder).css({
			display : "block",
			height : self.carouselHeight
		});
		$(self.domStage).css({
			width : self.carouselWidth - 20
		});
		self.scrollBarHeight = self.carouselHeight / self.stageHeight * (self.carouselHeight - (self.arrowPadding * 2));
		self.scrollBarHeight = (self.scrollBarHeight < 20) ? 20 : self.scrollBarHeight;
		if (self.stageHeight != self.carouselHeight) {
			var scrollTopOffset = (self.topOffset / (self.stageHeight - self.carouselHeight) * (self.carouselHeight - 2 * self.arrowPadding - self.scrollBarHeight))
					+ self.arrowPadding;
		} else {
			var scrollTopOffset = 0;
		}
		$(self.domScrollBar).css({
			top : scrollTopOffset,
			height : self.scrollBarHeight
		});
	},
	hideScroller : function() {
		var self = this;
		$(self.domScrollHolder).css({
			display : "none"
		});
		$(self.domStage).css({
			width : self.carouselWidth
		});
	},
	updateCarouselFromScrollBarPos : function(data) {
		var self = this;
		var scrollBarPos = data.scrollBarPos;
		var carouselTopOffset = (scrollBarPos.y - self.arrowPadding) / (self.carouselHeight - self.scrollBarHeight - 2 * self.arrowPadding);
		self.topOffset = carouselTopOffset * (self.stageHeight - self.carouselHeight);
		$(self.domStage).css({
			top : -self.topOffset
		});
	}
});