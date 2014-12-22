var TLAdminLightbox = function(data) {
	var self = this;
	self.domClass = data.domClass;
	self.domContent = data.domContent;
	self.title = data.title;
	self.intro = data.intro;
	self.panelHeight = "";
	self.closeCallback = data.closeCallback;
};
TLAdminLightbox.panelPrototype = "";
TLAdminLightbox.prototype = {
	init : function() {
		var self = this;
		self.domRoot = $(TLAdminLightbox.panelPrototype).clone().get()[0];
		$(TLAdminLightbox.panelPrototype).after(self.domRoot);
		self.domFade = $(self.domRoot).find(".ajk-ah-fis-fade").get()[0];
		self.domMainTitle = $(self.domRoot).find(".ajk-fis-header-title").get()[0];
		self.domMainIntro = $(self.domRoot).find(".ajk-fis-header-intro").get()[0];
		self.domClose = $(self.domRoot).find(".ajk-fis-close").get()[0];
		self.domPanel = $(self.domRoot).find(".ajk-fis-panel").get()[0];
		if (self.domClass) {
			$(self.domRoot).addClass(self.domClass);
		}
		self.domPanelSpecificContent = $(self.domRoot).find(".tl-panel-specific-content").get()[0];
		$(self.domPanelSpecificContent).append(self.domContent);
		$(self.domMainTitle).html(self.title);
		if (!self.intro) {
			$(self.domMainIntro).css({
				display : "none"
			});
		} else {
			$(self.domMainIntro).html(self.intro);
		}
		$(self.domClose).click(function() {
			self.closePanel();
			return false;
		});
		$(self.domFade).click(function() {
			self.closePanel();
		});
		return self;
	},
	openPanel : function() {
		var self = this;
		theAJKWindowResizeEvent.registerAsObserver({
			observer : self
		});
		$(self.domRoot).css({
			visibility : "hidden",
			display : "block"
		});
		var viewportSize = AJKHelpers.viewportSize();
		self.sizeComponents({
			viewportSize : viewportSize
		});
		$(self.domRoot).css({
			visibility : "visible"
		});
		TLAdminLightbox.aBoxIsOpen = true;
	},
	closePanel : function() {
		var self = this;
		$(self.domRoot).css({
			display : "none"
		});
		theAJKWindowResizeEvent.removeAsObserver({
			observer : self
		});
		if (self.closeCallback) {
			self.closeCallback();
		}
		TLAdminLightbox.aBoxIsOpen = false;
	},
	windowDidResize : function(data) {
		var self = this;
		var newSize = data.newSize;
		self.sizeComponents({
			viewportSize : newSize
		});
	},
	sizeComponents : function(data) {
		var self = this;
		var viewportSize = data.viewportSize;
		$(self.domRoot).css({
			width : viewportSize.width,
			height : viewportSize.height
		});
		self.panelHeight = (self.panelHeight) ? self.panelHeight : $(self.domPanel).height();
		$(self.domPanel).css({
			top : parseInt(viewportSize.height - self.panelHeight) / 2
		});
	}
};
TLMainController.prototype.launchAdmin = function() {
	var self = this;
	$("body").addClass("tl-container-logged-in");
	if (self.user.secretUser) {
		self.user.timelines.push(self.timeline);
		self.user.timelinesByKey[self.timeline.id] = self.timeline;
		setTimeout(function() {
			self.initialiseAdmin();
		}, 100);
	} else {
		theAJKAjaxController.request({
			action : "/admin/getusertimelines",
			method : "post",
			vars : {
				userId : self.user.id
			},
			callback : function(xml) {
				$(xml).find("timeline").each(function() {
					var aTimeline = {
						urlFriendlyTitle : $(this).find("urlFriendlyTitle").text(),
						title : $(this).find("title").text(),
						secretWord : $(this).find("secretWord").text(),
						id : $(this).find("id").text()
					};
					self.user.timelines.push(aTimeline);
					self.user.timelinesByKey[aTimeline.id] = aTimeline;
				});
				self.initialiseAdmin();
			}
		});
	}
};
TLMainController.prototype.setLanguage = function(data) {
	var self = this;
	var language = data.language;
	$(self.domMainHolder).removeClass("tl-language-" + self.timeline.language);
	self.timeline.language = language;
	$(self.domMainHolder).addClass("tl-language-" + self.timeline.language);
	self.initLanguage();
};
TLMainController.prototype.initialiseAdmin = function() {
	var self = this;
	self.timeline.lazyLoadingActive = false;
	self.adminController = new TLAdminController({
		domRoot : $("#tl-admin-holder").get()[0],
		domAdminTab : $("#tl-admin-main-tab").get()[0],
		user : self.user,
		mainController : self,
		timeline : self.timeline
	}).init();
};
TLMainController.prototype.createNewMarker = function() {
	var self = this;
	var selectedDate = theTLSettings.currentDate;
	if (self.timeline.markerSpacing == "equal" && self.selectedView) {
		selectedDate = self.selectedView.getEqualSpacingDateFromStandardDate({
			aDate : selectedDate
		});
	}
	var startDateTime = (selectedDate.getTime() < self.timeline.startDate.getTime()) ? self.timeline.startDate : selectedDate;
	startDateTime = (startDateTime.getTime() > self.timeline.endDate.getTime()) ? self.timeline.endDate : startDateTime;
	var newMarker = self.createMarker({
		id : "",
		ownerId : self.user.id,
		ownerName : (self.user.secretUser) ? self.user.username : "",
		startDate : AJKHelpers.createDateWithTime({
			time : startDateTime.getTime()
		}),
		endDate : AJKHelpers.createDateWithTime({
			time : startDateTime.getTime()
		}),
		media : [],
		headline : TLConfigText['storyDefault_headline'],
		introText : TLConfigText['storyDefault_intro'],
		category : self.timeline.categories[0],
		dateFormat : "auto"
	});
	self.sortMarkersList();
	if (self.timeline.markerSpacing == "equal" || self.timeline.viewType == "category-band") {
		self.updateViewsWithNewDateRangeAndZoom({
			zoom : self.timeline.zoom
		});
	} else {
		self.selectedView.addNewMarkerToStage({
			marker : newMarker
		});
		self.sliderController.addPointToScale({
			marker : newMarker
		});
	}
	return newMarker;
};
TLMainController.prototype.deleteMarker = function(data) {
	var self = this;
	var marker = data.marker;
	self.markersByKey[marker.markerKey] = "";
	self.markers = AJKHelpers.removeItemFromArray({
		anArray : self.markers,
		item : marker
	});
	marker.deleteSelf();
	self.sortMarkersList();
	if (self.timeline.markerSpacing == "equal") {
		self.updateViewsWithNewDateRangeAndZoom({
			zoom : self.timeline.zoom
		});
	} else {
		self.selectedView.markerWasDeleted();
	}
	if (marker.id) {
		theAJKAjaxController.request({
			action : "/admin/deletestory/",
			method : "post",
			vars : {
				userId : self.user.id,
				storyId : marker.id,
				timelineId : self.timeline.id
			},
			callback : function(xml) {
			}
		});
	}
};
TLMarker.prototype.isEditButtonActive = false;
TLMarker.prototype.oldFocus = TLMarker.prototype.focus;
TLMarker.prototype.focus = function(data) {
	var self = this;
	var tData = (data) ? data : "";
	self.oldFocus(tData);
	if (self.mainController.timeline.isEditable && (!self.isEditButtonActive || tData.forceUpdate) && self.mainController.adminController.adminVisible
			&& self.mainController.adminController.storyEditButton) {
		self.isEditButtonActive = true;
		self.mainController.adminController.storyEditButton.showForStory({
			story : self
		});
	}
};
TLMarker.prototype.oldUnfocus = TLMarker.prototype.unfocus;
TLMarker.prototype.unfocus = function(data) {
	var self = this;
	var tData = (data) ? data : "";
	self.oldUnfocus(tData);
	if (self.mainController.timeline.isEditable && self.mainController.adminController.storyEditButton) {
		self.mainController.adminController.storyEditButton.remove();
	}
	self.isEditButtonActive = false;
};
TLMarker.prototype._oldShowExtraInfo = TLMarker.prototype.showExtraInfo;
TLMarker.prototype.showExtraInfo = function(data) {
	var self = this;
	var tData = (data) ? data : "";
	self._oldShowExtraInfo(tData);
	if (self.mainController.adminController.storyEditButton) {
		self.mainController.adminController.storyEditButton.remove();
	}
};
TLMarker.prototype.deleteMediaItem = function(data) {
	var self = this;
	var mediaItem = data.mediaItem;
	var vars = {};
	vars["storyId"] = self.id;
	vars["mediaId"] = mediaItem.id;
	vars["timelineId"] = self.mainController.timeline.id;
	if (mediaItem.id != "awaitingId") {
		var action = "/admin/deletestorymedia/";
		theAJKAjaxController.request({
			action : action,
			method : "post",
			vars : vars,
			callback : function(xml) {
			}
		});
	}
	AJKHelpers.removeItemFromArray({
		anArray : self.media,
		item : mediaItem
	});
	self.mediaHasBeenUpdated();
};
TLMarker.prototype.createNewMediaItem = function() {
	var self = this;
	var newMediaItem = {
		id : "awaitingId",
		orderIndex : 10,
		type : "Image",
		src : TLConfigText['marker_media_Enter_meda_source_here'],
		caption : "",
		listPosition : self.media.length,
		thumbPosition : "0,0"
	};
	return newMediaItem;
};
TLMarker.prototype.mediaHasBeenUpdated = function() {
	var self = this;
	var oldDisplayImage = self.displayImage;
	var oldNumPhotos = self.numImages;
	self.initialiseMedia();
	$(self.domImageGallery).find(".ig-num-items-text").text(self.numImages);
	if (!self.displayImage) {
		$(self.domImageGallery).remove();
		self.domImageGallery = "";
		self.domMainImageHolder = "";
		$(self.domRootInner).removeClass(self.galleryClass);
		self.domMainImage = "";
		self.domMainImageWidth = "";
		self.domMainImageHeight = "";
	} else {
		$(self.domRootInner).addClass(self.galleryClass);
		if (self.domMainImageHolder) {
			$(self.domMainImageHolder).empty().append('<img src="' + self.getDisplayImage().src + '" alt="" /><div class="ig-inner-image-mask"></div>');
			self.domMainImage = $(self.domMainImageHolder).find("img").get()[0];
			$(self.domMainImage).css({
				visibility : "hidden"
			});
			new AJKImageLoader({
				imageUrl : self.getDisplayImage().src,
				loadCallback : function() {
					self.updateMainImage();
					$(self.domRoot).css({
						visibility : "visible"
					});
					$(self.domMainImage).css({
						visibility : "visible"
					});
				}
			}).init();
		} else {
			self.domImageGallery = $(self.generateImageGalleryHTML()).get()[0];
			self.domMainImageHolder = $(self.domImageGallery).find(".ig-inner").get()[0];
			self.domMainImage = $(self.domMainImageHolder).find("img").get()[0];
			$(self.domMarkerDate).after(self.domImageGallery);
			$(self.domMainImage).css({
				visibility : "hidden"
			});
			new AJKImageLoader({
				imageUrl : self.getDisplayImage().src,
				loadCallback : function() {
					self.updateMainImage();
					$(self.domMainImage).css({
						visibility : "visible"
					});
				}
			}).init();
		}
	}
	self.dom3DImage = "";
	self.mainController.selected3DView.redisplay();
};
TLMarker.prototype.addMediaItem = function(data) {
	var self = this;
	var mediaItem = data.mediaItem;
	self.media.push(mediaItem);
	self.mediaHasBeenUpdated();
};
TLMarker.prototype.setValue = function(data) {
	var self = this;
	var valueName = data.valueName;
	var value = data.value;
	switch (valueName) {
	case "headline":
		self.headline = value;
		self.clippedHeadline = AJKHelpers.clipToMaxCharWords({
			aString : self.headline,
			maxChars : self.HEADLINEMAXCHARS
		});
		var titleText = AJKHelpers.prepareGTLTForText({
			content : self.clippedHeadline
		});
		if (self.domMarkerHeadline) {
			$(self.domMarkerHeadline).text(titleText);
		}
		if (self.domSliderToolTipHeadline) {
			$(self.domSliderToolTipHeadline).text(titleText);
		}
		self.clear3DText();
		break;
	case "introText":
		self.introText = value;
		self.clippedIntroText = AJKHelpers.clipToMaxCharWords({
			aString : self.introText,
			maxChars : self.INTROTEXTMAXCHARS
		});
		self.clippedContentIntroText = self.introText;
		var introText = AJKHelpers.prepareGTLTForText({
			content : self.clippedIntroText
		});
		if (self.domMarkerIntroText) {
			$(self.domMarkerIntroText).text(introText);
		}
		break;
	case "startDate":
		if (value != self.startDate && value && value.getFullYear) {
			self.startDate = value;
			self.syncStartEndDateIfNeeded();
			self.updatePositionFromDate();
			self.updateDisplayDates();
		}
		break;
	case "endDate":
		if (value != self.endDate && value && value.getFullYear) {
			self.endDate = value;
			self.syncStartEndDateIfNeeded();
			self.updatePositionFromDate();
			self.updateDisplayDates();
		}
		break;
	case "dateFormat":
		self.dateFormat = value;
		self.updateDisplayDates();
		break;
	case "category":
		var newCat = self.mainController.timeline.categoriesByKey[self.mainController.categoriesKeyPrefix + value];
		self.category = (newCat) ? newCat : self.category;
		self.categoryHasChanged();
		break;
	default:
		self[valueName] = value;
		break;
	}
};
TLMarker.prototype.updateDisplayDates = function() {
	var self = this;
	var dateText = self.formatDisplayDate();
	$(self.domMarkerDate).text(dateText);
	if (self.domSliderToolTipHeadline) {
		$(self.domSliderToolTipDate).text(dateText);
	}
	if (self.mainController.timeline.markerSpacing == "equal") {
		$("#tl-marker-equal-spacing-date-displayer-" + self.id).text(dateText);
	}
	self.clear3DText();
};
TLMarker.prototype.categoryHasChanged = function() {
	var self = this;
	var categoryTitle = AJKHelpers.prepareGTLTForText({
		content : self.category.title
	});
	$(self.domMarkerTab).css({
		backgroundColor : "#" + self.category.colour
	}).text(categoryTitle);
	$(self.domBasicInfoHolder).css({
		background : "#" + self.category.colour
	});
	$(self.domColoredPointer).css({
		"border-top-color" : "#" + self.category.colour
	});
	$(self.domDurationBar).css({
		background : "#" + self.category.colour
	});
	if (self.timeline.viewType == "category-band") {
		if (self.category.viewType == "duration") {
			$(self.domRoot).removeClass("tl-story-category-view-standard").removeClass("tl-story-category-view-duration").addClass("tl-story-category-view-duration");
		} else {
			$(self.domRoot).removeClass("tl-story-category-view-standard").removeClass("tl-story-category-view-duration").addClass("tl-story-category-view-standard");
		}
	}
	self.mainController.sliderController.replacePointOfMarker({
		marker : self
	});
	self.clear3DText();
};
TLMarker.prototype.updatePositionFromDate = function() {
	var self = this;
	if (self.mainController.timeline.markerSpacing == "equal") {
		self.mainController.sortMarkersList();
		self.mainController.updateViewsWithNewDateRangeAndZoom({
			zoom : self.mainController.timeline.zoom
		});
	} else {
		self.leftOffset = -self.mainController.selectedView.getLeftOffsetForDate({
			date : self.startDate
		});
		self.setMarkerHorizontalAndVerticalPosition();
		self.sliderPointPosition.left = self.mainController.sliderController.getLeftOffsetPercentForDate({
			date : self.startDate
		});
		self.mainController.sliderController.replacePointOfMarker({
			marker : self
		});
		$(self.domSliderPoint).css({
			left : self.sliderPointPosition.left + "%"
		});
		if (self.startDate.getTime() != self.endDate.getTime() && self.mainController.timeline.viewType == "duration") {
			setTimeout(function() {
				var lineWidth = self.durationBarWidth / self.mainController.selectedView.width * 100;
				$(self.domSliderPoint).css({
					width : lineWidth + "%"
				});
			}, 1);
		}
		self.mainController.sortMarkersList();
		var selectedView = self.mainController.selectedView;
		selectedView.generateMarkerSizeAndPositions();
		selectedView.refreshDisplayMarkers();
	}
	var timelineDate = theTLSettings.limitDateToRange({
		aDate : self.startDate
	});
	theTLSettings.setCurrentDate({
		date : timelineDate
	});
};
TLMarker.prototype.updateDateStatus = function() {
	var self = this;
	self.dateStatus = self.mainController.timeline.storyDateStatus;
	if (self.dateStatus == 1) {
		$(self.domSliderToolTipDate).addClass("tl-ah-hide");
	} else if (self.dateStatus == 2) {
		$(self.domSliderToolTipDate).text("~" + self.formatDisplayDate()).removeClass("tl-ah-hide");
	} else {
		$(self.domSliderToolTipDate).text(self.formatDisplayDate()).removeClass("tl-ah-hide");
	}
	if (self.dateStatus == 1) {
		$(self.domRoot).addClass("tl-story-block-hide-date");
	} else if (self.dateStatus == 2) {
		$(self.domRoot).removeClass("tl-story-block-hide-date");
		$(self.domMarkerDate).text("~" + self.formatDisplayDate());
	} else {
		$(self.domRoot).removeClass("tl-story-block-hide-date");
		$(self.domMarkerDate).text(self.formatDisplayDate());
	}
	self.clear3DText();
};
TLAdminLightbox.prototype._oldOpenPanel = TLAdminLightbox.prototype.openPanel;
TLAdminLightbox.prototype.openPanel = function(data) {
	var self = this;
	theTLMainController.selected3DView.disableHover = true;
	self._oldOpenPanel();
};
TLAdminLightbox.prototype._oldClosePanel = TLAdminLightbox.prototype.closePanel;
TLAdminLightbox.prototype.closePanel = function(data) {
	var self = this;
	theTLMainController.selected3DView.disableHover = false;
	self._oldClosePanel();
};
TLConfigText['adminBasic_Yes'] = "Yes";
TLConfigText['adminBasic_No'] = "No";
TLConfigText['adminBasic_Remove'] = "Remove";
TLConfigText['adminBasic_Revert'] = "Revert";
TLConfigText['adminBasic_Save'] = "Save";
TLConfigText['adminBasic_Edit'] = "Edit";
TLConfigText['adminBasic_Delete'] = "Delete";
TLConfigText['adminBasic_Continue'] = "Continue";
TLConfigText['adminBasic_Cancel'] = "Cancel";
TLConfigText['adminBasic_Submit'] = "Submit";
TLConfigText['adminBasic_Close'] = "Close";
TLConfigText['adminBasic_Try_again'] = "Try again";
TLConfigText['adminBasic_Undefined'] = "Undefined";
TLConfigText["adminBasic_Saving"] = "Saving";
TLConfigText["adminBasic_Saving_message"] = "Please wait while we save your changes.";
TLConfigText["adminBasic_Saving_timeline_message"] = "Please wait while we save your timeline.";
TLConfigText["adminBasic_First_story"] = "First story";
TLConfigText["adminBasic_Last_story"] = "Last story";
TLConfigText["adminBasic_Today"] = "Today";
TLConfigText["positioningPanel_title"] = "Image Positioning";
TLConfigText["positioningPanel_intro"] = "Images are by default centred within their containers. Here, you can change their alignment and view how they will appear in their various contexts.";
TLConfigText["feedsPanel_feedLimit_title"] = "Feed limit";
TLConfigText["feedsPanel_feedLimit_message"] = "We currently only allow five feeds on a timeline.";
TLConfigText["feedsPanel_New_Feed"] = "New Feed";
TLConfigText["feedsPanel_unsavedChanges1_headline"] = "Unsaved changes";
TLConfigText["feedsPanel_unsavedChanges1_message1"] = "You have made changes to the following feed:";
TLConfigText["feedsPanel_unsavedChanges1_message2"] = "Please save or revert changes before continuing.";
TLConfigText["feedsPanel_unsavedChanges2_headline"] = "Unsaved feed";
TLConfigText["feedsPanel_unsavedChanges2_message1"] = "You have created the following feed:";
TLConfigText["feedsPanel_unsavedChanges2_message2"] = "But you have not saved it yet. Please save or delete the feed before continuing.";
TLConfigText["feedsPanel_deleteFeed_title"] = "Delete feed?";
TLConfigText["feedsPanel_deleteFeed_message"] = "Are you sure you want to delete the following feed:";
TLConfigText["dateFormatting_items"] = [];
TLConfigText["dateFormatting_items"].push([ "", "Custom" ]);
TLConfigText["dateFormatting_items"].push([ "auto", "Auto" ]);
TLConfigText["dateFormatting_items"].push([ "YYYY", "2010" ]);
TLConfigText["dateFormatting_items"].push([ "MMM", "Jan" ]);
TLConfigText["dateFormatting_items"].push([ "MMMM", "January" ]);
TLConfigText["dateFormatting_items"].push([ "MMM YYYY", "Jan 2010" ]);
TLConfigText["dateFormatting_items"].push([ "MMMM YYYY", "January 2010" ]);
TLConfigText["dateFormatting_items"].push([ "ddnn MMM YYYY", "10th Jan 2010" ]);
TLConfigText["dateFormatting_items"].push([ "ddnn MMMM YYYY", "10th January 2010" ]);
TLConfigText["dateFormatting_items"].push([ "ddnn MMM", "10th Jan" ]);
TLConfigText["dateFormatting_items"].push([ "ddnn MMMM", "10th January" ]);
TLConfigText["dateFormatting_items"].push([ "DD/MM/YYYY", "10/01/2010" ]);
TLConfigText["dateFormatting_items"].push([ "DD. MM. YYYY", "10. 01. 2010" ]);
TLConfigText["dateFormatting_items"].push([ "ddnn MMM HH:mm", "10th Jan 09:00" ]);
TLConfigText["dateFormatting_items"].push([ "ddnn MMMM HH:mm", "10th January 09:00" ]);
TLConfigText["dateFormatting_items"].push([ "DD/MM/YYYY HH:mm", "10/01/2010 09:00" ]);
TLConfigText["dateFormatting_items"].push([ "WKD", "Sunday" ]);
TLConfigText["dateFormatting_items"].push([ "wkd", "Sun" ]);
TLConfigText["dateFormatting_items"].push([ "HH:mm", "09:00" ]);
TLConfigText["dateFormatting_items"].push([ "HH:mm:ss", "09:00:00" ]);
TLConfigText["dateFormatting_items"].push([ "hhAMPM", "2pm" ]);
TLConfigText["dateFormatting_items"].push([ "hh:mmAMPM", "2:30am" ]);
TLConfigText["advancedSettings_title"] = "Timeline Advanced Settings";
TLConfigText["advancedSettings_intro"] = "Customise your timeline still further with our advanced options. Use the scroll bar to view all options.";
TLConfigText["embed_title"] = "Timeline Embed Code";
TLConfigText["storyMedia_unsavedChanges1_headline"] = "Unsaved changes";
TLConfigText["storyMedia_unsavedChanges1_message1"] = "You have made changes to the following media:";
TLConfigText["storyMedia_unsavedChanges1_message2"] = "Please save or revert changes before continuing.";
TLConfigText["storyMedia_unsavedChanges2_headline"] = "Unsaved changes";
TLConfigText["storyMedia_unsavedChanges2_message1"] = "You have created the following media:";
TLConfigText["storyMedia_unsavedChanges2_message2"] = "But you have not saved it yet. Please save or delete the media before continuing.";
TLConfigText["storyMedia_secretUser_saving_message"] = "Please wait while we save/update your media.";
TLConfigText["storyExtraInfo_unsavedChanges_headline"] = "Unsaved changes";
TLConfigText["storyExtraInfo_unsavedChanges_message1"] = "You have made changes to the following story:";
TLConfigText["storyExtraInfo_unsavedChanges_message2"] = "Please save or revert changes before continuing.";
TLConfigText["storyDate_outsideTimeline_headline"] = "Date outside timeline range";
TLConfigText["storyDate_outsideTimeline_message"] = "The date you have selected for this story is outside the allowable range of dates. We have restored it to its previous value.";
TLConfigText["storyDate_outsideTimeline2_headline"] = "Date outside timeline range";
TLConfigText["storyDate_outsideTimeline2_message"] = "<p>The new date for this story is outside the range of the timeline.</p><p>Would you like us to extend the range of the timeline to include this date?</p><p>If you choose 'no', we will restore the story's date to its previous value.</p>";
TLConfigText["storyDate_outsideTimeline2_secret_user_message"] = "<p>The new date for this story is outside the range of the timeline. You will need to ask the owner of the timeline to extend the date range to use this date.</p><p>We will restore the story's date to its previous value.</p>";
TLConfigText["story_deleteStory_headline"] = "Delete story?";
TLConfigText["story_deleteStory_message"] = "Are you sure you want to delete the following story:";
TLConfigText["story_unsavedChanges_headline"] = "Unsaved changes";
TLConfigText["story_unsavedChanges_message1"] = "You have made changes to the following story:";
TLConfigText["story_unsavedChanges_message2"] = "Please save or revert changes before continuing.";
TLConfigText["story_unsavedStory_headline"] = "Unsaved story";
TLConfigText["story_unsavedStory_message1"] = "You have created the following story:";
TLConfigText["story_unsavedStory_message2"] = "But you have not saved it yet. Please save or delete the story before continuing.";
TLConfigText["timelineForm_titleChanged_headline"] = 'Timeline title changed';
TLConfigText["timelineForm_titleChanged_message"] = "<p>Changing the title of a timeline also changes its web address.</p><p>If you have shared your timeline with others, you will need to tell them the new web address. You will also have to update any online links you have created to your timeline.</p><p>Do you definitely want to change your timeline's title (and also its web address)?</p>";
TLConfigText["timelineForm_unsavedChanges_headline"] = "Unsaved changes";
TLConfigText["timelineForm_unsavedChanges_message"] = "You have made changes to this timeline. Please save or revert changes before continuing.";
TLConfigText["category_deleteCategory_headline"] = "Delete category?";
TLConfigText["category_deleteCategory_message"] = "Are you sure you want to delete the following category:";
TLConfigText["category_New_category"] = "New category";
TLConfigText["category_unsavedChanges_headline"] = "Unsaved changes";
TLConfigText["category_unsavedChanges_message1"] = "You have made changes to the following category:";
TLConfigText["category_unsavedChanges_message2"] = "Please save or revert changes before continuing.";
TLConfigText["category_unsavedCategory_headline"] = "Unsaved category";
TLConfigText["category_unsavedCategory_message1"] = "You have created the following category:";
TLConfigText["category_unsavedCategory_message2"] = "But you have not saved it yet. Please save or delete the category before continuing.";
TLConfigText["media_deleteMedia_headline"] = "Delete media?";
TLConfigText["media_deleteMedia_message"] = "Are you sure you want to delete the following media:";
TLConfigText["dateVerificiation_Invalid_date"] = 'Invalid date';
TLConfigText["dateVerificiation_Story_outside_date_range"] = 'Story outside date range';
TLConfigText["dateVerificiation_Invalid_date_message"] = 'You have entered an invalid date. Please try again.';
TLConfigText["dateVerificiation_start_date_first_message"] = "The start date for the timeline must precede the end date. Please try again.";
TLConfigText["dateVerificiation_outside_range_message"] = "You have entered a date outside the range of allowable dates. We currently limit dates to be from 9999BC to 9999AD. Please try again.";
TLConfigText["dateVerificiation_story_outside_range_message"] = "One or more stories fall outside the new date range you have entered. You will need to change their dates before you can restrict the timeline date range.";
TLConfigText["teacherAccount_pupilUpgradeText"] = "Enter the special class code your teacher gave you:";
TLConfigText["teacherAccount_pupilUpgradePanel_headine"] = "Activate free pupil account";
TLConfigText["teacherAccount_pupilUpgradePanel_Submitting_code"] = "Submitting code";
TLConfigText["teacherAccount_pupilUpgradePanel_Submitting_code_message"] = "Please wait while we submit your class code and activate your free account.";
TLConfigText["teacherAccount_pupilUpgradePanel_Submitting_code_error_1"] = "Too many people have already tried to activate their account using this code. Speak to your teacher.";
TLConfigText["teacherAccount_pupilUpgradePanel_Submitting_code_error_2"] = "The code you entered did not seem to be a valid code";
TLConfigText["teacherAccount_pupilUpgradePanel_Submitting_code_error_headline"] = "Error with code";
TLConfigText["teacherAccount_pupilUpgradePanel_Success_headline"] = "Account activated";
TLConfigText["teacherAccount_pupilUpgradePanel_Success_message"] = "Your free pupil Bronze account has been successfully activated. Click the below button to gain access to your new upgraded account.";
TLConfigText["teacherAccount_removePupil_headline"] = "Remove pupil";
TLConfigText["teacherAccount_removePupil_message"] = '<p>Are you sure you want to remove this pupil from your account?</p><p>Although they will still have access to their timelines, they will no longer be able to use premium features such as embedding timelines and will not be able to create any new timelines.</p>';
TLConfigText["accountForm_changePassword_headline"] = "Change Password";
TLConfigText["accountForm_changePassword_Enter_current_password"] = "Enter your current password:";
TLConfigText["accountForm_changePassword_Enter_new_password"] = "Enter your new password (must be three letters or more):";
TLConfigText["accountForm_changePassword_Saving_headline"] = "Saving Password";
TLConfigText["accountForm_changePassword_Saving_message"] = "Please wait while we save your new password";
TLConfigText["accountForm_changePassword_Failure_headline"] = "Error";
TLConfigText["accountForm_changePassword_Failure_message"] = "Sorry, there was a problem. We could not change your password.";
TLConfigText["accountForm_confirmPassword_headline"] = "Enter password";
TLConfigText["accountForm_confirmPassword_message"] = "<p>We need you to confirm your password to make these changes.</p><p>Enter your password in the field below and then press 'continue'.</p>";
TLConfigText["accountForm_confirmPassword_failure_headline"] = "Wrong Password";
TLConfigText["accountForm_confirmPassword_failure_message"] = "Sorry, the password you entered does not match what we have in the database. Please try again";
TLConfigText["feedStory_cantEdit_headline"] = "Uneditable";
TLConfigText["feedStory_cantEdit_message"] = "You cannot edit feed stories.";
TLConfigText["feedCategory_cantEdit_headline"] = "Uneditable";
TLConfigText["feedCategory_cantEdit_message"] = "You cannot edit feed categories.";
TLConfigText['adminDatePicker_Confirm'] = 'Confirm';
TLConfigText['adminDatePicker_Selected_date_text'] = 'Selected date:';
TLConfigText['adminDatePicker_Date_picker'] = 'Date picker';
TLConfigText['adminDatePicker_Date_format_text'] = 'Date format:';
TLConfigText["csv_panel_title"] = "CSV Export";
TLConfigText["csv_panel_intro"] = "Back-up your timeline's content by exporting your stories to CSV format.";
TLConfigText["pupil_panel_title"] = "Student timelines";
TLConfigText["pupil_panel_intro"] = "Click on the links below to open this student's timelines.";
TLConfigText["pdf_panel_title"] = "Timeline PDF/Image";
TLConfigText["pdf_panel_intro"] = "Instructions on how to create an image and PDF of your timeline* for printing or presenting.";
TLConfigText["3DSettings_title"] = "3D Timeline Settings";
TLConfigText["3DSettings_intro"] = "Customise how your 3D timeline appears.";
var AJKColorPicker = {
	dir : '/assets/js/class-ajk-color-picker/',
	bindClass : 'ajk-color-selector',
	binding : false,
	preloading : true,
	install : function() {
		AJKColorPicker.addEvent(window, 'load', AJKColorPicker.init);
	},
	init : function() {
		if (AJKColorPicker.binding) {
			AJKColorPicker.bind();
		}
	},
	getDir : function() {
		return AJKColorPicker.dir;
	},
	bind : function() {
		$("input." + this.bindClass).each(function() {
			this.color = new AJKColorPicker.color(this, {});
		});
	},
	images : {
		pad : [ 181, 101 ],
		sld : [ 16, 101 ],
		cross : [ 15, 15 ],
		arrow : [ 7, 11 ]
	},
	imgRequire : {},
	requireImage : function(filename) {
		AJKColorPicker.imgRequire[filename] = true;
	},
	fetchElement : function(mixed) {
		return typeof mixed === 'string' ? document.getElementById(mixed) : mixed;
	},
	addEvent : function(el, evnt, func) {
		if (el.addEventListener) {
			el.addEventListener(evnt, func, false);
		} else if (el.attachEvent) {
			el.attachEvent('on' + evnt, func);
		}
	},
	fireEvent : function(el, evnt) {
		if (!el) {
			return;
		}
		if (document.createEventObject) {
			var ev = document.createEventObject();
			el.fireEvent('on' + evnt, ev);
		} else if (document.createEvent) {
			var ev = document.createEvent('HTMLEvents');
			ev.initEvent(evnt, true, true);
			el.dispatchEvent(ev);
		} else if (el['on' + evnt]) {
			el['on' + evnt]();
		}
	},
	getElementPos : function(e) {
		var e1 = e, e2 = e;
		var x = 0, y = 0;
		if (e1.offsetParent) {
			do {
				x += e1.offsetLeft;
				y += e1.offsetTop;
			} while (e1 = e1.offsetParent);
		}
		while ((e2 = e2.parentNode) && e2.nodeName.toUpperCase() !== 'BODY') {
			x -= e2.scrollLeft;
			y -= e2.scrollTop;
		}
		return [ x, y ];
	},
	getElementSize : function(e) {
		return [ e.offsetWidth, e.offsetHeight ];
	},
	getMousePos : function(e) {
		if (!e) {
			e = window.event;
		}
		if (typeof e.pageX === 'number') {
			return [ e.pageX, e.pageY ];
		} else if (typeof e.clientX === 'number') {
			return [ e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft, e.clientY + document.body.scrollTop + document.documentElement.scrollTop ];
		}
	},
	getViewPos : function() {
		if (typeof window.pageYOffset === 'number') {
			return [ window.pageXOffset, window.pageYOffset ];
		} else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
			return [ document.body.scrollLeft, document.body.scrollTop ];
		} else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
			return [ document.documentElement.scrollLeft, document.documentElement.scrollTop ];
		} else {
			return [ 0, 0 ];
		}
	},
	getViewSize : function() {
		if (typeof window.innerWidth === 'number') {
			return [ window.innerWidth, window.innerHeight ];
		} else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
			return [ document.body.clientWidth, document.body.clientHeight ];
		} else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
			return [ document.documentElement.clientWidth, document.documentElement.clientHeight ];
		} else {
			return [ 0, 0 ];
		}
	},
	color : function(target, prop) {
		var self = this;
		this.required = true;
		this.adjust = true;
		this.hash = false;
		this.caps = true;
		this.valueElement = target;
		this.styleElement = target;
		this.hsv = [ 0, 0, 1 ];
		this.rgb = [ 1, 1, 1 ];
		this.pickerOnfocus = true;
		this.pickerMode = 'HSV';
		this.pickerPosition = 'bottom';
		this.pickerFace = 10;
		this.pickerFaceColor = 'ThreeDFace';
		this.pickerBorder = 1;
		this.pickerBorderColor = 'ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight';
		this.pickerInset = 1;
		this.pickerInsetColor = 'ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow';
		this.pickerZIndex = 10000;
		for ( var p in prop) {
			if (prop.hasOwnProperty(p)) {
				this[p] = prop[p];
			}
		}
		this.hidePicker = function() {
			if (isPickerOwner()) {
				removePicker();
			}
		};
		this.showPicker = function() {
			if (!isPickerOwner()) {
				var tp = AJKColorPicker.getElementPos(target);
				var ts = AJKColorPicker.getElementSize(target);
				var vp = AJKColorPicker.getViewPos();
				var vs = AJKColorPicker.getViewSize();
				var ps = [
						2 * this.pickerBorder + 4 * this.pickerInset + 2 * this.pickerFace + AJKColorPicker.images.pad[0] + 2 * AJKColorPicker.images.arrow[0]
								+ AJKColorPicker.images.sld[0], 2 * this.pickerBorder + 2 * this.pickerInset + 2 * this.pickerFace + AJKColorPicker.images.pad[1] ];
				var a, b, c;
				switch (this.pickerPosition.toLowerCase()) {
				case 'left':
					a = 1;
					b = 0;
					c = -1;
					break;
				case 'right':
					a = 1;
					b = 0;
					c = 1;
					break;
				case 'top':
					a = 0;
					b = 1;
					c = -1;
					break;
				default:
					a = 0;
					b = 1;
					c = 1;
					break;
				}
				var l = (ts[b] + ps[b]) / 2;
				var pp = [
						-vp[a] + tp[a] + ps[a] > vs[a] ? (-vp[a] + tp[a] + ts[a] / 2 > vs[a] / 2 && tp[a] + ts[a] - ps[a] >= 0 ? tp[a] + ts[a] - ps[a] : tp[a]) : tp[a],
						-vp[b] + tp[b] + ts[b] + ps[b] - l + l * c > vs[b] ? (-vp[b] + tp[b] + ts[b] / 2 > vs[b] / 2 && tp[b] + ts[b] - l - l * c >= 0 ? tp[b] + ts[b] - l - l * c
								: tp[b] + ts[b] - l + l * c) : (tp[b] + ts[b] - l + l * c >= 0 ? tp[b] + ts[b] - l + l * c : tp[b] + ts[b] - l - l * c) ];
				drawPicker(pp[a], pp[b]);
			}
		};
		this.importColor = function() {
			if (!valueElement) {
				this.exportColor();
			} else {
				if (!this.adjust) {
					if (!this.fromString(valueElement.value, leaveValue)) {
						styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
						styleElement.style.color = styleElement.jscStyle.color;
						this.exportColor(leaveValue | leaveStyle);
					}
				} else if (!this.required && /^\s*$/.test(valueElement.value)) {
					valueElement.value = '';
					styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
					styleElement.style.color = styleElement.jscStyle.color;
					this.exportColor(leaveValue | leaveStyle);
				} else if (this.fromString(valueElement.value)) {
				} else {
					this.exportColor();
				}
			}
		};
		this.exportColor = function(flags) {
			if (!(flags & leaveValue) && valueElement) {
				var value = this.toString();
				if (this.caps) {
					value = value.toUpperCase();
				}
				if (this.hash) {
					value = '#' + value;
				}
				valueElement.value = value;
			}
			if (!(flags & leaveStyle) && styleElement) {
				styleElement.style.backgroundColor = '#' + this.toString();
				if ($(styleElement).hasClass("ajk-color-same-text-color")) {
					styleElement.style.color = '#' + this.toString();
				} else {
					styleElement.style.color = 0.213 * this.rgb[0] + 0.715 * this.rgb[1] + 0.072 * this.rgb[2] < 0.5 ? '#FFF' : '#000';
				}
			}
			if (!(flags & leavePad) && isPickerOwner()) {
				redrawPad();
			}
			if (!(flags & leaveSld) && isPickerOwner()) {
				redrawSld();
			}
		};
		this.fromHSV = function(h, s, v, flags) {
			h < 0 && (h = 0) || h > 6 && (h = 6);
			s < 0 && (s = 0) || s > 1 && (s = 1);
			v < 0 && (v = 0) || v > 1 && (v = 1);
			this.rgb = HSV_RGB(h === null ? this.hsv[0] : (this.hsv[0] = h), s === null ? this.hsv[1] : (this.hsv[1] = s), v === null ? this.hsv[2] : (this.hsv[2] = v));
			this.exportColor(flags);
		};
		this.fromRGB = function(r, g, b, flags) {
			r < 0 && (r = 0) || r > 1 && (r = 1);
			g < 0 && (g = 0) || g > 1 && (g = 1);
			b < 0 && (b = 0) || b > 1 && (b = 1);
			var hsv = RGB_HSV(r === null ? this.rgb[0] : (this.rgb[0] = r), g === null ? this.rgb[1] : (this.rgb[1] = g), b === null ? this.rgb[2] : (this.rgb[2] = b));
			if (hsv[0] !== null) {
				this.hsv[0] = hsv[0];
			}
			if (hsv[2] !== 0) {
				this.hsv[1] = hsv[1];
			}
			this.hsv[2] = hsv[2];
			this.exportColor(flags);
		};
		this.fromString = function(hex, flags) {
			var m = hex.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i);
			if (!m) {
				return false;
			} else {
				if (m[1].length === 6) {
					this.fromRGB(parseInt(m[1].substr(0, 2), 16) / 255, parseInt(m[1].substr(2, 2), 16) / 255, parseInt(m[1].substr(4, 2), 16) / 255, flags);
				} else {
					this.fromRGB(parseInt(m[1].charAt(0) + m[1].charAt(0), 16) / 255, parseInt(m[1].charAt(1) + m[1].charAt(1), 16) / 255, parseInt(
							m[1].charAt(2) + m[1].charAt(2), 16) / 255, flags);
				}
				return true;
			}
		};
		this.toString = function() {
			return ((0x100 | Math.round(255 * this.rgb[0])).toString(16).substr(1) + (0x100 | Math.round(255 * this.rgb[1])).toString(16).substr(1) + (0x100 | Math
					.round(255 * this.rgb[2])).toString(16).substr(1));
		};
		function RGB_HSV(r, g, b) {
			var n = Math.min(Math.min(r, g), b);
			var v = Math.max(Math.max(r, g), b);
			var m = v - n;
			if (m === 0) {
				return [ null, 0, v ];
			}
			var h = r === n ? 3 + (b - g) / m : (g === n ? 5 + (r - b) / m : 1 + (g - r) / m);
			return [ h === 6 ? 0 : h, m / v, v ];
		}
		function HSV_RGB(h, s, v) {
			if (h === null) {
				return [ v, v, v ];
			}
			var i = Math.floor(h);
			var f = i % 2 ? h - i : 1 - (h - i);
			var m = v * (1 - s);
			var n = v * (1 - s * f);
			switch (i) {
			case 6:
			case 0:
				return [ v, n, m ];
			case 1:
				return [ n, v, m ];
			case 2:
				return [ m, v, n ];
			case 3:
				return [ m, n, v ];
			case 4:
				return [ n, m, v ];
			case 5:
				return [ v, m, n ];
			}
		}
		function removePicker() {
			delete AJKColorPicker.picker.owner;
			document.getElementsByTagName('body')[0].removeChild(AJKColorPicker.picker.boxB);
		}
		function drawPicker(x, y) {
			if (!AJKColorPicker.picker) {
				AJKColorPicker.picker = {
					box : document.createElement('div'),
					boxB : document.createElement('div'),
					pad : document.createElement('div'),
					padB : document.createElement('div'),
					padM : document.createElement('div'),
					sld : document.createElement('div'),
					sldB : document.createElement('div'),
					sldM : document.createElement('div')
				};
				for (var i = 0, segSize = 4; i < AJKColorPicker.images.sld[1]; i += segSize) {
					var seg = document.createElement('div');
					seg.style.height = segSize + 'px';
					seg.style.fontSize = '1px';
					seg.style.lineHeight = '0';
					AJKColorPicker.picker.sld.appendChild(seg);
				}
				AJKColorPicker.picker.sldB.appendChild(AJKColorPicker.picker.sld);
				AJKColorPicker.picker.box.appendChild(AJKColorPicker.picker.sldB);
				AJKColorPicker.picker.box.appendChild(AJKColorPicker.picker.sldM);
				AJKColorPicker.picker.padB.appendChild(AJKColorPicker.picker.pad);
				AJKColorPicker.picker.box.appendChild(AJKColorPicker.picker.padB);
				AJKColorPicker.picker.box.appendChild(AJKColorPicker.picker.padM);
				AJKColorPicker.picker.boxB.appendChild(AJKColorPicker.picker.box);
			}
			var p = AJKColorPicker.picker;
			posPad = [ x + THIS.pickerBorder + THIS.pickerFace + THIS.pickerInset, y + THIS.pickerBorder + THIS.pickerFace + THIS.pickerInset ];
			posSld = [ null, y + THIS.pickerBorder + THIS.pickerFace + THIS.pickerInset ];
			p.box.onmouseup = function() {
				$(target).blur();
			};
			$(p.box).mouseleave(function() {
				$(target).blur();
				self.hidePicker();
			});
			p.box.onmousedown = function() {
				abortBlur = true;
			};
			p.box.onmousemove = function(e) {
				holdPad && setPad(e);
				holdSld && setSld(e);
			};
			p.padM.onmouseup = p.padM.onmouseout = function() {
				if (holdPad) {
					holdPad = false;
				}
			};
			p.padM.onmousedown = function(e) {
				holdPad = true;
				setPad(e);
			};
			p.sldM.onmouseup = p.sldM.onmouseout = function() {
				if (holdSld) {
					holdSld = false;
				}
			};
			p.sldM.onmousedown = function(e) {
				holdSld = true;
				setSld(e);
			};
			p.box.style.width = 4 * THIS.pickerInset + 2 * THIS.pickerFace + AJKColorPicker.images.pad[0] + 2 * AJKColorPicker.images.arrow[0] + AJKColorPicker.images.sld[0]
					+ 'px';
			p.box.style.height = 2 * THIS.pickerInset + 2 * THIS.pickerFace + AJKColorPicker.images.pad[1] + 'px';
			p.boxB.style.position = 'absolute';
			p.boxB.style.clear = 'both';
			p.boxB.style.left = x + 'px';
			p.boxB.style.top = y + 'px';
			p.boxB.style.zIndex = THIS.pickerZIndex;
			p.boxB.style.border = THIS.pickerBorder + 'px solid';
			p.boxB.style.borderColor = THIS.pickerBorderColor;
			p.boxB.style.background = THIS.pickerFaceColor;
			p.pad.style.width = AJKColorPicker.images.pad[0] + 'px';
			p.pad.style.height = AJKColorPicker.images.pad[1] + 'px';
			p.padB.style.position = 'absolute';
			p.padB.style.left = THIS.pickerFace + 'px';
			p.padB.style.top = THIS.pickerFace + 'px';
			p.padB.style.border = THIS.pickerInset + 'px solid';
			p.padB.style.borderColor = THIS.pickerInsetColor;
			p.padM.style.position = 'absolute';
			p.padM.style.left = '0';
			p.padM.style.top = '0';
			p.padM.style.width = THIS.pickerFace + 2 * THIS.pickerInset + AJKColorPicker.images.pad[0] + AJKColorPicker.images.arrow[0] + 'px';
			p.padM.style.height = p.box.style.height;
			p.padM.style.cursor = 'crosshair';
			p.sld.style.overflow = 'hidden';
			p.sld.style.width = AJKColorPicker.images.sld[0] + 'px';
			p.sld.style.height = AJKColorPicker.images.sld[1] + 'px';
			p.sldB.style.position = 'absolute';
			p.sldB.style.right = THIS.pickerFace + 'px';
			p.sldB.style.top = THIS.pickerFace + 'px';
			p.sldB.style.border = THIS.pickerInset + 'px solid';
			p.sldB.style.borderColor = THIS.pickerInsetColor;
			p.sldM.style.position = 'absolute';
			p.sldM.style.right = '0';
			p.sldM.style.top = '0';
			p.sldM.style.width = AJKColorPicker.images.sld[0] + AJKColorPicker.images.arrow[0] + THIS.pickerFace + 2 * THIS.pickerInset + 'px';
			p.sldM.style.height = p.box.style.height;
			try {
				p.sldM.style.cursor = 'pointer';
			} catch (eOldIE) {
				p.sldM.style.cursor = 'hand';
			}
			switch (modeID) {
			case 0:
				var padImg = 'hs.png';
				break;
			case 1:
				var padImg = 'hv.png';
				break;
			}
			p.padM.style.background = "url('" + AJKColorPicker.getDir() + "cross.gif') no-repeat";
			p.sldM.style.background = "url('" + AJKColorPicker.getDir() + "arrow.gif') no-repeat";
			p.pad.style.background = "url('" + AJKColorPicker.getDir() + padImg + "') 0 0 no-repeat";
			redrawPad();
			redrawSld();
			AJKColorPicker.picker.owner = THIS;
			document.getElementsByTagName('body')[0].appendChild(p.boxB);
		}
		function redrawPad() {
			switch (modeID) {
			case 0:
				var yComponent = 1;
				break;
			case 1:
				var yComponent = 2;
				break;
			}
			var x = Math.round((THIS.hsv[0] / 6) * (AJKColorPicker.images.pad[0] - 1));
			var y = Math.round((1 - THIS.hsv[yComponent]) * (AJKColorPicker.images.pad[1] - 1));
			AJKColorPicker.picker.padM.style.backgroundPosition = (THIS.pickerFace + THIS.pickerInset + x - Math.floor(AJKColorPicker.images.cross[0] / 2)) + 'px '
					+ (THIS.pickerFace + THIS.pickerInset + y - Math.floor(AJKColorPicker.images.cross[1] / 2)) + 'px';
			var seg = AJKColorPicker.picker.sld.childNodes;
			switch (modeID) {
			case 0:
				var rgb = HSV_RGB(THIS.hsv[0], THIS.hsv[1], 1);
				for (var i = 0; i < seg.length; i += 1) {
					seg[i].style.backgroundColor = 'rgb(' + (rgb[0] * (1 - i / seg.length) * 100) + '%,' + (rgb[1] * (1 - i / seg.length) * 100) + '%,'
							+ (rgb[2] * (1 - i / seg.length) * 100) + '%)';
				}
				break;
			case 1:
				var rgb, s, c = [ THIS.hsv[2], 0, 0 ];
				var i = Math.floor(THIS.hsv[0]);
				var f = i % 2 ? THIS.hsv[0] - i : 1 - (THIS.hsv[0] - i);
				switch (i) {
				case 6:
				case 0:
					rgb = [ 0, 1, 2 ];
					break;
				case 1:
					rgb = [ 1, 0, 2 ];
					break;
				case 2:
					rgb = [ 2, 0, 1 ];
					break;
				case 3:
					rgb = [ 2, 1, 0 ];
					break;
				case 4:
					rgb = [ 1, 2, 0 ];
					break;
				case 5:
					rgb = [ 0, 2, 1 ];
					break;
				}
				for (var i = 0; i < seg.length; i += 1) {
					s = 1 - 1 / (seg.length - 1) * i;
					c[1] = c[0] * (1 - s * f);
					c[2] = c[0] * (1 - s);
					seg[i].style.backgroundColor = 'rgb(' + (c[rgb[0]] * 100) + '%,' + (c[rgb[1]] * 100) + '%,' + (c[rgb[2]] * 100) + '%)';
				}
				break;
			}
		}
		function redrawSld() {
			switch (modeID) {
			case 0:
				var yComponent = 2;
				break;
			case 1:
				var yComponent = 1;
				break;
			}
			var y = Math.round((1 - THIS.hsv[yComponent]) * (AJKColorPicker.images.sld[1] - 1));
			AJKColorPicker.picker.sldM.style.backgroundPosition = '0 ' + (THIS.pickerFace + THIS.pickerInset + y - Math.floor(AJKColorPicker.images.arrow[1] / 2)) + 'px';
		}
		function isPickerOwner() {
			return AJKColorPicker.picker && AJKColorPicker.picker.owner === THIS;
		}
		function blurTarget() {
			if (valueElement === target) {
				THIS.importColor();
			}
			if (THIS.pickerOnfocus) {
				THIS.hidePicker();
			}
		}
		function blurValue() {
			if (valueElement !== target) {
				THIS.importColor();
			}
		}
		function setPad(e) {
			var posM = AJKColorPicker.getMousePos(e);
			var x = posM[0] - posPad[0];
			var y = posM[1] - posPad[1];
			switch (modeID) {
			case 0:
				THIS.fromHSV(x * (6 / (AJKColorPicker.images.pad[0] - 1)), 1 - y / (AJKColorPicker.images.pad[1] - 1), null, leaveSld);
				break;
			case 1:
				THIS.fromHSV(x * (6 / (AJKColorPicker.images.pad[0] - 1)), null, 1 - y / (AJKColorPicker.images.pad[1] - 1), leaveSld);
				break;
			}
		}
		function setSld(e) {
			var posM = AJKColorPicker.getMousePos(e);
			var y = posM[1] - posPad[1];
			switch (modeID) {
			case 0:
				THIS.fromHSV(null, null, 1 - y / (AJKColorPicker.images.sld[1] - 1), leavePad);
				break;
			case 1:
				THIS.fromHSV(null, 1 - y / (AJKColorPicker.images.sld[1] - 1), null, leavePad);
				break;
			}
		}
		var THIS = this;
		var modeID = this.pickerMode.toLowerCase() === 'hvs' ? 1 : 0;
		var abortBlur = false;
		var valueElement = AJKColorPicker.fetchElement(this.valueElement), styleElement = AJKColorPicker.fetchElement(this.styleElement);
		var holdPad = false, holdSld = false;
		var posPad, posSld;
		var leaveValue = 1 << 0, leaveStyle = 1 << 1, leavePad = 1 << 2, leaveSld = 1 << 3;
		AJKColorPicker.addEvent(target, 'focus', function() {
			if (THIS.pickerOnfocus) {
				THIS.showPicker();
			}
		});
		AJKColorPicker.addEvent(target, 'blur', function() {
			if (!abortBlur) {
				window.setTimeout(function() {
					abortBlur || blurTarget();
					abortBlur = false;
				}, 0);
			} else {
				abortBlur = false;
			}
		});
		if (valueElement) {
			var updateField = function() {
				THIS.fromString(valueElement.value, leaveValue);
			};
			AJKColorPicker.addEvent(valueElement, 'keyup', updateField);
			AJKColorPicker.addEvent(valueElement, 'input', updateField);
			AJKColorPicker.addEvent(valueElement, 'blur', blurValue);
			valueElement.setAttribute('autocomplete', 'off');
		}
		if (styleElement) {
			styleElement.jscStyle = {
				backgroundColor : styleElement.style.backgroundColor,
				color : styleElement.style.color
			};
		}
		switch (modeID) {
		case 0:
			AJKColorPicker.requireImage('hs.png');
			break;
		case 1:
			AJKColorPicker.requireImage('hv.png');
			break;
		}
		AJKColorPicker.requireImage('cross.gif');
		AJKColorPicker.requireImage('arrow.gif');
		this.importColor();
	}
};
AJKColorPicker.install();
var AJKTabBlockController = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.tabMenuOptionClass = data.tabMenuOptionClass;
	self.tabSelectedClass = data.tabSelectedClass;
	self.selectedBlock = "";
	self.blocks = new Array();
};
AJKTabBlockController.prototype = {
	init : function() {
		var self = this;
		$(self.domRoot).find("." + self.tabMenuOptionClass).each(function() {
			var tabId = $(this).attr("tabId");
			var domBlock = $("#" + tabId).get()[0];
			var thisBlock = {
				domBlock : domBlock,
				id : tabId,
				domTab : this
			};
			self.blocks.push(thisBlock);
			if ($(this).hasClass(self.tabSelectedClass)) {
				self.showBlock({
					block : thisBlock
				});
			}
			$(this).click(function(e) {
				self.showBlock({
					block : thisBlock
				});
				e.preventDefault();
			});
		});
		return self;
	},
	showBlock : function(data) {
		var self = this;
		var block = data.block;
		if (block != self.selectedBlock) {
			self.hideBlock({
				block : self.selectedBlock
			});
			$(block.domBlock).css({
				display : "block"
			});
			$(block.domTab).addClass(self.tabSelectedClass);
			self.selectedBlock = block;
		}
	},
	hideBlock : function(data) {
		var self = this;
		var block = data.block;
		if (block) {
			$(block.domBlock).css({
				display : "none"
			});
			$(block.domTab).removeClass(self.tabSelectedClass);
		}
	}
};
var AJKSwitchBlockController = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.switchClass = data.switchClass;
	self.switchSelectedClass = data.switchSelectedClass;
	self.blocks = new Array();
};
AJKSwitchBlockController.prototype = {
	init : function() {
		var self = this;
		$(self.domRoot).find("." + self.switchClass).each(function() {
			var blockId = $(this).attr("blockId");
			var domBlock = $("#" + blockId).get()[0];
			var thisBlock = {
				domBlock : domBlock,
				id : blockId,
				domSwitch : this,
				isOpen : false
			};
			self.blocks.push(thisBlock);
			if ($(this).hasClass(self.switchSelectedClass)) {
				self.showBlock({
					block : thisBlock
				});
			}
			$(this).click(function() {
				if (thisBlock.isOpen) {
					self.hideBlock({
						block : thisBlock
					});
				} else {
					self.showBlock({
						block : thisBlock
					});
				}
				return false;
			});
		});
		return self;
	},
	showBlock : function(data) {
		var self = this;
		var block = data.block;
		$(block.domBlock).css({
			display : "block"
		});
		block.isOpen = true;
		$(block.domSwitch).addClass(self.switchSelectedClass);
	},
	hideBlock : function(data) {
		var self = this;
		var block = data.block;
		$(block.domBlock).css({
			display : "none"
		});
		block.isOpen = false;
		$(block.domSwitch).removeClass(self.switchSelectedClass);
	}
};
var AJKAlert = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.domContent = $(self.domRoot).find(".ajk-alert-content").get()[0];
	self.domContentHeadline = $(self.domRoot).find(".ajk-alert-content-headline").get()[0];
	self.domContentBody = $(self.domRoot).find(".ajk-alert-content-body").get()[0];
	self.domClose = $(self.domRoot).find(".ajk-alert-close").get()[0];
	self.domContentButtonHolder = $(self.domRoot).find(".ajk-alert-content-button-holder").get()[0];
	self.preDisplaySetupFunc = data.preDisplaySetupFunc;
	self.closeOnBackClick = data.closeOnBackClick;
};
AJKAlert.prototype = {
	init : function() {
		var self = this;
		$(self.domRoot).click(function() {
			if (self.closeOnBackClick) {
				self.close();
			}
			return false;
		});
		$(self.domClose).click(function() {
			self.close();
			return false;
		});
		return self;
	},
	close : function() {
		var self = this;
		$(self.domRoot).css({
			display : "none",
			visibility : "hidden"
		});
	},
	displayMessage : function(data) {
		var self = this;
		var headline = data.headline;
		var body = data.body;
		var buttons = (data.buttons) ? data.buttons : new Array();
		var hideClose = data.hideClose;
		if (hideClose) {
			$(self.domClose).css({
				display : "none"
			});
		} else {
			$(self.domClose).css({
				display : "block"
			});
		}
		$(self.domContentHeadline).html(data.headline);
		$(self.domContentBody).html(data.body);
		$(self.domContentButtonHolder).empty();
		$.each(buttons, function() {
			var button = this;
			var domButton = $(this.html).get()[0];
			$(domButton).click(function() {
				self.close();
				button.action();
				return false;
			});
			$(self.domContentButtonHolder).append(domButton);
		});
		$(self.domRoot).css({
			display : "block"
		});
		if (self.preDisplaySetupFunc) {
			self.preDisplaySetupFunc();
		}
		$(self.domRoot).css({
			visibility : "visible"
		});
	},
	fadeOut : function() {
		var self = this;
		$(self.domRoot).animate({
			opacity : 0
		}, 500, function() {
			self.close();
			$(this).css({
				opacity : 1
			});
		});
	}
};
var AJKImageSelector = function(data) {
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
};
AJKImageSelector.prototype = {
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
};
var AJKSelectedImagePanel = function(data) {
	var self = this;
	self.positionImageFunc = data.positionImageFunc;
	self.newImageFunc = data.newImageFunc;
	self.lightbox = "";
	self.domContent = "";
	self.domImageHolder = "";
	self.showPosClass = "tl-ah-fis-show-positioning";
};
AJKSelectedImagePanel.prototype = {
	init : function() {
		var self = this;
		self.initialiseContent();
		self.lightbox = new TLAdminLightbox({
			domClass : "tl-ah-selected-image-lightbox",
			title : "",
			intro : "",
			domContent : self.domContent
		}).init();
		return self;
	},
	initialiseContent : function() {
		var self = this;
		var insHTML = '<div><div class="tl-ah-fis-selected-image-holder ajk-fis-item-selected-image-holder">';
		insHTML += '<div class="tl-ah-fis-selected-image ajk-fis-item-selected-image"></div>';
		insHTML += '<div class="ajk-fis-selected-message tl-fis-selected-message">';
		insHTML += '<p>You have this image selected. Close panel or choose <a class="tl-ah-fis-new-image-link" href="#">new image</a></p>';
		insHTML += '</div>';
		insHTML += '</div>';
		insHTML += '<a id="tl-ah-image-position-panel-launch" class="tl-ah-field-option" href="#">Image positioning</a></div>';
		self.domContent = $(insHTML).get()[0];
		self.domImageHolder = $(self.domContent).find(".tl-ah-fis-selected-image").get()[0];
		$(self.domContent).find(".tl-ah-fis-new-image-link").click(function() {
			self.close();
			self.newImageFunc();
			return false;
		});
	},
	openPanelWithImage : function(data) {
		var self = this;
		var src = data.src;
		var positionable = data.positionable;
		$(self.domImageHolder).empty().append('<img src="' + src + '" />');
		if (positionable) {
			$(self.domContent).addClass(self.showPosClass);
		} else {
			$(self.domContent).removeClass(self.showPosClass);
		}
		self.lightbox.openPanel();
	},
	open : function() {
		var self = this;
		self.lightbox.openPanel();
	},
	close : function() {
		var self = this;
		self.lightbox.closePanel();
	}
};
var AJKImageUrlSelector = function(data) {
	var self = this;
	self.domRoot = "";
	self.lightbox = "";
	self.imageSelectedFunc = data.imageSelectedFunc;
	self.domContent = $("#ft-ah-imglink-panel").get()[0];
	self.domInput = $(self.domContent).find("input").get()[0];
	self.domButton = $(self.domContent).find(".button").get()[0];
	self.domImage = $(self.domContent).find("img").get()[0];
};
AJKImageUrlSelector.prototype = {
	init : function() {
		var self = this;
		self.lightbox = new TLAdminLightbox({
			domClass : "tl-ah-url-image-lightbox",
			title : TLConfigText['imageURLSelect_title'],
			intro : TLConfigText['imageURLSelect_intro'],
			domContent : self.domContent
		}).init();
		self.domRoot = self.lightbox.domRoot;
		$(self.domButton).click(function() {
			var imgSrc = self.processUrl({
				url : $(self.domInput).val()
			});
			self.imageSelectedFunc({
				src : imgSrc
			});
			return false;
		});
		return self;
	},
	processUrl : function(data) {
		var self = this;
		var url = data.url;
		if (url && url.indexOf("http://") == -1 && url.indexOf("https://") == -1) {
			url = "http://" + url;
		}
		return url;
	},
	launch : function(data) {
		var self = this;
		var domContentField = data.domContentField;
		var curImage = $(domContentField).val();
		$(self.domInput).val(curImage);
		if (curImage && (curImage.indexOf("http://") != -1 || curImage.indexOf("https://") != -1)) {
			self.domImage.src = curImage;
		} else {
			self.domImage.src = "../assets/ui/empty-image.gif";
		}
		self.lightbox.openPanel();
	},
	close : function() {
		var self = this;
		self.lightbox.closePanel();
	}
};
var AJKUploadImageSelector = function(data) {
	var self = this;
	self.domRoot = "";
	self.lightbox = "";
	self.remainingImagesFunc = data.remainingImagesFunc;
	self.imageLimitFunc = data.imageLimitFunc;
	self.imageSelectedFunc = data.imageSelectedFunc;
	self.showProgressClass = "ft-ah-imgup-upload-show-progress";
	self.showUploadClass = "ft-ah-imgup-upload-show-submitting";
	self.showUppingClass = "ft-ah-imgup-upload-show-upping";
	self.showErrorClass = "ft-ah-imgup-upload-show-error";
	self.domPCEncoded = $("#ft-ah-imgup-encoding span").get()[0];
	self.domUploadPanel = $("#ft-ah-imgup-submitting").get()[0];
	self.domForm = $("#ft-ah-imgup-upload-form").get()[0];
	self.domFlashHolder = $("#ft-ah-imgup-flash-holder").get()[0];
	self.lastEventType = "";
};
AJKUploadImageSelector.prototype = {
	init : function() {
		var self = this;
		var domContent = $("#ft-ah-imgup-upload").get()[0];
		self.lightbox = new TLAdminLightbox({
			domClass : "tl-ah-upload-image-lightbox",
			title : TLConfigText['imageUploader_title'],
			intro : TLConfigText['imageUploader_intro'],
			domContent : domContent
		}).init();
		self.domRoot = self.lightbox.domRoot;
		self.domRemainingImages = $("#tl-image-uploader-remaining").get()[0];
		self.domImageLimit = $("#tl-image-uploader-limit").get()[0];
		$(self.domUploadPanel).find("a.upload").click(function() {
			$("#agileUploaderSWF").get()[0].submit();
			self.clearStateStyles();
			$(self.domRoot).addClass(self.showUppingClass);
			return false;
		});
		$(self.domUploadPanel).find("a.cancel").click(function() {
			self.clearStateStyles();
			return false;
		});
		$("#ft-ah-imgup-try-again").click(function() {
			self.clearStateStyles();
			return false;
		});
		return self;
	},
	uploadEvent : function(data) {
		var self = this;
		if (data.type == "progress") {
			if (self.lastEventType != "progress") {
				self.clearStateStyles();
				$(self.domRoot).addClass(self.showProgressClass);
			}
			var pCent = data.file.percentEncoded;
			pCent = (pCent > 99) ? 99 : (pCent < 0) ? 0 : pCent;
			$(self.domPCEncoded).text(pCent);
		} else if (data.type == "preview") {
			self.clearStateStyles();
			$(self.domUploadPanel).find("img").remove();
			$(self.domUploadPanel).prepend('<img src="' + data.file.base64Thumbnail + '" />');
			$(self.domRoot).addClass(self.showUploadClass);
		} else if (data.type == "http_status") {
			if (data.response != 200) {
				self.clearStateStyles();
				$(self.domRoot).addClass(self.showErrorClass);
			}
		} else if (data.type == "server_response") {
			var imageUrl = data.response;
			if (imageUrl && imageUrl.indexOf("upload_error") == -1) {
				$(self.domFlashHolder).empty();
				self.close();
				self.imageSelectedFunc({
					src : imageUrl
				});
				self.clearStateStyles();
			} else {
				self.clearStateStyles();
				$(self.domRoot).addClass(self.showErrorClass);
			}
		}
		self.lastEventType = data.type;
	},
	generateFlashEmbed : function() {
		var self = this;
		var heightLimit = (self.imageSize == "small") ? 600 : 1500;
		var widthLimit = (self.imageSize == "small") ? 600 : 1500;
		if ($.browser.msie) {
			var iHTML = '<object id="agileUploaderSWF" width="334" height="90" data="/assets/image-resizer-uploader/agile-uploader.swf" type="application/x-shockwave-flash" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=">';
		} else {
			var iHTML = '<object id="agileUploaderSWF" width="334" height="90" data="/assets/image-resizer-uploader/agile-uploader.swf">';
		}
		iHTML += '<param name="movie" value="/assets/image-resizer-uploader/agile-uploader.swf">';
		iHTML += '<param name="bgcolor" value="#fff">';
		iHTML += '<param name="quality" value="high">';
		iHTML += '<param name="allowscriptaccess" value="always">';
		iHTML += '<param name="flashvars" value="max_height='
				+ heightLimit
				+ '&amp;max_width='
				+ widthLimit
				+ '&amp;jpg_quality=85&amp;preview_max_height=100&amp;preview_max_width=300&amp;show_encode_progress=true&amp;js_get_form_data=AJKUploadImageSelector.selector1.serializeForm&amp;js_event_handler=AJKUploadImageSelector.selector1.uploadEvent&amp;return_submit_response=true&amp;file_filter=*.jpg;*.jpeg;*.gif;*.png;*.JPG;*.JPEG;*.GIF;*.PNG&amp;file_filter_description=Files&amp;max_post_size=1572864&amp;file_limit=-1&amp;firebug=false&amp;form_action=http://'
				+ AJKHelpers.uploadDomain
				+ '/processimage.php&amp;button_up=/assets/image-resizer-uploader/browse_up.png&amp;button_down=/assets/image-resizer-uploader/browse_down.png&amp;button_over=/assets/image-resizer-uploader/browse_over.png">';
		iHTML += '<param name="wmode" value="transparent">';
		iHTML += '</object>';
		$(self.domFlashHolder).empty().append(iHTML);
	},
	serializeForm : function() {
		var self = this;
		return $(self.domForm).serialize();
	},
	clearStateStyles : function() {
		var self = this;
		$(self.domRoot).removeClass(self.showProgressClass + " " + self.showUploadClass + " " + self.showUppingClass + " " + self.showErrorClass);
	},
	updateRemainingImages : function() {
		var self = this;
		if (self.remainingImagesFunc && !self.isStandardPage) {
			var numImages = self.remainingImagesFunc();
			$(self.domRemainingImages).text(numImages);
			if (numImages > 0) {
				$(self.domRoot).removeClass("tl-ah-fis-disable-image-selection");
			} else {
				$(self.domRoot).addClass("tl-ah-fis-disable-image-selection");
			}
		}
		if (self.imageLimitFunc) {
			var numImages = self.imageLimitFunc();
			$(self.domImageLimit).text(numImages);
		}
	},
	launch : function(data) {
		var self = this;
		self.imageSize = data.imageSize;
		self.clearStateStyles();
		self.updateRemainingImages();
		self.lightbox.openPanel();
		self.generateFlashEmbed();
	},
	close : function() {
		var self = this;
		self.lightbox.closePanel();
	}
};
var AJKFlickrImageSelector = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.controller = data.controller;
	self.imageSelectedFunc = data.imageSelectedFunc;
	self.remainingFlickrImagesFunc = data.remainingFlickrImagesFunc;
	self.feedSelector = "";
	self.flickrApiKey = theTLSettings.flickrApiKey;
	self.numItemsPerPage = 12;
	self.imageSize = "";
	self.cachedFlickrUsers = new Array();
	self.domNumImages = "";
	self.domCaptionField = "";
};
AJKFlickrImageSelector.prototype = {
	init : function() {
		var self = this;
		self.feedSelector = new AJKFeedItemSelector({
			domRoot : self.domRoot,
			domClass : "tl-ah-flickr-image-selector",
			title : TLConfigText['flickrImageSelector_title'],
			intro : TLConfigText['flickrImageSelector_intro'],
			numItemsPerPage : self.numItemsPerPage,
			option1Title : TLConfigText['flickrImageSelector_option1Title'],
			option1Text : TLConfigText['flickrImageSelector_option1Text'],
			option1Label : TLConfigText['flickrImageSelector_option1Label'],
			option1Message : TLConfigText['flickrImageSelector_option1Message'] + " 'X_CRITERIA_X'",
			option2Title : TLConfigText['flickrImageSelector_option2Title'],
			option2Text : TLConfigText['flickrImageSelector_option2Text'],
			option2Label : TLConfigText['flickrImageSelector_option2Label'],
			option2Message : TLConfigText['flickrImageSelector_option2Message'] + " 'X_CRITERIA_X'",
			itemSelectedFunc : function(data) {
				var item = data.item;
				self.showSelectedItem({
					src : item[self.imageSize]
				});
				if (self.domCaptionField) {
					$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
						method : "flickr.photos.getInfo",
						api_key : self.flickrApiKey,
						photo_id : item.id,
						secret : item.secret,
						format : "json"
					}, function(data) {
						var displayName = (data.photo.owner.realname) ? data.photo.owner.realname : data.photo.owner.username;
						var userUrl = "http://www.flickr.com/people/" + data.photo.owner.nsid + "/";
						var caption = TLConfigText['flickrImageSelector_Photo_credit'] + ': <a href="' + userUrl + '">' + displayName + '</a>';
						$(self.domCaptionField).val(caption);
						$(self.domCaptionField).blur();
						if (self.domThumbPosField) {
							$(self.domThumbPosField).val("0,0").blur();
						}
					});
				}
			},
			processFeedFunc : function(data) {
				var fieldData = data.fieldData;
				var page = data.page;
				var callback = data.callback;
				if (fieldData["opt1Search"]) {
					$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
						method : "flickr.photos.search",
						text : fieldData["opt1Search"],
						page : data.page,
						per_page : self.numItemsPerPage,
						license : "1,2,3,4,5,6,7",
						api_key : self.flickrApiKey,
						format : "json"
					}, function(data) {
						var numPages = data.photos.pages;
						self.feedSelector.setNumberOfPages({
							value : numPages
						});
						var returnObjs = self.processImageJSONFromArray({
							anArray : data.photos.photo
						});
						if (callback) {
							callback({
								itemObjs : returnObjs
							});
						}
					});
				} else if (fieldData["opt2Search"]) {
					var flickrUsername = fieldData["opt2Search"];
					if (!self.cachedFlickrUsers[flickrUsername]) {
						$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
							method : "flickr.people.findByUsername",
							username : flickrUsername,
							api_key : self.flickrApiKey,
							format : "json"
						}, function(data) {
							if (!data.user) {
								if (callback) {
									callback({});
								}
								return;
							}
							var userId = data.user.nsid;
							self.cachedFlickrUsers[flickrUsername] = {
								username : flickrUsername,
								userId : userId
							};
							self.getPhotosForUser({
								userId : userId,
								page : page,
								callback : function(data) {
									if (callback) {
										callback(data);
									}
								}
							});
						});
					} else {
						self.getPhotosForUser({
							userId : self.cachedFlickrUsers[flickrUsername].userId,
							page : page,
							callback : function(data) {
								if (callback) {
									callback(data);
								}
							}
						});
					}
				}
			}
		}).init();
		self.domNumImages = $(self.domRoot).find("#tl-flickr-image-limiter").get()[0];
		return self;
	},
	showSelectedItem : function(data) {
		var self = this;
		var src = data.src;
		self.imageSelectedFunc({
			src : src
		});
	},
	getPhotosForUser : function(data) {
		var self = this;
		var userId = data.userId;
		var callback = data.callback;
		var page = data.page;
		$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
			method : "flickr.people.getPublicPhotos",
			user_id : userId,
			page : page,
			per_page : self.numItemsPerPage,
			api_key : self.flickrApiKey,
			format : "json"
		}, function(data) {
			var numPages = data.photos.pages;
			self.feedSelector.setNumberOfPages({
				value : numPages
			});
			var returnObjs = self.processImageJSONFromArray({
				anArray : data.photos.photo
			});
			if (callback) {
				callback({
					itemObjs : returnObjs
				});
			}
		});
	},
	processImageJSONFromArray : function(data) {
		var self = this;
		var anArray = data.anArray;
		var returnObjs = new Array();
		var counter = 0;
		$.each(anArray, function() {
			var anObj = {
				id : this.id,
				owner : this.owner,
				caption : this.title,
				secret : this.secret,
				thumb : "http://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_s.jpg",
				small : "http://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_m.jpg",
				medium : "http://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_-.jpg",
				large : "http://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_b.jpg",
				index : counter++
			};
			anObj.domEl = self.createDomItem({
				anItemObj : anObj
			});
			returnObjs.push(anObj);
		});
		return returnObjs;
	},
	createDomItem : function(data) {
		var self = this;
		var anItemObj = data.anItemObj;
		var thumbUrl = anItemObj.thumb;
		var index = anItemObj.index;
		var extraClass = (index % (self.numItemsPerPage / 2) == 0) ? " tl-ah-fis-image-block-row-start" : "";
		var insertHTML = "";
		insertHTML += '<div class="tl-ah-fis-image-block' + extraClass + '">';
		insertHTML += '<a class="ajk-fis-select-click tl-ah-fis-image-holder" href="#">';
		insertHTML += '<img src="' + thumbUrl + '"/>';
		insertHTML += '</a>';
		insertHTML += '<a class="tl-ah-fis-image-expand ajk-fis-image-expand" href="#">' + TLConfigText['flickrImageSelector_Expand'] + '</a>';
		insertHTML += '</div>';
		return $(insertHTML).get()[0];
	},
	updateRemainingImages : function() {
		var self = this;
		if (self.remainingFlickrImagesFunc && !self.controller.isStandardPage) {
			var numImages = self.remainingFlickrImagesFunc();
			$(self.domNumImages).text(numImages);
			if (numImages > 0) {
				$(self.domRoot).removeClass("tl-ah-fis-disable-image-selection");
			} else {
				$(self.domRoot).addClass("tl-ah-fis-disable-image-selection");
			}
		}
	},
	launch : function(data) {
		var self = this;
		self.imageSize = data.imageSize;
		self.domCaptionField = data.domCaptionField;
		self.domThumbPosField = data.domThumbPosField;
		if (self.alreadyLaunched) {
			return self.open();
		}
		self.alreadyLaunched = true;
		self.updateRemainingImages();
		self.feedSelector.openPanel();
	},
	close : function() {
		var self = this;
		self.updateRemainingImages();
		self.feedSelector.closePanel();
	},
	open : function() {
		var self = this;
		self.feedSelector.openPanel();
	}
};
var AJKFeedItemSelector = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.domFade = $(self.domRoot).find(".ajk-ah-fis-fade").get()[0];
	self.domMainTitle = $(self.domRoot).find(".ajk-fis-header-title").get()[0];
	self.domMainIntro = $(self.domRoot).find(".ajk-fis-header-intro").get()[0];
	self.domOption1Title = $(self.domRoot).find(".ajk-fis-option-1-title").get()[0];
	self.domOption1Text = $(self.domRoot).find(".ajk-fis-option-1-text").get()[0];
	self.domOption2Title = $(self.domRoot).find(".ajk-fis-option-2-title").get()[0];
	self.domOption2Text = $(self.domRoot).find(".ajk-fis-option-2-text").get()[0];
	self.domOption1Input = $(self.domRoot).find(".ajk-fis-option-1-input").get()[0];
	self.domOption2Input = $(self.domRoot).find(".ajk-fis-option-2-input").get()[0];
	self.domItemCarouselStage = $(self.domRoot).find(".ajk-fis-item-carousel-stage").get()[0];
	self.domItemCarouselFade = $(self.domRoot).find(".ajk-fis-item-carousel-fade").get()[0];
	self.domNumPages = $(self.domRoot).find(".ajk-fis-controls-num-pages").get()[0];
	self.domCurrentPage = $(self.domRoot).find(".ajk-fis-controls-page").get()[0];
	self.domPanel = $(self.domRoot).find(".ajk-fis-panel").get()[0];
	self.domClose = $(self.domRoot).find(".ajk-fis-close").get()[0];
	self.domNextPage = $(self.domRoot).find(".ajk-fis-controls-next").get()[0];
	self.domPrevPage = $(self.domRoot).find(".ajk-fis-controls-prev").get()[0];
	self.domControls = $(self.domRoot).find(".ajk-fis-controls").get()[0];
	self.domSearchMessage = $(self.domRoot).find(".ajk-fis-search-text").get()[0];
	self.itemSelectedFunc = data.itemSelectedFunc;
	self.domClass = data.domClass;
	self.title = data.title;
	self.intro = data.intro;
	self.option1Title = data.option1Title;
	self.option1Text = data.option1Text;
	self.option1Label = data.option1Label;
	self.option1Message = data.option1Message;
	self.option2Title = data.option2Title;
	self.option2Text = data.option2Text;
	self.option2Label = data.option2Label;
	self.option2Message = data.option2Message;
	self.processFeedFunc = data.processFeedFunc;
	self.createDomItem = data.createDomItem;
	self.numItemsPerPage = data.numItemsPerPage;
	self.currentlySubmitting = false;
	self.currentPage = 1;
	self.numItemsPerPage = data.numItemsPerPage;
	self.numPages = 0;
	self.selectedVerifier = "";
	self.activeFieldData = "";
	self.panelHeight = "";
};
AJKFeedItemSelector.prototype = {
	init : function() {
		var self = this;
		$(self.domRoot).addClass(self.domClass);
		$(self.domMainTitle).html(self.title);
		$(self.domMainIntro).html(self.intro);
		$(self.domOption1Title).html(self.option1Title);
		$(self.domOption1Text).html(self.option1Text);
		$(self.domOption2Title).html(self.option2Title);
		$(self.domOption2Text).html(self.option2Text);
		$(self.domOption1Input).val(self.option1Label);
		$(self.domOption2Input).val(self.option2Label);
		$(self.domClose).click(function() {
			self.closePanel();
			return false;
		});
		$(self.domRoot).find(".ajk-verifier").each(function() {
			new AJKVerifier({
				domRootEl : this,
				submitFunc : function(data) {
					self.activeFieldData = data.fieldData;
					self.loadPage({
						fieldData : self.activeFieldData,
						page : 1
					});
					if (self.activeFieldData["opt1Search"]) {
						$(self.domSearchMessage).text(self.option1Message.replace("X_CRITERIA_X", self.activeFieldData["opt1Search"]));
					} else if (self.activeFieldData["opt2Search"]) {
						$(self.domSearchMessage).text(self.option2Message.replace("X_CRITERIA_X", self.activeFieldData["opt2Search"]));
					}
				}
			}).init();
		});
		$(self.domNextPage).click(function() {
			if (!self.currentlySubmitting) {
				self.loadPage({
					fieldData : self.activeFieldData,
					page : self.currentPage + 1
				});
			}
			return false;
		});
		$(self.domPrevPage).click(function() {
			if (!self.currentlySubmitting) {
				self.loadPage({
					fieldData : self.activeFieldData,
					page : self.currentPage - 1
				});
			}
			return false;
		});
		$(self.domFade).click(function() {
			self.closePanel();
		});
		return self;
	},
	loadPage : function(data) {
		var self = this;
		if (self.currentlySubmitting) {
			return;
		}
		self.currentlySubmitting = true;
		self.showFader({
			instantly : true
		});
		var newPage = data.page;
		var fieldData = data.fieldData;
		self.currentPage = newPage;
		self.processFeedFunc({
			fieldData : fieldData,
			page : newPage,
			callback : function(data) {
				self.displayItems({
					items : data.itemObjs
				});
				setTimeout(function() {
					self.currentlySubmitting = false;
					self.hideFader();
				}, 500);
			}
		});
	},
	setNumberOfPages : function(data) {
		var self = this;
		self.numPages = (data.value > 1000) ? 1000 : data.value;
		self.updateControls();
	},
	updateControls : function() {
		var self = this;
		$(self.domNumPages).text(self.numPages);
		$(self.domCurrentPage).text(self.currentPage);
		if (self.currentPage == 1) {
			$(self.domPrevPage).css({
				visibility : "hidden"
			});
		} else {
			$(self.domPrevPage).css({
				visibility : "visible"
			});
		}
		if (self.currentPage >= self.numPages) {
			$(self.domNextPage).css({
				visibility : "hidden"
			});
		} else {
			$(self.domNextPage).css({
				visibility : "visible"
			});
		}
		$(self.domControls).css({
			visibility : "visible"
		});
	},
	displayItems : function(data) {
		var self = this;
		var items = data.items;
		$(self.domItemCarouselStage).empty();
		if (items) {
			$.each(items, function() {
				$(self.domItemCarouselStage).append(this.domEl);
				var thisItem = this;
				$(this.domEl).find(".ajk-fis-select-click").click(function() {
					self.itemSelectedFunc({
						item : thisItem
					});
					return false;
				});
			});
		} else {
			$(self.domControls).css({
				visibility : "hidden"
			});
			$(self.domPrevPage).css({
				visibility : "hidden"
			});
			$(self.domNextPage).css({
				visibility : "hidden"
			});
		}
	},
	showFader : function(data) {
		var self = this;
		var animTime = (data && data.instantly) ? 0 : 500;
		$(self.domItemCarouselFade).css({
			opacity : 0,
			display : "block"
		}).animate({
			opacity : 1
		}, animTime);
	},
	hideFader : function() {
		var self = this;
		$(self.domItemCarouselFade).animate({
			opacity : 0
		}, 500, function() {
			$(this).css({
				opacity : 0,
				display : "none"
			});
		});
	},
	openPanel : function() {
		var self = this;
		theAJKWindowResizeEvent.registerAsObserver({
			observer : self
		});
		$(self.domRoot).css({
			visibility : "hidden",
			display : "block"
		});
		var viewportSize = AJKHelpers.viewportSize();
		self.sizeComponents({
			viewportSize : viewportSize
		});
		$(self.domRoot).css({
			visibility : "visible"
		});
		if ($.browser.msie) {
			$(self.domOption1Input).focus();
			$(self.domOption1Input).blur();
			$(self.domOption2Input).focus();
			$(self.domOption2Input).blur();
		}
	},
	closePanel : function() {
		var self = this;
		$(self.domRoot).css({
			display : "none"
		});
		theAJKWindowResizeEvent.removeAsObserver({
			observer : self
		});
	},
	windowDidResize : function(data) {
		var self = this;
		var newSize = data.newSize;
		self.sizeComponents({
			viewportSize : newSize
		});
	},
	sizeComponents : function(data) {
		var self = this;
		var viewportSize = data.viewportSize;
		$(self.domRoot).css({
			width : viewportSize.width,
			height : viewportSize.height
		});
		self.panelHeight = (self.panelHeight) ? self.panelHeight : $(self.domPanel).height();
		$(self.domPanel).css({
			top : parseInt(viewportSize.height - self.panelHeight) / 2
		});
	}
};
var AJKScrollableListController = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.domStage = data.domStage;
	self.listItems = data.listItems;
	self.itemWasClickedFunc = data.itemWasClickedFunc;
	self.createDomListItemFunc = data.createDomListItemFunc;
	self.getPositionForListItem = data.getPositionForListItem;
	self.getKeyForListItem = data.getKeyForListItem;
	self.listItemSelectClass = data.listItemSelectClass;
	self.contentScroller = "";
	self.listItemClass = "ajk-scrollable-list-item";
	self.listIdString = "ajk-scrollable-list-item-";
	self.listIdInc = 1;
	self.listIdAttr = "ajkListItemId";
	self.listItemsByKey = new Array();
	self.numListItems = 0;
	self.domListItemsByListItemKey = new Array();
};
AJKScrollableListController.prototype = {
	init : function() {
		var self = this;
		self.contentScroller = new AJKContentScrollerController({
			domRootEl : self.domRoot
		}).init();
		$(self.domStage).empty();
		$.each(self.listItems, function() {
			var domListItem = self.createDomListItem({
				listItem : this
			});
			$(self.domStage).append(domListItem);
		});
		self.contentScroller.enable();
		self.initialiseClickFunctionality();
		return self;
	},
	resetWithNewListItems : function(data) {
		var self = this;
		self.listItems = data.listItems;
		$(self.domStage).empty();
		self.domListItemsByListItemKey = new Array();
		self.numListItems = 0;
		$.each(self.listItems, function() {
			var domListItem = self.createDomListItem({
				listItem : this
			});
			$(self.domStage).append(domListItem);
		});
		self.contentScroller.reset();
		self.contentScroller.enable();
	},
	resetHeightTo : function(data) {
		var self = this;
		var height = data.height;
		$(self.domRoot).css({
			height : height
		});
		self.contentScroller.resetSize();
	},
	createDomListItem : function(data) {
		var self = this;
		var listItem = data.listItem;
		var listItemKey = self.getKeyForListItem({
			listItem : listItem
		});
		var domListItem = self.createDomListItemFunc({
			listItem : listItem
		});
		$(domListItem).addClass(self.listItemClass);
		var listId = self.listIdString + self.listIdInc++;
		$(domListItem).attr(self.listIdAttr, listId);
		self.listItemsByKey[listId] = listItem;
		self.domListItemsByListItemKey[listItemKey] = domListItem;
		self.numListItems++;
		return domListItem;
	},
	initialiseClickFunctionality : function() {
		var self = this;
		$(self.domStage).click(function(e) {
			var domListItem = AJKHelpers.getSelfOrFirstParantOfClass({
				domEl : e.target,
				className : self.listItemClass
			});
			if (domListItem) {
				var listItemId = $(domListItem).attr("ajkListItemId");
				var listItem = self.listItemsByKey[listItemId];
				self.itemWasClickedFunc({
					listItem : listItem,
					clickedElClass : e.target.className
				});
			}
			return false;
		});
	},
	addListItemAtIndex : function(data) {
		var self = this;
		var listItem = data.listItem;
		var index = data.index;
		index = (index == "last") ? self.numListItems : index;
		var domListItem = self.createDomListItem({
			listItem : listItem
		});
		if (index === 0 || self.numListItems === 0) {
			$(self.domStage).prepend(domListItem);
		} else {
			var prevDomListItem = $(self.domStage).find("." + self.listItemClass + ":eq(" + (index - 1) + ")").get()[0];
			$(prevDomListItem).after(domListItem);
		}
		self.refresh();
	},
	removeListItem : function(data) {
		var self = this;
		var listItem = data.listItem;
		var domListItem = self.getDomElForListItem({
			listItem : listItem
		});
		$(domListItem).remove();
		self.selectedListItem = (self.selectedListItem == listItem) ? "" : self.selectedListItem;
		var listItemKey = self.getKeyForListItem({
			listItem : listItem
		});
		self.domListItemsByListItemKey[listItemKey] = "";
		self.refresh();
	},
	selectListItem : function(data) {
		var self = this;
		var listItem = data.listItem;
		if (self.selectedListItem) {
			var domListItem = self.getDomElForListItem({
				listItem : self.selectedListItem
			});
			$(domListItem).removeClass(self.listItemSelectClass);
		}
		self.selectedListItem = listItem;
		var domListItem = self.getDomElForListItem({
			listItem : self.selectedListItem
		});
		$(domListItem).addClass(self.listItemSelectClass);
	},
	showAndSelectListItem : function(data) {
		var self = this;
		var listItem = data.listItem;
		var domListItem = self.getDomElForListItem({
			listItem : listItem
		});
		var instantly = data.instantly;
		var dlTop = AJKHelpers.getCoordsOfDomEl({
			domEl : domListItem
		}).y;
		var stageTop = AJKHelpers.getCoordsOfDomEl({
			domEl : self.domStage
		}).y;
		self.contentScroller.animateToPos({
			pos : (dlTop - stageTop),
			instantly : instantly
		});
		self.selectListItem({
			listItem : listItem
		});
	},
	getDomElForListItem : function(data) {
		var self = this;
		var listItem = data.listItem;
		var listItemKey = self.getKeyForListItem({
			listItem : listItem
		});
		var domListItem = self.domListItemsByListItemKey[listItemKey];
		return domListItem;
	},
	refresh : function() {
		var self = this;
		self.contentScroller.enable();
	}
};
var TLAdminController = function(data) {
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
};
TLAdminController.prototype = {
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
																				self.adminAlertController.displayMessage({
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
																					body : "<p>" + TLConfigText["teacherAccount_pupilUpgradePanel_Success_message"] + "</p>",
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
		self.storyFormVerifier = new AJKVerifier({
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
				theAJKAjaxController.request({
					action : action,
					method : "post",
					vars : vars,
					callback : function(xml) {
						if (relatedStory.id == "awaitingId") {
							relatedStory.id = $(xml).find("storyId").text();
							if (!relatedStory.id) {
								self.adminAlertController.displayMessage({
									headline : "Could not create story",
									hideClose : true,
									body : "<p>Something went wrong when we tried to create this story in our database.</p><p>Please reload the timeline and try again.</p>"
								});
								return;
							}
						} else {
							if (!xml || $(xml).find("success").text() != "true") {
								self.adminAlertController.displayMessage({
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
		self.timelineListController = new AJKScrollableListController({
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
				insertHTML += '<a href="#">' + TLConfigText['adminBasic_Edit'] + '</a> | <a class="tl-ah-li-delete" href="#">' + TLConfigText['adminBasic_Delete'] + '</a>';
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
		self.storyListController = new AJKScrollableListController({
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
				insertHTML += '<a href="#">' + TLConfigText['adminBasic_Edit'] + '</a> | <a class="tl-ah-li-delete" href="#">' + TLConfigText['adminBasic_Delete'] + '</a>';
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
								insertHTML += '<a href="#">' + TLConfigText['adminBasic_Edit'] + '</a> | <a class="tl-ah-li-delete" href="#">' + TLConfigText['adminBasic_Delete']
										+ '</a>';
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
								insertHTML += '<a href="#">' + TLConfigText['adminBasic_Edit'] + '</a> | <a class="tl-ah-li-delete" href="#">' + TLConfigText['adminBasic_Delete']
										+ '</a>';
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
						body : '<p>' + TLConfigText["story_unsavedChanges_message1"] + ' “' + self.selectedStory.headline + '”. ' + TLConfigText["story_unsavedChanges_message2"]
								+ '</p>',
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
						body : '<p>' + TLConfigText["story_unsavedStory_message1"] + ' “' + self.selectedStory.headline + '”. ' + TLConfigText["story_unsavedStory_message2"]
								+ '</p>',
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
				previewEmbed = 'http://' + self.timeline.host + '/previewembed/entry/' + self.timeline.id + '/' + self.timeline.embedHash + '/' + embWidth + '/' + embHeight + '/';
				var embedCode = '<iframe frameborder="0" style="border-width:0;" id="tl-timeline-iframe" width="' + embWidth + '" height="' + embHeight + '" src="' + embSrc
						+ '"></iframe>' + "\n";
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
};
var TLAdminEventCatcher = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.topPos = "";
	self.domCutOffEl = "";
	self.clickFunc = "";
	self.active = false;
};
TLAdminEventCatcher.prototype = {
	init : function() {
		var self = this;
		self.topPos = AJKHelpers.getCoordsOfDomEl({
			domEl : self.domRoot
		}).y;
		$(self.domRoot).click(function() {
			if (self.clickFunc) {
				self.clickFunc();
			}
		});
		return self;
	},
	deactivate : function() {
		var self = this;
		$(self.domRoot).css({
			height : 0
		});
		theTLMainController.selected3DView.disableHover = false;
		self.active = false;
	},
	activate : function(data) {
		var self = this;
		theTLMainController.selected3DView.disableHover = true;
		var cutOffPos = AJKHelpers.getCoordsOfDomEl({
			domEl : self.domCutOffEl
		}).y;
		$(self.domRoot).css({
			height : cutOffPos - self.topPos
		});
		self.active = true;
	},
	setupAction : function(data) {
		var self = this;
		self.domCutOffEl = data.domCutOffEl;
		self.clickFunc = data.clickFunc;
	},
	fakeClick : function() {
		var self = this;
		$(self.domRoot).click();
	}
};
var TLTimelineAdvancedSettingsController = function(data) {
	var self = this;
	self.domRoot = "";
	self.controller = data.controller;
	self.mainController = self.controller.mainController;
	self.timeline = self.mainController.timeline;
	self.verifier = "";
	self.lightbox = "";
	self.contentScroller = "";
	self.dateFieldFormatters = [];
};
TLTimelineAdvancedSettingsController.prototype = {
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
};
var TLDateFormatterField = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.domInput = $(data.domRoot).find("input").get()[0];
	self.domSelect = "";
	self.verifier = data.verifier;
	self.fieldName = $(self.domInput).attr("name");
};
TLDateFormatterField.prototype = {
	init : function() {
		var self = this;
		self.domSelect = self.createSelect();
		$(self.domRoot).find(".tl-ah-input").before(self.domSelect);
		$(self.domInput).change(function() {
			$(self.domSelect).val($(this).val());
		});
		$(self.domInput).keyup(function() {
			$(self.domSelect).val($(this).val());
		});
		$(self.domSelect).change(function() {
			if (self.verifier) {
				var data = {};
				data[self.fieldName] = $(this).val();
				self.verifier.setFieldValues({
					fieldValues : data,
					forceChangeEvent : true
				});
			} else {
				$(self.domInput).val($(this).val());
			}
		});
		return self;
	},
	updateFromFieldValue : function() {
		var self = this;
		$(self.domSelect).val($(self.domInput).val());
	},
	createSelect : function() {
		var self = this;
		var insertHTML = '<select>';
		$.each(TLConfigText["dateFormatting_items"], function() {
			insertHTML += '<option value="' + this[0] + '">' + this[1] + '</option>';
		});
		insertHTML += '</select>';
		return $(insertHTML).get()[0];
	}
};
var TLAdminFeedController = function(data) {
	var self = this;
	self.controller = data.controller;
	self.timeline = self.controller.timeline;
	self.mainController = self.controller.mainController;
	self.eventCatcherController = self.controller.eventCatcherController;
	self.listController = "";
	self.domRoot = $("#tab-my-selected-timeline-feeds").get()[0];
	self.selectedFeed = "";
	self.domSelectedFeedHeadline = $(self.domRoot).find("#tl-ah-selected-feed-title").get()[0];
	self.verifier = "";
	self.domForm = $(self.domRoot).find("#tl-ah-timeline-feeds-form").get()[0];
	self.domSourceSpecificFields = $(self.domRoot).find(".tl-feeds-source-specific-fields").get();
	self.domFilterSpecificFields = $(self.domRoot).find(".tl-feeds-filter-specific-fields").get();
	self.flickrApiKey = theTLSettings.flickrApiKey;
};
TLAdminFeedController.prototype = {
	init : function() {
		var self = this;
		self.setupList();
		self.setupVerifier();
		$(self.domRoot).find("#tl-ah-story-add-feed-button").click(function() {
			if (self.timeline.feeds.length < 5) {
				self.createNewFeed();
			} else {
				self.controller.adminAlertController.displayMessage({
					headline : TLConfigText["feedsPanel_feedLimit_title"],
					body : '<p>' + TLConfigText["feedsPanel_feedLimit_message"] + '</p>'
				});
			}
			return false;
		});
		$(self.domForm).css({
			display : "none"
		});
		$("#tl-feeds-tab-menu-item").click(function() {
			if (self.selectedFeed) {
				self.selectFeed({
					feed : self.selectedFeed,
					forceUpdate : true
				});
			} else {
				self.feedPanelOpened();
			}
			self.controller.helpController.setBaseHelpByName({
				baseName : "help-feed"
			});
		});
	},
	updateSourceSpecificFields : function(data) {
		var self = this;
		var source = data.source;
		$(self.domSourceSpecificFields).css({
			display : "none"
		});
		$("#tl-feeds-" + source + "-fields").css({
			display : "block"
		});
		if (source == "json") {
			$("#tl-ah-feeds-num-items-field").css({
				display : "none"
			});
		} else {
			$("#tl-ah-feeds-num-items-field").css({
				display : "block"
			});
		}
		var filterValue = self.verifier.getFieldValueFromName({
			fieldName : "feed_" + source + "_filter"
		});
		self.updateFilterSpecificFields({
			filter : filterValue
		});
	},
	updateFilterSpecificFields : function(data) {
		var self = this;
		var filter = data.filter;
		$(self.domFilterSpecificFields).css({
			display : "none"
		});
		$("#tl-feeds-" + filter + "-fields").css({
			display : "block"
		});
	},
	setupVerifier : function() {
		var self = this;
		self.verifier = new AJKVerifier(
				{
					domRootEl : self.domForm,
					cancelFunc : function() {
						self.deleteFeed({
							feed : self.selectedFeed
						});
					},
					revertFunc : function() {
						self.verifier.restoreSavedFieldValues();
					},
					submitFunc : function(data) {
						self.controller.displayStandardSavingAlertMessage();
						var oldParam1 = self.selectedFeed.param1;
						var oldFilter = self.selectedFeed.filter;
						var oldSource = self.selectedFeed.source;
						var oldNumItems = self.selectedFeed.numItems;
						var feedNeedsUpdating = false;
						var vars = data.fieldData;
						vars["timelineId"] = self.timeline.id;
						vars["id"] = self.selectedFeed.id;
						self.selectedFeed.name = vars["feedName"];
						self.selectedFeed.source = vars["feedSource"];
						self.selectedFeed.filter = vars["feed_" + vars["feedSource"] + "_filter"];
						switch (vars["feedSource"]) {
						case "flickr":
							if (self.selectedFeed.filter == "flickr-username") {
								self.selectedFeed.param1 = vars["feedFlickrUsername"];
							} else if (self.selectedFeed.filter == "flickr-search") {
								self.selectedFeed.param1 = vars["feedFlickrSearch"];
							} else {
								self.selectedFeed.param1 = "";
							}
							self.selectedFeed.param2 = "";
							break;
						case "twitter":
							if (self.selectedFeed.filter == "twitter-username") {
								self.selectedFeed.param1 = vars["feedTwitterUsername"];
							} else if (self.selectedFeed.filter == "twitter-search") {
								self.selectedFeed.param1 = vars["feedTwitterSearch"];
							} else {
								self.selectedFeed.param1 = "";
							}
							self.selectedFeed.param2 = "";
							break;
						case "youtube":
							if (self.selectedFeed.filter == "youtube-username") {
								self.selectedFeed.param1 = vars["feedYouTubeUsername"];
							} else if (self.selectedFeed.filter == "youtube-search") {
								self.selectedFeed.param1 = vars["feedYouTubeSearch"];
							} else {
								self.selectedFeed.param1 = "";
							}
							self.selectedFeed.param2 = "";
							break;
						case "rss":
							break;
						}
						vars["param1"] = self.selectedFeed.param1;
						vars["param2"] = self.selectedFeed.param2;
						vars["feedId"] = self.selectedFeed.id;
						vars["feedFilter"] = self.selectedFeed.filter;
						self.selectedFeed.path = self.generateFeedPath({
							feed : self.selectedFeed
						});
						vars["path"] = self.selectedFeed.path;
						self.selectedFeed.numItems = vars["numItems"];
						var relatedFeed = self.selectedFeed;
						var newItem = (self.selectedFeed.id == "awaitingId") ? true : false;
						var action = (newItem) ? "/admin/addfeedtotimeline/" : "/admin/updatefeed/";
						self.verifier.saveFieldValues();
						self.verifier.hideCancelButton();
						self.verifier.showRevertButton();
						self.verifier.disableSaveAndRevert();
						self.eventCatcherController.deactivate();
						var existingFeedNeedsToBeReloaded = false;
						if (!newItem
								&& (oldParam1 != self.selectedFeed.param1 || oldFilter != self.selectedFeed.filter || oldSource != self.selectedFeed.source || oldNumItems != self.selectedFeed.numItems)) {
							existingFeedNeedsToBeReloaded = true;
						}
						theAJKAjaxController.request({
							action : action,
							method : "post",
							vars : vars,
							callback : function(xml) {
								if (newItem) {
									var feedId = $(xml).find("feedId").text();
									relatedFeed.id = feedId;
									self.mainController.feedController.loadNewFeed({
										feed : relatedFeed,
										callback : function() {
											self.mainController.refreshTimelineAfterFeedChange();
											self.controller.adminAlertController.fadeOut();
										}
									});
									if (self.selectedFeed == relatedFeed) {
										self.listController.resetWithNewListItems({
											listItems : self.timeline.feeds
										});
										self.listController.showAndSelectListItem({
											listItem : relatedFeed,
											instantly : true
										});
									}
								} else {
									self.listController.resetWithNewListItems({
										listItems : self.timeline.feeds
									});
									if (self.selectedFeed == relatedFeed) {
										self.listController.showAndSelectListItem({
											listItem : relatedFeed,
											instantly : true
										});
									}
									if (existingFeedNeedsToBeReloaded) {
										self.mainController.feedController.removeFeed({
											feed : relatedFeed
										});
										self.mainController.feedController.loadNewFeed({
											feed : relatedFeed,
											callback : function() {
												self.mainController.refreshTimelineAfterFeedChange();
												self.controller.adminAlertController.fadeOut();
											}
										});
									} else {
										setTimeout(function() {
											self.controller.adminAlertController.fadeOut();
										}, 1);
									}
								}
								var viewRefreshNeededForCategoryBandView = false;
								if (self.selectedFeed.category.id != vars["feedCategory"]) {
									self.selectedFeed.category = self.timeline.categoriesByKey[self.mainController.categoriesKeyPrefix + vars["feedCategory"]];
									self.selectedFeed.category = (self.selectedFeed.category) ? self.selectedFeed.category : self.mainController.defaultCategory;
									if (self.selectedFeed.markers) {
										$.each(self.selectedFeed.markers, function() {
											this.category = self.selectedFeed.category;
											this.categoryHasChanged();
										});
									}
									viewRefreshNeededForCategoryBandView = true;
								}
								if (viewRefreshNeededForCategoryBandView && self.timeline.viewType) {
									self.controller.refreshTimelineView();
								}
							}
						});
					}
				}).init();
	},
	generateFeedPath : function(data) {
		var self = this;
		var feed = data.feed;
		var path = "";
		switch (feed.source) {
		case "flickr":
			path = "";
			break;
		}
		return path;
	},
	createNewFeed : function() {
		var self = this;
		var newFeed = {
			name : TLConfigText["feedsPanel_New_Feed"],
			source : "youtube",
			filter : "youtube-top_rated",
			param1 : "",
			param2 : "",
			path : "",
			orderIndex : self.timeline.feeds.length,
			id : "awaitingId",
			category : (self.timeline.categories[0]) ? self.timeline.categories[0] : self.mainController.defaultCategory,
			numItems : 10
		};
		self.listController.addListItemAtIndex({
			listItem : newFeed,
			index : self.timeline.feeds.length
		});
		self.timeline.feeds.push(newFeed);
		self.selectFeed({
			feed : newFeed,
			isNewFeed : true
		});
	},
	clearFields : function() {
		var self = this;
		self.verifier.setFieldValues({
			fieldValues : {
				feedFlickrSearch : "",
				feedFlickrUsername : "",
				feedYouTubeSearch : "",
				feedYouTubeUsername : "",
				feedTwitterSearch : "",
				feedTwitterUsername : ""
			}
		});
	},
	selectFeed : function(data) {
		var self = this;
		var forceUpdate = data.forceUpdate;
		var feed = data.feed;
		var oldFeed = self.selectedFeed;
		self.selectedFeed = feed;
		setTimeout(function() {
			self.controller.helpController.setBaseHelpByName({
				baseName : "help-feed"
			});
		}, 1);
		self.feedPanelOpened();
		self.listController.showAndSelectListItem({
			listItem : self.selectedFeed,
			instantly : true
		});
		if (self.selectedFeed != oldFeed || self.updateDisplayedFeed || forceUpdate) {
			self.updateSourceSpecificFields({
				source : self.selectedFeed.source
			});
			self.updateFilterSpecificFields({
				filter : self.selectedFeed.filter
			});
			$(self.domForm).css({
				display : "block"
			});
			$(self.domSelectedFeedHeadline).text(feed.name);
			self.verifier.onChangeCallback = "";
			self.verifier.onKeyUpCallback = "";
			self.clearFields();
			var fieldValues = {
				feedName : feed.name,
				feedSource : feed.source,
				feedCategory : feed.category.id,
				numItems : feed.numItems
			};
			fieldValues["feed_" + feed.source + "_filter"] = feed.filter;
			if (feed.filter == "flickr-username") {
				fieldValues["feedFlickrUsername"] = feed.param1;
			} else if (feed.filter == "flickr-search") {
				fieldValues["feedFlickrSearch"] = feed.param1;
			} else if (feed.filter == "youtube-username") {
				fieldValues["feedYouTubeUsername"] = feed.param1;
			} else if (feed.filter == "youtube-search") {
				fieldValues["feedYouTubeSearch"] = feed.param1;
			} else if (feed.filter == "twitter-username") {
				fieldValues["feedTwitterUsername"] = feed.param1;
			} else if (feed.filter == "twitter-search") {
				fieldValues["feedTwitterSearch"] = feed.param1;
			}
			self.verifier.setFieldValues({
				fieldValues : fieldValues
			});
			if (self.selectedFeed.id && self.selectedFeed.id != "awaitingId") {
				self.verifier.hideCancelButton();
				self.verifier.showRevertButton();
				self.verifier.disableSaveAndRevert();
				self.verifier.saveFieldValues();
			} else {
				self.verifier.hideRevertButton();
				self.verifier.showCancelButton();
				self.verifier.enableSaveAndRevert();
				self.eventCatcherController.activate();
			}
			var updateFeedFormEventCatcher = function() {
				if (self.verifier.areValuesDifferentFromSavedValues()) {
					self.eventCatcherController.activate();
				} else {
					self.eventCatcherController.deactivate();
				}
			};
			self.verifier.onChangeCallback = function(data) {
				if (data.fieldName == "feedSource") {
					self.updateSourceSpecificFields({
						source : data.fieldValue
					});
				} else if (data.fieldName.indexOf("filter") != -1) {
					self.updateFilterSpecificFields({
						filter : data.fieldValue
					});
				} else if (data.fieldName == "feedName") {
					self.selectedFeed.name = data.fieldValue;
					$(self.domSelectedFeedHeadline).text(data.fieldValue);
					$("#admin-feed-list-item-title-" + self.selectedFeed.id).text(data.fieldValue);
				}
				updateFeedFormEventCatcher();
			};
			self.verifier.onKeyUpCallback = function(data) {
				if (data.fieldName == "feedName") {
					self.selectedFeed.name = data.fieldValue;
					$(self.domSelectedFeedHeadline).text(data.fieldValue);
					$("#admin-feed-list-item-title-" + self.selectedFeed.id).text(data.fieldValue);
				}
				updateFeedFormEventCatcher();
			};
		}
	},
	feedPanelOpened : function() {
		var self = this;
		self.listController.refresh();
		self.eventCatcherController.setupAction({
			domCutOffEl : self.domForm,
			clickFunc : function() {
				if (self.selectedFeed.id != "awaitingId") {
					self.controller.adminAlertController.displayMessage({
						headline : TLConfigText["feedsPanel_unsavedChanges1_headline"],
						body : '<p>' + TLConfigText["feedsPanel_unsavedChanges1_message1"] + ' “' + self.selectedFeed.name + '”. '
								+ TLConfigText["feedsPanel_unsavedChanges1_message2"] + '</p>',
						buttons : [ {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Save'] + '</a>',
							action : function() {
								self.verifier.fireButton({
									buttonType : "save"
								});
							}
						}, {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Revert'] + '</a>',
							action : function() {
								self.verifier.fireButton({
									buttonType : "revert"
								});
							}
						} ]
					});
				} else {
					self.controller.adminAlertController.displayMessage({
						headline : TLConfigText["feedsPanel_unsavedChanges2_headline"],
						body : '<p>' + TLConfigText["feedsPanel_unsavedChanges2_message1"] + ' “' + self.selectedFeed.name + '”. '
								+ TLConfigText["feedsPanel_unsavedChanges2_message2"] + '</p>',
						buttons : [ {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Save'] + '</a>',
							action : function() {
								self.verifier.fireButton({
									buttonType : "save"
								});
							}
						}, {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Delete'] + '</a>',
							action : function() {
								self.verifier.fireButton({
									buttonType : "cancel"
								});
							}
						} ]
					});
				}
			}
		});
	},
	deleteFeed : function(data) {
		var self = this;
		var feed = data.feed;
		self.listController.removeListItem({
			listItem : feed
		});
		var vars = {};
		vars["feedId"] = feed.id;
		vars["timelineId"] = self.timeline.id;
		var action = "/admin/deletefeed/";
		self.timeline.feeds = AJKHelpers.removeItemFromArray({
			anArray : self.timeline.feeds,
			item : feed
		});
		if (feed.id != "awaitingId") {
			theAJKAjaxController.request({
				action : action,
				method : "post",
				vars : vars,
				callback : function(xml) {
				}
			});
			self.mainController.feedController.removeFeed({
				feed : feed
			});
			self.mainController.refreshTimelineAfterFeedChange();
		}
		if (self.selectedFeed == feed) {
			self.selectedFeed = "";
			$(self.domForm).css({
				display : "none"
			});
		}
		self.eventCatcherController.deactivate();
	},
	setupList : function() {
		var self = this;
		self.listController = new AJKScrollableListController({
			domRoot : $(self.domRoot).find(".ajk-cs-carousel").get()[0],
			domStage : $(self.domRoot).find(".ajk-cs-carousel-stage").get()[0],
			listItems : self.timeline.feeds,
			createDomListItemFunc : function(data) {
				var aFeed = data.listItem;
				var insertHTML = '<div feedId="' + aFeed.id + '" class="tl-ah-list-item">';
				insertHTML += '<div class="tl-ah-col-1">';
				insertHTML += '<p id="admin-feed-list-item-title-' + aFeed.id + '">' + aFeed.name + '</p>';
				insertHTML += '</div>';
				insertHTML += '<div class="tl-ah-col-2">';
				insertHTML += '<a href="#">' + TLConfigText['adminBasic_Edit'] + '</a> | <a class="tl-ah-li-delete" href="#">' + TLConfigText['adminBasic_Delete'] + '</a>';
				insertHTML += '</div>';
				insertHTML += '</div>';
				return $(insertHTML).get()[0];
			},
			listItemSelectClass : "tl-ah-list-item-selected",
			itemWasClickedFunc : function(data) {
				var feed = data.listItem;
				var clickedElClass = data.clickedElClass;
				if (clickedElClass.indexOf("tl-ah-li-delete") != -1) {
					self.controller.adminAlertController.displayMessage({
						headline : TLConfigText["feedsPanel_deleteFeed_title"],
						body : '<p>' + TLConfigText["feedsPanel_deleteFeed_message"] + ' “' + feed.name + '”?</p>',
						buttons : [ {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_No'] + '</a>',
							action : function() {
							}
						}, {
							html : '<a href="#" class="rt-button-4 rt-button-align-right">' + TLConfigText['adminBasic_Yes'] + '</a>',
							action : function() {
								self.deleteFeed({
									feed : feed
								});
							}
						} ]
					});
				} else {
					self.selectFeed({
						feed : feed
					});
				}
			},
			getKeyForListItem : function(data) {
				var feed = data.listItem;
				return feed.id;
			},
			getPositionForListItem : function(data) {
				var feed = data.listItem;
				return feed.orderIndex;
			}
		}).init();
	}
};
var TLImagePositioningController = function(data) {
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
};
TLImagePositioningController.prototype = {
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
};
var TLPDFServices = function(data) {
	var self = this;
	self.controller = data.controller;
	self.timeline = self.controller.timeline;
	self.domLaunchButton = $("#tl-ah-pdf-timeline").get()[0];
	self.domContent = $("#tl-ah-pdf-panel").get()[0];
	self.imageModeUrl = "http://" + TLTimelineData.host + "/timeline/imagemode/" + self.timeline.id + "/" + self.timeline.urlFriendlyTitle + "/";
};
TLPDFServices.prototype = {
	init : function() {
		var self = this;
		if ($.browser.isMac) {
			$(self.domContent).addClass("tl-ah-show-mac-content");
		}
		var lightbox = "";
		$(self.domLaunchButton).click(function() {
			if (!lightbox) {
				lightbox = new TLAdminLightbox({
					domClass : "tl-ah-embed-lightbox",
					title : TLConfigText["pdf_panel_title"],
					intro : TLConfigText["pdf_panel_intro"],
					domContent : self.domContent
				}).init();
				$(self.domContent).find(".tl-ah-pdf-web-link").text(self.imageModeUrl);
			}
			lightbox.openPanel();
			return false;
		});
		return self;
	}
};
var TLCSVServices = function(data) {
	var self = this;
	self.domLaunchButton = $("#tl-ah-csv-timeline").get()[0];
	self.domExportButton = $("#tl-ah-export-csv-button").get()[0];
	self.domContent = $("#tl-ah-csv-panel").get()[0];
	self.domDownloadingMessage = $("#tl-ah-csv-downloading-message").get()[0];
};
TLCSVServices.prototype = {
	init : function() {
		var self = this;
		var lightbox = "";
		$(self.domLaunchButton).click(function() {
			if (!lightbox) {
				$(self.domExportButton).click(function() {
					$(self.domDownloadingMessage).css({
						display : "block"
					});
					$(self.domExportButton).css({
						display : "none"
					});
				});
				lightbox = new TLAdminLightbox({
					domClass : "tl-ah-embed-lightbox",
					title : TLConfigText["csv_panel_title"],
					intro : TLConfigText["csv_panel_intro"],
					domContent : self.domContent
				}).init();
			}
			$(self.domDownloadingMessage).css({
				display : "none"
			});
			$(self.domExportButton).css({
				display : "block"
			});
			lightbox.openPanel();
			return false;
		});
		return self;
	}
};
var TLStoryEditButton = function(data) {
	var self = this;
	self.selectedStory = "";
	self.domRoot = "";
	self.callback = data.callback;
	self.controller = data.controller;
	self.mainController = self.controller.mainController;
};
TLStoryEditButton.prototype = {
	init : function() {
		var self = this;
		return self;
	},
	showForStory : function(data) {
		var self = this;
		var story = data.story;
		if (story.uneditable) {
			return;
		}
		self.selectedStory = story;
		if (!self.domRoot) {
			self.generate();
		}
		var view3D = self.mainController.selected3DView;
		if (view3D.active) {
			var info3D = self.selectedStory.marker3DScreenInfo;
			if (info3D.timelinePos.y > view3D.moreInfoCutOff) {
				$(self.dom3DRoot).css({
					left : info3D.x,
					top : info3D.y
				});
				$(self.mainController.domStageHolder).prepend(self.dom3DRoot);
			}
		} else {
			$(story.domRoot).prepend(self.domRoot);
		}
	},
	remove : function() {
		var self = this;
		$(self.domRoot).detach();
		$(self.dom3DRoot).detach();
		self.selectedStory = "";
	},
	generate : function() {
		var self = this;
		self.domRoot = $('<div class="tl-st-edit-button">Edit story</div>').get()[0];
		self.dom3DRoot = $('<div class="tl-st-edit-button tl-st-edit-button-3d">Edit story</div>').get()[0];
		$([ self.domRoot, self.dom3DRoot ]).click(function() {
			self.callback({
				story : self.selectedStory
			});
			return false;
		});
		$(self.dom3DRoot).mousemove(function(e) {
			e.stopPropagation();
		});
	}
};
var TLUserControlsExtender = function(data) {
	var self = this;
	self.controller = data.controller;
	self.timeline = self.controller.timeline;
	self.userControlsController = data.userControlsController;
};
TLUserControlsExtender.prototype = {
	init : function() {
		var self = this;
		if (!self.timeline.isEditable) {
			return;
		}
		self.setupWarningPanel();
		return self;
	},
	setupWarningPanel : function() {
		var self = this;
		self.domWarningPanel = $(
				'<div class="tl-uc-controls-warning"><h3>Important Info</h3><p>These controls are aimed at viewers of your timeline. They should not be used to edit your timeline.</p><p>If you need to change your timeline\'s zoom, view type, or spacing mode, you should use the options in the Settings tab in the grey admin panel.</p><a href="#" class="rt-button-3">Continue</a></div>')
				.get()[0];
		$(self.domWarningPanel).find(".rt-button-3").click(function() {
			$(self.domWarningPanel).animate({
				opacity : 0
			}, 500, function() {
				$(this).remove();
			});
			return false;
		});
		$(self.userControlsController.domPanel).find(".tl-ucp-content").append(self.domWarningPanel);
	}
};
var TLTimeline3DSettings = function(data) {
	var self = this;
	self.slidersInitialised = false;
	self.controller = data.controller;
	self.mainController = self.controller.mainController;
	self.timeline = self.controller.timeline;
	self.timeline3D = self.timeline.timeline3D;
};
TLTimeline3DSettings.prototype = {
	init : function() {
		var self = this;
		$("#tl-ah-timeline-3d-settings").click(function() {
			if (!self.lightbox) {
				self.domRoot = $("#tl-ah-3d-settings-form-content .ajk-verifier").get()[0];
				self.lightbox = new TLAdminLightbox({
					domClass : "tl-ah-timeline-3d-settings tl-ah-advanced-settings",
					title : TLConfigText["3DSettings_title"],
					intro : TLConfigText["3DSettings_intro"],
					domContent : self.domRoot,
					closeCallback : function() {
						self.verifier.fireButton({
							buttonType : "revert"
						});
					}
				}).init();
				self.setupVerification();
			}
			self.lightbox.openPanel();
			if (!self.slidersInitialised) {
				self.slidersInitialised = true;
				self.initialiseAdminValueSliders();
			}
			self.setFieldValues();
			return false;
		});
		return self;
	},
	setFieldValues : function() {
		var self = this;
	},
	initialiseAdminValueSliders : function() {
		var self = this;
		$(self.domRoot).find(".ft-component-value-slider").each(function() {
			var domInput = $(this).find("input").get()[0];
			var rangeStr = $(domInput).attr("range");
			var insertHTML = '<div class="ft-cvs-holder">';
			insertHTML += '<div class="ft-cvs-bar"></div>';
			insertHTML += '<div class="ft-cvs-dragger"></div>';
			insertHTML += '</div>';
			var domSlider = $(insertHTML).get()[0];
			var domInputHolder = $(this).find(".tl-ah-input").get()[0];
			$(domInputHolder).append(domSlider);
			var draggerRange = parseInt($(domSlider).css("width"));
			new AJKValueSlider({
				domRoot : domSlider,
				domDragger : $(domSlider).find(".ft-cvs-dragger").get()[0],
				name : $(domInput).attr("name"),
				range : {
					min : parseFloat(rangeStr.split(",")[0]),
					max : parseFloat(rangeStr.split(",")[1])
				},
				callback : function(data) {
					$(domInput).val(data.newVal);
					$(domInput).blur();
				},
				limitFunc : function() {
					var limit = {
						minX : 0,
						maxX : draggerRange,
						minY : 5,
						maxY : 5
					};
					return limit;
				}
			}).init();
		});
	},
	generate3DVarString : function() {
		var self = this;
		var tl = self.timeline3D;
		var dec = AJKHelpers.convertNumToXDecimalPlaces;
		return tl.status + "," + tl.color + "," + dec({
			num : tl.zoom,
			x : 5
		}) + "," + tl.panelSize + "," + dec({
			num : tl.vanishTop,
			x : 5
		}) + "," + dec({
			num : tl.endToScreenRatio,
			x : 5
		}) + "," + tl.direction + "," + tl.numCols + "," + dec({
			num : tl.bgFade,
			x : 5
		});
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
				var vars = {};
				vars["timelineId"] = self.timeline.id;
				vars["settings3d"] = self.generate3DVarString();
				var action = "/admin/update3dtimelinesettings/";
				self.verifier.saveFieldValues();
				self.verifier.disableSaveAndRevert();
				theAJKAjaxController.request({
					action : action,
					method : "post",
					vars : vars,
					callback : function(xml) {
					}
				});
			}
		}).init();
		self.verifier.onChangeCallback = function(data) {
			switch (data.fieldName) {
			case "timeline3DNumCols":
				var val = parseInt(data.fieldValue);
				if (val != self.timeline3D.numCols) {
					self.timeline3D.numCols = parseInt(data.fieldValue);
					self.mainController.selected3DView.updateStoryColPositions();
				}
				break;
			case "timeline3DColor":
				self.timeline3D.color = data.fieldValue;
				break;
			case "timeline3DZoom":
				self.timeline3D.zoom = Math.pow(parseFloat(data.fieldValue), 2);
				break;
			case "timeline3DPanelSize":
				self.timeline3D.panelSize = parseInt(data.fieldValue, 10);
				break;
			case "timeline3DVanishTop":
				self.timeline3D.vanishTop = parseFloat(data.fieldValue);
				break;
			case "timeline3DEndToScreenRatio":
				self.timeline3D.endToScreenRatio = parseFloat(data.fieldValue);
				break;
			case "timeline3DDirection":
				self.timeline3D.direction = parseInt(data.fieldValue, 10);
				break;
			case "timelineBGFade":
				self.timeline3D.bgFade = parseFloat(data.fieldValue);
				break;
			case "timeline3DStatus":
				var newStatus = parseInt(data.fieldValue);
				if (newStatus != self.timeline3D.status) {
					self.timeline3D.status = newStatus;
					var view3d = self.mainController.selected3DView;
					view3d.updateButtonState();
					if ((newStatus == 2 && !view3d.active) || (newStatus < 2 && view3d.active)) {
						$(view3d.domLaunchButton).click();
					}
				}
				break;
			default:
				break;
			}
			if (data.fieldName == "timeline3DZoom" || data.fieldName == "timeline3DDirection") {
				self.mainController.selected3DView.redisplayAfterDataChange();
			} else {
				self.mainController.selected3DView.redisplay();
			}
		};
		self.verifier.hideCancelButton();
		self.verifier.showRevertButton();
		self.verifier.disableSaveAndRevert();
	},
	setFieldValues : function() {
		var self = this;
		self.verifier.setFieldValues({
			fieldValues : {
				timeline3DNumCols : self.timeline3D.numCols,
				timeline3DZoom : Math.sqrt(self.timeline3D.zoom),
				timeline3DPanelSize : self.timeline3D.panelSize,
				timeline3DVanishTop : self.timeline3D.vanishTop,
				timeline3DEndToScreenRatio : self.timeline3D.endToScreenRatio,
				timeline3DDirection : self.timeline3D.direction,
				timeline3DStatus : self.timeline3D.status,
				timeline3DColor : self.timeline3D.color,
				timelineBGFade : self.timeline3D.bgFade
			}
		});
		self.verifier.saveFieldValues();
		self.verifier.disableSaveAndRevert();
	}
};
var TLAdminHelp = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.domAdmin = data.domAdmin;
	self.domOpenClose = data.domOpenClose;
	self.mainController = data.mainController;
	self.domContentHolder = $(self.domRoot).find(".tl-ahh-content").get()[0];
	self.helps = new Array();
	self.helpsByName = new Array();
	self.baseHelp = "";
	self.focusHelp = "";
	self.hoverHelp = "";
	self.selectedHelp = "";
	self.topPos = "";
	self.arrowPadding = 15;
	self.arrowHeight = 800;
	self.minArrowOffset = -self.arrowHeight / 2 + self.arrowPadding + 2;
	self.hidden = true;
	self.updateTimeout = "";
};
TLAdminHelp.prototype = {
	init : function() {
		var self = this;
		$(self.domOpenClose).click(function() {
			if (self.hidden) {
				self.show();
				self.mainController.showHelp = true;
			} else {
				self.hide();
				self.mainController.showHelp = false;
			}
			return false;
		});
		$(self.domRoot).mouseover(function(e) {
			var domFocusEl = e.target;
			if ($(domFocusEl).hasClass("tl-ahh-highlight")) {
				var anId = $(domFocusEl).attr("highlightId");
				if (anId) {
					AJKHelpers.flashDomEl({
						domEl : $("#" + anId).get()[0],
						numRadians : 12
					});
				}
			}
		});
		self.topPos = AJKHelpers.getCoordsOfDomEl({
			domEl : self.domRoot
		}).y;
		$(self.domAdmin).find("#tl-tab-my-timelines-button, #tl-categories-tab-menu-item, #tl-settings-tab-menu-item").click(function() {
			if (self.mainController.timeline.homePage) {
				self.setBaseHelpByName({
					baseName : "timeline-list"
				});
			} else {
				self.setBaseHelpByName({
					baseName : "default"
				});
			}
		});
		$(self.domAdmin).find(".tl-ahh-help-item").each(function() {
			var pointAtId = $(this).find(".tl-ahh-data-point-at-id").text();
			var aHelp = {
				name : $(this).attr("name"),
				domContent : $(this).find(".tl-ahh-data-content").get()[0],
				domHoverItem : this,
				domFocusItem : $(this).find(".ajk-verifier-control").get()[0],
				domPointAt : (pointAtId) ? $("#" + pointAtId).get()[0] : this
			};
			self.helps.push(aHelp);
			if (aHelp.name) {
				self.helpsByName[aHelp.name] = aHelp;
			}
			$(aHelp.domHoverItem).mouseenter(function() {
				self.hoverHelp = aHelp;
				self.updateView();
			}).mouseleave(function() {
				self.hoverHelp = "";
				self.updateTimeout = setTimeout(function() {
					self.updateView();
				}, 100);
			});
			$(aHelp.domFocusItem).focus(function() {
				self.focusHelp = aHelp;
				self.updateView();
			}).blur(function() {
				self.focusHelp = "";
				self.updateView();
			});
		});
		return self;
	},
	showHelp : function(data) {
		var self = this;
		var help = data.help;
		var forceShow = data.forceShow;
		if (self.selectedHelp != help || forceShow) {
			self.selectedHelp = help;
			if (self.hidden) {
				return;
			}
			self.preProcessHelp({
				help : help
			});
			$(self.domRoot).css({
				top : 39
			});
			$(self.domContentHolder).empty().append(help.domContent);
			var aimPos = AJKHelpers.getCoordsOfDomEl({
				domEl : help.domPointAt
			}).y;
			var myHeight = $(self.domRoot).height();
			var arrowOffset = aimPos - self.topPos - 0.5 * self.arrowHeight + 3;
			arrowOffset = (arrowOffset < self.minArrowOffset) ? self.minArrowOffset : arrowOffset;
			var helpTopAdjust = 0;
			var maxArrowOffset = self.minArrowOffset + myHeight - 2 * self.arrowPadding - 20;
			if (arrowOffset > maxArrowOffset) {
				helpTopAdjust = Math.abs(arrowOffset - maxArrowOffset) + 0.5 * (myHeight - 20) - self.arrowPadding;
				arrowOffset = maxArrowOffset - (0.5 * (myHeight - 20) - self.arrowPadding);
			}
			$(self.domRoot).css({
				top : parseInt(self.topPos + helpTopAdjust)
			});
			$(self.domContentHolder).css({
				backgroundPosition : "right " + parseInt(arrowOffset) + "px"
			});
		}
	},
	preProcessHelp : function(data) {
		var self = this;
		var help = data.help;
		$(help.domContent).find(".tl-ahh-timeline-title").text(self.mainController.timeline.title);
	},
	setBaseHelpByName : function(data) {
		var self = this;
		var baseName = data.baseName;
		self.baseHelp = self.helpsByName[baseName];
		self.updateView();
	},
	updateView : function(data) {
		var self = this;
		if (self.updateTimeout) {
			clearTimeout(self.updateTimeout);
			self.updateTimeout = "";
		}
		var forceShow = (data) ? data.forceShow : false;
		if (self.hoverHelp) {
			self.showHelp({
				help : self.hoverHelp,
				forceShow : forceShow
			});
			if (!self.hidden) {
				$(self.domOpenClose).removeClass("tl-ah-hide").addClass("tl-ah-hide");
			}
		} else if (self.focusHelp) {
			self.showHelp({
				help : self.focusHelp,
				forceShow : forceShow
			});
			if (!self.hidden) {
				$(self.domOpenClose).removeClass("tl-ah-hide").addClass("tl-ah-hide");
			}
		} else {
			self.showHelp({
				help : self.baseHelp,
				forceShow : forceShow
			});
			$(self.domOpenClose).removeClass("tl-ah-hide");
		}
	},
	hide : function() {
		var self = this;
		$(self.domRoot).addClass("tl-ahh-hide");
		$(self.domOpenClose).addClass("tl-admin-help-open-close-help-hidden");
		self.hidden = true;
	},
	show : function() {
		var self = this;
		self.hidden = false;
		self.updateView({
			forceShow : true
		});
		$(self.domRoot).removeClass("tl-ahh-hide");
		$(self.domOpenClose).removeClass("tl-admin-help-open-close-help-hidden");
	}
};
var TLGeneralPurposePanel = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.domTopContent = $(self.domRoot).find(".tl-ch-top-content div:eq(0)").get()[0];
	self.domMainContent = $(self.domRoot).find(".tl-ch-main-content").get()[0];
	self.domFooterContent = $(self.domRoot).find(".tl-mc-footer-content").get()[0];
	self.domClose = $(self.domRoot).find(".tl-ch-close-content").get()[0];
	self.domPanel = $(self.domRoot).find(".tl-main-content-block").get()[0];
	self.domMainInsertContent = data.domMainInsertContent;
	self.domFooterInsertContent = data.domFooterInsertContent;
	self.domFade = $(self.domRoot).find(".tl-mc-fade").get()[0];
	self.extraClass = data.extraClass;
	self.visible = false;
	self.oneOffClass = "";
	self.domCarousel = data.domCarousel;
	self.domCarouselStage = data.domCarouselStage;
	self.carouselInitalised = false;
	self.carouselLateralMovement = data.carouselLateralMovement;
	self.carouselDisabledClass = data.carouselDisabledClass;
	self.domCarouselNext = data.domCarouselNext;
	self.domCarouselPrev = data.domCarouselPrev;
};
TLGeneralPurposePanel.prototype = {
	init : function() {
		var self = this;
		$(self.domRoot).addClass(self.extraClass);
		$(self.domMainContent).append(self.domMainInsertContent);
		$(self.domFooterContent).append(self.domFooterInsertContent);
		$([ self.domClose, self.domFade ]).click(function() {
			self.close();
			return false;
		});
		return self;
	},
	initialiseSimpleCarousel : function() {
		var self = this;
		$(self.domCarouselNext).click(function() {
			$(self.domCarouselStage).animate({
				marginLeft : -self.carouselLateralMovement
			}, 500, function() {
			});
			$(this).addClass(self.carouselDisabledClass);
			$(self.domCarouselPrev).removeClass(self.carouselDisabledClass);
			return false;
		});
		$(self.domCarouselPrev).click(function() {
			$(self.domCarouselStage).animate({
				marginLeft : 0
			}, 500, function() {
			});
			$(this).addClass(self.carouselDisabledClass);
			$(self.domCarouselNext).removeClass(self.carouselDisabledClass);
			return false;
		});
		self.carouselInitalised = true;
	},
	show : function(data) {
		var self = this;
		var animTime = (data && data.instantly) ? 0 : 500;
		var oneOffClass = (data && data.oneOffClass) ? data.oneOffClass : "";
		if (oneOffClass) {
			if (self.oneOffClass) {
				$(self.domRoot).removeClass(self.oneOffClass);
			}
			self.oneOffClass = oneOffClass;
			$(self.domRoot).addClass(self.oneOffClass);
		}
		if (!self.visible) {
			if ($.browser.msie && $.browser.version < 9) {
				$(self.domRoot).css({
					display : "block",
					visibility : "hidden"
				});
				$("body").append(self.domRoot);
				self.windowDidResize({
					newSize : AJKHelpers.viewportSize()
				});
				setTimeout(function() {
					$(self.domRoot).css({
						visibility : "visible"
					});
					self.visible = true;
				}, 1);
			} else {
				$(self.domRoot).css({
					opacity : 0,
					display : "block"
				});
				$("body").append(self.domRoot);
				self.windowDidResize({
					newSize : AJKHelpers.viewportSize()
				});
				$(self.domRoot).animate({
					opacity : 1
				}, animTime, function() {
					self.visible = true;
				});
			}
			theAJKWindowResizeEvent.registerAsObserver({
				observer : self
			});
		}
	},
	close : function() {
		var self = this;
		if (self.visible) {
			if ($.browser.msie && $.browser.version < 9) {
				$(self.domRoot).css({
					display : "none"
				});
				$(self.domRoot).detach();
				if (self.oneOffClass) {
					$(self.domRoot).removeClass(self.oneOffClass);
					self.oneOffClass = "";
				}
			} else {
				$(self.domRoot).animate({
					opacity : 0
				}, 500, function() {
					$(self.domRoot).detach();
					$(self.domRoot).css({
						display : "none"
					});
					if (self.oneOffClass) {
						$(self.domRoot).removeClass(self.oneOffClass);
						self.oneOffClass = "";
					}
				});
			}
			theAJKWindowResizeEvent.removeAsObserver({
				observer : self
			});
			self.visible = false;
		}
	},
	windowDidResize : function(data) {
		var self = this;
		var newSize = data.newSize;
		var topOffset = parseInt((newSize.height - $(self.domPanel).height()) / 2);
		$(self.domPanel).css({
			top : topOffset
		});
		if (self.domCarousel && !self.carouselInitalised) {
			self.initialiseSimpleCarousel();
		}
	}
};
var AJKDatePickerController = function(data) {
	var self = this;
	self.domRoot = data.domRoot;
	self.lightbox = "";
	self.domDatePicker = "";
	self.datePicker = "";
	self.domInput = "";
	self.selectedDate = "";
	self.dateFormatFieldId = "";
	self.formatController = "";
};
AJKDatePickerController.prototype = {
	init : function() {
		var self = this;
		$(".ajk-date-field .tl-ah-input, .ajk-date-field .tlsp-field-input-holder").append('<a href="#" class="tl-ah-date-picker-button">Open date picker</a>');
		$(".ajk-date-field").each(function() {
			var domInput = $(this).find("input").get()[0];
			var domLaunchButton = $(this).find(".tl-ah-date-picker-button").get()[0];
			var dateFormatFieldId = $(this).find(".ajk-date-format-field-id").text();
			$(domLaunchButton).click(function() {
				self.launchLightbox();
				self.domInput = domInput;
				self.dateFormatFieldId = dateFormatFieldId;
				if (self.dateFormatFieldId) {
					$(self.domDateFormat).find("input").val($("#" + self.dateFormatFieldId).val());
					self.formatController.updateFromFieldValue();
					$(self.domDateFormat).css({
						display : "block"
					});
				} else {
					$(self.domDateFormat).css({
						display : "none"
					});
				}
				self.selectedDate = Date.parse($(domInput).val());
				self.selectedDate = (self.selectedDate) ? self.selectedDate : new Date();
				self.datePicker.setInitialDate({
					date : self.selectedDate
				});
				self.showSelectedDate();
				return false;
			});
		});
		return self;
	},
	launchLightbox : function() {
		var self = this;
		if (!self.lightbox) {
			self.initLightbox();
		}
		self.lightbox.openPanel();
	},
	initLightbox : function() {
		var self = this;
		self.generateDatePickerDom();
		self.datePicker = new AJKDatePicker({
			domRoot : self.domDatePicker,
			startDateTime : new Date(),
			dayBlockClass : "ajk-dp-day",
			dayBlockSelectedClass : "ajk-dp-day-selected",
			dayBlockTodayClass : "ajk-dp-day-today",
			dayBlockInactiveClass : "ajk-dp-day-hide-visibility",
			domADSelector : $(self.domDatePicker).find(".ajk-dp-ad-button").get()[0],
			domBCSelector : $(self.domDatePicker).find(".ajk-dp-bc-button").get()[0],
			selectedClassForADBC : "ajk-dp-switch-button-selected",
			domYearBox : $(self.domDatePicker).find(".ajk-dp-header input").get()[0],
			domHourBox : $(self.domDatePicker).find(".ajk-dp-hour-field input").get()[0],
			domMinuteBox : $(self.domDatePicker).find(".ajk-dp-minute-field input").get()[0],
			domSecondBox : $(self.domDatePicker).find(".ajk-dp-second-field input").get()[0],
			domSelectedMonthText : $(self.domDatePicker).find(".ajk-dp-header h3").get()[0],
			domNextMonthButton : $(self.domDatePicker).find(".ajk-dp-header a.ajk-dp-next-month").get()[0],
			domPrevMonthButton : $(self.domDatePicker).find(".ajk-dp-header a.ajk-dp-prev-month").get()[0],
			domDayBlockStage : $(self.domDatePicker).find(".ajk-dp-stage").get()[0],
			createDayBlockFunc : function(data) {
				var index = data.index;
				var dayBlockClass = "ajk-dp-day";
				if (index % 7 == 0) {
					dayBlockClass = (dayBlockClass + " " + dayBlockClass + "-left");
				} else if (index % 7 == 6) {
					dayBlockClass = (dayBlockClass + " " + dayBlockClass + "-right");
				}
				return $('<a href="#" class="' + dayBlockClass + '"></a>').get()[0];
			},
			callback : function(data) {
				self.selectedDate = data.selectedDate;
				self.datePicker.setInitialDate({
					date : self.selectedDate
				});
				self.showSelectedDate();
			}
		}).init();
		self.lightbox = new TLAdminLightbox({
			domClass : "tl-ah-date-picker-lightbox",
			title : TLConfigText['adminDatePicker_Date_picker'],
			intro : "",
			domContent : self.domDatePicker
		}).init();
	},
	showSelectedDate : function() {
		var self = this;
		$(self.domSelectedDateText).text(AJKHelpers.formatDate({
			formatString : "DD MMM YYYY",
			date : self.selectedDate,
			language : "base"
		}));
	},
	generateDatePickerDom : function() {
		var self = this;
		var inHTML = '<div class="ajk-date-picker">';
		inHTML += '<div class="ajk-dp-header">';
		inHTML += '<h3>July 2008</h3>';
		inHTML += '<a href="#" class="ajk-dp-month-arrow ajk-dp-prev-month">Prev</a>';
		inHTML += '<a href="#" class="ajk-dp-month-arrow ajk-dp-next-month">Next</a>';
		inHTML += '<a href="#" class="ajk-dp-ad-button ajk-dp-switch-button-selected ajk-dp-switch-button">AD</a>';
		inHTML += '<a href="#" class="ajk-dp-bc-button ajk-dp-switch-button">BC</a>';
		inHTML += '<div class="tl-ah-input"><div class="tl-ah-f-inner">';
		inHTML += '<input type="text" maxlength="5" class="" />';
		inHTML += '</div><div class="tl-ah-f-right"></div></div>';
		inHTML += '</div>';
		inHTML += '<div class="ajk-dp-middle">';
		inHTML += '<div class="ajk-dp-day-title-holder">';
		inHTML += '<p class="ajk-dp-day-title ajk-dp-day-title-first">' + AJKDatePickerHelper.dateWeekDayArray[1] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[2] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[3] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[4] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[5] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[6] + '</p>';
		inHTML += '<p class="ajk-dp-day-title">' + AJKDatePickerHelper.dateWeekDayArray[0] + '</p>';
		inHTML += '</div>';
		inHTML += '<div class="clear"></div>';
		inHTML += '<div class="ajk-dp-stage">';
		inHTML += '</div>';
		inHTML += '<div class="clear"></div>';
		inHTML += '</div>';
		inHTML += '<div class="ajk-dp-bottom">';
		inHTML += '<div class="ajk-dp-selected-date">';
		inHTML += '<p>' + TLConfigText['adminDatePicker_Selected_date_text'] + ' <span></span></p>';
		inHTML += '<div class="tl-ah-input ajk-dp-time-field ajk-dp-hour-field"><div class="tl-ah-f-inner">';
		inHTML += '<input type="text" maxlength="2" />';
		inHTML += '</div><div class="tl-ah-f-right"></div></div>';
		inHTML += '<div class="tl-ah-input ajk-dp-time-field ajk-dp-minute-field"><div class="tl-ah-f-inner">';
		inHTML += '<input type="text" maxlength="2" />';
		inHTML += '</div><div class="tl-ah-f-right"></div></div>';
		inHTML += '<div class="tl-ah-input ajk-dp-time-field ajk-dp-second-field"><div class="tl-ah-f-inner">';
		inHTML += '<input type="text" maxlength="2" />';
		inHTML += '</div><div class="tl-ah-f-right"></div></div>';
		inHTML += '</div>';
		inHTML += '<div class="ajk-dp-date-format">';
		inHTML += '<p>' + TLConfigText['adminDatePicker_Date_format_text'] + '</p>';
		inHTML += '<div class="tl-ah-input tl-ah-dp-date-format-field"><div class="tl-ah-f-inner">';
		inHTML += '<input type="text" />';
		inHTML += '</div><div class="tl-ah-f-right"></div></div>';
		inHTML += '</div>';
		inHTML += '<div class="tl-ah-form-button-holder">';
		inHTML += '<a href="#" class="rt-button-4 rt-button-align-right ajk-dp-button-confirm">' + TLConfigText['adminDatePicker_Confirm'] + '</a>';
		inHTML += '<a href="#" class="rt-button-4 rt-button-align-right ajk-verifier-revert ajk-dp-button-cancel">' + TLConfigText['adminBasic_Cancel'] + '</a>';
		inHTML += '<div class="tl-clear"></div>';
		inHTML += '</div>';
		inHTML += '</div>';
		inHTML += '</div>';
		self.domDatePicker = $(inHTML).get()[0];
		self.domSelectedDateText = $(self.domDatePicker).find(".ajk-dp-selected-date span").get()[0];
		$(self.domDatePicker).find(".ajk-dp-button-confirm").click(function() {
			self.lightbox.closePanel();
			$(self.domInput).val(AJKHelpers.formatDate({
				formatString : "DD MMM YYYY HH:mm:ss",
				date : self.selectedDate,
				language : "base"
			}));
			$(self.domInput).blur();
			if (self.dateFormatFieldId) {
				var dateFormat = $(self.domDateFormat).find("input").val();
				$("#" + self.dateFormatFieldId).val(dateFormat).blur();
			}
			return false;
		});
		$(self.domDatePicker).find(".ajk-dp-button-cancel").click(function() {
			self.lightbox.closePanel();
			return false;
		});
		self.domDateFormat = $(self.domDatePicker).find(".ajk-dp-date-format").get()[0];
		if (typeof TLDateFormatterField != "undefined") {
			self.formatController = new TLDateFormatterField({
				domRoot : self.domDateFormat
			}).init();
		}
	}
};
var AJKDatePicker = function(data) {
	var self = this;
	self.selectedDateTime = data.startDateTime;
	self.dayBlockClass = data.dayBlockClass;
	self.dayBlockInactiveClass = data.dayBlockInactiveClass;
	self.domRoot = data.domRoot;
	self.domADSelector = data.domADSelector;
	self.domBCSelector = data.domBCSelector;
	self.selectedClassForADBC = data.selectedClassForADBC;
	self.isAD = true;
	self.domSelectedMonthText = data.domSelectedMonthText;
	self.domNextMonthButton = data.domNextMonthButton;
	self.domPrevMonthButton = data.domPrevMonthButton;
	self.domDayBlockStage = data.domDayBlockStage;
	self.createDayBlockFunc = data.createDayBlockFunc;
	self.domYearBox = data.domYearBox;
	self.domHourBox = data.domHourBox;
	self.domMinuteBox = data.domMinuteBox;
	self.domSecondBox = data.domSecondBox;
	self.domDayBlocks = new Array();
	self.callback = data.callback;
	self.dateUsedForVisibleMonth = "";
	self.arrayDayKeyCells = "";
};
AJKDatePicker.prototype = {
	init : function() {
		var self = this;
		self.generateHTML();
		$(self.domNextMonthButton).click(function() {
			self.displayNextMonth();
			return false;
		});
		$(self.domPrevMonthButton).click(function() {
			self.displayPrevMonth();
			return false;
		});
		$(self.domDayBlocks).click(function() {
			var selectedDay = $(this).text();
			if (selectedDay && selectedDay != "null") {
				self.dayWasClicked({
					day : selectedDay
				});
			}
			return false;
		});
		self.updateDisplayedMonth({
			date : self.selectedDateTime
		});
		self.initYearBox();
		self.initADBC();
		return self;
	},
	initYearBox : function() {
		var self = this;
		$([ self.domYearBox, self.domHourBox, self.domMinuteBox, self.domSecondBox ]).keydown(function(e) {
			var c = e.keyCode;
			if ((c >= 48 && c <= 57) || c == 8 || c == 13 || c == 9 || c == 37 || c == 39 || c == 46 || c == 17 || c == 18) {
				return true;
			} else {
				return false;
			}
		}).keyup(function(e) {
			if (this == self.domYearBox) {
				var newDate = AJKHelpers.cloneDate({
					date : self.dateUsedForVisibleMonth
				});
				var year = parseInt($(this).val(), 10);
				newDate.setFullYear(AJKHelpers.quadrupleDigitNum({
					num : year
				}));
				self.updateDisplayedMonth({
					date : newDate,
					cancelDateTimeBoxUpdate : true
				});
			} else {
				if (this == self.domHourBox) {
					var hour = parseInt($(this).val(), 10);
					if (hour > 23) {
						$(this).val(23);
						hour = 23;
					}
					self.selectedDateTime.setHours(hour);
					self.dateUsedForVisibleMonth.setHours(hour);
				} else if (this == self.domMinuteBox) {
					var minute = parseInt($(this).val(), 10);
					if (minute > 59) {
						$(this).val(59);
						hour = 59;
					}
					self.selectedDateTime.setMinutes(minute);
					self.dateUsedForVisibleMonth.setMinutes(minute);
				} else if (this == self.domSecondBox) {
					var second = parseInt($(this).val(), 10);
					if (second > 59) {
						$(this).val(59);
						second = 59;
					}
					self.selectedDateTime.setSeconds(second);
					self.dateUsedForVisibleMonth.setSeconds(second);
				}
			}
		});
	},
	setInitialDate : function(data) {
		var self = this;
		self.selectedDateTime = AJKHelpers.cloneDate({
			date : data.date
		});
		self.updateDisplayedMonth({
			date : data.date
		});
	},
	generateHTML : function() {
		var self = this;
		for (var counter = 0; counter < 42; counter++) {
			self.domDayBlocks.push(self.createDayBlockFunc({
				index : counter
			}));
		}
		$(self.domDayBlockStage).html(self.domDayBlocks);
	},
	initADBC : function() {
		var self = this;
		$(self.domADSelector).click(function() {
			if (!self.isAD) {
				self.isAD = true;
				$(this).addClass(self.selectedClassForADBC);
				$(self.domBCSelector).removeClass(self.selectedClassForADBC);
				self.updateADBC();
			}
			return false;
		});
		$(self.domBCSelector).click(function() {
			if (self.isAD) {
				self.isAD = false;
				$(this).addClass(self.selectedClassForADBC);
				$(self.domADSelector).removeClass(self.selectedClassForADBC);
				self.updateADBC();
			}
			return false;
		});
	},
	updateADBC : function() {
		var self = this;
		var yearText = parseInt($(self.domYearBox).val(), 10);
		if (!self.isAD) {
			yearText = -yearText;
		}
		var newDate = AJKHelpers.cloneDate({
			date : self.dateUsedForVisibleMonth
		});
		newDate.setFullYear(yearText);
		self.updateDisplayedMonth({
			date : newDate,
			cancelDateTimeBoxUpdate : true
		});
	},
	updateDisplayedMonth : function(data) {
		var self = this;
		self.dateUsedForVisibleMonth = data.date;
		$(this.domSelectedMonthText).text(AJKDatePickerHelper.monthsArray[self.dateUsedForVisibleMonth.getMonth()]);
		var fullYear = self.dateUsedForVisibleMonth.getFullYear();
		if (!data.cancelDateTimeBoxUpdate) {
			var displayYear = AJKHelpers.quadrupleDigitNum({
				num : Math.abs(fullYear)
			});
			var displayHour = AJKHelpers.doubleDigitNum({
				num : self.dateUsedForVisibleMonth.getHours()
			});
			var displayMinute = AJKHelpers.doubleDigitNum({
				num : self.dateUsedForVisibleMonth.getMinutes()
			});
			var displaySecond = AJKHelpers.doubleDigitNum({
				num : self.dateUsedForVisibleMonth.getSeconds()
			});
			$(self.domYearBox).val(displayYear);
			$(self.domHourBox).val(displayHour);
			$(self.domMinuteBox).val(displayMinute);
			$(self.domSecondBox).val(displaySecond);
		}
		if (fullYear < 0) {
			$(self.domADSelector).removeClass(self.selectedClassForADBC);
			$(self.domBCSelector).addClass(self.selectedClassForADBC);
			self.isAD = false;
		} else {
			$(self.domADSelector).addClass(self.selectedClassForADBC);
			$(self.domBCSelector).removeClass(self.selectedClassForADBC);
			self.isAD = true;
		}
		self.arrayDayKeyCells = new Array();
		var calendarArray = AJKDatePickerHelper.getDayArrayForMonthOfYear({
			date : self.dateUsedForVisibleMonth
		});
		var dayOccuredOn = false;
		for (var counter = 0; counter <= 41; counter++) {
			var thisCell = this.domDayBlocks[counter];
			var thisDay = calendarArray[counter];
			if (thisDay) {
				dayOccuredOn = counter;
				var keyStr = AJKDatePickerHelper.leadingZero(thisDay) + "/" + AJKDatePickerHelper.leadingZero(self.dateUsedForVisibleMonth.getMonth()) + "/"
						+ self.dateUsedForVisibleMonth.getFullYear();
				this.arrayDayKeyCells[keyStr] = thisCell;
				$(thisCell).text(thisDay).removeClass(self.dayBlockInactiveClass).removeClass("ajk-dp-day-hide-display").removeClass("ajk-dp-day-selected").removeClass(
						"ajk-dp-day-today");
				var todaysDate = new Date();
				if (thisDay == todaysDate.getDate() && self.dateUsedForVisibleMonth.getMonth() == todaysDate.getMonth()
						&& self.dateUsedForVisibleMonth.getFullYear() == todaysDate.getFullYear()) {
					$(thisCell).addClass("ajk-dp-day-today");
				}
				if (thisDay == self.selectedDateTime.getDate() && self.dateUsedForVisibleMonth.getMonth() == self.selectedDateTime.getMonth()
						&& self.dateUsedForVisibleMonth.getFullYear() == self.selectedDateTime.getFullYear()) {
					$(thisCell).addClass("ajk-dp-day-selected");
				}
			} else {
				var hideClass = (dayOccuredOn && counter >= (dayOccuredOn - (dayOccuredOn % 7) + 7)) ? "ajk-dp-day-hide-display" : self.dayBlockInactiveClass;
				$(thisCell).text("null").removeClass(self.dayBlockInactiveClass).removeClass("ajk-dp-day-hide-display").removeClass("ajk-dp-day-selected").removeClass(
						"ajk-dp-day-today").addClass(hideClass);
			}
		}
		return self;
	},
	displayNextMonth : function() {
		var self = this;
		var newDate = new Date();
		newDate.setTime(self.dateUsedForVisibleMonth.getTime());
		if ((newDate.getMonth + 1) > 11) {
			newDate.setMonth(0);
			newDate.setYear(newDate.getFullYear() + 1);
		} else {
			newDate.setMonth(newDate.getMonth() + 1);
		}
		self.updateDisplayedMonth({
			date : newDate
		});
	},
	displayPrevMonth : function() {
		var self = this;
		var newDate = new Date();
		newDate.setTime(self.dateUsedForVisibleMonth.getTime());
		if ((newDate.getMonth - 1) < 0) {
			newDate.setMonth(11);
			newDate.setYear(newDate.getFullYear() - 1);
		} else {
			newDate.setMonth(newDate.getMonth() - 1);
		}
		self.updateDisplayedMonth({
			date : newDate
		});
	},
	dayWasClicked : function(data) {
		var self = this;
		self.dateUsedForVisibleMonth.setDate(data.day);
		self.callback({
			selectedDate : self.dateUsedForVisibleMonth
		});
	}
};
var AJKDatePickerHelper = {
	dateWeekDayArray : AJKHelpers.dateWeekDayShortArray,
	daysArray : AJKHelpers.dateWeekDayArray,
	daysShortArray : AJKHelpers.dateWeekDayShortArray,
	monthsArray : AJKHelpers.dateMonthsArray,
	monthsSemiShortArray : AJKHelpers.dateMonthsShortArray,
	monthsShortArray : AJKHelpers.dateMonthsShortArray,
	daySuffixArray : AJKHelpers.dateDaySuffixArray,
	oneDayInMS : 1000 * 60 * 60 * 24,
	getDayOfWeekStrForDate : function(data) {
		var thisDate = data.date;
		var dayVersion = data.dayVersion;
		var dayOfWeek = thisDate.getDay();
		if (dayVersion == "short") {
			return this.daysShortArray[dayOfWeek];
		} else {
			return this.daysArray[dayOfWeek];
		}
	},
	leadingZero : function(nr) {
		if (nr < 10 && nr > 0) {
			nr = "0" + nr;
		} else if (nr == 0) {
			nr = "00";
		}
		return nr;
	},
	getDayArrayForMonthOfYear : function(data) {
		var selectedMonth = data.date.getMonth();
		var selectedYear = data.date.getFullYear();
		var FOM = new Date(selectedYear, selectedMonth, 1);
		var FOMWeekDay = FOM.getDay();
		var FOMDayOffset = FOMWeekDay - 1;
		if (FOMDayOffset == -1) {
			FOMDayOffset = 6;
		}
		var nextMonth = new Date(selectedYear, (selectedMonth + 1), 1);
		var FOMMonthLength = Math.round(((nextMonth - FOM) / this.oneDayInMS));
		var LDOM = new Date();
		LDOM.setFullYear(selectedYear, selectedMonth, FOMMonthLength);
		var LDOMDayOffset = 7 - LDOM.getDay();
		if (LDOMDayOffset == 7) {
			LDOMDayOffset = 0;
		}
		var calendarArray = new Array();
		for (var counter = 0; counter < FOMDayOffset; counter++) {
			calendarArray[calendarArray.length] = "";
		}
		for (var counter2 = 0; counter2 < FOMMonthLength; counter2++) {
			calendarArray[calendarArray.length] = (counter2 + 1);
		}
		for (var counter3 = 0; counter3 < LDOMDayOffset; counter3++) {
			calendarArray[calendarArray.length] = "";
		}
		return calendarArray;
	}
};
TLTranslation["english"] = {
	months : [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
	shortMonths : [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
	daySuffixes : [ "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th",
			"th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th" ],
	weekDays : [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
	shortWeekDays : [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
	more : "more",
	by : "By",
	aboutThisTimeline : "About this timeline",
	"continue" : "Continue",
	clickToFindOutMore : "Click to find out more",
	findOutMore : "Find out more",
	videos : "Videos",
	audio : "Audio",
	images : "Images",
	stories : "x1 of x2 stories",
	playAudio : "Play audio",
	playVideo : "Play video",
	closeAudio : "Close audio",
	closeVideo : "Close video",
	BC : "BC",
	AD : "AD",
	million : "million",
	billion : "billion",
	userControls : {
		"search" : "Search",
		categories : "Categories",
		viewType : "View Type",
		spacing : "Spacing",
		zoom : "Zoom",
		enterSearchTerm : "Enter search term",
		"go" : "Go",
		displaying : "Displaying:",
		allStories : "All stories",
		stories : "stories",
		story : "story",
		matching : "matching",
		"clear" : "clear",
		showAll : "Show All",
		standard : "Standard",
		categoryBands : "Category Bands",
		colouredStories : "Coloured Stories",
		duration : "Duration",
		topToBottom : "Top to Bottom",
		"rows" : "rows",
		equalSpacing : "Equal Spacing"
	}
};
TLTranslation["english-common"] = {
	months : [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
	shortMonths : [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
	daySuffixes : [ "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th",
			"th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th" ],
	weekDays : [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
	shortWeekDays : [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
	more : "more",
	by : "By",
	aboutThisTimeline : "About this timeline",
	"continue" : "Continue",
	clickToFindOutMore : "Click to find out more",
	findOutMore : "Find out more",
	videos : "Videos",
	audio : "Audio",
	images : "Images",
	stories : "x1 of x2 stories",
	playAudio : "Play audio",
	playVideo : "Play video",
	closeAudio : "Close audio",
	closeVideo : "Close video",
	BC : "BCE",
	AD : "CE",
	million : "million",
	billion : "billion"
};
TLTranslation["chinese-simplified"] = {
	translation_credit : "Jeremy Wu PhD (www.jeremy-wu.com)",
	months : [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
	shortMonths : [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
	daySuffixes : [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
	weekDays : [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ],
	shortWeekDays : [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ],
	more : "更多",
	by : "经",
	aboutThisTimeline : "有关这时间轴",
	"continue" : "继续",
	findOutMore : "找到更多",
	videos : "视频",
	audio : "音响",
	images : "图像",
	stories : "x1 / x2 故事",
	playAudio : "开音响",
	playVideo : "开视频",
	closeAudio : "关音响",
	closeVideo : "关视频",
	BC : "公元前",
	AD : "公元后",
	million : "百万",
	billion : "十亿"
};
TLTranslation["chinese-traditional"] = {
	translation_credit : "Jeremy Wu PhD (www.jeremy-wu.com)",
	months : [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
	shortMonths : [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
	daySuffixes : [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
	weekDays : [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ],
	shortWeekDays : [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ],
	more : "更多",
	by : "經",
	aboutThisTimeline : "有關這時間軸",
	"continue" : "繼續",
	findOutMore : "找到更多",
	videos : "視頻",
	audio : "音響",
	images : "圖像",
	stories : "x1 / x2 故事",
	playAudio : "開音響",
	playVideo : "開視頻",
	closeAudio : "關音響",
	closeVideo : "關視頻",
	BC : "公元前",
	AD : "公元後",
	million : "百萬",
	billion : "十億"
};