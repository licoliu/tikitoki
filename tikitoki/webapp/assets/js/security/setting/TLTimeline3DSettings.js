Class.forName({
	name : "class assets.js.security.setting.TLTimeline3DSettings extends Object",

	TLTimeline3DSettings : function(data) {
		var self = this;
		self.slidersInitialised = false;
		self.controller = data.controller;
		self.mainController = self.controller.mainController;
		self.timeline = self.controller.timeline;
		self.timeline3D = self.timeline.timeline3D;
	},
	init : function() {
		var self = this;
		$("#tl-ah-timeline-3d-settings").click(function() {
			if (!self.lightbox) {
				self.domRoot = $("#tl-ah-3d-settings-form-content .ajk-verifier").get()[0];
				self.lightbox = new TLAdminLightbox({
					domClass : "tl-ah-timeline-3d-settings tl-ah-advanced-settings",
					title : TLConfigText["3DSettings_title"],
					intro : TLConfigText["3DSettings_intro"],
					domContent : self.domRoot,
					closeCallback : function() {
						self.verifier.fireButton({
							buttonType : "revert"
						});
					}
				}).init();
				self.setupVerification();
			}
			self.lightbox.openPanel();
			if (!self.slidersInitialised) {
				self.slidersInitialised = true;
				self.initialiseAdminValueSliders();
			}
			self.setFieldValues();
			return false;
		});
		return self;
	},
	setFieldValues : function() {
		var self = this;
	},
	initialiseAdminValueSliders : function() {
		var self = this;
		$(self.domRoot).find(".ft-component-value-slider").each(function() {
			var domInput = $(this).find("input").get()[0];
			var rangeStr = $(domInput).attr("range");
			var insertHTML = '<div class="ft-cvs-holder">';
			insertHTML += '<div class="ft-cvs-bar"></div>';
			insertHTML += '<div class="ft-cvs-dragger"></div>';
			insertHTML += '</div>';
			var domSlider = $(insertHTML).get()[0];
			var domInputHolder = $(this).find(".tl-ah-input").get()[0];
			$(domInputHolder).append(domSlider);
			var draggerRange = parseInt($(domSlider).css("width"));
			new AJKValueSlider({
				domRoot : domSlider,
				domDragger : $(domSlider).find(".ft-cvs-dragger").get()[0],
				name : $(domInput).attr("name"),
				range : {
					min : parseFloat(rangeStr.split(",")[0]),
					max : parseFloat(rangeStr.split(",")[1])
				},
				callback : function(data) {
					$(domInput).val(data.newVal);
					$(domInput).blur();
				},
				limitFunc : function() {
					var limit = {
						minX : 0,
						maxX : draggerRange,
						minY : 5,
						maxY : 5
					};
					return limit;
				}
			}).init();
		});
	},
	generate3DVarString : function() {
		var self = this;
		var tl = self.timeline3D;
		var dec = AJKHelpers.convertNumToXDecimalPlaces;
		return tl.status + "," + tl.color + "," + dec({
			num : tl.zoom,
			x : 5
		}) + "," + tl.panelSize + "," + dec({
			num : tl.vanishTop,
			x : 5
		}) + "," + dec({
			num : tl.endToScreenRatio,
			x : 5
		}) + "," + tl.direction + "," + tl.numCols + "," + dec({
			num : tl.bgFade,
			x : 5
		});
	},
	setupVerification : function() {
		var self = this;
		self.verifier = new AJKVerifier({
			domRootEl : self.domRoot,
			cancelFunc : function() {
			},
			revertFunc : function() {
				self.verifier.restoreSavedFieldValues();
			},
			submitFunc : function(data) {
				var vars = {};
				vars["timelineId"] = self.timeline.id;
				vars["settings3d"] = self.generate3DVarString();
				var action = "/admin/update3dtimelinesettings/";
				self.verifier.saveFieldValues();
				self.verifier.disableSaveAndRevert();
				theAJKAjaxController.request({
					action : action,
					method : "post",
					vars : vars,
					callback : function(xml) {
					}
				});
			}
		}).init();
		self.verifier.onChangeCallback = function(data) {
			switch (data.fieldName) {
			case "timeline3DNumCols":
				var val = parseInt(data.fieldValue);
				if (val != self.timeline3D.numCols) {
					self.timeline3D.numCols = parseInt(data.fieldValue);
					self.mainController.selected3DView.updateStoryColPositions();
				}
				break;
			case "timeline3DColor":
				self.timeline3D.color = data.fieldValue;
				break;
			case "timeline3DZoom":
				self.timeline3D.zoom = Math.pow(parseFloat(data.fieldValue), 2);
				break;
			case "timeline3DPanelSize":
				self.timeline3D.panelSize = parseInt(data.fieldValue, 10);
				break;
			case "timeline3DVanishTop":
				self.timeline3D.vanishTop = parseFloat(data.fieldValue);
				break;
			case "timeline3DEndToScreenRatio":
				self.timeline3D.endToScreenRatio = parseFloat(data.fieldValue);
				break;
			case "timeline3DDirection":
				self.timeline3D.direction = parseInt(data.fieldValue, 10);
				break;
			case "timelineBGFade":
				self.timeline3D.bgFade = parseFloat(data.fieldValue);
				break;
			case "timeline3DStatus":
				var newStatus = parseInt(data.fieldValue);
				if (newStatus != self.timeline3D.status) {
					self.timeline3D.status = newStatus;
					var view3d = self.mainController.selected3DView;
					view3d.updateButtonState();
					if ((newStatus == 2 && !view3d.active) || (newStatus < 2 && view3d.active)) {
						$(view3d.domLaunchButton).click();
					}
				}
				break;
			default:
				break;
			}
			if (data.fieldName == "timeline3DZoom" || data.fieldName == "timeline3DDirection") {
				self.mainController.selected3DView.redisplayAfterDataChange();
			} else {
				self.mainController.selected3DView.redisplay();
			}
		};
		self.verifier.hideCancelButton();
		self.verifier.showRevertButton();
		self.verifier.disableSaveAndRevert();
	},
	setFieldValues : function() {
		var self = this;
		self.verifier.setFieldValues({
			fieldValues : {
				timeline3DNumCols : self.timeline3D.numCols,
				timeline3DZoom : Math.sqrt(self.timeline3D.zoom),
				timeline3DPanelSize : self.timeline3D.panelSize,
				timeline3DVanishTop : self.timeline3D.vanishTop,
				timeline3DEndToScreenRatio : self.timeline3D.endToScreenRatio,
				timeline3DDirection : self.timeline3D.direction,
				timeline3DStatus : self.timeline3D.status,
				timeline3DColor : self.timeline3D.color,
				timelineBGFade : self.timeline3D.bgFade
			}
		});
		self.verifier.saveFieldValues();
		self.verifier.disableSaveAndRevert();
	}
});