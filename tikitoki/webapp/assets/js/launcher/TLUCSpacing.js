$import("assets.js.core.controller.TLViewController");
Class.forName({
	name : "class assets.js.launcher.TLUCSpacing extends Object",
	"@Getter @Setter private controller" : null,
	"@Getter @Setter private initialised" : false,

	TLUCSearch : function(data) {
		this.controller = data.controller;
	},

	init : function() {
		var self = this;
		return self;
	},
	initialise : function() {
		var self = this;
		self.domRoot = $("#tl-uc-spacing-block").get()[0];
		self.domSelect = $(self.domRoot).find("select").get()[0];
		self.mainController = theTLMainController;
		self.timeline = theTLMainController.timeline;
		$(self.domSelect).change(function() {
			self.updateSpacing({
				spacing : $(this).val()
			});
		});
		self.initialised = true;
	},
	updateView : function() {
		var self = this;
		if (self.initialised) {
			$(self.domSelect).val(self.timeline.storySpacingType);
		}
	},
	prepareForView : function() {
		var self = this;
		if (!self.initialised) {
			self.initialise();
		}
		$(self.domSelect).val(self.timeline.storySpacingType);
	},
	updateSpacing : function(data) {
		var self = this;
		self.timeline.storySpacingType = data.spacing;
		self.timeline.markerSpacing = assets.js.core.controller.TLViewController.markerSpacingView[self.timeline.storySpacingType].type;
		self.timeline.equalMarkerSpacing = assets.js.core.controller.TLViewController.markerSpacingView[self.timeline.storySpacingType].markerSpacing;
		self.timeline.markerSpacingObj = assets.js.core.controller.TLViewController.markerSpacingView[self.timeline.storySpacingType];
		self.mainController.updateViewsWithNewDateRangeAndZoom({
			zoom : self.timeline.zoom
		});
		self.mainController.flushSize();
	}
});