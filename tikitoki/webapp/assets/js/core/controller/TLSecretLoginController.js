$import("assets.js.core.setting.TLConfigText");
$import("assets.js.core.component.AJKVerifier");
Class.forName({
	name : "class assets.js.core.controller.TLSecretLoginController extends Object",

	TLSecretLoginController : function(data) {
		var self = this;
		self.domRoot = $("#ajk-panel-secret-login").get()[0];
		self.initialShow = data.initialShow;
		self.mainController = data.mainController;
		self.verifer = "";
	},
	init : function() {
		var self = this;
		if (self.initialShow) {
			self.show();
		}
		$(self.domRoot).find(".close").click(function() {
			$(self.domRoot).remove();
			return false;
		});
		self.verifier = new assets.js.core.component.AJKVerifier({
			domRootEl : $(self.domRoot).find(".ajk-verifier").get()[0],
			submitFunc : function(data) {
				data.fieldData["timelineId"] = self.mainController.timeline.id;
				theAJKAjaxController.request({
					action : "/login/secretlogin",
					method : "post",
					alwaysAllow : true,
					vars : data.fieldData,
					callback : function(xml) {
						var error = $(xml).find("error").text();
						if (error) {
							self.verifier.errorHighlightField({
								fieldName : "secret"
							});
							self.verifier.displayErrorMessage({
								message : assets.js.core.setting.TLConfigText['groupEditLogin_loginError_message']
							});
						} else {
							var secretUserId = $(xml).find("secretUserId").text();
							var verifyCode = $(xml).find("verifyCode").text();
							self.mainController.logSecretUserIn({
								userId : secretUserId,
								username : data.fieldData["nickname"],
								verifyCode : verifyCode
							});
						}
					}
				});
			}
		}).init();
		return self;
	},
	show : function() {
		var self = this;
		$(self.domRoot).css({
			display : "block"
		});
	},
	hide : function() {
		var self = this;
		$(self.domRoot).css({
			display : "none"
		});
	}
});