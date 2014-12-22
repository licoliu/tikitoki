$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.component.AJKVerifier");
Class.forName({
	name : "class assets.js.core.controller.TLLoginPanelController extends Object",

	TLLoginPanelController : function(data) {
		var self = this;
		self.domRootEl = data.domRootEl;
		self.buttonPopupId = data.buttonPopupId;
		self.loginVerification = "";
		self.controller = data.controller;
		self.domCarousel = $(self.domRootEl).find(".fp-carousel").get()[0];
		self.domStage = $(self.domRootEl).find(".fp-stage").get()[0];
		self.domBlocks = $(self.domRootEl).find(".fp-block").get();
		self.domForgottenPassword = $(self.domRootEl).find(".forgotten-password").get()[0];
		self.carouselBlockHeight = "10.5em";
		self.selectedBlock = 0;
		self.getLoginDetailsVerification = "";
		self.loggingIn = false;
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
		$(self.domRootEl).find(".ajk-pd-back-to-start").click(function() {
			self.jumpTo({
				pos : 0
			});
			return false;
		});
		$(self.domForgottenPassword).click(function() {
			self.jumpTo({
				pos : 1
			});
			return false;
		});
		self.loginVerification = new assets.js.core.component.AJKVerifier({
			domRootEl : $(self.domRootEl).find(".fp-block-0").get()[0],
			submitFunc : function(data) {
				if (self.loggingIn) {
					return;
				}
				self.loggingIn = true;
				data.fieldData["password"] = data.fieldData["tikitokipassword"];
				theAJKAjaxController.request({
					action : "/login/",
					method : "post",
					alwaysAllow : true,
					vars : data.fieldData,
					callback : function(xml) {
						self.loggingIn = false;
						var error = $(xml).find("error").text();
						if (error) {
							self.loginVerification.errorHighlightField({
								fieldName : "username"
							});
							self.loginVerification.errorHighlightField({
								fieldName : "tikitokipassword"
							});
							self.loginVerification.displayErrorMessage({
								message : assets.js.core.setting.TLConfigText['loginPopdown_incorrectLogin_message']
							});
						} else {
							var userId = $(xml).find("userId").text();
							var username = $(xml).find("username").text();
							var verifyCode = $(xml).find("verifyCode").text();
							theAJKButtonPopupController.forceClosePopupOfType({
								type : self.buttonPopupId
							});
							setTimeout(function() {
								self.reset();
							}, 300);
							self.controller.logUserIn({
								userId : userId,
								username : username,
								verifyCode : verifyCode
							});
						}
					}
				});
			}
		}).init();
		self.getLoginDetailsVerification = new assets.js.core.component.AJKVerifier({
			domRootEl : $(self.domRootEl).find(".fp-block-1").get()[0],
			submitFunc : function(data) {
				self.jumpTo({
					pos : 2
				});
				theAJKAjaxController.request({
					action : "/login/recovery/",
					method : "post",
					alwaysAllow : true,
					vars : data.fieldData,
					callback : function(xml) {
						var error = $(xml).find("error").text();
						if (error) {
							self.getLoginDetailsVerification.errorHighlightField({
								fieldName : "email"
							});
							self.getLoginDetailsVerification.displayErrorMessage({
								message : assets.js.core.setting.TLConfigText['loginPopdown_Email_not_in_database']
							});
							self.jumpTo({
								pos : 1
							});
						} else {
							self.jumpTo({
								pos : 3
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
		self.loginVerification.clearFields();
		self.loginVerification.clearAllErrors();
	}
});