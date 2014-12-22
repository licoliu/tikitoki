$import("assets.js.core.utils.AJKHelpers");

Class.forName({
	name : "class assets.js.core.effect.AJKDraggable extends assets.js.core.utils.Observable",

	"@Getter @Setter private active" : false,
	"public static cancelClick" : false,

	AJKDraggable : function(dataObj) {
		this.domDragEl = dataObj.domDragEl;
		this.cloneable = dataObj.cloneable;
		this.limitFunc = dataObj.limitFunc;
		this.dragDidStartFunc = dataObj.dragDidStartFunc;
		this.dragDidEndFunc = dataObj.dragDidEndFunc;
		this.limits = "";
		this.offsetInEl = {
			x : 0,
			y : 0
		};
		this.localStartCoords = {
			x : 0,
			y : 0
		};
		this.startMousePos = {
			x : 0,
			y : 0
		};
		this.domDraggable = "";
		this.mouseMoveFunc = dataObj.mouseMoveFunc;
		this.type = dataObj.type;
		this.data = (dataObj.data) ? (dataObj.data) : "";
		this.owner = (dataObj.owner) ? (dataObj.owner) : "";
		this.cloneClass = dataObj.cloneClass;
		this.savedCoords = "";
		this.domBody = $("body").get()[0];
		this.multiplier = (dataObj.multiplier) ? dataObj.multiplier : 1;
	},

	init : function() {
		var self = this;
		$(self.domDragEl).mousedown(function(e) {
			self.initiateDrag({
				event : e
			});
		});
		return self;
	},
	kill : function() {
		var self = this;
		$(self.domDragEl).unbind();
		theAJKMouseMoveEvent.removeAsObserver({
			observer : self
		});
		theAJKWindowBlurEvent.removeAsObserver({
			observer : self
		});
	},
	initiateDrag : function(dataObj) {
		var self = this;
		var event = dataObj.event;
		self.currentlyDragging = true;
		self.domDraggable = (self.cloneable) ? $(this.domDragEl).clone().get()[0] : this.domDragEl;
		if (self.cloneClass) {
			$(self.domDraggable).addClass(self.cloneClass);
		}
		$(self.domDraggable).addClass("rt-draggable");
		assets.js.core.utils.AJKHelpers.cancelSelectionOnDomEl({
			domEl : self.domDraggable
		});
		if (!assets.js.core.utils.AJKHelpers.isIDevice()) {
			$(self.domBody).addClass("gt-apply-drag-styles");
		}
		self.startMousePos = theAJKMouseMoveEvent.getMousePos({
			event : event
		});
		self.savedCoords = self.startMousePos;
		var itemPos = assets.js.core.utils.AJKHelpers.getCoordsOfDomEl({
			domEl : self.domDragEl
		});
		self.offsetInEl = {
			x : self.startMousePos.x - itemPos.x,
			y : self.startMousePos.y - itemPos.y
		};
		if (self.type && theAJKMouseMoveEvent.observersOfType[self.type]) {
			$.each(theAJKMouseMoveEvent.observersOfType[self.type], function() {
				if (this.dragDidStart) {
					this.dragDidStart({
						coords : self.startMousePos,
						data : self.data
					});
				}
			});
		}
		if (self.cloneable) {
			$(self.domDraggable).css({
				width : $(this.domDragEl).width(),
				left : itemPos.x,
				top : itemPos.y,
				position : "fixed",
				opacity : 0.7
			});
			$("body").append(self.domDraggable);
		}
		self.localStartCoords = {
			x : parseInt($(self.domDraggable).css("left")),
			y : parseInt($(self.domDraggable).css("top"))
		};
		self.limits = (self.limitFunc) ? self.limitFunc() : "";
		theAJKMouseMoveEvent.registerAsObserver({
			observer : self
		});
		theAJKWindowBlurEvent.registerAsObserver({
			observer : self
		});
		if (self.dragDidStartFunc) {
			self.dragDidStartFunc();
		}
	},
	windowDidBlur : function() {
		var self = this;
		self.mouseDidUp({
			coords : self.savedCoords
		});
	},
	endDrag : function(dataObj) {
		var self = this;
		var coords = dataObj.coords;
		var useStandardDragEndAnimation = dataObj.useStandardDragEndAnimation;
		theAJKMouseMoveEvent.removeAsObserver({
			observer : self
		});
		theAJKWindowBlurEvent.removeAsObserver({
			observer : self
		});
		if (this.cloneable) {
			if (useStandardDragEndAnimation) {
				var distance = (self.localStartCoords.x - coords.x) * (self.localStartCoords.x - coords.x);
				distance += (self.localStartCoords.y - coords.y) * (self.localStartCoords.y - coords.y);
				var duration = parseInt(Math.sqrt(parseInt(distance))) * 1.5;
				duration = (duration < 250) ? 250 : duration;
				duration = (duration > 500) ? 500 : duration;
				$(self.domDraggable).animate({
					left : self.localStartCoords.x,
					top : self.localStartCoords.y
				}, duration, function() {
					$(this).removeClass("rt-draggable");
					$(this).remove();
				});
			} else {
				$(self.domDraggable).animate({
					opacity : 0
				}, 400, function() {
					$(this).remove();
				});
			}
		}
		if (self.dragDidEndFunc) {
			self.dragDidEndFunc();
		}
		$(self.domBody).removeClass("gt-apply-drag-styles");
	},
	mouseDidUp : function(dataObj) {
		var self = this;
		var coords = dataObj.coords;
		var useStandardDragEndAnimation = true;
		if (self.type && theAJKMouseMoveEvent.observersOfType[self.type]) {
			$.each(theAJKMouseMoveEvent.observersOfType[self.type], function() {
				if (this.dragDidEnd && this.dragDidEnd({
					coords : coords,
					data : self.data,
					owner : self.owner,
					type : self.type
				})) {
					useStandardDragEndAnimation = false;
				}
			});
		}
		self.endDrag({
			useStandardDragEndAnimation : useStandardDragEndAnimation,
			coords : coords
		});
		setTimeout(function() {
			assets.js.core.effect.AJKDraggable.cancelClick = false;
		}, 1);
	},
	mouseDidMove : function(dataObj) {
		var self = this;
		var newMouseCoords = dataObj.coords;
		assets.js.core.effect.AJKDraggable.cancelClick = true;
		var newPos = {
			x : (newMouseCoords.x - self.startMousePos.x) * self.multiplier + self.localStartCoords.x,
			y : (newMouseCoords.y - self.startMousePos.y) * self.multiplier + self.localStartCoords.y
		};
		if (self.limits) {
			if (self.limits.maxX >= self.limits.minX) {
				newPos.x = (newPos.x < self.limits.minX) ? self.limits.minX : newPos.x;
				newPos.x = (newPos.x > self.limits.maxX) ? self.limits.maxX : newPos.x;
			} else {
				newPos.x = (newPos.x > self.limits.minX) ? self.limits.minX : newPos.x;
				newPos.x = (newPos.x < self.limits.maxX) ? self.limits.maxX : newPos.x;
			}
			if (self.limits.maxY >= self.limits.minY) {
				newPos.y = (newPos.y < self.limits.minY) ? self.limits.minY : newPos.y;
				newPos.y = (newPos.y > self.limits.maxY) ? self.limits.maxY : newPos.y;
			} else {
				newPos.y = (newPos.y > self.limits.minY) ? self.limits.minY : newPos.y;
				newPos.y = (newPos.y < self.limits.maxY) ? self.limits.maxY : newPos.y;
			}
		}
		self.savedCoords = newMouseCoords;
		var timeoutTime = ($.browser.msie || $.browser.isIOS) ? 10 : 0;
		setTimeout(function() {
			$(self.domDraggable).css({
				top : newPos.y,
				left : newPos.x
			});
			if (self.mouseMoveFunc) {
				self.mouseMoveFunc({
					dragElPos : newPos
				});
			}
			if (self.type && theAJKMouseMoveEvent.observersOfType[self.type]) {
				$.each(theAJKMouseMoveEvent.observersOfType[self.type], function() {
					if (this.dragDidMove) {
						this.dragDidMove({
							coords : newMouseCoords,
							data : self.data
						});
					}
				});
			}
		}, timeoutTime);
	}
});