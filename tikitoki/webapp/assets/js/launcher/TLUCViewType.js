Class.forName({
	name : "class assets.js.launcher.TLUCViewType extends Object",
	"@Getter @Setter private controller" : null,
	"@Getter @Setter private initialised" : false,

	TLUCViewType : function(data) {
		this.controller = data.controller;
	},
	init : function() {
		var self = this;
		return self;
	},
	initialise : function() {
		var self = this;
		self.domItems = $("#tl-uc-view-type-block li").get();
		self.mainController = theTLMainController;
		self.timeline = theTLMainController.timeline;
		self.viewTypes = theTLMainController.viewTypes;
		self.selectedView = self.timeline.viewTypeValue;
		$(self.domItems).click(function() {
			self.updateViewTo({
				view : $(this).attr("view")
			});
			return false;
		});
		self.initialised = true;
	},
	updateView : function() {
		var self = this;
		if (self.initialised) {
			self.selectItem({
				item : self.timeline.viewTypeValue
			});
		}
	},
	prepareForView : function() {
		var self = this;
		if (!self.initialised) {
			self.initialise();
		}
		self.selectItem({
			item : self.timeline.viewTypeValue
		});
	},
	updateViewTo : function(data) {
		var self = this;
		var view = data.view;
		if (view != self.selectedView) {
			self.selectItem({
				item : view
			});
			self.selectedView = view;
			self.timeline.viewTypeValue = view;
			self.timeline.viewType = self.viewTypes[view];
			self.controller.refreshTimelineView();
		}
		if (self.controller.blockControllers[1].activeCounter > 0) {
			$.each(self.mainController.markers, function() {
				if (!this.category || self.timeline.categoriesByKey[self.mainController.categoriesKeyPrefix + this.category.id].hide) {
					$(this.domSliderPoint).css({
						visibility : "hidden"
					});
				}
			});
		}
	},
	selectItem : function(data) {
		var self = this;
		var item = data.item;
		$(self.domItems).removeClass("selected");
		$(self.domItems[item]).addClass("selected");
	}
});