Class.forName({
	name : "class assets.js.security.controller.AJKScrollableListController extends Object",

	AJKScrollableListController : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.domStage = data.domStage;
		self.listItems = data.listItems;
		self.itemWasClickedFunc = data.itemWasClickedFunc;
		self.createDomListItemFunc = data.createDomListItemFunc;
		self.getPositionForListItem = data.getPositionForListItem;
		self.getKeyForListItem = data.getKeyForListItem;
		self.listItemSelectClass = data.listItemSelectClass;
		self.contentScroller = "";
		self.listItemClass = "ajk-scrollable-list-item";
		self.listIdString = "ajk-scrollable-list-item-";
		self.listIdInc = 1;
		self.listIdAttr = "ajkListItemId";
		self.listItemsByKey = new Array();
		self.numListItems = 0;
		self.domListItemsByListItemKey = new Array();
	},
	init : function() {
		var self = this;
		self.contentScroller = new AJKContentScrollerController({
			domRootEl : self.domRoot
		}).init();
		$(self.domStage).empty();
		$.each(self.listItems, function() {
			var domListItem = self.createDomListItem({
				listItem : this
			});
			$(self.domStage).append(domListItem);
		});
		self.contentScroller.enable();
		self.initialiseClickFunctionality();
		return self;
	},
	resetWithNewListItems : function(data) {
		var self = this;
		self.listItems = data.listItems;
		$(self.domStage).empty();
		self.domListItemsByListItemKey = new Array();
		self.numListItems = 0;
		$.each(self.listItems, function() {
			var domListItem = self.createDomListItem({
				listItem : this
			});
			$(self.domStage).append(domListItem);
		});
		self.contentScroller.reset();
		self.contentScroller.enable();
	},
	resetHeightTo : function(data) {
		var self = this;
		var height = data.height;
		$(self.domRoot).css({
			height : height
		});
		self.contentScroller.resetSize();
	},
	createDomListItem : function(data) {
		var self = this;
		var listItem = data.listItem;
		var listItemKey = self.getKeyForListItem({
			listItem : listItem
		});
		var domListItem = self.createDomListItemFunc({
			listItem : listItem
		});
		$(domListItem).addClass(self.listItemClass);
		var listId = self.listIdString + self.listIdInc++;
		$(domListItem).attr(self.listIdAttr, listId);
		self.listItemsByKey[listId] = listItem;
		self.domListItemsByListItemKey[listItemKey] = domListItem;
		self.numListItems++;
		return domListItem;
	},
	initialiseClickFunctionality : function() {
		var self = this;
		$(self.domStage).click(function(e) {
			var domListItem = AJKHelpers.getSelfOrFirstParantOfClass({
				domEl : e.target,
				className : self.listItemClass
			});
			if (domListItem) {
				var listItemId = $(domListItem).attr("ajkListItemId");
				var listItem = self.listItemsByKey[listItemId];
				self.itemWasClickedFunc({
					listItem : listItem,
					clickedElClass : e.target.className
				});
			}
			return false;
		});
	},
	addListItemAtIndex : function(data) {
		var self = this;
		var listItem = data.listItem;
		var index = data.index;
		index = (index == "last") ? self.numListItems : index;
		var domListItem = self.createDomListItem({
			listItem : listItem
		});
		if (index === 0 || self.numListItems === 0) {
			$(self.domStage).prepend(domListItem);
		} else {
			var prevDomListItem = $(self.domStage).find("." + self.listItemClass + ":eq(" + (index - 1) + ")").get()[0];
			$(prevDomListItem).after(domListItem);
		}
		self.refresh();
	},
	removeListItem : function(data) {
		var self = this;
		var listItem = data.listItem;
		var domListItem = self.getDomElForListItem({
			listItem : listItem
		});
		$(domListItem).remove();
		self.selectedListItem = (self.selectedListItem == listItem) ? "" : self.selectedListItem;
		var listItemKey = self.getKeyForListItem({
			listItem : listItem
		});
		self.domListItemsByListItemKey[listItemKey] = "";
		self.refresh();
	},
	selectListItem : function(data) {
		var self = this;
		var listItem = data.listItem;
		if (self.selectedListItem) {
			var domListItem = self.getDomElForListItem({
				listItem : self.selectedListItem
			});
			$(domListItem).removeClass(self.listItemSelectClass);
		}
		self.selectedListItem = listItem;
		var domListItem = self.getDomElForListItem({
			listItem : self.selectedListItem
		});
		$(domListItem).addClass(self.listItemSelectClass);
	},
	showAndSelectListItem : function(data) {
		var self = this;
		var listItem = data.listItem;
		var domListItem = self.getDomElForListItem({
			listItem : listItem
		});
		var instantly = data.instantly;
		var dlTop = AJKHelpers.getCoordsOfDomEl({
			domEl : domListItem
		}).y;
		var stageTop = AJKHelpers.getCoordsOfDomEl({
			domEl : self.domStage
		}).y;
		self.contentScroller.animateToPos({
			pos : (dlTop - stageTop),
			instantly : instantly
		});
		self.selectListItem({
			listItem : listItem
		});
	},
	getDomElForListItem : function(data) {
		var self = this;
		var listItem = data.listItem;
		var listItemKey = self.getKeyForListItem({
			listItem : listItem
		});
		var domListItem = self.domListItemsByListItemKey[listItemKey];
		return domListItem;
	},
	refresh : function() {
		var self = this;
		self.contentScroller.enable();
	}
});