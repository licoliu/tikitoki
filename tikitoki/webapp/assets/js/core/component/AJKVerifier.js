$import("assets.js.core.component.AJKVerifierField");
Class.forName({
	name : "class assets.js.core.component.AJKVerifier extends Object",

	AJKVerifier : function(data) {
		this.domRootEl = data.domRootEl;
		this.domFields = $(this.domRootEl).find(".ajk-verifier-field").get();
		this.domSubmitButton = $(this.domRootEl).find(".ajk-verifier-submit").get()[0];
		this.domCancelButton = $(this.domRootEl).find(".ajk-verifier-cancel").get()[0];
		this.domRevertButton = $(this.domRootEl).find(".ajk-verifier-revert").get()[0];
		this.domTooltipDisplay = $(this.domRootEl).find(".ajk-verifier-tooltip-displayer").get()[0];
		this.domErrorMessage = $(this.domRootEl).find(".ajk-verifier-error-message").get()[0];
		this.domSuccessMessage = $(this.domRootEl).find(".ajk-verifier-success-message").get()[0];
		this.defaultErrorMessage = $(this.domErrorMessage).text();
		this.submitFunc = data.submitFunc;
		this.cancelFunc = data.cancelFunc;
		this.revertFunc = data.revertFunc;
		this.objFields = new Array();
		this.objFieldsByKey = new Array();
		this.numFields = this.domFields.length;
		this.onChangeCallback = "";
		this.onKeyUpCallback = "";
		this.savedFieldValues = "";
		this.disableSaveAndRevertClass = "ajk-verifier-disable-save-and-revert";
		self.saveAndRevertDisabled = false;
		return this;
	},
	init : function() {
		var self = this;
		$(this.domRootEl).find("form").each(function() {
			$(this).submit(function() {
				return false;
			});
		});
		var counter = 0;
		$.each(self.domFields, function() {
			var isLast = (++counter == self.numFields) ? true : false;
			var aNewField = new assets.js.core.component.AJKVerifierField({
				domRootEl : this,
				isLast : isLast,
				fieldHoverFunc : function(data) {
					self.displayTooltip(data);
				},
				clearAllErrorsFunc : function(data) {
					self.clearAllErrors(data);
				},
				controller : self
			}).init();
			self.objFields.push(aNewField);
			self.objFieldsByKey[aNewField.fieldName] = aNewField;
		});
		if (!self.domErrorMessage) {
			self.hideErrorMessage = function() {
			};
			self.displayErrorMessage = function() {
			};
		}
		if (!self.domTooltipDisplay) {
			self.displayTooltip = function() {
			};
		}
		$(self.domSubmitButton).click(function() {
			self.attemptToSubmit();
			return false;
		});
		$(self.domCancelButton).click(function() {
			if (self.cancelFunc) {
				self.cancelFunc();
			}
			return false;
		});
		$(self.domRevertButton).click(function() {
			if (self.revertFunc && !self.saveAndRevertDisabled) {
				self.revertFunc();
				self.clearAllErrors();
			}
			return false;
		});
		return self;
	},
	fireButton : function(data) {
		var self = this;
		var buttonType = data.buttonType;
		switch (buttonType) {
		case "revert":
			$(self.domRevertButton).click();
			break;
		case "save":
			$(self.domSubmitButton).click();
			break;
		case "cancel":
			$(self.domCancelButton).click();
			break;
		}
	},
	showCancelButton : function() {
		var self = this;
		if (self.domCancelButton) {
			$(self.domCancelButton).css({
				display : "block"
			});
		}
	},
	showRevertButton : function() {
		var self = this;
		if (self.domRevertButton) {
			$(self.domRevertButton).css({
				display : "block"
			});
		}
	},
	hideCancelButton : function() {
		var self = this;
		if (self.domCancelButton) {
			$(self.domCancelButton).css({
				display : "none"
			});
		}
	},
	hideRevertButton : function() {
		var self = this;
		if (self.domRevertButton) {
			$(self.domRevertButton).css({
				display : "none"
			});
		}
	},
	enableSaveAndRevert : function() {
		var self = this;
		$(self.domRootEl).removeClass(self.disableSaveAndRevertClass);
		self.saveAndRevertDisabled = false;
	},
	disableSaveAndRevert : function() {
		var self = this;
		$(self.domRootEl).addClass(self.disableSaveAndRevertClass);
		self.saveAndRevertDisabled = true;
	},
	setFieldValues : function(data) {
		var self = this;
		var fieldValues = data.fieldValues;
		var forceChangeEvent = data.forceChangeEvent;
		for ( var fieldName in fieldValues) {
			if (self.objFieldsByKey[fieldName]) {
				var oldValue = self.objFieldsByKey[fieldName].getValue();
				self.objFieldsByKey[fieldName].forceSetValue({
					value : fieldValues[fieldName]
				});
				if (forceChangeEvent == "auto") {
					if (oldValue != fieldValues[fieldName]) {
						self.fieldDidChange({
							fieldName : fieldName,
							fieldValue : self.objFieldsByKey[fieldName].fieldValue
						});
					}
				} else if (forceChangeEvent) {
					self.fieldDidChange({
						fieldName : fieldName,
						fieldValue : self.objFieldsByKey[fieldName].fieldValue
					});
				}
			}
		}
	},
	getFieldValueFromName : function(data) {
		var self = this;
		var fieldName = data.fieldName;
		return self.objFieldsByKey[fieldName].getValue();
	},
	attemptToSubmit : function() {
		var self = this;
		if (self.saveAndRevertDisabled) {
			return false;
		}
		if (self.verifyFields()) {
			self.submit();
		} else {
			self.displayErrorMessage({
				message : self.defaultErrorMessage
			});
		}
	},
	errorHighlightField : function(data) {
		var self = this;
		var fieldName = data.fieldName;
		self.objFieldsByKey[fieldName].highlightError();
	},
	displayErrorMessage : function(data) {
		var self = this;
		var message = data.message;
		$(self.domErrorMessage).html(message).css({
			display : "block"
		});
		self.hideSuccessMessage();
	},
	hideErrorMessage : function(data) {
		var self = this;
		$(self.domErrorMessage).css({
			display : "none"
		});
	},
	displaySuccessMessage : function(data) {
		var self = this;
		if (self.domSuccessMessage) {
			$(self.domSuccessMessage).css({
				display : "block"
			});
		}
	},
	hideSuccessMessage : function(data) {
		var self = this;
		if (self.domSuccessMessage) {
			$(self.domSuccessMessage).css({
				display : "none"
			});
		}
	},
	clearAllErrors : function() {
		var self = this;
		self.hideErrorMessage();
		self.hideSuccessMessage();
		$.each(self.objFields, function() {
			this.clearError();
		});
	},
	displayTooltip : function(data) {
		var self = this;
		var tooltipText = data.tooltipText;
		if (tooltipText) {
			$(self.domTooltipDisplay).html(tooltipText).css({
				display : "block"
			});
		} else {
			$(self.domTooltipDisplay).html(tooltipText).css({
				display : "none"
			});
		}
	},
	verifyFields : function() {
		var self = this;
		var failedFields = 0;
		$.each(self.objFields, function() {
			if (!this.verify()) {
				failedFields++;
				this.highlightError();
			}
		});
		return (failedFields == 0);
	},
	ensureValidColorHex : function(data) {
		var self = this;
		var thisVal = data.colorHex;
		var regTxt = (/^(#)?([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/);
		if (thisVal && regTxt.test(thisVal)) {
			return thisVal.replace("#", "");
		} else {
			return "999999";
		}
	},
	submit : function() {
		var self = this;
		if (self.saveAndRevertDisabled) {
			return false;
		}
		$.each(self.objFields, function() {
			this.blur();
		});
		var fieldData = new Object();
		self.displaySuccessMessage();
		$.each(self.objFields, function() {
			var thisVal = this.fieldValue;
			if (thisVal && thisVal.replace) {
				if (this.controlType == "input text") {
					thisVal = thisVal.replace(/[\n\r]/g, "");
				}
				thisVal = thisVal.replace(/[\t]/g, "");
				thisVal = thisVal.replace(/\x18/g, "");
				thisVal = thisVal.replace(/\u2028/g, "");
				thisVal = thisVal.replace(/\u2029/g, "");
			}
			if (this.colorPicker) {
				thisVal = self.ensureValidColorHex({
					colorHex : thisVal
				});
			}
			fieldData[this.fieldName] = thisVal;
		});
		self.submitFunc({
			fieldData : fieldData
		});
	},
	saveFieldValues : function() {
		var self = this;
		self.savedFieldValues = {};
		$.each(self.objFields, function() {
			self.savedFieldValues[this.fieldName] = this.fieldValue;
		});
	},
	clearSavedFieldValues : function() {
		var self = this;
		self.savedFieldValues = {};
		$.each(self.objFields, function() {
			self.savedFieldValues[this.fieldName] = "";
		});
	},
	restoreSavedFieldValues : function() {
		var self = this;
		if (self.savedFieldValues) {
			self.setFieldValues({
				fieldValues : self.savedFieldValues,
				forceChangeEvent : "auto"
			});
		}
		self.disableSaveAndRevert();
	},
	restoreOldValueForField : function(data) {
		var self = this;
		var fieldName = data.fieldName;
		self.objFieldsByKey[fieldName].forceSetValue({
			value : self.objFieldsByKey[fieldName].oldFieldValue
		});
		if (!self.areValuesDifferentFromSavedValues()) {
			self.disableSaveAndRevert();
		}
	},
	restoreSavedValueForField : function(data) {
		var self = this;
		var fieldName = data.fieldName;
		if (self.savedFieldValues && self.savedFieldValues[fieldName]) {
			self.objFieldsByKey[fieldName].forceSetValue({
				value : self.savedFieldValues[fieldName]
			});
			self.fieldDidChange({
				fieldName : fieldName,
				fieldValue : self.objFieldsByKey[fieldName].fieldValue
			});
			if (!self.areValuesDifferentFromSavedValues()) {
				self.disableSaveAndRevert();
			}
		}
	},
	clearFields : function() {
		var self = this;
		$.each(self.objFields, function() {
			this.clear();
		});
	},
	fieldDidChange : function(data) {
		var self = this;
		var fieldName = data.fieldName;
		var fieldValue = data.fieldValue;
		if (self.onChangeCallback) {
			self.onChangeCallback({
				fieldName : fieldName,
				fieldValue : fieldValue
			});
		}
		if (self.areValuesDifferentFromSavedValues()) {
			self.enableSaveAndRevert();
		} else {
			self.disableSaveAndRevert();
		}
	},
	fieldDidKeyUp : function(data) {
		var self = this;
		var fieldName = data.fieldName;
		var fieldValue = data.fieldValue;
		if (self.onKeyUpCallback) {
			self.onKeyUpCallback({
				fieldName : fieldName,
				fieldValue : fieldValue
			});
		}
		if (self.areValuesDifferentFromSavedValues()) {
			self.enableSaveAndRevert();
		} else {
			self.disableSaveAndRevert();
		}
	},
	areValuesDifferentFromSavedValues : function() {
		var self = this;
		if (self.savedFieldValues) {
			var difference = false;
			$.each(self.objFields, function() {
				if (this.getValue() != self.savedFieldValues[this.fieldName]) {
					difference = true;
				}
			});
			return difference;
		} else {
			return true;
		}
	}
});