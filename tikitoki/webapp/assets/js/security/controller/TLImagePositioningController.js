Class.forName({
	name : "class assets.js.security.controller.TLImagePositioningController extends Object",

	TLImagePositioningController : function(data) {
		var self = this;
		self.imageSelector = data.imageSelector;
		self.lightbox = "";
		self.domLaunchButton = $("#tl-ah-image-position-panel-launch").get()[0];
		self.domPanelContent = $("#tl-ah-image-positioning-panel").get()[0];
		self.domImageContainers = $(self.domPanelContent).find(".tl-ahip-img-holder").get();
		self.imageContainers = "";
		self.domMainContainer = $(self.domPanelContent).find(".tl-ahip-main-img-holder").get()[0];
		self.domFakeDragger = $(self.domPanelContent).find(".tl-ahip-fake-dragger").get()[0];
		self.domHorizSelect = $(self.domPanelContent).find(".tl-ahip-input-horiz-align select").get()[0];
		self.domVerticalSelect = $(self.domPanelContent).find(".tl-ahip-input-vertical-align select").get()[0];
		self.mainContainer = "";
		self.draggable = "";
		self.imageOffset = {
			x : 0,
			y : 0
		};
		self.portraitClass = "tl-ah-ipp-portrait-image";
	},
	init : function() {
		var self = this;
		$(self.domLaunchButton).click(function() {
			self.initImageOffset();
			self.selectedImage = AJKHelpers.getTimelineImageUrl({
				src : $(self.imageSelector.domContentField).val()
			});
			if (!self.selectedImage || self.selectedImage == TLConfigText['marker_media_Enter_meda_source_here']) {
				AJKHelpers.jiggleDomEl({
					domEl : this,
					displacementFactor : 5
				});
				return false;
			}
			if (!self.lightbox) {
				self.initPanel();
			}
			self.launch();
			return false;
		});
		AJKHelpers.cancelSelectionOnDomEl({
			domEl : self.domFakeDragger
		});
		return self;
	},
	initImageOffset : function() {
		var self = this;
		var fieldVal = $(self.imageSelector.domThumbPosField).val();
		if (fieldVal) {
			var splitVal = fieldVal.split(",");
			self.imageOffset.x = (splitVal[0]) ? parseFloat(splitVal[0]) : 0;
			self.imageOffset.y = (splitVal[1]) ? parseFloat(splitVal[1]) : 0;
		} else {
			self.imageOffset.x = 0;
			self.imageOffset.y = 0;
		}
	},
	initPanel : function() {
		var self = this;
		self.lightbox = new TLAdminLightbox({
			domClass : "tl-ah-fis-panel-wide",
			title : TLConfigText["positioningPanel_title"],
			intro : TLConfigText["positioningPanel_intro"],
			domContent : self.domPanelContent,
			closeCallback : function() {
				$(self.imageContainers).find("img").remove();
				self.populatePositionField();
				self.deactivateAlignmentSelects();
			}
		}).init();
	},
	populatePositionField : function() {
		var self = this;
		var fieldText = self.imageOffset.x + "," + self.imageOffset.y;
		$(self.imageSelector.domThumbPosField).val(fieldText).blur();
	},
	launch : function() {
		var self = this;
		self.lightbox.openPanel();
		new AJKImageLoader({
			imageUrl : self.selectedImage,
			loadCallback : function() {
				var imageSize = AJKHelpers.getImageSize({
					imageUrl : self.selectedImage
				});
				if (imageSize.height / imageSize.width > 1.2) {
					$(self.domPanelContent).addClass(self.portraitClass);
				} else {
					$(self.domPanelContent).removeClass(self.portraitClass);
				}
				self.initialiseContainers();
				self.initialiseImages();
				setTimeout(function() {
					self.updateImagePositions();
					self.initialiseDrag();
					self.initialiseAlignmentSelects();
					self.updateAlignmentFields();
				}, 1);
			}
		}).init();
	},
	deactivateAlignmentSelects : function() {
		var self = this;
		$(self.domHorizSelect).unbind("change");
		$(self.domVerticalSelect).unbind("change");
	},
	initialiseAlignmentSelects : function() {
		var self = this;
		$(self.domHorizSelect).change(function() {
			var thisVal = $(this).val();
			if (thisVal != "custom") {
				self.imageOffset.x = parseInt(thisVal);
			}
			self.updateImagePositions();
		});
		$(self.domVerticalSelect).change(function() {
			var thisVal = $(this).val();
			if (thisVal != "custom") {
				self.imageOffset.y = parseInt(thisVal);
			}
			self.updateImagePositions();
		});
	},
	initialiseContainers : function() {
		var self = this;
		self.imageContainers = [];
		$(self.domImageContainers).each(function() {
			var thisObj = {
				domEl : this,
				domImage : "",
				boxSize : {
					width : $(this).width(),
					height : $(this).height()
				},
				scaleImageSize : ""
			};
			self.imageContainers.push(thisObj);
			if (this == self.domMainContainer) {
				self.mainContainer = thisObj;
			}
		});
	},
	initialiseDrag : function() {
		var self = this;
		self.draggable = new AJKDraggable({
			domDragEl : $(self.domMainContainer).find("img").get()[0],
			limitFunc : function() {
				var limit = {
					minX : -(self.mainContainer.scaledImageSize.width - self.mainContainer.boxSize.width),
					maxX : 0,
					minY : -(self.mainContainer.scaledImageSize.height - self.mainContainer.boxSize.height),
					maxY : 0
				};
				return limit;
			},
			mouseMoveFunc : function(data) {
				var centerXOffset = (self.mainContainer.scaledImageSize.width - self.mainContainer.boxSize.width) / 2;
				self.imageOffset.x = (Math.abs(data.dragElPos.x) - centerXOffset) / centerXOffset;
				self.imageOffset.x = (self.imageOffset.x) ? self.imageOffset.x : 0;
				self.imageOffset.x = AJKHelpers.convertNumToXDecimalPlaces({
					num : self.imageOffset.x,
					x : 4
				});
				var centerYOffset = (self.mainContainer.scaledImageSize.height - self.mainContainer.boxSize.height) / 2;
				self.imageOffset.y = (Math.abs(data.dragElPos.y) - centerYOffset) / centerYOffset;
				self.imageOffset.y = (self.imageOffset.y) ? self.imageOffset.y : 0;
				self.imageOffset.y = AJKHelpers.convertNumToXDecimalPlaces({
					num : self.imageOffset.y,
					x : 4
				});
				self.updateImagePositions();
				self.updateAlignmentFields();
			},
			dragDidStartFunc : function() {
			},
			dragDidEndFunc : function() {
				self.updateAlignmentFields();
			}
		});
		$(self.domFakeDragger).mousedown(function(e) {
			self.draggable.initiateDrag({
				event : e
			});
		});
	},
	updateAlignmentFields : function() {
		var self = this;
		if (parseInt(self.imageOffset.x) == self.imageOffset.x) {
			$(self.domHorizSelect).val(self.imageOffset.x);
		} else {
			$(self.domHorizSelect).val("custom");
		}
		if (parseInt(self.imageOffset.y) == self.imageOffset.y) {
			$(self.domVerticalSelect).val(self.imageOffset.y);
		} else {
			$(self.domVerticalSelect).val("custom");
		}
	},
	initialiseImages : function() {
		var self = this;
		$(self.imageContainers).each(function() {
			var thisObj = this;
			var domImage = $('<img src="' + self.selectedImage + '" alt="" />').get()[0];
			$(this.domEl).empty().append(domImage);
			this.domImage = domImage;
			setTimeout(function() {
				thisObj.imageSize = {
					width : $(domImage).width(),
					height : $(domImage).height()
				};
			}, 0);
		});
	},
	updateImagePositions : function() {
		var self = this;
		$(self.imageContainers).each(function() {
			this.scaledImageSize = AJKHelpers.sizeImageToFitInBoxOfSize({
				domImage : this.domImage,
				boxSize : this.boxSize,
				imageSize : this.imageSize,
				returnScaledImageSize : true,
				imageOffset : self.imageOffset
			});
		});
	}
});