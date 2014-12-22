Class.forName({
	name : "class assets.js.security.component.TLStoryEditButton extends Object",

	TLStoryEditButton : function(data) {
		var self = this;
		self.selectedStory = "";
		self.domRoot = "";
		self.callback = data.callback;
		self.controller = data.controller;
		self.mainController = self.controller.mainController;
	},
	init : function() {
		var self = this;
		return self;
	},
	showForStory : function(data) {
		var self = this;
		var story = data.story;
		if (story.uneditable) {
			return;
		}
		self.selectedStory = story;
		if (!self.domRoot) {
			self.generate();
		}
		var view3D = self.mainController.selected3DView;
		if (view3D.active) {
			var info3D = self.selectedStory.marker3DScreenInfo;
			if (info3D.timelinePos.y > view3D.moreInfoCutOff) {
				$(self.dom3DRoot).css({
					left : info3D.x,
					top : info3D.y
				});
				$(self.mainController.domStageHolder).prepend(self.dom3DRoot);
			}
		} else {
			$(story.domRoot).prepend(self.domRoot);
		}
	},
	remove : function() {
		var self = this;
		$(self.domRoot).detach();
		$(self.dom3DRoot).detach();
		self.selectedStory = "";
	},
	generate : function() {
		var self = this;
		self.domRoot = $('<div class="tl-st-edit-button">Edit story</div>').get()[0];
		self.dom3DRoot = $('<div class="tl-st-edit-button tl-st-edit-button-3d">Edit story</div>').get()[0];
		$([ self.domRoot, self.dom3DRoot ]).click(function() {
			self.callback({
				story : self.selectedStory
			});
			return false;
		});
		$(self.dom3DRoot).mousemove(function(e) {
			e.stopPropagation();
		});
	}
});