$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");
$import("assets.js.core.controller.AJKContentScrollerController");
$import("assets.js.core.component.AJKImageGallery");

Class.forName({
	name : "class assets.js.core.controller.TLContentPanelController extends Object",

	TLContentPanelController : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.mainController = data.mainController;
		self.timeline = self.mainController.timeline;
		self.domContentViewport = $(self.domRoot).find(".tl-main-content-block").get()[0];
		self.domContentStageHolder = $(self.domRoot).find(".tl-mc-content").get()[0];
		self.domContentCarousel = $(self.domRoot).find(".tl-mc-carousel").get()[0];
		self.domContentCarouselStage = $(self.domContentCarousel).find(".tl-mc-carousel-stage").get()[0];
		self.domTextContentBlock = $(self.domRoot).find(".tl-ch-content-block-text").get()[0];
		self.domContentIntroBlock = $(self.domRoot).find(".tl-ch-content-intro-block").get()[0];
		self.domPanelDateText = $(self.domRoot).find(".tl-ch-panel-date-display").get()[0];
		self.domHeadline = $(self.domRoot).find(".tl-ch-content-intro-block h3").get()[0];
		self.domStandfirst = $(self.domRoot).find(".tl-ch-content-intro-block p.tl-ch-standfirst").get()[0];
		self.domAuthorCredit = $(self.domRoot).find(".tl-ch-content-intro-block p.tl-ch-author").get()[0];
		self.domCloseButton = $(self.domRoot).find(".tl-ch-close-content").get()[0];
		self.domCloseVideoButton = $(self.domRoot).find(".tl-ch-close-video").get()[0];
		self.domNextStory = $(self.domRoot).find(".tl-ch-next-story").get()[0];
		self.domPrevStory = $(self.domRoot).find(".tl-ch-prev-story").get()[0];
		self.domStoryIndexText = $(self.domRoot).find(".tl-ch-selected-story-num").get()[0];
		self.storyIndexText = $(self.domStoryIndexText).text();
		self.domMediaSelectors = $(self.domRoot).find(".tl-ch-media-list li").get();
		self.domVideoContentHolder = $(self.domRoot).find(".tl-ch-video-content").get()[0];
		self.domVideoContent = $(self.domRoot).find(".tl-ch-vc-inner").get()[0];
		self.domGalleryBlock = $(self.domRoot).find(".tl-ch-gallery-block").get()[0];
		self.domGallery = $(self.domRoot).find(".tl-gallery").get()[0];
		self.domFullText = $(self.domRoot).find(".tl-ch-extra-info-text").get()[0];
		self.domTextContentCarousel = $(self.domRoot).find(".ajk-cs-carousel").get()[0];
		self.domReadMoreButton = $(self.domRoot).find(".tl-ch-full-story-link").get()[0];
		self.domStartTimelineButton = $(self.domRoot).find(".tl-ch-start-timeline").get()[0];
		self.domImageGallerySelector = self.domMediaSelectors[0];
		self.domVideoGallerySelector = self.domMediaSelectors[1];
		self.domAudioGallerySelector = self.domMediaSelectors[2];
		self.selectedGallerySelector = "";
		self.showVideoClass = "tl-ah-show-video-content";
		self.domGalleryBlockWidth = 380;
		self.contentViewportWidth = 0;
		self.thumbBlockHeight = 70;
		self.smallViewClass = "tl-content-holder-small-view";
		self.minHeight = 200;
		self.maxHeight = 354;
		self.galleryHideThumbHeight = 170;
		self.domGalleryMaskInner = $(self.domRoot).find(".tl-g-content-mask-inner").get()[0];
		self.imageGallery = "";
		self.bodyContent = "";
		self.standardGalleryWidth = 248;
		self.smallGalleryWidth = 200;
		self.dontDisplayGalleryWidth = 450;
		self.dontDisplayGalleryClass = "tl-content-holder-dont-display-gallery";
		self.currentGalleryWidth = self.standardGalleryWidth;
		self.viewportWidthWhenSmallGalleryKicksIn = 600;
		self.nextStory = "";
		self.prevStory = "";
		self.panelVisible = false;
		self.selectedStory = "";
		self.maxPanelWidth = 800;
		self.panelMargin = 5;
		self.contentScroller = "";
		self.maxNextPrevChars = 40;
		self.showGallery = true;
		self.defaultReadMoreButtonText = assets.js.core.setting.TLConfigText['contentPanel_Read_more_text'];
		self.maxThumblessGalleryHeight = 233;
		self.emptyImageReplacer = "assets/ui/default-gallery-image.gif";
	},
	init : function() {
		var self = this;
		if (self.timeline.openReadMoreLinks) {
			$(self.domReadMoreButton).attr("target", "_blank");
		}
		$(self.domRoot).find(".tl-mc-fade").click(function(e) {
			e.stopPropagation();
			if (self.imageViewerController && self.imageViewerController.active) {
				self.imageViewerController.hide();
			} else {
				self.hide();
			}
		});
		$(self.domStartTimelineButton).click(function() {
			self.hide();
			return false;
		});
		self.contentScroller = new assets.js.core.controller.AJKContentScrollerController({
			domRootEl : self.domTextContentCarousel
		}).init();
		self.selectedGallerySelector = self.domImageGallerySelector;
		$(self.domMediaSelectors).each(function() {
			var thisSelector = this;
			var thisSelectorType = $(this).attr("rel");
			$(this).find("a").click(function() {
				var numItems = parseInt($(this).find("span").text());
				if (numItems == 0) {
					return false;
				}
				self.removeVideo();
				if (self.selectedGallerySelector != thisSelector && numItems) {
					$(self.selectedGallerySelector).removeClass("tl-ch-selected");
					self.selectedGallerySelector = thisSelector;
					$(self.selectedGallerySelector).addClass("tl-ch-selected");
					self.displayGalleryType({
						type : thisSelectorType
					});
				}
				return false;
			});
		});
		$(self.domCloseButton).click(function() {
			self.hide();
			return false;
		});
		$(self.domCloseVideoButton).click(function() {
			self.removeVideo();
			return false;
		});
		$(self.domNextStory).click(function() {
			if (self.nextStory && !self.contentCarouselAnimating) {
				self.mainController.focusMarker({
					marker : self.nextStory,
					cancelUpdateHash : true
				});
				self.animateContentToStory({
					story : self.nextStory,
					direction : "next"
				});
			}
			return false;
		});
		$(self.domPrevStory).click(function() {
			if (self.prevStory && !self.contentCarouselAnimating) {
				self.mainController.focusMarker({
					marker : self.prevStory,
					cancelUpdateHash : true
				});
				self.animateContentToStory({
					story : self.prevStory,
					direction : "previous"
				});
			}
			return false;
		});
		return self;
	},
	animateContentToStory : function(data) {
		var self = this;
		if (($.browser.isIE6 || $.browser.isIE9) && self.timeline.lightboxStyle == 0) {
			self.displayForStory({
				story : data.story
			});
			return;
		}
		self.contentCarouselAnimating = true;
		var story = data.story;
		var direction = data.direction;
		var clonedContent = $(self.domContentStageHolder).clone(false);
		var cWidth = $(self.domContentStageHolder).width();
		var cHeight = $(self.domContentStageHolder).height() + 16;
		$(self.domContentCarousel).css({
			height : cHeight,
			overflow : "hidden"
		});
		var speed = 1000;
		if (direction == "next") {
			$(self.domContentStageHolder).css({
				width : cWidth
			});
			$(clonedContent).css({
				position : "absolute",
				left : 0,
				top : 0,
				width : cWidth
			});
			setTimeout(function() {
				$(self.domContentCarouselStage).prepend(clonedContent);
				$(self.domContentStageHolder).css({
					position : "absolute",
					left : cWidth + 100,
					top : 0
				});
				self.displayForStory({
					story : story,
					carousel : true
				});
				$(self.domContentCarouselStage).animate({
					left : -(cWidth + 100)
				}, speed, function() {
					$(clonedContent).remove();
					$(self.domContentStageHolder).css({
						position : "relative",
						left : 0,
						top : 0
					});
					$(this).css({
						left : 0
					});
					$(self.domContentCarousel).css({
						height : "auto"
					});
					$(self.domContentStageHolder).css({
						width : "auto"
					});
					self.contentCarouselAnimating = false;
				});
			}, 100);
		} else {
			$(self.domContentStageHolder).css({
				width : cWidth
			});
			$(clonedContent).css({
				position : "absolute",
				left : cWidth + 100,
				top : 0,
				width : cWidth
			});
			$(self.domContentCarouselStage).append(clonedContent);
			setTimeout(function() {
				self.displayForStory({
					story : story,
					carousel : true
				});
				$(self.domContentCarouselStage).css({
					left : -(cWidth + 100)
				}).animate({
					left : 0
				}, speed, function() {
					$(clonedContent).remove();
					$(self.domContentCarousel).css({
						height : "auto"
					});
					$(self.domContentStageHolder).css({
						width : "auto"
					});
					self.contentCarouselAnimating = false;
				});
			}, 100);
		}
	},
	initialiseImageGallery : function() {
		var self = this;
		var transition = ($.browser.msie) ? "FadeIn" : "FadeIn";
		var domGalleryRoot = $(self.domRoot).find(".tl-g-main-content").get()[0];
		var domThumbRoot = $(self.domRoot).find(".tl-g-thumb-holder").get()[0];
		$(domGalleryRoot).mousedown(function(e) {
			return false;
		});
		$(domGalleryRoot).click(function(e) {
			if ($(e.target).hasClass("tl-g-video-button")) {
				var videoKey = $(e.target).attr("videoKey");
				var videoItem = self.selectedStory.mediaByKey[videoKey];
				self.loadVideo({
					videoItem : videoItem
				});
				e.preventDefault();
				return false;
			} else if ($(e.target).hasClass("tl-g-audio-button")) {
				var audioKey = $(e.target).attr("audioKey");
				var audioItem = self.selectedStory.mediaByKey[audioKey];
				self.loadAudio({
					audioItem : audioItem
				});
				e.preventDefault();
				return false;
			} else if ($(e.target).hasClass("tl-g-flickr-button")) {
				window.open($(e.target).attr("href"));
				e.preventDefault();
				return false;
			} else if ($(e.target).parent().hasClass("tl-g-caption-holder") || $(e.target).parent().parent().hasClass("tl-g-caption-holder")) {
				if ($(e.target).attr("href")) {
					window.open($(e.target).attr("href"));
				}
				return false;
			} else if ($(self.imageGallery.domStageHolder).hasClass("tl-g-make-item-clickable")) {
				var flickrImageUrl = assets.js.core.utils.AJKHelpers.getFKRPhotoPageFromImageSrc({
					src : $(self.imageGallery.previousImage.domImage).attr("origSrc")
				});
				window.open(flickrImageUrl);
			} else if ($(self.selectedGallerySelector).attr("rel") == "images") {
				if (self.timeline.expander == 0) {
					return false;
				}
				if (!self.imageViewerController) {
					self.imageViewerController = new TLCPImageViewer({
						controller : self
					}).init();
				}
				self.imageViewerController.launchWithImage({
					story : self.selectedStory,
					imageIndex : self.imageGallery.selectedImageIndex,
					lightbox : self.timeline.lightboxStyle
				});
			}
		});
		$(domThumbRoot).mousedown(function(e) {
			return false;
		});
		self.imageGallery = new assets.js.core.component.AJKImageGallery({
			domRootEl : domGalleryRoot,
			domStageHolder : $(self.domRoot).find(".tl-g-main-content").get()[0],
			domStage : $(self.domRoot).find(".tl-g-main-stage").get()[0],
			transition : transition,
			domPrevButton : $(self.domRoot).find(".tl-g-gallery-control-left").get()[0],
			domNextButton : $(self.domRoot).find(".tl-g-gallery-control-right").get()[0],
			buttonHideClass : "tl-hide",
			imageInfoFunction : "",
			imageHolderHTML : '<div class="tl-g-main-item ak-image-holder"></div>',
			thumbBlockSize : {
				height : 60,
				width : 60,
				widthPadding : 3
			},
			createImageInfoHTML : function(data) {
				var anImage = data.image;
				var insertHTML = "";
				if (anImage.caption) {
					insertHTML += '<div class="tl-g-caption-holder">';
					insertHTML += '<p>' + assets.js.core.utils.AJKHelpers.removeScript({
						content : anImage.caption
					}) + '</p>';
					insertHTML += '</div>';
				}
				if (anImage.type == "Video") {
					insertHTML += '<a href="#" class="tl-g-media-button tl-g-video-button" videoKey="' + anImage.key + '">'
							+ assets.js.core.setting.TLConfigText['contentPanel_Play_video'] + '</a>';
				}
				if (anImage.type == "Audio") {
					insertHTML += '<a href="#" class="tl-g-media-button tl-g-audio-button" audioKey="' + anImage.key + '">'
							+ assets.js.core.setting.TLConfigText['contentPanel_Play_audio'] + '</a>';
				}
				if (anImage.type == "Image" && assets.js.core.utils.AJKHelpers.isFlickrImage({
					src : anImage.src
				})) {
					var fkrLink = assets.js.core.utils.AJKHelpers.getFKRPhotoPageFromImageSrc({
						src : anImage.src
					});
					insertHTML += '<a href="' + fkrLink + '" class="tl-g-media-button tl-g-flickr-button" imageKey="' + anImage.key + '">View on Flickr</a>';
				}
				return insertHTML;
			},
			createDomImage : function(data) {
				var anImage = data.image;
				var insertHTML = "";
				if (anImage.type == "Image") {
					var imageSrc = assets.js.core.utils.AJKHelpers.getTimelineImageUrl({
						src : anImage.src,
						emptyImage : self.emptyImageReplacer
					});
					insertHTML += '<img origSrc="' + anImage.src + '" src="' + imageSrc + '" alt="' + anImage.caption + '" />';
				} else if (anImage.type == "Video") {
					var imageSrc = assets.js.core.utils.AJKHelpers.getTimelineImageUrl({
						src : anImage.externalMediaThumb,
						emptyImage : self.emptyImageReplacer
					});
					insertHTML += '<img src="' + imageSrc + '" alt="' + anImage.caption + '" />';
				} else if (anImage.type == "Audio") {
					var audioImage = assets.js.core.utils.AJKHelpers.getTimelineImageUrl({
						src : anImage.externalMediaThumb,
						emptyImage : self.mainController.defaultAudioImage
					});
					insertHTML += '<img src="' + audioImage + '" alt="' + anImage.caption + '" />';
				}
				return $(insertHTML).get()[0];
			},
			domThumbPrevButton : $(self.domRoot).find(".tl-g-thumb-control-left").get()[0],
			domThumbNextButton : $(self.domRoot).find(".tl-g-thumb-control-right").get()[0],
			selectedThumbClass : "tl-g-thumb-item-selected",
			domThumbsHolder : domThumbRoot,
			domThumbsStage : $(self.domRoot).find(".tl-g-thumb-stage").get()[0],
			createThumbBlockFunc : function(data) {
				var domImage = data.domImage;
				var insertHTML = '<div class="tl-g-thumb-item">';
				insertHTML += '<div class="tl-g-thumb-mask"></div>';
				insertHTML += '</div>';
				var domThumb = $(insertHTML).get()[0];
				$(domThumb).prepend(domImage);
				return domThumb;
			},
			resizeCallbackFunc : function(data) {
				var newSize = data.newSize;
				$(self.domGalleryMaskInner).css({
					height : newSize.height - 2
				});
			},
			imageWasSelected : function(data) {
				var origSrc = $(data.anImage.domImage).attr("origSrc");
				var domGStage = self.imageGallery.domStageHolder;
				if (origSrc && origSrc.indexOf("flickr.com") != -1) {
					$(domGStage).addClass("tl-g-make-item-clickable");
				} else {
					$(domGStage).removeClass("tl-g-make-item-clickable");
				}
				if ($(self.selectedGallerySelector).attr("rel") == "images" && self.timeline.expander != 0) {
					$(domGStage).addClass("tl-g-mc-image-hover");
				} else {
					$(domGStage).removeClass("tl-g-mc-image-hover");
				}
			}
		}).init();
	},
	loadVideo : function(data) {
		var self = this;
		var videoItem = data.videoItem;
		var embedHTML = assets.js.core.utils.AJKHelpers.generateVideoEmbedHTML({
			src : videoItem.src,
			type : videoItem.externalMediaType,
			videoId : videoItem.externalMediaId,
			width : "100%",
			height : "100%",
			colour : self.timeline.mainColour,
			autoplay : true,
			theme : (self.timeline.lightboxStyle == 1) ? "light" : "dark"
		});
		$(self.domCloseVideoButton).text(assets.js.core.setting.TLConfigText['contentPanel_Close_video']);
		$(self.domVideoContentHolder).css({
			display : "block"
		});
		$(self.domContentViewport).addClass(self.showVideoClass);
		$(self.domVideoContent).html(embedHTML);
	},
	loadAudio : function(data) {
		var self = this;
		var audioItem = data.audioItem;
		var embedHTML = assets.js.core.utils.AJKHelpers.generateAudioEmbedHTML({
			src : audioItem.src,
			type : audioItem.externalMediaType,
			audioId : audioItem.externalMediaId,
			width : "100%",
			height : "100%",
			colour : self.timeline.mainColour,
			autoplay : true,
			theme : (self.timeline.lightboxStyle == 1) ? "light" : "dark"
		});
		$(self.domCloseVideoButton).text(assets.js.core.setting.TLConfigText['contentPanel_Close_audio']);
		$(self.domVideoContentHolder).css({
			display : "block"
		});
		$(self.domContentViewport).addClass(self.showVideoClass);
		$(self.domVideoContent).html(embedHTML);
	},
	displayGalleryType : function(data) {
		var self = this;
		var galleryType = data.type;
		self.imageGallery.loadWithImages({
			images : self.selectedStory[galleryType]
		});
		self.resizeContent({
			newSize : assets.js.core.utils.AJKHelpers.viewportSize()
		});
	},
	updateMediaGallerySelectors : function(data) {
		var self = this;
		var story = data.story;
		$(self.domImageGallerySelector).removeClass("tl-ch-disabled").find("span").text(story.images.length);
		$(self.domVideoGallerySelector).removeClass("tl-ch-disabled").find("span").text(story.videos.length);
		$(self.domAudioGallerySelector).removeClass("tl-ch-disabled").find("span").text(story.audio.length);
		if (story.images.length == 0) {
			$(self.domImageGallerySelector).addClass("tl-ch-disabled");
		}
		if (story.videos.length == 0) {
			$(self.domVideoGallerySelector).addClass("tl-ch-disabled");
		}
		if (story.audio.length == 0) {
			$(self.domAudioGallerySelector).addClass("tl-ch-disabled");
		}
		$(self.selectedGallerySelector).removeClass("tl-ch-selected");
		if (story.videos.length > 0) {
			self.selectedGallerySelector = self.domVideoGallerySelector;
		} else if (story.audio.length > 0 && story.images.length == 0) {
			self.selectedGallerySelector = self.domAudioGallerySelector;
		} else {
			self.selectedGallerySelector = self.domImageGallerySelector;
		}
		$(self.selectedGallerySelector).addClass("tl-ch-selected");
	},
	displayForStory : function(data) {
		var self = this;
		var story = data.story;
		if (self.timeline.lightboxStyle == 2 && !story.isTimelineIntro) {
			return;
		}
		self.showGallery = true;
		var borderColor = (story.isTimelineIntro) ? "#" + self.timeline.mainColour : "#" + story.category.colour;
		borderColor = (self.timeline.lightboxStyle == 1) ? borderColor : "transparent";
		if (data.carousel && self.timeline.lightboxStyle == 1) {
			$(self.domContentViewport).animate({
				backgroundColor : borderColor
			}, 700);
		} else {
			$(self.domContentViewport).css({
				backgroundColor : borderColor
			});
		}
		var cancelGalleryTransition = true;
		self.selectedStory = story;
		if (!self.panelVisible) {
			$(self.domRoot).css({
				display : "block",
				visibility : "hidden"
			});
			setTimeout(function() {
				self.fadeInPanel();
			}, 1);
		}
		if (!story.isTimelineIntro && !story.extraInfoLoaded) {
			$(self.domContentStageHolder).css({
				visibility : "hidden"
			});
			(function() {
				var thisFunc = arguments.callee;
				if (story.extraInfoLoaded) {
					self.bodyContent = (story.fullText) ? self.formatBodyText({
						text : story.fullText
					}) : "";
					$(self.domFullText).html(self.bodyContent);
					self.contentScroller.reset();
					self.contentScroller.resetSize();
					$(self.domContentStageHolder).css({
						visibility : "visible"
					});
					self.resizeContent({
						newSize : assets.js.core.utils.AJKHelpers.viewportSize()
					});
				} else {
					setTimeout(function() {
						thisFunc();
					}, 10);
				}
			})();
		}
		if (story.isTimelineIntro) {
			$(self.domContentViewport).addClass("tl-ch-timeline-intro-view");
			$(self.domPanelDateText).text(assets.js.core.setting.TLConfigText['basic_By'] + " " + self.timeline.authorName);
		} else {
			$(self.domContentViewport).removeClass("tl-ch-timeline-intro-view");
			if (story.dateStatus == 1) {
				$(self.domPanelDateText).text("n/a").removeClass("tl-hide").addClass("tl-hide");
			} else if (story.dateStatus == 2) {
				$(self.domPanelDateText).text("~" + story.formatDisplayDate()).removeClass("tl-hide");
			} else {
				$(self.domPanelDateText).text(story.formatDisplayDate()).removeClass("tl-hide");
			}
		}
		if (story.externalLink) {
			var buttonText = self.defaultReadMoreButtonText;
			if (story.feedSource == "twitter") {
				buttonText = assets.js.core.setting.TLConfigText['contentPanel_View_on'] + " Twitter";
			} else if (story.feedSource == "youtube") {
				buttonText = assets.js.core.setting.TLConfigText['contentPanel_View_on'] + " YouTube";
			}
			$(self.domReadMoreButton).text(buttonText).css({
				display : "block"
			}).attr("href", story.externalLink);
		} else {
			$(self.domReadMoreButton).css({
				display : "none"
			});
		}
		self.removeVideo();
		self.panelVisible = true;
		self.prevStory = self.mainController.getPrevStory({
			story : story
		});
		if (self.prevStory) {
			var pText = assets.js.core.utils.AJKHelpers.prepareGTLTForText({
				content : self.prevStory.headline
			});
			$(self.domPrevStory).text(assets.js.core.utils.AJKHelpers.clipToMaxCharWords({
				aString : pText,
				maxChars : 40
			})).css({
				display : "block"
			});
			self.prevStory.loadExtraInfo();
		} else {
			$(self.domPrevStory).css({
				display : "none"
			});
		}
		self.nextStory = self.mainController.getNextStory({
			story : story
		});
		if (self.nextStory) {
			var nText = assets.js.core.utils.AJKHelpers.prepareGTLTForText({
				content : self.nextStory.headline
			});
			$(self.domNextStory).text(assets.js.core.utils.AJKHelpers.clipToMaxCharWords({
				aString : nText,
				maxChars : 40
			})).css({
				display : "block"
			});
			self.nextStory.loadExtraInfo();
			self.lastStoryReached = false;
		} else {
			$(self.domNextStory).css({
				display : "none"
			});
			self.lastStoryReached = true;
		}
		var numStories = self.mainController.getNumStories();
		var storyIndexText = self.storyIndexText.replace("x1", (story.orderIndex + 1)).replace("x2", numStories);
		$(self.domStoryIndexText).text(storyIndexText);
		self.bodyContent = (story.fullText) ? self.formatBodyText({
			text : story.fullText
		}) : "";
		$(self.domFullText).html(self.bodyContent);
		self.applyTargetsToFullTextLinks();
		var headline = assets.js.core.utils.AJKHelpers.prepareGTLTForText({
			content : story.headline
		});
		$(self.domHeadline).text(headline);
		$(self.domStandfirst).empty().append(story.clippedContentIntroText);
		if (story.ownerName) {
			$(self.domAuthorCredit).text(assets.js.core.setting.TLConfigText['basic_By'] + " " + story.ownerName).css({
				display : "block"
			});
		} else {
			$(self.domAuthorCredit).css({
				display : "None"
			});
		}
		$(self.domRoot).css({
			display : "block"
		});
		if (!self.imageGallery) {
			self.initialiseImageGallery();
		}
		var galleryImages = "";
		self.updateMediaGallerySelectors({
			story : story
		});
		if (story.images.length > 0 && story.feedSource != "twitter") {
			galleryImages = story.images;
		} else {
			galleryImages = [ {
				id : "noId",
				src : "",
				caption : "",
				type : "Image"
			} ];
		}
		if (story.videos.length > 0) {
			self.imageGallery.loadWithImages({
				images : story.videos,
				clearTransition : cancelGalleryTransition
			});
		} else if (story.audio.length > 0 && story.images.length == 0) {
			self.imageGallery.loadWithImages({
				images : story.audio,
				clearTransition : cancelGalleryTransition
			});
		} else {
			self.imageGallery.loadWithImages({
				images : galleryImages,
				clearTransition : cancelGalleryTransition
			});
		}
		if (story.videos.length == 0 && story.audio.length == 0 && !galleryImages[0].src) {
			self.showGallery = false;
		}
		theAJKWindowResizeEvent.removeAsObserver({
			observer : self
		});
		theAJKWindowResizeEvent.registerAsObserver({
			observer : self
		});
		self.resizeContent({
			newSize : assets.js.core.utils.AJKHelpers.viewportSize()
		});
		setTimeout(function() {
			self.resizeContent({
				newSize : assets.js.core.utils.AJKHelpers.viewportSize()
			});
		});
		self.contentScroller.reset();
		self.contentScroller.resetSize();
		if (!story.isTimelineIntro) {
			theTLHashController.setHashToStoryPanel({
				storyId : story.id
			});
		}
	},
	removeVideo : function() {
		var self = this;
		$(self.domVideoContent).empty();
		setTimeout(function() {
			$(self.domVideoContentHolder).css({
				display : "none"
			});
			$(self.domContentViewport).removeClass(self.showVideoClass);
		}, 1);
	},
	hide : function() {
		var self = this;
		theAJKWindowResizeEvent.removeAsObserver({
			observer : self
		});
		if ($.browser.msie && $.browser.version < 9) {
			$(self.domRoot).css({
				display : "none"
			});
			self.removeVideo();
		} else {
			$(self.domRoot).animate({
				opacity : 0
			}, 500, function() {
				$(this).css({
					display : "none"
				});
				self.removeVideo();
			});
		}
		self.panelVisible = false;
		theTLHashController.setHashToCurrentDate();
	},
	fadeInPanel : function() {
		var self = this;
		if ($.browser.msie) {
			$(self.domRoot).css({
				display : "block",
				visibility : "hidden"
			});
			setTimeout(function() {
				$(self.domRoot).css({
					visibility : "visible"
				});
				$(self.domContentViewport).css({
					visibility : "visible"
				});
			}, 1);
		} else {
			$(self.domRoot).css({
				opacity : 0,
				display : "block",
				visibility : "visible"
			});
			setTimeout(function() {
				$(self.domContentViewport).css({
					visibility : "visible",
					opacity : "1"
				});
				$(self.domRoot).animate({
					opacity : 1
				}, 500);
			}, 1);
		}
		self.panelVisible = true;
	},
	windowDidResize : function(data) {
		var self = this;
		var newSize = data.newSize;
		self.resizeContent({
			newSize : newSize
		});
	},
	resizeContent : function(data) {
		var self = this;
		var newSize = data.newSize;
		var showGallery = (newSize.width < self.dontDisplayGalleryWidth) ? false : self.showGallery;
		if (showGallery) {
			$(self.domContentStageHolder).removeClass(self.dontDisplayGalleryClass);
		} else {
			$(self.domContentStageHolder).addClass(self.dontDisplayGalleryClass);
		}
		var gallerySize = "standard";
		var smallTextLayout = false;
		var contentHeight = newSize.height - 150;
		contentHeight = (contentHeight > self.minHeight) ? contentHeight : self.minHeight;
		contentHeight = (contentHeight < self.maxHeight) ? contentHeight : self.maxHeight;
		$(self.domContentStageHolder).css({
			height : contentHeight
		});
		$(self.domTextContentCarousel).css({
			height : contentHeight - 48
		});
		$(self.domGallery).css({
			height : contentHeight - 48
		});
		var panelWidth = newSize.width - 50;
		panelWidth = (panelWidth > self.maxPanelWidth) ? self.maxPanelWidth : panelWidth;
		self.panelMargin = (newSize.height - contentHeight - 84) / 2;
		$(self.domContentViewport).css({
			top : self.panelMargin,
			width : panelWidth
		});
		$(self.domVideoContentHolder).css({
			height : contentHeight - 48,
			width : panelWidth - 40
		});
		self.contentViewportWidth = $(self.domContentStageHolder).width();
		if (!showGallery) {
			self.currentGalleryWidth = 0;
		} else if (self.contentViewportWidth <= self.viewportWidthWhenSmallGalleryKicksIn) {
			self.currentGalleryWidth = self.smallGalleryWidth;
			gallerySize = "smaller";
			smallTextLayout = true;
		} else {
			self.currentGalleryWidth = self.standardGalleryWidth;
		}
		var dateTextLeft = self.currentGalleryWidth + ((showGallery) ? 20 : 0);
		$(self.domPanelDateText).css({
			left : dateTextLeft
		});
		var nextPrevChars = parseInt((self.contentViewportWidth - 100) / 17);
		nextPrevChars = (nextPrevChars > self.maxNextPrevChars) ? self.maxNextPrevChars : nextPrevChars;
		if (self.prevStory) {
			var pText = assets.js.core.utils.AJKHelpers.prepareGTLTForText({
				content : self.prevStory.headline
			});
			$(self.domPrevStory).text(assets.js.core.utils.AJKHelpers.clipToMaxCharWords({
				aString : pText,
				maxChars : nextPrevChars
			}));
		}
		if (self.nextStory) {
			var nText = assets.js.core.utils.AJKHelpers.prepareGTLTForText({
				content : self.nextStory.headline
			});
			$(self.domNextStory).text(assets.js.core.utils.AJKHelpers.clipToMaxCharWords({
				aString : nText,
				maxChars : nextPrevChars
			}));
		}
		if (contentHeight - self.minHeight < 30) {
			gallerySize = "smaller";
			smallTextLayout = true;
		}
		if (!self.selectedStory.fullText) {
			var extraClass = (smallTextLayout) ? "tl-ch-content-small-text-large-standfirst" : "tl-ch-content-large-standfirst";
		}
		$(self.domTextContentBlock).css({
			width : self.contentViewportWidth - self.currentGalleryWidth - 1
		});
		if (self.imageGallery && showGallery) {
			var setUpGallery = function() {
				var galleryHeight = contentHeight - 51 - self.thumbBlockHeight;
				var forceHideThumbs = false;
				if (self.selectedStory.isTimelineIntro || self.imageGallery.numImages <= 1) {
					forceHideThumbs = true;
				}
				if (galleryHeight < self.galleryHideThumbHeight || self.currentGalleryWidth < self.standardGalleryWidth || forceHideThumbs) {
					galleryHeight += self.thumbBlockHeight;
					self.imageGallery.hideThumbs();
					if ((self.selectedStory.mainImageWidth > 0 && self.selectedStory.mainImageHeight / self.selectedStory.mainImageWidth < 1.2)
							|| !self.selectedStory.mainImageHeight) {
						galleryHeight = (galleryHeight > self.maxThumblessGalleryHeight) ? self.maxThumblessGalleryHeight : galleryHeight;
					}
					if (!self.selectedStory.mainImageHeight) {
						(function() {
							var thisFunc = arguments.callee;
							if (self.selectedStory.mainImageHeight) {
								self.resizeContent({
									newSize : assets.js.core.utils.AJKHelpers.viewportSize()
								});
							} else {
								setTimeout(function() {
									thisFunc();
								}, 100);
							}
						})();
					}
				} else {
					self.imageGallery.showThumbs();
				}
				$(self.domGalleryBlock).css({
					width : self.currentGalleryWidth
				});
				self.imageGallery.updateSizeTo({
					size : {
						width : self.currentGalleryWidth,
						height : galleryHeight
					}
				});
			};
			if ($.browser.msie) {
				setTimeout(function() {
					setUpGallery();
				}, 1);
			} else {
				setUpGallery();
			}
		}
		self.contentScroller.resetSize();
	},
	applyTargetsToFullTextLinks : function() {
		var self = this;
		var tText = (self.timeline.embed == "true") ? "_top" : "";
		tText = (self.timeline.openReadMoreLinks == 1) ? "_blank" : tText;
		if (tText) {
			$(self.domFullText).find("a").each(function() {
				if ($(this).attr("target") == "") {
					$(this).attr("target", tText);
				}
			});
		}
	},
	formatBodyText : function(data) {
		var self = this;
		var someText = data.text;
		var extraLinkText = (self.timeline.embed == "true") ? 'target="_top"' : "";
		extraLinkText = (self.timeline.openReadMoreLinks == 1) ? 'target="_blank"' : extraLinkText;
		if (someText) {
			someText = someText.replace(/\\'/g, "'").replace(/;xNLx;/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n\n/g, "\n").replace(/   /g, " ").replace(
					/  /g, " ").replace(/ \n/g, "\n").replace(/\n/g, "</p><p>");
			someText = '<p>' + someText + '</p>';
			var aMatch = "";
			while ((aMatch = someText.match(/\[([^\[\(\]\)]*)\]\(([^\[\(\]\)]*)\)/))) {
				var aLink = assets.js.core.utils.AJKHelpers.customCreateClickableLinks({
					aString : aMatch[0],
					extra : extraLinkText
				});
				someText = someText.replace(aMatch[0], aLink);
			}
		}
		return someText;
	}
});