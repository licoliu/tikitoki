$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.utils.AJKHelpers");
Class
		.forName({
			name : "class assets.js.core.component.AJKVerifierField extends Object",

			AJKVerifierField : function(data) {
				this.domRootEl = data.domRootEl;
				this.fieldHoverFunc = data.fieldHoverFunc;
				this.clearAllErrorsFunc = data.clearAllErrorsFunc;
				this.isLast = data.isLast;
				this.controller = data.controller;
				this.domFormat = "";
				this.domChars = "";
				this.domTooltip = "";
				this.domControl = "";
				this.tooltip = "";
				this.format = "";
				this.chars = "";
				this.defaultValue = "";
				this.controlType = "";
				this.fieldValue = "";
				this.fieldName = "";
				this.defaultValueOkay = "";
				this.valueOptions = "";
				this.colorPicker = false;
				this.oldFieldValue = "";
				return this;
			},
			init : function() {
				var self = this;
				self.domFormat = $(this.domRootEl).find(".ajk-verifier-format");
				self.domChars = $(this.domRootEl).find(".ajk-verifier-chars");
				self.domTooltip = $(this.domRootEl).find(".ajk-verifier-tooltip");
				self.domControl = $(this.domRootEl).find(".ajk-verifier-control");
				self.tooltip = (self.domTooltip.length > 0) ? $(self.domTooltip).text() : "";
				self.format = (self.domFormat.length > 0) ? $(self.domFormat).text() : "";
				self.chars = (self.domChars.length > 0) ? $(self.domChars).text() : "";
				self.domControl = (self.domControl.length > 0) ? $(self.domControl).get()[0] : "";
				self.domOverlay = $(self.domRootEl).find(".ajk-verifier-overlay").get()[0];
				self.defaultValueOkay = ($(this.domRootEl).find(".ajk-verifier-not-default-value").length > 0) ? false : true;
				self.hideDefaultValue = ($(this.domRootEl).find(".ajk-verifier-hide-default-value").length > 0) ? true : false;
				var domOptionValues = $(this.domRootEl).find(".ajk-verifier-value-options");
				self.valueOptions = (domOptionValues.length > 0) ? $(domOptionValues).text().split() : "";
				self.fieldName = $(self.domControl).attr("name");
				if (self.chars) {
					var charArray = self.chars.split("-");
					self.chars = {
						minChar : charArray[0],
						maxChar : charArray[1]
					};
				}
				self.calculateControlType();
				self.setupValueGetterSetter();
				self.setupVerificationFunction();
				self.setupTooltip();
				self.setupFocus();
				self.setupClick();
				self.setupKeyEvents();
				self.invalidDateMessage = (assets.js.core.setting.TLConfigText && assets.js.core.setting.TLConfigText['verifier_invaldiDate_message']) ? assets.js.core.setting.TLConfigText['verifier_invaldiDate_message']
						: "Not a valid date";
				if ($(self.domControl).hasClass("ajk-color-selector") && typeof AJKColorPicker != "undefined") {
					self.colorPicker = new AJKColorPicker.color(self.domControl, {});
				}
				if (self.domOverlay) {
					self.initOverlay();
				}
				return self;
			},
			initOverlay : function() {
				var self = this;
				$(self.domOverlay).click(function() {
					$(this).css({
						display : "none"
					});
					$(self.domControl).focus();
				});
				$(self.domControl).focus(function() {
					$(self.domOverlay).css({
						display : "none"
					});
				});
				$(self.domControl).blur(function() {
					if ($(this).val() == "") {
						$(self.domOverlay).css({
							display : "block"
						});
					}
				});
			},
			setupValueGetterSetter : function() {
				var self = this;
				switch (self.controlType) {
				case "span ajk-custom-checkbox":
					self.getValue = function() {
						return $(this.domControl).text();
					};
					self.setValue = function(data) {
						$(this.domControl).text(data.value);
					};
					break;
				case "textarea textarea":
					self.getValue = function() {
						return assets.js.core.utils.AJKHelpers.removeScript({
							content : $(this.domControl).val()
						});
					};
					self.setValue = function(data) {
						$(this.domControl).val(assets.js.core.utils.AJKHelpers.removeScript({
							content : data.value
						}));
					};
					break;
				case "select":
					self.getValue = function() {
						return $(this.domControl).val();
					};
					self.setValue = function(data) {
						$(this.domControl).val(data.value);
					};
					break;
				default:
					self.getValue = function() {
						return assets.js.core.utils.AJKHelpers.removeScript({
							content : $(this.domControl).val()
						});
					};
					self.setValue = function(data) {
						$(this.domControl).val(assets.js.core.utils.AJKHelpers.removeScript({
							content : data.value
						}));
						self.updateValueSlider({
							value : data.value
						});
					};
					break;
				}
			},
			updateValueSlider : function(data) {
				var self = this;
				var thisSlider = AJKValueSlider.slidersByName[self.fieldName];
				if (thisSlider) {
					thisSlider.setValue({
						value : data.value
					});
				}
			},
			calculateControlType : function() {
				var self = this;
				var tagName = self.domControl.tagName;
				var type = $(self.domControl).attr("type");
				self.controlType = (tagName + " " + type).toLowerCase();
				if (tagName == "SELECT") {
					self.controlType = "select";
				}
				if (self.controlType == "input password") {
					self.controlType = "input text";
				}
			},
			setupClick : function() {
				var self = this;
				switch (self.controlType) {
				case "span ajk-custom-checkbox":
					self.fieldValue = self.getValue();
					$(self.domControl).click(function() {
						if (self.fieldValue == "on") {
							self.fieldValue = "off";
							$(this).removeClass("checkbox-selected");
						} else {
							self.fieldValue = "on";
							$(this).addClass("checkbox-selected");
						}
						self.clearAllErrorsFunc();
						return false;
					});
					break;
				default:
					break;
				}
			},
			setupFocus : function() {
				var self = this;
				switch (self.controlType) {
				case "input text":
					self.fieldValue = self.defaultValue = $(self.domControl).val();
					$(self.domControl).focus(function() {
						var thisVal = self.getValue();
						if (self.format == "date" && thisVal == self.invalidDateMessage) {
							self.setValue({
								value : ""
							});
						}
						if (thisVal == self.defaultValue && (!self.defaultValueOkay || self.hideDefaultValue)) {
							self.setValue({
								value : ""
							});
						}
						$(self.domRootEl).addClass("ajk-verifier-field-focused");
						self.clearAllErrorsFunc();
					}).blur(function() {
						var thisVal = self.getValue();
						if (self.format == "date") {
							var parsedDate = Date.parse(thisVal);
							if (parsedDate) {
								var formatedDate = assets.js.core.utils.AJKHelpers.formatDate({
									formatString : "DD MMM YYYY HH:mm:ss",
									date : parsedDate,
									language : "base"
								});
								self.setValue({
									value : formatedDate
								});
								thisVal = formatedDate;
							} else {
								self.setValue({
									value : self.invalidDateMessage
								});
								thisVal = self.invalidDateMessage;
							}
						}
						if (!thisVal) {
							self.setValue({
								value : self.defaultValue
							});
						}
						self.oldFieldValue = self.fieldValue;
						self.fieldValue = thisVal;
						if (self.oldFieldValue != thisVal) {
							self.controller.fieldDidChange({
								fieldName : self.fieldName,
								fieldValue : thisVal
							});
						}
						$(self.domRootEl).removeClass("ajk-verifier-field-focused");
					});
					break;
				case "textarea textarea":
					self.fieldValue = self.defaultValue = $(self.domControl).val();
					$(self.domControl).focus(function() {
						var thisVal = self.getValue();
						if (thisVal == self.defaultValue) {
						}
						$(self.domRootEl).addClass("ajk-verifier-field-focused");
						self.clearAllErrorsFunc();
					}).blur(function() {
						var thisVal = self.getValue();
						if (!thisVal) {
						}
						if (self.fieldValue != thisVal) {
							self.controller.fieldDidChange({
								fieldName : self.fieldName,
								fieldValue : thisVal
							});
						}
						self.fieldValue = thisVal;
						$(self.domRootEl).removeClass("ajk-verifier-field-focused");
					});
					break;
				case "select":
					self.fieldValue = $(self.domControl).val();
					$(self.domControl).focus(function() {
						$(self.domRootEl).addClass("ajk-verifier-field-focused");
						self.clearAllErrorsFunc();
					}).blur(function() {
						var thisVal = self.getValue();
						if (self.fieldValue != thisVal) {
							self.controller.fieldDidChange({
								fieldName : self.fieldName,
								fieldValue : thisVal
							});
						}
						self.fieldValue = thisVal;
						$(self.domRootEl).removeClass("ajk-verifier-field-focused");
					}).change(function() {
						$(self.domControl).blur();
					});
					break;
				default:
					break;
				}
			},
			setupKeyEvents : function() {
				var self = this;
				if (self.format == "number") {
					$(self.domControl).keydown(
							function(e) {
								var charCode = e.keyCode;
								if ((charCode >= 48 && charCode <= 57) || charCode == 8 || charCode == 13 || charCode == 9 || charCode == 37 || charCode == 39 || charCode == 46
										|| charCode == 17 || charCode == 18 || (charCode >= 96 && charCode <= 105)) {
									return true;
								} else {
									return false;
								}
							});
				}
				$(self.domControl).keyup(function(e) {
					self.controller.fieldDidKeyUp({
						fieldName : self.fieldName,
						fieldValue : $(this).val()
					});
				});
				if (self.isLast && self.controlType == "input text") {
					$(self.domControl).keyup(function(e) {
						if (e.keyCode == 13) {
							self.fieldValue = $(self.domControl).val();
							self.controller.attemptToSubmit();
						}
					});
				}
			},
			clear : function() {
				var self = this;
				switch (self.controlType) {
				case "input text":
					self.fieldValue = (self.defaultValue) ? self.defaultValue : "";
					$(self.domControl).val(self.fieldValue);
					if (self.domOverlay) {
						$(self.domOverlay).css({
							display : "block"
						});
					}
					break;
				case "textarea textarea":
					self.fieldValue = (self.defaultValue) ? self.defaultValue : "";
					$(self.domControl).val(self.fieldValue);
					break;
				default:
					self.fieldValue = (self.defaultValue) ? self.defaultValue : "";
					$(self.domControl).val(self.fieldValue);
					break;
				}
			},
			forceSetValue : function(data) {
				var self = this;
				var value = data.value;
				switch (self.controlType) {
				case "input text":
					self.oldFieldValue = self.fieldValue;
					self.fieldValue = value;
					$(self.domControl).val(value);
					self.updateValueSlider({
						value : value
					});
					break;
				case "textarea textarea":
					self.oldFieldValue = self.fieldValue;
					self.fieldValue = value;
					$(self.domControl).val(value);
					break;
				default:
					self.oldFieldValue = self.fieldValue;
					self.fieldValue = value;
					$(self.domControl).val(value);
					self.updateValueSlider({
						value : value
					});
					break;
				}
				if (self.colorPicker) {
					AJKColorPicker.fireEvent(self.domControl, "keyup");
				}
			},
			clearError : function() {
				var self = this;
				$(self.domRootEl).removeClass("ajk-verifier-field-error");
			},
			setupTooltip : function() {
				var self = this;
				$(self.domControl).hover(function() {
					self.fieldHoverFunc({
						tooltipText : self.tooltip
					});
				}, function() {
					self.fieldHoverFunc({
						tooltipText : ""
					});
				});
			},
			setupVerificationFunction : function() {
				var self = this;
				switch (self.format) {
				case "email":
					self.verify = function() {
						var self = this;
						var fieldValue = self.getValue();
						if (!fieldValue || (fieldValue == self.defaultValue && !self.defaultValueOkay)) {
							return false;
						}
						return fieldValue
								.match(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
					};
					break;
				case "date": {
					self.verify = function() {
						var self = this;
						var fieldValue = self.getValue();
						if (!fieldValue || (fieldValue == self.defaultValue && !self.defaultValueOkay)) {
							return false;
						}
						return (Date.parse(fieldValue)) ? true : false;
					};
				}
					break;
				default:
					self.verify = function() {
						if (!self.defaultValueOkay && self.fieldValue == self.defaultValue) {
							return false;
						}
						return (self.checkFieldCharLength() && self.checkForValueOptions());
					};
					break;
				}
			},
			verify : function() {
			},
			blur : function() {
				var self = this;
				$(self.domControl).blur();
			},
			highlightError : function() {
				var self = this;
				$(self.domRootEl).addClass("ajk-verifier-field-error");
			},
			checkFieldCharLength : function() {
				var self = this;
				if (!self.chars) {
					return true;
				}
				var fieldLength = self.fieldValue.length;
				return (fieldLength >= self.chars.minChar && fieldLength <= self.chars.maxChar);
			},
			checkForValueOptions : function() {
				var self = this;
				if (!self.valueOptions) {
					return true;
				}
				var optionFound = false;
				$.each(self.valueOptions, function() {
					if (self.fieldValue == this) {
						optionFound = true;
					}
				});
				return optionFound;
			}
		});