$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.core.controller.TL3DViewController extends Object",

	TL3DViewController : function(data) {
		var self = this;
		self.domBody = $("body").get()[0];
		self.standardViewController = data.standardViewController;
		self.items = data.items;
		self.timelineStartDate = data.timelineStartDate;
		self.timelineEndDate = data.timelineEndDate;
		self.domCanvas = $("#tl-3d-view-canvas").get()[0];
		self.canvasContext = self.domCanvas.getContext('2d');
		self.timeline3DLength = 1000;
		self.maxTimelineWidth = 0;
		self.controller = data.controller;
		self.sliderController = data.controller.sliderController;
		self.contentPanelController = data.controller.contentPanelController;
		self.timeline = self.controller.timeline;
		self.timeline3D = self.timeline.timeline3D;
		self.active = false;
		self.viewDateRange = {};
		self.stageScaleRange = {};
		self.visibleMarkers = [];
		self.visibleScalePoints = [];
		self.disableHover = false;
		self.domLaunchButton = $("#tl-timeline-3d-launch").get()[0];
		self.initialised = false;
		self.easeTimeoutTime = ($.browser.isIOS) ? 100 : 50;
		self.easingFraction = ($.browser.isIOS) ? 1.25 : 2;
		self.initialDateSet = false;
		self.viewOffset = 0;
		self.desiredViewOffset = 0;
		self.visibleMarkersLimit = 50;
		self.cachedImageSize = {
			width : 300,
			height : 225
		};
		self.textImageSize = [ {
			width : 300,
			height : 90,
			fontSize : 24,
			lineHeight : 24,
			x : 12,
			y : 46
		}, {
			width : 200,
			height : 60,
			fontSize : 16,
			lineHeight : 16,
			x : 8,
			y : 30.667
		}, {
			width : 150,
			height : 45,
			fontSize : 12,
			lineHeight : 12,
			x : 6,
			y : 23
		}, {
			width : 100,
			height : 30,
			fontSize : 8,
			lineHeight : 8,
			x : 4,
			y : 15.3333
		} ];
		self.dateImageSize = [ {
			fontSize : 15,
			x : 12,
			y : 22
		}, {
			fontSize : 10,
			x : 8,
			y : 14.666667
		}, {
			fontSize : 7.5,
			x : 6,
			y : 11
		}, {
			fontSize : 5,
			x : 4,
			y : 7.33333
		} ];
		self.viewSize = {
			width : 1,
			height : 1
		};
		self.datePrePadding = 0.05;
		self.timelinePaddingExpansion = 1.2;
		self.moreInfoCutOff = 850;
		self.canvasVert = 0;
		self.initialised = false;
		self.version = ++assets.js.core.controller.TL3DViewController.counter;
		self.isFireFoxMac = ($.browser.isMac && $.browser.mozilla);
		self.deviceScale = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
	},
	"public static counter" : 0,
	init : function() {
		var self = this;
		self.updateButtonState();
		$(self.domLaunchButton).click(function() {
			if (!self.active) {
				self.launch();
			} else {
				self.close();
			}
			return false;
		});
		return self;
	},
	getFractionAlongTimeline : function() {
		var self = this;
		return (((self.currentDate - theTLSettings.visibleStartDate) / theTLSettings.visibleDateRange - 0.5) * 2);
	},
	updateAssociations : function() {
		var self = this;
		self.standardViewController = self.controller.selectedView;
		self.sliderController = self.controller.sliderController;
	},
	initialise : function() {
		var self = this;
		self.initialised = true;
		self.updateStoryColPositions();
		self.generateEqualSpacingFakeDates();
		$(self.domCanvas).click(function(e) {
			var clickTime = new Date();
			if (TLGLOBALIsTouchDevice) {
				var mousePos = assets.js.core.utils.AJKHelpers.getMousePos({
					event : e
				});
				var newHoverMarker = self.findMarkerForCoords({
					coords : mousePos
				});
				if (newHoverMarker) {
					self.markerWasClicked({
						marker : newHoverMarker
					});
				}
			} else if (self.mouseDownTime && (clickTime.getTime() - self.mouseDownTime.getTime()) > 1000) {
				self.mouseDownTime = "";
			} else if (self.hoverMarker) {
				self.markerWasClicked({
					marker : self.hoverMarker
				});
			}
			self.stageDragActive = false;
		}).mousedown(function(e) {
			if (TLGLOBALIsTouchDevice && TLGLOBALLastTouchEvent != "touchstart") {
				return;
			}
			$(self.domBody).addClass("tl-apply-3d-drag-styles");
			self.stageDragActive = true;
			self.startStageDragPos = assets.js.core.utils.AJKHelpers.getMousePos({
				event : e
			});
			self.startStageDragDate = assets.js.core.utils.AJKHelpers.cloneDate({
				date : theTLSettings.currentDate
			});
			self.stageDraggableDateRange = parseInt((theTLSettings.visibleEndDate.getTime() - theTLSettings.visibleStartDate.getTime()) * 0.66, 10);
			self.mouseDownTime = new Date();
		});
	},
	markerWasClicked : function(data) {
		var self = this;
		var marker = data.marker;
		var ma = marker.marker3DScreenInfo;
		if (ma.timelinePos.y > self.moreInfoCutOff && self.timeline.lightboxStyle != 2) {
			marker.showExtraInfo();
			self.selectedMarker = "";
			self.hoverMarker = "";
			self.redisplay();
		} else {
			var savedHoverMarker = marker;
			self.controller.focusMarker({
				marker : marker
			});
			self.hoverMarker = "";
			self.disableHover = true;
			setTimeout(function() {
				self.selectedMarker = savedHoverMarker;
				self.disableHover = false;
				self.redisplay();
				self.selectedMarker.isEditButtonActive = false;
			}, theTLSettings.animateTime + 1);
		}
	},
	windowDidBlur : function() {
		var self = this;
		self.stageDragActive = false;
	},
	launch : function() {
		var self = this;
		self.active = true;
		if (!self.initialised) {
			self.initialise();
		}
		self.standardViewController.disable();
		self.enable();
	},
	enable : function() {
		var self = this;
		theTLSettings.registerAsObserver({
			type : "currentDate",
			observer : self
		});
		$(self.domBody).addClass("tl-selected-view-3d");
		$(self.domCanvas).css({
			display : "block"
		});
		theAJKMouseMoveEvent.registerAsObserver({
			observer : self
		});
		self.controller.flushSize();
		self.currentDate = assets.js.core.utils.AJKHelpers.cloneDate({
			date : theTLSettings.currentDate
		});
		self.updateSlider();
		self.updateButtonState();
		self.redisplayAfterDataChange();
		theAJKWindowBlurEvent.registerAsObserver({
			observer : self
		});
	},
	close : function() {
		var self = this;
		self.active = false;
		self.disable();
		self.standardViewController.enable();
	},
	disable : function() {
		var self = this;
		theTLSettings.removeAsObserver({
			observer : self,
			type : "currentDate"
		});
		self.initialDateSet = false;
		$(self.domBody).removeClass("tl-selected-view-3d");
		$(self.domCanvas).css({
			display : "none"
		});
		theAJKMouseMoveEvent.removeAsObserver({
			observer : self
		});
		self.updateSlider();
		self.controller.selectedView.enable();
		self.updateButtonState();
		theAJKWindowBlurEvent.removeAsObserver({
			observer : self
		});
		if (self.windowMouseUpFunc) {
			$(window).unbind(self.windowMouseUpFunc);
		}
	},
	clearStories3DText : function() {
		var self = this;
		$.each(self.controller.markers, function() {
			this.clear3DText();
		});
	},
	updateSlider : function() {
		var self = this;
		self.sliderController.dragger.updateDraggerSize();
		self.sliderController.calibrateScale();
		self.sliderController.currentDateWasUpdatedTo({
			date : theTLSettings.currentDate
		});
	},
	updateButtonState : function() {
		var self = this;
		if (self.active) {
			$(self.domLaunchButton).text("2d");
		} else {
			$(self.domLaunchButton).text("3d");
		}
		if (self.timeline3D.status == 0) {
			$(self.domLaunchButton).css({
				display : "none"
			});
		} else {
			$(self.domLaunchButton).css({
				display : "block"
			});
		}
	},
	updateStoryColPositions : function() {
		var self = this;
		if (self.timeline.viewType == "category-band") {
			var aCats = self.standardViewController.activeCategories;
			var colInc = 1 / aCats.length;
			var cPos = colInc / 2;
			var c = 0;
			$.each(aCats, function() {
				this.col3DPos = cPos + c * colInc;
				c++;
			});
			$.each(self.controller.markers, function() {
				this.col3DPos = this.category.col3DPos;
			});
		} else {
			var colInc = 1 / self.timeline3D.numCols;
			var cPos = 0.5;
			cPos = (self.timeline3D.numCols % 2) ? cPos : cPos + (colInc / 2);
			$.each(self.controller.markers, function() {
				this.col3DPos = cPos;
				cPos += colInc;
				cPos = (cPos > (1 - (colInc / 2))) ? cPos - 1 : cPos;
			});
		}
	},
	mouseDidMove : function(data) {
		var self = this;
		if (theTLMainController.mouseOverUserControls) {
			return;
		}
		if (TLGLOBALIsTouchDevice && TLGLOBALLastTouchEvent != "touchmove") {
			return;
		}
		if (!self.sliderController.dragger.beingDragged && !self.contentPanelController.panelVisible && !self.disableHover) {
			var scr = data.coords;
			if (!scr.y) {
				return;
			}
			if (scr.y > self.canvasVert && scr.y < (self.canvasVert + self.viewSize.height) && self.timeline3D.endToScreenRatio > 1) {
				var maxOffset = Math.round(((self.timeline3D.endToScreenRatio - 1) * self.viewSize.width) / 2 * 8);
				self.desiredViewOffset = -Math.round((scr.x - (self.viewSize.width / 2)) / self.viewSize.width / 2 * maxOffset);
			} else {
				self.desiredViewOffset = 0;
			}
			if (self.stageDragActive) {
				if (TLGLOBALIsTouchDevice && TLGLOBALLastTouchEvent != "touchmove") {
					return;
				}
				var offset = scr.y - self.startStageDragPos.y;
				var dChange = offset / self.viewSize.height * self.stageDraggableDateRange;
				var direction = (self.timeline.timeline3D.direction) ? 1 : -1;
				dChange *= direction;
				var newDate = new Date();
				newDate.setTime(self.startStageDragDate.getTime() + dChange);
				var newDate = theTLSettings.limitDateToRange({
					aDate : newDate
				});
				theTLSettings.setCurrentDate({
					date : newDate,
					extraInfo : {
						updateHash : false
					}
				});
				self.viewOffset = self.desiredViewOffset;
				return;
			}
			self.startOffsetEasing();
			var newHoverMarker = self.findMarkerForCoords({
				coords : data.coords
			});
			if (newHoverMarker != self.hoverMarker) {
				if (self.hoverMarker) {
					self.hoverMarker.unfocus();
				}
				self.hoverMarker = newHoverMarker;
				$(self.domBody).removeClass("tl-apply-hover-styles");
				if (self.hoverMarker) {
					$(self.domBody).addClass("tl-apply-hover-styles");
				}
				self.redisplay();
			}
			if (self.hoverMarker) {
				self.selectedMarker = "";
				self.hoverMarker.focus({
					forceUpdate : true
				});
			}
		}
	},
	findMarkerForCoords : function(data) {
		var self = this;
		var newHoverMarker = "";
		var scr = data.coords;
		var v2 = self.canvasVert;
		var num = self.visibleMarkers.length;
		for (var c = num - 1; c >= 0; c--) {
			var m = self.visibleMarkers[c];
			var ma = m.marker3DScreenInfo;
			if (!ma || m.searchHidden) {
				continue;
			}
			if (ma.active && scr.x > ma.x && scr.x < (ma.x + ma.width) && (scr.y - v2) > ma.y && (scr.y - v2) < (ma.y + ma.height)) {
				newHoverMarker = m;
				break;
			}
		}
		return newHoverMarker;
	},
	mouseDidUp : function() {
		var self = this;
		$(self.domBody).removeClass("tl-apply-hover-styles");
		$(self.domBody).removeClass("tl-apply-3d-drag-styles");
		self.stageDragActive = false;
		theTLSettings.setCurrentDate({
			date : assets.js.core.utils.AJKHelpers.cloneDate({
				date : theTLSettings.currentDate
			})
		});
	},
	generateEqualSpacingFakeDates : function() {
		var self = this;
		if (self.timeline.markerSpacing == "equal") {
			$.each(self.controller.markers, function() {
				self.generateFakeDateForStory({
					story : this
				});
			});
			$.each(self.sliderController.scaleDatePoints, function() {
				var viewOffset = this.offset / self.sliderController.sliderScaleWidth * self.standardViewController.width;
				this.fakeDate = self.standardViewController.getDateFromLeftOffset({
					leftOffset : viewOffset
				});
			});
		}
	},
	generateFakeDateForStory : function(data) {
		var self = this;
		var story = data.story;
		story.fakeStartDate = self.standardViewController.getDateFromLeftOffset({
			leftOffset : story.leftOffset
		});
	},
	currentDateWasUpdatedTo : function(data) {
		var self = this;
		var animate = (data.extraInfo) ? data.extraInfo.animate : false;
		if (!self.initialDateSet && !animate) {
			self.initialDateSet = true;
			self.moveViewToDate({
				date : data.date
			});
		} else {
			self.easeViewToDate({
				date : data.date
			});
		}
		self.standardViewController.updateDisplayDate({
			date : data.date
		});
	},
	easeViewToDate : function(data) {
		var self = this;
		self.desiredDate = assets.js.core.utils.AJKHelpers.cloneDate({
			date : data.date
		});
		var instantly = data.instantly;
		if (instantly) {
			self.currentDate = assets.js.core.utils.AJKHelpers.cloneDate({
				date : self.desiredDate
			});
		}
		self.startStageEasing();
	},
	startStageEasing : function() {
		var self = this;
		if (!self.animationTimeout) {
			(function() {
				if (self.currentlyAnimating) {
					return;
				}
				var newDateTime = self.currentDate.getTime() + Math.round((self.desiredDate.getTime() - self.currentDate.getTime()) / self.easingFraction);
				var newDate = new Date();
				newDate.setTime(newDateTime);
				if (Math.abs(newDateTime - self.desiredDate.getTime()) > 1000 || self.desiredViewOffset - self.viewOffset >= 0.5) {
					var thisFunc = arguments.callee;
					self.animationTimeout = setTimeout(function() {
						thisFunc();
					}, self.easeTimeoutTime);
					self.viewOffset += (self.desiredViewOffset - self.viewOffset) / 2;
					self.moveViewToDate({
						date : newDate
					});
				} else {
					self.viewOffset = self.desiredViewOffset;
					self.moveViewToDate({
						date : self.desiredDate
					});
					self.animationTimeout = "";
				}
			})();
		}
	},
	startOffsetEasing : function() {
		var self = this;
		if (!self.offsetAnimation) {
			(function() {
				if (self.currentlyAnimating) {
					return;
				}
				if (Math.abs(self.desiredViewOffset - self.viewOffset) >= 1) {
					var thisFunc = arguments.callee;
					self.offsetAnimation = setTimeout(function() {
						thisFunc();
					}, self.easeTimeoutTime);
					self.viewOffset += (self.desiredViewOffset - self.viewOffset) / 4;
					self.drawView();
				} else {
					self.viewOffset = self.desiredViewOffset;
					self.drawView();
					self.offsetAnimation = "";
				}
				if (self.hoverMarker && theTLMainController.adminController) {
					self.hoverMarker.focus({
						forceUpdate : true
					});
				}
			})();
		}
	},
	moveViewToDate : function(data) {
		var self = this;
		var cDate = assets.js.core.utils.AJKHelpers.cloneDate({
			date : data.date
		});
		self.currentDate = cDate;
		var datePrePaddingInMS = parseInt(theTLSettings.visibleDateRange * self.timeline3D.zoom * self.datePrePadding, 10);
		var dateRange = parseInt(theTLSettings.visibleDateRange * self.timeline3D.zoom, 10) + datePrePaddingInMS;
		self.viewDateRange.end = new Date();
		self.viewDateRange.start = new Date();
		self.viewDateRange.range = dateRange;
		if (self.timeline3D.direction) {
			self.viewDateRange.start.setTime(cDate.getTime() - datePrePaddingInMS);
			self.viewDateRange.end.setTime(self.viewDateRange.start.getTime() + dateRange);
		} else {
			self.viewDateRange.end.setTime(cDate.getTime() + datePrePaddingInMS);
			self.viewDateRange.start.setTime(self.viewDateRange.end.getTime() - dateRange);
		}
		self.visibleScalePoints = [];
		$.each(self.sliderController.scaleDatePoints, function() {
			var thisScalePt = this;
			var thisDate = (self.timeline.markerSpacing == "equal") ? this.fakeDate : this.date;
			if (thisDate.getTime() >= self.viewDateRange.start.getTime() && thisDate.getTime() <= self.viewDateRange.end.getTime()) {
				self.visibleScalePoints.push(thisScalePt);
			}
		});
		self.visibleMarkers = [];
		$.each(self.controller.markers, function() {
			var thisMarker = this;
			var startDate = this.startDate;
			if (self.timeline.markerSpacing == "equal") {
				if (!this.fakeStartDate) {
					self.generateFakeDateForStory({
						story : this
					});
				}
				startDate = this.fakeStartDate;
			}
			if (startDate.getTime() >= self.viewDateRange.start.getTime() && startDate.getTime() <= self.viewDateRange.end.getTime()) {
				if (self.timeline3D.direction) {
					self.visibleMarkers.unshift(thisMarker);
				} else {
					self.visibleMarkers.push(thisMarker);
				}
			}
		});
		var numVis = self.visibleMarkers.length;
		if (numVis > self.visibleMarkersLimit) {
			self.visibleMarkers = self.visibleMarkers.slice(numVis - self.visibleMarkersLimit);
		}
		theTLMainController.repositionBackgroundImage({
			repositionOnly : true
		});
		self.drawView();
	},
	resizeContent : function(data) {
		var self = this;
		self.viewSize = {
			width : data.newSize.width,
			height : data.newSize.height
		};
		self.maxTimelineWidth = self.viewSize.width * self.timeline3D.endToScreenRatio * self.timelinePaddingExpansion;
		$(self.domCanvas).css({
			width : self.viewSize.width,
			height : self.viewSize.height
		}).attr("width", self.viewSize.width * self.deviceScale).attr("height", self.viewSize.height * self.deviceScale);
		self.canvasContext.scale(self.deviceScale, self.deviceScale);
		self.canvasVert = assets.js.core.utils.AJKHelpers.getCoordsOfDomEl({
			domEl : self.domCanvas
		}).y;
		self.drawView();
	},
	getScreenInfoFromTimelinePos : function(data) {
		var self = this;
		var timelinePos = data.timelinePos;
		var screenWidth = self.viewSize.width;
		var screenHeight = Math.round(self.viewSize.height * self.timelinePaddingExpansion);
		var pos = {
			top : screenHeight * self.timeline3D.vanishTop,
			topLeft : screenWidth * 0.5,
			topRight : screenWidth * 0.5,
			bottom : screenHeight * 1,
			bottomLeft : -screenWidth * .25 * self.timelinePaddingExpansion,
			bottomRight : screenWidth * self.timeline3D.endToScreenRatio * self.timelinePaddingExpansion
		};
		var distance = timelinePos.y;
		var hOffset = timelinePos.x;
		var itemWidth = pos.bottomRight - pos.bottomLeft;
		var vanishingHeight = pos.bottom - pos.top;
		var maxDistance = self.timeline3DLength;
		var step = 20;
		var k = 0.006;
		var widthOnScreen = itemWidth * Math.pow(Math.E, -k * (maxDistance - distance));
		var xPos = (screenWidth - widthOnScreen) / 2 + hOffset * widthOnScreen;
		var yPos = pos.top + (widthOnScreen / itemWidth) * vanishingHeight;
		var offset = Math.min(widthOnScreen / itemWidth * self.viewOffset);
		return {
			x : xPos + offset,
			y : yPos - 10,
			sliceWidth : widthOnScreen,
			offset : offset
		};
	},
	redisplayAfterDataChange : function() {
		var self = this;
		if (self.active) {
			self.updateStoryColPositions();
			self.moveViewToDate({
				date : self.currentDate
			});
		}
	},
	redisplay : function() {
		var self = this;
		if (self.active) {
			self.drawView();
		}
	},
	drawView : function() {
		var self = this;
		var catView = (self.timeline.viewType == "category-band");
		var numCols = (catView) ? self.standardViewController.activeCategories.length : self.timeline3D.numCols;
		var ctx = self.canvasContext;
		var vanishingPoint = self.getScreenInfoFromTimelinePos({
			timelinePos : {
				x : 0.5,
				y : 0
			}
		});
		var tcRGB = assets.js.core.utils.AJKHelpers.convertHexColourToRGB({
			hexColour : self.timeline3D.color
		});
		var timelineGradColor = "rgba(" + tcRGB.r + "," + tcRGB.g + "," + tcRGB.b + ",";
		ctx.clearRect(0, 0, self.viewSize.width, self.viewSize.height);
		var bgRGB = assets.js.core.utils.AJKHelpers.convertHexColourToRGB({
			hexColour : self.timeline.backgroundColour
		});
		var bgFade = "rgba(" + bgRGB.r + "," + bgRGB.g + "," + bgRGB.b + "," + self.timeline3D.bgFade + ")";
		ctx.fillStyle = bgFade;
		ctx.fillRect(0, 0, self.viewSize.width, self.viewSize.height);
		var leftBottomPos = self.getScreenInfoFromTimelinePos({
			timelinePos : {
				x : 0,
				y : self.timeline3DLength
			}
		});
		var rightBottomPos = self.getScreenInfoFromTimelinePos({
			timelinePos : {
				x : 1,
				y : self.timeline3DLength
			}
		});
		if (catView) {
			for (var cat = 0; cat < numCols; cat++) {
				var thisCat = self.standardViewController.activeCategories[cat];
				var catRGB = assets.js.core.utils.AJKHelpers.convertHexColourToRGB({
					hexColour : thisCat.colour
				});
				var catGradColor = "rgba(" + catRGB.r + "," + catRGB.g + "," + catRGB.b + ",";
				var blPos = self.getScreenInfoFromTimelinePos({
					timelinePos : {
						x : cat / numCols,
						y : self.timeline3DLength
					}
				});
				var brPos = self.getScreenInfoFromTimelinePos({
					timelinePos : {
						x : (cat + 1) / numCols,
						y : self.timeline3DLength
					}
				});
				var grad = ctx.createLinearGradient(0, self.viewSize.height * self.timeline3D.vanishTop, 0, self.viewSize.height);
				grad.addColorStop(0, catGradColor + "0)");
				grad.addColorStop(0.06, catGradColor + "0)");
				grad.addColorStop(0.8, catGradColor + "1)");
				grad.addColorStop(1, catGradColor + "1)");
				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.moveTo(vanishingPoint.x, vanishingPoint.y);
				ctx.lineTo(blPos.x, blPos.y);
				ctx.lineTo(brPos.x, brPos.y);
				ctx.moveTo(vanishingPoint.x, vanishingPoint.y);
				ctx.closePath();
				ctx.fill();
			}
		} else {
			var grad = ctx.createLinearGradient(0, self.viewSize.height * self.timeline3D.vanishTop, 0, self.viewSize.height);
			grad.addColorStop(0, timelineGradColor + "0)");
			grad.addColorStop(0.06, timelineGradColor + "0)");
			grad.addColorStop(0.8, timelineGradColor + "0.75)");
			grad.addColorStop(1, timelineGradColor + "0.75)");
			ctx.fillStyle = grad;
			ctx.beginPath();
			ctx.moveTo(vanishingPoint.x, vanishingPoint.y);
			ctx.lineTo(leftBottomPos.x, leftBottomPos.y);
			ctx.lineTo(rightBottomPos.x, rightBottomPos.y);
			ctx.lineTo(vanishingPoint.x, vanishingPoint.y);
			ctx.closePath();
			ctx.fill();
		}
		for (var endPt = 0; endPt <= numCols; endPt++) {
			var endPos = self.getScreenInfoFromTimelinePos({
				timelinePos : {
					x : endPt / numCols,
					y : self.timeline3DLength
				}
			});
			ctx.beginPath();
			var grad = ctx.createLinearGradient(vanishingPoint.x, vanishingPoint.y, endPos.x, endPos.y);
			grad.addColorStop(0, timelineGradColor + "0)");
			grad.addColorStop(0.06, timelineGradColor + "0)");
			grad.addColorStop(0.8, timelineGradColor + "1)");
			grad.addColorStop(1, timelineGradColor + "1)");
			ctx.strokeStyle = grad;
			ctx.moveTo(vanishingPoint.x, vanishingPoint.y);
			ctx.lineTo(endPos.x, endPos.y);
			ctx.closePath();
			ctx.stroke();
		}
		ctx.beginPath();
		var grad = ctx.createLinearGradient(0, self.viewSize.height * self.timeline3D.vanishTop, 0, self.viewSize.height);
		grad.addColorStop(0, timelineGradColor + "0)");
		grad.addColorStop(0.06, timelineGradColor + "0)");
		grad.addColorStop(0.8, timelineGradColor + "0.75)");
		grad.addColorStop(1, timelineGradColor + "0.75)");
		ctx.strokeStyle = grad;
		var textGrad = ctx.createLinearGradient(0, self.viewSize.height * self.timeline3D.vanishTop, 0, self.viewSize.height);
		textGrad.addColorStop(0, timelineGradColor + "0)");
		textGrad.addColorStop(0.06, timelineGradColor + "0)");
		textGrad.addColorStop(0.6, timelineGradColor + "0.9)");
		textGrad.addColorStop(1, timelineGradColor + "1)");
		ctx.fillStyle = (self.isFireFoxMac) ? timelineGradColor + "0.7)" : textGrad;
		$.each(self.visibleScalePoints, function() {
			var thisScalePoint = this;
			var thisDate = (self.timeline.markerSpacing == "equal") ? this.fakeDate : this.date;
			if (self.timeline3D.direction) {
				var yPos = (self.viewDateRange.end.getTime() - thisDate.getTime()) / self.viewDateRange.range * self.timeline3DLength;
			} else {
				var yPos = (thisDate.getTime() - self.viewDateRange.start.getTime()) / self.viewDateRange.range * self.timeline3DLength;
			}
			self.drawScaleOnScreenAtTimelinePos({
				timelinePos : {
					y : yPos
				},
				scalePoint : thisScalePoint
			});
		});
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		$.each(self.visibleMarkers, function() {
			var thisMarker = this;
			var xPos = this.col3DPos;
			var startDate = (self.timeline.markerSpacing == "equal") ? this.fakeStartDate : this.startDate;
			if (self.timeline3D.direction) {
				var yPos = (self.viewDateRange.end.getTime() - startDate.getTime()) / self.viewDateRange.range * self.timeline3DLength;
			} else {
				var yPos = (startDate.getTime() - self.viewDateRange.start.getTime()) / self.viewDateRange.range * self.timeline3DLength;
			}
			self.drawMarkerOnScreenAtTimelinePos({
				timelinePos : {
					x : xPos,
					y : yPos
				},
				marker : thisMarker
			});
		});
	},
	drawScaleOnScreenAtTimelinePos : function(data) {
		var self = this;
		var ctx = self.canvasContext;
		var timelinePos = data.timelinePos;
		timelinePos.x = 0;
		var scalePoint = data.scalePoint;
		var screenPos = self.getScreenInfoFromTimelinePos({
			timelinePos : timelinePos
		});
		screenPos.y = Math.round(screenPos.y);
		var scaleWidth = screenPos.sliceWidth * 1.05;
		var extendWidth = (scaleWidth - screenPos.sliceWidth) / 2;
		if (scaleWidth > 100) {
			var scaleLeft = (self.viewSize.width - scaleWidth) / 2 + screenPos.offset;
			ctx.moveTo(scaleLeft, screenPos.y);
			if (scalePoint.dateText) {
				ctx.lineTo(scaleLeft + scaleWidth, screenPos.y);
			} else {
				ctx.lineTo(scaleLeft + extendWidth, screenPos.y);
				ctx.moveTo(scaleLeft + extendWidth + screenPos.sliceWidth, screenPos.y);
				ctx.lineTo(scaleLeft + scaleWidth, screenPos.y);
			}
			var fontSize = scaleWidth / 30;
			ctx.font = fontSize + "px 'Helvetica','sans-serif'";
			ctx.textAlign = "right";
			ctx.fillText(scalePoint.dateText, scaleLeft - (extendWidth / 2), screenPos.y + 0.25 * fontSize - 1);
			ctx.textAlign = "left";
			ctx.fillText(scalePoint.dateText, scaleLeft + scaleWidth + (extendWidth / 2), screenPos.y + 0.25 * fontSize - 1);
		}
	},
	drawMarkerOnScreenAtTimelinePos : function(data) {
		var self = this;
		var ctx = self.canvasContext;
		var timelinePos = data.timelinePos;
		var marker = data.marker;
		if (marker.category.hide) {
			return;
		}
		var vPos = timelinePos.y;
		if (self.timeline.viewType == "color-category-stories" || self.timeline.viewType == "duration") {
			var panelColor = "#" + marker.category.colour;
			var cRGB = assets.js.core.utils.AJKHelpers.convertHexColourToRGB({
				hexColour : marker.category.colour
			});
			var gradColor = "rgba(" + cRGB.r + "," + cRGB.g + "," + cRGB.b + ",";
		} else {
			var panelColor = "rgba(255,255,255,1)";
			var gradColor = "rgba(255,255,255,";
		}
		var screenPos = self.getScreenInfoFromTimelinePos({
			timelinePos : timelinePos
		});
		var sliceWidth = screenPos.sliceWidth;
		var sizeAdjust = sliceWidth / self.timeline3D.panelSize;
		var itemWidth = 200 * sizeAdjust;
		if (itemWidth < 3) {
			return;
		}
		if (!marker.dom3DText) {
			marker.generateTextImageFor3D();
		}
		var numTextLines = (marker.lines3DText && marker.lines3DText.length > 2) ? marker.lines3DText.length : 2;
		var vTextAdjust = (numTextLines - 2) * 16 * sizeAdjust;
		var textHolderHeight = 60 * sizeAdjust + vTextAdjust;
		var shadowBlockHeight = 60 * sizeAdjust;
		var imageBoxHeight = 150 * sizeAdjust;
		var arrowHeight = 15 * sizeAdjust;
		var arrowWidth = 15 * sizeAdjust;
		var itemHeight = textHolderHeight + imageBoxHeight + arrowHeight;
		var itemHeightNoImage = textHolderHeight + arrowHeight;
		var textPadding = itemWidth / 30;
		var headlineSize = 15 * sizeAdjust;
		var maxMaxTextWidth = itemWidth - textPadding * 2;
		var vShift = (self.hoverMarker == marker && self.timeline.lightboxStyle != 2) ? 5 * sizeAdjust : 0;
		marker.marker3DScreenInfo = {
			x : screenPos.x - itemWidth / 2,
			y : screenPos.y - itemHeightNoImage,
			width : itemWidth,
			height : itemHeightNoImage,
			active : true,
			timelinePos : timelinePos
		};
		var fadeOutLimit = self.timeline3DLength - (self.datePrePadding / (self.datePrePadding + 1) * self.timeline3DLength);
		if (vPos > fadeOutLimit) {
			var opacity = 1 - (vPos - fadeOutLimit) / (self.timeline3DLength - fadeOutLimit);
			marker.marker3DScreenInfo.active = (opacity > 0.6) ? true : false;
		} else {
			var opacity = sliceWidth * self.timelinePaddingExpansion / (0.3 * self.maxTimelineWidth);
		}
		opacity = (opacity > 1 || (self.hoverMarker == marker)) ? 1 : opacity;
		opacity = (marker.searchHidden) ? opacity * 0.1 : opacity;
		ctx.globalAlpha = opacity;
		var startPos = {
			y : screenPos.y - vShift,
			x : screenPos.x
		};
		ctx.fillStyle = panelColor;
		ctx.beginPath();
		ctx.moveTo(startPos.x, startPos.y);
		startPos.x -= arrowWidth / 2;
		startPos.y -= arrowHeight;
		ctx.lineTo(startPos.x, startPos.y);
		startPos.x -= (itemWidth / 2 - arrowWidth / 2);
		ctx.lineTo(startPos.x, startPos.y);
		startPos.y -= textHolderHeight;
		ctx.lineTo(startPos.x, startPos.y);
		startPos.x += itemWidth;
		ctx.lineTo(startPos.x, startPos.y);
		startPos.y += textHolderHeight;
		ctx.lineTo(startPos.x, startPos.y);
		startPos.x -= (itemWidth / 2 - arrowWidth / 2);
		ctx.lineTo(startPos.x, startPos.y);
		ctx.lineTo(screenPos.x, screenPos.y - vShift);
		ctx.closePath();
		ctx.fill();
		startPos = {
			y : screenPos.y - vShift,
			x : screenPos.x
		};
		ctx.beginPath();
		ctx.moveTo(startPos.x, startPos.y);
		startPos.x -= arrowWidth / 2;
		startPos.y -= arrowHeight;
		ctx.lineTo(startPos.x, startPos.y);
		startPos.x += arrowWidth;
		ctx.lineTo(startPos.x, startPos.y);
		ctx.closePath();
		ctx.fill();
		var bestDomText = "";
		if (itemWidth <= 75) {
			bestDomText = marker.dom3DTextTiny;
		} else if (itemWidth <= 150) {
			bestDomText = marker.dom3DTextSmall;
		} else if (itemWidth <= 200) {
			bestDomText = marker.dom3DText;
		} else {
			bestDomText = marker.dom3DText;
		}
		ctx.drawImage(bestDomText, screenPos.x - 0.5 * itemWidth, screenPos.y - arrowHeight - textHolderHeight - vShift, itemWidth, textHolderHeight);
		if (marker.feedSource == "twitter") {
		} else if (!marker.lazyImageLoaded && marker.displayImage) {
			marker.lazyLoadImage();
		} else if (marker.displayImage && marker.domMainImage && itemWidth > 1) {
			if (!marker.dom3DImage) {
				marker.generateImageFor3D();
			}
			if (marker.dom3DImage) {
				var bestDomImage = "";
				if (itemWidth <= 100) {
					bestDomImage = marker.dom3DImage100;
				} else if (itemWidth <= 150) {
					bestDomImage = marker.dom3DImage150;
				} else if (itemWidth <= 200) {
					bestDomImage = marker.dom3DImage200;
				} else {
					bestDomImage = marker.dom3DImage;
				}
				ctx.drawImage(bestDomImage, screenPos.x - 0.5 * itemWidth, screenPos.y - itemHeight - vShift, itemWidth, imageBoxHeight);
				marker.marker3DScreenInfo.height = itemHeight;
				marker.marker3DScreenInfo.y = screenPos.y - itemHeight;
			}
		}
		if ((self.selectedMarker == marker || self.hoverMarker == marker) && marker.marker3DScreenInfo.timelinePos.y > self.moreInfoCutOff && self.timeline.lightboxStyle != 2) {
			var clickBlock = {
				height : 20 * sizeAdjust,
				fontSize : 11 * sizeAdjust,
				bottom : 6 * sizeAdjust,
				left : 10 * sizeAdjust
			};
			ctx.fillStyle = "rgba(0,0,0,0.75)";
			var blockX = screenPos.x - 0.5 * itemWidth;
			var blockY = screenPos.y - itemHeightNoImage - vShift - clickBlock.height;
			ctx.fillRect(blockX, blockY, itemWidth, clickBlock.height);
			ctx.fillStyle = "rgba(255,255,255,0.8)";
			ctx.font = clickBlock.fontSize + "px 'Helvetica','sans-serif'";
			ctx.textAlign = "left";
			ctx
					.fillText(assets.js.core.setting.TLConfigText['3d_click_to_find_out_more'].toUpperCase(), blockX + clickBlock.left, blockY + (clickBlock.height)
							- clickBlock.bottom);
		}
		var startPos = {
			y : screenPos.y + vShift,
			x : screenPos.x
		};
		var grad = ctx.createLinearGradient(screenPos.x, screenPos.y, screenPos.x, screenPos.y + shadowBlockHeight + arrowHeight);
		grad.addColorStop(0, gradColor + "0.5)");
		grad.addColorStop(0.3, gradColor + "0.2)");
		grad.addColorStop(0.7, gradColor + "0.05)");
		grad.addColorStop(1, gradColor + "0)");
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.moveTo(startPos.x, startPos.y);
		startPos.x += arrowWidth / 2;
		startPos.y += arrowHeight;
		ctx.lineTo(startPos.x, startPos.y);
		startPos.x += (itemWidth / 2 - arrowWidth / 2);
		ctx.lineTo(startPos.x, startPos.y);
		startPos.y += shadowBlockHeight;
		ctx.lineTo(startPos.x, startPos.y);
		startPos.x -= itemWidth;
		ctx.lineTo(startPos.x, startPos.y);
		startPos.y -= shadowBlockHeight;
		ctx.lineTo(startPos.x, startPos.y);
		startPos.x += (itemWidth / 2 - arrowWidth / 2);
		ctx.lineTo(startPos.x, startPos.y);
		ctx.lineTo(screenPos.x, screenPos.y + vShift);
		ctx.closePath();
		ctx.fill();
		ctx.globalAlpha = 1;
	}
});