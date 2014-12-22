Class.forName({
	name : "class assets.js.security.component.AJKImageUrlSelector extends Object",
	AJKImageUrlSelector : function(data) {
		var self = this;
		self.domRoot = "";
		self.lightbox = "";
		self.imageSelectedFunc = data.imageSelectedFunc;
		self.domContent = $("#ft-ah-imglink-panel").get()[0];
		self.domInput = $(self.domContent).find("input").get()[0];
		self.domButton = $(self.domContent).find(".button").get()[0];
		self.domImage = $(self.domContent).find("img").get()[0];
	},
	init : function() {
		var self = this;
		self.lightbox = new TLAdminLightbox({
			domClass : "tl-ah-url-image-lightbox",
			title : TLConfigText['imageURLSelect_title'],
			intro : TLConfigText['imageURLSelect_intro'],
			domContent : self.domContent
		}).init();
		self.domRoot = self.lightbox.domRoot;
		$(self.domButton).click(function() {
			var imgSrc = self.processUrl({
				url : $(self.domInput).val()
			});
			self.imageSelectedFunc({
				src : imgSrc
			});
			return false;
		});
		return self;
	},
	processUrl : function(data) {
		var self = this;
		var url = data.url;
		if (url && url.indexOf("http://") == -1 && url.indexOf("https://") == -1) {
			url = "http://" + url;
		}
		return url;
	},
	launch : function(data) {
		var self = this;
		var domContentField = data.domContentField;
		var curImage = $(domContentField).val();
		$(self.domInput).val(curImage);
		if (curImage && (curImage.indexOf("http://") != -1 || curImage.indexOf("https://") != -1)) {
			self.domImage.src = curImage;
		} else {
			self.domImage.src = "assets/ui/empty-image.gif";
		}
		self.lightbox.openPanel();
	},
	close : function() {
		var self = this;
		self.lightbox.closePanel();
	}
});