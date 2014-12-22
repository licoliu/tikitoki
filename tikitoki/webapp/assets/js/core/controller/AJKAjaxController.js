$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.core.controller.AJKAjaxController extends Object",

	"@Getter @Setter private loginController" : "",

	AJKAjaxController : function(dataObj) {
	},

	init : function() {
		var self = this;
		return self;
	},
	request : function(dataObj) {
		var self = this;
		var action = dataObj.action;
		var vars = dataObj.vars;
		var callback = dataObj.callback;
		var method = dataObj.method;
		var alwaysAllow = dataObj.alwaysAllow;
		if (method == "get" || alwaysAllow || self.loginController.user.loggedIn) {
			if (!vars.userId && self.loginController.user.loggedIn) {
				vars.userId = self.loginController.user.id;
			}
			var rFunc = (method == "post") ? $.post : $.get;
			rFunc(action, vars, function(data) {
				if ((typeof data) != "object" && data == "verify-code-mismatch") {
					assets.js.core.utils.AJKHelpers.deleteCookie({
						name : self.loginController.userCookieName
					});
					location.reload(true);
				} else if ((typeof data) == "object" && $(data).find("userNotValid").length > 0) {
					window.location.reload();
				} else if (callback) {
					callback(data);
				}
			});
		} else {
		}
	}

});
