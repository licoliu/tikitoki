$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.core.utils.Observable extends Object",

	"@Getter @Setter private observers" : [],
	"@Getter @Setter private observersOfType" : [],

	Observable : function() {
	},

	registerAsObserver : function(dataObj) {
		var self = this;
		var observer = dataObj.observer;
		self.observers = assets.js.core.utils.AJKHelpers.removeItemFromArray({
			anArray : self.observers,
			item : observer
		});
		self.observers.push(observer);
	},
	removeAsObserver : function(dataObj) {
		var self = this;
		var observer = dataObj.observer;
		self.observers = assets.js.core.utils.AJKHelpers.removeItemFromArray({
			anArray : self.observers,
			item : observer
		});
	},

	registerAsObserverOfType : function(dataObj) {
		var self = this;
		var observer = dataObj.observer;
		var type = dataObj.type;
		if (!self.observersOfType[type]) {
			self.observersOfType[type] = new Array();
		} else {
			self.observersOfType[type] = assets.js.core.utils.AJKHelpers.removeItemFromArray({
				anArray : self.observersOfType[type],
				item : observer
			});
		}
		self.observersOfType[type].push(observer);
	},
	removeAsObserverOfType : function(dataObj) {
		var self = this;
		var observer = dataObj.observer;
		var type = dataObj.type;
		if (self.observersOfType[type]) {
			self.observersOfType[type] = assets.js.core.utils.AJKHelpers.removeItemFromArray({
				anArray : self.observersOfType[type],
				item : observer
			});
		}
	}
});
