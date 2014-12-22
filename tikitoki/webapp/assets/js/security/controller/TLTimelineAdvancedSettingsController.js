Class.forName({
	name : "class assets.js.security.controller.TLTimelineAdvancedSettingsController extends Object",
	TLTimelineAdvancedSettingsController : function(data) {
		var self = this;
		self.domRoot = "";
		self.controller = data.controller;
		self.mainController = self.controller.mainController;
		self.timeline = self.mainController.timeline;
		self.verifier = "";
		self.lightbox = "";
		self.contentScroller = "";
		self.dateFieldFormatters = [];
	},
	init : function() {
		var self = this;
		$("#tl-ah-timeline-advanced-settings").click(function() {
			if (!self.lightbox) {
				self.domRoot = $("#tl-ah-advanced-settings-form-content .ajk-verifier").get()[0];
				self.lightbox = new TLAdminLightbox({
					domClass : "tl-ah-timeline-advanced-settings tl-ah-advanced-settings",
					title : TLConfigText["advancedSettings_title"],
					intro : TLConfigText["advancedSettings_intro"],
					domContent : self.domRoot
				}).init();
				self.setupVerification();
				$(self.domRoot).find(".tl-ah-field-date-formatter").each(function() {
					var fieldController = new TLDateFormatterField({
						domRoot : this,
						verifier : self.verifier
					}).init();
					self.dateFieldFormatters.push(fieldController);
				});
				$(self.domRoot).find(".ajk-verifier-revert").click(function() {
					$.each(self.dateFieldFormatters, function() {
						this.updateFromFieldValue();
					});
				});
				self.contentScroller = new AJKContentScrollerController({
					domRootEl : $(self.domRoot).find(".ajk-cs-carousel").get()[0],
					maxHeight : 300
				}).init();
				var domHelpDisplayer = $(self.domRoot).find(".tl-asp-help-text").get()[0];
				$(self.domRoot).find(".tl-ahh-help-item").each(function() {
					var thisDomHelp = $(this).find(".tl-ahh-data-content").get()[0];
					$(thisDomHelp).remove().removeClass("tl-ahh-data-content").removeClass("tl-ahh-data").find("h3").css({
						display : "none"
					});
					if (thisDomHelp) {
						$(this).mouseenter(function() {
							$(domHelpDisplayer).empty().append(thisDomHelp);
						}).mouseleave(function() {
							$(thisDomHelp).remove();
						});
					}
				});
			}
			self.setFieldValues();
			self.updatePrivacyPasswordField({
				fieldValue : self.timeline.public
			});
			self.lightbox.openPanel();
			self.contentScroller.enable();
			return false;
		});
		return self;
	},
	setupVerification : function() {
		var self = this;
		self.verifier = new AJKVerifier({
			domRootEl : self.domRoot,
			cancelFunc : function() {
			},
			revertFunc : function() {
				self.verifier.restoreSavedFieldValues();
			},
			submitFunc : function(data) {
				var vars = data.fieldData;
				vars["timelineId"] = self.controller.timeline.id;
				var action = "/admin/updateadvancedtimelinesettings/";
				self.verifier.saveFieldValues();
				self.verifier.disableSaveAndRevert();
				var refreshNeeded = false;
				if (vars.altFlickrImageUrl != self.timeline.altFlickrImageUrl) {
					self.timeline.altFlickrImageUrl = vars.altFlickrImageUrl;
					refreshNeeded = true;
				}
				if (vars.dontDisplayIntroPanel != self.timeline.dontDisplayIntroPanel) {
					self.timeline.dontDisplayIntroPanel = vars.dontDisplayIntroPanel;
				}
				if (vars.urlHashing != self.timeline.urlHashing) {
					self.timeline.urlHashing = vars.urlHashing;
				}
				if (vars.storyDateStatus != self.controller.timeline.storyDateStatus) {
					self.controller.timeline.storyDateStatus = vars.storyDateStatus;
					$.each(self.controller.timeline.markers, function() {
						this.updateDateStatus();
					});
					self.controller.updateContentPanel({
						story : self.mainController.aboutTimelineStory
					});
				}
				if (vars.durHeadlineColour != self.controller.timeline.durHeadlineColour) {
					self.controller.timeline.durHeadlineColour = vars.durHeadlineColour;
					self.mainController.initDurationTextColourStyle();
				}
				if (vars.introImageCredit != self.controller.timeline.introImageCredit) {
					self.controller.updateTimelineFormVerification.setFieldValues({
						fieldValues : {
							"introImageCredit" : vars.introImageCredit,
							forceChangeEvent : true
						}
					});
					self.controller.updateTimelineFormVerification.savedFieldValues["introImageCredit"] = vars.introImageCredit;
					self.mainController.aboutTimelineStory.images[0].caption = vars.introImageCredit;
					self.controller.updateContentPanel({
						story : self.mainController.aboutTimelineStory
					});
				}
				if (vars.language != self.controller.timeline.language) {
					self.mainController.setLanguage({
						language : vars.language
					});
					self.mainController.updateViewsWithNewDateRangeAndZoom({
						zoom : self.timeline.zoom
					});
					self.mainController.flushSize();
					$.each(self.timeline.markers, function() {
						this.updateDisplayDates();
						$(this.domRoot).find(".tl-sb-more-button").text(TLConfigText['marker_moreButton_text']);
					});
					setTimeout(function() {
						self.controller.updateContentPanel({
							story : self.mainController.contentPanelController.selectedStory
						});
						if (self.mainController.userControlsController) {
							self.mainController.userControlsController.langDidChange();
						}
					}, 10);
				}
				if (vars.headerBackgroundColour != self.controller.timeline.headerBackgroundColour || vars.headerTextColour != self.controller.timeline.headerTextColour) {
					self.controller.timeline.headerBackgroundColour = vars.headerBackgroundColour;
					self.controller.timeline.headerTextColour = vars.headerTextColour;
					self.mainController.customiseHeader();
				}
				if (vars.sliderBackgroundColour != self.controller.timeline.sliderBackgroundColour || vars.sliderTextColour != self.controller.timeline.sliderTextColour
						|| vars.sliderDetailsColour != self.controller.timeline.sliderDetailsColour || vars.sliderDraggerColour != self.controller.timeline.sliderDraggerColour) {
					self.controller.timeline.sliderBackgroundColour = vars.sliderBackgroundColour;
					self.controller.timeline.sliderTextColour = vars.sliderTextColour;
					self.controller.timeline.sliderDetailsColour = vars.sliderDetailsColour;
					self.controller.timeline.sliderDraggerColour = vars.sliderDraggerColour;
					self.mainController.updateSlider();
				}
				if (vars.htmlFormatting != self.controller.timeline.htmlFormatting) {
					self.controller.timeline.htmlFormatting = parseInt(vars.htmlFormatting);
				}
				if (vars.expander != self.controller.timeline.expander) {
					self.controller.timeline.expander = vars.expander;
				}
				if (vars.displayStripes != self.controller.timeline.displayStripes) {
					self.controller.timeline.displayStripes = vars.displayStripes;
					if (vars.displayStripes == 1) {
						$(self.mainController.domMainHolder).removeClass(self.mainController.hideStripesClass);
					} else {
						$(self.mainController.domMainHolder).addClass(self.mainController.hideStripesClass);
					}
				}
				if (vars.openReadMoreLinks != self.timeline.openReadMoreLinks) {
					self.timeline.openReadMoreLinks = vars.openReadMoreLinks;
					self.controller.updateContentPanel({
						story : self.mainController.contentPanelController.selectedStory
					});
				}
				if (vars.showGroupAuthorNames != self.timeline.showGroupAuthorNames) {
					self.timeline.showGroupAuthorNames = vars.showGroupAuthorNames;
					self.mainController.updateShowAuthor();
				}
				if (vars.showControls != self.timeline.showControls) {
					self.timeline.showControls = vars.showControls;
					if (vars.showControls == 1) {
						if (!self.mainController.userControlsController) {
							self.mainController.initTimelineControls();
						}
						self.mainController.userControlsController.showButton();
						if (!self.userControlsExtended) {
							self.userControlsExtended = new TLUserControlsExtender({
								userControlsController : self.mainController.userControlsController,
								controller : self
							}).init();
						}
					} else {
						self.mainController.userControlsController.hideButton();
					}
				}
				if (vars.secretWord) {
					self.mainController.secretLoginController.show();
				} else {
					self.mainController.secretLoginController.hide();
				}
				self.controller.timeline.secretWord = vars.secretWord;
				if (self.controller.timeline.public != vars.public) {
					self.controller.timeline.public = vars.public;
					self.updatePrivacyPasswordField({
						fieldValue : self.timeline.public
					});
				}
				if (vars.backgroundImageCredit != self.controller.timeline.backgroundImageCredit) {
					self.controller.updateTimelineFormVerification.setFieldValues({
						fieldValues : {
							"backgroundImageCredit" : vars.backgroundImageCredit,
							forceChangeEvent : true
						}
					});
					self.controller.updateTimelineFormVerification.savedFieldValues["backgroundImageCredit"] = vars.backgroundImageCredit;
					$(self.mainController.domMainPhotoCredit).html(vars.backgroundImageCredit);
				}
				if (vars.copyable != self.timeline.copyable) {
					self.timeline.copyable = vars.copyable;
					self.mainController.updateCopyButton();
				}
				if (vars.storyDateFormat != self.controller.timeline.storyDateFormat) {
					self.controller.timeline.storyDateFormat = vars.storyDateFormat;
					$.each(self.controller.timeline.markers, function() {
						this.updateDisplayDates();
					});
				}
				if (vars.topDateFormat != self.controller.timeline.topDateFormat) {
					self.controller.timeline.topDateFormat = vars.topDateFormat;
					self.mainController.selectedView.updateDisplayDate({
						date : theTLSettings.currentDate
					});
				}
				if (vars.sliderDateFormat != self.controller.timeline.sliderDateFormat) {
					self.controller.timeline.sliderDateFormat = vars.sliderDateFormat;
					self.controller.refreshTimelineView();
				}
				if (vars.lightboxStyle != self.controller.timeline.lightboxStyle) {
					self.controller.timeline.lightboxStyle = vars.lightboxStyle;
					$(self.mainController.domContentHolder).removeClass("tl-lightbox-2");
					$("body").removeClass("tl-lightbox-disabled");
					self.mainController.initLightboxStyles();
					self.controller.updateContentPanel({
						story : self.mainController.contentPanelController.selectedStory
					});
				}
				if (vars.fontBase != self.timeline.fontBase || vars.fontHead != self.timeline.fontHead || vars.fontBody != self.timeline.fontBody) {
					self.timeline.fontBase = vars.fontBase;
					self.timeline.fontBody = vars.fontBody;
					self.timeline.fontHead = vars.fontHead;
					self.mainController.initFontStyles();
					self.mainController.selected3DView.clearStories3DText();
				}
				vars.bgScale = parseInt(100 * vars.bgScale, 10);
				vars.bgScale = (!vars.bgScale) ? 100 : (vars.bgScale < 10) ? 10 : (vars.bgScale > 1000) ? 1000 : vars.bgScale;
				if (vars.bgScale / 100 != self.timeline.bgScale) {
					self.timeline.bgScale = vars.bgScale / 100;
					self.mainController.flushSize();
				}
				if (vars.bgStyle != self.timeline.bgStyle) {
					self.timeline.bgStyle = vars.bgStyle;
					self.mainController.flushSize();
				}
				self.mainController.selected3DView.redisplay();
				theAJKAjaxController.request({
					action : action,
					method : "post",
					vars : vars,
					callback : function(xml) {
						if (refreshNeeded) {
							window.location.reload();
						}
					}
				});
			}
		}).init();
		self.verifier.onChangeCallback = function(data) {
			if (data.fieldName == "public") {
				self.updatePrivacyPasswordField({
					fieldValue : data.fieldValue
				});
			}
		};
		self.verifier.hideCancelButton();
		self.verifier.showRevertButton();
		self.verifier.disableSaveAndRevert();
		self.setFieldValues();
	},
	updatePrivacyPasswordField : function(data) {
		var self = this;
		var fieldValue = data.fieldValue;
		if (fieldValue == "pwd") {
			$("#tl-field-privacy-password").css({
				display : "block"
			});
		} else {
			$("#tl-field-privacy-password").css({
				display : "none"
			});
		}
	},
	setFieldValues : function() {
		var self = this;
		self.verifier.setFieldValues({
			fieldValues : {
				introImageCredit : self.timeline.introImageCredit,
				backgroundImageCredit : self.timeline.backgroundImageCredit,
				dontDisplayIntroPanel : self.timeline.dontDisplayIntroPanel,
				openReadMoreLinks : self.timeline.openReadMoreLinks,
				storyDateStatus : self.timeline.storyDateStatus,
				public : self.timeline.public,
				privacyPassword : self.timeline.privacyPassword,
				secretWord : self.timeline.secretWord,
				showTitleBlock : self.timeline.showTitleBlock,
				storyDateFormat : self.timeline.storyDateFormat,
				topDateFormat : self.timeline.topDateFormat,
				sliderDateFormat : self.timeline.sliderDateFormat,
				language : self.timeline.language,
				displayStripes : self.timeline.displayStripes,
				htmlFormatting : self.timeline.htmlFormatting,
				sliderBackgroundColour : self.timeline.sliderBackgroundColour,
				sliderTextColour : self.timeline.sliderTextColour,
				sliderDetailsColour : self.timeline.sliderDetailsColour,
				sliderDraggerColour : self.timeline.sliderDraggerColour,
				headerBackgroundColour : self.timeline.headerBackgroundColour,
				headerTextColour : self.timeline.headerTextColour,
				showGroupAuthorNames : self.timeline.showGroupAuthorNames,
				durHeadlineColour : self.timeline.durHeadlineColour,
				cssFile : self.timeline.cssFile,
				altFlickrImageUrl : self.timeline.altFlickrImageUrl,
				fontBase : self.timeline.fontBase,
				fontHead : self.timeline.fontHead,
				fontBody : self.timeline.fontBody,
				lightboxStyle : self.timeline.lightboxStyle,
				showControls : self.timeline.showControls,
				lazyLoading : self.timeline.lazyLoading,
				expander : self.timeline.expander,
				copyable : self.timeline.copyable,
				bgScale : self.timeline.bgScale,
				bgStyle : self.timeline.bgStyle,
				urlHashing : self.timeline.urlHashing
			}
		});
		self.verifier.saveFieldValues();
		$.each(self.dateFieldFormatters, function() {
			this.updateFromFieldValue();
		});
	}
});