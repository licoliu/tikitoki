Class
		.forName({
			name : "class assets.js.security.component.AJKUploadImageSelector extends Object",
			AJKUploadImageSelector : function(data) {
				var self = this;
				self.domRoot = "";
				self.lightbox = "";
				self.remainingImagesFunc = data.remainingImagesFunc;
				self.imageLimitFunc = data.imageLimitFunc;
				self.imageSelectedFunc = data.imageSelectedFunc;
				self.showProgressClass = "ft-ah-imgup-upload-show-progress";
				self.showUploadClass = "ft-ah-imgup-upload-show-submitting";
				self.showUppingClass = "ft-ah-imgup-upload-show-upping";
				self.showErrorClass = "ft-ah-imgup-upload-show-error";
				self.domPCEncoded = $("#ft-ah-imgup-encoding span").get()[0];
				self.domUploadPanel = $("#ft-ah-imgup-submitting").get()[0];
				self.domForm = $("#ft-ah-imgup-upload-form").get()[0];
				self.domFlashHolder = $("#ft-ah-imgup-flash-holder").get()[0];
				self.lastEventType = "";
			},
			init : function() {
				var self = this;
				var domContent = $("#ft-ah-imgup-upload").get()[0];
				self.lightbox = new TLAdminLightbox({
					domClass : "tl-ah-upload-image-lightbox",
					title : TLConfigText['imageUploader_title'],
					intro : TLConfigText['imageUploader_intro'],
					domContent : domContent
				}).init();
				self.domRoot = self.lightbox.domRoot;
				self.domRemainingImages = $("#tl-image-uploader-remaining").get()[0];
				self.domImageLimit = $("#tl-image-uploader-limit").get()[0];
				$(self.domUploadPanel).find("a.upload").click(function() {
					$("#agileUploaderSWF").get()[0].submit();
					self.clearStateStyles();
					$(self.domRoot).addClass(self.showUppingClass);
					return false;
				});
				$(self.domUploadPanel).find("a.cancel").click(function() {
					self.clearStateStyles();
					return false;
				});
				$("#ft-ah-imgup-try-again").click(function() {
					self.clearStateStyles();
					return false;
				});
				return self;
			},
			uploadEvent : function(data) {
				var self = this;
				if (data.type == "progress") {
					if (self.lastEventType != "progress") {
						self.clearStateStyles();
						$(self.domRoot).addClass(self.showProgressClass);
					}
					var pCent = data.file.percentEncoded;
					pCent = (pCent > 99) ? 99 : (pCent < 0) ? 0 : pCent;
					$(self.domPCEncoded).text(pCent);
				} else if (data.type == "preview") {
					self.clearStateStyles();
					$(self.domUploadPanel).find("img").remove();
					$(self.domUploadPanel).prepend('<img src="' + data.file.base64Thumbnail + '" />');
					$(self.domRoot).addClass(self.showUploadClass);
				} else if (data.type == "http_status") {
					if (data.response != 200) {
						self.clearStateStyles();
						$(self.domRoot).addClass(self.showErrorClass);
					}
				} else if (data.type == "server_response") {
					var imageUrl = data.response;
					if (imageUrl && imageUrl.indexOf("upload_error") == -1) {
						$(self.domFlashHolder).empty();
						self.close();
						self.imageSelectedFunc({
							src : imageUrl
						});
						self.clearStateStyles();
					} else {
						self.clearStateStyles();
						$(self.domRoot).addClass(self.showErrorClass);
					}
				}
				self.lastEventType = data.type;
			},
			generateFlashEmbed : function() {
				var self = this;
				var heightLimit = (self.imageSize == "small") ? 600 : 1500;
				var widthLimit = (self.imageSize == "small") ? 600 : 1500;
				if ($.browser.msie) {
					var iHTML = '<object id="agileUploaderSWF" width="334" height="90" data="/assets/image-resizer-uploader/agile-uploader.swf" type="application/x-shockwave-flash" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=">';
				} else {
					var iHTML = '<object id="agileUploaderSWF" width="334" height="90" data="/assets/image-resizer-uploader/agile-uploader.swf">';
				}
				iHTML += '<param name="movie" value="/assets/image-resizer-uploader/agile-uploader.swf">';
				iHTML += '<param name="bgcolor" value="#fff">';
				iHTML += '<param name="quality" value="high">';
				iHTML += '<param name="allowscriptaccess" value="always">';
				iHTML += '<param name="flashvars" value="max_height='
						+ heightLimit
						+ '&amp;max_width='
						+ widthLimit
						+ '&amp;jpg_quality=85&amp;preview_max_height=100&amp;preview_max_width=300&amp;show_encode_progress=true&amp;js_get_form_data=AJKUploadImageSelector.selector1.serializeForm&amp;js_event_handler=AJKUploadImageSelector.selector1.uploadEvent&amp;return_submit_response=true&amp;file_filter=*.jpg;*.jpeg;*.gif;*.png;*.JPG;*.JPEG;*.GIF;*.PNG&amp;file_filter_description=Files&amp;max_post_size=1572864&amp;file_limit=-1&amp;firebug=false&amp;form_action=http://'
						+ AJKHelpers.uploadDomain
						+ '/processtikitokiimage.php&amp;button_up=/assets/image-resizer-uploader/browse_up.png&amp;button_down=/assets/image-resizer-uploader/browse_down.png&amp;button_over=/assets/image-resizer-uploader/browse_over.png">';
				iHTML += '<param name="wmode" value="transparent">';
				iHTML += '</object>';
				$(self.domFlashHolder).empty().append(iHTML);
			},
			serializeForm : function() {
				var self = this;
				return $(self.domForm).serialize();
			},
			clearStateStyles : function() {
				var self = this;
				$(self.domRoot).removeClass(self.showProgressClass + " " + self.showUploadClass + " " + self.showUppingClass + " " + self.showErrorClass);
			},
			updateRemainingImages : function() {
				var self = this;
				if (self.remainingImagesFunc && !self.isStandardPage) {
					var numImages = self.remainingImagesFunc();
					$(self.domRemainingImages).text(numImages);
					if (numImages > 0) {
						$(self.domRoot).removeClass("tl-ah-fis-disable-image-selection");
					} else {
						$(self.domRoot).addClass("tl-ah-fis-disable-image-selection");
					}
				}
				if (self.imageLimitFunc) {
					var numImages = self.imageLimitFunc();
					$(self.domImageLimit).text(numImages);
				}
			},
			launch : function(data) {
				var self = this;
				self.imageSize = data.imageSize;
				self.clearStateStyles();
				self.updateRemainingImages();
				self.lightbox.openPanel();
				self.generateFlashEmbed();
			},
			close : function() {
				var self = this;
				self.lightbox.closePanel();
			}
		});