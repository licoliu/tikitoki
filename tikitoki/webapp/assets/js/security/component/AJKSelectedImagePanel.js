Class.forName({
	name : "class assets.js.security.component.AJKSelectedImagePanel extends Object",
	AJKSelectedImagePanel : function(data) {
		var self = this;
		self.positionImageFunc = data.positionImageFunc;
		self.newImageFunc = data.newImageFunc;
		self.lightbox = "";
		self.domContent = "";
		self.domImageHolder = "";
		self.showPosClass = "tl-ah-fis-show-positioning";
	},
	init : function() {
		var self = this;
		self.initialiseContent();
		self.lightbox = new TLAdminLightbox({
			domClass : "tl-ah-selected-image-lightbox",
			title : "",
			intro : "",
			domContent : self.domContent
		}).init();
		return self;
	},
	initialiseContent : function() {
		var self = this;
		var insHTML = '<div><div class="tl-ah-fis-selected-image-holder ajk-fis-item-selected-image-holder">';
		insHTML += '<div class="tl-ah-fis-selected-image ajk-fis-item-selected-image"></div>';
		insHTML += '<div class="ajk-fis-selected-message tl-fis-selected-message">';
		insHTML += '<p>You have this image selected. Close panel or choose <a class="tl-ah-fis-new-image-link" href="#">new image</a></p>';
		insHTML += '</div>';
		insHTML += '</div>';
		insHTML += '<a id="tl-ah-image-position-panel-launch" class="tl-ah-field-option" href="#">Image positioning</a></div>';
		self.domContent = $(insHTML).get()[0];
		self.domImageHolder = $(self.domContent).find(".tl-ah-fis-selected-image").get()[0];
		$(self.domContent).find(".tl-ah-fis-new-image-link").click(function() {
			self.close();
			self.newImageFunc();
			return false;
		});
	},
	openPanelWithImage : function(data) {
		var self = this;
		var src = data.src;
		var positionable = data.positionable;
		$(self.domImageHolder).empty().append('<img src="' + src + '" />');
		if (positionable) {
			$(self.domContent).addClass(self.showPosClass);
		} else {
			$(self.domContent).removeClass(self.showPosClass);
		}
		self.lightbox.openPanel();
	},
	open : function() {
		var self = this;
		self.lightbox.openPanel();
	},
	close : function() {
		var self = this;
		self.lightbox.closePanel();
	}
});