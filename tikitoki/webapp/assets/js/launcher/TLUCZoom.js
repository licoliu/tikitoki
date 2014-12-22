$import("assets.js.core.component.AJKSelectReplacer");

Class.forName({
	name : "class assets.js.launcher.TLUCZoom extends Object",
	"@Getter @Setter private controller" : null,
	"@Getter @Setter private initialised" : false,

	TLUCZoom : function(data) {
		this.controller = data.controller;
	},
	init : function() {
		var self = this;
		return self;
	},
	initialise : function() {
		var self = this;
		self.mainController = theTLMainController;
		self.timeline = theTLMainController.timeline;
		self.domRoot = $("#tl-uc-zoom-block").get()[0];
		self.zoomSelect = $(self.domRoot).find("select").get()[0];
		var iHTML = "";
		$.each(self.mainController.selectedView.availableScales, function() {
			iHTML += '<option value="' + this.name + '">' + this.name + '</option>';
		});
		$(self.zoomSelect).empty().append(iHTML);
		var itemCounter = 0;
		self.zoomSelectReplacer = new assets.js.core.component.AJKSelectReplacer({
			domSelect : self.zoomSelect,
			createItemFunc : function(data) {
				var val = data.val;
				var text = data.text;
				var domZoomItem = $('<a pos="' + itemCounter + '" class="tl-ah-zoom-item" href="#">' + text + '</a>').get()[0];
				itemCounter++;
				return domZoomItem;
			},
			itemSelectedClass : "tl-ah-zoom-item-selected"
		}).init();
		$(self.zoomSelect).unbind("change").change(function() {
			self.updateZoomTo({
				zoom : $(this).val()
			});
		});
		$(self.domRoot).find(".zoom-buttons a").unbind("click").click(function() {
			if ($(this).text() == "+") {
				self.zoom({
					zoomIn : true
				});
			} else {
				self.zoom({
					zoomOut : true
				});
			}
			return false;
		});
		self.initialised = true;
	},
	updateView : function() {
		var self = this;
		if (self.initialised) {
			self.zoomSelectReplacer.selectItemFromVal({
				val : self.timeline.zoom
			});
		}
	},
	zoom : function(data) {
		var self = this;
		var cPos = $(self.domRoot).find(".tl-ah-zoom-item-selected").attr("pos");
		if (data.zoomIn) {
			cPos++;
		} else {
			cPos--;
		}
		if (self.mainController.selectedView.availableScales[cPos]) {
			self.updateZoomTo({
				zoom : self.mainController.selectedView.availableScales[cPos].name
			});
			self.zoomSelectReplacer.selectItemFromVal({
				val : self.timeline.zoom
			});
		}
	},
	updateZoomTo : function(data) {
		var self = this;
		self.mainController.updateViewsWithNewDateRangeAndZoom({
			zoom : data.zoom
		});
	},
	prepareForView : function() {
		var self = this;
		if (!self.initialised) {
			self.initialise();
		}
		self.zoomSelectReplacer.selectItemFromVal({
			val : self.timeline.zoom
		});
	}
});