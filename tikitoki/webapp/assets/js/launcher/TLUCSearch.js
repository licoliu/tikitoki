Class.forName({
	name : "class assets.js.launcher.TLUCSearch extends Object",
	"@Getter @Setter private controller" : null,
	"@Getter @Setter private initialised" : false,
	"@Getter @Setter private filterText" : "",
	"@Getter @Setter private defaultText" : "Enter search term",

	TLUCSearch : function(data) {
		this.controller = data.controller;
		if (this.controller.trans) {
			this.defaultText = this.controller.trans.enterSearchTerm;
		}
	},

	init : function() {
		var self = this;
		self.matchedStories = 0;
		this.prepareForView();
		return self;
	},
	initialise : function() {
		var self = this;
		self.mainController = theTLMainController;
		self.timeline = theTLMainController.timeline;
		self.domRoot = $("#tl-uc-search-block").get()[0];
		self.domInput = $("#ft-fch-sp-input").get()[0];
		self.domButton = $("#ft-fch-sp-button").get()[0];
		self.domClearLink = $("#ft-fch-sp-clear").get()[0];
		self.domFilterText = $("#ft-fch-sp-filter").get()[0];
		self.domNumStories = $("#ft-fch-sp-num-stories").get()[0];
		self.domFilterMessage = $("#ft-fch-sp-filter-message").get()[0];
		self.domEveryoneMessage = $("#ft-fch-sp-everyone-message").get()[0];
		$(self.domInput).val(self.defaultText).focus(function() {
			var thisText = $(this).val();
			if (thisText == self.defaultText) {
				$(this).val("");
			}
		}).blur(function() {
			var thisText = $(this).val();
			if (thisText == "") {
				$(this).val(self.defaultText);
			}
		}).keyup(function(e) {
			if (e.keyCode == 13) {
				$(self.domButton).click();
			}
		});
		$(self.domClearLink).click(function() {
			$(self.domInput).val(self.defaultText);
			self.filterText = "";
			self.filterStories();
			return false;
		});
		$(self.domButton).click(function() {
			self.filterText = $(self.domInput).val();
			self.filterText = (self.filterText == self.defaultText) ? "" : self.filterText;
			self.filterStories();
			return false;
		});
		self.initialised = true;
	},
	prepareForView : function() {
		var self = this;
		if (!self.initialised) {
			self.initialise();
		}
		self.updateSearchFilterText();
	},
	updateSearchFilterText : function() {
		var self = this;
		if (self.filterText) {
			$(self.domFilterText).text(self.filterText);
			$(self.domEveryoneMessage).css({
				display : "none"
			});
			var storiesText = (self.controller.trans) ? self.controller.trans.stories : "stories";
			var storyText = (self.trans) ? self.controller.trans.story : "story";
			var numStoryText = "<strong>" + self.matchedStories + "</strong>" + ((self.matchedStories != 1) ? " " + storiesText : " " + storyText);
			$(self.domNumStories).html(numStoryText);
			$(self.domFilterMessage).css({
				display : "inline"
			});
		} else {
			$(self.domFilterMessage).css({
				display : "none"
			});
			$(self.domEveryoneMessage).css({
				display : "inline"
			});
		}
	},
	normaliseText : function(data) {
		var sT = data.text.toLowerCase();
		sT = sT.replace(/[àáâãäå]/g, "a");
		sT = sT.replace(/[éèêë]/g, "e");
		sT = sT.replace(/[îï]/g, "i");
		sT = sT.replace(/[ô]/g, "o");
		sT = sT.replace(/[ü]/g, "u");
		sT = sT.replace(/[ç]/g, "c");
		sT = sT.replace(/[ñ]/g, "n");
		return sT;
	},
	filterStories : function() {
		var self = this;
		if (!self.filterText) {
			self.showAllStories();
			return;
		}
		var firstStory = "";
		self.matchedStories = 0;
		var filterText = self.normaliseText({
			text : self.filterText
		});
		$.each(self.mainController.markers, function() {
			var searchText = this.headline + this.introText + this.fullText;
			searchText = self.normaliseText({
				text : searchText
			});
			if (searchText.indexOf(filterText) == -1) {
				this.searchHide();
			} else {
				this.searchShow();
				firstStory = (!firstStory) ? this : firstStory;
				self.matchedStories++;
			}
		});
		if (firstStory) {
			self.mainController.focusMarker({
				marker : firstStory
			});
		}
		self.updateSearchFilterText();
		self.mainController.selected3DView.redisplay();
	},
	showAllStories : function() {
		var self = this;
		$.each(self.mainController.markers, function() {
			this.searchShow();
		});
		self.updateSearchFilterText();
		self.mainController.selected3DView.redisplay();
	},
	viewHasEnded : function() {
		var self = this;
		$(self.domClearLink).click();
	}
});