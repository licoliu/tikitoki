$import("assets.js.core.component.TLMarker");

Class.forName({
	name : "class assets.js.security.component.TLSecurityMarker extends assets.js.core.component.TLMarker",

	"@Getter @Setter private isEditButtonActive" : false,

	focus : function(data) {
		var self = this;
		var tData = (data) ? data : "";
		self.$super.focus(tData);
		if (self.mainController.timeline.isEditable && (!self.isEditButtonActive || tData.forceUpdate) && self.mainController.adminController.adminVisible
				&& self.mainController.adminController.storyEditButton) {
			self.isEditButtonActive = true;
			self.mainController.adminController.storyEditButton.showForStory({
				story : self
			});
		}
	},
	unfocus : function(data) {
		var self = this;
		var tData = (data) ? data : "";
		self.$super.unfocus(tData);
		if (self.mainController.timeline.isEditable && self.mainController.adminController.storyEditButton) {
			self.mainController.adminController.storyEditButton.remove();
		}
		self.isEditButtonActive = false;
	},
	showExtraInfo : function(data) {
		var self = this;
		var tData = (data) ? data : "";
		self.$super.showExtraInfo(tData);
		if (self.mainController.adminController.storyEditButton) {
			self.mainController.adminController.storyEditButton.remove();
		}
	},
	deleteMediaItem : function(data) {
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
	},
	createNewMediaItem : function() {
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
	},
	mediaHasBeenUpdated : function() {
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
	},
	addMediaItem : function(data) {
		var self = this;
		var mediaItem = data.mediaItem;
		self.media.push(mediaItem);
		self.mediaHasBeenUpdated();
	},
	setValue : function(data) {
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
	},
	updateDisplayDates : function() {
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
	},
	categoryHasChanged : function() {
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
	},
	updatePositionFromDate : function() {
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
	},
	updateDateStatus : function() {
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
	}
});
