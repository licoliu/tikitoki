$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.core.component.TLCPImageViewer extends Object",

	TLCPImageViewer : function(data) {
		var self = this;
		self.controller = data.controller;
		self.timeline = self.controller.timeline;
		self.imageGallery = self.controller.imageGallery;
		self.domRoot = $("#tl-cp-image-viewer").get()[0];
		self.domClose = $(self.domRoot).find(".tl-cpiv-content-mask a").get()[0];
		self.domMask = $(self.domRoot).find(".tl-cpiv-content-mask-inner").get()[0];
		self.domCaption = $(self.domRoot).find(".tl-cpiv-caption-holder").get()[0];
		self.domImageHolder = $(self.domRoot).find(".tl-cpiv-main-item").get()[0];
		self.screenSize = {};
		self.active = false;
		self.animating = false;
	},
	init : function() {
		var self = this;
		$(self.domClose).click(function() {
			self.hide();
			return false;
		});
		return self;
	},
	launchWithImage : function(data) {
		var self = this;
		if (self.active) {
			return;
		}
		$(self.domRoot).removeClass("tl-cp-lightbox-2");
		if (data.lightbox == 1) {
			$(self.domRoot).addClass("tl-cp-lightbox-2");
		}
		self.screenSize = assets.js.core.utils.AJKHelpers.viewportSize();
		var story = data.story;
		var startSize = self.imageGallery.gallerySize;
		var startPos = assets.js.core.utils.AJKHelpers.getCoordsOfDomEl({
			domEl : self.imageGallery.domStageHolder
		});
		var galleryImage = self.galleryImage = self.imageGallery.images[data.imageIndex];
		var objImage = self.controller.selectedStory.images[data.imageIndex];
		var imageSize = {
			width : galleryImage.domImage.naturalWidth || galleryImage.size.width,
			height : galleryImage.domImage.naturalHeight || galleryImage.size.height
		};
		if (!imageSize.height) {
			return;
		}
		theAJKWindowResizeEvent.removeAsObserver({
			observer : self.controller
		});
		self.naturalImageSize = {
			width : imageSize.width,
			height : imageSize.height
		};
		self.domImage = $(self.imageGallery.images[data.imageIndex].domImage).clone();
		self.active = true;
		self.animating = true;
		var endSize = self.adjustImageSize({
			imageSize : imageSize
		});
		var newLeft = Math.round((self.screenSize.width - endSize.width) / 2);
		var newTop = Math.round((self.screenSize.height - endSize.height) / 2);
		$(self.domImageHolder).empty().append(self.domImage);
		if (objImage.caption) {
			$(self.domCaption).css({
				display : "block"
			}).find("p").empty().append(assets.js.core.utils.AJKHelpers.removeScript({
				content : objImage.caption
			}));
			$(self.domCaption).find("a").click(function() {
				window.open($(this).attr("href"));
				return false;
			});
		} else {
			$(self.domCaption).css({
				display : "none"
			});
		}
		if ($.browser.msie || self.timeline.expander != 2) {
			$(self.controller.domContentViewport).css({
				display : "none"
			});
			$(self.domImage).css({
				height : endSize.height,
				width : endSize.width,
				top : 0,
				left : 0
			});
			$(self.domRoot).css({
				width : endSize.width,
				height : endSize.height,
				left : newLeft,
				top : newTop,
				display : "block"
			});
			$(self.domMask).css({
				height : endSize.height - 2
			});
			self.animating = false;
			theAJKWindowResizeEvent.registerAsObserver({
				observer : self
			});
		} else {
			setTimeout(function() {
				$(self.domMask).css({
					height : startSize.height - 2
				});
				$(self.domRoot).css({
					width : startSize.width,
					height : startSize.height,
					left : startPos.x,
					top : startPos.y,
					display : "block",
					opacity : 0
				});
				$(self.domRoot).animate({
					opacity : 1
				}, 500);
				$(self.controller.domContentViewport).animate({
					opacity : 0
				}, 500, function() {
					$(this).css({
						display : "none"
					});
					$(self.domImage).animate({
						height : endSize.height,
						width : endSize.width,
						top : 0,
						left : 0
					}, 750);
					$(self.domRoot).animate({
						width : endSize.width,
						height : endSize.height,
						left : newLeft,
						top : newTop
					}, 750, function() {
						self.animating = false;
						theAJKWindowResizeEvent.registerAsObserver({
							observer : self
						});
					});
					$(self.domMask).animate({
						height : endSize.height - 2
					}, 750);
				});
			}, 10);
		}
	},
	adjustImageSize : function(data) {
		var self = this;
		var minSize = 320;
		var imageSize = data.imageSize;
		var retSize = {};
		if (imageSize.width >= imageSize.height && imageSize.height < minSize) {
			retSize.height = minSize;
			retSize.width = Math.round(imageSize.width * minSize / imageSize.height);
		} else if (imageSize.height > imageSize.width && imageSize.width < minSize) {
			retSize.width = minSize;
			retSize.height = Math.round(imageSize.height * minSize / imageSize.width);
		} else {
			retSize = imageSize;
		}
		return self.restrictImageSizeToScreen({
			imageSize : retSize
		});
	},
	restrictImageSizeToScreen : function(data) {
		var self = this;
		var padding = 40;
		var imageSize = data.imageSize;
		var screenSize = data.screenSize || assets.js.core.utils.AJKHelpers.viewportSize();
		var maxWidth = screenSize.width - padding;
		var maxHeight = screenSize.height - padding;
		var retSize = {
			width : imageSize.width,
			height : imageSize.height
		};
		if (imageSize.width > maxWidth) {
			retSize.width = maxWidth;
			retSize.height = imageSize.height * maxWidth / imageSize.width;
			imageSize = {
				width : retSize.width,
				height : retSize.height
			};
		}
		if (imageSize.height > maxHeight) {
			retSize.height = maxHeight;
			retSize.width = imageSize.width * maxHeight / imageSize.height;
		}
		return retSize;
	},
	windowDidResize : function(data) {
		var self = this;
		var newSize = data.newSize;
		var imageSize = self.adjustImageSize({
			imageSize : self.naturalImageSize
		});
		var newLeft = Math.round((newSize.width - imageSize.width) / 2);
		var newTop = Math.round((newSize.height - imageSize.height) / 2);
		$(self.domRoot).css({
			width : imageSize.width,
			height : imageSize.height,
			left : newLeft,
			top : newTop
		});
		$(self.domImage).css({
			height : imageSize.height,
			width : imageSize.width
		});
		$(self.domMask).css({
			height : imageSize.height - 2
		});
	},
	hide : function(data) {
		var self = this;
		if (!self.active || self.animating) {
			return;
		}
		theAJKWindowResizeEvent.removeAsObserver({
			observer : self
		});
		theAJKWindowResizeEvent.registerAsObserver({
			observer : self.controller
		});
		$(self.controller.domContentViewport).css({
			visibility : "hidden",
			display : "block"
		});
		self.controller.windowDidResize({
			newSize : assets.js.core.utils.AJKHelpers.viewportSize()
		});
		if ($.browser.msie || self.timeline.expander != 2) {
			$(self.domRoot).css({
				display : "none"
			});
			$(self.controller.domContentViewport).css({
				visibility : "visible"
			});
			if (!$.browser.msie) {
				$(self.controller.domContentViewport).css({
					opacity : 1
				});
			}
			self.animating = false;
			self.active = false;
		} else {
			self.animating = true;
			var domGImage = self.galleryImage.domImage;
			var origSize = {
				width : $(domGImage).width(),
				height : $(domGImage).height(),
				top : parseInt($(domGImage).css("top")),
				left : parseInt($(domGImage).css("left"))
			};
			var endSize = self.imageGallery.gallerySize;
			var endPos = assets.js.core.utils.AJKHelpers.getCoordsOfDomEl({
				domEl : self.imageGallery.domStageHolder
			});
			$(self.domImage).animate({
				height : origSize.height,
				width : origSize.width,
				top : origSize.top,
				left : origSize.left
			}, 750);
			$(self.domMask).animate({
				height : endSize.height - 2
			}, 750);
			$(self.domRoot).animate({
				width : endSize.width,
				height : endSize.height,
				left : endPos.x,
				top : endPos.y
			}, 750, function() {
				$(self.controller.domContentViewport).css({
					visibility : "visible"
				}).animate({
					opacity : 1
				}, 500, function() {
					$(self.domRoot).css({
						display : "none"
					});
					self.animating = false;
					self.active = false;
				});
				$(self.domRoot).animate({
					opacity : 0
				}, 800);
			});
		}
	}
});