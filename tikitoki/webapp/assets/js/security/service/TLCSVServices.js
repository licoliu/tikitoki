Class.forName({
	name : "class assets.js.security.service.TLCSVServices extends Object",

	TLCSVServices : function(data) {
		var self = this;
		self.domLaunchButton = $("#tl-ah-csv-timeline").get()[0];
		self.domExportButton = $("#tl-ah-export-csv-button").get()[0];
		self.domContent = $("#tl-ah-csv-panel").get()[0];
		self.domDownloadingMessage = $("#tl-ah-csv-downloading-message").get()[0];
	},
	init : function() {
		var self = this;
		var lightbox = "";
		$(self.domLaunchButton).click(function() {
			if (!lightbox) {
				$(self.domExportButton).click(function() {
					$(self.domDownloadingMessage).css({
						display : "block"
					});
					$(self.domExportButton).css({
						display : "none"
					});
				});
				lightbox = new TLAdminLightbox({
					domClass : "tl-ah-embed-lightbox",
					title : TLConfigText["csv_panel_title"],
					intro : TLConfigText["csv_panel_intro"],
					domContent : self.domContent
				}).init();
			}
			$(self.domDownloadingMessage).css({
				display : "none"
			});
			$(self.domExportButton).css({
				display : "block"
			});
			lightbox.openPanel();
			return false;
		});
		return self;
	}
});