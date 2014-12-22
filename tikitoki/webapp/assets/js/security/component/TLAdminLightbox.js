Class.forName({
	name : "class assets.js.security.component.TLAdminLightbox extends Object",

	TLAdminLightbox : function(data) {
		var self = this;
		self.domClass = data.domClass;
		self.domContent = data.domContent;
		self.title = data.title;
		self.intro = data.intro;
		self.panelHeight = "";
		self.closeCallback = data.closeCallback;
	},
	"public static panelPrototype" : "",
	init : function() {
		var self = this;
		self.domRoot = $(TLAdminLightbox.panelPrototype).clone().get()[0];
		$(TLAdminLightbox.panelPrototype).after(self.domRoot);
		self.domFade = $(self.domRoot).find(".ajk-ah-fis-fade").get()[0];
		self.domMainTitle = $(self.domRoot).find(".ajk-fis-header-title").get()[0];
		self.domMainIntro = $(self.domRoot).find(".ajk-fis-header-intro").get()[0];
		self.domClose = $(self.domRoot).find(".ajk-fis-close").get()[0];
		self.domPanel = $(self.domRoot).find(".ajk-fis-panel").get()[0];
		if (self.domClass) {
			$(self.domRoot).addClass(self.domClass);
		}
		self.domPanelSpecificContent = $(self.domRoot).find(".tl-panel-specific-content").get()[0];
		$(self.domPanelSpecificContent).append(self.domContent);
		$(self.domMainTitle).html(self.title);
		if (!self.intro) {
			$(self.domMainIntro).css({
				display : "none"
			});
		} else {
			$(self.domMainIntro).html(self.intro);
		}
		$(self.domClose).click(function() {
			self.closePanel();
			return false;
		});
		$(self.domFade).click(function() {
			self.closePanel();
		});
		return self;
	},
	openPanel : function() {
		var self = this;

		theTLMainController.selected3DView.disableHover = true;

		theAJKWindowResizeEvent.registerAsObserver({
			observer : self
		});
		$(self.domRoot).css({
			visibility : "hidden",
			display : "block"
		});
		var viewportSize = AJKHelpers.viewportSize();
		self.sizeComponents({
			viewportSize : viewportSize
		});
		$(self.domRoot).css({
			visibility : "visible"
		});
		TLAdminLightbox.aBoxIsOpen = true;
	},
	closePanel : function() {
		var self = this;

		theTLMainController.selected3DView.disableHover = false;

		$(self.domRoot).css({
			display : "none"
		});
		theAJKWindowResizeEvent.removeAsObserver({
			observer : self
		});
		if (self.closeCallback) {
			self.closeCallback();
		}
		TLAdminLightbox.aBoxIsOpen = false;
	},
	windowDidResize : function(data) {
		var self = this;
		var newSize = data.newSize;
		self.sizeComponents({
			viewportSize : newSize
		});
	},
	sizeComponents : function(data) {
		var self = this;
		var viewportSize = data.viewportSize;
		$(self.domRoot).css({
			width : viewportSize.width,
			height : viewportSize.height
		});
		self.panelHeight = (self.panelHeight) ? self.panelHeight : $(self.domPanel).height();
		$(self.domPanel).css({
			top : parseInt(viewportSize.height - self.panelHeight) / 2
		});
	}
});