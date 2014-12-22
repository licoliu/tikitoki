$import("assets.js.core.utils.AJKHelpers");
$import("assets.js.core.component.AJKImageLoader");

Class.forName({
	name : "class assets.js.core.controller.AJKGalleryThumbsController extends Object",

	AJKGalleryThumbsController : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.domStage = data.domStage;
		self.thumbBlockSize = data.thumbBlockSize;
		self.createThumbBlockFunc = data.createThumbBlockFunc;
		self.images = "";
		self.controller = data.controller;
		self.viewportWidth = $(self.domRoot).width();
		self.selectedThumb = 0;
		self.domThumbs = new Array();
		self.thumbClass = "ajk-gallery-thumb-block";
		self.selectedThumbClass = data.selectedThumbClass;
		self.domThumbNextButton = data.domThumbNextButton;
		self.domThumbPrevButton = data.domThumbPrevButton;
		self.stageWidth = 0;
		self.numItems = 0;
		self.stageWidth = 0;
		self.numVisibleItems = 0;
		self.leftMostItem = 0;
		self.currentlyAnimating = false;
	},
	init : function() {
		var self = this;
		$(self.domStage).click(function(e) {
			var thumbBlock = assets.js.core.utils.AJKHelpers.getSelfOrFirstParantOfClass({
				domEl : e.target,
				className : self.thumbClass
			});
			if (thumbBlock) {
				var thumbIndex = parseInt($(thumbBlock).attr("thumbIndex"));
				self.thumbAtIndexWasClicked({
					thumbIndex : thumbIndex
				});
			}
		});
		$(self.domThumbNextButton).click(function() {
			self.scrollToLeftMostItemIndex({
				itemIndex : (self.leftMostItem + self.numVisibleItems)
			});
			return false;
		});
		$(self.domThumbPrevButton).click(function() {
			self.scrollToLeftMostItemIndex({
				itemIndex : (self.leftMostItem - self.numVisibleItems)
			});
			return false;
		});
		return self;
	},
	reset : function() {
		var self = this;
		$(self.domStage).empty();
		self.selectedThumb = 0;
		self.domThumbs = new Array();
		self.numItems = 0;
		self.leftMostItem = 0;
		$(self.domStage).css({
			left : 0
		});
	},
	loadWithImages : function(data) {
		var self = this;
		self.images = data.images;
		self.reset();
		var thumbCounter = 0;
		self.updateCarouselValues();
		self.updateControls();
		$(self.domStage).css({
			width : self.images.length * (self.thumbBlockSize.width + 5)
		});
		$.each(self.images, function() {
			var thisImage = this;
			var domThumbImage = $(this.domImage).clone().get()[0];
			var aDomThumb = self.createThumbBlockFunc({
				domImage : domThumbImage
			});
			$(aDomThumb).attr("thumbIndex", thumbCounter);
			$(aDomThumb).addClass(self.thumbClass);
			self.domThumbs.push(aDomThumb);
			$(self.domStage).append(aDomThumb);
			new assets.js.core.component.AJKImageLoader({
				imageUrl : $(domThumbImage).attr("src"),
				loadCallback : function() {
					assets.js.core.utils.AJKHelpers.sizeImageToFitInBoxOfSize({
						domImage : domThumbImage,
						boxSize : self.thumbBlockSize,
						imageOffset : thisImage.imageOffset
					});
					$(domThumbImage).css({
						opacity : 1
					});
				}
			}).init();
			thumbCounter++;
		});
		$(self.domThumbs[self.selectedThumb]).addClass(self.selectedThumbClass);
	},
	updateCarouselValues : function() {
		var self = this;
		self.numItems = self.images.length;
		self.stageWidth = (self.thumbBlockSize.width + self.thumbBlockSize.widthPadding) * self.numItems;
		self.numVisibleItems = parseInt(self.viewportWidth / self.thumbBlockSize.width);
	},
	scrollToLeftMostItemIndex : function(data) {
		var self = this;
		if (self.currentlyAnimating) {
			return;
		}
		var prevLeftMostItem = self.leftMostItem;
		self.currentlyAnimating = true;
		var itemIndex = data.itemIndex;
		itemIndex = (itemIndex >= (self.numItems - self.numVisibleItems)) ? self.numItems - self.numVisibleItems : itemIndex;
		itemIndex = (itemIndex < 0) ? 0 : itemIndex;
		self.leftMostItem = itemIndex;
		var distance = Math.abs(self.leftMostItem - prevLeftMostItem);
		var animSpeed = distance * 200;
		$(self.domStage).animate({
			left : -(self.thumbBlockSize.width + self.thumbBlockSize.widthPadding) * self.leftMostItem
		}, animSpeed, function() {
			self.currentlyAnimating = false;
		});
		self.updateControls();
	},
	updateControls : function() {
		var self = this;
		if (self.leftMostItem == 0) {
			$(self.domThumbPrevButton).css({
				display : "none"
			});
		} else {
			$(self.domThumbPrevButton).css({
				display : "block"
			});
		}
		if (self.leftMostItem + self.numVisibleItems < self.numItems) {
			$(self.domThumbNextButton).css({
				display : "block"
			});
		} else {
			$(self.domThumbNextButton).css({
				display : "none"
			});
		}
	},
	imageAtIndexWasClicked : function(data) {
		var self = this;
		var imageIndex = data.imageIndex;
		$(self.domThumbs[self.selectedThumb]).removeClass(self.selectedThumbClass);
		$(self.domThumbs[imageIndex]).addClass(self.selectedThumbClass);
		self.selectedThumb = imageIndex;
	},
	thumbAtIndexWasClicked : function(data) {
		var self = this;
		var thumbIndex = data.thumbIndex;
		if (thumbIndex == self.selectedThumb || self.controller.currentlyAnimating) {
			return;
		}
		var direction = (thumbIndex > self.selectedThumb) ? "forward" : "backward";
		self.controller.displayImageForIndex({
			index : thumbIndex,
			direction : direction
		});
		$(self.domThumbs[self.selectedThumb]).removeClass(self.selectedThumbClass);
		$(self.domThumbs[thumbIndex]).addClass(self.selectedThumbClass);
		self.selectedThumb = thumbIndex;
	}
});