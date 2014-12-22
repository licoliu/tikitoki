Class
		.forName({
			name : "class assets.js.security.component.AJKImageSelector extends Object",
			AJKImageSelector : function(data) {
				var self = this;
				self.controller = data.controller;
				self.mainController = data.controller.mainController;
				self.timeline = data.timeline;
				self.domFeedItemSelector = data.domFeedItemSelector, self.flickrImageSelector = "";
				self.initialised = false;
				self.domMenu = "";
				self.selectors = [];
				self.selectedSelectorType = "url";
				self.domContentField = "";
				self.domCaptionField = "";
				self.selectedImagePanel = "";
				self.isStandardPage = data.isStandardPage;
			},
			init : function() {
				var self = this;
				return self;
			},
			initialise : function() {
				var self = this;
				self.domMenu = $(
						'<div class="ft-ah-image-selector-tabs"><ul><li class="selected" option="url">Enter image url<span></span></li><li class="upload" option="upload">Upload image<span></span></li><li class="flickr" option="flickr">Flickr image<span></span></li></ul></div>')
						.get()[0];
				if (self.isStandardPage) {
					$(self.domMenu).find(".upload").css({
						display : "none"
					});
				}
				$(self.domMenu).find("li").click(function() {
					var selectorType = $(this).attr("option");
					if (selectorType != self.selectedSelectorType) {
						$(self.domMenu).find(".selected").removeClass("selected");
						$(this).addClass("selected");
						self.selectors[self.selectedSelectorType].close();
						self.launchForSelectorType({
							selectorType : selectorType
						});
					}
					return false;
				});
				self.initialised = true;
			},
			imagesLeftForTerm : function(data) {
				var self = this;
				var term = data.term;
				var numImagesLeft = data.maxImages;
				if (self.timeline.backgroundImage && self.timeline.backgroundImage.indexOf(term) != -1) {
					numImagesLeft--;
				}
				if (self.timeline.introImage && self.timeline.introImage.indexOf(term) != -1) {
					numImagesLeft--;
				}
				$.each(self.mainController.markers, function() {
					$.each(this.images, function() {
						if (this.src && this.src.indexOf(term) != -1) {
							numImagesLeft--;
						}
					});
				});
				return ((numImagesLeft < 0) ? 0 : numImagesLeft);
			},
			initialiseSelector : function(data) {
				var self = this;
				var selectorType = data.selectorType;
				if (selectorType == "flickr") {
					self.selectors[selectorType] = new AJKFlickrImageSelector({
						domRoot : self.domFeedItemSelector,
						controller : self,
						imageSelectedFunc : function(data) {
							self.selectImage(data);
						},
						remainingFlickrImagesFunc : function() {
							return self.imagesLeftForTerm({
								term : "flickr.com",
								maxImages : 30
							});
						}
					}).init();
				} else if (selectorType == "upload") {
					self.selectors[selectorType] = new AJKUploadImageSelector({
						imageSelectedFunc : function(data) {
							self.selectImage(data);
						},
						imageLimitFunc : function() {
							return self.numUploadedImagesAllowed();
						},
						remainingImagesFunc : function() {
							return self.imagesLeftForTerm({
								term : AJKHelpers.uploadDomain,
								maxImages : self.numUploadedImagesAllowed()
							});
						}
					}).init();
					AJKUploadImageSelector.selector1 = self.selectors[selectorType];
				} else if (selectorType == "url") {
					self.selectors[selectorType] = new AJKImageUrlSelector({
						imageSelectedFunc : function(data) {
							self.selectImage(data);
						}
					}).init();
				}
			},
			numUploadedImagesAllowed : function() {
				var self = this;
				var account = self.controller.timeline.accountType;
				var numImages = (account == "Silver" || account == "Teacher") ? 100 : (account == "Bronze" || account == "Teacher-Pupil") ? 50 : 0;
				return numImages;
			},
			selectImage : function(data) {
				var self = this;
				var imageSrc = data.src;
				if (self.domThumbPosField) {
					$(self.domThumbPosField).val("0,0").blur();
				}
				$(self.domContentField).val(imageSrc);
				$(self.domContentField).blur();
				self.showSelectedImagePanelForImage({
					src : imageSrc
				});
			},
			injectMenuInto : function(data) {
				var self = this;
				var selector = data.selector;
				$(selector.domRoot).find(".ajk-fis-panel").prepend(self.domMenu);
			},
			launch : function(data) {
				var self = this;
				if (!self.initialised) {
					self.initialise();
				}
				self.imageSize = data.imageSize;
				self.domContentField = data.domContentField;
				self.domCaptionField = data.domCaptionField;
				self.domThumbPosField = data.domThumbPosField;
				var srcValue = $(self.domContentField).val();
				if (srcValue && srcValue != TLConfigText['marker_media_Enter_meda_source_here']) {
					self.showSelectedImagePanelForImage({
						src : srcValue
					});
				} else {
					self.launchForSelectorType({
						selectorType : self.selectedSelectorType
					});
				}
			},
			initialiseSelectedImagePanel : function() {
				var self = this;
				self.selectedImagePanel = new AJKSelectedImagePanel({
					newImageFunc : function() {
						self.launchForSelectorType({
							selectorType : self.selectedSelectorType
						});
					},
					positionImageFunc : function() {
					}
				}).init();
				var domLaunchButton = $(self.selectedImagePanel.domContent).find("#tl-ah-image-position-panel-launch").get()[0];
				$(domLaunchButton).click(function() {
					self.selectedImagePanel.close();
				});
				if (!self.isStandardPage) {
					new TLImagePositioningController({
						imageSelector : self,
						domLaunchButton : domLaunchButton,
						positioningFinishedFunc : function() {
							self.selectedImagePanel.open();
						}
					}).init();
				}
			},
			showSelectedImagePanelForImage : function(data) {
				var self = this;
				var imageSrc = data.src;
				var selector = self.selectors[self.selectedSelectorType];
				if (selector) {
					selector.close();
				}
				if (!self.selectedImagePanel) {
					self.initialiseSelectedImagePanel();
				}
				self.selectedImagePanel.openPanelWithImage({
					src : imageSrc,
					positionable : self.domThumbPosField
				});
			},
			launchSelector : function(data) {
				var self = this;
				var selector = data.selector;
				self.injectMenuInto({
					selector : selector
				});
				selector.launch({
					imageSize : self.imageSize,
					domContentField : self.domContentField,
					domCaptionField : self.domCaptionField,
					domThumbPosField : self.domThumbPosField
				});
			},
			launchForSelectorType : function(data) {
				var self = this;
				self.selectedSelectorType = data.selectorType;
				if (!self.selectors[self.selectedSelectorType]) {
					self.initialiseSelector({
						selectorType : self.selectedSelectorType
					});
				}
				self.launchSelector({
					selector : self.selectors[self.selectedSelectorType]
				});
			}
		});