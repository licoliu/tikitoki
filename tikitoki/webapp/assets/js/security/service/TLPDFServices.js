Class.forName({
	name : "class assets.js.security.service.TLPDFServices extends Object",
	TLPDFServices : function(data) {
		var self = this;
		self.controller = data.controller;
		self.timeline = self.controller.timeline;
		self.domLaunchButton = $("#tl-ah-pdf-timeline").get()[0];
		self.domContent = $("#tl-ah-pdf-panel").get()[0];
		self.imageModeUrl = "http://" + TLTimelineData.host + "/timeline/imagemode/" + self.timeline.id + "/" + self.timeline.urlFriendlyTitle + "/";
	},
	init : function() {
		var self = this;
		if ($.browser.isMac) {
			$(self.domContent).addClass("tl-ah-show-mac-content");
		}
		var lightbox = "";
		$(self.domLaunchButton).click(function() {
			if (!lightbox) {
				lightbox = new TLAdminLightbox({
					domClass : "tl-ah-embed-lightbox",
					title : TLConfigText["pdf_panel_title"],
					intro : TLConfigText["pdf_panel_intro"],
					domContent : self.domContent
				}).init();
				$(self.domContent).find(".tl-ah-pdf-web-link").text(self.imageModeUrl);
			}
			lightbox.openPanel();
			return false;
		});
		return self;
	}
});