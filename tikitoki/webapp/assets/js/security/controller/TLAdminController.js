Class
		.forName({
			name : "class assets.js.security.controller.TLAdminController extends Object",

			TLAdminController : function(data) {
				var self = this;
				self.domRoot = data.domRoot;
				self.domAdminTab = data.domAdminTab;
				self.domTimelineBlock = $(self.domRoot).find("#tl-tab-my-timelines").get()[0];
				self.domTimelineList = $(self.domTimelineBlock).find("#tl-tab-my-timelines-timeline-list").get()[0];
				self.domTimelineFormSwitch = $(self.domRoot).find(".tl-ah-switch-block-control-timeline").get()[0];
				self.domTimelineForm = $(self.domRoot).find("#tl-ah-switch-block-timeline-form").get()[0];
				self.domUpdateTimelineForm = $(self.domRoot).find("#tab-my-selected-timeline-basic-info").get()[0];
				self.domSelectedTimelineHeadline = $(self.domRoot).find("#tl-ah-selected-timeline-headline span").get()[0];
				self.domShowAllTimelines = $(self.domRoot).find("#tl-ah-selected-timeline-headline a").get()[0];
				self.domSelectedTimelineStoryTab = $(self.domRoot).find("#tl-tab-my-selected-timeline-story-list").get()[0];
				self.domSelectedStoryHeadline = $(self.domRoot).find("#tl-ah-selected-story-headline").get()[0];
				self.domStoryForm = $(self.domRoot).find("#tl-tab-selected-story-basic-info").get()[0];
				self.domStoryExtraInfoForm = $(self.domRoot).find("#tl-tab-selected-story-extra-info").get()[0];
				self.domStoryMediaTab = $(self.domRoot).find("#tl-tab-selected-story-extra-media").get()[0];
				self.domStoryMediaForm = $(self.domRoot).find("#tl-ah-story-media-form").get()[0];
				self.domStoryMediaThumb = $(self.domStoryMediaForm).find(".tl-ah-media-thumb-holder div").get()[0];
				self.domStoryMediaMenuButton = $(self.domRoot).find("#tl-extra-media-tab-menu-item").get()[0];
				self.domTimelineInitalFocusSelect = $(self.domUpdateTimelineForm).find(".tl-ah-initial-focus-select").get()[0];
				self.domTimelineZoomField = $(self.domUpdateTimelineForm).find(".tl-ah-field-zoom").get()[0];
				self.domAccountTab = $(self.domRoot).find("#tl-tab-my-account").get()[0];
				self.domTimelineZoomSelect = $(self.domRoot).find("#tl-ah-timeline-zoom-select").get()[0];
				self.domSelectedStoryMediaHeadline = $(self.domRoot).find("#tl-ah-selected-media-title").get()[0];
				self.domStoryBasicInfoTabButton = $(self.domRoot).find("#tl-tab-selected-story-basic-info-button").get()[0];
				self.domCategoriesTab = $(self.domRoot).find("#tab-my-selected-timeline-categories").get()[0];
				self.domCategoriesForm = $(self.domRoot).find("#tl-ah-categories-form").get()[0];
				self.domSelectedCategoryTitle = $(self.domRoot).find("#tl-ah-selected-category-title").get()[0];
				self.domCreateNewTimelineButton = $(self.domRoot).find("#tl-ah-create-new-timeline-button").get()[0];
				self.domStoryCategorySelect = $(self.domRoot).find("#tl-ah-story-category-select").get()[0];
				self.domFeedCategorySelect = $(self.domRoot).find("#tl-ah-feed-category-select").get()[0];
				self.domAlert = $(self.domRoot).find("#tl-ah-alert").get()[0];
				self.domAlertInner = $(self.domAlert).find(".tl-ah-alert-inner").get()[0];
				self.domAlertContent = $(self.domAlert).find(".tl-ah-alert-content").get()[0];
				self.adminAlertController = "";
				self.domEventCatcher = $(self.domRoot).find("#tl-ah-event-catcher").get()[0];
				self.eventCatcherController = "";
				self.user = data.user;
				self.timelineFormVerification = "";
				self.updateTimelineFormVerification = "";
				self.mainController = data.mainController;
				self.contentPanelController = self.mainController.contentPanelController;
				self.timeline = data.timeline;
				self.storyFormVerifier = "";
				self.storyFormExtraInfoVerifier = "";
				self.storyMediaFormVerifier = "";
				self.selectedStory = "";
				self.storyListController = "";
				self.timelineListController = "";
				self.storyMediaListController = "";
				self.selectedMediaItem = "";
				self.categoriesListController = "";
				self.selectedCategoryItem = "";
				self.categoriesFormVerifier = "";
				self.adminVisible = true;
				self.tabOpenedFuncs = new Array();
				self.lastOpenedSectionTab = new Array();
				self.zoomSelectReplacer = "";
				self.domFeedItemSelector = $(".tl-ah-feed-item-selector").get()[0];
				self.imageSelector = "";
				self.accountVerifier = "";
				self.helpController = "";
				self.domGeneralPanelPrototype = $("#tl-general-purpose-panel-prototype").get()[0];
				self.promotionPanel = "";
				self.showHelp = true;
				self.embedVerifier = "";
				self.reducedListHeight = 100;
				self.mediumListHeight = 150;
				self.enlargedListHeight = 200;
				self.adminTabStatusCookieName = "TLAdminTabStatusCookie";
			},
			init : function() {
				var self = this;
				$(self.domRoot).hover(function() {
					theAJKMouseScrollEvent.registerAsObserver({
						observer : self
					});
					theTLMainController.selected3DView.disableHover = true;
				}, function() {
					theAJKMouseScrollEvent.removeAsObserver({
						observer : self
					});
					if (!TLAdminLightbox.aBoxIsOpen) {
						theTLMainController.selected3DView.disableHover = false;
					}
				});
				self.mainController.user.accountType = $("#tl-ah-user-account-type").text();
				self.mainController.user.maxNumTimelines = parseInt($("#tl-ah-max-num-tls").text());
				$("body").addClass("tl-user-type-" + self.mainController.user.accountType.toLowerCase());
				self.initialisePromotionsPanel();
				if (self.mainController.user.accountType == "Standard" && self.mainController.isHomePage) {
					self.promotionPanel.show({
						instantly : true
					});
				}
				$(self.domCreateNewTimelineButton).click(function() {
					if (self.user.timelines.length >= self.mainController.user.maxNumTimelines) {
						self.promotionPanel.show({
							oneOffClass : "tl-pp-show-account-message-" + self.mainController.user.accountType.toLowerCase()
						});
					} else {
						self.showNewTimelineForm();
					}
					return false;
				});
				$(self.domGeneralPanelPrototype).attr("id", "");
				$(self.domGeneralPanelPrototype).remove();
				self.helpController = new TLAdminHelp({
					domRoot : $("#tl-admin-help-holder").get()[0],
					domAdmin : self.domRoot,
					domOpenClose : $("#tl-admin-help-open-close").get()[0],
					mainController : self
				}).init();
				self.generateTimelineScaleList();
				$(self.domRoot).find("#tl-stories-tab-menu-item").click(function() {
					if (self.selectedStory) {
						setTimeout(function() {
							self.storyListController.resetHeightTo({
								height : self.reducedListHeight
							});
							self.selectStory({
								story : self.selectedStory,
								cancelCentering : true
							});
						}, 1);
					} else {
						self.helpController.setBaseHelpByName({
							baseName : "default"
						});
						setTimeout(function() {
							self.storyListController.resetHeightTo({
								height : self.enlargedListHeight
							});
						}, 1);
					}
				});
				self.eventCatcherController = new TLAdminEventCatcher({
					domRoot : self.domEventCatcher
				}).init();
				self.adminAlertController = new AJKAlert({
					domRoot : self.domAlert,
					preDisplaySetupFunc : function() {
						var adminPanelHeight = AJKHelpers.calculateDomElHeight({
							domEl : self.domRoot
						});
						$(self.domAlertInner).css({
							height : adminPanelHeight - 16
						});
						var contentHeight = AJKHelpers.calculateDomElHeight({
							domEl : self.domAlertContent
						}) + 10;
						var contentPos = parseInt((adminPanelHeight - contentHeight - 16) / 2, 10);
						$(self.domAlertContent).css({
							top : contentPos
						});
					}
				}).init();
				$(self.domAdminTab).click(function() {
					if (self.adminVisible) {
						$(self.domRoot).css({
							display : "none"
						});
						$(this).addClass("tl-admin-main-tab-admin-hidden");
						$(self.helpController.domOpenClose).css({
							visibility : "hidden"
						});
						self.adminVisible = false;
						self.helpController.hide();
						AJKHelpers.setCookie({
							name : self.adminTabStatusCookieName,
							value : "admin-closed",
							expires : 0
						});
					} else {
						$(self.domRoot).css({
							display : "block"
						});
						$(this).removeClass("tl-admin-main-tab-admin-hidden");
						$(self.helpController.domOpenClose).css({
							visibility : "visible"
						});
						self.adminVisible = true;
						if (self.showHelp) {
							self.helpController.show();
						}
						AJKHelpers.deleteCookie({
							name : self.adminTabStatusCookieName
						});
					}
					return false;
				});
				self.generateCategoryLists();
				new AJKTabBlockController({
					domRoot : $(self.domRoot).find(".tl-ah-main-menu").get()[0],
					tabMenuOptionClass : "tl-tab-option",
					tabSelectedClass : "tl-ah-selected"
				}).init();
				new AJKTabBlockController({
					domRoot : $(self.domRoot).find("#tl-ah-menu-selected-timeline-menu").get()[0],
					tabMenuOptionClass : "tl-tab-option",
					tabSelectedClass : "tl-ah-selected"
				}).init();
				new AJKTabBlockController({
					domRoot : $(self.domRoot).find("#tl-block-selected-timeline-story").get()[0],
					tabMenuOptionClass : "tl-tab-option",
					tabSelectedClass : "tl-ah-selected"
				}).init();
				new AJKSwitchBlockController({
					domRoot : self.domRoot,
					switchClass : "tl-ah-switch-block-control",
					switchSelectedClass : "tl-ah-switch-block-control-selected"
				}).init();
				$(self.domRoot).find("#tl-ah-create-new-story-button").click(function() {
					if (self.mainController.user.accountType == "Standard" && self.timeline.markers.length > 300) {
						self.promotionPanel.show({
							oneOffClass : "tl-pp-show-too-many-stories"
						});
					} else {
						self.createNewStory();
					}
					return false;
				});
				$(self.domRoot).find("#tl-ah-story-add-media-button").click(function() {
					self.createNewMediaItem();
					return false;
				});
				$(self.domRoot).find("#tl-ah-create-new-category-button").click(function() {
					self.createNewCategoryItem();
					return false;
				});
				$(self.domShowAllTimelines).click(function() {
					$(self.domTimelineBlock).removeClass("tl-ah-show-view-timeline-selected");
					self.helpController.setBaseHelpByName({
						baseName : "timeline-list"
					});
					self.timelineListController.resetWithNewListItems({
						listItems : self.user.timelines
					});
					return false;
				});
				self.setupTabOpenedFuncs();
				self.setupVerification();
				self.initialiseTimelineList();
				self.setupStoryMediaList();
				self.setupCategoryList();
				TLAdminLightbox.panelPrototype = $(self.domFeedItemSelector).clone().get()[0];
				$(TLAdminLightbox.panelPrototype).find(".tl-panel-specific-content").empty();
				$(self.domFeedItemSelector).after(TLAdminLightbox.panelPrototype);
				self.setUpImageSelector();
				self.setupAccountForm();
				self.setupEmbed();
				new TLCSVServices().init();
				new TLPDFServices({
					controller : self
				}).init();
				self.showHelp = (self.accountVerifier.getFieldValueFromName({
					fieldName : "showHelp"
				}) == 1);
				if (self.showHelp) {
					self.helpController.show();
				} else {
					self.helpController.hide();
				}
				$(self.domRoot).find("#tl-ah-minimise-story-block").click(function() {
					$(self.domStoryBasicInfoTabButton).click();
					self.storyListController.resetHeightTo({
						height : self.enlargedListHeight
					});
					self.hideStoryForm();
					self.helpController.setBaseHelpByName({
						baseName : "default"
					});
					self.selectedStory = false;
					return false;
				});
				$(self.domRoot).find("#tl-ah-minimise-new-timeline-block").click(function() {
					self.hideNewTimelineForm();
					return false;
				});
				if (self.mainController.user.accountType == "Teacher") {
					new TLAdminTeacherExtras({
						controller : self
					}).init();
				}
				if (self.mainController.user.accountType == "Standard") {
					self.initialisePupilUpgrade();
				}
				new TLAdminFeedController({
					controller : self
				}).init();
				new TLTimelineAdvancedSettingsController({
					controller : self
				}).init();
				new TLTimeline3DSettings({
					controller : self
				}).init();
				self.hideShowZoomForSpacing();
				self.activate();
				if (!(self.user.accountType == "Silver" || self.user.accountType == "Teacher")) {
					$("#tl-field-feed-source .tl-feed-source-json").remove();
				}
				if (self.timeline.showAdBlock == "true") {
					$("#tl-advert-block .tl-advb-remove-ad").css({
						display : "block"
					}).click(function() {
						$(self.domRoot).find(".tl-pp-launch-promotion-panel").click();
						return false;
					});
				}
				new AJKDatePickerController({
					domRoot : self.domRoot
				}).init();
				self.storyEditButton = new TLStoryEditButton({
					callback : function(data) {
						if (self.eventCatcherController.active) {
							self.eventCatcherController.fakeClick();
						} else {
							self.selectedStory = true;
							if (!$("#tl-tab-my-timelines-button").hasClass("tl-ah-selected")) {
								$("#tl-tab-my-timelines-button").click();
							}
							$("#tl-stories-tab-menu-item").click();
							self.selectStory({
								story : data.story,
								cancelCentering : true
							});
						}
					},
					controller : self
				}).init();
				if (self.mainController.userControlsController) {
					self.userControlsExtended = new TLUserControlsExtender({
						userControlsController : self.mainController.userControlsController,
						controller : self
					}).init();
				}
				return self;
			},
			activate : function() {
				var self = this;
				var cookieData = AJKHelpers.getCookie({
					name : self.adminTabStatusCookieName
				});
				var readyToDisplayFunc = function() {
					$(self.domRoot).css({
						visibility : "visible"
					});
					$(self.helpController.domRoot).css({
						visibility : "visible"
					});
					$(self.helpController.domOpenClose).css({
						visibility : "visible"
					});
					if (cookieData == "admin-closed") {
						$(self.domAdminTab).click();
					}
				};
				if (self.timeline.feeds && self.timeline.feeds.length > 0) {
					(function() {
						var thisFunc = arguments.callee;
						setTimeout(function() {
							if (self.mainController.initialFeedsLoaded) {
								readyToDisplayFunc();
							} else {
								thisFunc();
							}
						}, 100);
					})();
				} else {
					readyToDisplayFunc();
				}
			},
			hideShowZoomForSpacing : function() {
				var self = this;
				if (!self.domTimelineZoomField) {
					return;
				}
				if (self.timeline.markerSpacing == "equal") {
					$(self.domTimelineZoomField).removeClass("tl-ah-hide").addClass("tl-ah-hide");
				} else {
					$(self.domTimelineZoomField).removeClass("tl-ah-hide");
				}
			},
			initialisePupilUpgrade : function() {
				var self = this;
				$(self.domRoot)
						.find("#tl-ah-activate-pupil-account")
						.click(
								function() {
									var thisButton = this;
									insertHTML = '<div>';
									insertHTML += "<p>" + TLConfigText["teacherAccount_pupilUpgradeText"] + "</p>";
									insertHTML += self.createFieldHTML();
									insertHTML += '</div>';
									var domBody = $(insertHTML).get()[0];
									var domInput1 = $(domBody).find("input").get()[0];
									setTimeout(function() {
										$(domInput1).focus();
									}, 10);
									self.adminAlertController
											.displayMessage({
												headline : TLConfigText["teacherAccount_pupilUpgradePanel_headine"],
												body : domBody,
												buttons : [
														{
															html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Cancel'] + '</a>',
															action : function() {
															}
														},
														{
															html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Submit'] + '</a>',
															action : function() {
																var classCode = $(domInput1).val();
																if (classCode) {
																	self.adminAlertController.displayMessage({
																		headline : TLConfigText["teacherAccount_pupilUpgradePanel_Submitting_code"],
																		body : "<p>" + TLConfigText["teacherAccount_pupilUpgradePanel_Submitting_code_message"] + "</p>"
																	});
																	theAJKAjaxController
																			.request({
																				action : "/admin/activatePupilAccount",
																				method : "post",
																				vars : {
																					classCode : classCode
																				},
																				callback : function(xml) {
																					var anError = $(xml).find("error").text();
																					if (anError) {
																						var errorMessage = (anError == "error:too-many-pupils") ? TLConfigText["teacherAccount_pupilUpgradePanel_Submitting_code_error_1"]
																								: TLConfigText["teacherAccount_pupilUpgradePanel_Submitting_code_error_2"];
																						self.adminAlertController
																								.displayMessage({
																									headline : TLConfigText["teacherAccount_pupilUpgradePanel_Submitting_code_error_headline"],
																									body : "<p>" + errorMessage + "</p>",
																									buttons : [
																											{
																												html : '<a href="#" class="rt-button-4 rt-button-align-right">'
																														+ TLConfigText['adminBasic_Close'] + '</a>',
																												action : function() {
																												}
																											},
																											{
																												html : '<a href="#" class="rt-button-4 rt-button-align-right">'
																														+ TLConfigText['adminBasic_Try_again'] + '</a>',
																												action : function() {
																													$(thisButton).click();
																												}
																											} ]
																								});
																					} else {
																						self.adminAlertController.displayMessage({
																							headline : TLConfigText["teacherAccount_pupilUpgradePanel_Success_headline"],
																							body : "<p>" + TLConfigText["teacherAccount_pupilUpgradePanel_Success_message"]
																									+ "</p>",
																							buttons : [ {
																								html : '<a href="#" class="rt-button-4 rt-button-align-right">'
																										+ TLConfigText['adminBasic_Continue'] + '</a>',
																								action : function() {
																									window.location.reload(true);
																								}
																							} ]
																						});
																					}
																				}
																			});
																} else {
																	$(thisButton).click();
																}
															}
														} ]
											});
									return false;
								});
			},
			showNewTimelineForm : function() {
				var self = this;
				$(self.domTimelineForm).css({
					display : "block"
				});
				if (self.timelineListController) {
					self.timelineListController.resetHeightTo({
						height : self.reducedListHeight
					});
				}
			},
			hideNewTimelineForm : function() {
				var self = this;
				$(self.domTimelineForm).css({
					display : "none"
				});
				if (self.timelineListController) {
					self.timelineListController.resetHeightTo({
						height : self.enlargedListHeight
					});
				}
			},
			initialisePromotionsPanel : function() {
				var self = this;
				var domPromotionsMainContent = $("#tl-promotions-panel-main-content .content").get()[0];
				var domPromotionsFooterContent = $("#tl-promotions-panel-footer-content .content").get()[0];
				var domPromotionsCarousel = $("#tl-promotions-panel-main-content .tl-promotions-panel-carousel").get()[0];
				var domPromotionsCarouselStage = $("#tl-promotions-panel-main-content .tl-ppc-stage").get()[0];
				var domCarouselNext = $("#tl-promotions-panel-main-content .tl-pp-carousel-right-arrow").get()[0];
				var domCarouselPrev = $("#tl-promotions-panel-main-content .tl-pp-carousel-left-arrow").get()[0];
				self.promotionPanel = new TLGeneralPurposePanel({
					domRoot : $(self.domGeneralPanelPrototype).clone(),
					extraClass : "tl-promotions-panel",
					domMainInsertContent : domPromotionsMainContent,
					domFooterInsertContent : domPromotionsFooterContent,
					domCarousel : domPromotionsCarousel,
					domCarouselStage : domPromotionsCarouselStage,
					carouselLateralMovement : 483,
					carouselDisabledClass : "tl-pp-carousel-arrow-disabled",
					domCarouselNext : domCarouselNext,
					domCarouselPrev : domCarouselPrev
				}).init();
				$(domPromotionsMainContent).find("#tl-ah-free-account-selection").click(function() {
					self.promotionPanel.close();
					return false;
				});
				$(domPromotionsFooterContent).find("a").click(function() {
					self.promotionPanel.close();
					return false;
				});
				$(self.domRoot).find(".tl-pp-launch-promotion-panel").click(function() {
					self.promotionPanel.show();
					return false;
				});
			},
			setupAccountForm : function() {
				var self = this;
				$(self.domRoot).find("#tl-ah-field-account-password").each(function() {
					$(this).find(".tl-ah-field-option").click(function() {
						var domChangeButton = this;
						insertHTML = '<div>';
						insertHTML += "<p>" + TLConfigText["accountForm_changePassword_Enter_current_password"] + "</p>";
						insertHTML += self.createFieldHTML();
						insertHTML += "<p></p><p>" + TLConfigText["accountForm_changePassword_Enter_new_password"] + "</p>";
						insertHTML += self.createFieldHTML();
						insertHTML += '</div>';
						var domBody = $(insertHTML).get()[0];
						var domInput1 = $(domBody).find("input").get()[0];
						var domInput2 = $(domBody).find("input").get()[1];
						setTimeout(function() {
							$(domInput1).focus();
						}, 10);
						self.adminAlertController.displayMessage({
							headline : TLConfigText["accountForm_changePassword_headline"],
							body : domBody,
							buttons : [ {
								html : '<a href="#" class="rt-button-4 rt-button-align-right">Change</a>',
								action : function() {
									self.adminAlertController.displayMessage({
										headline : TLConfigText["accountForm_changePassword_Saving_headline"],
										body : "<p>" + TLConfigText["accountForm_changePassword_Saving_message"] + "</p>"
									});
									var oldPassword = $(domInput1).val();
									var newPassword = $(domInput2).val();
									theAJKAjaxController.request({
										action : "/admin/updateuserpassword/",
										method : "post",
										vars : {
											oldPassword : oldPassword,
											newPassword : newPassword
										},
										callback : function(xml) {
											var success = $(xml).find("success").text();
											if (success == "true") {
												var newPassStr = AJKHelpers.stringRepeat({
													aString : "*",
													multiplier : newPassword.length
												});
												$(self.domAccountTab).find("#tl-ah-field-account-password .tl-ah-uneditable-value p span").text(newPassStr);
												self.adminAlertController.fadeOut();
											} else {
												self.adminAlertController.displayMessage({
													headline : TLConfigText["accountForm_changePassword_Failure_headline"],
													body : "<p>" + TLConfigText["accountForm_changePassword_Failure_message"] + "</p>",
													buttons : [ {
														html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Try_again'] + '</a>',
														action : function() {
															$(domChangeButton).click();
														}
													}, {
														html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Cancel'] + '</a>',
														action : function() {
														}
													} ]
												});
											}
										}
									});
								}
							}, {
								html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Cancel'] + '</a>',
								action : function() {
								}
							} ]
						});
						return false;
					});
				});
			},
			setUpImageSelector : function() {
				var self = this;
				self.imageSelector = new AJKImageSelector({
					controller : self,
					timeline : self.timeline,
					domFeedItemSelector : self.domFeedItemSelector
				}).init();
				$(self.domRoot).find(".tl-ah-image-field").each(function() {
					var thisDomInput = $(this).find("input").get()[0];
					var thisDomSearchButton = $(this).find(".tl-ah-search-button").get()[0];
					var imageSize = $(this).find(".tl-ah-image-data-size").text();
					var domCaptionField = "";
					var captionFieldId = $(this).find(".tl-ah-image-data-caption-field-id").text();
					if (captionFieldId) {
						domCaptionField = $("#" + captionFieldId).get()[0];
					}
					var thumbPosFieldId = $(this).find(".tl-ah-image-data-thumb-position").text();
					var domThumbPosField = "";
					if (thumbPosFieldId) {
						domThumbPosField = $("#" + thumbPosFieldId).get()[0];
					}
					$(thisDomSearchButton).click(function() {
						self.imageSelector.launch({
							imageSize : imageSize,
							domContentField : thisDomInput,
							domCaptionField : domCaptionField,
							domThumbPosField : domThumbPosField
						});
						return false;
					});
				});
			},
			setupTabOpenedFuncs : function() {
				var self = this;
				self.tabOpenedFuncs["story-basic-info"] = function() {
					self.storyBasicInfoPanelOpened();
				};
				self.tabOpenedFuncs["story-media"] = function() {
					self.storyMediaPanelOpened();
				};
				self.tabOpenedFuncs["story-extra-info"] = function() {
					self.storyExtraInfoPanelOpened();
				};
				self.tabOpenedFuncs["section-categories"] = function() {
					self.categoryPanelOpened();
				};
				self.tabOpenedFuncs["section-basic-info"] = function() {
					self.timelineBasicInfoPanelOpened();
				};
				self.tabOpenedFuncs["section-story"] = function() {
					var lastOpenedSubSection = self.lastOpenedSectionTab["section-story"] || "story-basic-info";
					if (self.tabOpenedFuncs[lastOpenedSubSection]) {
						self.tabOpenedFuncs[lastOpenedSubSection]();
					}
				};
				$(self.domRoot).find(".tl-ah-menu li").each(function() {
					var tabName = $(this).attr("tabName");
					if (tabName && self.tabOpenedFuncs[tabName]) {
						var tabSubSection = "section-" + tabName.split("-")[0];
						var isSectionLeader = tabName.indexOf("section") != -1;
						$(this).find("a").click(function(e) {
							setTimeout(function() {
								if (isSectionLeader) {
									self.lastOpenedSectionTab["section"] = tabName;
								} else {
									self.lastOpenedSectionTab[tabSubSection] = tabName;
								}
								self.tabOpenedFuncs[tabName]();
							}, 1);
							e.preventDefault();
						});
					}
				});
			},
			generateCategoryLists : function() {
				var self = this;
				var insertHTML = "";
				insertHTML += '<option value="default">' + TLConfigText['adminBasic_Undefined'] + '</option>';
				$.each(self.timeline.categories, function() {
					if (!this.autoGenerated) {
						insertHTML += '<option value="' + this.id + '">' + this.title + '</option>';
					}
				});
				$(self.domStoryCategorySelect).empty().append(insertHTML);
				$(self.domFeedCategorySelect).empty().append(insertHTML);
			},
			updateCategoryLists : function() {
				var self = this;
				self.generateCategoryLists();
				if (self.selectedStory) {
					self.storyFormVerifier.setFieldValues({
						fieldValues : {
							category : self.selectedStory.category.id
						}
					});
				}
			},
			generateTimelineScaleList : function() {
				var self = this;
				var insertHTML = "";
				$.each(self.mainController.selectedView.availableScales, function() {
					insertHTML += '<option value="' + this.name + '">' + this.name + '</option>';
				});
				$(self.domTimelineZoomSelect).empty().append(insertHTML);
			},
			refreshTimelineZoomSelector : function() {
				var self = this;
				self.generateTimelineScaleList();
				if (self.zoomSelectReplacer) {
					self.zoomSelectReplacer.refresh();
				} else {
					self.zoomSelectReplacer = new AJKSelectReplacer({
						domSelect : self.domTimelineZoomSelect,
						createItemFunc : function(data) {
							var val = data.val;
							var text = data.text;
							var domZoomItem = $('<a class="tl-ah-zoom-item" href="#">' + text + '</a>').get()[0];
							return domZoomItem;
						},
						itemSelectedClass : "tl-ah-zoom-item-selected"
					}).init();
				}
				self.zoomSelectReplacer.selectItemFromVal({
					val : self.timeline.zoom
				});
			},
			setupVerification : function() {
				var self = this;
				self.accountVerifier = new AJKVerifier({
					domRootEl : self.domAccountTab,
					revertFunc : function() {
						self.accountVerifier.restoreSavedFieldValues();
					},
					submitFunc : function(data) {
						var insertHTML = '<div>';
						insertHTML += TLConfigText["accountForm_confirmPassword_message"];
						insertHTML += self.createFieldHTML();
						insertHTML += '</div>';
						var domBody = $(insertHTML).get()[0];
						var domInput = $(domBody).find("input").get()[0];
						setTimeout(function() {
							$(domInput).focus();
						}, 10);
						self.adminAlertController.displayMessage({
							headline : TLConfigText["accountForm_confirmPassword_headline"],
							body : domBody,
							buttons : [ {
								html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Continue'] + '</a>',
								action : function() {
									var enteredPassword = $(domInput).val();
									data.fieldData["password"] = enteredPassword;
									self.displayStandardSavingAlertMessage();
									theAJKAjaxController.request({
										action : "/admin/savebasicaccounddetails/",
										method : "post",
										vars : data.fieldData,
										callback : function(xml) {
											var success = $(xml).find("success").text();
											if (success == "true") {
												self.accountVerifier.saveFieldValues();
												self.accountVerifier.disableSaveAndRevert();
												self.adminAlertController.fadeOut();
											} else {
												self.adminAlertController.displayMessage({
													headline : TLConfigText["accountForm_confirmPassword_failure_headline"],
													body : "<p>" + TLConfigText["accountForm_confirmPassword_failure_message"] + "</p>",
													buttons : [ {
														html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText["adminBasic_Try_again"] + '</a>',
														action : function() {
															self.accountVerifier.fireButton({
																buttonType : "save"
															});
														}
													}, {
														html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText["adminBasic_Cancel"] + '</a>',
														action : function() {
														}
													} ]
												});
											}
										}
									});
								}
							}, {
								html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText["adminBasic_Cancel"] + '</a>',
								action : function() {
								}
							} ]
						});
					}
				}).init();
				self.accountVerifier.saveFieldValues();
				self.accountVerifier.disableSaveAndRevert();
				self.accountVerifier.onChangeCallback = function(data) {
					if (data.fieldName == "showHelp" && data.fieldValue == 1) {
						self.helpController.show();
						self.showHelp = true;
					} else if (data.fieldName == "showHelp") {
						self.helpController.hide();
						self.showHelp = false;
					}
				};
				self.timelineFormVerification = new AJKVerifier({
					domRootEl : self.domTimelineForm,
					cancelFunc : function() {
						self.hideNewTimelineForm();
					},
					submitFunc : function(data) {
						var startDate = Date.parse(data.fieldData["startDate"]);
						if (!self.verifyTimelineFormDate({
							verifier : self.timelineFormVerification,
							date : startDate,
							dateType : "startDate"
						})) {
							return false;
						}
						var endDate = Date.parse(data.fieldData["endDate"]);
						if (!self.verifyTimelineFormDate({
							verifier : self.timelineFormVerification,
							date : endDate,
							dateType : "endDate"
						})) {
							return false;
						}
						data.fieldData["startDate"] = AJKHelpers.formatDate({
							date : Date.parse(data.fieldData["startDate"]),
							formatString : "YYYY-MM-DD HH:mm:ss",
							forceFullDate : true,
							language : "base"
						});
						data.fieldData["endDate"] = AJKHelpers.formatDate({
							date : Date.parse(data.fieldData["endDate"]),
							formatString : "YYYY-MM-DD HH:mm:ss",
							forceFullDate : true,
							language : "base"
						});
						self.adminAlertController.displayMessage({
							headline : TLConfigText["adminBasic_Saving"],
							body : '<p>' + TLConfigText["adminBasic_Saving_timeline_message"] + '</p>'
						});
						data.fieldData["zoom"] = "";
						theAJKAjaxController.request({
							action : "/admin/createtimeline/",
							method : "post",
							vars : data.fieldData,
							callback : function(xml) {
								var timelineId = $(xml).find("timelineId").text();
								var urlFriendlyTitle = $(xml).find("timelineUrlFriendlyTitle").text();
								self.mainController.loadTimeline({
									timeline : {
										id : timelineId,
										urlFriendlyTitle : urlFriendlyTitle
									}
								});
							}
						});
					}
				}).init();
				self.updateTimelineFormVerification = new AJKVerifier({
					domRootEl : self.domUpdateTimelineForm,
					revertFunc : function() {
						self.updateTimelineFormVerification.restoreSavedFieldValues();
					},
					submitFunc : function(data) {
						var startDate = Date.parse(data.fieldData["startDate"]);
						if (!self.verifyTimelineFormDate({
							verifier : self.updateTimelineFormVerification,
							date : startDate,
							dateType : "startDate"
						})) {
							return false;
						}
						var endDate = Date.parse(data.fieldData["endDate"]);
						if (!self.verifyTimelineFormDate({
							verifier : self.updateTimelineFormVerification,
							date : endDate,
							dateType : "endDate"
						})) {
							return false;
						}
						var saveUpdatedTimeline = function() {
							self.displayStandardSavingAlertMessage();
							data.fieldData["startDate"] = AJKHelpers.formatDate({
								date : Date.parse(data.fieldData["startDate"]),
								formatString : "YYYY-MM-DD HH:mm:ss",
								forceFullDate : true,
								language : "base"
							});
							data.fieldData["timelineId"] = self.timeline.id;
							data.fieldData["endDate"] = AJKHelpers.formatDate({
								date : Date.parse(data.fieldData["endDate"]),
								formatString : "YYYY-MM-DD HH:mm:ss",
								forceFullDate : true,
								language : "base"
							});
							data.fieldData["htmlFormatting"] = self.timeline.htmlFormatting;
							self.updateTimelineFormVerification.saveFieldValues();
							self.updateTimelineFormVerification.disableSaveAndRevert();
							self.eventCatcherController.deactivate();
							if (self.user.timelinesByKey[self.timeline.id].title != data.fieldData.title) {
								self.user.timelinesByKey[self.timeline.id].title = data.fieldData.title;
								$(self.domSelectedTimelineHeadline).text(data.fieldData.title);
							}
							theAJKAjaxController.request({
								action : "/admin/updatetimeline/",
								method : "post",
								vars : data.fieldData,
								callback : function(xml) {
									self.adminAlertController.fadeOut();
									var urlFriendlyTitle = $(xml).find("timelineUrlFriendlyTitle").text();
									if (urlFriendlyTitle && urlFriendlyTitle != self.timeline.urlFriendlyTitle) {
										self.mainController.loadTimeline({
											timeline : {
												id : self.timeline.id,
												urlFriendlyTitle : urlFriendlyTitle
											}
										});
									}
								}
							});
						};
						if (data.fieldData["title"] && data.fieldData["title"] != self.timeline.originalTitle) {
							self.adminAlertController.displayMessage({
								headline : TLConfigText["timelineForm_titleChanged_headline"],
								body : "<div>" + TLConfigText["timelineForm_titleChanged_message"] + "</div>",
								buttons : [ {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Yes'] + '</a>',
									action : function() {
										saveUpdatedTimeline();
									}
								}, {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_No'] + '</a>',
									action : function() {
										self.updateTimelineFormVerification.restoreSavedValueForField({
											fieldName : "title"
										});
									}
								} ]
							});
						} else {
							saveUpdatedTimeline();
						}
					}
				}).init();
				self.storyFormVerifier = new AJKVerifier(
						{
							domRootEl : self.domStoryForm,
							cancelFunc : function() {
								self.deleteStory({
									story : self.selectedStory
								});
								self.storyListController.resetHeightTo({
									height : self.enlargedListHeight
								});
								self.helpController.setBaseHelpByName({
									baseName : "default"
								});
							},
							revertFunc : function() {
								self.storyFormVerifier.restoreSavedFieldValues();
							},
							submitFunc : function(data) {
								if (self.selectedStory.id == "awaitingId") {
									return false;
								}
								if (!self.isStoryStartDateInTimelineRange({
									startDate : Date.parse(data.fieldData["startDate"])
								})) {
									return;
								}
								self.displayStandardSavingAlertMessage();
								var vars = data.fieldData;
								vars["timelineId"] = self.timeline.id;
								vars["storyId"] = self.selectedStory.id;
								vars["category"] = (vars["category"] == "default") ? 0 : vars["category"];
								self.syncStoryStartEndDates({
									oldStoryStartDate : self.selectedStory.startDate
								});
								data.fieldData["startDate"] = AJKHelpers.formatDate({
									date : Date.parse(data.fieldData["startDate"]),
									formatString : "YYYY-MM-DD HH:mm:ss",
									forceFullDate : true,
									language : "base"
								});
								data.fieldData["endDate"] = AJKHelpers.formatDate({
									date : Date.parse(data.fieldData["endDate"]),
									formatString : "YYYY-MM-DD HH:mm:ss",
									forceFullDate : true,
									language : "base"
								});
								var action = (self.selectedStory.id) ? "/admin/updatestory/" : "/admin/createstory/";
								self.selectedStory.id = (self.selectedStory.id) ? self.selectedStory.id : "awaitingId";
								self.storyFormVerifier.saveFieldValues();
								self.storyFormVerifier.hideCancelButton();
								self.storyFormVerifier.showRevertButton();
								self.storyFormVerifier.disableSaveAndRevert();
								var relatedStory = self.selectedStory;
								self.updateContentPanel({
									story : self.selectedStory
								});
								self.eventCatcherController.deactivate();
								self.mainController.selected3DView.redisplay();
								theAJKAjaxController
										.request({
											action : action,
											method : "post",
											vars : vars,
											callback : function(xml) {
												if (relatedStory.id == "awaitingId") {
													relatedStory.id = $(xml).find("storyId").text();
													if (!relatedStory.id) {
														self.adminAlertController
																.displayMessage({
																	headline : "Could not create story",
																	hideClose : true,
																	body : "<p>Something went wrong when we tried to create this story in our database.</p><p>Please reload the timeline and try again.</p>"
																});
														return;
													}
												} else {
													if (!xml || $(xml).find("success").text() != "true") {
														self.adminAlertController
																.displayMessage({
																	headline : "Could not update story",
																	hideClose : true,
																	body : "<p>Something went wrong when we tried to update this story in our database.</p><p>Please reload the timeline and try again.</p>"
																});
														return;
													}
												}
												self.adminAlertController.fadeOut();
											}
										});
							}
						}).init();
				self.storyFormExtraInfoVerifier = new AJKVerifier({
					domRootEl : self.domStoryExtraInfoForm,
					revertFunc : function() {
						self.storyFormExtraInfoVerifier.restoreSavedFieldValues();
						self.eventCatcherController.deactivate();
					},
					submitFunc : function(data) {
						if (!self.selectedStory.id) {
						}
						self.displayStandardSavingAlertMessage();
						var vars = data.fieldData;
						vars["timelineId"] = self.timeline.id;
						vars["storyId"] = self.selectedStory.id;
						vars["htmlFormatting"] = self.timeline.htmlFormatting;
						self.selectedStory.setValue({
							valueName : "fullText",
							value : vars["fullText"]
						});
						self.updateContentPanel({
							story : self.selectedStory
						});
						self.storyFormExtraInfoVerifier.saveFieldValues();
						self.storyFormExtraInfoVerifier.disableSaveAndRevert();
						self.eventCatcherController.deactivate();
						var action = "/admin/updatestoryextrainfo/";
						theAJKAjaxController.request({
							action : action,
							method : "post",
							vars : vars,
							callback : function(xml) {
								self.adminAlertController.fadeOut();
							}
						});
					}
				}).init();
				self.storyMediaFormVerifier = new AJKVerifier({
					domRootEl : self.domStoryMediaForm,
					cancelFunc : function() {
						self.deleteMediaItem({
							mediaItem : self.selectedMediaItem
						});
					},
					revertFunc : function() {
						self.storyMediaFormVerifier.restoreSavedFieldValues();
					},
					submitFunc : function(data) {
						if (!self.selectedStory.id) {
							return;
						}
						self.displayStandardSavingAlertMessage();
						var vars = data.fieldData;
						vars["timelineId"] = self.timeline.id;
						vars["storyId"] = self.selectedStory.id;
						vars["mediaId"] = self.selectedMediaItem.id;
						var relatedMediaItem = self.selectedMediaItem;
						var relatedStory = self.selectedStory;
						var newItem = (self.selectedMediaItem.id == "awaitingId") ? true : false;
						var action = (newItem) ? "/admin/addmediatostory/" : "/admin/updatemedia/";
						self.storyMediaFormVerifier.saveFieldValues();
						self.storyMediaFormVerifier.hideCancelButton();
						self.storyMediaFormVerifier.showRevertButton();
						self.storyMediaFormVerifier.disableSaveAndRevert();
						self.eventCatcherController.deactivate();
						theAJKAjaxController.request({
							action : action,
							method : "post",
							vars : vars,
							callback : function(xml) {
								if (relatedMediaItem.type == "Video" || relatedMediaItem.type == "Audio") {
									if ($(xml).find("externalMediaThumb").text()) {
										relatedMediaItem.externalMediaThumb = $(xml).find("externalMediaThumb").text();
										self.storyMediaFormVerifier.setFieldValues({
											fieldValues : {
												video_thumb : relatedMediaItem.externalMediaThumb
											}
										});
									} else {
										relatedMediaItem.externalMediaThumb = vars["video_thumb"];
									}
									if ($(xml).find("externalMediaId").text()) {
										relatedMediaItem.externalMediaId = $(xml).find("externalMediaId").text();
									}
									if ($(xml).find("externalMediaType").text()) {
										relatedMediaItem.externalMediaType = $(xml).find("externalMediaType").text();
									}
								}
								if (newItem) {
									var mediaId = $(xml).find("mediaId").text();
									relatedMediaItem.id = mediaId;
									relatedStory.addMediaItem({
										mediaItem : relatedMediaItem
									});
									if (self.selectedStory == relatedStory) {
										self.storyMediaListController.resetWithNewListItems({
											listItems : self.selectedStory.media
										});
										self.storyMediaListController.showAndSelectListItem({
											listItem : relatedMediaItem,
											instantly : true
										});
									}
								}
								relatedStory.mediaHasBeenUpdated();
								self.updateContentPanel({
									story : relatedStory
								});
								self.adminAlertController.fadeOut();
								self.loadMediaThumb({
									mediaItem : relatedMediaItem
								});
							}
						});
					}
				}).init();
				self.categoriesFormVerifier = new AJKVerifier({
					domRootEl : self.domCategoriesForm,
					cancelFunc : function() {
						self.deleteCategoryItem({
							categoryItem : self.selectedCategoryItem
						});
					},
					revertFunc : function() {
						self.categoriesFormVerifier.restoreSavedFieldValues();
					},
					submitFunc : function(data) {
						self.displayStandardSavingAlertMessage();
						var vars = data.fieldData;
						vars["timelineId"] = self.timeline.id;
						vars["id"] = self.selectedCategoryItem.id;
						self.selectedCategoryItem.title = vars["title"];
						self.selectedCategoryItem.colour = vars["colour"];
						self.selectedCategoryItem.rows = vars["rows"];
						self.selectedCategoryItem.layout = vars["layout"];
						self.selectedCategoryItem.viewType = (vars["layout"] == 1) ? "duration" : "standard";
						var relatedCategoryItem = self.selectedCategoryItem;
						var newItem = (self.selectedCategoryItem.id == "awaitingId") ? true : false;
						var action = (newItem) ? "/admin/addcategorytotimeline/" : "/admin/updatecategory/";
						self.updateContentPanel({
							story : self.selectedStory
						});
						self.categoriesFormVerifier.saveFieldValues();
						self.categoriesFormVerifier.hideCancelButton();
						self.categoriesFormVerifier.showRevertButton();
						self.categoriesFormVerifier.disableSaveAndRevert();
						self.eventCatcherController.deactivate();
						theAJKAjaxController.request({
							action : action,
							method : "post",
							vars : vars,
							callback : function(xml) {
								if (newItem) {
									var categoryId = $(xml).find("categoryId").text();
									relatedCategoryItem.id = categoryId;
									self.mainController.addNewCategory({
										category : relatedCategoryItem
									});
									if (self.selectedCategoryItem == relatedCategoryItem) {
										self.categoriesListController.resetWithNewListItems({
											listItems : self.getCategories()
										});
										self.categoriesListController.showAndSelectListItem({
											listItem : relatedCategoryItem,
											instantly : true
										});
									}
									if (self.timeline.viewType == "category-band") {
										self.refreshTimelineView();
									}
								} else {
									self.mainController.sortCategories();
									self.categoriesListController.resetWithNewListItems({
										listItems : self.getCategories()
									});
									if (self.selectedCategoryItem == relatedCategoryItem) {
										self.categoriesListController.showAndSelectListItem({
											listItem : relatedCategoryItem,
											instantly : true
										});
									}
									$.each(self.timeline.markers, function() {
										if (this.category == relatedCategoryItem) {
											this.categoryHasChanged();
										}
									});
									self.mainController.selected3DView.redisplay();
									if (self.timeline.viewType == "category-band") {
										self.refreshTimelineView();
									}
								}
								self.refreshUserControlsView({
									view : "category"
								});
								self.updateCategoryLists();
								self.adminAlertController.fadeOut();
							}
						});
					}
				}).init();
			},
			refreshUserControlsView : function(data) {
				var self = this;
				if (self.mainController.userControlsController) {
					self.mainController.userControlsController.updateView(data);
				}
			},
			displayStandardSavingAlertMessage : function() {
				var self = this;
				self.adminAlertController.displayMessage({
					headline : TLConfigText["adminBasic_Saving"],
					hideClose : true,
					body : "<p>" + TLConfigText["adminBasic_Saving_message"] + "</p>"
				});
			},
			refreshTimelineView : function() {
				var self = this;
				self.mainController.sortMarkersByCategoryList();
				self.mainController.updateViewsWithNewDateRangeAndZoom({
					zoom : self.timeline.zoom
				});
				self.mainController.flushSize();
			},
			updateCategoryBand : function(data) {
				var self = this;
				var category = data.category;
				var categoryBand = self.mainController.selectedView.categoryBandsByKey[category.key];
				categoryBand.refreshFromCategory();
			},
			initialiseTimelineList : function() {
				var self = this;
				if (self.user.timelines.length > 0) {
					self.setupTimelineList();
					if (self.timeline.id && self.user.timelinesByKey[self.timeline.id] && !self.mainController.isHomePage) {
						self.timeline.secretWord = self.user.timelinesByKey[self.timeline.id].secretWord;
						self.selectTimeline({
							timeline : self.user.timelinesByKey[self.timeline.id]
						});
						self.timeline.isEditable = true;
						setTimeout(function() {
							self.mainController.contentPanelController.hide();
						}, 2000);
					} else {
						self.helpController.setBaseHelpByName({
							baseName : "timeline-list"
						});
					}
				} else {
					$(self.domTimelineFormSwitch).click();
					self.helpController.setBaseHelpByName({
						baseName : "timeline-list"
					});
					$(self.domTimelineList).find(".ajk-cs-carousel").css({
						display : "none"
					});
				}
			},
			setupTimelineList : function() {
				var self = this;
				self.timelineListController = new AJKScrollableListController(
						{
							domRoot : $(self.domTimelineList).find(".ajk-cs-carousel").get()[0],
							domStage : $(self.domTimelineList).find(".ajk-cs-carousel-stage").get()[0],
							listItems : self.user.timelines,
							createDomListItemFunc : function(data) {
								var timeline = data.listItem;
								var insertHTML = '<div timelineId="' + timeline.id + '" class="tl-ah-list-item">';
								insertHTML += '<div class="tl-ah-col-1">';
								insertHTML += '<p id="admin-timeline-list-item-title-' + timeline.id + '">' + timeline.title + '</p>';
								insertHTML += '</div>';
								insertHTML += '<div class="tl-ah-col-2">';
								insertHTML += '<a href="#">' + TLConfigText['adminBasic_Edit'] + '</a> | <a class="tl-ah-li-delete" href="#">' + TLConfigText['adminBasic_Delete']
										+ '</a>';
								insertHTML += '</div>';
								insertHTML += '</div>';
								return $(insertHTML).get()[0];
							},
							listItemSelectClass : "tl-ah-list-item-selected",
							itemWasClickedFunc : function(data) {
								var timeline = data.listItem;
								var clickedElClass = data.clickedElClass;
								if (clickedElClass.indexOf("tl-ah-li-delete") != -1) {
									self.adminAlertController.displayMessage({
										headline : "Delete timeline",
										body : '<p>Are you sure you want to delete this timeline. You will not be able to get the timeline back once it is deleted.</p>',
										buttons : [ {
											html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_No'] + '</a>',
											action : function() {
											}
										}, {
											html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Yes'] + '</a>',
											action : function() {
												self.deleteTimeline({
													timelineId : timeline.id
												});
												self.updateTimelineList();
												self.setupTimelineList();
											}
										} ]
									});
								} else {
									if (timeline.id == self.timeline.id && !self.mainController.isHomePage) {
										$(self.domTimelineBlock).addClass("tl-ah-show-view-timeline-selected");
										self.helpController.setBaseHelpByName({
											baseName : "default"
										});
									} else {
										self.mainController.loadTimeline({
											timeline : timeline
										});
									}
								}
							},
							getKeyForListItem : function(data) {
								var timeline = data.listItem;
								return timeline.id;
							},
							getPositionForListItem : function(data) {
								var timeline = data.timeline;
								return timeline.orderIndex;
							}
						}).init();
				self.timelineListController.resetHeightTo({
					height : self.enlargedListHeight
				});
			},
			setupStoriesList : function() {
				var self = this;
				self.storyListController = new AJKScrollableListController(
						{
							domRoot : $(self.domRoot).find("#tl-tab-my-selected-timeline-story-list .ajk-cs-carousel").get()[0],
							domStage : $(self.domRoot).find("#tl-tab-my-selected-timeline-story-list .ajk-cs-carousel-stage").get()[0],
							listItems : self.timeline.markers,
							createDomListItemFunc : function(data) {
								var story = data.listItem;
								var extraClass = (story.uneditable) ? " tl-ah-list-item-uneditable" : "";
								var insertHTML = '<div storyId="' + story.markerKey + '" class="tl-ah-list-item' + extraClass + '">';
								insertHTML += '<div class="tl-ah-col-1">';
								insertHTML += '<p id="admin-story-list-item-title-' + story.markerKey + '">' + story.headline + '</p>';
								insertHTML += '</div>';
								insertHTML += '<div class="tl-ah-col-2">';
								insertHTML += '<a href="#">' + TLConfigText['adminBasic_Edit'] + '</a> | <a class="tl-ah-li-delete" href="#">' + TLConfigText['adminBasic_Delete']
										+ '</a>';
								insertHTML += '</div>';
								insertHTML += '</div>';
								return $(insertHTML).get()[0];
							},
							listItemSelectClass : "tl-ah-list-item-selected",
							itemWasClickedFunc : function(data) {
								var story = data.listItem;
								if (story.uneditable) {
									self.adminAlertController.displayMessage({
										headline : TLConfigText["feedStory_cantEdit_headline"],
										body : '<p>' + TLConfigText["feedStory_cantEdit_message"] + '</p>',
										buttons : [ {
											html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Continue'] + '</a>',
											action : function() {
											}
										} ]
									});
									return;
								}
								var clickedElClass = data.clickedElClass;
								if (clickedElClass.indexOf("tl-ah-li-delete") != -1) {
									self.adminAlertController.displayMessage({
										headline : TLConfigText["story_deleteStory_headline"],
										body : '<p>' + TLConfigText["story_deleteStory_message"] + ' “' + story.headline + '”?</p>',
										buttons : [ {
											html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_No'] + '</a>',
											action : function() {
											}
										}, {
											html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Yes'] + '</a>',
											action : function() {
												self.deleteStory({
													story : story
												});
											}
										} ]
									});
								} else {
									self.selectStory({
										story : story
									});
								}
							},
							getKeyForListItem : function(data) {
								var story = data.listItem;
								return story.markerKey;
							},
							getPositionForListItem : function(data) {
								var story = data.listItem;
								return story.orderIndex;
							}
						}).init();
			},
			updateTimelineList : function() {
				var self = this;
				var counter = 0;
				$.each(self.user.timelines, function() {
					this.orderIndex = counter++;
				});
			},
			deleteTimeline : function(data) {
				var self = this;
				var timelineId = data.timelineId;
				var actualTimeline = self.user.timelinesByKey[timelineId];
				if (actualTimeline) {
					self.user.timelines = AJKHelpers.removeItemFromArray({
						anArray : self.user.timelines,
						item : actualTimeline
					});
					var vars = {};
					vars["timelineId"] = timelineId;
					var action = "/admin/deletetimeline/";
					var currentTimelineId = self.timeline.id;
					theAJKAjaxController.request({
						action : action,
						method : "post",
						vars : vars,
						callback : function(xml) {
							if (timelineId == currentTimelineId) {
								window.location = "/";
							}
						}
					});
				}
			},
			recreateInitialFocusSelect : function() {
				var self = this;
				var insertHTML = '<option value="first">' + TLConfigText["adminBasic_First_story"] + '</option>';
				insertHTML += '<option value="last">' + TLConfigText["adminBasic_Last_story"] + '</option>';
				insertHTML += '<option value="today">' + TLConfigText["adminBasic_Today"] + '</option>';
				$.each(self.timeline.markers, function() {
					if (!this.uneditable) {
						insertHTML += '<option value="' + this.id + '">' + this.headline + '</option>';
					}
				});
				$(self.domTimelineInitalFocusSelect).html(insertHTML);
			},
			selectTimeline : function(data) {
				var self = this;
				var timeline = data.timeline;
				self.recreateInitialFocusSelect();
				$(self.domSelectedTimelineHeadline).text(AJKHelpers.clipToMaxCharWords({
					aString : timeline.title,
					maxChars : 30
				}));
				$(self.domTimelineBlock).addClass("tl-ah-show-view-timeline-selected");
				self.helpController.setBaseHelpByName({
					baseName : "default"
				});
				self.setupStoriesList();
				self.storyListController.resetHeightTo({
					height : self.enlargedListHeight
				});
				self.updateTimelineFormVerification.hideCancelButton();
				self.timelineBasicInfoPanelOpened();
				self.updateTimelineFormVerification.onChangeCallback = "";
				self.updateTimelineFormVerification.onKeyUpCallback = "";
				self.updateTimelineFormVerification.setFieldValues({
					fieldValues : {
						title : self.timeline.title,
						startDate : AJKHelpers.formatDate({
							formatString : "DD MMM YYYY HH:mm:ss",
							date : self.timeline.startDate,
							language : "base"
						}),
						endDate : AJKHelpers.formatDate({
							formatString : "DD MMM YYYY HH:mm:ss",
							date : self.timeline.endDate,
							language : "base"
						}),
						text : self.timeline.introText,
						aboutText : self.timeline.aboutText,
						introImage : self.timeline.introImage,
						introImageCredit : self.timeline.introImageCredit,
						backgroundImage : self.timeline.backgroundImage,
						backgroundImageCredit : self.timeline.backgroundImageCredit,
						zoom : self.timeline.zoom,
						mainColour : self.timeline.mainColour,
						backgroundColour : self.timeline.backgroundColour,
						feed : self.timeline.feed,
						initialFocus : self.timeline.initialFocus,
						storySpacing : self.timeline.storySpacingType,
						viewType : self.timeline.viewTypeValue
					}
				});
				self.refreshTimelineZoomSelector();
				self.updateTimelineFormVerification.saveFieldValues();
				self.updateTimelineFormVerification.disableSaveAndRevert();
				self.updateTimelineFormVerification.onChangeCallback = function(data) {
					if (data.fieldName == "zoom") {
						self.zoomSelectReplacer.selectItemFromVal({
							val : data.fieldValue
						});
						self.timeline.savedZoom = data.fieldValue;
						self.mainController.updateViewsWithNewDateRangeAndZoom({
							zoom : data.fieldValue
						});
						self.refreshUserControlsView({
							view : "zoom"
						});
					}
					if (data.fieldName == "backgroundImage" && data.fieldvalue != self.mainController.timelineBackgroundImage) {
						self.mainController.timelineBackgroundImage = data.fieldValue;
						self.mainController.initialiseBackgroundImage();
					}
					if (data.fieldName == "startDate" || data.fieldName == "endDate") {
						var aDate = Date.parse(data.fieldValue);
						if (self.verifyTimelineFormDate({
							verifier : self.updateTimelineFormVerification,
							date : aDate,
							dateType : data.fieldName
						})) {
							self.mainController.timeline[data.fieldName] = aDate;
							self.mainController.updateViewsWithNewDateRangeAndZoom({
								zoom : ""
							});
							self.refreshTimelineZoomSelector();
						}
					}
					if (data.fieldName == "storySpacing" && self.timeline.storySpacingType != data.fieldValue) {
						self.timeline.storySpacingType = parseInt(data.fieldValue);
						self.timeline.markerSpacing = TLViewController.markerSpacingView[self.timeline.storySpacingType].type;
						self.timeline.equalMarkerSpacing = TLViewController.markerSpacingView[self.timeline.storySpacingType].markerSpacing;
						self.timeline.markerSpacingObj = TLViewController.markerSpacingView[self.timeline.storySpacingType];
						self.mainController.updateViewsWithNewDateRangeAndZoom({
							zoom : self.timeline.zoom
						});
						self.hideShowZoomForSpacing();
						self.mainController.flushSize();
						self.refreshUserControlsView({
							view : "spacing"
						});
					}
					if (data.fieldName == "viewType" && self.timeline.viewTypeValue != data.fieldValue) {
						self.timeline.viewTypeValue = data.fieldValue;
						self.timeline.viewType = self.mainController.viewTypes[data.fieldValue];
						if (self.timeline.viewType == "category-band") {
							self.mainController.sortMarkersByCategoryList();
						}
						self.mainController.selected3DView.clearStories3DText();
						self.mainController.updateViewsWithNewDateRangeAndZoom({
							zoom : self.timeline.zoom
						});
						self.mainController.flushSize();
						self.refreshUserControlsView({
							view : "view"
						});
					}
					if (data.fieldName == "introImage") {
						self.updateTimelineFormVerification.setFieldValues({
							fieldValues : {
								"introImageCredit" : "",
								forceChangeEvent : true
							}
						});
						self.mainController.aboutTimelineStory.images[0].caption = "";
						self.mainController.timeline.introImage = data.fieldValue;
						self.mainController.timeline.introImageCredit = "";
						self.updateContentPanel({
							story : self.mainController.aboutTimelineStory
						});
					}
					if (data.fieldName == "backgroundImage") {
						self.updateTimelineFormVerification.setFieldValues({
							fieldValues : {
								"backgroundImageCredit" : "",
								forceChangeEvent : true
							}
						});
						$(self.mainController.domMainPhotoCredit).empty();
					}
					if (data.fieldName == "backgroundImageCredit") {
						self.mainController.timeline.backgroundImageCredit = data.fieldValue;
						$(self.mainController.domMainPhotoCredit).html(self.mainController.getBGImageCredit());
					}
					if (data.fieldName == "introImageCredit") {
						self.mainController.timeline.introImageCredit = data.fieldValue;
						self.mainController.aboutTimelineStory.images[0].caption = data.fieldValue;
						self.updateContentPanel({
							story : self.mainController.aboutTimelineStory
						});
					}
					if (data.fieldName == "text") {
						self.mainController.aboutTimelineStory.clippedContentIntroText = data.fieldValue;
						self.updateContentPanel({
							story : self.mainController.aboutTimelineStory
						});
					}
					if (data.fieldName == "aboutText") {
						self.mainController.aboutTimelineStory.fullText = data.fieldValue;
						self.updateContentPanel({
							story : self.mainController.aboutTimelineStory
						});
					}
					if (data.fieldName == "title") {
						self.timeline.title = data.fieldValue;
						$(self.mainController.domTimelineTitle).text(data.fieldValue);
						self.mainController.aboutTimelineStory.headline = data.fieldValue;
						self.updateContentPanel({
							story : self.mainController.aboutTimelineStory
						});
					}
					if (data.fieldName == "introImage") {
						self.mainController.aboutTimelineStory.images[0].src = data.fieldValue;
						self.updateContentPanel({
							story : self.mainController.aboutTimelineStory
						});
					}
					if (data.fieldName == "backgroundColour") {
						self.timeline.backgroundColour = data.fieldValue;
						$(self.mainController.domStageHolder).css({
							backgroundColor : "#" + data.fieldValue
						});
					}
					if (data.fieldName == "mainColour") {
						self.mainController.timeline.mainColour = data.fieldValue;
						self.mainController.selectedView.updateScaleColour({
							colour : data.fieldValue
						});
						$.each(self.timeline.markers, function() {
							if (this.category.autoGenerated) {
								this.category.colour = data.fieldValue;
								this.categoryHasChanged();
							}
						});
						if (self.timeline.viewType == "category-band") {
							self.mainController.defaultCategory.colour = data.fieldValue;
							var defaultBand = self.mainController.selectedView.categoryBandsByKey[self.mainController.categoriesKeyPrefix + "default"];
							if (defaultBand) {
								defaultBand.refreshFromCategory();
							}
						}
					}
					if (self.updateTimelineFormVerification.areValuesDifferentFromSavedValues()) {
						self.eventCatcherController.activate();
					} else {
						self.eventCatcherController.deactivate();
					}
				};
				self.updateTimelineFormVerification.onKeyUpCallback = function(data) {
					if (self.updateTimelineFormVerification.areValuesDifferentFromSavedValues()) {
						self.eventCatcherController.activate();
					} else {
						self.eventCatcherController.deactivate();
					}
				};
			},
			verifyTimelineFormDate : function(data) {
				var self = this;
				var verifier = data.verifier;
				var aDate = data.date;
				var dateType = data.dateType;
				var newTimeline = (verifier == self.timelineFormVerification);
				if (!aDate) {
					self.adminAlertController.displayMessage({
						headline : TLConfigText["dateVerificiation_Invalid_date"],
						body : '<p>' + TLConfigText["dateVerificiation_Invalid_date_message"] + '</p>',
						buttons : [ {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Continue'] + '</a>',
							action : function() {
							}
						} ]
					});
					verifier.restoreOldValueForField({
						fieldName : dateType
					});
					return false;
				} else if (self.isEndDateBeforeStartDateForVerifier({
					verifier : verifier
				})) {
					self.adminAlertController.displayMessage({
						headline : TLConfigText["dateVerificiation_Invalid_date"],
						body : '<p>' + TLConfigText["dateVerificiation_start_date_first_message"] + '</p>',
						buttons : [ {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Continue'] + '</a>',
							action : function() {
							}
						} ]
					});
					verifier.restoreOldValueForField({
						fieldName : dateType
					});
					return false;
				} else if (!self.isDateWithinAllowableRange({
					date : aDate
				})) {
					self.adminAlertController.displayMessage({
						headline : TLConfigText["dateVerificiation_Invalid_date"],
						body : '<p>' + TLConfigText["dateVerificiation_outside_range_message"] + '</p>',
						buttons : [ {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Continue'] + '</a>',
							action : function() {
							}
						} ]
					});
					verifier.restoreOldValueForField({
						fieldName : dateType
					});
					return false;
				} else if (self.doesDateCutOffMarkers({
					date : aDate,
					type : dateType
				}) && !newTimeline && self.timeline.feeds.length == 0) {
					self.adminAlertController.displayMessage({
						headline : TLConfigText["dateVerificiation_Story_outside_date_range"],
						body : '<p>' + TLConfigText["dateVerificiation_story_outside_range_message"] + '</p>',
						buttons : [ {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Continue'] + '</a>',
							action : function() {
							}
						} ]
					});
					verifier.restoreOldValueForField({
						fieldName : dateType
					});
					return false;
				}
				return true;
			},
			isEndDateBeforeStartDateForVerifier : function(data) {
				var self = this;
				var verifier = data.verifier;
				var startDate = Date.parse(verifier.getFieldValueFromName({
					fieldName : "startDate"
				}));
				var endDate = Date.parse(verifier.getFieldValueFromName({
					fieldName : "endDate"
				}));
				return startDate.getTime() > endDate.getTime();
			},
			doesDateCutOffMarkers : function(data) {
				var self = this;
				var aDate = data.date;
				var type = data.type;
				if (self.mainController.markers.length == 0) {
					return false;
				}
				var markerLowDate = self.mainController.markers[0].startDate;
				var markerHighDate = self.mainController.markers[self.mainController.markers.length - 1].startDate;
				if (type == "startDate" && aDate.getTime() > markerLowDate.getTime()) {
					return true;
				} else if (type == "endDate" && aDate.getTime() < markerHighDate.getTime()) {
					return true;
				} else {
					return false;
				}
			},
			isDateWithinAllowableRange : function() {
				var self = this;
				return true;
			},
			createMediaItemTitle : function(data) {
				var self = this;
				var mediaItem = data.mediaItem;
				var srcSplit = mediaItem.src.split("/");
				var srcBits = srcSplit.length;
				var srcText = (srcBits == 1) ? srcSplit[0] : srcSplit[srcBits - 2] + "/" + srcSplit[srcBits - 1];
				var maxSrcLength = 20;
				if (srcText.length > maxSrcLength) {
					var startPos = srcText.length - maxSrcLength;
					srcText = srcText.substr(startPos, srcText.length - 1);
				}
				var titleText = "(" + mediaItem.type + ") " + srcText;
				return titleText;
			},
			setupStoryMediaList : function() {
				var self = this;
				var lastSelectedStory = "";
				$(self.domStoryMediaMenuButton).click(
						function() {
							if (lastSelectedStory == self.selectedStory) {
								return;
							}
							lastSelectedStory = self.selectedStory;
							if (!self.storyMediaListController) {
								self.storyMediaListController = new AJKScrollableListController({
									domRoot : $(self.domRoot).find("#tl-tab-selected-story-extra-media .ajk-cs-carousel").get()[0],
									domStage : $(self.domRoot).find("#tl-tab-selected-story-extra-media .ajk-cs-carousel-stage").get()[0],
									listItems : self.selectedStory.media,
									createDomListItemFunc : function(data) {
										var mediaItem = data.listItem;
										var insertHTML = '<div mediaId="' + mediaItem.id + '" class="tl-ah-list-item">';
										insertHTML += '<div class="tl-ah-col-1">';
										insertHTML += '<p id="tl-media-item-' + mediaItem.id + '">' + self.createMediaItemTitle({
											mediaItem : mediaItem
										}) + '</p>';
										insertHTML += '</div>';
										insertHTML += '<div class="tl-ah-col-2">';
										insertHTML += '<a href="#">' + TLConfigText['adminBasic_Edit'] + '</a> | <a class="tl-ah-li-delete" href="#">'
												+ TLConfigText['adminBasic_Delete'] + '</a>';
										insertHTML += '</div>';
										insertHTML += '</div>';
										return $(insertHTML).get()[0];
									},
									listItemSelectClass : "tl-ah-list-item-selected",
									itemWasClickedFunc : function(data) {
										var mediaItem = data.listItem;
										var clickedElClass = data.clickedElClass;
										if (clickedElClass.indexOf("tl-ah-li-delete") != -1) {
											self.adminAlertController.displayMessage({
												headline : TLConfigText["media_deleteMedia_headline"],
												body : '<p>' + TLConfigText["media_deleteMedia_message"] + ' “' + self.createMediaItemTitle({
													mediaItem : mediaItem
												}) + '”?</p>',
												buttons : [ {
													html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_No'] + '</a>',
													action : function() {
													}
												}, {
													html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Yes'] + '</a>',
													action : function() {
														self.deleteMediaItem({
															mediaItem : mediaItem
														});
													}
												} ]
											});
										} else {
											self.selectMediaItem({
												mediaItem : mediaItem
											});
										}
									},
									getKeyForListItem : function(data) {
										var mediaItem = data.listItem;
										return mediaItem.id;
									},
									getPositionForListItem : function(data) {
										var mediaItem = data.listItem;
										return mediaItem.listPosition;
									}
								}).init();
							} else {
								self.storyMediaListController.resetWithNewListItems({
									listItems : self.selectedStory.media
								});
							}
						});
			},
			setupCategoryList : function() {
				var self = this;
				$("#tl-categories-tab-menu-item").click(
						function() {
							if (!self.categoriesListController) {
								self.categoriesListController = new AJKScrollableListController({
									domRoot : $(self.domRoot).find("#tab-my-selected-timeline-categories .ajk-cs-carousel").get()[0],
									domStage : $(self.domRoot).find("#tab-my-selected-timeline-categories .ajk-cs-carousel-stage").get()[0],
									listItems : self.getCategories(),
									createDomListItemFunc : function(data) {
										var categoryItem = data.listItem;
										var extraClass = (categoryItem.uneditable) ? " tl-ah-list-item-uneditable" : "";
										var insertHTML = '<div categoryId="' + categoryItem.id + '" class="tl-ah-list-item' + extraClass + '">';
										insertHTML += '<div class="tl-ah-col-1">';
										insertHTML += '<p id="tl-category-item-' + categoryItem.id + '">' + categoryItem.title + '</p>';
										insertHTML += '</div>';
										insertHTML += '<div class="tl-ah-col-2">';
										insertHTML += '<a href="#">' + TLConfigText['adminBasic_Edit'] + '</a> | <a class="tl-ah-li-delete" href="#">'
												+ TLConfigText['adminBasic_Delete'] + '</a>';
										insertHTML += '</div>';
										insertHTML += '</div>';
										return $(insertHTML).get()[0];
									},
									listItemSelectClass : "tl-ah-list-item-selected",
									itemWasClickedFunc : function(data) {
										var categoryItem = data.listItem;
										if (categoryItem.uneditable) {
											self.adminAlertController.displayMessage({
												headline : TLConfigText["feedCategory_cantEdit_headline"],
												body : '<p>' + TLConfigText["feedCategory_cantEdit_message"] + '</p>',
												buttons : [ {
													html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Continue'] + '</a>',
													action : function() {
													}
												} ]
											});
											return;
										}
										var clickedElClass = data.clickedElClass;
										if (clickedElClass.indexOf("tl-ah-li-delete") != -1) {
											self.adminAlertController.displayMessage({
												headline : TLConfigText["category_deleteCategory_headline"],
												body : '<p>' + TLConfigText["category_deleteCategory_message"] + ' “' + categoryItem.title + '”?</p>',
												buttons : [ {
													html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_No'] + '</a>',
													action : function() {
													}
												}, {
													html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Yes'] + '</a>',
													action : function() {
														self.deleteCategoryItem({
															categoryItem : categoryItem
														});
													}
												} ]
											});
										} else {
											self.selectCategoryItem({
												categoryItem : categoryItem
											});
										}
									},
									getKeyForListItem : function(data) {
										var categoryItem = data.listItem;
										return categoryItem.id;
									},
									getPositionForListItem : function(data) {
										var categoryItem = data.listItem;
										return categoryItem.listPosition;
									}
								}).init();
							}
						});
			},
			createNewCategoryItem : function() {
				var self = this;
				var newCategoryItem = {
					id : "awaitingId",
					title : TLConfigText["category_New_category"],
					colour : self.mainController.timeline.mainColour,
					order : 10,
					size : 10,
					layout : 0,
					rows : 3
				};
				self.categoriesListController.addListItemAtIndex({
					listItem : newCategoryItem,
					index : "last"
				});
				self.categoriesListController.showAndSelectListItem({
					listItem : newCategoryItem
				});
				self.selectCategoryItem({
					categoryItem : newCategoryItem
				});
			},
			deleteCategoryItem : function(data) {
				var self = this;
				var categoryItem = data.categoryItem;
				self.categoriesListController.removeListItem({
					listItem : categoryItem
				});
				var vars = {};
				vars["id"] = categoryItem.id;
				vars["timelineId"] = self.timeline.id;
				var action = "/admin/deletecategory/";
				self.updateContentPanel({
					story : self.selectedStory
				});
				if (categoryItem.id != "awaitingId") {
					theAJKAjaxController.request({
						action : action,
						method : "post",
						vars : vars,
						callback : function(xml) {
							if (self.timeline.viewType == "category-band") {
								self.refreshTimelineView();
							}
						}
					});
				}
				self.timeline.categories = AJKHelpers.removeItemFromArray({
					anArray : self.timeline.categories,
					item : categoryItem
				});
				self.updateCategoryLists();
				if (self.selectedCategoryItem == categoryItem) {
					self.hideCategoriesForm();
					self.selectedCategoryItem = "";
				}
				self.categoriesHaveChanged();
				self.eventCatcherController.deactivate();
				$.each(self.mainController.markers, function() {
					if (this.category == categoryItem) {
						this.category = self.mainController.defaultCategory;
						this.clear3DText();
					}
				});
				self.refreshUserControlsView({
					view : "category"
				});
				self.mainController.selected3DView.redisplay();
			},
			categoriesHaveChanged : function() {
				var self = this;
				self.categoriesListController.resetWithNewListItems({
					listItems : self.getCategories()
				});
			},
			getCategories : function() {
				var self = this;
				var retArray = [];
				$.each(self.timeline.categories, function() {
					if (!this.autoGenerated) {
						retArray.push(this);
					}
				});
				return retArray;
			},
			createNewMediaItem : function() {
				var self = this;
				var newMediaItem = self.selectedStory.createNewMediaItem();
				self.storyMediaListController.addListItemAtIndex({
					listItem : newMediaItem,
					index : "last"
				});
				self.storyMediaListController.showAndSelectListItem({
					listItem : newMediaItem
				});
				self.selectMediaItem({
					mediaItem : newMediaItem
				});
			},
			deleteMediaItem : function(data) {
				var self = this;
				var mediaItem = data.mediaItem;
				self.storyMediaListController.removeListItem({
					listItem : mediaItem
				});
				self.selectedStory.deleteMediaItem({
					mediaItem : mediaItem
				});
				if (self.selectedMediaItem == mediaItem) {
					self.hideStoryMediaForm();
					self.selectedMediaItem = "";
				}
				self.updateContentPanel({
					story : self.selectedStory
				});
				self.eventCatcherController.deactivate();
			},
			deleteStory : function(data) {
				var self = this;
				var story = data.story;
				self.storyListController.removeListItem({
					listItem : story
				});
				self.mainController.deleteMarker({
					marker : story
				});
				if (self.selectedStory == story) {
					self.hideStoryForm();
					self.selectedStory = "";
				}
				self.updateContentPanel({
					deletedStory : story,
					story : story
				});
				self.eventCatcherController.deactivate();
				self.mainController.selected3DView.redisplayAfterDataChange();
				if (self.timeline.viewType == "category-band") {
					self.refreshTimelineView();
				}
			},
			createNewStory : function() {
				var self = this;
				var newStory = self.mainController.createNewMarker();
				self.storyListController.addListItemAtIndex({
					listItem : newStory,
					index : newStory.orderIndex
				});
				self.mainController.selected3DView.redisplayAfterDataChange();
				self.selectStory({
					story : newStory,
					isNewStory : true
				});
			},
			hideStoryForm : function() {
				var self = this;
				$(self.domSelectedTimelineStoryTab).removeClass("tl-ah-show-view-timeline-story-selected");
			},
			hideStoryMediaForm : function() {
				var self = this;
				$(self.domStoryMediaTab).removeClass("tl-ah-show-view-media-story-selected");
			},
			hideCategoriesForm : function() {
				var self = this;
				$(self.domCategoriesForm).css({
					display : "none"
				});
			},
			timelineBasicInfoPanelOpened : function() {
				var self = this;
				self.eventCatcherController.setupAction({
					domCutOffEl : self.domUpdateTimelineForm,
					clickFunc : function() {
						self.adminAlertController.displayMessage({
							headline : TLConfigText["timelineForm_unsavedChanges_headline"],
							body : '<p>' + TLConfigText["timelineForm_unsavedChanges_message"] + '</p>',
							buttons : [ {
								html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Save'] + '</a>',
								action : function() {
									self.updateTimelineFormVerification.fireButton({
										buttonType : "save"
									});
								}
							}, {
								html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Revert'] + '</a>',
								action : function() {
									self.updateTimelineFormVerification.fireButton({
										buttonType : "revert"
									});
								}
							} ]
						});
					}
				});
			},
			categoryPanelOpened : function() {
				var self = this;
				self.eventCatcherController.setupAction({
					domCutOffEl : self.domCategoriesForm,
					clickFunc : function() {
						if (self.selectedCategoryItem.id != "awaitingId") {
							self.adminAlertController.displayMessage({
								headline : TLConfigText["category_unsavedChanges_headline"],
								body : '<p>' + TLConfigText["category_unsavedChanges_message1"] + ' “' + self.selectedCategoryItem.title + '”. '
										+ TLConfigText["category_unsavedChanges_message2"] + '</p>',
								buttons : [ {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Save'] + '</a>',
									action : function() {
										self.categoriesFormVerifier.fireButton({
											buttonType : "save"
										});
									}
								}, {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Revert'] + '</a>',
									action : function() {
										self.categoriesFormVerifier.fireButton({
											buttonType : "revert"
										});
									}
								} ]
							});
						} else {
							self.adminAlertController.displayMessage({
								headline : TLConfigText["category_unsavedCategory_headline"],
								body : '<p>' + TLConfigText["category_unsavedCategory_message1"] + ' “' + self.selectedCategoryItem.title + '”. '
										+ TLConfigText["category_unsavedCategory_message2"] + '</p>',
								buttons : [ {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Save'] + '</a>',
									action : function() {
										self.categoriesFormVerifier.fireButton({
											buttonType : "save"
										});
									}
								}, {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Delete'] + '</a>',
									action : function() {
										self.categoriesFormVerifier.fireButton({
											buttonType : "cancel"
										});
									}
								} ]
							});
						}
					}
				});
			},
			selectCategoryItem : function(data) {
				var self = this;
				var categoryItem = data.categoryItem;
				var oldCategoryItem = self.selectedCategoryItem;
				self.selectedCategoryItem = categoryItem;
				self.categoriesListController.selectListItem({
					listItem : categoryItem
				});
				self.categoryPanelOpened();
				if (self.selectedCategoryItem != oldCategoryItem) {
					$(self.domSelectedCategoryTitle).text(self.selectedCategoryItem.title);
					$(self.domCategoriesForm).css({
						display : "block"
					});
					self.categoriesFormVerifier.onChangeCallback = "";
					self.categoriesFormVerifier.onKeyUpCallback = "";
					self.categoriesFormVerifier.setFieldValues({
						fieldValues : {
							title : categoryItem.title,
							colour : categoryItem.colour,
							order : categoryItem.order,
							size : categoryItem.size,
							layout : categoryItem.layout,
							rows : categoryItem.rows
						}
					});
					if (self.selectedCategoryItem.id != "awaitingId") {
						self.categoriesFormVerifier.hideCancelButton();
						self.categoriesFormVerifier.showRevertButton();
						self.categoriesFormVerifier.disableSaveAndRevert();
						self.categoriesFormVerifier.saveFieldValues();
					} else {
						self.categoriesFormVerifier.hideRevertButton();
						self.categoriesFormVerifier.showCancelButton();
						self.categoriesFormVerifier.enableSaveAndRevert();
						self.eventCatcherController.activate();
					}
					self.categoriesFormVerifier.onChangeCallback = function(data) {
						self.updateCategoryValue(data);
						if (self.categoriesFormVerifier.areValuesDifferentFromSavedValues()) {
							self.eventCatcherController.activate();
						} else {
							self.eventCatcherController.deactivate();
						}
					};
					self.categoriesFormVerifier.onKeyUpCallback = function(data) {
						if (data.fieldName == "title") {
							self.updateCategoryValue(data);
						}
						if (self.categoriesFormVerifier.areValuesDifferentFromSavedValues()) {
							self.eventCatcherController.activate();
						} else {
							self.eventCatcherController.deactivate();
						}
					};
				}
			},
			storyBasicInfoPanelOpened : function() {
				var self = this;
				self.lastOpenedSectionTab["section-story"] = "story-basic-info";
				self.eventCatcherController.setupAction({
					domCutOffEl : self.domStoryForm,
					clickFunc : function() {
						if (self.selectedStory.id) {
							self.adminAlertController.displayMessage({
								headline : TLConfigText["story_unsavedChanges_headline"],
								body : '<p>' + TLConfigText["story_unsavedChanges_message1"] + ' “' + self.selectedStory.headline + '”. '
										+ TLConfigText["story_unsavedChanges_message2"] + '</p>',
								buttons : [ {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Save'] + '</a>',
									action : function() {
										self.storyFormVerifier.fireButton({
											buttonType : "save"
										});
									}
								}, {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Revert'] + '</a>',
									action : function() {
										self.storyFormVerifier.fireButton({
											buttonType : "revert"
										});
									}
								} ]
							});
						} else {
							self.adminAlertController.displayMessage({
								headline : TLConfigText["story_unsavedStory_headline"],
								body : '<p>' + TLConfigText["story_unsavedStory_message1"] + ' “' + self.selectedStory.headline + '”. '
										+ TLConfigText["story_unsavedStory_message2"] + '</p>',
								buttons : [ {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Save'] + '</a>',
									action : function() {
										self.storyFormVerifier.fireButton({
											buttonType : "save"
										});
									}
								}, {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Delete'] + '</a>',
									action : function() {
										self.storyFormVerifier.fireButton({
											buttonType : "cancel"
										});
									}
								} ]
							});
						}
					}
				});
			},
			selectStory : function(data) {
				var self = this;
				var story = data.story;
				var oldStory = self.selectedStory;
				var cancelCentering = (data && data.cancelCentering) ? true : false;
				self.selectedStory = story;
				$(self.domStoryBasicInfoTabButton).click();
				self.storyBasicInfoPanelOpened();
				if (story == oldStory) {
				}
				$(self.domSelectedTimelineStoryTab).addClass("tl-ah-show-view-timeline-story-selected");
				self.storyListController.resetHeightTo({
					height : self.reducedListHeight
				});
				if (!cancelCentering) {
					self.mainController.focusMarker({
						marker : story
					});
				}
				self.storyListController.showAndSelectListItem({
					listItem : self.selectedStory,
					instantly : true
				});
				setTimeout(function() {
					self.helpController.setBaseHelpByName({
						baseName : "selected-story"
					});
				}, 1);
				if (self.selectedStory != oldStory) {
					if (self.contentPanelController.panelVisible) {
						self.contentPanelController.displayForStory({
							story : self.selectedStory
						});
					}
					$(self.domSelectedStoryHeadline).text(story.headline);
					$(self.domStoryMediaTab).removeClass("tl-ah-show-view-media-story-selected");
					self.selectedMediaItem = "";
					self.storyFormVerifier.onChangeCallback = "";
					self.storyFormVerifier.onKeyUpCallback = "";
					self.storyFormVerifier.setFieldValues({
						fieldValues : {
							title : story.headline,
							startDate : AJKHelpers.formatDate({
								formatString : "DD MMM YYYY HH:mm:ss",
								date : story.startDate,
								language : "base"
							}),
							endDate : AJKHelpers.formatDate({
								formatString : "DD MMM YYYY HH:mm:ss",
								date : story.endDate,
								language : "base"
							}),
							text : story.introText,
							category : story.category.id,
							externalLink : story.externalLink,
							dateFormat : story.dateFormat
						}
					});
					if (self.selectedStory.id) {
						self.storyFormVerifier.hideCancelButton();
						self.storyFormVerifier.showRevertButton();
						self.storyFormVerifier.disableSaveAndRevert();
						self.storyFormVerifier.saveFieldValues();
					} else {
						self.storyFormVerifier.hideRevertButton();
						self.storyFormVerifier.showCancelButton();
						self.storyFormVerifier.enableSaveAndRevert();
						self.eventCatcherController.activate();
					}
					var updateStoryFormEventCatcher = function() {
						if (self.storyFormVerifier.areValuesDifferentFromSavedValues()) {
							self.eventCatcherController.activate();
						} else {
							self.eventCatcherController.deactivate();
						}
					};
					self.storyFormVerifier.onChangeCallback = function(data) {
						if (data.fieldName == "startDate") {
							var oldStoryDate = new Date();
							oldStoryDate.setTime(story.startDate.getTime());
							var startDate = Date.parse(data.fieldValue);
							if (!self.isStoryStartDateInTimelineRange({
								startDate : startDate
							})) {
								return;
							}
							self.updateStoryValue(data);
							updateStoryFormEventCatcher();
							self.syncStoryStartEndDates({
								oldStoryStartDate : oldStoryDate
							});
							self.mainController.sortMarkersList();
							self.storyListController.resetWithNewListItems({
								listItems : self.timeline.markers
							});
							self.storyListController.showAndSelectListItem({
								listItem : story,
								instantly : true
							});
							self.mainController.updateMarkersImageSize();
						} else {
							self.updateStoryValue(data);
							updateStoryFormEventCatcher();
						}
						if (data.fieldName == "category" && self.timeline.viewType == "category-band") {
							self.refreshTimelineView();
						}
					};
					self.storyFormVerifier.onKeyUpCallback = function(data) {
						if (data.fieldName == "title" || data.fieldName == "text") {
							self.updateStoryValue(data);
						}
						updateStoryFormEventCatcher();
					};
					self.storyFormExtraInfoVerifier.setFieldValues({
						fieldValues : {
							fullText : ""
						}
					});
					var updateExtraInfoFields = function() {
						self.storyFormExtraInfoVerifier.setFieldValues({
							fieldValues : {
								fullText : self.selectedStory.fullText
							}
						});
						self.storyFormExtraInfoVerifier.saveFieldValues();
						self.storyFormExtraInfoVerifier.disableSaveAndRevert();
					};
					if (!self.selectedStory.extraInfoLoaded) {
						self.selectedStory.loadExtraInfo({
							callback : function() {
								updateExtraInfoFields();
							}
						});
					} else {
						updateExtraInfoFields();
					}
				}
				return true;
			},
			syncStoryStartEndDates : function(data) {
				var self = this;
				var oldStoryStartDate = data.oldStoryStartDate;
				var startDate = Date.parse(self.storyFormVerifier.getFieldValueFromName({
					fieldName : "startDate"
				}));
				var endDate = Date.parse(self.storyFormVerifier.getFieldValueFromName({
					fieldName : "endDate"
				}));
				if (!startDate || !endDate) {
					return;
				}
				if (endDate.getTime() < startDate.getTime() || endDate.getTime() == oldStoryStartDate.getTime()) {
					var newEndDate = AJKHelpers.formatDate({
						formatString : "DD MMM YYYY HH:mm:ss",
						date : startDate,
						language : "base"
					});
					if (endDate.getTime() != startDate.getTime()) {
						self.storyFormVerifier.setFieldValues({
							fieldValues : {
								endDate : newEndDate
							},
							forceChangeEvent : true
						});
					}
				}
			},
			isStoryStartDateInTimelineRange : function(data) {
				var self = this;
				var startDate = data.startDate;
				if (!startDate) {
					return false;
				}
				if (!self.isDateWithinAllowableRange({
					date : startDate
				})) {
					self.adminAlertController.displayMessage({
						headline : TLConfigText["storyDate_outsideTimeline_headline"],
						body : "<p>" + TLConfigText["storyDate_outsideTimeline_message"] + "</p>",
						buttons : [ {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Continue'] + '</a>',
							action : function() {
								self.storyFormVerifier.restoreOldValueForField({
									fieldName : "startDate"
								});
							}
						} ]
					});
					return false;
				} else if (startDate.getTime() < self.timeline.startDate.getTime() || startDate.getTime() > self.timeline.endDate.getTime()) {
					self.adminAlertController.displayMessage({
						headline : TLConfigText["storyDate_outsideTimeline2_headline"],
						body : TLConfigText["storyDate_outsideTimeline2_message"],
						buttons : [ {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Yes'] + '</a>',
							action : function() {
								if (startDate.getTime() < self.timeline.startDate.getTime()) {
									self.timeline.startDate = startDate;
									self.updateTimelineFormVerification.setFieldValues({
										forceChangeEvent : true,
										fieldValues : {
											startDate : AJKHelpers.formatDate({
												formatString : "DD MMM YYYY HH:mm:ss",
												date : self.timeline.startDate,
												language : "base"
											})
										}
									});
								} else {
									self.timeline.endDate = startDate;
									self.updateTimelineFormVerification.setFieldValues({
										forceChangeEvent : true,
										fieldValues : {
											endDate : AJKHelpers.formatDate({
												formatString : "DD MMM YYYY HH:mm:ss",
												date : self.timeline.endDate,
												language : "base"
											})
										}
									});
								}
								self.updateTimelineFormVerification.fireButton({
									buttonType : "save"
								});
								self.refreshTimelineZoomSelector();
								self.updateStoryValue({
									fieldName : "startDate",
									fieldValue : AJKHelpers.formatDate({
										formatString : "DD MMM YYYY HH:mm:ss",
										date : startDate,
										language : "base"
									})
								});
								self.storyFormVerifier.fireButton({
									buttonType : "save"
								});
								self.mainController.updateViewsWithNewDateRangeAndZoom({
									zoom : self.timeline.zoom
								});
							}
						}, {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_No'] + '</a>',
							action : function() {
								self.storyFormVerifier.restoreOldValueForField({
									fieldName : "startDate"
								});
								if (!self.storyFormVerifier.areValuesDifferentFromSavedValues()) {
									self.eventCatcherController.deactivate();
								}
							}
						} ]
					});
					return false;
				}
				return true;
			},
			storyExtraInfoPanelOpened : function() {
				var self = this;
				self.eventCatcherController.setupAction({
					domCutOffEl : self.domStoryExtraInfoForm,
					clickFunc : function() {
						self.adminAlertController.displayMessage({
							headline : TLConfigText["storyExtraInfo_unsavedChanges_headline"],
							body : '<p>' + TLConfigText["storyExtraInfo_unsavedChanges_message1"] + ' “' + self.selectedStory.headline + '”. '
									+ TLConfigText["storyExtraInfo_unsavedChanges_message2"] + '</p>',
							buttons : [ {
								html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Save'] + '</a>',
								action : function() {
									self.storyFormExtraInfoVerifier.fireButton({
										buttonType : "save"
									});
								}
							}, {
								html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Revert'] + '</a>',
								action : function() {
									self.storyFormExtraInfoVerifier.fireButton({
										buttonType : "revert"
									});
								}
							} ]
						});
					}
				});
				self.storyFormExtraInfoVerifier.onKeyUpCallback = function(data) {
					if (self.storyFormExtraInfoVerifier.areValuesDifferentFromSavedValues()) {
						self.eventCatcherController.activate();
					} else {
						self.storyFormExtraInfoVerifier.deactivate();
					}
				};
			},
			storyMediaPanelOpened : function() {
				var self = this;
				self.eventCatcherController.setupAction({
					domCutOffEl : self.domStoryMediaForm,
					clickFunc : function() {
						if (self.selectedMediaItem.id != "awaitingId") {
							self.adminAlertController.displayMessage({
								headline : TLConfigText["storyMedia_unsavedChanges1_headline"],
								body : '<p>' + TLConfigText["storyMedia_unsavedChanges1_message1"] + ' “' + self.createMediaItemTitle({
									mediaItem : self.selectedMediaItem
								}) + '”. ' + TLConfigText["storyMedia_unsavedChanges1_message2"] + '</p>',
								buttons : [ {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Save'] + '</a>',
									action : function() {
										self.storyMediaFormVerifier.fireButton({
											buttonType : "save"
										});
									}
								}, {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Revert'] + '</a>',
									action : function() {
										self.storyMediaFormVerifier.fireButton({
											buttonType : "revert"
										});
									}
								} ]
							});
						} else {
							self.adminAlertController.displayMessage({
								headline : TLConfigText["storyMedia_unsavedChanges2_headline"],
								body : '<p>' + TLConfigText["storyMedia_unsavedChanges2_message1"] + ' “' + self.createMediaItemTitle({
									mediaItem : self.selectedMediaItem
								}) + '”. ' + TLConfigText["storyMedia_unsavedChanges2_message2"] + '</p>',
								buttons : [ {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Save'] + '</a>',
									action : function() {
										self.storyMediaFormVerifier.fireButton({
											buttonType : "save"
										});
									}
								}, {
									html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Delete'] + '</a>',
									action : function() {
										self.storyMediaFormVerifier.fireButton({
											buttonType : "cancel"
										});
									}
								} ]
							});
						}
					}
				});
			},
			loadMediaThumb : function(data) {
				var self = this;
				var mediaItem = data.mediaItem;
				var thumbImage = (mediaItem.type == "Image") ? mediaItem.src : mediaItem.externalMediaThumb;
				thumbImage = AJKHelpers.getTimelineImageUrl({
					src : thumbImage
				});
				$(self.domStoryMediaThumb).empty();
				if (thumbImage && thumbImage != TLConfigText['marker_media_Enter_meda_source_here']) {
					new AJKImageLoader({
						imageUrl : thumbImage,
						loadCallback : function(data) {
							if (self.selectedMediaItem == mediaItem) {
								var domImage = data.image;
								$(self.domStoryMediaThumb).empty().append(domImage);
								AJKHelpers.sizeImageToFitInBoxOfSize({
									domImage : domImage,
									boxSize : {
										width : 30,
										height : 30
									},
									imageOffset : mediaItem.thumbPosition
								});
							}
						}
					}).init();
				}
			},
			selectMediaItem : function(data) {
				var self = this;
				var mediaItem = data.mediaItem;
				var oldMediaItem = self.selectedMediaItem;
				self.selectedMediaItem = mediaItem;
				self.storyMediaListController.selectListItem({
					listItem : mediaItem
				});
				if (mediaItem.type == "Image") {
					$(self.domStoryMediaForm).find("#tl-ah-media-source-field").removeClass("tl-ah-image-field-hide-button");
					$(self.domStoryMediaForm).find("#tl-ah-video-thumb-field").css({
						display : "none"
					});
				} else {
					$(self.domStoryMediaForm).find("#tl-ah-media-source-field").addClass("tl-ah-image-field-hide-button");
					$(self.domStoryMediaForm).find("#tl-ah-video-thumb-field").css({
						display : "block"
					});
				}
				if (self.selectedMediaItem != oldMediaItem) {
					$(self.domSelectedStoryMediaHeadline).text(self.createMediaItemTitle({
						mediaItem : self.selectedMediaItem
					}));
					$(self.domStoryMediaTab).addClass("tl-ah-show-view-media-story-selected");
					self.loadMediaThumb({
						mediaItem : mediaItem
					});
					self.storyMediaFormVerifier.onChangeCallback = "";
					self.storyMediaFormVerifier.onKeyUpCallback = "";
					self.storyMediaFormVerifier.setFieldValues({
						fieldValues : {
							type : mediaItem.type,
							orderIndex : mediaItem.orderIndex,
							src : mediaItem.src,
							caption : mediaItem.caption,
							video_thumb : (mediaItem.type == "Image") ? "" : mediaItem.externalMediaThumb,
							thumbPosition : mediaItem.thumbPosition
						}
					});
					if (self.selectedMediaItem.id != "awaitingId") {
						self.storyMediaFormVerifier.hideCancelButton();
						self.storyMediaFormVerifier.showRevertButton();
						self.storyMediaFormVerifier.disableSaveAndRevert();
						self.storyMediaFormVerifier.saveFieldValues();
					} else {
						self.storyMediaFormVerifier.hideRevertButton();
						self.storyMediaFormVerifier.showCancelButton();
						self.storyMediaFormVerifier.enableSaveAndRevert();
						self.eventCatcherController.activate();
						self.storyMediaFormVerifier.clearSavedFieldValues();
					}
					self.storyMediaFormVerifier.onChangeCallback = function(data) {
						self.updateMediaValue(data);
						if (self.storyMediaFormVerifier.areValuesDifferentFromSavedValues()) {
							self.eventCatcherController.activate();
						} else {
							self.eventCatcherController.deactivate();
						}
						if (data.fieldName == "src" && self.selectedMediaItem.type == "Image") {
							self.loadMediaThumb({
								mediaItem : self.selectedMediaItem
							});
						}
						if (data.fieldName == "video_thumb" && (self.selectedMediaItem.type == "Video" || self.selectedMediaItem.type == "Audio")) {
							self.selectedMediaItem.externalMediaThumb = data.fieldValue;
							self.loadMediaThumb({
								mediaItem : self.selectedMediaItem
							});
							self.selectedStory.mediaHasBeenUpdated();
						}
						if (data.fieldName == "type" && data.fieldValue == "Image") {
							$(self.domStoryMediaForm).find("#tl-ah-media-source-field").removeClass("tl-ah-image-field-hide-button");
							$(self.domStoryMediaForm).find("#tl-ah-video-thumb-field").css({
								display : "none"
							});
						} else if (data.fieldName == "type" && (data.fieldValue == "Video" || data.fieldValue == "Audio")) {
							$(self.domStoryMediaForm).find("#tl-ah-media-source-field").addClass("tl-ah-image-field-hide-button");
							$(self.domStoryMediaForm).find("#tl-ah-video-thumb-field").css({
								display : "block"
							});
						}
					};
					self.storyMediaFormVerifier.onKeyUpCallback = function(data) {
						if (data.fieldName == "caption") {
							self.updateMediaValue(data);
						}
						if (self.storyMediaFormVerifier.areValuesDifferentFromSavedValues()) {
							self.eventCatcherController.activate();
						} else {
							self.eventCatcherController.deactivate();
						}
					};
				}
			},
			updateCategoryValue : function(data) {
				var self = this;
				var fieldName = data.fieldName;
				var fieldValue = data.fieldValue;
				self.selectedCategoryItem[fieldName] = fieldValue;
				if (fieldName == "title") {
					$(self.domSelectedCategoryTitle).text(self.selectedCategoryItem.title);
					$("#tl-category-item-" + self.selectedCategoryItem.id).text(self.selectedCategoryItem.title);
				}
			},
			updateMediaValue : function(data) {
				var self = this;
				var fieldName = data.fieldName;
				var fieldValue = data.fieldValue;
				self.selectedMediaItem[fieldName] = fieldValue;
				var itemTitle = self.createMediaItemTitle({
					mediaItem : self.selectedMediaItem
				});
				$(self.domSelectedStoryMediaHeadline).text(itemTitle);
				self.selectedStory.mediaHasBeenUpdated();
				if (fieldName == "src" || fieldName == "type") {
					$("#tl-media-item-" + self.selectedMediaItem.id).text(itemTitle);
				}
			},
			updateStoryValue : function(data) {
				var self = this;
				var fieldName = data.fieldName;
				var fieldValue = data.fieldValue;
				switch (fieldName) {
				case "title":
					self.selectedStory.setValue({
						valueName : "headline",
						value : fieldValue
					});
					var titleText = AJKHelpers.prepareGTLTForText({
						content : self.selectedStory.headline
					});
					$(self.domSelectedStoryHeadline).text(titleText);
					$("#admin-story-list-item-title-" + self.selectedStory.markerKey).text(titleText);
					break;
				case "text":
					self.selectedStory.setValue({
						valueName : "introText",
						value : fieldValue
					});
					break;
				case "startDate":
					self.selectedStory.setValue({
						valueName : "startDate",
						value : Date.parse(fieldValue)
					});
					break;
				case "endDate":
					self.selectedStory.setValue({
						valueName : "endDate",
						value : Date.parse(fieldValue)
					});
					break;
				default:
					self.selectedStory.setValue({
						valueName : fieldName,
						value : fieldValue
					});
					break;
				}
			},
			updateContentPanel : function(data) {
				var self = this;
				var forceUpdate = (data) ? data.forceUpdate : false;
				var storyDeleted = (data) ? data.storyDeleted : false;
				var story = data.story;
				if (storyDeleted && self.contentPanelController.panelVisible && storyDeleted == self.contentPanelController.selectedStory) {
					self.contentPanelController.hide();
				} else if (self.contentPanelController.panelVisible && (story == self.contentPanelController.selectedStory || forceUpdate)) {
					self.mainController.contentPanelController.displayForStory({
						story : story,
						cancelGalleryTransition : true
					});
				}
			},
			refreshStoryPositions : function() {
				var self = this;
				var selectedView = self.mainController.selectedView;
				selectedView.generateMarkerSizeAndPositions();
				selectedView.refreshDisplayMarkers();
			},
			createFieldHTML : function() {
				var self = this;
				var insertHTML = '<div class="tl-ah-input">';
				insertHTML += '<div class="tl-ah-f-inner">';
				insertHTML += '<input class="ajk-verifier-control" value="" />';
				insertHTML += '</div>';
				insertHTML += '<div class="tl-ah-f-right"></div>';
				return insertHTML;
			},
			setupEmbed : function() {
				var self = this;
				var domEmbedTabButton = $(self.domRoot).find("#tl-ah-embed-timeline").get()[0];
				if (self.mainController.user.accountType == "Standard") {
					$(domEmbedTabButton).click(function() {
						self.promotionPanel.show({
							oneOffClass : "tl-pp-show-account-message-" + self.mainController.user.accountType.toLowerCase()
						});
						return false;
					});
				} else {
					var embedLightbox = "";
					var domEmbedContent = $("#tl-ah-embed-form").get()[0];
					$(domEmbedTabButton).click(function() {
						if (!embedLightbox) {
							embedLightbox = new TLAdminLightbox({
								domClass : "tl-ah-embed-lightbox",
								title : TLConfigText["embed_title"],
								intro : "",
								domContent : domEmbedContent
							}).init();
						}
						embedLightbox.openPanel();
						return false;
					});
					var previewEmbed = "";
					self.embedVerifier = new AJKVerifier({
						domRootEl : domEmbedContent,
						submitFunc : function(data) {
							window.open(previewEmbed);
						}
					}).init();
					self.embedVerifier.onKeyUpCallback = function(data) {
						var embHeight = self.embedVerifier.getFieldValueFromName({
							fieldName : "height"
						});
						var embWidth = self.embedVerifier.getFieldValueFromName({
							fieldName : "width"
						});
						var embSrc = 'http://' + self.timeline.host + '/timeline/embed/' + self.timeline.id + '/' + self.timeline.embedHash + '/';
						previewEmbed = 'http://' + self.timeline.host + '/previewembed/entry/' + self.timeline.id + '/' + self.timeline.embedHash + '/' + embWidth + '/'
								+ embHeight + '/';
						var embedCode = '<iframe frameborder="0" style="border-width:0;" id="tl-timeline-iframe" width="' + embWidth + '" height="' + embHeight + '" src="'
								+ embSrc + '"></iframe>' + "\n";
						embedCode += '<script type="text/javascript">' + "\n";
						embedCode += 'if (window.postMessage) {' + "\n";
						embedCode += 'var tlMouseupFunc = function() {' + "\n";
						embedCode += 'var tlFrame = document.getElementById("tl-timeline-iframe");' + "\n";
						embedCode += 'if (tlFrame.contentWindow && tlFrame.contentWindow.postMessage) {' + "\n";
						embedCode += 'tlFrame.contentWindow.postMessage("mouseup","*");' + "\n";
						embedCode += '}' + "\n";
						embedCode += '}' + "\n";
						embedCode += 'if (typeof window.addEventListener != "undefined") {' + "\n";
						embedCode += 'window.addEventListener("mouseup", tlMouseupFunc, false);' + "\n";
						embedCode += '}' + "\n";
						embedCode += 'else if (typeof window.attachEvent != "undefined") {' + "\n";
						embedCode += 'window.attachEvent("onmouseup", tlMouseupFunc);' + "\n";
						embedCode += '}' + "\n";
						embedCode += '}' + "\n";
						embedCode += '</script>' + "\n";
						self.embedVerifier.setFieldValues({
							fieldValues : {
								"embed" : embedCode
							}
						});
					};
					self.embedVerifier.onKeyUpCallback();
				}
			}
		});