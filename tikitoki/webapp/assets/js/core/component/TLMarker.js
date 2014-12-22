$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");
$import("assets.js.core.component.AJKImageLoader");

Class
		.forName({
			name : "class assets.js.core.component.TLMarker extends Object",

			TLMarker : function(data) {
				var self = this;
				self.startDate = data.startDate;
				self.endDate = data.endDate;
				self.mainController = data.mainController;
				self.timeline = self.mainController.timeline;
				self.category = data.category;
				self.externalLink = data.externalLink;
				self.media = (data.media) ? data.media : new Array();
				self.mediaByKey = new Array();
				self.photos = data.photos;
				self.markerKey = data.markerKey;
				self.headline = assets.js.core.utils.AJKHelpers.removeScript({
					content : data.headline
				});
				self.id = data.id;
				self.dateFormat = assets.js.core.utils.AJKHelpers.removeScript({
					content : data.dateFormat
				});
				self.ownerId = data.ownerId;
				self.ownerName = data.ownerName;
				self.introText = assets.js.core.utils.AJKHelpers.removeScript({
					content : data.introText
				});
				self.fullText = assets.js.core.utils.AJKHelpers.removeScript({
					content : data.fullText
				});
				self.extraInfoLoaded = (self.fullText || TLSingleTimelineLicense) ? true : false;
				self.fullText = (self.fullText == "none") ? "" : self.fullText;
				self.INTROTEXTMAXCHARS = 150;
				self.HEADLINEMAXCHARS = 75;
				self.clippedHeadline = assets.js.core.utils.AJKHelpers.clipToMaxCharWords({
					aString : self.headline,
					maxChars : self.HEADLINEMAXCHARS
				});
				self.clippedIntroText = assets.js.core.utils.AJKHelpers.clipToMaxCharWords({
					aString : self.introText,
					maxChars : self.INTROTEXTMAXCHARS
				});
				self.clippedContentIntroText = self.introText;
				self.domRoot = "";
				self.leftOffset = 0;
				self.numCloseMarkers = 0;
				self.sizeClass = "";
				self.vSize = "normal";
				self.sliderPointPosition = "";
				self.domSliderToolTip = "";
				self.domTooltipDomContainer = "";
				self.toolTipVisible = false;
				self.selectedImage = 0;
				self.numImages = (self.photos) ? self.photos.length : 0;
				self.displayImage = "";
				self.domImageGalleryControls = "";
				self.galleryControlsShowing = false;
				self.galleryControlsHeight = (self.vSize == "small") ? 14 : 35;
				self.domRootInner = "";
				self.domSliderToolTipHeadline = "";
				self.domSliderToolTipDate = "";
				self.domMarkerTab = "";
				self.domMarkerHeadline = "";
				self.domMarkerDate = "";
				self.domMarkerIntroText = "";
				self.domSliderPoint = "";
				self.domMainImageHolder = "";
				self.domImageGallery = "";
				self.domMainImageWidth = "";
				self.domMainImageHeight = "";
				self.orderIndex = 0;
				self.galleryClass = "tl-sb-gallery-active";
				self.initialHorizAdjustment = 0;
				self.standardPinPosition = [];
				self.standardPinPosition["normal"] = -157;
				self.standardPinPosition["small"] = -157;
				self.standardPinPosition["very-small"] = -157;
				self.standardPinPosition["tiny"] = -157;
				self.standardPinPosition["miniature"] = -231;
				self.standardPinPosition["category-small"] = -231;
				self.standardPinPosition["category-normal"] = -200;
				self.standardPinPosition["duration-normal"] = -215;
				self.horizAdjustment = 0;
				self.dateFormatString = "DD MMM YYYY";
				self.imageContainerSize = {};
				self.dateStatus = self.timeline.storyDateStatus;
				self.feedSource = false;
				self.durationBarWidth = 0;
				self.extraInfoIsBeingLoaded = false;
				self.lazyImageLoaded = !self.timeline.lazyLoadingActive;
				self.deviceScale = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
			},
			init : function() {
				var self = this;
				self.syncStartEndDateIfNeeded();
				if (self.fullText) {
					self.fullText = self.fullText.replace(/;xNLx;/g, "\n");
				}
				self.initialiseMedia();
				if (self.externalLink && self.externalLink.indexOf("http") == -1) {
					self.externalLink = "http://" + self.externalLink;
				}
				return self;
			},
			initialiseMedia : function() {
				var self = this;
				self.media = self.media.sort(function(a, b) {
					return (a.orderIndex < b.orderIndex) ? -1 : (a.orderIndex == b.orderIndex) ? 0 : 1;
				});
				self.images = new Array();
				self.videos = new Array();
				self.audio = new Array();
				self.mediaByKey = new Array();
				var listPos = 0;
				$.each(self.media, function() {
					if (this.src && this.src.charAt(0) != "h" && this.src.charAt(0) != "/") {
						this.src = "http://" + this.src;
					}
					switch (this.type) {
					case "Image":
						self.images.push(this);
						break;
					case "Video":
						self.videos.push(this);
						break;
					case "Audio":
						self.audio.push(this);
						break;
					}
					this.listPosition = listPos++;
					this.key = this.type + "-key-" + this.id;
					self.mediaByKey[this.key] = this;
				});
				self.numImages = self.images.length;
				self.displayImage = (self.images.length) ? self.images[0] : "";
				if (!self.displayImage && self.videos.length && self.videos[0].externalMediaThumb) {
					self.displayImage = {
						id : "awaitingId",
						orderIndex : 10,
						type : "Image",
						src : self.videos[0].externalMediaThumb,
						thumbPosition : (self.videos[0].thumbPosition) ? self.videos[0].thumbPosition : "0,0",
						caption : "",
						listPosition : 1
					};
				} else if (!self.displayImage && self.audio.length && self.audio[0].externalMediaThumb) {
					self.displayImage = {
						id : "awaitingId",
						orderIndex : 10,
						type : "Image",
						src : self.audio[0].externalMediaThumb,
						thumbPosition : (self.audio[0].thumbPosition) ? self.audio[0].thumbPosition : "0,0",
						caption : "",
						listPosition : 1
					};
				}
				self.isFlickrImage = (self.displayImage.src && self.displayImage.src.indexOf("flickr.com") != -1);
			},
			lazyLoadImage : function() {
				var self = this;
				self.lazyImageLoaded = true;
				new assets.js.core.component.AJKImageLoader({
					imageUrl : self.getDisplayImage().src,
					loadCallback : function() {
						self.updateDisplayImage();
						self.updateMainImage();
					}
				}).init();
			},
			updateDisplayImage : function() {
				var self = this;
				if (self.isFlickrImage) {
					$(self.domMainImageHolder).addClass("ig-inner-flickr");
				} else {
					$(self.domMainImageHolder).removeClass("ig-inner-flickr");
				}
				$(self.domMainImageHolder).empty().append('<img src="' + self.getDisplayImage().src + '" alt="" /><div class="ig-inner-image-mask"></div>');
				self.domMainImage = $(self.domMainImageHolder).find("img").get()[0];
			},
			loadExtraInfo : function(data) {
				var self = this;
				var callback = (data) ? data.callback : "";
				if (!self.extraInfoLoaded && !self.extraInfoIsBeingLoaded && self.id) {
					vars = {};
					vars.storyId = self.id;
					self.extraInfoIsBeingLoaded = true;
					theAJKAjaxController.request({
						action : "/stories/getextrainfo",
						method : "post",
						vars : vars,
						alwaysAllow : true,
						callback : function(someText) {
							self.fullText = someText;
							self.extraInfoLoaded = true;
							if (callback) {
								callback();
							}
						}
					});
				} else if (callback) {
					callback();
				}
			},
			syncStartEndDateIfNeeded : function() {
				var self = this;
				if (self.endDate.getTime() < self.startDate.getTime()) {
					self.endDate = new Date();
					self.endDate.setTime(self.startDate.getTime());
				}
			},
			setDomSliderPoint : function(data) {
				var self = this;
				self.domSliderPoint = data.domEl;
			},
			setSliderPointPosition : function(data) {
				var self = this;
				self.sliderPointPosition = data.position;
			},
			setDomTooltipDomContainer : function(data) {
				var self = this;
				self.domTooltipDomContainer = data.domEl;
			},
			createToolTip : function() {
				var self = this;
				insertHTML = '<div class="tl-s-tooltip">';
				insertHTML += '<div class="tl-s-t-inner">';
				if (self.dateStatus == 1) {
					insertHTML += '<h5 class="tl-ah-hide">' + self.formatDisplayDate() + '</h5>';
				} else if (self.dateStatus == 2) {
					insertHTML += '<h5>~' + self.formatDisplayDate() + '</h5>';
				} else {
					insertHTML += '<h5>' + self.formatDisplayDate() + '</h5>';
				}
				insertHTML += '<h4>' + self.headline + '</h4>';
				insertHTML += '</div>';
				insertHTML += '<div class="tl-s-t-bottom"></div>';
				insertHTML += '</div>';
				self.domSliderToolTip = $(insertHTML).get()[0];
				self.domSliderToolTipHeadline = $(self.domSliderToolTip).find("h4").get()[0];
				self.domSliderToolTipDate = $(self.domSliderToolTip).find("h5").get()[0];
				$(self.domSliderToolTipDate).css({
					color : "#" + self.category.colour
				});
			},
			showToolTip : function(data) {
				var self = this;
				var sliderScaleWidth = data.sliderScaleWidth;
				var scaleLeftOffset = data.scaleLeftOffset;
				var sliderWidth = data.sliderWidth;
				if (!self.toolTipVisible) {
					self.toolTipVisible = true;
					if (!self.domSliderToolTip) {
						self.createToolTip();
					}
					var leftOffset = sliderScaleWidth * self.sliderPointPosition.left / 100 + scaleLeftOffset;
					if (leftOffset > sliderWidth - 100) {
						$(self.domSliderToolTip).addClass("tl-s-tooltip-right-aligned");
					} else {
						$(self.domSliderToolTip).removeClass("tl-s-tooltip-right-aligned");
					}
					$(self.domSliderToolTip).css({
						left : leftOffset + "px"
					});
					$(self.domTooltipDomContainer).append(self.domSliderToolTip);
				}
			},
			hideToolTip : function() {
				var self = this;
				if (self.toolTipVisible) {
					$(self.domSliderToolTip).remove();
					self.toolTipVisible = false;
				}
			},
			generateDurationSizeData : function() {
				var self = this;
				self.sizeClass = "tl-sb-normal-height";
				self.vSize = "duration-normal";
				if (self.startDate.getTime() != self.endDate.getTime()) {
					self.sizeClass += " tl-sb-duration-story";
					if (theTLMainController.timeline.markerSpacing == "equal") {
						var endDatePos = theTLMainController.selectedView.getEquallySpacedOffsetForDate({
							aDate : self.endDate
						});
						endDatePos = (endDatePos == "-1") ? self.leftOffset : endDatePos;
					} else {
						var endDatePos = -theTLMainController.selectedView.getLeftOffsetForDate({
							date : self.endDate
						});
					}
					var barWidth = endDatePos - self.leftOffset;
					self.durationBarWidth = barWidth;
				}
			},
			generateSizeData : function() {
				var self = this;
				if (theTLMainController.timeline.markerSpacing == "top-to-bottom" && theTLMainController.timeline.viewType == "category-band") {
					self.sizeClass = "tl-sb-category-small-height";
					self.vSize = "category-small";
				} else if (theTLMainController.timeline.markerSpacing == "top-to-bottom") {
					self.sizeClass = "tl-sb-tiny-height";
					self.vSize = "tiny";
				} else if (theTLMainController.timeline.viewType == "category-band") {
					if (self.numCloseMarkers > 1) {
						self.sizeClass = "tl-sb-category-normal-height tl-sb-category-normal-height-small-image tl-sb-category-small-height";
						self.vSize = "category-small";
					} else {
						if (self.mainImageSize && self.mainImageSize.height > 0 && (self.mainImageSize.height < 120 || self.mainImageSize.width < 120)) {
							self.sizeClass = "tl-sb-category-normal-height tl-sb-category-normal-height-small-image";
							self.vSize = "category-normal";
						} else {
							self.sizeClass = "tl-sb-category-normal-height";
							self.vSize = "category-normal";
						}
					}
				} else if (self.numCloseMarkers > 1000) {
					self.sizeClass = "tl-sb-microscopic-height";
					self.vSize = "microscopic";
				} else if (self.numCloseMarkers > 8) {
					self.sizeClass = "tl-sb-miniature-height";
					self.vSize = "miniature";
				} else if (self.numCloseMarkers > 5) {
					self.sizeClass = "tl-sb-tiny-height";
					self.vSize = "tiny";
				} else if (self.numCloseMarkers > 4) {
					self.sizeClass = "tl-sb-low-height tl-sb-very-low-height";
					self.vSize = "very-small";
				} else if (self.numCloseMarkers > 0) {
					self.sizeClass = "tl-sb-low-height";
					self.vSize = "small";
				} else {
					if (self.mainImageSize && self.mainImageSize.height > 0 && (self.mainImageSize.height < 120 || self.mainImageSize.width < 120)) {
						self.sizeClass = "tl-sb-low-height";
						self.vSize = "normal";
					} else {
						self.sizeClass = "tl-sb-normal-height";
						self.vSize = "normal";
					}
				}
			},
			refreshSizeClass : function() {
				var self = this;
				$(self.domRoot).removeClass("tl-sb-low-height");
				$(self.domRoot).removeClass("tl-sb-very-low-height");
				$(self.domRoot).removeClass("tl-sb-tiny-height");
				$(self.domRoot).removeClass("tl-sb-normal-height");
				$(self.domRoot).removeClass("tl-sb-miniature-height");
				$(self.domRoot).removeClass("tl-sb-microscopic-height");
				$(self.domRoot).removeClass("tl-sb-category-normal-height");
				$(self.domRoot).removeClass("tl-sb-category-normal-height-small-image");
				$(self.domRoot).removeClass("tl-sb-category-small-height");
				$(self.domRoot).removeClass("tl-sb-duration-story");
				$(self.domRoot).addClass(self.sizeClass);
			},
			setVerticalPos : function(data) {
				var self = this;
				self.verticalPos = data.pos;
			},
			formatDisplayDate : function(data) {
				var self = this;
				var startDateOnly = (data && data.startDateOnly) ? true : false;
				if (self.dateFormat != "auto") {
					if (!startDateOnly && self.startDate.getTime() != self.endDate.getTime()) {
						var dateString = self.generateFromToDateString({
							formatString : self.dateFormat
						});
					} else {
						var dateString = assets.js.core.utils.AJKHelpers.formatDate({
							date : self.startDate,
							formatString : self.dateFormat
						});
					}
				} else if (self.timeline.storyDateFormat == "auto") {
					if (!startDateOnly && self.startDate.getTime() != self.endDate.getTime()) {
						var dateString = self.generateFromToDateString({
							formatString : theTLSettings.timeInfo.markerDisplayDateFormat
						});
					} else {
						var dateString = assets.js.core.utils.AJKHelpers.formatDate({
							date : self.startDate,
							formatString : theTLSettings.timeInfo.markerDisplayDateFormat
						});
					}
				} else {
					if (!startDateOnly && self.startDate.getTime() != self.endDate.getTime()) {
						var dateString = self.generateFromToDateString({
							formatString : self.timeline.storyDateFormat
						});
					} else {
						var dateString = assets.js.core.utils.AJKHelpers.formatDate({
							date : self.startDate,
							formatString : self.timeline.storyDateFormat
						});
					}
				}
				return dateString;
			},
			generateFromToDateString : function(data) {
				var self = this;
				var formatString = data.formatString.replace("MMMM", "MMM");
				var dateString = assets.js.core.utils.AJKHelpers.formatDate({
					date : self.startDate,
					formatString : formatString
				});
				var endDateStr = assets.js.core.utils.AJKHelpers.formatDate({
					date : self.endDate,
					formatString : formatString
				});
				if (dateString != endDateStr) {
					dateString += " - " + endDateStr;
				}
				return dateString;
			},
			generateDom : function() {
				// TODO
				var self = this;
				if (!self.domRoot) {
					var galleryClass = (self.numImages == 0 && (self.videos.length == 0 || !self.videos[0].externalMediaThumb) && (self.audio.length == 0 || !self.audio[0].externalMediaThumb)) ? ""
							: " " + self.galleryClass;
					var insertHTML = '<div class="tl-story-block tl-story-category-view-' + self.category.viewType + '" id="tl-unique-marker-id-' + self.id + '" markerKey="'
							+ self.markerKey + '">';
					insertHTML += '<div class="tl-sb-inner' + galleryClass + '">';
					insertHTML += '<h5 class="tab">' + self.category.title + '</h5>';
					insertHTML += '<div class="top"></div>';
					insertHTML += '<div class="content">';
					insertHTML += '<div class="content-inner">';
					insertHTML += '<div class="tl-sb-basic-info-holder">';
					insertHTML += '<h3 class="tl-sb-headline tl-font-head">' + self.clippedHeadline + '</h3>';
					if (self.dateStatus == 2) {
						insertHTML += '<h4 class="tl-sb-date">~' + self.formatDisplayDate() + '</h4>';
					} else {
						insertHTML += '<h4 class="tl-sb-date">' + self.formatDisplayDate() + '</h4>';
					}
					if (self.numImages > 0 || (self.videos.length > 0 && self.videos[0].externalMediaThumb) || (self.audio.length > 0 && self.audio[0].externalMediaThumb)) {
						insertHTML += self.generateImageGalleryHTML();
					}
					insertHTML += '<div class="tl-sb-duration-bar"></div>';
					insertHTML += '<p class="text tl-sb-intro-text tl-font-body">' + self.clippedIntroText + '</p>';
					insertHTML += '<a class="button-1 tl-sb-more-button" href="#">' + assets.js.core.setting.TLConfigText['marker_moreButton_text'] + '</a>';
					insertHTML += '</div>';
					insertHTML += '</div>';
					insertHTML += '</div>';
					insertHTML += '<div class="bottom"><div class="bl"></div><div class="br"></div><div class="bm"><div class="bmp-standard">';
					insertHTML += '<div class="bm-pointer-holder"><div class="bmp bmp-shadow"></div><div class="bmp bmp-pointer"></div></div>';
					insertHTML += '</div></div></div>';
					insertHTML += '</div>';
					insertHTML += '</div>';
					self.domRoot = $(insertHTML).get()[0];
					$(self.domRoot).css({
						visibility : "hidden"
					});
					$(self.domRoot).addClass(self.sizeClass);
					if (self.dateStatus == 1) {
						$(self.domRoot).addClass("tl-story-block-hide-date");
					}
					self.domPin = $(self.domRoot).find(".bm").get()[0];
					self.domStandardPin = $(self.domRoot).find(".bmp-standard").get()[0];
					$(self.domStandardPin).css({
						left : (self.standardPinPosition[this.vSize] - self.horizAdjustment) + "px"
					});
					self.domRootInner = $(self.domRoot).find(".tl-sb-inner").get()[0];
					self.domMarkerTab = $(self.domRoot).find(".tab").get()[0];
					self.domMarkerHeadline = $(self.domRoot).find(".tl-sb-headline").get()[0];
					self.domMarkerDate = $(self.domRoot).find(".tl-sb-date").get()[0];
					self.domMarkerIntroText = $(self.domRoot).find(".tl-sb-intro-text").get()[0];
					self.domImageGallery = $(self.domRoot).find(".tl-sb-image-gallery").get()[0];
					self.domMainImageHolder = $(self.domImageGallery).find(".ig-inner").get()[0];
					self.domMainImage = $(self.domMainImageHolder).find("img").get()[0];
					self.domBasicInfoHolder = $(self.domRoot).find(".tl-sb-basic-info-holder").get()[0];
					self.domColoredPointer = $(self.domRoot).find(".bmp-pointer").get()[0];
					self.domDurationBar = $(self.domRoot).find(".tl-sb-duration-bar").get()[0];
					self.setMarkerHorizontalAndVerticalPosition();
					if (!self.domMainImage) {
						$(self.domRoot).css({
							visibility : "visible"
						});
					} else {
						setTimeout(function() {
							$(self.domRoot).css({
								visibility : "visible"
							});
						}, 2000);
						new assets.js.core.component.AJKImageLoader({
							imageUrl : self.domMainImage.src,
							loadCallback : function() {
								self.updateMainImage();
								$(self.domRoot).css({
									visibility : "visible"
								});
							}
						}).init();
					}
					if (!$.browser.msie) {
						$(self.domMainImage).load(function() {
							self.updateMainImage();
							$(self.domRoot).css({
								visibility : "visible"
							});
						});
					}
					$(self.domMarkerTab).css({
						background : "#" + self.category.colour
					});
					$(self.domBasicInfoHolder).css({
						background : "#" + self.category.colour
					});
					$(self.domColoredPointer).css({
						"border-top-color" : "#" + self.category.colour
					});
					$(self.domDurationBar).css({
						background : "#" + self.category.colour
					});
				} else {
					self.refreshPositionAndSize();
				}
				return self.domRoot;
			},
			getDisplayImage : function() {
				var self = this;
				return {
					src : assets.js.core.utils.AJKHelpers.getTimelineImageUrl({
						src : self.displayImage.src
					})
				};
			},
			refreshPositionAndSize : function() {
				var self = this;
				self.refreshSizeClass();
				$(self.domStandardPin).css({
					left : (self.standardPinPosition[this.vSize] - self.horizAdjustment) + "px"
				});
				self.setMarkerHorizontalAndVerticalPosition();
			},
			updateMainImage : function() {
				var self = this;
				if ($.browser.opera || $.browser.msie) {
					setTimeout(function() {
						self.updateMainImageFunc();
					}, 10);
				} else {
					self.updateMainImageFunc();
				}
			},
			updateMainImageFunc : function() {
				var self = this;
				var newImage = $(self.domMainImage).clone().get()[0];
				$(newImage).css({
					height : "auto",
					width : "auto"
				});
				$(self.mainController.domImagePreloader).append(newImage);
				var imgLoadedFunc = function() {
					var thisHeight = self.mainImageHeight = newImage.height;
					var thisWidth = self.mainImageWidth = newImage.width;
					$(newImage).remove();
					self.mainImageSize = {
						width : thisWidth,
						height : thisHeight
					};
					if (self.vSize == "normal") {
						if ((thisHeight < 120 || thisWidth < 120) && !self.timeline.lazyLoadingActive) {
							$(self.domRoot).removeClass(self.sizeClass).addClass("tl-sb-low-height");
						} else {
							$(self.domRoot).removeClass("tl-sb-low-height").addClass(self.sizeClass);
						}
					} else if (self.vSize == "category-normal") {
						if ((thisHeight < 120 || thisWidth < 120) && !self.timeline.lazyLoadingActive) {
							$(self.domRoot).removeClass("tl-sb-category-normal-height-small-image").addClass("tl-sb-category-normal-height-small-image");
						} else {
							$(self.domRoot).removeClass("tl-sb-category-normal-height-small-image");
						}
					}
					self.imageContainerSize = {};
					self.positionDisplayImageInContainer();
					if (self.mainController.selected3DView) {
						setTimeout(function() {
							self.mainController.selected3DView.redisplay();
						}, 1);
					}
				};
				if (newImage.height > 0) {
					imgLoadedFunc();
				} else {
					$(newImage).load(function() {
						imgLoadedFunc();
					});
				}
			},
			clear3DText : function() {
				var self = this;
				self.dom3DText = "";
				self.dom3DTextImg = "";
				self.dom3DTextImgLoaded = false;
			},
			generateTextImageFor3D : function() {
				var self = this;
				var sizes = self.mainController.selected3DView.textImageSize;
				var dateSizes = self.mainController.selected3DView.dateImageSize;
				var coloured = (self.timeline.viewType == "color-category-stories" || self.timeline.viewType == "duration");
				var textFillStyle = (coloured) ? "rgba(255,255,255,1)" : "rgba(60,60,60,1)";
				var dateFillStyle = (coloured) ? "rgba(255,255,255,0.8)" : "rgba(110,110,110,1)";
				var panelStyle = (coloured) ? "#" + self.category.colour : "rgba(255,255,255,1)";
				self.lines3DText = "";
				self.dom3DText = self.generateTextImageFor3DForSize({
					textSize : sizes[0],
					dateSize : dateSizes[0],
					textFillStyle : textFillStyle,
					dateFillStyle : dateFillStyle,
					panelStyle : panelStyle
				});
				if (!self.dom3DTextImgLoaded && !$.browser.mozilla && self.dom3DText.toDataURL && 0) {
					self.dom3DTextImg = new Image();
					$(self.dom3DTextImg).load(function() {
						self.dom3DTextImgLoaded = true;
						self.generateTextImageFor3D();
					});
					self.dom3DTextImg.src = self.dom3DText.toDataURL("image/png");
				}
				self.dom3DTextMedium = self.generateTextImageFor3DForSize({
					textSize : sizes[1],
					dateSize : dateSizes[1],
					textFillStyle : textFillStyle,
					dateFillStyle : dateFillStyle,
					panelStyle : panelStyle
				});
				self.dom3DTextSmall = self.generateTextImageFor3DForSize({
					textSize : sizes[2],
					dateSize : dateSizes[2],
					textFillStyle : textFillStyle,
					dateFillStyle : dateFillStyle,
					panelStyle : panelStyle
				});
				self.dom3DTextTiny = self.generateTextImageFor3DForSize({
					textSize : sizes[3],
					dateSize : dateSizes[3],
					textFillStyle : textFillStyle,
					dateFillStyle : dateFillStyle,
					panelStyle : panelStyle
				});
			},
			generateTextImageFor3DForSize : function(data) {
				var self = this;
				var size = data.textSize;
				var maxLines = (self.lines3DText) ? self.lines3DText.length : "";
				maxLines = (data.numLines) ? data.numLines : maxLines;
				var tHeight = (data.numLines) ? size.height + (data.numLines - 2) * size.lineHeight : size.height;
				var domCanvas = $(
						'<canvas style="width:' + size.width + 'px; height: ' + tHeight + 'px" width="' + (size.width * self.deviceScale) + '" height="'
								+ (tHeight * self.deviceScale) + '"></canvas>').get()[0];
				var ctx = domCanvas.getContext('2d');
				ctx.scale(self.deviceScale, self.deviceScale);
				if (self.dom3DTextImgLoaded && self.dom3DTextImg && size.width > 100) {
					$(self.dom3DTextImg).css({
						width : size.width
					});
					ctx.drawImage(self.dom3DTextImg, 0, 0, size.width, tHeight);
					return domCanvas;
				}
				var dateSize = data.dateSize;
				var textFillStyle = data.textFillStyle;
				var dateFillStyle = data.dateFillStyle;
				var panelStyle = data.panelStyle;
				var dateFont = (self.timeline.fontBase == "default") ? '"Helvetica","sans-serif"' : self.timeline.fontBase.replace(";", "");
				var textFont = (self.timeline.fontHead == "default") ? '"Helvetica","sans-serif"' : self.timeline.fontHead.replace(";", "");
				ctx.fillStyle = panelStyle;
				ctx.fillRect(0, 0, size.width, tHeight);
				ctx.fillStyle = textFillStyle;
				ctx.textAlign = "left";
				ctx.font = "Bold " + size.fontSize + 'px ' + textFont;
				var titleText = assets.js.core.utils.AJKHelpers.prepareGTLTForText({
					content : self.clippedHeadline
				});
				self.lines3DText = assets.js.core.utils.AJKHelpers.renderCanvasText({
					canvasContext : ctx,
					text : titleText,
					textPos : {
						x : size.x,
						y : size.y
					},
					maxWidth : Math.round(size.width - (size.x * 2)),
					maxLines : maxLines,
					lineHeight : size.lineHeight,
					lines : self.lines3DText
				});
				ctx.fillStyle = dateFillStyle;
				ctx.font = dateSize.fontSize + 'px ' + dateFont;
				ctx.fillText(self.formatDisplayDate(), dateSize.x, dateSize.y);
				var actualNumLinesOfText = self.lines3DText.length;
				if (actualNumLinesOfText > 2 && actualNumLinesOfText != data.numLines) {
					data.numLines = actualNumLinesOfText;
					return self.generateTextImageFor3DForSize(data);
				} else {
					return domCanvas;
				}
			},
			generateImageFor3D : function() {
				var self = this;
				if (self.domMainImage && self.mainImageSize && self.mainImageSize.height > 0) {
					var size = self.mainController.selected3DView.cachedImageSize;
					var domMainImage = self.domMainImage;
					var imageSize = {
						width : self.mainImageSize.width,
						height : self.mainImageSize.height
					};
					var cpSize = {};
					if (imageSize.width / imageSize.height > size.width / size.height) {
						cpSize.height = imageSize.height;
						cpSize.width = imageSize.height / size.height * size.width;
						cpSize.x = (imageSize.width - cpSize.width) / 2;
						cpSize.y = 0;
					} else {
						cpSize.width = imageSize.width;
						cpSize.height = imageSize.width / size.width * size.height;
						cpSize.y = (imageSize.height - cpSize.height) / 2;
						cpSize.x = 0;
					}
					var imageOffset = self.displayImage.thumbPosition;
					if (imageOffset) {
						imageOffset = imageOffset.split(",");
						var xRange = cpSize.x;
						cpSize.x += (xRange * parseFloat(imageOffset[0]));
						var yRange = cpSize.y;
						cpSize.y += (yRange * parseFloat(imageOffset[1]));
					}
					self.dom3DImage = self.generateSizedCanvas3DImage({
						size : {
							width : size.width,
							height : size.height
						},
						cropSize : cpSize,
						image : domMainImage
					});
					self.dom3DImage200 = self.generateSizedCanvas3DImage({
						size : {
							width : 200,
							height : 200 / size.width * size.height
						},
						cropSize : cpSize,
						image : domMainImage
					});
					self.dom3DImage150 = self.generateSizedCanvas3DImage({
						size : {
							width : 150,
							height : 150 / size.width * size.height
						},
						cropSize : cpSize,
						image : domMainImage
					});
					self.dom3DImage100 = self.generateSizedCanvas3DImage({
						size : {
							width : 100,
							height : 100 / size.width * size.height
						},
						cropSize : cpSize,
						image : domMainImage
					});
				}
			},
			generateSizedCanvas3DImage : function(data) {
				var self = this;
				var size = data.size;
				var cpSize = data.cropSize;
				var anImage = data.image;
				$(anImage).css({
					width : size.width
				});
				var domCanvas = $('<canvas style="width:' + size.width + 'px; height: ' + size.height + 'px" width="' + size.width + '" height="' + size.height + '"></canvas>')
						.get()[0];
				var ctx = domCanvas.getContext('2d');
				ctx.drawImage(anImage, cpSize.x, cpSize.y, cpSize.width, cpSize.height, 0, 0, size.width, size.height);
				return domCanvas;
			},
			positionDisplayImageInContainer : function() {
				var self = this;
				if (self.domMainImageHolder && self.domMainImage && self.mainImageHeight && self.mainImageWidth) {
					var containerWidth = $(self.domMainImageHolder).width();
					var containerHeight = $(self.domMainImageHolder).height();
					if (!theTLMainController.timeline.storyImageAutoCrop && self.vSize == "normal" && self.mainImageHeight > 120 && self.mainImageWidth > 120
							&& theTLMainController.pageSizeClass == "tl-page-size-normal-height") {
						var containerHeight = parseInt(containerWidth / self.mainImageWidth * self.mainImageHeight);
						containerHeight = (containerHeight > 350) ? 350 : containerHeight;
						$(self.domMainImageHolder).css({
							height : containerHeight
						});
					} else if (!theTLMainController.timeline.storyImageAutoCrop) {
						containerHeight = containerWidth;
						$(self.domMainImageHolder).css({
							height : containerHeight
						});
					}
					var containerSize = {
						height : containerHeight,
						width : containerWidth
					};
					if (self.imageContainerSize.width != containerSize.width || self.imageContainerSize.height != containerSize.height || 1) {
						self.imageContainerSize = containerSize;
						assets.js.core.utils.AJKHelpers.sizeImageToFitInBoxOfSize({
							domImage : self.domMainImage,
							boxSize : containerSize,
							imageSize : {
								width : self.mainImageWidth,
								height : self.mainImageHeight
							},
							imageOffset : self.displayImage.thumbPosition
						});
					}
				}
			},
			generateImageGalleryHTML : function() {
				var self = this;
				var insertHTML = '<div class="tl-sb-image-gallery" markerKey="' + self.markerKey + '">';
				var extraClass = (self.isFlickrImage) ? " ig-inner-flickr" : "";
				insertHTML += '<div class="ig-inner' + extraClass + '">';
				if (self.timeline.lazyLoadingActive) {
					insertHTML += '<span class="tl-sb-image-loader"></span>';
				} else {
					insertHTML += '<img src="' + self.getDisplayImage().src + '" alt="" />';
				}
				insertHTML += '<div class="ig-inner-image-mask"></div>';
				insertHTML += '</div>';
				insertHTML += '</div>';
				return insertHTML;
			},
			setMarkerHorizontalAndVerticalPosition : function() {
				var self = this;
				var extraBottom = (self.timeline.viewType == "category-band") ? 5 : 0;
				$(self.domRoot).css({
					left : self.leftOffset + self.horizAdjustment,
					bottom : (extraBottom + self.verticalPos * 8.75) + "%"
				});
				if (self.domDurationBar && self.vSize == "duration-normal" && self.startDate.getTime() != self.endDate.getTime()) {
					$(self.domDurationBar).css({
						width : self.durationBarWidth
					});
				}
			},
			showExtraInfo : function() {
				var self = this;
				self.loadExtraInfo();
				self.mainController.contentPanelController.displayForStory({
					story : self
				});
			},
			searchShow : function() {
				var self = this;
				self.searchHidden = false;
				$(self.domRoot).removeClass("tl-sb-search-hide");
				$(self.domSliderPoint).removeClass("tl-sp-search-hide");
			},
			searchHide : function() {
				var self = this;
				self.searchHidden = true;
				$(self.domRoot).addClass("tl-sb-search-hide");
				$(self.domSliderPoint).addClass("tl-sp-search-hide");
			},
			focus : function() {
				var self = this;
				self.loadExtraInfo();
				if (self.timeline.viewType == "category-band") {
					$(self.domRoot).addClass("tl-story-block-category-hover");
				}
				$(self.domRoot).css({
					zIndex : 2
				});
				if (self.vSize == "miniature") {
					$(self.domRoot).removeClass("tl-sb-" + self.vSize + "-height");
					$(self.domRoot).addClass("tl-sb-very-low-height").addClass("tl-sb-very-low-height-no-image").addClass("tl-sb-miniature-focused");
				}
				if ((self.timeline.viewType == "duration" || self.category.viewType == "duration") && self.startDate.getTime() != self.endDate.getTime()) {
					var sOffset = assets.js.core.utils.AJKHelpers.getCoordsOfDomEl({
						domEl : self.domBasicInfoHolder
					}).x;
					if (sOffset < 5) {
						var aOffset = 5 - sOffset;
						$(self.domBasicInfoHolder).css({
							position : "relative",
							left : aOffset
						});
						$(self.domDurationBar).css({
							marginLeft : -aOffset
						});
					}
				}
			},
			unfocus : function() {
				var self = this;
				if (self.timeline.viewType == "category-band") {
					$(self.domRoot).removeClass("tl-story-block-category-hover");
				}
				$(self.domRoot).css({
					zIndex : 1
				});
				if (self.vSize == "miniature") {
					$(self.domRoot).removeClass("tl-sb-very-low-height").removeClass("tl-sb-very-low-height-no-image").removeClass("tl-sb-miniature-focused");
					$(self.domRoot).addClass("tl-sb-" + self.vSize + "-height");
				}
				if ((self.timeline.viewType == "duration" || self.category.viewType == "duration") && self.startDate.getTime() != self.endDate.getTime()) {
					$(self.domBasicInfoHolder).css({
						position : "static",
						left : 0
					});
					$(self.domDurationBar).css({
						marginLeft : 0
					});
				}
			},
			makeInvisible : function() {
				var self = this;
				$(self.domRoot).css({
					visibility : "hidden"
				});
				$(self.domSliderPoint).css({
					visibility : "hidden"
				});
			},
			makeVisible : function() {
				var self = this;
				$(self.domRoot).css({
					visibility : "visible"
				});
				$(self.domSliderPoint).css({
					visibility : "visible"
				});
			},
			deleteSelf : function() {
				var self = this;
				$(self.domSliderToolTip).remove();
				$(self.domRoot).remove();
				$(self.domSliderPoint).remove();
			}
		});