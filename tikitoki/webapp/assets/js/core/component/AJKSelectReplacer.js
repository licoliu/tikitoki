Class.forName({
	name : "class assets.js.core.component.AJKSelectReplacer extends Object",

	AJKSelectReplacer : function(data) {
		var self = this;
		self.domRoot = "";
		self.domSelect = data.domSelect;
		self.createItemFunc = data.createItemFunc;
		self.itemSelectedClass = data.itemSelectedClass;
		self.changeFunc = data.changeFunc;
		self.items = new Array();
		self.keyPrefix = "ajk-sr-";
		self.itemsByValKey = new Array();
		self.selectedItem = "";
		self.alreadyCreated = false;
	},
	init : function() {
		var self = this;
		$(self.domSelect).css({
			display : "none"
		});
		self.generateItems();
		return self;
	},
	generateItems : function() {
		var self = this;
		self.domRoot = $("<div></div>").get()[0];
		var counter = 0;
		$(self.domSelect).find("option").each(function() {
			var thisVal = $(this).val();
			var thisText = $(this).text();
			var thisDomItem = self.createItemFunc({
				val : thisVal,
				text : thisText
			});
			var thisItem = {
				index : counter++,
				domEl : thisDomItem,
				val : thisVal,
				text : thisText
			};
			if (!self.selectedItem && $(this).attr("selected") == true) {
				self.selectedItem = thisItem;
				$(thisDomItem).addClass(self.itemSelectedClass);
			}
			self.items.push(thisItem);
			self.itemsByValKey[self.keyPrefix + thisItem.val] = thisItem;
			$(thisDomItem).click(function() {
				if (thisItem != self.selectedItem) {
					self.selectItem({
						item : thisItem
					});
					$(self.domSelect).val(thisItem.val).change();
				}
				return false;
			});
			$(self.domRoot).append(thisDomItem);
		});
		$(self.domSelect).after(self.domRoot);
		if (!self.alreadyCreated) {
			$(self.domSelect).change(function() {
				var thisVal = $(this).val();
				var newItem = self.itemsByValKey[self.keyPrefix + thisVal];
				if (self.selectedItem != newItem) {
					self.selectItem({
						item : newItem
					});
				}
			});
		}
		self.alreadyCreated = true;
	},
	selectItem : function(data) {
		var self = this;
		var item = data.item;
		$(self.selectedItem.domEl).removeClass(self.itemSelectedClass);
		$(item.domEl).addClass(self.itemSelectedClass);
		self.selectedItem = item;
		$(self.domSelect).val(item.val);
	},
	selectItemFromVal : function(data) {
		var self = this;
		var val = data.val;
		var item = self.itemsByValKey[self.keyPrefix + val];
		if (item && item != self.selectedItem) {
			self.selectItem({
				item : item
			});
		}
	},
	destroy : function() {
		var self = this;
		$(self.domRoot).remove();
		self.domRoot = "";
		self.items = "";
		self.itemsByValKey = "";
	},
	refresh : function() {
		var self = this;
		self.destroy();
		self.items = [];
		self.itemsByValKey = [];
		self.generateItems();
	}
});