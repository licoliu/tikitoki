Class.forName({
	name : "class assets.js.security.component.TLGeneralPurposePanel extends Object",

	TLGeneralPurposePanel : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.domTopContent = $(self.domRoot).find(".tl-ch-top-content div:eq(0)").get()[0];
		self.domMainContent = $(self.domRoot).find(".tl-ch-main-content").get()[0];
		self.domFooterContent = $(self.domRoot).find(".tl-mc-footer-content").get()[0];
		self.domClose = $(self.domRoot).find(".tl-ch-close-content").get()[0];
		self.domPanel = $(self.domRoot).find(".tl-main-content-block").get()[0];
		self.domMainInsertContent = data.domMainInsertContent;
		self.domFooterInsertContent = data.domFooterInsertContent;
		self.domFade = $(self.domRoot).find(".tl-mc-fade").get()[0];
		self.extraClass = data.extraClass;
		self.visible = false;
		self.oneOffClass = "";
		self.domCarousel = data.domCarousel;
		self.domCarouselStage = data.domCarouselStage;
		self.carouselInitalised = false;
		self.carouselLateralMovement = data.carouselLateralMovement;
		self.carouselDisabledClass = data.carouselDisabledClass;
		self.domCarouselNext = data.domCarouselNext;
		self.domCarouselPrev = data.domCarouselPrev;
	},
	init : function() {
		var self = this;
		$(self.domRoot).addClass(self.extraClass);
		$(self.domMainContent).append(self.domMainInsertContent);
		$(self.domFooterContent).append(self.domFooterInsertContent);
		$([ self.domClose, self.domFade ]).click(function() {
			self.close();
			return false;
		});
		return self;
	},
	initialiseSimpleCarousel : function() {
		var self = this;
		$(self.domCarouselNext).click(function() {
			$(self.domCarouselStage).animate({
				marginLeft : -self.carouselLateralMovement
			}, 500, function() {
			});
			$(this).addClass(self.carouselDisabledClass);
			$(self.domCarouselPrev).removeClass(self.carouselDisabledClass);
			return false;
		});
		$(self.domCarouselPrev).click(function() {
			$(self.domCarouselStage).animate({
				marginLeft : 0
			}, 500, function() {
			});
			$(this).addClass(self.carouselDisabledClass);
			$(self.domCarouselNext).removeClass(self.carouselDisabledClass);
			return false;
		});
		self.carouselInitalised = true;
	},
	show : function(data) {
		var self = this;
		var animTime = (data && data.instantly) ? 0 : 500;
		var oneOffClass = (data && data.oneOffClass) ? data.oneOffClass : "";
		if (oneOffClass) {
			if (self.oneOffClass) {
				$(self.domRoot).removeClass(self.oneOffClass);
			}
			self.oneOffClass = oneOffClass;
			$(self.domRoot).addClass(self.oneOffClass);
		}
		if (!self.visible) {
			if ($.browser.msie && $.browser.version < 9) {
				$(self.domRoot).css({
					display : "block",
					visibility : "hidden"
				});
				$("body").append(self.domRoot);
				self.windowDidResize({
					newSize : AJKHelpers.viewportSize()
				});
				setTimeout(function() {
					$(self.domRoot).css({
						visibility : "visible"
					});
					self.visible = true;
				}, 1);
			} else {
				$(self.domRoot).css({
					opacity : 0,
					display : "block"
				});
				$("body").append(self.domRoot);
				self.windowDidResize({
					newSize : AJKHelpers.viewportSize()
				});
				$(self.domRoot).animate({
					opacity : 1
				}, animTime, function() {
					self.visible = true;
				});
			}
			theAJKWindowResizeEvent.registerAsObserver({
				observer : self
			});
		}
	},
	close : function() {
		var self = this;
		if (self.visible) {
			if ($.browser.msie && $.browser.version < 9) {
				$(self.domRoot).css({
					display : "none"
				});
				$(self.domRoot).detach();
				if (self.oneOffClass) {
					$(self.domRoot).removeClass(self.oneOffClass);
					self.oneOffClass = "";
				}
			} else {
				$(self.domRoot).animate({
					opacity : 0
				}, 500, function() {
					$(self.domRoot).detach();
					$(self.domRoot).css({
						display : "none"
					});
					if (self.oneOffClass) {
						$(self.domRoot).removeClass(self.oneOffClass);
						self.oneOffClass = "";
					}
				});
			}
			theAJKWindowResizeEvent.removeAsObserver({
				observer : self
			});
			self.visible = false;
		}
	},
	windowDidResize : function(data) {
		var self = this;
		var newSize = data.newSize;
		var topOffset = parseInt((newSize.height - $(self.domPanel).height()) / 2);
		$(self.domPanel).css({
			top : topOffset
		});
		if (self.domCarousel && !self.carouselInitalised) {
			self.initialiseSimpleCarousel();
		}
	}
});