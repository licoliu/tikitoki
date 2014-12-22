$import("assets.js.core.setting.TLConfigText");
Class
		.forName({
			name : "class assets.js.core.utils.AJKHelpers extends Object",

			"public static iDevice" : -1,
			"public static isIDevice" : function() {
				if (this.iDevice == -1) {
					this.iDevice = (navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPod") != -1) || (navigator.userAgent.match(/iPad/i) != null);
				}
				return this.iDevice;
			},
			"public static emptyImage" : "assets/ui/empty-image.gif",
			"public static cloudfront" : "d8lktyzx0qqvd.cloudfront.net",
			"public static uploadDomain" : "tikitokiservices.com",
			"public static getProcessedImageUrlForAccount" : function(data) {
				var imgSrc = data.imgSrc;
				var accountType = data.accountType;
				var forceShow = data.forceShow;
				if (imgSrc && imgSrc.indexOf("tikitokiservices.com") != -1) {
					return this.emptyImage;
					/*
					 * if (accountType == "Standard" && !forceShow) { return
					 * this.emptyImage; } else { return imgSrc.replace("www." +
					 * this.uploadDomain,
					 * this.cloudfront).replace(this.uploadDomain,
					 * this.cloudfront); }
					 */
				} else {
					return imgSrc;
				}
			},
			"public static getTimelineImageUrl" : function(data) {
				var imageSrc = data.src;
				if (!imageSrc) {
					return data.emptyImage || "assets/ui/empty-image.gif";
				}
				var emptyImage = (data.emptyImage) ? data.emptyImage : theTLSettings.flickrReplacementImage;
				if (imageSrc.indexOf("flickr.com") != -1) {
					var altPath = theTLMainController.timeline.altFlickrImageUrl;
					if (altPath && altPath.indexOf("http://") != -1) {
						var imageUrlSplit = imageSrc.split("/");
						var newImageSrc = altPath + imageUrlSplit[imageUrlSplit.length - 1];
						return this.getProcessedImageUrlForAccount({
							imgSrc : newImageSrc,
							accountType : theTLMainController.timeline.accountType,
							forceShow : true
						});
					} else {
						return emptyImage;
					}
				} else {
					return this.getProcessedImageUrlForAccount({
						imgSrc : imageSrc,
						accountType : theTLMainController.timeline.accountType
					});
				}
			},
			"public static isFlickrImage" : function(data) {
				return (data.src.indexOf("flickr.com") != -1 && !theTLMainController.timeline.altFlickrImageUrl);
			},
			"public static getFKRPhotoPageFromImageSrc" : function(data) {
				var imgSplit = data.src.split("/");
				var lastBit = imgSplit[imgSplit.length - 1];
				if (lastBit) {
					fkrId = lastBit.split("_")[0];
					return "http://flickr.com/photo.gne?id=" + fkrId;
				}
				return "http://flickr.com";
			},
			"public static convertNumToXDecimalPlaces" : function(data) {
				var num = data.num;
				var cnvInt = Math.pow(10, data.x);
				return parseInt(num * cnvInt, 10) / cnvInt;
			},
			"public static stringRepeat" : function(data) {
				var aString = data.aString;
				var multiplier = data.multiplier;
				return new Array(multiplier + 1).join(aString);
			},
			"public static convertHexColourToRGB" : function(data) {
				var hexColour = data.hexColour;
				var cutHex = function(h) {
					return (h.charAt(0) == "#") ? h.substring(1, 7) : h;
				};
				var hexToR = function(h) {
					return parseInt((cutHex(h)).substring(0, 2), 16);
				};
				var hexToG = function(h) {
					return parseInt((cutHex(h)).substring(2, 4), 16);
				};
				var hexToB = function(h) {
					return parseInt((cutHex(h)).substring(4, 6), 16);
				};
				return {
					r : hexToR(hexColour),
					g : hexToG(hexColour),
					b : hexToB(hexColour)
				};
			},
			"public static generateAudioEmbedHTML" : function(data) {
				var self = this;
				var audioSrc = data.src;
				var type = data.type;
				var audioId = data.audioId;
				var colour = data.colour;
				if (type == "dailymotion" || type == "youtube" || type == "vimeo") {
					data.videoId = data.audioId;
					return assets.js.core.utils.AJKHelpers.generateVideoEmbedHTML(data);
				} else if (type == "soundcloud") {
					if ($.browser.msie || $.browser.isModernIE) {
						var iHTML = '<object height="100%" width="100%" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">';
						iHTML += '<param name="movie" value="http://player.soundcloud.com/player.swf?url=' + audioSrc
								+ '&auto_play=true&show_artwork=true&theme_color=000000&color=' + colour + '"></param>';
						iHTML += '<param name="allowscriptaccess" value="always"></param>';
						iHTML += '<embed allowscriptaccess="always" height="100%" src="http://player.soundcloud.com/player.swf?url=' + audioSrc
								+ '&auto_play=true&show_artwork=true&theme_color=000000&color=' + colour
								+ '&visual=true" type="application/x-shockwave-flash" width="100%"></embed>';
						iHTML += '</object>';
					} else {
						var iHTML = '<iframe width="100%" height="100%" scrolling="no" frameborder="no" src="http://w.soundcloud.com/player/?url=' + audioSrc
								+ '&auto_play=true&show_artwork=true&theme_color=000000&color=' + colour + '&visual=true"></iframe>';
					}
					return iHTML;
				} else if (type == "skoletube") {
					audioSrc = "http://www.skoletube.dk/flvideo/" + assets.js.core.utils.AJKHelpers.decode_base64(audioId) + ".mp3";
				}
				var insertHTML = assets.js.core.utils.AJKHelpers.generateStandardVideoPlayerEmbedHTML({
					audioUrl : audioSrc,
					colour : colour
				});
				return insertHTML;
			},
			"public static generateVideoEmbedHTML" : function(data) {
				var self = this;
				var vidSrc = data.src;
				var type = data.type;
				type = (type) ? type : "file";
				var width = data.width;
				var height = data.height;
				var videoId = data.videoId;
				var colour = data.colour;
				var theme = (data.theme) ? data.theme : "dark";
				var protocal = (document.location.protocol == 'https:') ? "https:" : "http:";
				var autoplay = (data.autoplay) ? 1 : 0;
				var insertHTML = "";
				switch (type) {
				case "vimeo":
					insertHTML = '<iframe src="' + protocal + '//player.vimeo.com/video/' + videoId + '?color=' + colour + '&autoplay=1&title=0&portrait=0&byline=0" width="'
							+ width + '" height="' + height + '" frameborder="0"></iframe>';
					break;
				case "youtube":
					if ($.browser.msie && $.browser.version < 9) {
						insertHTML = '<embed src="http://www.youtube.com/v/' + videoId
								+ '" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="' + width + '" height="' + height + '"></embed>';
					} else {
						insertHTML += '<iframe class="youtube-player" type="text/html" width="' + width + '" height="' + height + '" src="' + protocal + '//www.youtube.com/embed/'
								+ videoId + '?theme=' + theme + '" frameborder="0"></iframe>';
					}
					break;
				case "dailymotion":
					insertHTML += '<iframe src="' + protocal + '//www.dailymotion.com/embed/video/' + videoId + '" width="' + width + '" height="' + height
							+ '" frameborder="0"></iframe>';
					break;
				case "skoletube":
					var vidUrl = "http://www.skoletube.dk/flvideo/" + assets.js.core.utils.AJKHelpers.decode_base64(videoId) + ".mp4";
					data.videoUrl = vidUrl;
					insertHTML += assets.js.core.utils.AJKHelpers.generateStandardVideoPlayerEmbedHTML(data);
					break;
				case "ina.fr":
					insertHTML += '<div style="width: 600px; margin: 0 auto 0 auto; overflow: hidden; height: 100%;"><iframe width="600" height="350" frameborder="0" marginheight ="0" marginwidth="0" scrolling="no" src="'
							+ videoId + '"></iframe></div>';
					break;
				case "discovery.snag":
					insertHTML += '<div style="width: 550px; margin: 0 auto 0 auto; overflow: hidden; height: 100%;"><iframe width="550" height="350" src="' + vidSrc
							+ '" frameborder="0" scrolling="no" allowtransparency="true"></iframe></div>';
					break;
				case "iframe":
					insertHTML += '<iframe width="' + width + '" height="' + height + '" src="' + vidSrc + '" frameborder="0" scrolling="no" allowtransparency="true"></iframe>';
					break;
				case "file":
					data.videoUrl = vidSrc;
					insertHTML = assets.js.core.utils.AJKHelpers.generateStandardVideoPlayerEmbedHTML(data);
					break;
				}
				insertHTML = (insertHTML) ? insertHTML : '<div></div>';
				return insertHTML;
			},
			"public static generateStandardVideoPlayerEmbedHTML" : function(data) {
				var vidUrl = data.videoUrl;
				var audioUrl = data.audioUrl;
				var mediaUrl = (vidUrl) ? vidUrl : audioUrl;
				var mediaType = (vidUrl) ? "video" : "audio";
				var colour = data.colour;
				var insertHTML = "";
				var theme = theTLMainController.timeline.lightboxStyle;
				var backColor = (theme == 1) ? "FFFFFF" : "000000";
				var controlColor = (theme == 1) ? "333333" : "FFFFFF";
				if (this.isIDevice()) {
					if (mediaType == "audio") {
						insertHTML += '<audio style="display: block; width: 100%; height: 100%" src="' + audioUrl + '" controls autoplay height="100%" width="100%"></audio>';
					} else {
						insertHTML += '<video src="' + vidUrl + '" controls autoplay height="100%" width="100%"></video>';
					}
				} else if ($.browser.msie && $.browser.version < 9) {
					insertHTML += '<embed type="application/x-shockwave-flash" width="100%" height="100%" src="/assets/jaris-player/player.swf?1.002" allowfullscreen="true" bgcolor="#'
							+ backColor
							+ '" flashvars="source='
							+ mediaUrl
							+ '&streamtype=file&type='
							+ mediaType
							+ '&autostart=true&darkcolor='
							+ backColor
							+ '&brightcolor='
							+ backColor + '&controlcolor=' + controlColor + '&hovercolor=67A8C1&controltype=1">';
				} else {
					insertHTML += '<object id="player" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" name="player" width="100%" height="100%">';
					insertHTML += '<param name="movie" value="/assets/jaris-player/player.swf?1.002" />';
					insertHTML += '<param name="allowfullscreen" value="true" />';
					insertHTML += '<param name="bgcolor" value="#' + backColor + '" />';
					insertHTML += '<param name="flashvars" value="source=' + mediaUrl + '&streamtype=file&type=' + mediaType + '&duration=52&darkcolor=' + backColor
							+ '&brightcolor=' + backColor + '&controlcolor=' + controlColor + '&hovercolor=67A8C1&controltype=1" />';
					insertHTML += '<embed type="application/x-shockwave-flash" width="100%" height="100%" src="/assets/jaris-player/player.swf?1.002" allowfullscreen="true" bgcolor="#'
							+ backColor
							+ '" flashvars="source='
							+ mediaUrl
							+ '&streamtype=file&type='
							+ mediaType
							+ '&autostart=true&darkcolor='
							+ backColor
							+ '&brightcolor='
							+ backColor + '&controlcolor=' + controlColor + '&hovercolor=67A8C1&controltype=1">';
					insertHTML += '</object>';
				}
				return insertHTML;
			},
			"public static getImageSize" : function(data) {
				var imageUrl = data.imageUrl;
				var anImage = new Image();
				anImage.src = imageUrl;
				return {
					width : anImage.width,
					height : anImage.height
				};
			},
			"public static sizeImageToFitInBoxOfSize" : function(data) {
				var domImage = data.domImage;
				var boxSize = data.boxSize;
				var imageSize = data.imageSize;
				var returnScaledImageSize = data.returnScaledImageSize;
				var imageOffset = data.imageOffset;
				var scaledUp = data.scaledUp || 1;
				if ($.browser.isChrome && $.browser.isWindows && $(domImage).height() < 1 && !data.recursion && !imageSize) {
					var thisFunc = arguments.callee;
					data.recursion = true;
					setTimeout(function() {
						thisFunc(data);
					}, 0);
					return {};
				}
				if (imageOffset && typeof imageOffset.x == "undefined") {
					var newImageOffset = {};
					var splitVal = imageOffset.split(",");
					newImageOffset.x = (splitVal[0]) ? parseFloat(splitVal[0]) : 0;
					newImageOffset.y = (splitVal[1]) ? parseFloat(splitVal[1]) : 0;
					imageOffset = newImageOffset;
				}
				if (!imageSize) {
					imageSize = {
						width : $(domImage).width(),
						height : $(domImage).height()
					};
				}
				var adjustedDimensions = {
					height : 0,
					width : 0,
					xOffset : 0,
					yOffset : 0
				};
				if (imageSize.width / imageSize.height > boxSize.width / boxSize.height) {
					adjustedDimensions.height = boxSize.height;
					adjustedDimensions.width = Math.round(adjustedDimensions.height / imageSize.height * imageSize.width);
					adjustedDimensions.xOffset = -Math.round((adjustedDimensions.width - boxSize.width) / 2);
					adjustedDimensions.yOffset = 0;
				} else {
					adjustedDimensions.width = boxSize.width;
					adjustedDimensions.height = Math.round(adjustedDimensions.width / imageSize.width * imageSize.height);
					adjustedDimensions.yOffset = -Math.round((adjustedDimensions.height - boxSize.height) / 2);
					adjustedDimensions.xOffset = 0;
				}
				var adjustedAgainDimensions = {
					yOffset : adjustedDimensions.yOffset - (((adjustedDimensions.height * scaledUp) - adjustedDimensions.height) / 2),
					xOffset : adjustedDimensions.xOffset - (((adjustedDimensions.width * scaledUp) - adjustedDimensions.width) / 2),
					width : adjustedDimensions.width * scaledUp,
					height : adjustedDimensions.height * scaledUp
				};
				if (imageOffset) {
					var possXOffset = adjustedAgainDimensions.width - boxSize.width;
					adjustedAgainDimensions.xOffset = Math.round(-possXOffset / 2 + possXOffset / 2 * -imageOffset.x);
					var possYOffset = adjustedAgainDimensions.height - boxSize.height;
					adjustedAgainDimensions.yOffset = Math.round(-possYOffset / 2 + possYOffset / 2 * -imageOffset.y);
				}
				if (domImage) {
					$(domImage).css({
						width : adjustedAgainDimensions.width + "px",
						height : adjustedAgainDimensions.height + "px",
						left : adjustedAgainDimensions.xOffset + "px",
						top : adjustedAgainDimensions.yOffset + "px"
					});
				}
				if (returnScaledImageSize) {
					return adjustedDimensions;
				}
			},
			"public static renderCanvasText" : function(data) {
				var ctx = data.canvasContext;
				var x = data.textPos.x;
				var y = data.textPos.y;
				var maxWidth = data.maxWidth;
				var maxLines = (data.maxLines) ? data.maxLines : 5000;
				var lineHeight = data.lineHeight;
				var text = data.text;
				var retLines = "";
				var words = text.split(' ');
				var numWords = words.length;
				var lines = data.lines;
				if (lines) {
					$.each(lines, function() {
						ctx.fillText(this, x, y);
						y += lineHeight;
					});
				} else {
					var line = '';
					retLines = [];
					for (var n = 0; n < numWords; n++) {
						var testLine = line + words[n] + ' ';
						var metrics = ctx.measureText(testLine);
						var testWidth = metrics.width;
						if (testWidth > maxWidth && retLines.length < maxLines) {
							var cachedLine = line;
							retLines.push(cachedLine);
							ctx.fillText(line, x, y);
							line = words[n] + ' ';
							y += lineHeight;
						} else {
							line = testLine;
						}
					}
					if (retLines.length < maxLines) {
						retLines.push(line);
						ctx.fillText(line, x, y);
					}
				}
				return retLines || lines;
			},
			"public static customCreateClickableLinks" : function(data) {
				var aString = data.aString;
				var extra = (data.extra) ? data.extra : "";
				var myRegex = /\[(.*)\]\((.*)\)/gim;
				return aString.replace(myRegex, function() {
					extra = (assets.js.core.utils.AJKHelpers.isUrlToCurrentPage({
						url : RegExp.$2
					})) ? "" : extra;
					return '<a ' + extra + ' href="' + RegExp.$2 + '">' + RegExp.$1.replace(/-/g, " ") + '</a>';
				});
			},
			"public static isUrlToCurrentPage" : function(data) {
				var aUrl = data.url;
				aUrl = aUrl.split("#")[0];
				if (aUrl == "./") {
					return true;
				}
				var cUrl = window.location.href.toString();
				cUrl = cUrl.split("#")[0];
				return (cUrl == aUrl);
			},
			"public static createClickableLinks" : function(data) {
				var aString = data.aString;
				return aString.replace(/(ftp|http|https|file):\/\/[\S]+(\b|$)/gim, '<a href="$&">$&</a>').replace(/([^\/])(www[\S]+(\b|$))/gim, '$1<a href="http://$2">$2</a>');
			},
			"public static getMousePos" : function(data) {
				var event = data.event;
				xPos = yPos = false;
				if (document.layers) {
					xPos = event.x;
					yPos = event.y;
				} else if (document.all) {
					xPos = window.event.clientX;
					yPos = window.event.clientY;
				} else if (document.getElementById) {
					xPos = event.clientX;
					yPos = event.clientY;
				}
				return {
					x : xPos,
					y : yPos
				};
			},
			"public static getSelfOrFirstParantOfClass" : function(data) {
				var currentDomEl = data.domEl;
				var className = data.className;
				while (currentDomEl) {
					if ($(currentDomEl).hasClass(className)) {
						return currentDomEl;
					}
					currentDomEl = $(currentDomEl).parent()[0];
				}
				return false;
			},
			"public static generateRandomDate" : function(data) {
				var startDate = data.startDate;
				var endDate = data.endDate;
				var diff = endDate.getTime() - startDate.getTime();
				var randNum = Math.floor(Math.random() * diff);
				var retDate = new Date();
				retDate.setTime(startDate.getTime() + randNum);
				return retDate;
			},
			"public static getEmptyDate" : function() {
				var date = new Date();
				date.setTime(0);
				return date;
			},
			"public static cloneDate" : function(data) {
				var retDate = new Date();
				retDate.setTime(data.date.getTime());
				return retDate;
			},
			"public static createDateWithTime" : function(data) {
				var retDate = new Date();
				retDate.setTime(data.time);
				return retDate;
			},
			"public static getFirstDayOfYearDateForDate" : function(data) {
				var aDate = this.createDateWithTime({
					time : data.date.getTime()
				});
				aDate.setDate(1);
				aDate.setMonth(0);
				aDate.setHours(0);
				aDate.setMinutes(0);
				aDate.setSeconds(0);
				aDate.setMilliseconds(0);
				return aDate;
			},
			"public static getFirstDayOfMonthDateForDate" : function(data) {
				var aDate = this.createDateWithTime({
					time : data.date.getTime()
				});
				aDate.setDate(1);
				aDate.setHours(0);
				aDate.setMinutes(0);
				aDate.setSeconds(0);
				aDate.setMilliseconds(0);
				return aDate;
			},
			"public static numberOfDaysInMonth" : function(data) {
				var aDate = data.aDate;
				var year = aDate.getFullYear();
				var month = aDate.getMonth();
				var tmpStartDate = this.getEmptyDate();
				tmpStartDate.setFullYear(year);
				tmpStartDate.setMonth(month);
				tmpStartDate.setDate(1);
				var nextMonth = (month == 11) ? 0 : month + 1;
				var nextYear = (month == 11) ? year + 1 : year;
				var tmpEndDate = this.getEmptyDate();
				tmpEndDate.setFullYear(nextYear);
				tmpEndDate.setMonth(nextMonth);
				tmpEndDate.setDate(1);
				var numDays = Math.round((tmpEndDate.getTime() - tmpStartDate.getTime()) / this.dateOneDayInMS);
				return numDays;
			},
			"public static waitForId" : function(data) {
				var anObject = data.anObject;
				var callback = data.callback;
				var checkForId = function() {
					if (anObject.id == "awaiting") {
						var thisFunc = arguments.callee;
						setTimeout(function() {
							thisFunc();
						}, 100);
					} else if (callback) {
						callback();
					}
				};
				checkForId();
			},
			"public static cloneObj" : function(data) {
				var obj = data.obj;
				if (obj == null || typeof (obj) != 'object') {
					return obj;
				}
				var temp = new obj.constructor();
				for ( var key in obj) {
					temp[key] = this.cloneObj({
						obj : obj[key]
					});
				}
				return temp;
			},
			"public static jiggleDomEl" : function(data) {
				var domEl = data.domEl;
				var displacementFactor = data.displacementFactor;
				var leftOffset = ($(domEl).css("left") && $(domEl).css("left") != "auto") ? parseInt($(domEl).css("left"), 10) : 0;
				var position = $(domEl).css("position");
				if (position != "absolute") {
					$(domEl).css({
						position : "relative"
					});
				}
				var numRadians = 16;
				var steps = 25;
				for (var counter = 0; counter <= numRadians; counter += 0.2) {
					(function() {
						var lOffset = leftOffset + Math.cos(counter) * displacementFactor;
						var delay = parseInt(counter * steps, 10);
						setTimeout(function() {
							$(domEl).css({
								left : lOffset
							});
							if (Math.abs(delay - (numRadians * steps)) < 5) {
								$(domEl).css({
									position : position,
									left : leftOffset
								});
							}
						}, delay);
					}());
				}
			},
			"public static flashDomEl" : function(data) {
				var domEl = data.domEl;
				var numRadians = (data.numRadians) ? data.numRadians : 12;
				var steps = 50;
				for (var counter = 0; counter <= numRadians; counter += 0.2) {
					(function() {
						var opacity = Math.cos(counter);
						var delay = parseInt(counter * steps, 10);
						setTimeout(function() {
							$(domEl).css({
								opacity : 0.3 + 0.7 * opacity
							});
							if (Math.abs(delay - (numRadians * steps)) < 5) {
								$(domEl).css({
									opacity : 1
								});
							}
						}, delay);
					}());
				}
			},
			"public static isEmail" : function(data) {
				var self = this;
				var aString = data.aString;
				return aString
						.match(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
			},
			"public static cancelSelectionOnDomEl" : function(data) {
				var domEl = data.domEl;
				domEl.onselectstart = function() {
					return false;
				};
				domEl.unselectable = "on";
				domEl.style.MozUserSelect = "none";
			},
			"public static getCoordsOfDomEl" : function(data) {
				var domEl = data.domEl;
				var xPos = yPos = 0;
				if (domEl.offsetParent) {
					xPos = domEl.offsetLeft;
					yPos = domEl.offsetTop;
					while (domEl = domEl.offsetParent) {
						xPos += domEl.offsetLeft;
						yPos += domEl.offsetTop;
					}
				}
				return {
					x : xPos,
					y : yPos
				};
			},
			"public static get4CoordsOfDomEl" : function(data) {
				var domEl = data.domEl;
				var coords = this.getCoordsOfDomEl(data);
				coords.x2 = coords.x + $(domEl).width();
				coords.y2 = coords.y + $(domEl).height();
				return coords;
			},
			"public static calculateDomElHeight" : function(data) {
				var self;
				var domEl = data.domEl;
				var height = $(domEl).height();
				height += parseInt($(domEl).css("marginTop"), 10);
				height + parseInt($(domEl).css("marginBottom"), 10);
				return height;
			},
			"public static getNowDate" : function() {
				return new Date();
			},
			"public static trimArray" : function(data) {
				var anArray = data.anArray;
				var limit = (anArray.length < data.limit) ? anArray.length : data.limit;
				var counter = 0;
				var retArray = new Array();
				while (counter < limit) {
					retArray.push(anArray[counter++]);
				}
				return retArray;
			},
			"public static dateFromMySQLDate" : function(data) {
				var dateString = data.dateString;
				if (!dateString || dateString == "undefined") {
					return false;
				}
				var isBC = (dateString.indexOf("BC") != -1);
				dateString = dateString.replace(" BC", "").replace("BC", "");
				var containsMillion = (dateString.indexOf("million") != -1);
				var containsBillion = (dateString.indexOf("billion") != -1);
				if (containsMillion || containsBillion) {
					splitString = (containsMillion) ? dateString.split(" million") : dateString.split(" billion");
					var tYear = (containsMillion) ? splitString[0] * 1000000 : splitString[0] * 1000000000;
					dateString = parseInt(tYear, 10) + splitString[1];
				}
				var dateAllArray = dateString.split(" ");
				var dateArray = dateAllArray[0].split("-");
				var timeArray = dateAllArray[1].split(":");
				var date = this.getEmptyDate();
				date.setDate(parseInt(dateArray[2], 10));
				date.setMonth(parseInt(dateArray[1], 10) - 1);
				var aYear = parseInt(dateArray[0], 10);
				if (isBC) {
					date.setFullYear(-aYear);
				} else {
					date.setFullYear(aYear);
				}
				date.setHours(parseInt(timeArray[0], 10));
				date.setMinutes(parseInt(timeArray[1], 10));
				date.setSeconds(parseInt(timeArray[2], 10));
				return date;
			},
			"public static dateMillion" : "million",
			"public static dateBillion" : "billion",
			"public static dateAD" : "AD",
			"public static dateBC" : "BC",
			"public static dateWeekDayArray" : assets.js.core.setting.TLConfigText['basic_weekDays'],
			"public static dateWeekDayShortArray" : assets.js.core.setting.TLConfigText['basic_shortWeekDays'],
			"public static dateMonthsArray" : assets.js.core.setting.TLConfigText['basic_months'],
			"public static dateMonthsShortArray" : assets.js.core.setting.TLConfigText['basic_shortMonths'],
			"public static dateDaySuffixArray" : assets.js.core.setting.TLConfigText['basic_daySuffixes'],
			"public static dateOneHourInMS" : 1000 * 60 * 60,
			"public static dateOneDayInMS" : 1000 * 60 * 60 * 24,
			"public static dateOneYearInMS" : 1000 * 60 * 60 * 24 * 365.2425,
			"public static baseLangDateWeekDayArray" : [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
			"public static baseLangDateWeekDayShortArray" : [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
			"public static baseLangDateMonthsArray" : [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
			"public static baseLangDateMonthsShortArray" : [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
			"public static baseLangDateDaySuffixArray" : [ "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th",
					"st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th" ],
			"public static baseLangBC" : "BC",
			"public static baseLangAD" : "AD",
			"public static prettyDateFromMySQLDate" : function(data) {
				var jsDate = this.dateFromMySQLDate({
					dateString : data.dateString
				});
				return this.prettyDateFromDate({
					date : jsDate
				});
			},
			"public static formatDate" : function(data) {
				var date = data.date;
				var formatString = data.formatString;
				if (!formatString) {
					return formatString;
				}
				var prefix = (data.language && data.language == "base") ? "baseLangDate" : "date";
				var forceFullDate = data.forceFullDate;
				var aYear = date.getFullYear();
				if ((aYear > Date.STANDARDMAXFULLYEAR || aYear < -Date.STANDARDMAXFULLYEAR) && data.language == "base" && !forceFullDate) {
					formatString = "YYYY";
				}
				var firstOpenBracket = formatString.indexOf("[");
				var firstCloseBracket = formatString.indexOf("]");
				var lastChar = formatString.length - 1;
				if (firstOpenBracket != -1 && firstCloseBracket != -1 && firstCloseBracket > firstOpenBracket) {
					var beforeText = (firstOpenBracket != 0) ? formatString.slice(0, firstOpenBracket) : "";
					var middleText = formatString.slice(firstOpenBracket + 1, firstCloseBracket);
					var endText = ((firstCloseBracket + 1) > firstCloseBracket) ? formatString.slice(firstCloseBracket + 1) : "";
					return this.formatDate({
						date : date,
						formatString : beforeText
					}) + middleText + this.formatDate({
						date : date,
						formatString : endText
					});
				}
				formatString = formatString.replace(/Summer/, "SuXXer");
				formatString = formatString.replace(/summer/, "suXXer");
				formatString = formatString.replace(/YYYY/g, assets.js.core.utils.AJKHelpers.formatFullYearForDate({
					date : date,
					language : data.language
				}));
				formatString = formatString.replace(/MMMM/g, this[prefix + "MonthsArray"][date.getMonth()]);
				formatString = formatString.replace(/MMM/g, this[prefix + "MonthsShortArray"][date.getMonth()]);
				formatString = formatString.replace(/MM/g, this.doubleDigitNum({
					num : date.getMonth() + 1
				}));
				formatString = formatString.replace(/DD/g, this.doubleDigitNum({
					num : date.getDate()
				}));
				formatString = formatString.replace(/dd/g, date.getDate());
				formatString = formatString.replace(/nn/g, this[prefix + "DaySuffixArray"][date.getDate() - 1]);
				formatString = formatString.replace(/HH/g, this.doubleDigitNum({
					num : date.getHours()
				}));
				formatString = formatString.replace(/hh/g, this.twelveHourHour({
					hour : date.getHours()
				}));
				formatString = formatString.replace(/mm/g, this.doubleDigitNum({
					num : date.getMinutes()
				}));
				formatString = formatString.replace(/ss/g, this.doubleDigitNum({
					num : date.getSeconds()
				}));
				formatString = formatString.replace(/WKD/g, this[prefix + "WeekDayArray"][date.getDay()]);
				formatString = formatString.replace(/wkd/g, this[prefix + "WeekDayShortArray"][date.getDay()]);
				formatString = formatString.replace(/AMPM/g, this.amOrPmForHour({
					hour : date.getHours()
				}));
				formatString = formatString.replace(/SuXXer/, "Summer");
				formatString = formatString.replace(/suXXer/, "summer");
				return formatString;
			},
			"public static formatFullYearForDate" : function(data) {
				var date = data.date;
				var aYear = date.getFullYear();
				var yearString = assets.js.core.utils.AJKHelpers.quadrupleDigitNum({
					num : aYear
				});
				if (data.language == "base") {
					if (aYear < 0) {
						yearString += " " + this.baseLangBC;
					}
				} else {
					if (yearString > 9999) {
						yearString = this.prettifyYearString({
							year : yearString
						});
					}
					yearString = (aYear < 0) ? ((this.dateBC) ? yearString + " " + this.dateBC : "-" + yearString) : yearString;
				}
				return yearString;
			},
			"public static prettifyYearString" : function(data) {
				var retStr = "", aYear = data.year;
				if (this.dateMillion && this.dateBillion) {
					if (aYear > 999999999) {
						retStr = aYear / 1000000000;
						retStr = Math.round(retStr * 100) / 100;
						retStr = retStr.toString() + " " + this.dateBillion;
					} else if (aYear > 999999) {
						retStr = aYear / 1000000;
						retStr = Math.round(retStr * 100) / 100;
						retStr = retStr.toString() + " " + this.dateMillion;
					} else {
						retStr = aYear;
					}
				} else {
					retStr = aYear;
				}
				return retStr;
			},
			"public static prettyDateFromDate" : function(data) {
				var jsDate = data.date;
				var smallDate = data.smallDate;
				var fullMonth = data.fullMonth;
				var monthStringArray = (fullMonth) ? this.dateMonthsArray : this.dateMonthsShortArray;
				var x = jsDate.getYear();
				var y = x % 100;
				y += (y < 38) ? 2000 : 1900;
				var year = y;
				if (smallDate) {
					return jsDate.getDate() + "/" + (jsDate.getMonth() + 1) + "/" + year.toString().substring(2, 4);
				} else {
					return jsDate.getDate() + this.dateDaySuffixArray[jsDate.getDate() - 1] + " " + monthStringArray[jsDate.getMonth()] + " " + year;
				}
			},
			"public static prettyTimeFromDate" : function(data) {
				var jsDate = data.date;
				var amOrPm = this.amOrPmForHour({
					hour : jsDate.getHours()
				});
				var hour = this.twelveHourHour({
					hour : jsDate.getHours()
				});
				var minutes = jsDate.getMinutes();
				return hour + ":" + this.doubleDigitNum({
					num : minutes
				}) + amOrPm;
			},
			"public static prettyTimeFromMySQLDate" : function(data) {
				var jsDate = this.dateFromMySQLDate({
					dateString : data.dateString
				});
				return this.prettyTimeFromDate({
					date : jsDate
				});
			},
			"public static twelveHourHour" : function(data) {
				var hour = data.hour;
				var hour = hour % 12;
				hour = (hour == 0) ? 12 : hour;
				return hour;
			},
			"public static amOrPmForHour" : function(data) {
				var hour = data.hour;
				return (hour > 11) ? assets.js.core.setting.TLConfigText['basic_pm'] : assets.js.core.setting.TLConfigText['basic_am'];
			},
			"public static doubleDigitNum" : function(data) {
				var num = Math.abs(parseInt(data.num, 10));
				if (num == 0) {
					return "00";
				} else if (num < 10) {
					return "0" + num;
				} else {
					return num;
				}
			},
			"public static quadrupleDigitNum" : function(data) {
				var num = Math.abs(parseInt(data.num, 10));
				if (num == 0) {
					return "0000";
				} else if (num < 10) {
					return "000" + num;
				} else if (num < 100) {
					return "00" + num;
				} else if (num < 1000) {
					return "0" + num;
				} else {
					return num;
				}
			},
			"public static deleteCookie" : function(data) {
				var name = data.name;
				document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/';
			},
			"public static setCookie" : function(data) {
				var name = data.name;
				var value = data.value;
				var expires = data.expires;
				var path = (data.path) ? data.path : "/";
				var domain = data.domain;
				var secure = data.secure;
				var today = new Date();
				today.setTime(today.getTime());
				if (expires) {
					expires = expires * 1000 * 60 * 60 * 24;
				}
				var expires_date = new Date(today.getTime() + (expires));
				document.cookie = name + "=" + escape(value) + ((expires) ? ";expires=" + expires_date.toGMTString() : "") + ((path) ? ";path=" + path : "")
						+ ((domain) ? ";domain=" + domain : "") + ((secure) ? ";secure" : "");
			},
			"public static getCookie" : function(data) {
				var name = data.name;
				var start = document.cookie.indexOf(name + "=");
				var len = start + name.length + 1;
				if ((!start) && (name != document.cookie.substring(0, name.length))) {
					return null;
				}
				if (start == -1) {
					return null;
				}
				var end = document.cookie.indexOf(";", len);
				if (end == -1) {
					end = document.cookie.length;
				}
				return unescape(document.cookie.substring(len, end));
			},
			"public static removeItemFromArray" : function(data) {
				var item = data.item;
				var anArray = data.anArray;
				var itemIndex = anArray.indexOf(item);
				while (itemIndex != -1) {
					anArray.splice(itemIndex, 1);
					itemIndex = anArray.indexOf(item);
				}
				return anArray;
			},
			"public static isItemInArray" : function(data) {
				var item = data.item;
				var anArray = data.anArray;
				for (var counter = 0; counter < anArray.length; counter++) {
					if (anArray[counter] == item) {
						return true;
					}
				}
				return false;
			},
			"public static cloneArray" : function(data) {
				var anArray = data.anArray;
				var returnArray = new Array();
				for (var counter = 0; counter < anArray.length; counter++) {
					returnArray.push(anArray[counter]);
				}
				return returnArray;
			},
			"public static scrollbarWidth" : function() {
				document.body.style.overflow = 'hidden';
				var width = document.body.clientWidth;
				document.body.style.overflow = 'scroll';
				width -= document.body.clientWidth;
				if (!width)
					width = document.body.offsetWidth - document.body.clientWidth;
				document.body.style.overflow = '';
				return width;
			},
			"public static decode_base64" : function(s) {
				var e = {}, i, k, v = [], r = "", w = String.fromCharCode;
				var n = [ [ 65, 91 ], [ 97, 123 ], [ 48, 58 ], [ 47, 48 ], [ 43, 44 ] ];
				for (z in n) {
					for (i = n[z][0]; i < n[z][1]; i++) {
						v.push(w(i));
					}
				}
				for (i = 0; i < 64; i++) {
					e[v[i]] = i;
				}
				for (i = 0; i < s.length; i += 72) {
					var b = 0, c, x, l = 0, o = s.substring(i, i + 72);
					for (x = 0; x < o.length; x++) {
						c = e[o.charAt(x)];
						b = (b << 6) + c;
						l += 6;
						while (l >= 8) {
							r += w((b >>> (l -= 8)) % 256);
						}
					}
				}
				return r;
			},
			"public static extend" : function(subClass, superClass) {
				var F = function() {
				};
				F.prototype = superClass.prototype;
				subClass.prototype = new F();
				subClass.prototype.constructor = subClass;
				subClass.superClass = superClass.prototype;
				if (superClass.prototype.constructor == Object.prototype.constructor) {
					superClass.prototype.constructor = superClass;
				}
			},
			"public static clipToMaxCharWords" : function(data) {
				var aString = data.aString;
				var maxChars = data.maxChars;
				if (aString.length <= maxChars) {
					return aString;
				}
				var wordarray = aString.split(" ");
				var numwords = wordarray.length;
				var newstring = "";
				var laststring = "";
				for (var counter = 0; counter < numwords; counter++) {
					laststring = newstring;
					if (counter != 0) {
						newstring += (" " + wordarray[counter]);
					} else {
						newstring += wordarray[counter];
					}
					if (newstring.length > maxChars) {
						return (laststring + "...");
					}
				}
				return newstring;
			},
			"public static viewportSize" : function() {
				var myWidth = 0, myHeight = 0;
				if (typeof (window.innerWidth) == 'number') {
					myWidth = window.innerWidth;
					myHeight = window.innerHeight;
				} else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
					myWidth = document.documentElement.clientWidth;
					myHeight = document.documentElement.clientHeight;
				} else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
					myWidth = document.body.clientWidth;
					myHeight = document.body.clientHeight;
				}
				myWidth = (!myWidth) ? 100 : myWidth;
				myHeight = (!myHeight) ? 100 : myHeight;
				return {
					width : myWidth,
					height : myHeight
				};
			},
			"public static decipherQueryResult" : function(data) {
				return data.queryResult;
			},
			"public static adjustColour" : function(data) {
				var colour = data.colour;
				var adjust = data.adjust;
				var num = parseInt(colour, 16);
				var r = parseInt((num >> 16) * adjust);
				var b = parseInt(((num >> 8) & 0x00FF) * adjust);
				var g = parseInt((num & 0x0000FF) * adjust);
				r = (r < 0) ? 0 : (r > 255) ? 255 : r;
				b = (b < 0) ? 0 : (b > 255) ? 255 : b;
				g = (g < 0) ? 0 : (g > 255) ? 255 : g;
				var newColor = g | (b << 8) | (r << 16);
				newColor = newColor.toString(16);
				for (var counter = 6 - newColor.length; counter > 0; counter--) {
					newColor = "0" + newColor;
				}
				return newColor;
			},
			"public static removeScript" : function(data) {
				var content = data.content;
				if (!content || this.isScriptable) {
					return content;
				}
				content = content.replace(/&/g, "yugh678323");
				var domDiv = $("<div>" + content + "</div>").get()[0];
				$(domDiv).find("script").remove();
				var retContent = $(domDiv).html();
				if (retContent) {
					retContent = retContent.replace(/yugh678323/g, "&");
				}
				return retContent;
			},
			"public static prepareGTLTForText" : function(data) {
				var content = data.content;
				content = content.replace(/&#60;/g, "&#60");
				content = content.replace(/&#62;/g, "&#62");
				content = content.replace(/&#60/g, "&lt;");
				content = content.replace(/&#62/g, "&gt;");
				content = content.replace(/&lt;/g, "<");
				content = content.replace(/&gt;/g, ">");
				return content;
			}
		});