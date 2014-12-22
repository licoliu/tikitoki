$import("assets.js.core.utils.AJKHelpers");

Class.forName({
	name : "class assets.js.core.component.TLViewCategoryBand extends Object",

	TLViewCategoryBand :function(data) {
		var self = this;
		self.category = data.category;
		self.height = data.height;
		self.top = data.top;
		self.width = data.width;
		self.domRoot = "";
		self.domLabel = "";
	},
	init : function() {
		var self = this;
		self.generateDom();
		return self;
	},
	generateDom : function() {
		var self = this;
		var highlightColor = ($.browser.msie) ? assets.js.core.utils.AJKHelpers.adjustColour({
			colour : self.category.colour,
			adjust : 1.2
		}) : self.category.colour;
		var extraClass = (self.category.viewType == "duration") ? " tl-stage-view-duration tl-stage-view-color-category-stories" : "";
		var insertHTML = '<div id="tl-view-category-band-' + self.category.id + '" class="tl-view-category-band' + extraClass + '" style="width: ' + self.width
				+ 'px; border-color: #' + highlightColor + '; height: ' + self.height + '%; top: ' + self.top + '%;">';
		insertHTML += '<div class="tl-vcb-scale" style="background-color: #' + self.category.colour + ';"></div>';
		insertHTML += '<div style="background-color: #' + self.category.colour + ';" class="tl-vcb-inner"></div>';
		insertHTML += '</div>';
		self.domRoot = $(insertHTML).get()[0];
		var categoryTitle = assets.js.core.utils.AJKHelpers.clipToMaxCharWords({
			aString : self.category.title,
			maxChars : 30
		});
		if ($.browser.msie) {
			var ieWidth = 30000;
			while (ieWidth < self.width) {
				$(self.domRoot).append('<div style="left: ' + ieWidth + 'px; background-color: #' + self.category.colour + ';" class="tl-vcb-inner"></div>');
				ieWidth += 30000;
			}
		}
		var insertHTML = '<div id="tl-view-category-band-label-' + self.category.id + '" class="tl-view-category-band-label" style="top: ' + (self.height + self.top)
				+ '%;"><h4 style="background-color: #' + highlightColor + ';">' + categoryTitle + '</h4></div>';
		self.domLabel = $(insertHTML).get()[0];
	},
	refreshFromCategory : function() {
		var self = this;
		$(self.domLabel).find("h4").css({
			backgroundColor : "#" + self.category.colour
		}).text(self.category.title);
		$(self.domRoot).css({
			borderColor : "#" + self.category.colour
		});
		$(self.domRoot).find(".tl-vcb-inner, tl-vcb-scale").css({
			backgroundColor : "#" + self.category.colour
		});
	}
});