$import("assets.js.core.controller.TLMainController");

Class.forName({
	name : "class assets.js.security.controller.TLSecurityMainController extends assets.js.core.controller.TLMainController",

	launchAdmin : function() {
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
				action : "security/timeline/1.xml",
				method : "get",
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
	},
	setLanguage : function(data) {
		var self = this;
		var language = data.language;
		$(self.domMainHolder).removeClass("tl-language-" + self.timeline.language);
		self.timeline.language = language;
		$(self.domMainHolder).addClass("tl-language-" + self.timeline.language);
		self.initLanguage();
	},
	initialiseAdmin : function() {
		var self = this;
		self.timeline.lazyLoadingActive = false;
		self.adminController = new TLAdminController({
			domRoot : $("#tl-admin-holder").get()[0],
			domAdminTab : $("#tl-admin-main-tab").get()[0],
			user : self.user,
			mainController : self,
			timeline : self.timeline
		}).init();
	},
	createNewMarker : function() {
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
	},
	deleteMarker : function(data) {
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
	}
});
