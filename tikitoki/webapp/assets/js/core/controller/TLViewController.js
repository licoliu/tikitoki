$import("assets.js.core.utils.AJKHelpers");

$import("assets.js.core.setting.HourMinsScaleSettings");
$import("assets.js.core.setting.DayHourScaleSettings");
$import("assets.js.core.setting.MonthDayScaleSettings");
$import("assets.js.core.setting.YearMonthScaleSettings");
$import("assets.js.core.setting.DecadeYearScaleSettings");
$import("assets.js.core.setting.CenturyDecadeScaleSettings");
$import("assets.js.core.setting.MilleniumCenturyScaleSettings");
$import("assets.js.core.component.TLViewCategoryBand");
$import("assets.js.core.effect.AJKDraggable");
$import("assets.js.core.component.TLViewScaleBlock");

Class
		.forName({
			name : "class assets.js.core.controller.TLViewController extends Object",

			TLViewController : function(data) {
				var self = this;
				self.items = data.items;
				self.timeline = data.timeline;
				self.domEl = data.domEl;
				self.zoom = data.zoom;
				self.timeline = data.timeline;
				self.currentViewType = self.timeline.viewType;
				self.type = self.zoom;
				self.domDateDisplayer = data.domDateDisplayer;
				self.originalStartDate = data.originalStartDate;
				self.originalEndDate = data.originalEndDate;
				self.startDate = data.startDate;
				self.endDate = data.endDate;
				self.dateRange = this.endDate.getTime() - this.startDate.getTime();
				self.scaleColour = data.scaleColour;
				self.viewScaleBlocks = new Array();
				self.domViewBlocksHolder = "";
				self.width = 0;
				self.stageDraggedFunc = data.stageDraggedFunc;
				self.stageLeftOffset = "";
				self.realStageLeftOffset = "";
				self.animationTimeout = "";
				self.currentlyAnimating = false;
				self.viewScaleSettings = new Array();
				self.minStagePos = 0;
				self.maxStagePos = 0;
				self.domStageStoryHolder = "";
				self.minIdealStorySeparation = (self.timeline.viewType == "category-band") ? 200 : 327;
				self.availableScales = new Array();
				self.availableScalesByName = new Array();
				self.draggableObj = "";
				self.displayDate = "";
				self.easeTimeoutTime = ($.browser.isIOS) ? 100 : 50;
				self.easingFraction = ($.browser.isIOS) ? 1.25 : 2;
				self.categoryBands = [];
				self.categoryBandsByKey = [];
			},
			"public static stageDragMultiplier" : 1,
			"public static markerSpacingView" : [ {
				type : "standard",
				markerSpacing : 0,
				categoryViewMarkerSpacing : 0
			}, {
				type : "equal",
				markerSpacing : 352,
				categoryViewMarkerSpacing : 238
			}, {
				type : "equal",
				markerSpacing : 176,
				categoryViewMarkerSpacing : 300
			}, {
				type : "top-to-bottom",
				rows : 3
			}, {
				type : "top-to-bottom",
				rows : 4
			}, {
				type : "top-to-bottom",
				rows : 5
			}, {
				type : "top-to-bottom",
				rows : 6
			}, {
				type : "top-to-bottom",
				rows : 7
			}, {
				type : "top-to-bottom",
				rows : 8
			}, {
				type : "top-to-bottom",
				rows : 9
			}, {
				type : "top-to-bottom",
				rows : 10
			} ],
			"public static isASuitableScaleForDateRange" : function(data) {
				var scaleName = data.scaleName;
				var startDate = data.startDate;
				var endDate = data.endDate;
				var availableScales = assets.js.core.controller.TLViewController.getAvailableScalesForDateRange({
					startDate : startDate,
					endDate : endDate
				});
				var matchFound = false;
				$.each(availableScales, function() {
					if (this.name == scaleName) {
						matchFound = true;
					}
				});
				return matchFound;
			},
			"public static getBestZoomForDateRange" : function(data) {
				var startDate = data.startDate;
				var endDate = data.endDate;
				var availableScales = assets.js.core.controller.TLViewController.getAvailableScalesForDateRange({
					startDate : startDate,
					endDate : endDate
				});
				var idealWidth = 30000;
				var scaleClosestToIdealWidth = "";
				$.each(availableScales, function() {
					var scaleWidth = (endDate.getTime() - startDate.getTime()) * this.object.getStageWidthRatio();
					var distanceFromIdeal = Math.abs(scaleWidth - idealWidth);
					if (!scaleClosestToIdealWidth || (distanceFromIdeal < scaleClosestToIdealWidth.distanceFromIdeal)) {
						scaleClosestToIdealWidth = this;
						scaleClosestToIdealWidth.distanceFromIdeal = distanceFromIdeal;
					}
				});
				return scaleClosestToIdealWidth;
			},
			"public static getAvailableScalesForDateRange" : function(data) {
				var startDate = data.startDate;
				var endDate = data.endDate;
				var scale = "";
				var availableScales = new Array();
				var availableScalesByName = new Array();
				var allScales = new Array();
				for (scale in assets.js.core.controller.TLViewController.viewScaleSettings) {
					var thisScale = assets.js.core.controller.TLViewController.viewScaleSettings[scale];
					if (scale != "indexOf") {
						var scaleWidth = (endDate.getTime() - startDate.getTime()) * thisScale.getStageWidthRatio();
						var minWidth = 500;
						var maxWidth = 500000;
						var scaleInfoObj = {
							name : scale,
							width : scaleWidth,
							object : thisScale
						};
						if (scaleWidth <= maxWidth && scaleWidth >= minWidth) {
							availableScales.push(scaleInfoObj);
							availableScalesByName[scaleInfoObj.name] = scaleInfoObj;
						}
						allScales.push(scaleInfoObj);
					}
				}
				availableScales.sort(function(a, b) {
					return (a.width > b.width) ? 1 : (a.width == b.width) ? 0 : -1;
				});
				if (availableScales.length == 0) {
					var smallestScale = "hour-1-mins-large";
					var largestScale = "large-date-range-9";
					if (endDate.getTime() - startDate.getTime() < assets.js.core.utils.AJKHelpers.dateOneDayInMS) {
						var aScale = {
							name : smallestScale,
							width : 1,
							object : assets.js.core.controller.TLViewController.viewScaleSettings[smallestScale]
						};
					} else {
						var aScale = {
							name : largestScale,
							width : 1,
							object : assets.js.core.controller.TLViewController.viewScaleSettings[largestScale]
						};
					}
					availableScales.push(aScale);
				}
				return availableScales;
			},
			init : function() {
				var self = this;
				theTLSettings.registerAsObserver({
					type : "currentDate",
					observer : self
				});
				$(self.domEl).addClass("tl-stage-view-" + self.currentViewType);
				if (self.currentViewType == "duration") {
					$(self.domEl).addClass("tl-stage-view-color-category-stories");
				}
				if (self.timeline.viewType == "category-band") {
					self.timeline.equalMarkerSpacing = assets.js.core.controller.TLViewController.markerSpacingView[self.timeline.storySpacingType].categoryViewMarkerSpacing;
				} else {
					self.timeline.equalMarkerSpacing = assets.js.core.controller.TLViewController.markerSpacingView[self.timeline.storySpacingType].markerSpacing;
				}
				$(theTLMainController.domFixedStageContent).find(".tl-view-category-band-label").remove();
				self.easeTimeoutTime = ($.browser.msie) ? 75 : 50;
				self.easingFraction = ($.browser.msie) ? 1.75 : 2;
				theAJKWindowResizeEvent.registerAsObserver({
					observer : self
				});
				self.availableScales = assets.js.core.controller.TLViewController.getAvailableScalesForDateRange({
					startDate : self.originalStartDate,
					endDate : self.originalEndDate
				});
				$(self.domEl).addClass("tl-stage-" + self.type);
				$(self.domEl).addClass("tl-stage-view-" + self.currentViewType);
				if (self.timeline.markerSpacing == "equal") {
					self.timeline.equalMarkerLeftPadding = self.timeline.initialEqualMarkerLeftPadding * self.items.length / 140 * (self.timeline.equalMarkerSpacing / 176 + 0.5);
					self.timeline.equalMarkerTotalPadding = self.timeline.initialEqualMarkerTotalPadding * self.items.length / 140 * self.timeline.equalMarkerSpacing / 176;
					self.timeline.equalMarkerLeftPadding = (self.timeline.equalMarkerLeftPadding < 500) ? 500 : self.timeline.equalMarkerLeftPadding;
					self.timeline.equalMarkerTotalPadding = (self.timeline.equalMarkerTotalPadding < 750) ? 750 : self.timeline.equalMarkerTotalPadding;
					self.width = self.timeline.equalMarkerTotalPadding + self.items.length * (self.timeline.equalMarkerSpacing + 5.5);
					self.width = (self.width < self.timeline.equalSpacingMinWidth) ? self.timeline.equalSpacingMinWidth : self.width;
				} else {
					self.width = (theTLSettings.timeInfo.end.getTime() - theTLSettings.timeInfo.start.getTime())
							* assets.js.core.controller.TLViewController.viewScaleSettings[self.type].getStageWidthRatio();
				}
				$(self.domEl).empty();
				$(self.domEl).css({
					width : self.width
				});
				if (self.timeline.viewType == "category-band") {
					self.createCategoryBands();
				} else {
					self.createViewScaleBlocks();
				}
				self.displayMarkers();
				self.initialiseViewDrag();
				$(self.domEl).click(
						function(e) {
							var domStoryBlock = assets.js.core.utils.AJKHelpers.getSelfOrFirstParantOfClass({
								domEl : e.target,
								className : "tl-story-block"
							});
							if (domStoryBlock) {
								var key = $(domStoryBlock).attr("markerKey");
								var clickedStoryBlock = theTLMainController.markersByKey[key];
								if ($(e.target).hasClass("ig-inner-image-mask") && clickedStoryBlock.isFlickrImage) {
									if (!assets.js.core.effect.AJKDraggable.cancelClick) {
										var flickrImagePage = assets.js.core.utils.AJKHelpers.getFKRPhotoPageFromImageSrc({
											src : clickedStoryBlock.displayImage.src
										});
										window.open(flickrImagePage);
									}
								} else if ($(e.target).hasClass("tl-sb-more-button") || self.timeline.viewType == "duration"
										|| (self.timeline.viewType == "category-band" && clickedStoryBlock.category.viewType == "duration")
										|| assets.js.core.utils.AJKHelpers.isIDevice()) {
									clickedStoryBlock.showExtraInfo();
								} else {
									theTLMainController.hideContentPanelIfVisible();
								}
							} else {
								theTLMainController.hideContentPanelIfVisible();
							}
							return false;
						}).mouseover(function(e) {
					var domImageGalleryBlock = assets.js.core.utils.AJKHelpers.getSelfOrFirstParantOfClass({
						domEl : e.target,
						className : "tl-story-block"
					});
					if (domImageGalleryBlock) {
						var key = $(domImageGalleryBlock).attr("markerKey");
						var relatedStory = theTLMainController.markersByKey[key];
						relatedStory.focus();
					}
				}).mouseout(function(e) {
					var domImageGalleryBlock = assets.js.core.utils.AJKHelpers.getSelfOrFirstParantOfClass({
						domEl : e.target,
						className : "tl-story-block"
					});
					if (domImageGalleryBlock) {
						var key = $(domImageGalleryBlock).attr("markerKey");
						var relTarg = e.relatedTarget || e.toElement;
						var toStoryBlock = assets.js.core.utils.AJKHelpers.getSelfOrFirstParantOfClass({
							domEl : relTarg,
							className : "tl-story-block"
						});
						var toKey = (toStoryBlock) ? $(toStoryBlock).attr("markerKey") : "";
						if (!toStoryBlock || toKey != key) {
							var relatedStory = theTLMainController.markersByKey[key];
							relatedStory.unfocus();
						}
					}
				});
				self.windowDidResize({});
				return self;
			},
			getFractionAlongTimeline : function() {
				var self = this;
				var offset = self.realStageLeftOffset;
				var minPos = self.minStagePos;
				var maxPos = self.maxStagePos;
				return (((offset - minPos) / (maxPos - minPos) - 0.5) * 2);
			},
			disable : function() {
				var self = this;
				$(self.domEl).css({
					display : "none"
				});
				theTLSettings.removeAsObserver({
					type : "currentDate",
					observer : self
				});
			},
			enable : function() {
				var self = this;
				theTLSettings.registerAsObserver({
					type : "currentDate",
					observer : self
				});
				self.currentDateWasUpdatedTo({
					date : theTLSettings.currentDate
				});
				$(self.domEl).css({
					display : "block"
				});
				theTLMainController.updateMarkersImageSize();
			},
			getEquallySpacedOffsetForDate : function(data) {
				var self = this;
				var aDate = data.aDate;
				var numItems = self.items.length;
				var lastFoundItem = false;
				var offset = 0;
				for (var counter = 0; counter < numItems; counter++) {
					var thisItem = self.items[counter];
					if (aDate.getTime() <= thisItem.startDate.getTime()) {
						lastFoundItem = thisItem;
						break;
					}
				}
				if (lastFoundItem) {
					var prevItem = self.items[lastFoundItem.orderIndex - 1];
					if (prevItem) {
						if (lastFoundItem.startDate.getTime() != prevItem.startDate.getTime()) {
							var extra = (lastFoundItem.leftOffset - prevItem.leftOffset) * (aDate.getTime() - prevItem.startDate.getTime())
									/ (lastFoundItem.startDate.getTime() - prevItem.startDate.getTime());
						} else {
							extra = 0;
						}
						offset = prevItem.leftOffset + extra;
					} else {
						offset = -1;
					}
				} else {
					lastFoundItem = self.items[self.items.length - 1];
					var viewStageWidth = self.width;
					if (lastFoundItem.startDate.getTime() != self.endDate.getTime()) {
						var extra = (viewStageWidth - lastFoundItem.leftOffset) * (aDate.getTime() - lastFoundItem.startDate.getTime())
								/ (self.endDate.getTime() - lastFoundItem.startDate.getTime());
					} else {
						extra = 0;
					}
					offset = lastFoundItem.leftOffset + extra;
				}
				return offset;
			},
			createCategoryBands : function() {
				var self = this;

				var ourCategories = [];
				var totalSize = 0;
				$.each(self.timeline.categories, function() {
					if (!this.hide
							&& !(this.autoGenerated && theTLMainController.markersByCategory[this.key] && theTLMainController.markersByCategory[this.key].markers.length == 0)) {
						ourCategories.push(this);
						var size = parseInt(this.size, 10);

						if (size > 0 && size < 8) {
							this.size = "8";
							size = 8;
						}
						totalSize += size;
					}
				});

				// TODO
				var spacingPercent = .5, spacing = (self.timeline.categories.length + 1) * spacingPercent, allSpace = (totalSize <= 100) ? 100 : totalSize + spacing;
				if (allSpace > 100) {
					$(self.domEl).css({
						height : allSpace + "%"
					});
					$(theTLMainController.domFixedStageContent).css({
						height : allSpace + "%"
					});
				}
				allSpace -= spacing;

				var spaceRemaining = allSpace;

				var itemsRemaining = ourCategories.length;
				var remainingSize = totalSize;
				self.activeCategories = ourCategories;
				if (self.timeline.categories.length == 0) {
					ourCategories = [ theTLMainController.defaultCategory ];
					itemsRemaining = 1;
					remainingSize = theTLMainController.defaultCategory.size;
				}
				itemsRemaining = (itemsRemaining) ? itemsRemaining : 1;
				$.each(ourCategories, function(i) {
					this.bandClass = "";
					var size = parseInt(this.size, 10);
					if (size <= 0) {
						return true;
					}
					var bandPercentHeight = Math.round(size / remainingSize * spaceRemaining);
					this.percentHeight = bandPercentHeight;
					var bandTop = allSpace - spaceRemaining + spacingPercent * (i + 1);
					spaceRemaining -= bandPercentHeight;
					remainingSize -= size;
					itemsRemaining--;
					var aCatBand = new assets.js.core.component.TLViewCategoryBand({
						category : this,
						height : bandPercentHeight,
						top : bandTop,
						width : self.width
					}).init();
					self.categoryBands.push(aCatBand);
					self.categoryBandsByKey[this.key] = aCatBand;
					$(self.domEl).append(aCatBand.domRoot);
					$(theTLMainController.domFixedStageContent).append(aCatBand.domLabel);
				});
			},
			displayMarkers : function() {
				var self = this;
				var domDiv = $('<div class="tl-stage-story-holder"></div>').get()[0];
				self.domStageStoryHolder = domDiv;
				var startTimeNum = self.startDate.getTime();
				$.each(self.items, function() {
					if (self.timeline.markerSpacing == "equal") {
						this.leftOffset = self.timeline.equalMarkerLeftPadding + (this.orderIndex * self.timeline.equalMarkerSpacing);
					} else {
						this.leftOffset = -self.getLeftOffsetForDate({
							date : this.startDate
						});
					}
				});
				self.generateMarkerSizeAndPositions();
				self.adjustMarkerPositions();
				$.each(self.items, function() {
					var domMarker = this.generateDom();
					if (self.timeline.viewType == "category-band") {
						if (self.categoryBandsByKey[this.category.key]) {
							$(self.categoryBandsByKey[this.category.key].domRoot).append(domMarker);
						}
					} else {
						if (self.timeline.viewType == "duration") {
							$(domDiv).append(domMarker);
						} else {
							$(domDiv).prepend(domMarker);
						}
					}
				});
				if (self.timeline.viewType != "category-band") {
					$(self.domEl).append(domDiv);
				}
			},
			destroy : function() {
				var self = this;
				$(self.domStageStoryHolder).remove();
				$(self.domViewBlocksHolder).remove();
				$(self.domEl).removeClass("tl-stage-" + self.type);
				$(self.domEl).removeClass("tl-stage-view-" + self.currentViewType);
				if (self.currentViewType == "duration") {
					$(self.domEl).removeClass("tl-stage-view-color-category-stories");
				}
				$(self.domEl).unbind();
				self.draggableObj.kill();
				theTLSettings.removeAsObserver({
					type : "currentDate",
					observer : self
				});
				theAJKWindowResizeEvent.removeAsObserver({
					observer : self
				});
			},
			refreshMarkersAfterFilterChange : function() {
				var self = this;
				self.generateMarkerSizeAndPositions();
				self.refreshDisplayMarkers();
				$.each(self.items, function() {
					this.positionDisplayImageInContainer();
				});
			},
			addNewMarkerToStage : function(data) {
				var self = this;
				var marker = data.marker;
				marker.leftOffset = -self.getLeftOffsetForDate({
					date : marker.startDate
				});
				self.generateMarkerSizeAndPositions();
				var domMarker = marker.generateDom();
				$(self.domStageStoryHolder).prepend(domMarker);
				self.refreshDisplayMarkers();
				theTLMainController.updateMarkersImageSize();
			},
			markerWasDeleted : function() {
				var self = this;
				self.generateMarkerSizeAndPositions();
				self.refreshDisplayMarkers();
				theTLMainController.updateMarkersImageSize();
			},
			refreshDisplayMarkers : function() {
				var self = this;
				$.each(self.items, function() {
					this.initialHorizAdjustment = 0;
					this.horizAdjustment = 0;
					this.numCloseMarkers = 0;
					this.sizeClass = "";
					this.vSize = "normal";
					this.leftOffset = -self.getLeftOffsetForDate({
						date : this.startDate
					});
				});
				self.generateMarkerSizeAndPositions();
				self.adjustMarkerPositions();
				$.each(self.items, function() {
					this.refreshPositionAndSize();
				});
			},
			adjustMarkerPositions : function() {
				var self = this;
				if (self.timeline.viewType == "duration" || self.timeline.markerSpacing == "top-to-bottom") {
					$.each(self.items, function() {
						this.horizAdjustment = 0;
					});
					return;
				}
				var itemIndex = 0;
				var verticalPos = 0;
				var maxVerticalPos = 10;
				var minIdealStorySeparation = [];
				minIdealStorySeparation["normal"] = 327;
				minIdealStorySeparation["small"] = 327;
				minIdealStorySeparation["very-small"] = 327;
				minIdealStorySeparation["tiny"] = 327;
				minIdealStorySeparation["miniature"] = 175;
				minIdealStorySeparation["category-normal"] = 238;
				minIdealStorySeparation["category-small"] = minIdealStorySeparation["category-small-saved"] = 175;
				var minAdjust = [];
				var maxAdjust = [];
				minAdjust["normal"] = -132;
				maxAdjust["normal"] = 130;
				minAdjust["small"] = -132;
				maxAdjust["small"] = 130;
				minAdjust["very-small"] = -132;
				maxAdjust["very-small"] = 130;
				minAdjust["tiny"] = -132;
				maxAdjust["tiny"] = 130;
				minAdjust["miniature"] = -56;
				maxAdjust["miniature"] = 54;
				minAdjust["category-small"] = -56;
				maxAdjust["category-small"] = 54;
				minAdjust["category-normal"] = -86;
				maxAdjust["category-normal"] = 84;
				var getItemOfSimilarVerticalPosition = function(data) {
					var anItem = data.anItem;
					var itemIndex = (self.timeline.viewType == "category-band") ? anItem.categoryIndex : data.itemIndex;
					var verticalPos = data.verticalPos;
					var compareItem = "";
					var direction = data.direction;
					var compareList = (self.timeline.viewType == "category-band") ? theTLMainController.markersByCategory[anItem.category.key].markers : self.items;
					var compareLimit = 2;
					compareLimit = (anItem.vSize == "normal" || anItem.vSize == "category-normal") ? 10 : compareLimit;
					while (compareItem = compareList[itemIndex += direction]) {
						if (Math.abs(compareItem.verticalPos - anItem.verticalPos) <= compareLimit || compareItem.vSize == "normal") {
							return compareItem;
						}
					}
					return false;
				};
				$.each(self.items, function() {
					if (self.timeline.viewType == "category-band" && this.category.bandSize != "category-normal") {
						minIdealStorySeparation["category-small"] = minIdealStorySeparation["category-normal"];
					}
					var nextItem = getItemOfSimilarVerticalPosition({
						anItem : this,
						itemIndex : itemIndex,
						verticalPos : this.verticalPos,
						direction : 1
					});
					var previousItem = getItemOfSimilarVerticalPosition({
						anItem : this,
						itemIndex : itemIndex,
						verticalPos : this.verticalPos,
						direction : -1
					});
					var adjustmentAmount = 0;
					var currentItemAdjustedPos = this.leftOffset + this.horizAdjustment;
					var nextItemAdjustedPos = nextItem.leftOffset + nextItem.horizAdjustment;
					var previousItemAdjustedPos = previousItem.leftOffset + previousItem.horizAdjustment;
					var nextItemClose = false;
					var prevItemClose = false;
					if (nextItem && (nextItemAdjustedPos - currentItemAdjustedPos < minIdealStorySeparation[this.vSize])) {
						adjustmentAmount = (nextItemAdjustedPos - currentItemAdjustedPos - minIdealStorySeparation[this.vSize]);
						adjustmentAmount = (adjustmentAmount < minAdjust[this.vSize]) ? minAdjust[this.vSize] : adjustmentAmount;
						nextItemClose = true;
					} else if (previousItem && (currentItemAdjustedPos - previousItemAdjustedPos < minIdealStorySeparation[previousItem.vSize])) {
						adjustmentAmount = (currentItemAdjustedPos - previousItemAdjustedPos + minIdealStorySeparation[previousItem.vSize]);
						adjustmentAmount = (adjustmentAmount > maxAdjust[this.vSize]) ? maxAdjust[this.vSize] : adjustmentAmount;
						prevItemClose = true;
					}
					if (nextItemClose && !prevItemClose) {
						adjustmentAmount = minAdjust[this.vSize];
						if (previousItem) {
							adjustmentAmount = (previousItemAdjustedPos - currentItemAdjustedPos + minIdealStorySeparation[previousItem.vSize]);
							adjustmentAmount = (adjustmentAmount < minAdjust[this.vSize]) ? minAdjust[this.vSize] : adjustmentAmount;
							adjustmentAmount = (adjustmentAmount > maxAdjust[this.vSize]) ? maxAdjust[this.vSize] : adjustmentAmount;
						}
					}
					this.horizAdjustment = adjustmentAmount;
					itemIndex++;
					minIdealStorySeparation["category-small"] = minIdealStorySeparation["category-small-saved"];
				});
			},
			calculateTopToBottomPositions : function(data) {
				var self = this;
				var numRows = data.numRows;
				var maxVerticalPos = data.maxVerticalPos;
				var rowCounter = numRows - 1;
				var items = data.items;
				var rowLastDate = [];
				var bottomToTop = (data.bottomToTop) ? data.bottomToTop : false;
				$.each(items, function() {
					if (self.timeline.viewType == "duration" && this.startDate.getTime() < this.endDate.getTime()) {
						var currentRow = rowCounter, inc = 0;
						while (rowLastDate[currentRow] && rowLastDate[currentRow] > this.startDate.getTime() && inc++ < numRows) {
							if (--currentRow < 0) {
								currentRow = numRows - 1;
							}
						}
						if (inc == numRows) {
							this.setVerticalPos({
								pos : (bottomToTop) ? (numRows - 1 - rowCounter) / numRows * maxVerticalPos : rowCounter / numRows * maxVerticalPos
							});
							rowLastDate[rowCounter] = this.endDate.getTime();
						} else {
							this.setVerticalPos({
								pos : (bottomToTop) ? (numRows - 1 - currentRow) / numRows * maxVerticalPos : currentRow / numRows * maxVerticalPos
							});
							rowLastDate[currentRow] = this.endDate.getTime();
							if (currentRow != rowCounter) {
								rowCounter++;
							}
						}
					} else {
						this.setVerticalPos({
							pos : (bottomToTop) ? (numRows - 1 - rowCounter) / numRows * maxVerticalPos : rowCounter / numRows * maxVerticalPos
						});
					}
					if (self.timeline.viewType == "duration" || (self.timeline.viewType == "category-band" && this.category.viewType == "duration")) {
						this.generateDurationSizeData();
					} else {
						this.generateSizeData();
					}
					if (--rowCounter < 0) {
						rowCounter = numRows - 1;
					}
				});
			},
			calculateStandardSpacingPositions : function(data) {
				var self = this;
				var items = data.items;
				var itemIndex = 0;
				var verticalPos = 0;
				var maxVerticalPos = 10;
				$
						.each(
								items,
								function() {
									var compareIndex = (self.timeline.viewType == "category-band") ? this.categoryIndex + 1 : itemIndex + 1;
									var compareList = (self.timeline.viewType == "category-band") ? theTLMainController.markersByCategory[this.category.key].markers : self.items;
									while (compareList[compareIndex]
											&& (compareList[compareIndex].leftOffset + compareList[compareIndex].horizAdjustment) - (this.leftOffset + this.horizAdjustment) < self.minIdealStorySeparation) {
										this.numCloseMarkers++;
										compareList[compareIndex].numCloseMarkers++;
										compareIndex++;
									}
									this.generateSizeData();
									if (self.timeline.viewType == "category-band") {
										if (this.vSize == "category-normal") {
											verticalPos = 0;
											this.setVerticalPos({
												pos : 0
											});
										} else {
											verticalPos = (verticalPos > 6) ? 0 : verticalPos;
											this.setVerticalPos({
												pos : verticalPos
											});
											verticalPos += 4.2;
										}
									} else if (this.vSize == "normal") {
										verticalPos = 0;
										this.setVerticalPos({
											pos : 0
										});
									} else if (this.vSize == "small") {
										verticalPos = (verticalPos > 6) ? 0 : verticalPos;
										this.setVerticalPos({
											pos : verticalPos
										});
										verticalPos += 5;
									} else if (this.vSize == "very-small") {
										verticalPos = (verticalPos > 7) ? 0 : verticalPos;
										this.setVerticalPos({
											pos : verticalPos
										});
										verticalPos += 4;
									} else if (this.vSize == "tiny") {
										verticalPos = (verticalPos > 7.5) ? 0 : verticalPos;
										this.setVerticalPos({
											pos : verticalPos
										});
										verticalPos += 2.5;
									} else if (this.vSize == "miniature") {
										verticalPos = (verticalPos > 7.5) ? 0 : verticalPos;
										this.setVerticalPos({
											pos : verticalPos
										});
										verticalPos += 2.5;
									}
									itemIndex++;
								});
			},
			generateMarkerSizeAndPositions : function() {
				var self = this;
				$.each(self.items, function() {
					this.numCloseMarkers = 0;
				});
				if ((self.timeline.viewType != "category-band") && (self.timeline.viewType == "duration" || self.timeline.markerSpacing == "top-to-bottom")) {
					self.calculateTopToBottomPositions({
						numRows : (self.timeline.viewType == "duration" && self.timeline.markerSpacing != "top-to-bottom") ? 5 : self.timeline.markerSpacingObj.rows,
						maxVerticalPos : (self.timeline.viewType == "duration") ? 10 : 9.2,
						items : self.items
					});
				} else if (self.timeline.viewType == "category-band") {
					$.each(self.timeline.categories, function() {
						if (this.viewType == "duration") {
							self.calculateTopToBottomPositions({
								numRows : this.rows,
								maxVerticalPos : 9,
								items : theTLMainController.markersByCategory[this.key].markers,
								bottomToTop : true
							});
						} else {
							self.calculateStandardSpacingPositions({
								items : theTLMainController.markersByCategory[this.key].markers
							});
						}
					});
				} else {
					self.calculateStandardSpacingPositions({
						items : self.items
					});
				}
			},
			generateMinMaxStagePositionsFromVisibleDates : function() {
				var self = this;
				self.minStagePos = self.getCentredLeftOffsetForDate({
					date : theTLSettings.visibleStartDate
				});
				self.maxStagePos = self.getCentredLeftOffsetForDate({
					date : theTLSettings.visibleEndDate
				});
			},
			initialiseViewDrag : function() {
				var self = this;
				self.draggableObj = new assets.js.core.effect.AJKDraggable({
					multiplier : assets.js.core.controller.TLViewController.stageDragMultiplier,
					domDragEl : self.domEl,
					limitFunc : function() {
						var limit = {
							minX : self.minStagePos,
							maxX : self.maxStagePos,
							minY : 0,
							maxY : 0
						};
						return limit;
					},
					mouseMoveFunc : function(data) {
						var leftOffset = -data.dragElPos.x;
						self.stageLeftOffset = -leftOffset;
						self.realStageLeftOffset = self.stageLeftOffset;
						var fraction = (leftOffset + 0.5 * theTLSettings.windowSize.width) / self.width;
						var aDate = assets.js.core.utils.AJKHelpers.getEmptyDate();
						aDate.setTime(self.startDate.getTime() + fraction * self.dateRange);
						theTLSettings.setCurrentDate({
							date : aDate,
							extraInfo : {
								drag : true
							}
						});
					},
					dragDidStartFunc : function() {
						theTLSettings.lastSelectedStory = "";
					},
					dragDidEndFunc : function() {
						theTLHashController.setHashToCurrentDate();
					}
				}).init();
			},
			createViewScaleBlocks : function() {
				var self = this;
				var aDiv = $("<div></div>").get()[0];
				self.domViewBlocksHolder = aDiv;
				if (self.timeline.markerSpacing == "equal") {
					var insertHTML = '<div style="background: url(assets/ui/stage/zebra-' + self.timeline.equalMarkerSpacing + 'px.png) '
							+ parseInt(self.timeline.equalMarkerLeftPadding - 0.5 * self.timeline.equalMarkerSpacing, 10) + 'px 0; width: ' + self.width
							+ 'px;" class="scale-block">';
					insertHTML += '<div style="background: url(assets/ui/stage/standard-scale-' + self.timeline.equalMarkerSpacing + 'px-segments.png) '
							+ parseInt(self.timeline.equalMarkerLeftPadding - 0.5 * self.timeline.equalMarkerSpacing, 10) + 'px bottom repeat-x;" class="index">';
					for (var counter = 0; counter < self.items.length; counter++) {
						var thisMarker = self.items[counter];
						var offset = self.timeline.equalMarkerLeftPadding + (counter * self.timeline.equalMarkerSpacing);
						insertHTML += '<div style="left: ' + offset + 'px" class="scale-block-label"><span id="tl-marker-equal-spacing-date-displayer-' + thisMarker.id + '">'
								+ thisMarker.formatDisplayDate({
									startDateOnly : true
								}) + '</span></div>';
					}
					insertHTML += '</div>';
					insertHTML += '<div class="content"></div>';
					insertHTML += '</div>';
					$(aDiv).append(insertHTML);
				} else {
					var thisBlockStartDate = assets.js.core.controller.TLViewController.viewScaleSettings[self.type].getFirstBlockStartDateFromDate({
						date : self.startDate
					});
					var counter = 0;
					while (thisBlockStartDate.getTime() < self.endDate.getTime() && counter < 5000) {
						var thisBlockDateRange = assets.js.core.controller.TLViewController.viewScaleSettings[self.type].getDateRangeInMS({
							blockStartDate : thisBlockStartDate
						});
						var aViewScaleBlock = new assets.js.core.component.TLViewScaleBlock({
							type : self.type,
							leftOffset : -self.getLeftOffsetForDate({
								date : thisBlockStartDate
							}),
							width : self.getWidthOfDateRange({
								dateRange : thisBlockDateRange
							}),
							text : assets.js.core.controller.TLViewController.viewScaleSettings[self.type].getTextForDate({
								date : thisBlockStartDate
							}),
							colour : self.scaleColour,
							viewScale : assets.js.core.controller.TLViewController.viewScaleSettings[self.type],
							controller : self,
							index : counter
						}).init();
						if (assets.js.core.controller.TLViewController.viewScaleSettings[self.type].adjustDomBlock) {
							assets.js.core.controller.TLViewController.viewScaleSettings[self.type].adjustDomBlock({
								domBlock : aViewScaleBlock.domEl,
								date : thisBlockStartDate
							});
						}
						self.viewScaleBlocks.push(aViewScaleBlock);
						$(aDiv).append(aViewScaleBlock.domEl);
						thisBlockStartDate.setTime(thisBlockStartDate.getTime() + thisBlockDateRange);
						counter++;
					}
				}
				$(self.domEl).css({
					width : self.width
				}).append(aDiv);
			},
			currentDateWasUpdatedTo : function(data) {
				var self = this;
				var currentDate = data.date;
				var animate = (data.extraInfo) ? data.extraInfo.animate : false;
				var drag = (data.extraInfo) ? data.extraInfo.drag : false;
				if (data.extraInfo && data.extraInfo.viewOnlySpeed) {
					setTimeout(function() {
						self.slideViewToDate({
							date : currentDate,
							instantly : (!animate && !drag)
						});
					}, data.extraInfo.viewOnlySpeed);
				} else {
					self.slideViewToDate({
						date : currentDate,
						instantly : (!animate && !drag)
					});
				}
				self.updateDisplayDate({
					date : currentDate
				});
			},
			getClosestMarkerIndexToRealDate : function(data) {
				var self = this;
				var testDateTime = data.date.getTime();
				var smallestDiff = -1;
				var lastMarker = false;
				var selectedMarker = false;
				var counter = 0;
				while (self.items[counter]) {
					var thisMarker = self.items[counter];
					var diff = Math.abs(thisMarker.startDate.getTime() - testDateTime);
					if (diff > smallestDiff && !selectedMarker && lastMarker) {
						selectedMarker = lastMarker;
					}
					lastMarker = thisMarker;
					smallestDiff = diff;
					counter++;
				}
				return selectedMarker || lastMarker;
			},
			getClosestMarkerIndexToDate : function(data) {
				var self = this;
				var aDate = data.date;
				var centreStagePos = (aDate.getTime() - self.startDate.getTime()) / (self.endDate.getTime() - self.startDate.getTime()) * self.width + 0.5
						* self.timeline.equalMarkerSpacing;
				var nearestMarker = parseInt((centreStagePos - self.timeline.equalMarkerLeftPadding) / self.timeline.equalMarkerSpacing, 10);
				return nearestMarker;
			},
			getEqualSpacingDateFromStandardDate : function(data) {
				var self = this;
				var aDate = data.aDate;
				var nearestMarker = self.getClosestMarkerIndexToDate({
					date : aDate
				});
				if (nearestMarker < 0) {
					aDate = self.startDate;
				} else if (self.items[nearestMarker]) {
					aDate = self.items[nearestMarker].startDate;
				} else {
					aDate = self.endDate;
				}
				return aDate;
			},
			updateDisplayDate : function(data) {
				var self = this;
				var aDate = data.date;
				var format = assets.js.core.controller.TLViewController.viewScaleSettings[self.type].displayDateFormat;
				format = (!format) ? "ddnn MMMM YYYY HH:00" : format;
				format = (self.timeline.topDateFormat != "auto") ? self.timeline.topDateFormat : format;
				if (self.timeline.markerSpacing == "equal") {
					aDate = self.getEqualSpacingDateFromStandardDate({
						aDate : aDate
					});
				}
				var displayDate = assets.js.core.utils.AJKHelpers.formatDate({
					date : aDate,
					formatString : format
				});
				if (displayDate != self.displayDate) {
					$(self.domDateDisplayer).text(displayDate);
					self.displayDate = displayDate;
				}
				if (self.displayDate) {
					$(self.domDateDisplayer).css({
						display : "block"
					});
				} else {
					$(self.domDateDisplayer).css({
						display : "none"
					});
				}
			},
			slideViewToDate : function(data) {
				var self = this;
				var date = data.date;
				var instantly = data.instantly;
				self.stageLeftOffset = self.getCentredLeftOffsetForDate({
					date : date
				});
				if ((!self.realStageLeftOffset && self.realStageLeftOffset !== 0) || instantly) {
					self.realStageLeftOffset = self.stageLeftOffset;
				}
				self.startStageEasing();
			},
			getCentredLeftOffsetForDate : function(data) {
				var self = this;
				var date = data.date;
				var offset = (date.getTime() - self.startDate.getTime()) / self.dateRange * self.width;
				offset = offset - 0.5 * theTLSettings.windowSize.width;
				return -offset;
			},
			getLeftOffsetForDate : function(data) {
				var self = this;
				var date = data.date;
				var offset = (date.getTime() - self.startDate.getTime()) / self.dateRange * self.width;
				return -Math.round(offset);
			},
			getDateFromLeftOffset : function(data) {
				var self = this;
				var leftOffset = data.leftOffset;
				var dateInMS = Math.round((leftOffset * self.dateRange / self.width) + self.startDate.getTime());
				var aDate = new Date();
				aDate.setTime(dateInMS);
				return aDate;
			},
			getWidthOfDateRange : function(data) {
				var self = this;
				var dateRange = data.dateRange;
				return Math.round(self.width * dateRange / self.dateRange);
			},
			startStageEasing : function() {
				var self = this;
				if (!self.animationTimeout) {
					(function() {
						if (self.currentlyAnimating) {
							return;
						}
						self.realStageLeftOffset += (self.stageLeftOffset - self.realStageLeftOffset) / self.easingFraction;
						$(self.domEl).css({
							left : self.realStageLeftOffset
						});
						theTLMainController.repositionBackgroundImage({
							repositionOnly : true
						});
						if (parseInt(self.stageLeftOffset - self.realStageLeftOffset, 10) != 0) {
							var thisFunc = arguments.callee;
							self.animationTimeout = setTimeout(function() {
								thisFunc();
							}, self.easeTimeoutTime);
						} else {
							self.animationTimeout = "";
						}
					})();
				}
			},
			windowDidResize : function(data) {
				var self = this;
				setTimeout(function() {
					self.slideViewToDate({
						date : theTLSettings.currentDate,
						instantly : true
					});
					self.generateMinMaxStagePositionsFromVisibleDates();
				}, 1);
			},
			updateScaleColour : function(data) {
				var self = this;
				var colour = data.colour;
				$.each(self.viewScaleBlocks, function() {
					this.updateScaleColour(data);
				});
			},

			"public static viewScaleSettings" : {
				"hour-5-mins-medium" : new assets.js.core.setting.HourMinsScaleSettings(12, 64, 5),
				"hour-10-mins-medium" : new assets.js.core.setting.HourMinsScaleSettings(5, 64, 10),
				"hour-15-mins-medium" : new assets.js.core.setting.HourMinsScaleSettings(4, 64, 5),
				"hour-5-mins-large" : new assets.js.core.setting.HourMinsScaleSettings(12, 128, 5),
				"hour-5-mins-very-large" : new assets.js.core.setting.HourMinsScaleSettings(12, 256, 5),
				"hour-1-mins-small" : new assets.js.core.setting.HourMinsScaleSettings(60, 64, 1),
				"hour-1-mins-medium" : new assets.js.core.setting.HourMinsScaleSettings(60, 128, 1),
				"hour-1-mins-large" : new assets.js.core.setting.HourMinsScaleSettings(60, 256, 1),

				"day-medium-hour" : new assets.js.core.setting.DayHourScaleSettings(64),
				"day-large-hour" : new assets.js.core.setting.DayHourScaleSettings(128),
				"day-small-hour" : new assets.js.core.setting.DayHourScaleSettings(32),
				"day-tiny-hour" : new assets.js.core.setting.DayHourScaleSettings(16),
				"day-tincy-hour" : new assets.js.core.setting.DayHourScaleSettings(256),

				"month-small-day" : new assets.js.core.setting.MonthDayScaleSettings(64, 64),
				"month-medium-day" : new assets.js.core.setting.MonthDayScaleSettings(128, 128),
				"month-tiny-day" : new assets.js.core.setting.MonthDayScaleSettings(21, 21),
				"month-tincy-day" : new assets.js.core.setting.MonthDayScaleSettings(12.8, 0),

				"year-medium-month" : new assets.js.core.setting.YearMonthScaleSettings(12, 64),
				"year-very-large-month" : new assets.js.core.setting.YearMonthScaleSettings(12, 256),
				"year-large-month" : new assets.js.core.setting.YearMonthScaleSettings(12, 128),
				"year-small-month" : new assets.js.core.setting.YearMonthScaleSettings(12, 6),
				"year-tiny-month" : new assets.js.core.setting.YearMonthScaleSettings(4, 64, 252),

				"decade-medium-year" : new assets.js.core.setting.DecadeYearScaleSettings(10, 64, 64),
				"decade-large-year" : new assets.js.core.setting.DecadeYearScaleSettings(10, 128, 128),
				"decade-small-year" : new assets.js.core.setting.DecadeYearScaleSettings(5, 64, 32),
				"century-large-decade" : new assets.js.core.setting.CenturyDecadeScaleSettings(10, 256),
				"century-medium-decade" : new assets.js.core.setting.CenturyDecadeScaleSettings(10, 128),
				"century-small-decade" : new assets.js.core.setting.CenturyDecadeScaleSettings(10, 64),
				"century-tiny-decade" : new assets.js.core.setting.CenturyDecadeScaleSettings(5, 64, 3.2),

				"millenium-large-century" : new assets.js.core.setting.MilleniumCenturyScaleSettings(256),
				"millenium-medium-century" : new assets.js.core.setting.MilleniumCenturyScaleSettings(128)
			}
		});

(function() {
	var TLSCPDiv = 10000, TLSCPMult = 2;
	var TLSCPBlueprint = new assets.js.core.setting.MilleniumCenturyScaleSettings(128);
	TLSCPNamePrefix = "large-date-range-", TLSCPInterations = 30, TLSCOMultipliers = [ 2, 5, 10 ];

	var TLViewController = assets.js.core.controller.TLViewController;

	for (var counter = 0; counter < TLSCPInterations; counter++) {
		var scaleName = "large-date-range-" + counter;

		var largeDivider = TLSCOMultipliers[counter % 3] * Math.pow(10, parseInt(counter / 3, 10)) * TLSCPDiv;

		var scale = new assets.js.core.setting.MilleniumCenturyScaleSettings(128, largeDivider);

		TLViewController.viewScaleSettings[scaleName] = scale;
	}
})();