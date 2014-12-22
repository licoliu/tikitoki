$import("assets.js.launcher.TLUCAppsFilter");
$import("assets.js.launcher.TLUCCategoryFilter");
$import("assets.js.launcher.TLUCDateTimeFilter");
$import("assets.js.launcher.TLUCSearch");
$import("assets.js.launcher.TLUCSpacing");
$import("assets.js.launcher.TLUCTypesFilter");
$import("assets.js.launcher.TLUCViewType");
$import("assets.js.launcher.TLUCZoom");

Class.forName({
	name : "class assets.js.launcher.TLUserControls extends Object",

	TLUserControls : function(data) {
		var self = this;
		self.domRoot = $("#tl-uc-controls").get()[0];
		self.domLaunch = $(self.domRoot).find(".launch").get()[0];
		self.domMenu = $(self.domRoot).find(".menu-holder").get()[0];
		self.domOptions = $(self.domMenu).find("li").get();
		self.domPanel = $(self.domRoot).find(".tl-uc-panel").get()[0];
		self.animating = false;
		self.launched = false;
		self.menuWidth = 325;
		self.defaultPos = 10;
		self.openPos = 25;
		self.domCarousel = $(self.domRoot).find(".fp-carousel").get()[0];
		self.domStage = $(self.domRoot).find(".fp-stage").get()[0];
		self.domBlocks = $(self.domRoot).find(".fp-block").get();
		self.selectedBlock = 0;
		self.blockControllers = false;
		self.mainController = theTLMainController;
		self.timeline = theTLMainController.timeline;
		self.viewsByName = [];
		self.translated = false;
	},
	init : function() {
		var self = this;
		$(self.domLaunch).click(function() {
			if (self.launched) {
				self.close();
			} else {
				self.launch();
			}
			return false;
		});
		$(self.domRoot).hover(function() {
			self.mainController.mouseOverUserControls = true;
		}, function() {
			self.mainController.mouseOverUserControls = false;
		});
		$(self.domOptions).click(function() {
			var pos = $(this).attr("fppos");
			var openBlock = self.selectedBlock;
			self.jumpTo({
				pos : pos,
				callback : function() {
					self.blockClosed({
						block : openBlock
					});
				}
			});
			return false;
		});
		$(self.domRoot).find(".close-panel").click(function() {
			self.close();
			return false;
		});
		self.showButton();
		self.doTranslation();

		$(self.domLaunch).click();
		return self;
	},
	windowDidBlur : function() {
		var self = this;
		self.mainController.mouseOverUserControls = false;
	},
	mouseDidLeavePage : function() {
		var self = this;
		self.mainController.mouseOverUserControls = false;
	},
	langDidChange : function() {
		var self = this;
		self.doTranslation();
		if (self.viewsByName["search"]) {
			self.viewsByName["search"].defaultText = self.trans.enterSearchTerm;
		}
	},
	doTranslation : function() {
		var self = this;
		var trans = TLTranslation[self.timeline.language];
		if (trans && trans.userControls) {
			var t = trans.userControls;
			self.trans = t;
			var menuItems = $(self.domRoot).find(".menu-holder li");
			$(menuItems[0]).find("a").text(t["zoom"]);
			$(menuItems[1]).find("a").text(t["spacing"]);
			$(menuItems[2]).find("a").text(t["viewType"]);
			$(menuItems[3]).find("a").text(t["search"]);
			$(menuItems[4]).find("a").text(t["categories"]);

			$(menuItems[1]).css({
				display : ((self.timeline.language == "english" || self.timeline.language == "english-common") ? "inline-block" : "none")
			});
			$("#uc-text-search").text(t["search"]);
			$("#ft-fch-sp-input").attr("value", t["enterSearchTerm"]);
			$("#ft-fch-sp-button").text(t["go"]);
			$("#uc-text-displaying").text(t["displaying"]);
			$("#ft-fch-sp-everyone-message").text(t["allStories"]);
			$("#uc-text-matching").text(t["matching"]);
			$("#ft-fch-sp-clear").text(t["clear"]);
			$("#uc-text-category-filter").text(t["categories"]);
			$("#uc-text-view-type").text(t["viewType"]);
			$("#tl-uc-view-type-block .tl-isl-standard p").text(t["standard"]);
			$("#tl-uc-view-type-block .tl-isl-category p").text(t["categoryBands"]);
			$("#tl-uc-view-type-block .tl-isl-coloured p").text(t["colouredStories"]);
			$("#tl-uc-view-type-block .tl-isl-duration p").text(t["duration"]);
			$("#uc-text-spacing").text(t["storySpacing"]);
			$("#uc-text-zoom").text(t["zoom"]);
		}
	},
	updateView : function(data) {
		var self = this;
		if (self.viewsByName[data.view]) {
			self.viewsByName[data.view].updateView();
		}
	},
	isActiveBlock : function(data) {
		var self = this;
		return (self.blockControllers[self.selectedBlock] == data.block);
	},
	showButton : function() {
		var self = this;
		$(self.domRoot).css({
			display : "block"
		});
	},
	hideButton : function() {
		var self = this;
		$(self.domRoot).css({
			display : "none"
		});
		self.close();
	},
	launch : function() {
		var self = this;
		if (!self.blockControllers) {
			self.initialiseBlockControllers();
		}
		if (!self.translated) {
			self.doTranslation();
			self.translated = true;
		}
		if (self.animating || self.launched) {
			return;
		}
		self.animating = true;
		self.blockControllers[self.selectedBlock].prepareForView();
		if ($.browser.msie) {
			$(self.domPanel).css({
				display : "block"
			});
			/*
			 * $(self.domRoot).css({ right : self.openPos });
			 */
			$(self.domMenu).css({
				display : "block",
				width : 325
			});
			self.launched = true;
			self.animating = false;
		} else {
			/*
			 * $(self.domRoot).animate({ right : self.openPos }, 500);
			 */
			$(self.domPanel).css({
				opacity : 0,
				display : "block"
			}).animate({
				opacity : 1
			}, 500, function() {
			});
			$(self.domMenu).css({
				display : "block"
			}).animate({
				width : 325
			}, 500, function() {
				self.launched = true;
				self.animating = false;
			});
		}
		theAJKWindowBlurEvent.registerAsObserver({
			observer : self
		});
	},
	close : function() {
		var self = this;
		if (self.animating || self.launched == false) {
			return;
		}
		self.animating = true;
		if ($.browser.msie) {
			/*
			 * $(self.domRoot).css({ right : self.defaultPos });
			 */
			$(self.domPanel).css({
				display : "none"
			});
			$(self.domMenu).css({
				display : "none"
			});
			self.launched = false;
			self.animating = false;
			self.blockClosed({
				block : self.selectedBlock
			});
		} else {
			/*
			 * $(self.domRoot).animate({ right : self.defaultPos }, 500);
			 */
			$(self.domPanel).animate({
				opacity : 0
			}, 500, function() {
				$(this).css({
					display : "none"
				});
			});
			$(self.domMenu).animate({
				width : 0
			}, 500, function() {
				$(this).css({
					display : "none"
				});
				self.launched = false;
				self.animating = false;
				self.blockClosed({
					block : self.selectedBlock
				});
			});
		}
		theAJKWindowBlurEvent.removeAsObserver({
			observer : self
		});
		self.mainController.mouseOverUserControls = false;
	},
	blockClosed : function(data) {
		var self = this;
		var block = self.blockControllers[data.block];
		if (block.viewHasEnded) {
			block.viewHasEnded();
		}
	},
	initialiseBlockControllers : function() {
		var self = this;
		self.blockControllers = [];

		self.viewsByName["zoom"] = self.blockControllers[0] = new assets.js.launcher.TLUCZoom({
			controller : self
		}).init();

		self.viewsByName["spacing"] = self.blockControllers[1] = new assets.js.launcher.TLUCSpacing({
			controller : self
		}).init();

		self.viewsByName["view"] = self.blockControllers[2] = new assets.js.launcher.TLUCViewType({
			controller : self
		}).init();

		self.viewsByName["search"] = self.blockControllers[3] = new assets.js.launcher.TLUCSearch({
			controller : self
		}).init();

		self.viewsByName["category"] = self.blockControllers[4] = new assets.js.launcher.TLUCCategoryFilter({
			controller : self
		}).init();

		self.viewsByName["releaseType"] = self.blockControllers[5] = new assets.js.launcher.TLUCTypesFilter({
			controller : self
		}).init();

		self.viewsByName["appType"] = self.blockControllers[6] = new assets.js.launcher.TLUCAppsFilter({
			controller : self
		}).init();

		self.viewsByName["dateTime"] = self.blockControllers[7] = new assets.js.launcher.TLUCDateTimeFilter({
			controller : self
		}).init();

		$(".tl-uc-advance-search").find("a").click(function() {
			if ($(this).hasClass("active")) {
				$(this).removeClass('active');
				$(this).parents("tr").prev().hide().prev().hide();
			} else {
				$(this).addClass('active');
				$(this).parents("tr").prev().css({
					display : "table-row"
				}).prev().css({
					display : "table-row"
				});
			}

			theAJKWindowResizeEvent.informObservers(true);
			theAJKWindowResizeEvent.hideScrollBars();
		});
	},
	refreshTimelineView : function() {
		var self = this;
		self.mainController.selected3DView.clearStories3DText();
		if (self.timeline.viewType == "category-band") {
			self.mainController.sortMarkersByCategoryList();
		}
		self.mainController.updateViewsWithNewDateRangeAndZoom({
			zoom : self.timeline.zoom
		});
		self.mainController.flushSize();
	},
	jumpTo : function(data) {
		var self = this;
		var newPos = data.pos;
		var callback = data.callback;
		var duration = (data.instantly) ? 0 : 300;
		if (self.selectedBlock == newPos) {
			return;
		}
		self.blockControllers[newPos].prepareForView();
		var oldPos = self.selectedBlock;
		self.selectedBlock = newPos;
		$(self.domOptions[oldPos]).removeClass("selected");
		$(self.domOptions[newPos]).addClass("selected");
		self.carouselHeight = $(self.domCarousel).height();
		if (newPos > oldPos) {
			$(self.domBlocks[newPos]).css({
				display : "block"
			});
			$(self.domStage).animate({
				marginTop : -self.carouselHeight
			}, duration, function() {
				$(self.domBlocks[oldPos]).css({
					display : "none"
				});
				$(this).css({
					marginTop : "0"
				});
				if (callback) {
					callback();
				}
			});
		} else {
			$(self.domBlocks[newPos]).css({
				display : "block"
			});
			$(self.domStage).css({
				marginTop : -self.carouselHeight
			});
			$(self.domStage).animate({
				marginTop : 0
			}, duration, function() {
				$(self.domBlocks[oldPos]).css({
					display : "none"
				});
				if (callback) {
					callback();
				}
			});
		}
	}
});