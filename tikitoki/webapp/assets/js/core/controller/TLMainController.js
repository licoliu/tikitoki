$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");
$import("assets.js.core.controller.TLViewController");
$import("assets.js.core.controller.TLContentPanelController");
$import("assets.js.core.controller.TLLoginPanelController");
$import("assets.js.core.controller.TLSignupPanelController");
$import("assets.js.core.component.TLMarker");
$import("assets.js.core.controller.TLSliderController");
$import("assets.js.core.controller.TL3DViewController");
$import("assets.js.core.component.AJKImageLoader");
$import("assets.js.core.controller.TLSecretLoginController");
$import("assets.js.launcher.TLUserControls");
$import("assets.js.launcher.TLUserCharts");

Class.forName({
	name : "class assets.js.core.controller.TLMainController extends Object",

	TLMainController : function(dataObj) {
		var self = this;
		self.sliderController = "";
		self.originalStartDate = "";
		self.originalEndDate = "";
		self.startDate = "";
		self.endDate = "";
		self.domMainHolder = $("#tl-container").get()[0];
		self.domStageHolder = $("#tl-stage-holder").get()[0];
		self.domFixedStageContent = $(self.domStageHolder).find(".tl-stage-fixed-position-content").get()[0], self.domContentHolder = $("#tl-content-holder").get()[0];
		self.selectedView = "";
		self.domDateDisplayer = $("#tl-stage-date-displayer").get()[0];
		self.domSliderHolder = $("#tl-slider-holder").get()[0];
		self.domImagePreloader = $("#tl-image-preloader").get()[0];
		self.domTimelineHeader = $("#tl-header").get()[0];
		self.domTimelineTitle = $("#tl-header .tl-main-title").get()[0];
		self.domMainPhotoCredit = $("#tl-stage-main-photo-credit").get()[0];
		self.pageSizeClass = "";
		self.markers = new Array();
		self.markersByKey = new Array();
		self.markerKeyText = "tl-marker-id-";
		self.activeMarkers = self.markers;
		self.markerKeyInc = 1;
		self.markersById = new Array();
		self.userCookieName = "TLUSERCOOKIE";
		self.secretUserCookieName = "TLSECRETUSERCOOKIE";
		self.cookieSeparator = "-?#-";
		self.loginPanelController = "";
		self.user = {
			loggedIn : false,
			id : "",
			username : "",
			verifyCode : "",
			timelines : new Array(),
			timelinesByKey : new Array(),
			accountType : ""
		};
		self.adminController = "";
		if (TLSingleTimelineLicense) {
			$(self.domMainHolder).find(".tl-timeline-info p.tl-ah-about-text").html(TLTimelineData.aboutText);
		}
		self.viewTypes = [];
		self.viewTypes[0] = "standard";
		self.viewTypes[1] = "category-band";
		self.viewTypes[2] = "color-category-stories";
		self.viewTypes[3] = "duration";
		self.isInitialHashDate = theTLHashController.getHashDate({
			hash : window.location.hash
		});
		self.timeline = {
			id : TLTimelineData.id,
			isEditable : false,
			showAdBlock : TLTimelineData.showAdBlock,
			storySpacingType : TLTimelineData.storySpacing,
			markerSpacing : assets.js.core.controller.TLViewController.markerSpacingView[TLTimelineData.storySpacing].type,
			equalMarkerSpacing : assets.js.core.controller.TLViewController.markerSpacingView[TLTimelineData.storySpacing].markerSpacing,
			markerSpacingObj : assets.js.core.controller.TLViewController.markerSpacingView[TLTimelineData.storySpacing],
			equalSpacingMinWidth : 3000,
			viewTypeValue : TLTimelineData.viewType,
			viewType : (TLTimelineData.viewType) ? self.viewTypes[TLTimelineData.viewType] : self.viewTypes[0],
			showTitleBlock : TLTimelineData.showTitleBlock,
			initialEqualMarkerLeftPadding : 500,
			initialEqualMarkerTotalPadding : 750,
			equalMarkerLeftPadding : 500,
			equalMarkerTotalPadding : 750,
			homePage : TLTimelineData.homePage,
			host : TLTimelineData.host,
			startDate : assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
				dateString : TLTimelineData.startDate
			}),
			endDate : assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
				dateString : TLTimelineData.endDate
			}),
			markersByKey : self.markersByKey,
			markersById : self.markersById,
			markers : self.markers,
			title : assets.js.core.utils.AJKHelpers.removeScript({
				content : TLTimelineData.title
			}),
			authorName : assets.js.core.utils.AJKHelpers.removeScript({
				content : TLTimelineData.authorName
			}),
			accountType : TLTimelineData.accountType,
			mainColour : TLTimelineData.mainColour,
			zoom : TLTimelineData.zoom,
			savedZoom : TLTimelineData.zoom,
			categories : (TLTimelineData.categories) ? TLTimelineData.categories : new Array(),
			categoriesByKey : new Array(),
			introText : assets.js.core.utils.AJKHelpers.removeScript({
				content : TLTimelineData.introText
			}),
			aboutText : assets.js.core.utils.AJKHelpers.removeScript({
				content : ''// TODO
			// $(self.domMainHolder).find(".tl-timeline-info
			// p.tl-ah-about-text").html().replace(/;xNLx;/g, "\n")
			}),
			introImage : TLTimelineData.introImage,
			backgroundImage : TLTimelineData.backgroundImage,
			introImageCredit : TLTimelineData.introImageCredit,
			backgroundColour : (TLTimelineData.backgroundColour) ? TLTimelineData.backgroundColour : "1a1a1a",
			backgroundImageCredit : TLTimelineData.backgroundImageCredit,
			feed : TLTimelineData.feed,
			embed : (TLSingleTimelineLicense) ? "true" : TLTimelineData.embed,
			embedHash : TLTimelineData.embedHash,
			secret : (TLSingleTimelineLicense || TLTimelineData.accountType == "Standard") ? "false" : TLTimelineData.secret,
			public : TLTimelineData.public,
			dontDisplayIntroPanel : TLTimelineData.dontDisplayIntroPanel,
			openReadMoreLinks : TLTimelineData.openReadMoreLinks,
			storyDateStatus : TLTimelineData.storyDateStatus,
			storyDateFormat : TLTimelineData.storyDateFormat,
			topDateFormat : TLTimelineData.topDateFormat,
			sliderDateFormat : TLTimelineData.sliderDateFormat,
			urlFriendlyTitle : TLTimelineData.urlFriendlyTitle,
			originalTitle : TLTimelineData.title,
			language : TLTimelineData.language,
			displayStripes : TLTimelineData.displayStripes,
			htmlFormatting : TLTimelineData.htmlFormatting,
			initialFocus : (TLTimelineData.initialFocus) ? TLTimelineData.initialFocus : "first",
			feeds : (TLTimelineData.feeds) ? TLTimelineData.feeds : [],
			storyImageAutoCrop : 1,
			containerBackgroundColour : TLTimelineData.containerBackgroundColour,
			sliderBackgroundColour : TLTimelineData.sliderBackgroundColour,
			sliderTextColour : TLTimelineData.sliderTextColour,
			sliderDetailsColour : TLTimelineData.sliderDetailsColour,
			sliderDraggerColour : TLTimelineData.sliderDraggerColour,
			headerBackgroundColour : TLTimelineData.headerBackgroundColour,
			headerTextColour : TLTimelineData.headerTextColour,
			showGroupAuthorNames : TLTimelineData.showGroupAuthorNames,
			durHeadlineColour : TLTimelineData.durHeadlineColour,
			cssFile : TLTimelineData.cssFile,
			altFlickrImageUrl : TLTimelineData.altFlickrImageUrl,
			fontBase : TLTimelineData.fontBase,
			fontHead : TLTimelineData.fontHead,
			fontBody : TLTimelineData.fontBody,
			lightboxStyle : TLTimelineData.lightboxStyle,
			showControls : TLTimelineData.showControls,
			lazyLoading : (TLTimelineData.lazyLoading == "1") ? 1 : 0,
			lazyLoadingActive : (TLTimelineData.lazyLoading == "1") ? 1 : 0,
			privacyPassword : TLTimelineData.protection,
			expander : TLTimelineData.expander,
			copyable : parseInt(TLTimelineData.copyable),
			settings3d : TLTimelineData.settings3d,
			scriptable : false,
			bgStyle : TLTimelineData.bgStyle,
			bgScale : TLTimelineData.bgScale / 100,
			urlHashing : TLTimelineData.urlHashing
		};
		self.isHomePage = TLTimelineData.homePage;
		self.contentPanelController = "";
		self.timelineBackgroundImage = TLTimelineData.backgroundImage;
		self.domTimelineBackgroundImage = "";
		self.categoriesKeyPrefix = "tl-category-key-";
		self.aboutTimelineStory = "";
		self.secretLoginController = "";
		self.minimumLayoutHeight = 430;
		self.minimumLayoutHeight2 = 350;
		self.minimumLayout = false;
		self.defaultCategory = {
			autoGenerated : true,
			title : assets.js.core.setting.TLConfigText['category_defaultTitle'],
			colour : self.timeline.mainColour || "bd7997",
			order : 100,
			size : 10,
			id : "default",
			key : self.categoriesKeyPrefix + "default",
			rows : 3,
			layout : 0,
			viewType : "standard"
		};
		self.feedController = "";
		self.initialFeedsLoaded = false;
		self.defaultAudioImage = "assets/ui/default-audio-image.gif";
		self.autoCropOffClass = "tl-story-image-auto-crop-off";
		self.domAdBlock = "";
		self.domAdBlockHeight = 0;
		self.hideStripesClass = "tl-hide-scale-stripes";
		self.mouseOverUserControls = false;
	},
	init : function() {
		var self = this;
		self.initialise3DValues();
		assets.js.core.utils.AJKHelpers.isScriptable = self.timeline.scriptable;
		self.sortCategories();
		self.initBrowserStyles();
		self.initFontStyles();
		self.initLightboxStyles();
		if (self.timeline.language != "english") {
			self.initLanguage();
		}
		if (self.timeline.showAdBlock == "true") {
			self.domAdBlock = $("#tl-advert-block").get()[0];
			self.domAdBlockHeight = $(self.domAdBlock).height();
		}
		self.customiseHeader();
		if (!self.timeline.displayStripes) {
			$(self.domMainHolder).addClass(self.hideStripesClass);
		}
		if (!self.timeline.storyImageAutoCrop) {
			$(self.domMainHolder).addClass(self.autoCropOffClass);
		}
		if (!TLSingleTimelineLicense && self.timeline.embed == "false" && !self.isHomePage && window.top && window.top != window.self) {
			window.top.location = window.self.location.href;
			return;
		}
		if (TLSingleTimelineLicense) {
			$(self.domTimelineTitle).html(self.timeline.title);
		}
		if (self.timeline.embed == "true") {
			if (!self.timeline.showTitleBlock) {
				$(self.domMainHolder).addClass("tl-container-hide-header");
			}
		}
		$(self.domStageHolder).css({
			backgroundColor : "#" + self.timeline.backgroundColour
		});
		theAJKWindowResizeEvent.registerAsObserver({
			observer : self
		});
		self.initialiseCategories();
		if (typeof TLFeedController != "undefined") {
			self.feedController = new TLFeedController({
				controller : self,
				feeds : self.timeline.feeds,
				feedsLoadedCallback : function() {
					if (self.timeline.feeds.length > 0) {
						self.refreshTimelineAfterFeedChange();
						self.setupInitialDate({
							ignoreHash : !self.isInitialHashDate
						});
					}
					self.initialFeedsLoaded = true;
					self.isInitialHashDate = true;
				}
			}).init();
		}
		theAJKAjaxController.loginController = self;
		$(self.domMainPhotoCredit).html(self.getBGImageCredit());
		$(self.domSliderHolder).mousedown(function() {
			self.hideContentPanelIfVisible();
			return false;
		});
		self.contentPanelController = new assets.js.core.controller.TLContentPanelController({
			domRoot : self.domContentHolder,
			mainController : self
		}).init();
		var isUserLoggedIn = $(self.domMainHolder).find(".tl-data-userId").text();
		var isSecretUserLoggedIn = $(self.domMainHolder).find(".tl-data-secret-userId").text();
		if (isSecretUserLoggedIn && self.timeline.embed != "true") {
			self.loadUserCookie({
				cookieName : self.secretUserCookieName
			});
			self.user.secretUser = true;
			setTimeout(function() {
				// self.launchAdmin();
			}, 1);
		} else if (isUserLoggedIn && self.timeline.embed != "true") {
			assets.js.core.utils.AJKHelpers.deleteCookie({
				name : self.secretUserCookieName
			});
			self.loadUserCookie();
			setTimeout(function() {
				// self.launchAdmin();
			}, 1);
		}
		self.initialisePopDownPanels();
		$.each(TLTimelineData.stories, function() {
			self.createMarker({
				id : this.id,
				ownerId : this.ownerId,
				ownerName : this.ownerName,
				startDate : assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
					dateString : this.startDate
				}),
				headline : this.title,
				introText : this.text,
				media : this.media,
				endDate : assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
					dateString : this.endDate
				}),
				category : self.timeline.categoriesByKey[self.categoriesKeyPrefix + this.category],
				externalLink : this.externalLink,
				fullText : this.fullText,
				dateFormat : this.dateFormat
			});
		});
		self.sortMarkersList();
		self.initialiseView();
		self.initialiseSlider();
		self.initialise3DView();
		self.initialiseBackgroundImage();
		if ($.browser.msie) {
			setTimeout(function() {
				self.resizeContent({
					newSize : assets.js.core.utils.AJKHelpers.viewportSize()
				});
			});
		} else {
			self.resizeContent({
				newSize : assets.js.core.utils.AJKHelpers.viewportSize()
			});
		}
		self.selectedView.generateMinMaxStagePositionsFromVisibleDates();
		self.setupInitialDate();
		$(self.domTimelineHeader).css({
			visibility : "visible"
		});
		$(self.domMainHolder).find(".menu-item-logged-in a").click(function() {
			self.logUserOut();
			return false;
		});
		var introImage = self.timeline.introImage;
		var storyImages = (introImage) ? [ {
			src : introImage,
			type : "Image",
			caption : self.timeline.introImageCredit,
			id : "noId"
		} ] : [ {
			id : "noId",
			src : "",
			caption : "",
			type : "Image"
		} ];
		self.aboutTimelineStory = {
			isTimelineIntro : true,
			headline : self.timeline.title,
			fullText : self.timeline.aboutText,
			clippedContentIntroText : self.timeline.introText,
			images : storyImages,
			videos : [],
			audio : [],
			category : {
				colour : "ffffff"
			}
		};
		if (!self.timeline.dontDisplayIntroPanel) {
			if (!(self.timeline.homePage && isUserLoggedIn)) {
				setTimeout(function() {
					self.contentPanelController.displayForStory({
						story : self.aboutTimelineStory
					});
				}, 1);
			}
		}
		if (self.timeline.homePage && !isUserLoggedIn) {
			setTimeout(function() {
				$("#pop-down-panel-sign-up-menu-item").click();
			}, 1);
		}
		$(self.domMainHolder).find("#menu-item-about-this-timeline").click(function() {
			self.contentPanelController.displayForStory({
				story : self.aboutTimelineStory
			});
			return false;
		});
		if (self.timeline.embed != "true") {
			self.secretLoginController = new assets.js.core.controller.TLSecretLoginController({
				mainController : self,
				initialShow : (self.timeline.secret == "true" && !self.user.secretUser)
			}).init();
		}
		theAJKKeyEvent.registerAsObserver({
			observer : self
		});
		self.updateShowAuthor();
		self.initDurationTextColourStyle();
		if (self.timeline.showControls == 1) {
			self.initTimelineControls();
		}
		if (self.timeline.lazyLoadingActive) {
			self.initLazyLoading();
		}
		setTimeout(function() {
			self.initCopyable();
			self.initAds();
			$("#timelinedata-script").remove();
		}, 200);

		return self;
	},
	initialise3DValues : function() {
		var self = this;
		if (!self.timeline.settings3d) {
			self.timeline.settings3d = "0,ffffff,0.25,883,0.1125,1.25,1,3,0.25";
		}
		var varsSplit = self.timeline.settings3d.split(",");
		var obj = {};
		obj.status = (varsSplit[0]) ? parseInt(varsSplit[0], 10) : 2;
		if (TLTimelineData.imageMode || ($.browser.msie && $("body").hasClass("tl-browser-type-advanced-css-unavailable"))) {
			obj.status = 0;
		}
		obj.color = (varsSplit[1]) ? varsSplit[1] : "ffffff";
		obj.zoom = (varsSplit[2]) ? parseFloat(varsSplit[2]) : 0.25;
		obj.panelSize = (varsSplit[3]) ? parseInt(varsSplit[3], 10) : 1400;
		obj.vanishTop = (varsSplit[4]) ? parseFloat(varsSplit[4]) : 0.1125;
		obj.endToScreenRatio = (varsSplit[5]) ? parseFloat(varsSplit[5]) : 1.25;
		obj.direction = (varsSplit[6]) ? parseInt(varsSplit[6], 10) : 1;
		obj.numCols = (varsSplit[7]) ? parseInt(varsSplit[7], 10) : 5;
		obj.bgFade = (varsSplit[8]) ? parseFloat(varsSplit[8], 10) : 0.25;
		self.timeline.timeline3D = obj;
	},
	initLazyLoading : function() {
		var self = this;
		(function() {
			var thisFunc = arguments.callee;
			var counter = 0;
			var minPos = -parseInt(self.selectedView.stageLeftOffset) - 500;
			var maxPos = minPos + theTLSettings.windowSize.width + 1000;
			$.each(self.markers, function() {
				var thisMarker = this;
				if (!thisMarker.lazyImageLoaded && thisMarker.displayImage) {
					counter++;
					if (thisMarker.leftOffset > minPos && thisMarker.leftOffset < maxPos) {
						thisMarker.lazyLoadImage();
					}
				}
			});
			if (counter || (!self.initialFeedsLoaded && self.timeline.feeds.length > 0)) {
				setTimeout(function() {
					thisFunc();
				}, 250);
			}
		})();
	},
	initTimelineControls : function() {
		var self = this;
		self.userControlsController = new assets.js.launcher.TLUserControls().init();
		// TODO
		// self.userChartsController = new
		// assets.js.launcher.TLUserCharts("#tl-uc-messages").init();
		self.userChartsController = new assets.js.launcher.TLUserCharts("#tl-uc-charts").init();
	},
	getBGImageCredit : function() {
		var self = this;
		var ret = self.timeline.backgroundImageCredit;
		if (self.timelineBackgroundImage && self.timelineBackgroundImage.indexOf("flickr.com") != -1) {
			ret = (ret) ? ret + " - " : "Background Photo: ";
			ret += '<a target="_blank" href="' + assets.js.core.utils.AJKHelpers.getFKRPhotoPageFromImageSrc({
				src : self.timelineBackgroundImage
			}) + '">View on Flickr</a>';
		}
		return ret;
	},
	initDurationTextColourStyle : function() {
		var self = this;
		if (self.domDurStyles) {
			$(self.domDurStyles).remove();
		}
		self.domDurStyles = $(
				'<style id="tl-duration-story-text-style" type="text/css"> .tl-sb-duration-story .tl-sb-headline, .tl-sb-duration-story .tl-sb-date { color: #'
						+ self.timeline.durHeadlineColour + ' !important; } .tl-sb-duration-story .tl-sb-image-gallery { border-color: #' + self.timeline.durHeadlineColour
						+ ' !important; } </style>').get();
		$("head").append(self.domDurStyles);
	},
	initFontStyles : function() {
		var self = this;
		if (self.domFontStyles) {
			$(self.domFontStyles).remove();
		}
		if (self.timeline.fontBase != "default" || self.timeline.fontHead != "default" || self.timeline.fontBody != "default") {
			var ins = '<style id="tl-style-timeline-font" type="text/css"> ';
			if (self.timeline.fontBase != "default") {
				ins += '.tl-font { font-family: ' + self.timeline.fontBase + ' } ';
			}
			if (self.timeline.fontHead != "default") {
				ins += '.tl-font-head { font-family: ' + self.timeline.fontHead + ' } ';
			}
			if (self.timeline.fontBody != "default") {
				ins += '.tl-font-body { font-family: ' + self.timeline.fontBody + ' } ';
			}
			ins += '</style>';
			self.domFontStyles = $(ins).get()[0];
			$("head").append(self.domFontStyles);
		}
	},
	initLightboxStyles : function() {
		var self = this;
		if (self.timeline.lightboxStyle == 1) {
			$(self.domContentHolder).addClass("tl-lightbox-2");
		} else if (self.timeline.lightboxStyle == 2) {
			$("body").addClass("tl-lightbox-disabled");
		}
	},
	initBrowserStyles : function() {
		var self = this;
		var browserClass = "browser-type-";
		browserClass += ($.browser.mozilla) ? "firefox" : "";
		browserClass += ($.browser.opera) ? "opera" : "";
		browserClass += ($.browser.webkit) ? "webkit" : "";
		browserClass += ($.browser.isIE9) ? "ie9" : "";
		$(self.domMainHolder).addClass(browserClass);
	},
	updateShowAuthor : function() {
		var self = this;
		if (self.timeline.showGroupAuthorNames == 1) {
			$(self.domMainHolder).removeClass("tl-ch-author-hide");
		} else {
			$(self.domMainHolder).addClass("tl-ch-author-hide");
		}
	},
	customiseHeader : function() {
		var self = this;
		$(self.domTimelineHeader).css({
			backgroundColor : "#" + self.timeline.headerBackgroundColour
		});
		$(self.domTimelineTitle).css({
			color : "#" + self.timeline.headerTextColour
		});
		$(self.domTimelineHeader).find(".main-menu a").css({
			color : "#" + self.timeline.headerTextColour
		});
	},
	initLanguage : function() {
		var self = this;
		var trans = TLTranslation[self.timeline.language];
		if (trans) {
			if (!trans.userControls) {
				trans.userControls = TLTranslation["english"].userControls;
			}
			if (!trans.clickToFindOutMore) {
				trans.clickToFindOutMore = TLTranslation["english"].clickToFindOutMore;
			}
			assets.js.core.utils.AJKHelpers.dateMonthsShortArray = trans.shortMonths;
			assets.js.core.utils.AJKHelpers.dateMonthsArray = trans.months;
			assets.js.core.utils.AJKHelpers.dateDaySuffixArray = trans.daySuffixes;
			assets.js.core.utils.AJKHelpers.dateBillion = trans.billion;
			assets.js.core.utils.AJKHelpers.dateMillion = trans.million;
			assets.js.core.utils.AJKHelpers.dateAD = trans.AD;
			assets.js.core.utils.AJKHelpers.dateBC = trans.BC;
			assets.js.core.utils.AJKHelpers.dateWeekDayArray = trans.weekDays;
			assets.js.core.utils.AJKHelpers.dateWeekDayShortArray = trans.shortWeekDays;
			assets.js.core.setting.TLConfigText['contentPanel_Read_more_text'] = trans.findOutMore;
			assets.js.core.setting.TLConfigText['marker_moreButton_text'] = trans.more;
			assets.js.core.setting.TLConfigText['basic_By'] = trans.by;
			assets.js.core.setting.TLConfigText['contentPanel_Play_video'] = trans.playVideo;
			assets.js.core.setting.TLConfigText['contentPanel_Play_audio'] = trans.playAudio;
			assets.js.core.setting.TLConfigText['contentPanel_Close_video'] = trans.closeVideo;
			assets.js.core.setting.TLConfigText['contentPanel_Close_audio'] = trans.closeAudio;
			assets.js.core.setting.TLConfigText['3d_click_to_find_out_more'] = trans.clickToFindOutMore;
			$(self.domMainHolder).addClass("tl-language-" + self.timeline.language);
			if (self.timeline.embed == "true") {
				$("#menu-item-about-this-timeline").text(trans.aboutThisTimeline);
			}
			setTimeout(function() {
				self.contentPanelController.storyIndexText = trans.stories;
				$(self.contentPanelController.domReadMoreButton).text(trans.findOutMore);
				$(self.contentPanelController.domMediaSelectors[0]).find("em").text(trans.images);
				$(self.contentPanelController.domMediaSelectors[1]).find("em").text(trans.videos);
				$(self.contentPanelController.domMediaSelectors[2]).find("em").text(trans.audio);
				self.contentPanelController.defaultReadMoreButtonText = assets.js.core.setting.TLConfigText['contentPanel_Read_more_text'];
			}, 1);
			$("#tl-ch-start-timeline-button").text(trans["continue"]);
		}
	},
	refreshTimelineAfterFeedChange : function() {
		var self = this;
		self.sortMarkersList();
		if (self.markers.length > 1 && self.timeline.feeds.length > 0) {
			self.timeline.startDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
				time : self.markers[0].startDate.getTime()
			});
			self.timeline.endDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
				time : self.markers[self.markers.length - 1].startDate.getTime()
			});
			var origStartDate = assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
				dateString : TLTimelineData.startDate
			});
			var origEndDate = assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
				dateString : TLTimelineData.endDate
			});
			if (self.timeline.startDate.getTime() > origStartDate.getTime()) {
				self.timeline.startDate = origStartDate;
			}
			if (self.timeline.endDate.getTime() < origEndDate.getTime()) {
				self.timeline.endDate = origEndDate;
			}
		} else {
			self.timeline.startDate = assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
				dateString : TLTimelineData.startDate
			});
			self.timeline.endDate = assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
				dateString : TLTimelineData.endDate
			});
		}
		self.timeline.zoom = self.timeline.savedZoom;
		self.updateViewsWithNewDateRangeAndZoom({
			zoom : self.timeline.zoom,
			cancelHashUpdate : true
		});
		self.flushSize();
		if (self.adminController && !self.user.secretUser) {
			self.adminController.storyListController.resetWithNewListItems({
				listItems : self.timeline.markers
			});
			self.adminController.refreshTimelineZoomSelector();
		}
	},
	keyEventTookPlace : function(data) {
		var self = this;
		var key = data.key;
		var mode = data.mode;
		if (key == 39 && mode == "keyup") {
			self.animateToStory({
				direction : "next"
			});
		} else if (key == 37 && mode == "keyup") {
			self.animateToStory({
				direction : "previous"
			});
		}
	},
	animateToStory : function(data) {
		var self = this;
		var direction = data.direction;
		if (self.contentPanelController.panelVisible) {
			if (direction == "next" && self.contentPanelController.nextStory && self.contentPanelController.selectedStory.extraInfoLoaded) {
				if (!self.contentPanelController.lastStoryReached) {
					self.focusMarker({
						marker : self.contentPanelController.nextStory,
						cancelUpdateHash : true
					});
					self.contentPanelController.displayForStory({
						story : self.contentPanelController.nextStory
					});
				}
			} else if (direction == "previous" && self.contentPanelController.prevStory && self.contentPanelController.selectedStory.extraInfoLoaded) {
				self.focusMarker({
					marker : self.contentPanelController.prevStory,
					cancelUpdateHash : true
				});
				self.contentPanelController.displayForStory({
					story : self.contentPanelController.prevStory
				});
			}
			return false;
		}
		if (self.sliderController.dragger.beingDragged) {
			return false;
		}
		if (theTLSettings.lastSelectedStory) {
			var nextStory = self.markers[theTLSettings.lastSelectedStory.orderIndex + 1];
			var prevStory = self.markers[theTLSettings.lastSelectedStory.orderIndex - 1];
		} else {
			if (self.timeline.markerSpacing == "equal") {
				var nearestMarkerIndex = self.selectedView.getClosestMarkerIndexToDate({
					date : theTLSettings.currentDate
				});
				if (nearestMarkerIndex < 0) {
					var nextStory = self.markers[0];
					var prevStory = false;
				} else if (!self.markers[nearestMarkerIndex]) {
					var nextStory = false;
					var prevStory = self.markers[self.markers.length - 1];
				} else {
					var nextStory = self.markers[nearestMarkerIndex + 1];
					var prevStory = self.markers[nearestMarkerIndex - 1];
				}
			} else {
				var counter = 0;
				var storyFound = false;
				while (self.markers[counter] && !storyFound) {
					if (self.markers[counter].startDate.getTime() == theTLSettings.currentDate.getTime()) {
						var nextStory = self.markers[counter + 1];
						var prevStory = self.markers[counter - 1];
						storyFound = true;
					} else if (self.markers[counter].startDate.getTime() > theTLSettings.currentDate.getTime()) {
						var nextStory = self.markers[counter];
						var prevStory = self.markers[counter - 1];
						storyFound = true;
					} else {
						counter++;
					}
				}
			}
		}
		if (direction == "next" && nextStory) {
			self.focusMarker({
				marker : nextStory
			});
			self.lastKeyboardSelectedStory = nextStory;
		} else if (direction == "previous" && prevStory) {
			self.focusMarker({
				marker : prevStory
			});
			self.lastKeyboardSelectedStory = prevStory;
		}
	},
	setupInitialDate : function(data) {
		var self = this;
		var initialStartTime = "";
		var initialStartMarker = "";
		var numMarkers = self.markers.length;
		var ignoreHash = (data && data.ignoreHash);
		if (self.timeline.initialFocus == "today") {
			initialStartTime = new Date();
		} else if (numMarkers > 0) {
			if (self.timeline.initialFocus == "first") {
				initialStartMarker = self.markers[0];
				initialStartTime = self.markers[0].startDate.getTime();
			} else if (self.timeline.initialFocus == "last") {
				initialStartMarker = self.markers[numMarkers - 1];
				initialStartTime = self.markers[numMarkers - 1].startDate.getTime();
			} else {
				var focusMarker = self.markersById[self.markerKeyText + self.timeline.initialFocus];
				initialStartMarker = (focusMarker) ? focusMarker : self.markers[0];
				initialStartTime = (focusMarker) ? focusMarker.startDate.getTime() : self.markers[0].startDate.getTime();
				if (!focusMarker) {
					self.timeline.initialFocus = "first";
				}
			}
		} else {
			initialStartTime = self.originalStartDate.getTime();
		}
		var hashDate = theTLHashController.getHashDate({
			hash : window.location.hash
		});
		var hashStoryId = theTLHashController.getHashPanel({
			hash : window.location.hash
		});
		if (hashStoryId) {
			setTimeout(function() {
				self.displayPanelForStoryId({
					id : hashStoryId,
					instantly : true
				});
				theTLHashController.setHashToStoryPanel({
					storyId : hashStoryId
				});
			}, 10);
		} else if (hashDate && !ignoreHash) {
			theTLSettings.setCurrentDate({
				date : theTLSettings.limitDateToRange({
					aDate : hashDate
				})
			});
		} else if (initialStartMarker) {
			self.focusMarker({
				marker : initialStartMarker,
				instantly : true
			});
		} else {
			var aDate = assets.js.core.utils.AJKHelpers.getEmptyDate();
			aDate.setTime(initialStartTime);
			if (self.timeline.markerSpacing == "equal" && self.markers.length > 0) {
				var nearestMarker = self.selectedView.getClosestMarkerIndexToRealDate({
					date : aDate
				});
				self.focusMarker({
					marker : nearestMarker,
					instantly : true
				});
			} else {
				aDate = theTLSettings.limitDateToRange({
					aDate : aDate
				});
				theTLSettings.setCurrentDate({
					date : aDate
				});
			}
		}
	},
	displayPanelForStoryId : function(data) {
		var self = this;
		var story = self.markersById[self.markerKeyText + data.id];
		if (story) {
			story.focus();
			self.focusMarker({
				marker : story,
				instantly : data.instantly,
				cancelUpdateHash : true
			});
			self.contentPanelController.displayForStory({
				story : story,
				instantly : data.instantly
			});
		}
	},
	initialiseView : function(data) {
		var self = this;
		self.originalStartDate = self.timeline.startDate;
		self.originalEndDate = self.timeline.endDate;
		var minDate = self.originalStartDate.getTime();
		var maxDate = self.originalEndDate.getTime();
		if (!self.timeline.zoom || !assets.js.core.controller.TLViewController.isASuitableScaleForDateRange({
			scaleName : self.timeline.zoom,
			startDate : self.originalStartDate,
			endDate : self.originalEndDate
		})) {
			var bestScale = assets.js.core.controller.TLViewController.getBestZoomForDateRange({
				startDate : self.originalStartDate,
				endDate : self.originalEndDate
			});
			self.timeline.zoom = bestScale.name;
		}
		var adjustTime = 400 / assets.js.core.controller.TLViewController.viewScaleSettings[self.timeline.zoom].getStageWidthRatio();
		var edgePadding = 0.05;
		var diff = maxDate - minDate;
		self.startDate = assets.js.core.utils.AJKHelpers.getEmptyDate();
		self.startDate.setTime(minDate - (diff * edgePadding) - adjustTime);
		self.endDate = assets.js.core.utils.AJKHelpers.getEmptyDate();
		self.endDate.setTime(maxDate + (diff * edgePadding) + adjustTime);
		self.initialiseTimeInfo();
		self.selectedView = new assets.js.core.controller.TLViewController({
			items : self.markers,
			domEl : $(self.domStageHolder).find(".tl-stage").get()[0],
			startDate : self.startDate,
			endDate : self.endDate,
			originalStartDate : self.originalStartDate,
			originalEndDate : self.originalEndDate,
			scaleColour : self.timeline.mainColour,
			zoom : self.timeline.zoom,
			domDateDisplayer : self.domDateDisplayer,
			timeline : self.timeline
		});
		self.selectedView.init();
	},
	initialise3DView : function() {
		var self = this;
		self.selected3DView = new assets.js.core.controller.TL3DViewController({
			items : self.markers,
			timelineStartDate : self.startDate,
			timelineEndDate : self.endDate,
			controller : self,
			standardViewController : self.selectedView
		}).init();
		if (self.timeline.timeline3D.status == 2) {
			self.selected3DView.launch();
		}
	},
	initialiseSlider : function() {
		var self = this;
		self.sliderController = new assets.js.core.controller.TLSliderController({
			items : self.markers,
			startDate : self.startDate,
			endDate : self.endDate,
			timeline : self.timeline,
			getStageWidth : function() {
				return self.selectedView.width;
			}
		}).init();
	},
	updateViewsWithNewDateRangeAndZoom : function(data) {
		var self = this;
		var zoom = data.zoom;
		var cancelHashUpdate = data.cancelHashUpdate;
		if (zoom) {
			self.timeline.zoom = zoom;
		}
		if (self.timeline.markerSpacing == "equal") {
			$.each(self.markers, function() {
				this.initialHorizAdjustment = 0;
				this.horizAdjustment = 0;
				this.numCloseMarkers = 0;
				this.sizeClass = "";
				this.vSize = "normal";
			});
		}
		self.selectedView.destroy();
		self.initialiseView();
		if (self.timeline.markerSpacing != "equal") {
			self.selectedView.refreshDisplayMarkers();
		}
		self.selectedView.generateMinMaxStagePositionsFromVisibleDates();
		self.updateSlider();
		self.selected3DView.updateAssociations();
		self.selected3DView.generateEqualSpacingFakeDates();
		self.selected3DView.updateStoryColPositions();
		theTLSettings.setCurrentDate({
			date : theTLSettings.currentDate,
			extraInfo : {
				updateHash : !cancelHashUpdate
			}
		});
		self.updateMarkersImageSize();
		if (self.timeline.viewType == "category-band") {
			self.flushSize();
		}
	},
	updateSlider : function() {
		var self = this;
		self.sliderController.destroy();
		self.initialiseSlider();
	},
	hideContentPanelIfVisible : function() {
		var self = this;
		if (self.contentPanelController.panelVisible) {
			self.contentPanelController.hide();
		}
	},
	initialiseBackgroundImage : function() {
		var self = this;
		self.backgroundImageHasLoaded = false;
		if (self.domTimelineBackgroundImage) {
			$(self.domTimelineBackgroundImage).remove();
		}
		var bgImageSrc = (self.timelineBackgroundImage) ? self.timelineBackgroundImage : "assets/ui/empty-image.gif";
		bgImageSrc = assets.js.core.utils.AJKHelpers.getTimelineImageUrl({
			src : bgImageSrc,
			emptyImage : "assets/ui/empty-image.gif"
		});
		self.domTimelineBackgroundImage = $('<img src="' + bgImageSrc + '" alt="" id="tl-stage-image" />').get()[0];
		new assets.js.core.component.AJKImageLoader({
			imageUrl : bgImageSrc,
			loadCallback : function(data) {
				var theImage = data.theImage;
				$(self.domStageHolder).prepend(self.domTimelineBackgroundImage);
				self.backgroundImageHasLoaded = true;
				self.flushSize();
			}
		}).init();
		if (!self.timelineBackgroundImage) {
			self.flushSize();
		}
	},
	repositionBackgroundImage : function(data) {
		var self = this;
		var repositionOnly = (data) ? data.repositionOnly : false;
		if (self.backgroundImageHasLoaded && self.timeline.bgStyle == 1 && self.viewContentSize) {
			var selectedView = (self.selected3DView.active) ? self.selected3DView : self.selectedView;
			var fraction = selectedView.getFractionAlongTimeline();
			self.updateBackgroundImageSize({
				width : self.viewContentSize.width,
				height : self.viewContentSize.height,
				imageOffset : {
					y : 0,
					x : fraction
				}
			});
		} else if (!repositionOnly) {
			self.updateBackgroundImageSize(data);
		}
	},
	updateBackgroundImageSize : function(data) {
		var self = this;
		var width = data.width;
		var height = data.height;
		var imageOffset = data.imageOffset;
		var scaledUp = data.scaledUp;
		assets.js.core.utils.AJKHelpers.sizeImageToFitInBoxOfSize({
			domImage : self.domTimelineBackgroundImage,
			boxSize : {
				width : width,
				height : height
			},
			imageOffset : imageOffset,
			scaledUp : self.timeline.bgScale
		});
	},
	initialiseCategories : function() {
		var self = this;
		var counter = 0;
		$.each(self.timeline.categories, function() {
			self.initialiseCategory({
				category : this
			});
		});
	},
	initialiseCategory : function(data) {
		var self = this;
		var category = data.category;
		category.title = assets.js.core.utils.AJKHelpers.removeScript({
			content : category.title
		});
		category.viewType = (category.layout == 1) ? "duration" : "standard";
		category.key = self.categoriesKeyPrefix + category.id;
		self.timeline.categoriesByKey[category.key] = category;
		if (!category.colour) {
			category.colour = (self.timeline.mainColour) ? self.timeline.mainColour : "aaaaaa";
		}
	},
	sortCategories : function() {
		var self = this;
		self.timeline.categories.sort(function(a, b) {
			if (a.autoGenerated) {
				return 1;
			} else if (b.autoGenerated) {
				return -1;
			}
			if (parseInt(a.order, 10) == parseInt(b.order, 10)) {
				return (a.title < b.title) ? -1 : 1;
			} else {
				return (parseInt(a.order, 10) < parseInt(b.order, 10)) ? -1 : 1;
			}
		});
	},
	getNextStory : function(data) {
		var self = this;
		var story = data.story;
		var counter = 0;
		while (self.activeMarkers[counter++] != story && counter < (self.activeMarkers.length + 1)) {
		}
		return (self.activeMarkers[counter]);
	},
	getPrevStory : function(data) {
		var self = this;
		var story = data.story;
		var counter = 0;
		while (self.activeMarkers[counter++] != story && counter < (self.activeMarkers.length + 1)) {
		}
		var orderIndex = counter - 1;
		return ((orderIndex - 1) >= 0) ? self.activeMarkers[orderIndex - 1] : false;
	},
	getNumStories : function(data) {
		var self = this;
		return self.activeMarkers.length;
	},
	initialisePopDownPanels : function() {
		var self = this;
		self.loginPanelController = new assets.js.core.controller.TLLoginPanelController({
			domRootEl : $("#ajk-pop-down-panel-login").get()[0],
			buttonPopupId : "ajk-pop-down-panel-login",
			controller : self
		}).init();
		new assets.js.core.controller.TLSignupPanelController({
			domRootEl : $("#ajk-pop-down-panel-sign-up").get()[0],
			buttonPopupId : "ajk-pop-down-panel-sign-up",
			controller : self
		}).init();
	},
	initialiseTimeInfo : function() {
		var self = this;
		theTLSettings.timeInfo.start = self.startDate;
		theTLSettings.timeInfo.end = self.endDate;
		theTLSettings.timeInfo.msecs = self.endDate.getTime() - self.startDate.getTime();
		theTLSettings.timeInfo.secs = theTLSettings.timeInfo.msecs / 1000;
		theTLSettings.timeInfo.mins = theTLSettings.timeInfo.secs / 60;
		theTLSettings.timeInfo.hours = theTLSettings.timeInfo.mins / 60;
		theTLSettings.timeInfo.days = theTLSettings.timeInfo.hours / 24;
		theTLSettings.timeInfo.months = theTLSettings.timeInfo.days / 30.41;
		theTLSettings.timeInfo.years = theTLSettings.timeInfo.msecs / assets.js.core.utils.AJKHelpers.dateOneYearInMS;
		theTLSettings.timeInfo.decades = theTLSettings.timeInfo.years / 10;
		var markerDateFormat = "";
		if (theTLSettings.timeInfo.years > 1000) {
			markerDateFormat = "YYYY";
		} else if (theTLSettings.timeInfo.years > 100) {
			markerDateFormat = "MMMM YYYY";
		} else if (theTLSettings.timeInfo.days > 50) {
			markerDateFormat = "ddnn MMMM YYYY";
		} else {
			markerDateFormat = "ddnn MMMM YYYY HH:mm";
		}
		theTLSettings.timeInfo.markerDisplayDateFormat = markerDateFormat;
	},
	flushSize : function() {
		var self = this;
		self.windowDidResize({
			newSize : {
				width : theTLSettings.windowSize.width,
				height : theTLSettings.windowSize.height
			}
		});
	},
	windowDidResize : function(dataObj) {
		var self = this;
		var newSize = dataObj.newSize;
		self.resizeContent({
			newSize : newSize
		});
	},
	resizeContent : function(data) {
		var self = this;
		var newSize = {
			width : data.newSize.width,
			height : data.newSize.height
		};
		newSize.height = newSize.height - self.domAdBlockHeight;
		newSize.height = (newSize.height < 100) ? 100 : newSize.height;
		var extraHeight = 0;
		if (newSize.height < self.minimumLayoutHeight && !self.isHomePage) {
			$(self.domMainHolder).addClass("tl-container-minimum-layout");
			extraHeight += 35;
			extraHeight += 12;
			self.minimumLayout = true;
		} else {
			$(self.domMainHolder).removeClass("tl-container-minimum-layout");
			self.minimumLayout = false;
			extraHeight = (self.timeline.showTitleBlock || self.timeline.embed == "false") ? extraHeight : extraHeight + 35;
		}
		if (TLTimelineData.imageMode) {
			extraHeight = 0;
		}
		if (newSize.height < self.minimumLayoutHeight2 && !self.isHomePage) {
			$(self.domMainHolder).addClass("tl-container-minimum-layout-2");
		} else {
			$(self.domMainHolder).removeClass("tl-container-minimum-layout-2");
		}

		// TODO
		$(self.domStageHolder).css({
			height : newSize.height - 100 + extraHeight - ($('#tl-filter').height() + 8)
		});

		self.updatePageSizeClass({
			height : newSize.height + extraHeight
		});
		if (!self.viewContentSize) {
			self.viewContentSize = {};
		}
		self.viewContentSize.width = newSize.width;
		self.viewContentSize.height = newSize.height - 100 + extraHeight;
		self.repositionBackgroundImage({
			width : self.viewContentSize.width,
			height : self.viewContentSize.height
		});
		if (self.selected3DView.active) {
			self.selected3DView.resizeContent({
				newSize : {
					width : self.viewContentSize.width,
					height : self.viewContentSize.height
				}
			});
		}
	},
	getNumCategories : function() {
		var self = this;
		return (self.selectedView) ? self.selectedView.categoryBands.length : self.timeline.categories.length;
	},
	updatePageSizeClass : function(data) {
		var self = this;
		var pageheight = data.height;
		var forceImageResize = false;
		if (self.timeline.viewType == "category-band") {
			var pageSize = "category-mode";
			$.each(self.timeline.categories, function() {
				if (!this.hide) {
					var catHeight = this.percentHeight * pageheight / 100;
					var catSize = "category-normal";
					if (self.timeline.markerSpacing == "top-to-bottom") {
						catSize = "category-normal";
					} else if (catHeight > 500) {
						catSize = "category-huge";
					} else if (catHeight > 350) {
						catSize = "category-very-large";
					} else if (catHeight > 240) {
						catSize = "category-large";
					}
					var catClass = "tl-page-size-" + catSize + "-height";
					if (catSize == "category-huge") {
						catClass += " tl-page-size-category-very-large-height";
					}
					if (self.selectedView && self.selectedView.categoryBandsByKey[this.key]) {
						$(self.selectedView.categoryBandsByKey[this.key].domRoot).removeClass(this.bandClass).addClass(catClass);
					}
					if (catClass != this.bandClass) {
						forceImageResize = true;
					}
					this.bandClass = catClass;
					this.bandSize = catSize;
				}
			});
		} else {
			var pageSize = "normal";
			if (pageheight < 480) {
				pageSize = "very-low";
			} else if (pageheight < 560 || (self.timeline.markerSpacing == "top-to-bottom" && self.timeline.viewType != "duration")) {
				pageSize = "low";
			} else if (pageheight < 600) {
				pageSize = "medium";
			}
		}
		var newPageClass = "tl-page-size-" + pageSize + "-height";
		if (pageSize == "very-low") {
			newPageClass = "tl-page-size-very-low-height tl-page-size-low-height";
		}
		if (!self.timeline.storyImageAutoCrop && (pageSize == "normal" || pageSize == "category-very-large")) {
			$(self.domMainHolder).removeClass(self.autoCropOffClass).addClass(self.autoCropOffClass);
		} else if (!self.timeline.storyImageAutoCrop) {
			$(self.domMainHolder).removeClass(self.autoCropOffClass);
		}
		if (self.pageSizeClass != newPageClass || forceImageResize) {
			$(self.domStageHolder).removeClass(self.pageSizeClass);
			$(self.domStageHolder).addClass(newPageClass);
			self.pageSizeClass = newPageClass;
			self.updateMarkersImageSize();
		}
	},
	updateMarkersImageSize : function() {
		var self = this;
		if ($.browser.msie || $.browser.opera) {
			setTimeout(function() {
				$.each(self.markers, function() {
					this.positionDisplayImageInContainer();
				});
			}, 1);
		} else {
			$.each(self.markers, function() {
				this.positionDisplayImageInContainer();
			});
		}
	},
	logUserOut : function() {
		var self = this;
		self.deleteUserCookies();
		window.location.reload(true);
	},
	deleteUserCookies : function() {
		var self = this;
		if (self.user.secretUser) {
			assets.js.core.utils.AJKHelpers.deleteCookie({
				name : self.secretUserCookieName
			});
		} else {
			assets.js.core.utils.AJKHelpers.deleteCookie({
				name : self.userCookieName
			});
			assets.js.core.utils.AJKHelpers.deleteCookie({
				name : self.secretUserCookieName
			});
		}
	},
	logUserIn : function(data) {
		var self = this;
		self.deleteUserCookies();
		self.user.loggedIn = true;
		self.user.id = data.userId;
		self.user.username = data.username;
		self.user.verifyCode = data.verifyCode;
		self.saveUserCookie();
		window.location = "/account/";
	},
	logSecretUserIn : function(data) {
		var self = this;
		self.user.secretUser = true;
		self.deleteUserCookies();
		self.user.loggedIn = true;
		self.user.id = data.userId;
		self.user.username = data.username;
		self.user.verifyCode = data.verifyCode;
		self.saveUserCookie({
			expires : "now",
			cookieName : self.secretUserCookieName
		});
		window.location.reload();
	},
	saveUserCookie : function(data) {
		var self = this;
		var cookieName = (data && data.cookieName) ? data.cookieName : self.userCookieName;
		var expires = (data && data.expires) ? data.expires : 30;
		expires = (data && data.expires && data.expires == "now") ? 0 : expires;
		var cookieString = self.user.id + self.cookieSeparator;
		cookieString += self.user.username + self.cookieSeparator;
		cookieString += self.user.verifyCode + self.cookieSeparator;
		assets.js.core.utils.AJKHelpers.setCookie({
			name : cookieName,
			value : cookieString,
			expires : expires
		});
	},
	loadUserCookie : function(data) {
		var self = this;
		var cookieName = (data && data.cookieName) ? data.cookieName : self.userCookieName;
		var cookieData = assets.js.core.utils.AJKHelpers.getCookie({
			name : cookieName
		});
		if (cookieData) {
			cookieDataSplit = cookieData.split(self.cookieSeparator);
			self.user.id = cookieDataSplit[0];
			self.user.username = cookieDataSplit[1];
			self.user.verifyCode = cookieDataSplit[2];
			self.user.loggedIn = true;
			return true;
		}
	},
	loadTimeline : function(data) {
		var self = this;
		var timeline = data.timeline;
		window.location = "/timeline/entry/" + timeline.id + "/" + timeline.urlFriendlyTitle + "/";
	},
	focusMarker : function(data) {
		var self = this;
		var marker = data.marker;
		var instantly = data.instantly;
		var updateHash = !data.cancelUpdateHash;
		var aDate = "";
		theTLSettings.lastSelectedStory = marker;
		if (self.timeline.markerSpacing == "equal") {
			aDate = self.selectedView.getDateFromLeftOffset({
				leftOffset : marker.leftOffset
			});
		} else {
			aDate = marker.startDate;
		}
		aDate = theTLSettings.limitDateToRange({
			aDate : aDate
		});
		theTLSettings.setCurrentDate({
			date : aDate,
			instantly : instantly,
			animate : true,
			extraInfo : {
				updateHash : false
			},
			callback : function() {
				if (updateHash) {
					theTLHashController.setHashToCurrentDate();
				}
			}
		});
	},
	createMarker : function(data) {
		var self = this;
		var markerKey = self.markerKeyText + self.markerKeyInc;
		var markerIdKey = self.markerKeyText + data.id;
		var category = (data.category) ? data.category : "";
		var fullText = data.fullText;
		var dateFormat = (data.dateFormat) ? data.dateFormat : "auto";
		category = (category) ? category : self.defaultCategory;
		if (category.autoGenerated && !self.timeline.categoriesByKey[category.key]) {
			self.timeline.categories.push(category);
			self.timeline.categoriesByKey[category.key] = category;
		}
		var aMarker = new assets.js.core.component.TLMarker({
			id : data.id,
			ownerId : data.ownerId,
			ownerName : data.ownerName,
			startDate : data.startDate,
			endDate : data.endDate,
			category : category,
			markerKey : markerKey,
			headline : data.headline,
			introText : (data.introText) ? data.introText : "",
			media : data.media,
			mainController : self,
			externalLink : data.externalLink,
			fullText : fullText,
			dateFormat : dateFormat
		}).init();
		self.markers.push(aMarker);
		self.markersByKey[markerKey] = aMarker;
		self.markersById[markerIdKey] = aMarker;
		self.markerKeyInc++;
		return aMarker;
	},
	filterMarkersByActiveCategories : function() {
		var self = this;
		self.activeMarkers = [];
		var inactiveMarkers = [];
		$.each(self.markers, function() {
			if (!this.category || self.timeline.categoriesByKey[self.categoriesKeyPrefix + this.category.id].hide) {
				inactiveMarkers.push(this);
			} else {
				self.activeMarkers.push(this);
			}
		});
		if (self.timeline.viewType == "category-band") {
			self.updateViewsWithNewDateRangeAndZoom({
				zoom : self.timeline.zoom
			});
			self.flushSize();
		} else if (self.timeline.markerSpacing != "equal") {
			self.selectedView.items = self.activeMarkers;
			self.selectedView.refreshMarkersAfterFilterChange();
		}
		$.each(inactiveMarkers, function() {
			this.makeInvisible();
		});
		$.each(self.activeMarkers, function() {
			this.makeVisible();
		});
	},
	addNewCategory : function(data) {
		var self = this;
		var category = data.category;
		self.timeline.categories.push(category);
		self.initialiseCategory({
			category : category
		});
		self.sortCategories();
	},
	sortMarkersList : function() {
		var self = this;
		self.markers.sort(function(a, b) {
			return (a.startDate.getTime() > b.startDate.getTime()) ? 1 : -1;
		});
		var counter = 0;
		$.each(self.markers, function() {
			this.orderIndex = counter++;
		});
		if (self.timeline.viewType == "category-band") {
			self.sortMarkersByCategoryList();
		}
	},
	sortMarkersByCategoryList : function() {
		var self = this;
		self.markersByCategory = [];
		$.each(self.timeline.categories, function() {
			if (!self.markersByCategory[this.key]) {
				self.markersByCategory[this.key] = {
					numItems : 0,
					markers : []
				};
			}
		});
		$.each(self.markers, function() {
			var thisMarker = this;
			if (!self.markersByCategory[thisMarker.category.key]) {
				self.markersByCategory[thisMarker.category.key] = {
					numItems : 0,
					markers : []
				};
			}
			self.markersByCategory[thisMarker.category.key].markers.push(thisMarker);
			thisMarker.categoryIndex = self.markersByCategory[thisMarker.category.key].numItems;
			thisMarker.categoryIndex = self.markersByCategory[thisMarker.category.key].numItems++;
		});
	},
	initAds : function() {
		var self = this;
		var ad2Class = (Math.floor(Math.random() * 2)) ? "tl-advb-peopleplotr" : "tl-advb-tiki-toki-desktop";
		$("#tl-advert-block .tl-advb-ad2").addClass(ad2Class);
		$("#tl-advert-block .tl-advb-ad").click(function() {
			if ($(this).hasClass("tl-advb-peopleplotr")) {
				window.location = "http://www.peopleplotr.com";
			} else if ($(this).hasClass("tl-advb-tiki-toki-desktop")) {
				window.location = "/desktopapp/";
			} else if ($(this).hasClass("tl-advb-ganttology")) {
				window.location = "https://www.ganttology.com";
			}
		});
	},
	initCopyable : function() {
		var self = this;
		self.domCopyButton = $("#tl-copy-timeline-button").get()[0];
		self.domCopyText = $(self.domCopyButton).find("span").get();
		if (self.timeline.embed == "true") {
			self.loadUserCookie();
		}
		self.updateCopyButton();
		$(self.domCopyButton).click(function() {
			var cookieString = self.user.id + self.cookieSeparator;
			cookieString += self.user.username + self.cookieSeparator;
			cookieString += self.user.verifyCode + self.cookieSeparator;
			cookieString += self.timeline.id;
			assets.js.core.utils.AJKHelpers.setCookie({
				name : "TLCOPYTLCOOKIE",
				value : cookieString,
				expires : 0
			});
		});
	},
	updateCopyButton : function() {
		var self = this;
		if (self.timeline.copyable == 1) {
			if (self.user.loggedIn) {
				$(self.domCopyText[0]).css({
					display : "inline-block"
				});
				$(self.domCopyText[1]).css({
					display : "none"
				});
			} else {
				$(self.domCopyText[0]).css({
					display : "none"
				});
				$(self.domCopyText[1]).css({
					display : "inline-block"
				});
			}
			$(self.domCopyButton).css({
				display : "inline-block"
			});
		} else {
			$(self.domCopyButton).css({
				display : "none"
			});
		}
	}
});