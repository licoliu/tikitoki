$import("assets.js.core.utils.Observable");
$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.core.event.AJKEvent extends assets.js.core.utils.Observable",

	"@Getter @Setter private active" : false,

	AJKEvent : function() {

	},

	"public abstract startEvent" : function() {
	},
	"public abstract endEvent" : function() {
	},

	registerAsObserver : function(dataObj) {
		var self = this;
		var observer = dataObj.observer;
		self.observers = assets.js.core.utils.AJKHelpers.removeItemFromArray({
			anArray : self.observers,
			item : observer
		});
		self.observers.push(observer);
		if (!self.active) {
			self.startEvent();
		}
	},
	removeAsObserver : function(dataObj) {
		var self = this;
		var observer = dataObj.observer;
		self.observers = assets.js.core.utils.AJKHelpers.removeItemFromArray({
			anArray : self.observers,
			item : observer
		});
		if (self.observers.length == 0) {
			self.endEvent();
		}
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
