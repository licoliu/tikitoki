$import("assets.js.core.utils.AJKHelpers");
$import("assets.js.core.effect.TLSliderDragger");
Class
		.forName({
			name : "class assets.js.core.controller.TLSliderController extends Object",

			TLSliderController : function(data) {
				var self = this;
				self.items = data.items;
				self.startDate = data.startDate;
				self.endDate = data.endDate;
				self.dateRange = this.endDate.getTime() - this.startDate.getTime();
				self.getStageWidth = data.getStageWidth;
				self.timeline = data.timeline;
				self.width = theTLSettings.windowSize.width;
				self.scaleToSliderWidthRatio = 1.5;
				self.sliderScaleWidth = this.width * this.scaleToSliderWidthRatio;
				self.scaleLeftOffset = 0;
				self.numSectionsPerScale = 30;
				self.sliderScaleSectionWidth = this.sliderScaleWidth / this.numSectionsPerScale;
				self.sliderScaleFirstSectionPosition = 0;
				self.scaleTimesTextHasBeenDisplayed;
				self.displayTimeEveryXScales = 3;
				self.scaleTimeTextHolderWidth = 100;
				self.domRoot = $("#tl-slider-holder").get()[0];
				self.domScaleTimesHolder = $("#tl-slider-scale-times-holder").get()[0];
				self.domMarkersHolder = $("#tl-slider-markers-holder").get()[0];
				self.domDragger = $("#tl-slider-dragger").get()[0];
				self.domScale = $("#tl-slider-scale").get()[0];
				self.domScaleCanvas = $("#tl-slider-scale canvas").get()[0];
				self.scaleCanvas = "";
				self.markerHeight = 15;
				self.markerHeightVariation = 10;
				self.dragger = "";
				self.currentlyAnimating = false;
				self.storyWhoseToolTipIsOpen = "";
				self.domMarkerPointsHolder = "";
			},
			init : function() {
				var self = this;
				theAJKWindowResizeEvent.registerAsObserver({
					observer : self
				});
				theTLSettings.registerAsObserver({
					type : "currentDate",
					observer : self
				});
				self.setUpScale();
				self.initialiseDragger();
				self.calibrateScale();
				setTimeout(function() {
					$(self.domRoot).css({
						visibility : "visible"
					});
				}, 1);
				return self;
			},
			destroy : function() {
				var self = this;
				theAJKWindowResizeEvent.removeAsObserver({
					observer : self
				});
				theTLSettings.removeAsObserver({
					type : "currentDate",
					observer : self
				});
				self.dragger.kill();
				$(self.domScale).unbind();
				$(self.domMarkerPointsHolder).remove();
			},
			calibrateScale : function() {
				var self = this;
				var vStartDate = self.startDate.getTime() + (0.5 * self.dragger.width) / self.sliderScaleWidth * self.dateRange;
				var vEndDate = self.startDate.getTime() + (self.sliderScaleWidth - (0.5 * self.dragger.width)) / self.sliderScaleWidth * self.dateRange;
				theTLSettings.visibleStartDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
					time : vStartDate
				});
				theTLSettings.visibleEndDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
					time : vEndDate
				});
				theTLSettings.visibleDateRange = theTLSettings.visibleEndDate.getTime() - theTLSettings.visibleStartDate.getTime();
				theTLSettings.ensureCurrentDateIsWithinVisibleRange();
			},
			initialiseDragger : function() {
				var self = this;
				self.dragger = new assets.js.core.effect.TLSliderDragger({
					domEl : self.domDragger,
					getStageWidth : self.getStageWidth,
					getSliderWidth : function() {
						return self.width;
					},
					getSliderScaleWidth : function() {
						return self.sliderScaleWidth;
					},
					dragCallback : function(data) {
						var xPos = data.xPos;
						var dateFraction = (self.width > self.dragger.width) ? xPos / (self.width - self.dragger.width) : 0;
						var newDate = assets.js.core.utils.AJKHelpers.createDateWithTime({
							time : theTLSettings.visibleStartDate.getTime() + dateFraction * theTLSettings.visibleDateRange
						});
						theTLSettings.setCurrentDate({
							date : newDate,
							extraInfo : {
								drag : true
							}
						});
					},
					dragEndedCallback : function() {
						theTLHashController.setHashToCurrentDate();
					}
				}).init();
			},
			currentDateWasUpdatedTo : function(data) {
				var self = this;
				var currentDate = data.date;
				var animate = (data.extraInfo) ? data.extraInfo.animate : false;
				self.setScalePositionForDate({
					date : currentDate,
					animate : animate
				});
				self.setDraggerPositionForDate({
					date : currentDate,
					animate : animate
				});
			},
			setDraggerPositionForDate : function(data) {
				var self = this;
				var date = data.date;
				var animate = data.animate;
				var dateFraction = (date.getTime() - theTLSettings.visibleStartDate.getTime()) / theTLSettings.visibleDateRange;
				var xPos = dateFraction * (self.width - self.dragger.width);
				self.dragger.setLeftPosition({
					pos : xPos,
					animate : animate
				});
			},
			setScalePositionForDate : function(data) {
				var self = this;
				var date = data.date;
				var fraction = (date.getTime() - theTLSettings.visibleStartDate.getTime()) / theTLSettings.visibleDateRange;
				self.scaleLeftOffset = -parseInt(fraction * (self.sliderScaleWidth - self.width), 10);
				var animate = data.animate;
				var animTime = (animate) ? theTLSettings.animateTime : 0;
				$(self.domScale).stop().animate({
					left : self.scaleLeftOffset
				}, animTime);
			},
			convertDateToFraction : function(data) {
				var self = this;
				var aDate = data.date;
				return (aDate.getTime() - self.startDate.getTime()) / self.dateRange;
			},
			convertFractionToDate : function(data) {
				var self = this;
				var fraction = data.fraction;
				var newDate = new Date();
				newDate.setTime(self.startDate.getTime() + self.dateRange * fraction);
				return newDate;
			},
			setUpScale : function() {
				var self = this;
				if (self.getStageWidth() / self.width < 3) {
					self.scaleToSliderWidthRatio = 1;
				}
				self.sliderScaleWidth = self.width * self.scaleToSliderWidthRatio;
				$(self.domScale).width(self.sliderScaleWidth);
				self.scaleCanvas = self.domScaleCanvas.getContext('2d');
				self.displayCanvasScale();
				self.displayMarkers();
				$(self.domScale).click(function(e) {
					if (self.storyWhoseToolTipIsOpen) {
						self.storyWhoseToolTipIsOpen.hideToolTip();
						self.storyWhoseToolTipIsOpen = "";
					}
					if (self.currentlyAnimating || self.dragger.beingDragged) {
						return false;
					}
					self.currentlyAnimating = true;
					var clickLeftOffset = assets.js.core.utils.AJKHelpers.getMousePos({
						event : e
					}).x;
					var scaleOffset = clickLeftOffset - self.scaleLeftOffset;
					var fraction = (scaleOffset) / self.sliderScaleWidth;
					var newDate = self.convertFractionToDate({
						fraction : fraction
					});
					newDate = theTLSettings.limitDateToRange({
						aDate : newDate
					});
					theTLSettings.setCurrentDate({
						date : newDate,
						animate : true,
						extraInfo : {
							animate : false,
							updateHash : false
						},
						callback : function() {
							self.currentlyAnimating = false;
							theTLHashController.setHashToCurrentDate();
						}
					});
					return false;
				});
				if (!$.browser.isIOS) {
					$(self.domScale).mouseover(function(e) {
						var domSliderMarker = assets.js.core.utils.AJKHelpers.getSelfOrFirstParantOfClass({
							domEl : e.target,
							className : "tl-s-marker"
						});
						if (domSliderMarker) {
							var key = $(domSliderMarker).attr("markerKey");
							var relatedStory = theTLMainController.markersByKey[key];
							if (!self.dragger.beingDragged) {
								self.storyWhoseToolTipIsOpen = relatedStory;
								relatedStory.showToolTip({
									sliderScaleWidth : self.sliderScaleWidth,
									scaleLeftOffset : self.scaleLeftOffset,
									sliderWidth : self.width
								});
							}
						}
					}).mouseout(function(e) {
						var domSliderMarker = assets.js.core.utils.AJKHelpers.getSelfOrFirstParantOfClass({
							domEl : e.target,
							className : "tl-s-marker"
						});
						if (domSliderMarker) {
							var key = $(domSliderMarker).attr("markerKey");
							var relatedStory = theTLMainController.markersByKey[key];
							relatedStory.hideToolTip();
							self.storyWhoseToolTipIsOpen = "";
						}
					});
				}
			},
			displayMarkers : function() {
				var self = this;
				var domDiv = $("<div></div>").get()[0];
				self.domMarkerPointsHolder = domDiv;
				$.each(self.items, function() {
					var domPoint = self.createDomPointForMarker({
						marker : this
					});
					$(domDiv).append(domPoint);
				});
				$(self.domMarkersHolder).append(domDiv);
			},
			replacePointOfMarker : function(data) {
				var self = this;
				var marker = data.marker;
				$(marker.domSliderPoint).remove();
				var domPoint = self.createDomPointForMarker({
					marker : marker
				});
				$(self.domMarkerPointsHolder).append(domPoint);
			},
			addPointToScale : function(data) {
				var self = this;
				var marker = data.marker;
				var domMarker = self.createDomPointForMarker({
					marker : marker
				});
				$(self.domMarkerPointsHolder).append(domMarker);
			},
			createDomPointForMarker : function(data) {
				var self = this;
				var marker = data.marker;
				var isLine = ((marker.startDate.getTime() != marker.endDate.getTime()) && (self.timeline.viewType == "duration" || (self.timeline.viewType == "category-band" && marker.category.viewType == "duration"))) ? true
						: false;
				if (isLine) {
					var insertHTML = '<div class="tl-s-marker tl-s-marker-line" markerKey="' + marker.markerKey + '" style="background-color:#' + marker.category.colour
							+ ';"></div>';
					var domMarker = $(insertHTML).get()[0];
				} else if ($.browser.msie) {
					var insertHTML = '<div class="tl-s-ie-marker tl-s-marker" markerKey="' + marker.markerKey + '">';
					insertHTML += '<div style="background-color:#' + marker.category.colour + ';" class="tl-s-ie-marker-vertical"></div>';
					insertHTML += '<div style="background-color:#' + marker.category.colour + ';" class="tl-s-ie-marker-horizontal"></div>';
					insertHTML += '</div>';
					var domMarker = $(insertHTML).get()[0];
				} else {
					var domMarker = $('<canvas width="15" height="15" class="tl-s-marker" markerKey="' + marker.markerKey + '"></canvas>').get()[0];
					var ctx = domMarker.getContext('2d');
					var rgbColour = assets.js.core.utils.AJKHelpers.convertHexColourToRGB({
						hexColour : marker.category.colour
					});
					var rgbText = 'rgba(' + rgbColour.r + ',' + rgbColour.g + ',' + rgbColour.b + ',0)';
					var radgrad = ctx.createRadialGradient(7.5, 7.5, 0, 7.5, 7.5, 6);
					radgrad.addColorStop(0, "#" + marker.category.colour);
					radgrad.addColorStop(0.95, rgbText);
					ctx.fillStyle = radgrad;
					ctx.fillRect(0, 0, 15, 15);
				}
				if (isLine) {
					var leftOffset = marker.leftOffset / self.getStageWidth() * 100;
					var lineWidth = marker.durationBarWidth / self.getStageWidth() * 100;
				} else if (self.timeline.markerSpacing == "equal") {
					var leftOffset = marker.leftOffset / self.getStageWidth() * 100;
				} else {
					var leftOffset = self.getLeftOffsetPercentForDate({
						date : marker.startDate
					});
				}
				if (isLine) {
					var topOffset = parseInt(self.markerHeightVariation + self.markerHeight - 5, 10)
							- parseInt(marker.verticalPos / 10 * (self.markerHeightVariation + self.markerHeight - 5), 10);
				} else if (self.timeline.viewType == "duration" || self.timeline.markerSpacing == "top-to-bottom") {
					var topOffset = parseInt(self.markerHeight / 2, 10) + self.markerHeightVariation - parseInt(marker.verticalPos / 10 * self.markerHeightVariation, 10);
				} else {
					var topOffset = parseInt(self.markerHeight / 2, 10) + Math.floor(Math.random() * self.markerHeightVariation);
				}
				$(domMarker).css({
					left : leftOffset + "%",
					top : topOffset + "px"
				});
				if (isLine) {
					$(domMarker).css({
						width : lineWidth + "%"
					});
				}
				marker.setSliderPointPosition({
					position : {
						left : leftOffset,
						top : topOffset
					}
				});
				marker.setDomSliderPoint({
					domEl : domMarker
				});
				marker.setDomTooltipDomContainer({
					domEl : self.domRoot
				});
				return domMarker;
			},
			getLeftOffsetPercentForDate : function(data) {
				var self = this;
				var date = data.date;
				var startTimeNum = self.startDate.getTime();
				var diff = self.endDate.getTime() - startTimeNum;
				var leftOffset = (date.getTime() - startTimeNum) / diff * 100;
				return leftOffset;
			},
			displayCanvasScale : function() {
				var self = this;
				var generateYearScales = function(data) {
					self.scaleFormatType = "years";
					var yearsPerSection = data.yearsPerSection;
					self.sliderScaleSectionWidth = self.sliderScaleWidth / (theTLSettings.timeInfo.years) * yearsPerSection;
					var yearRounding = (self.timeline.markerSpacing == "equal") ? 1 : yearsPerSection;
					var tempDate = assets.js.core.utils.AJKHelpers.getEmptyDate();
					tempDate.setTime(theTLSettings.timeInfo.start.getTime());
					tempDate = assets.js.core.utils.AJKHelpers.getFirstDayOfYearDateForDate({
						date : tempDate
					});
					var tmpFullYear = tempDate.getFullYear();
					if (tmpFullYear >= 0) {
						tempDate.setFullYear(tmpFullYear - (tmpFullYear % yearsPerSection));
					} else {
						tempDate.setFullYear(-(Math.abs(tmpFullYear) + yearsPerSection - (Math.abs(tmpFullYear) % yearsPerSection)));
					}
					self.sliderScaleFirstSectionPosition = self.convertDateToFraction({
						date : tempDate
					}) * self.sliderScaleWidth;
					self.sliderScaleOffsetAdjust = 0;
					self.sliderScaleSectionPts = (yearsPerSection < 5) ? 24 : 20;
					self.scaleDateFormaterMain = function(data) {
						var aDate = data.date;
						if (self.timeline.markerSpacing != "equal") {
							var fullYear = aDate.getFullYear();
							if (aDate.getMonth() == 11) {
								aDate.setMonth(0);
								aDate.setFullYear(++fullYear);
							}
							var inc = (fullYear > 0) ? 1 : -1;
							if (yearRounding >= 2) {
								var yearRoundingFraction = (fullYear + inc) / yearRounding;
								if (yearRoundingFraction < 0.0001) {
									fullYear = Math.round(yearRoundingFraction) * yearRounding;
								} else {
									fullYear = parseInt(yearRoundingFraction, 10) * yearRounding;
								}
							}
							aDate.setFullYear(fullYear);
							aDate.setMonth(0);
							aDate.setDate(1);
							aDate.setHours(0);
							aDate.setMinutes(0);
							aDate.setSeconds(0);
						}
						if (self.timeline.sliderDateFormat != "auto") {
							return assets.js.core.utils.AJKHelpers.formatDate({
								date : aDate,
								formatString : self.timeline.sliderDateFormat
							});
						} else {
							return assets.js.core.utils.AJKHelpers.formatFullYearForDate({
								date : aDate
							});
						}
					};
				};
				var generateMonthScales = function(data) {
					self.scaleFormatType = "months";
					var monthsPerSection = data.monthsPerSection;
					self.sliderScaleSectionWidth = self.sliderScaleWidth / (theTLSettings.timeInfo.months) * monthsPerSection;
					var tempDate = assets.js.core.utils.AJKHelpers.getEmptyDate();
					tempDate.setTime(theTLSettings.timeInfo.start.getTime());
					tempDate = assets.js.core.utils.AJKHelpers.getFirstDayOfMonthDateForDate({
						date : tempDate
					});
					tempDate.setMonth(0);
					self.sliderScaleFirstSectionPosition = self.convertDateToFraction({
						date : tempDate
					}) * self.sliderScaleWidth;
					self.sliderScaleOffsetAdjust = (theTLSettings.timeInfo.years < 1) ? 10 : 8;
					self.sliderScaleSectionPts = (theTLSettings.timeInfo.years > 0.8) ? 16 : 30;
					self.scaleDateFormaterMain = function(data) {
						var aDate = data.date;
						var thisDay = aDate.getDate();
						if (thisDay == "31") {
							aDate.setTime(aDate.getTime() + assets.js.core.utils.AJKHelpers.dateOneDayInMS);
						}
						if (self.timeline.sliderDateFormat != "auto") {
							return assets.js.core.utils.AJKHelpers.formatDate({
								date : aDate,
								formatString : self.timeline.sliderDateFormat
							});
						}
						if (self.timeline.markerSpacing == "equal") {
							return aDate.getDate() + " " + assets.js.core.utils.AJKHelpers.dateMonthsShortArray[aDate.getMonth()];
						} else if (!aDate.getMonth()) {
							return assets.js.core.utils.AJKHelpers.dateMonthsShortArray[aDate.getMonth()] + " " + aDate.getFullYear();
						} else {
							return assets.js.core.utils.AJKHelpers.dateMonthsShortArray[aDate.getMonth()];
						}
					};
				};
				var generateDayScales = function(data) {
					self.scaleFormatType = "days";
					var daysPerSection = data.daysPerSection;
					self.sliderScaleSectionWidth = self.sliderScaleWidth / (theTLSettings.timeInfo.days) * daysPerSection;
					var tempDate = assets.js.core.utils.AJKHelpers.getEmptyDate();
					tempDate.setTime(theTLSettings.timeInfo.start.getTime());
					tempDate.setHours(0);
					tempDate.setMinutes(0);
					tempDate.setSeconds(0);
					self.sliderScaleFirstSectionPosition = self.convertDateToFraction({
						date : tempDate
					}) * self.sliderScaleWidth;
					self.sliderScaleOffsetAdjust = 0;
					self.sliderScaleSectionPts = 24;
					self.scaleDateFormaterMain = function(data) {
						var aDate = data.date;
						if (self.timeline.sliderDateFormat != "auto") {
							return assets.js.core.utils.AJKHelpers.formatDate({
								date : aDate,
								formatString : self.timeline.sliderDateFormat
							});
						}
						if (!aDate.getHours() || daysPerSection >= 1) {
							if (aDate.getHours() > 20 && self.timeline.markerSpacing != "equal") {
								aDate.setTime(aDate.getTime() + assets.js.core.utils.AJKHelpers.dateOneDayInMS);
								aDate.setHours(0);
							}
							return aDate.getDate() + " " + assets.js.core.utils.AJKHelpers.dateMonthsShortArray[aDate.getMonth()] + " " + aDate.getFullYear();
						} else {
							return assets.js.core.utils.AJKHelpers.formatDate({
								date : aDate,
								formatString : "HH:00"
							});
						}
					};
				};
				var generateHourScales = function(data) {
					self.scaleFormatType = "hours";
					var hoursPerSection = data.hoursPerSection;
					self.sliderScaleSectionWidth = self.sliderScaleWidth / (theTLSettings.timeInfo.hours) * hoursPerSection;
					var tempDate = assets.js.core.utils.AJKHelpers.getEmptyDate();
					tempDate.setTime(theTLSettings.timeInfo.start.getTime());
					tempDate.setMinutes(0);
					tempDate.setSeconds(0);
					tempDate.setMilliseconds(0);
					self.sliderScaleFirstSectionPosition = self.convertDateToFraction({
						date : tempDate
					}) * self.sliderScaleWidth;
					self.sliderScaleOffsetAdjust = 0;
					self.sliderScaleSectionPts = 24;
					self.scaleDateFormaterMain = function(data) {
						var aDate = data.date;
						if (self.timeline.sliderDateFormat != "auto") {
							return assets.js.core.utils.AJKHelpers.formatDate({
								date : aDate,
								formatString : self.timeline.sliderDateFormat
							});
						}
						if (aDate.getHours() == 0 && aDate.getMinutes() == 0) {
							return aDate.getDate() + " " + assets.js.core.utils.AJKHelpers.dateMonthsShortArray[aDate.getMonth()] + " " + aDate.getFullYear();
						} else {
							return assets.js.core.utils.AJKHelpers.formatDate({
								date : aDate,
								formatString : "HH:mm"
							});
						}
					};
				};
				var scaleExpansionArray = [ 1, 2, 5, 10 ];
				if (theTLSettings.timeInfo.years > 150) {
					var divider = (theTLSettings.timeInfo.years > 10000) ? 7 : 10;
					var yearsPerSection = Math.round(theTLSettings.timeInfo.years / divider);
					var exploder = 1;
					while (yearsPerSection >= 1000) {
						yearsPerSection /= 10;
						exploder *= 10;
					}
					if (yearsPerSection >= 100) {
						yearsPerSection = parseInt(yearsPerSection / 100, 10) * 100 * exploder;
					} else if (yearsPerSection >= 50) {
						yearsPerSection = parseInt(yearsPerSection / 50, 10) * 50 * exploder;
					} else if (yearsPerSection >= 25) {
						yearsPerSection = parseInt(yearsPerSection / 25, 10) * 25 * exploder;
					} else {
						yearsPerSection = parseInt(yearsPerSection / 10, 10) * 10 * exploder;
					}
					generateYearScales({
						yearsPerSection : yearsPerSection
					});
				} else if (theTLSettings.timeInfo.years > 75) {
					generateYearScales({
						yearsPerSection : 10
					});
				} else if (theTLSettings.timeInfo.years > 30) {
					generateYearScales({
						yearsPerSection : 5
					});
				} else if (theTLSettings.timeInfo.years > 15) {
					generateYearScales({
						yearsPerSection : 2
					});
				} else if (theTLSettings.timeInfo.years > 4) {
					generateYearScales({
						yearsPerSection : 1
					});
				} else if (theTLSettings.timeInfo.years > 2) {
					generateMonthScales({
						monthsPerSection : 3
					});
				} else if (theTLSettings.timeInfo.years > 1.5) {
					generateMonthScales({
						monthsPerSection : 2
					});
				} else if (theTLSettings.timeInfo.years > 0.5) {
					generateMonthScales({
						monthsPerSection : 1
					});
				} else if (theTLSettings.timeInfo.years > 0.25) {
					generateDayScales({
						daysPerSection : 12
					});
				} else if (theTLSettings.timeInfo.years > 0.125) {
					generateDayScales({
						daysPerSection : 8
					});
				} else if (theTLSettings.timeInfo.years > 0.075) {
					generateDayScales({
						daysPerSection : 4
					});
				} else if (theTLSettings.timeInfo.years > 0.05) {
					generateDayScales({
						daysPerSection : 2
					});
				} else if (theTLSettings.timeInfo.years > 0.025) {
					generateDayScales({
						daysPerSection : 2
					});
				} else if (theTLSettings.timeInfo.years > 0.01) {
					generateDayScales({
						daysPerSection : 1
					});
				} else if (theTLSettings.timeInfo.years > 0.005) {
					generateDayScales({
						daysPerSection : 0.5
					});
				} else if (theTLSettings.timeInfo.years > 0.001) {
					generateDayScales({
						daysPerSection : 0.125
					});
				} else if (theTLSettings.timeInfo.hours > 5) {
					generateHourScales({
						hoursPerSection : 1
					});
				} else if (theTLSettings.timeInfo.hours > 2) {
					generateHourScales({
						hoursPerSection : 0.5
					});
				} else if (theTLSettings.timeInfo.hours > 1) {
					generateHourScales({
						hoursPerSection : 0.125
					});
				} else {
					generateHourScales({
						hoursPerSection : 0.0625
					});
				}
				$(self.domScaleCanvas).css({
					backgroundColor : "#" + self.timeline.sliderBackgroundColour
				});
				$(theTLMainController.domMainHolder).css({
					backgroundColor : "#" + self.timeline.containerBackgroundColour
				});
				/*
				 * $("html").css({ backgroundColor : "#" +
				 * self.timeline.sliderBackgroundColour });
				 */
				$("#tl-advert-block").css({
					backgroundColor : "#" + self.timeline.sliderBackgroundColour
				});
				$(self.domScaleCanvas).width(self.sliderScaleWidth);
				var canvasHeight = $(self.domScaleCanvas).height();
				$(self.domScaleCanvas).attr("height", canvasHeight);
				$(self.domScaleCanvas).attr("width", self.sliderScaleWidth);
				setTimeout(function() {
					self.dragger.updateColour({
						colour : self.timeline.sliderDraggerColour
					});
				}, 1);
				if ($.browser.msie && theTLMainController && theTLMainController.minimumLayout) {
					canvasHeight = 40;
				}
				var rgbDetails = assets.js.core.utils.AJKHelpers.convertHexColourToRGB({
					hexColour : self.timeline.sliderDetailsColour
				});
				self.scaleCanvas.fillStyle = "rgb(" + rgbDetails.r + "," + rgbDetails.g + "," + rgbDetails.b + ")";
				$(self.domRoot).css({
					borderBottomColor : "#" + self.timeline.sliderDetailsColour,
					borderTopColor : "#" + self.timeline.sliderDetailsColour
				});
				var counter = 0;
				var smallLineWidth = (self.sliderScaleSectionWidth < 0) ? 1 : 2;
				var bigLineWidth = (self.sliderScaleSectionWidth < 0) ? 1 : 2;
				if (!self.scaleTimesTextHasBeenDisplayed) {
					var domDiv = $("<div></div>").get()[0];
				}
				for (var offset = self.sliderScaleFirstSectionPosition; offset < (self.sliderScaleWidth + 50); offset += self.sliderScaleSectionWidth / self.sliderScaleSectionPts) {
					var scalePoint = {};
					if (counter % self.sliderScaleSectionPts == 0) {
						self.scaleCanvas.fillRect(offset, canvasHeight - 14, bigLineWidth, 13);
						self.scaleCanvas.fillRect(offset, 0, bigLineWidth, 5);
						if (!self.scaleTimesTextHasBeenDisplayed) {
							if (!self.scaleDatePoints) {
								self.scaleDatePoints = [];
							}
							var aDate = assets.js.core.utils.AJKHelpers.getEmptyDate();
							if (self.timeline.markerSpacing == "equal" && self.items.length > 0) {
								var datePos = (offset + self.sliderScaleOffsetAdjust) / self.sliderScaleWidth;
								aDate = self.getEquallySpacedDateForOffset({
									offset : datePos
								});
							} else {
								aDate.setTime(theTLSettings.timeInfo.start.getTime()
										+ Math.round((offset + self.sliderScaleOffsetAdjust) / self.sliderScaleWidth * theTLSettings.timeInfo.msecs));
							}
							var dateText = self.scaleDateFormaterMain({
								date : aDate
							});
							scalePoint.dateText = dateText;
							if (self.scaleFormatType == "months" && aDate.getDate() < 10) {
								aDate.setDate(1);
								aDate.setHours(0);
								aDate.setMinutes(0);
								aDate.setSeconds(1);
							}
							scalePoint.date = aDate;
							scalePoint.offset = offset;
							var domTimer = $('<h5 style="color: #' + self.timeline.sliderTextColour + '">' + dateText + "</h5>").get()[0];
							$(domTimer).css({
								left : offset / self.sliderScaleWidth * 100 + "%"
							});
							$(domDiv).append(domTimer);
							self.scaleDatePoints.push(scalePoint);
						}
					} else if (counter % (self.sliderScaleSectionPts / 2) == 0) {
						self.scaleCanvas.fillRect(offset, canvasHeight - 11, smallLineWidth, 10);
					} else {
						self.scaleCanvas.fillRect(offset, canvasHeight - 8, smallLineWidth, 7);
					}
					counter++;
				}
				if (!self.scaleTimesTextHasBeenDisplayed) {
					$(this.domScaleTimesHolder).empty().append(domDiv);
				}
				self.scaleTimesTextHasBeenDisplayed = true;
			},
			getEquallySpacedDateForOffset : function(data) {
				var self = this;
				var offset = data.offset;
				var retDate = new Date();
				if (offset > 0) {
					var numItems = self.items.length;
					var viewStageWidth = self.getStageWidth();
					var posAlongStage = offset * viewStageWidth;
					var lastFoundItem = false;
					for (var counter = 0; counter < numItems; counter++) {
						var thisItem = self.items[counter];
						if (posAlongStage < thisItem.leftOffset) {
							lastFoundItem = thisItem;
							break;
						}
					}
					if (lastFoundItem) {
						var prevItem = self.items[lastFoundItem.orderIndex - 1];
						if (prevItem) {
							var prevItemTime = prevItem.startDate.getTime();
							var retDateTime = prevItemTime + (lastFoundItem.startDate.getTime() - prevItemTime)
									* ((posAlongStage - prevItem.leftOffset) / (lastFoundItem.leftOffset - prevItem.leftOffset));
							retDate.setTime(retDateTime);
						} else {
							var prevItemTime = theTLSettings.timeInfo.start.getTime();
							var retDateTime = prevItemTime + (lastFoundItem.startDate.getTime() - prevItemTime) * ((posAlongStage - 0) / (lastFoundItem.leftOffset - 0));
							retDate.setTime(retDateTime);
						}
					} else {
						var prevItem = self.items[self.items.length - 1];
						var nextItemTime = theTLSettings.timeInfo.end.getTime();
						var prevItemTime = prevItem.startDate.getTime();
						var retDateTime = prevItemTime + (nextItemTime - prevItemTime) * ((posAlongStage - prevItem.leftOffset) / (viewStageWidth - prevItem.leftOffset));
						retDate.setTime(retDateTime);
					}
				} else {
					retDate.setTime(self.timeline.startDate);
				}
				return retDate;
			},
			windowDidResize : function(data) {
				var self = this;
				self.width = data.newSize.width;
				if (self.getStageWidth() / self.width < 3) {
					self.scaleToSliderWidthRatio = 1;
				}
				self.sliderScaleWidth = self.width * self.scaleToSliderWidthRatio;
				$(self.domScale).width(self.sliderScaleWidth);
				self.sliderScaleWidth = self.width * self.scaleToSliderWidthRatio;
				self.sliderScaleSectionWidth = self.sliderScaleWidth / this.numSectionsPerScale;
				self.displayCanvasScale();
				self.dragger.updateDraggerSize();
				self.calibrateScale();
				self.setScalePositionForDate({
					date : theTLSettings.currentDate
				});
				self.setDraggerPositionForDate({
					date : theTLSettings.currentDate
				});
			}
		});