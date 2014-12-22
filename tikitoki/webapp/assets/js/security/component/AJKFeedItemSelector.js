Class.forName({
	name : "class assets.js.security.component.AJKFeedItemSelector extends Object",

	AJKFeedItemSelector : function(data) {
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
	},
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
});