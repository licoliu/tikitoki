Class.forName({
	name : "class assets.js.security.controller.AJKTabBlockController extends Object",
	AJKTabBlockController : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.tabMenuOptionClass = data.tabMenuOptionClass;
		self.tabSelectedClass = data.tabSelectedClass;
		self.selectedBlock = "";
		self.blocks = new Array();
	},
	init : function() {
		var self = this;
		$(self.domRoot).find("." + self.tabMenuOptionClass).each(function() {
			var tabId = $(this).attr("tabId");
			var domBlock = $("#" + tabId).get()[0];
			var thisBlock = {
				domBlock : domBlock,
				id : tabId,
				domTab : this
			};
			self.blocks.push(thisBlock);
			if ($(this).hasClass(self.tabSelectedClass)) {
				self.showBlock({
					block : thisBlock
				});
			}
			$(this).click(function(e) {
				self.showBlock({
					block : thisBlock
				});
				e.preventDefault();
			});
		});
		return self;
	},
	showBlock : function(data) {
		var self = this;
		var block = data.block;
		if (block != self.selectedBlock) {
			self.hideBlock({
				block : self.selectedBlock
			});
			$(block.domBlock).css({
				display : "block"
			});
			$(block.domTab).addClass(self.tabSelectedClass);
			self.selectedBlock = block;
		}
	},
	hideBlock : function(data) {
		var self = this;
		var block = data.block;
		if (block) {
			$(block.domBlock).css({
				display : "none"
			});
			$(block.domTab).removeClass(self.tabSelectedClass);
		}
	}
});