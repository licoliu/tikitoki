Class
		.forName({
			name : "class assets.js.security.controller.TLAdminFeedController extends Object",

			TLAdminFeedController : function(data) {
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
			},
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
				self.listController = new AJKScrollableListController(
						{
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
								insertHTML += '<a href="#">' + TLConfigText['adminBasic_Edit'] + '</a> | <a class="tl-ah-li-delete" href="#">' + TLConfigText['adminBasic_Delete']
										+ '</a>';
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
		});