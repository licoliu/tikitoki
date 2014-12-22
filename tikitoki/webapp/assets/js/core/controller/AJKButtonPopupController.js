$import("assets.js.core.component.AJKButtonPopup");

Class.forName({
	name : "class assets.js.core.controller.AJKButtonPopupController extends Object",

	AJKButtonPopupController : function(data) {
		this.domButtons = data.domButtons;
		this.buttonPopups = new Array();
		this.buttonPopupsByKey = new Array();
		this.selectedPopup = "";
		this.observers = new Array();
		this.adjustFunc = (data.adjustFunc) ? data.adjustFunc : function() {
			return 0;
		};
	},
	init : function() {
		var self = this;
		$(self.domButtons).each(function() {
			var popupId = $(this).attr("popupId");
			if (popupId) {
				var aButtonPopup = new assets.js.core.component.AJKButtonPopup({
					domRootEl : $("#" + popupId).get()[0],
					domButton : this,
					controller : self,
					id : popupId
				}).init();
				self.buttonPopups.push(aButtonPopup);
				self.buttonPopupsByKey[popupId] = aButtonPopup;
				$(this).click(function() {
					if (self.selectedPopup == aButtonPopup) {
						aButtonPopup.hide();
						self.popupDidClose();
					} else {
						aButtonPopup.display();
						if (self.selectedPopup) {
							self.selectedPopup.hide();
							self.popupDidClose();
						}
						self.selectedPopup = aButtonPopup;
						self.popupDidOpen();
					}
					return false;
				});
			}
		});
		return self;
	},
	popupDidOpen : function() {
		var self = this;
		if (self.observers[self.selectedPopup.id]) {
			$.each(self.observers[self.selectedPopup.id], function() {
				if (this.buttonPopupDidOpen) {
					this.buttonPopupDidOpen({
						popup : self.selectedPopup
					});
				}
			});
		}
		theAJKKeyEvent.registerAsObserver({
			observer : self
		});
	},
	popupDidClose : function() {
		var self = this;
		if (self.observers[self.selectedPopup.id]) {
			$.each(self.observers[self.selectedPopup.id], function() {
				if (this.buttonPopupDidClose) {
					this.buttonPopupDidClose({
						popup : self.selectedPopup
					});
				}
			});
		}
		self.selectedPopup = "";
		theAJKKeyEvent.removeAsObserver({
			observer : self
		});
	},
	registerAsObserverOfType : function(dataObj) {
		var self = this;
		var type = dataObj.type;
		var observer = dataObj.observer;
		if (!self.observers[type]) {
			self.observers[type] = new Array();
		}
		self.observers[type].push(observer);
	},
	keyEventTookPlace : function(dataObj) {
		var self = this;
		var key = dataObj.key;
		if (key == 27 && self.selectedPopup) {
			self.selectedPopup.hide();
			self.popupDidClose();
		}
	},
	forceOpenPopupOfType : function(dataObj) {
		var self = this;
		var type = dataObj.type;
		if (!self.buttonPopupsByKey[type].open) {
			$(self.buttonPopupsByKey[type].domButton).click();
		}
	},
	forceClosePopupOfType : function(dataObj) {
		var self = this;
		var type = dataObj.type;
		if (self.buttonPopupsByKey[type].open) {
			$(self.buttonPopupsByKey[type].domButton).click();
		}
	}
});