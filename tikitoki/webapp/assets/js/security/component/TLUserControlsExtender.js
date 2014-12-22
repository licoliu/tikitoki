Class
		.forName({
			name : "class assets.js.security.component.TLUserControlsExtender extends Object",
			TLUserControlsExtender : function(data) {
				var self = this;
				self.controller = data.controller;
				self.timeline = self.controller.timeline;
				self.userControlsController = data.userControlsController;
			},
			init : function() {
				var self = this;
				if (!self.timeline.isEditable) {
					return;
				}
				self.setupWarningPanel();
				return self;
			},
			setupWarningPanel : function() {
				var self = this;
				self.domWarningPanel = $(
						'<div class="tl-uc-controls-warning"><h3>Important Info</h3><p>These controls are aimed at viewers of your timeline. They should not be used to edit your timeline.</p><p>If you need to change your timeline\'s zoom, view type, or spacing mode, you should use the options in the Settings tab in the grey admin panel.</p><a href="#" class="rt-button-3">Continue</a></div>')
						.get()[0];
				$(self.domWarningPanel).find(".rt-button-3").click(function() {
					$(self.domWarningPanel).animate({
						opacity : 0
					}, 500, function() {
						$(this).remove();
					});
					return false;
				});
				$(self.userControlsController.domPanel).find(".tl-ucp-content").append(self.domWarningPanel);
			}
		});