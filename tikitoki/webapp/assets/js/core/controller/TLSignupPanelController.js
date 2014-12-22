$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.component.AJKVerifier");
Class.forName({
	name : "class assets.js.core.controller.TLSignupPanelController extends Object",

	TLSignupPanelController : function(data) {
		var self = this;
		self.domRootEl = data.domRootEl;
		self.controller = data.controller;
		self.buttonPopupId = data.buttonPopupId;
		self.signUpVerification = "";
		self.domCarousel = $(self.domRootEl).find(".fp-carousel").get()[0];
		self.domStage = $(self.domRootEl).find(".fp-stage").get()[0];
		self.domBlocks = $(self.domRootEl).find(".fp-block").get();
		self.carouselBlockHeight = "21em";
		self.selectedBlock = 0;
		self.domAutoLoginButton = $(self.domRootEl).find(".tl-signup-auto-login-button").get()[0];
		self.username = "";
		self.userPassword = "";
		self.userId;
		self.signingUp = false;
	},
	init : function() {
		var self = this;
		$(self.domBlocks).css({
			height : self.carouselBlockHeight
		});
		$(self.domCarousel).css({
			height : self.carouselBlockHeight
		});
		$(self.domBlocks[0]).css({
			display : "block"
		});
		if (self.buttonPopupId) {
			theAJKButtonPopupController.registerAsObserverOfType({
				type : self.buttonPopupId,
				observer : self
			});
			self.buttonPopupDidClose = function() {
				self.reset();
			};
		}
		$(self.domAutoLoginButton).click(function() {
			self.controller.loginPanelController.loginVerification.setFieldValues({
				fieldValues : {
					username : self.username,
					tikitokipassword : self.userPassword
				}
			});
			self.controller.loginPanelController.loginVerification.fireButton({
				buttonType : "save"
			});
			theAJKButtonPopupController.forceClosePopupOfType({
				type : self.buttonPopupId
			});
			return false;
		});
		self.signUpVerification = new assets.js.core.component.AJKVerifier({
			domRootEl : $(self.domRootEl).find(".ajk-verifier").get()[0],
			submitFunc : function(data) {
				if (self.signingUp) {
					return;
				}
				self.signingUp = true;
				data.fieldData["password"] = data.fieldData["tikitokisignuppassword"];
				self.username = data.fieldData["username"];
				self.userPassword = data.fieldData["password"];
				data.fieldData["pupilClassCode"] = (data.fieldData["pupilClassCode"] == assets.js.core.setting.TLConfigText['signup_Enter_class_code']) ? ""
						: data.fieldData["pupilClassCode"];
				theAJKAjaxController.request({
					action : "/signup/",
					method : "post",
					alwaysAllow : true,
					vars : data.fieldData,
					callback : function(xml) {
						self.signingUp = false;
						var anError = $(xml).find("error").text();
						if (anError && anError == "error:username-already-exists") {
							self.signUpVerification.errorHighlightField({
								fieldName : "username"
							});
							self.signUpVerification.displayErrorMessage({
								message : assets.js.core.setting.TLConfigText['signup_Username_exists']
							});
						} else if (anError && anError == "error:email-already-exists") {
							self.signUpVerification.errorHighlightField({
								fieldName : "email"
							});
							self.signUpVerification.displayErrorMessage({
								message : assets.js.core.setting.TLConfigText['signup_Email_taken']
							});
						} else if (anError && anError == "error:too-many-pupils") {
							self.signUpVerification.errorHighlightField({
								fieldName : "pupilClassCode"
							});
							self.signUpVerification.displayErrorMessage({
								message : assets.js.core.setting.TLConfigText['signup_Class_accounts_full']
							});
						} else if (anError && anError == "error:incorrect-class-code") {
							self.signUpVerification.errorHighlightField({
								fieldName : "pupilClassCode"
							});
							self.signUpVerification.displayErrorMessage({
								message : assets.js.core.setting.TLConfigText['signup_Incorrect_class_code']
							});
						} else {
							self.userId = $(xml).find("userId").text();
							self.jumpTo({
								pos : 1
							});
						}
					}
				});
			}
		}).init();
		return self;
	},
	jumpTo : function(dataObj) {
		var self = this;
		var newPos = dataObj.pos;
		var callback = dataObj.callback;
		var duration = (dataObj.instantly) ? 0 : 300;
		if (self.selectedBlock == newPos) {
			return;
		}
		var oldPos = self.selectedBlock;
		self.selectedBlock = newPos;
		self.carouselHeight = $(self.domCarousel).height();
		if (newPos > oldPos) {
			$(self.domBlocks[newPos]).css({
				display : "block"
			});
			$(self.domStage).animate({
				marginTop : -self.carouselHeight
			}, duration, function() {
				$(self.domBlocks[oldPos]).css({
					display : "none"
				});
				$(this).css({
					marginTop : "0"
				});
				if (callback) {
					callback();
				}
			});
		} else {
			$(self.domBlocks[newPos]).css({
				display : "block"
			});
			$(self.domStage).css({
				marginTop : -self.carouselHeight
			});
			$(self.domStage).animate({
				marginTop : 0
			}, duration, function() {
				$(self.domBlocks[oldPos]).css({
					display : "none"
				});
				if (callback) {
					callback();
				}
			});
		}
	},
	reset : function() {
		var self = this;
		self.resetFields();
		self.jumpTo({
			pos : 0,
			instantly : true
		});
	},
	resetFields : function() {
		var self = this;
		self.signUpVerification.clearFields();
		self.signUpVerification.clearAllErrors();
	}
});