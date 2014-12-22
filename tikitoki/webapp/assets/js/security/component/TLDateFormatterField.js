Class.forName({
	name : "class assets.js.security.component.TLDateFormatterField extends Object",

	TLDateFormatterField : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.domInput = $(data.domRoot).find("input").get()[0];
		self.domSelect = "";
		self.verifier = data.verifier;
		self.fieldName = $(self.domInput).attr("name");
	},
	init : function() {
		var self = this;
		self.domSelect = self.createSelect();
		$(self.domRoot).find(".tl-ah-input").before(self.domSelect);
		$(self.domInput).change(function() {
			$(self.domSelect).val($(this).val());
		});
		$(self.domInput).keyup(function() {
			$(self.domSelect).val($(this).val());
		});
		$(self.domSelect).change(function() {
			if (self.verifier) {
				var data = {};
				data[self.fieldName] = $(this).val();
				self.verifier.setFieldValues({
					fieldValues : data,
					forceChangeEvent : true
				});
			} else {
				$(self.domInput).val($(this).val());
			}
		});
		return self;
	},
	updateFromFieldValue : function() {
		var self = this;
		$(self.domSelect).val($(self.domInput).val());
	},
	createSelect : function() {
		var self = this;
		var insertHTML = '<select>';
		$.each(TLConfigText["dateFormatting_items"], function() {
			insertHTML += '<option value="' + this[0] + '">' + this[1] + '</option>';
		});
		insertHTML += '</select>';
		return $(insertHTML).get()[0];
	}
});