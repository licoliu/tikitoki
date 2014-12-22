$import("assets.js.core.effect.AJKImageTransitions");
$import("assets.js.core.controller.AJKGalleryThumbsController");
$import("assets.js.core.component.AJKImage");

Class.forName({
	name : "class assets.js.core.component.AJKImageGallery extends Object",

	AJKImageGallery : function(data) {
		var self = this;
		self.domRootEl = data.domRootEl;
		self.imageInfoFunction = data.imageInfoFunction;
		self.domImageStorage = $(self.domRootEl).find(".ak-gallery-image-storage").get()[0];
		self.domImages = "";
		self.numImages = "";
		self.createImageInfoHTML = data.createImageInfoHTML;
		self.imageWasSelected = data.imageWasSelected;
		self.createDomImage = data.createDomImage;
		self.buttonHideClass = data.buttonHideClass;
		self.domNextButton = data.domNextButton;
		self.domPrevButton = data.domPrevButton;
		self.images = new Array();
		self.gallerySize = {
			width : $(this.domRootEl).width(),
			height : $(this.domRootEl).height()
		};
		self.domStageHolder = data.domStageHolder;
		self.domStage = data.domStage;
		self.selectedImageIndex = 0;
		self.previousImage = false;
		self.transition = assets.js.core.effect.AJKImageTransitions.makeTransition({
			transition : (data.transition || "SimpleSwitch")
		});
		self.currentlyAnimating = false;
		self.imageHolderHTML = data.imageHolderHTML;
		self.thumbBlockSize = data.thumbBlockSize;
		self.domThumbsHolder = data.domThumbsHolder;
		self.domThumbsStage = data.domThumbsStage;
		self.createThumbBlockFunc = data.createThumbBlockFunc;
		self.galleryThumbsController = "";
		self.selectedThumbClass = data.selectedThumbClass;
		self.domThumbNextButton = data.domThumbNextButton;
		self.domThumbPrevButton = data.domThumbPrevButton;
		self.resizeCallbackFunc = data.resizeCallbackFunc;
		self.thumbsShowing = true;
		self.animatingClass = "tl-gallery-animating";
		return self;
	},
	init : function() {
		var self = this;
		$(self.domStageHolder).css({
			width : self.gallerySize.width + "px",
			height : self.gallerySize.height + "px"
		});
		$(self.domStage).css({
			width : self.gallerySize.width + "px",
			height : self.gallerySize.height + "px"
		});
		$(self.domNextButton).click(function() {
			self.displayNextImage();
			return false;
		});
		$(self.domPrevButton).click(function() {
			self.displayPrevImage();
			return false;
		});
		if (self.domThumbsHolder) {
			self.galleryThumbsController = new assets.js.core.controller.AJKGalleryThumbsController({
				domRoot : self.domThumbsHolder,
				domStage : self.domThumbsStage,
				thumbBlockSize : self.thumbBlockSize,
				createThumbBlockFunc : self.createThumbBlockFunc,
				controller : self,
				selectedThumbClass : self.selectedThumbClass,
				domThumbNextButton : self.domThumbNextButton,
				domThumbPrevButton : self.domThumbPrevButton
			}).init();
		}
		self.transition.init({
			domStage : self.domStage,
			displaySize : self.gallerySize
		});
		return self;
	},
	reset : function() {
		var self = this;
		$(self.domStage).empty();
		self.images = new Array();
		self.domImages = new Array();
		self.numImages = 0;
		self.selectedImageIndex = 0;
		self.previousImage = false;
		self.currentlyAnimating = false;
	},
	loadWithImages : function(data) {
		var self = this;
		var clearTransition = data.clearTransition;
		var originalImages = data.images;
		if (clearTransition) {
			self.transition.previousImage = false;
		}
		self.reset();
		var counter = 0;
		self.numImages = originalImages.length;
		if (self.numImages < 2) {
			$(self.domNextButton).addClass(self.buttonHideClass);
			$(self.domPrevButton).addClass(self.buttonHideClass);
		} else {
			$(self.domNextButton).removeClass(self.buttonHideClass);
			$(self.domPrevButton).removeClass(self.buttonHideClass);
		}
		$.each(originalImages, function() {
			var imageInfoHTML = self.createImageInfoHTML({
				image : this
			});
			var aDomImage = self.createDomImage({
				image : this
			});
			var imageOffset = this.thumbPosition;
			self.domImages.push(aDomImage);
			var anImage = new assets.js.core.component.AJKImage({
				gallery : self,
				displaySize : self.gallerySize,
				domImage : aDomImage,
				imageInfoFunction : self.imageInfoFunction,
				imageInfoHTML : imageInfoHTML,
				imageHolderHTML : self.imageHolderHTML,
				index : counter++,
				imageOffset : imageOffset
			}).init();
			$(aDomImage).addClass("image-item");
			$(self.domImageStorage).prepend(anImage.html);
			self.images.push(anImage);
		});
		self.galleryThumbsController.loadWithImages({
			images : self.images
		});
		self.displayImageForIndex({
			index : 0
		});
	},
	hideThumbs : function() {
		var self = this;
		if (self.thumbsShowing) {
			self.thumbsShowing = false;
			$(self.domThumbsHolder).addClass("tl-g-thumb-holder-invisible");
		}
	},
	showThumbs : function() {
		var self = this;
		if (!self.thumbsShowing) {
			self.thumbsShowing = true;
			$(self.domThumbsHolder).removeClass("tl-g-thumb-holder-invisible");
		}
	},
	displayImageForIndex : function(data) {
		var self = this;
		var index = data.index;
		var direction = data.direction;
		self.selectedImageIndex = index;
		if (self.galleryThumbsController) {
			self.galleryThumbsController.imageAtIndexWasClicked({
				imageIndex : index
			});
		}
		;
		self.currentlyAnimating = true;
		$(self.domRootEl).addClass(self.animatingClass);
		self.transition.showImage({
			anImage : self.images[index],
			direction : direction,
			callback : function() {
				$(self.domRootEl).removeClass(self.animatingClass);
				self.currentlyAnimating = false;
			}
		});
		self.previousImage = self.images[index];
		if (self.imageWasSelected) {
			self.imageWasSelected({
				anImage : self.previousImage
			});
		}
	},
	displayNextImage : function() {
		var self = this;
		if (self.currentlyAnimating) {
			return false;
		}
		newIndex = (self.selectedImageIndex >= (self.numImages - 1)) ? 0 : self.selectedImageIndex + 1;
		self.displayImageForIndex({
			index : newIndex,
			direction : "forward"
		});
	},
	displayPrevImage : function() {
		var self = this;
		if (self.currentlyAnimating) {
			return false;
		}
		newIndex = (self.selectedImageIndex >= 1) ? self.selectedImageIndex - 1 : (self.numImages - 1);
		self.displayImageForIndex({
			index : newIndex,
			direction : "backward"
		});
	},
	updateSizeTo : function(data) {
		var self = this;
		var size = data.size;
		self.gallerySize = size;
		$(self.domRootEl).css({
			height : size.adjustmentHeight
		});
		$(self.domStageHolder).css({
			height : size.height,
			width : size.width
		});
		$.each(self.images, function() {
			this.resizeTo({
				size : size
			});
		});
		self.transition.updateDisplaySize({
			size : size
		});
		if (self.resizeCallbackFunc) {
			self.resizeCallbackFunc({
				newSize : size
			});
		}
	}
});