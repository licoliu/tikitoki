Class.forName({
	name : "class assets.js.security.controller.AJKSwitchBlockController extends Object",
	AJKSwitchBlockController : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.switchClass = data.switchClass;
		self.switchSelectedClass = data.switchSelectedClass;
		self.blocks = new Array();
	},
	init : function() {
		var self = this;
		$(self.domRoot).find("." + self.switchClass).each(function() {
			var blockId = $(this).attr("blockId");
			var domBlock = $("#" + blockId).get()[0];
			var thisBlock = {
				domBlock : domBlock,
				id : blockId,
				domSwitch : this,
				isOpen : false
			};
			self.blocks.push(thisBlock);
			if ($(this).hasClass(self.switchSelectedClass)) {
				self.showBlock({
					block : thisBlock
				});
			}
			$(this).click(function() {
				if (thisBlock.isOpen) {
					self.hideBlock({
						block : thisBlock
					});
				} else {
					self.showBlock({
						block : thisBlock
					});
				}
				return false;
			});
		});
		return self;
	},
	showBlock : function(data) {
		var self = this;
		var block = data.block;
		$(block.domBlock).css({
			display : "block"
		});
		block.isOpen = true;
		$(block.domSwitch).addClass(self.switchSelectedClass);
	},
	hideBlock : function(data) {
		var self = this;
		var block = data.block;
		$(block.domBlock).css({
			display : "none"
		});
		block.isOpen = false;
		$(block.domSwitch).removeClass(self.switchSelectedClass);
	}
});