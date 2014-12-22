Class.forName({
	name : "class assets.js.security.component.AJKFlickrImageSelector extends Object",
	AJKFlickrImageSelector : function(data) {
		var self = this;
		self.domRoot = data.domRoot;
		self.controller = data.controller;
		self.imageSelectedFunc = data.imageSelectedFunc;
		self.remainingFlickrImagesFunc = data.remainingFlickrImagesFunc;
		self.feedSelector = "";
		self.flickrApiKey = theTLSettings.flickrApiKey;
		self.numItemsPerPage = 12;
		self.imageSize = "";
		self.cachedFlickrUsers = new Array();
		self.domNumImages = "";
		self.domCaptionField = "";
	},
	init : function() {
		var self = this;
		self.feedSelector = new AJKFeedItemSelector({
			domRoot : self.domRoot,
			domClass : "tl-ah-flickr-image-selector",
			title : TLConfigText['flickrImageSelector_title'],
			intro : TLConfigText['flickrImageSelector_intro'],
			numItemsPerPage : self.numItemsPerPage,
			option1Title : TLConfigText['flickrImageSelector_option1Title'],
			option1Text : TLConfigText['flickrImageSelector_option1Text'],
			option1Label : TLConfigText['flickrImageSelector_option1Label'],
			option1Message : TLConfigText['flickrImageSelector_option1Message'] + " 'X_CRITERIA_X'",
			option2Title : TLConfigText['flickrImageSelector_option2Title'],
			option2Text : TLConfigText['flickrImageSelector_option2Text'],
			option2Label : TLConfigText['flickrImageSelector_option2Label'],
			option2Message : TLConfigText['flickrImageSelector_option2Message'] + " 'X_CRITERIA_X'",
			itemSelectedFunc : function(data) {
				var item = data.item;
				self.showSelectedItem({
					src : item[self.imageSize]
				});
				if (self.domCaptionField) {
					$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
						method : "flickr.photos.getInfo",
						api_key : self.flickrApiKey,
						photo_id : item.id,
						secret : item.secret,
						format : "json"
					}, function(data) {
						var displayName = (data.photo.owner.realname) ? data.photo.owner.realname : data.photo.owner.username;
						var userUrl = "http://www.flickr.com/people/" + data.photo.owner.nsid + "/";
						var caption = TLConfigText['flickrImageSelector_Photo_credit'] + ': <a href="' + userUrl + '">' + displayName + '</a>';
						$(self.domCaptionField).val(caption);
						$(self.domCaptionField).blur();
						if (self.domThumbPosField) {
							$(self.domThumbPosField).val("0,0").blur();
						}
					});
				}
			},
			processFeedFunc : function(data) {
				var fieldData = data.fieldData;
				var page = data.page;
				var callback = data.callback;
				if (fieldData["opt1Search"]) {
					$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
						method : "flickr.photos.search",
						text : fieldData["opt1Search"],
						page : data.page,
						per_page : self.numItemsPerPage,
						license : "1,2,3,4,5,6,7",
						api_key : self.flickrApiKey,
						format : "json"
					}, function(data) {
						var numPages = data.photos.pages;
						self.feedSelector.setNumberOfPages({
							value : numPages
						});
						var returnObjs = self.processImageJSONFromArray({
							anArray : data.photos.photo
						});
						if (callback) {
							callback({
								itemObjs : returnObjs
							});
						}
					});
				} else if (fieldData["opt2Search"]) {
					var flickrUsername = fieldData["opt2Search"];
					if (!self.cachedFlickrUsers[flickrUsername]) {
						$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
							method : "flickr.people.findByUsername",
							username : flickrUsername,
							api_key : self.flickrApiKey,
							format : "json"
						}, function(data) {
							if (!data.user) {
								if (callback) {
									callback({});
								}
								return;
							}
							var userId = data.user.nsid;
							self.cachedFlickrUsers[flickrUsername] = {
								username : flickrUsername,
								userId : userId
							};
							self.getPhotosForUser({
								userId : userId,
								page : page,
								callback : function(data) {
									if (callback) {
										callback(data);
									}
								}
							});
						});
					} else {
						self.getPhotosForUser({
							userId : self.cachedFlickrUsers[flickrUsername].userId,
							page : page,
							callback : function(data) {
								if (callback) {
									callback(data);
								}
							}
						});
					}
				}
			}
		}).init();
		self.domNumImages = $(self.domRoot).find("#tl-flickr-image-limiter").get()[0];
		return self;
	},
	showSelectedItem : function(data) {
		var self = this;
		var src = data.src;
		self.imageSelectedFunc({
			src : src
		});
	},
	getPhotosForUser : function(data) {
		var self = this;
		var userId = data.userId;
		var callback = data.callback;
		var page = data.page;
		$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
			method : "flickr.people.getPublicPhotos",
			user_id : userId,
			page : page,
			per_page : self.numItemsPerPage,
			api_key : self.flickrApiKey,
			format : "json"
		}, function(data) {
			var numPages = data.photos.pages;
			self.feedSelector.setNumberOfPages({
				value : numPages
			});
			var returnObjs = self.processImageJSONFromArray({
				anArray : data.photos.photo
			});
			if (callback) {
				callback({
					itemObjs : returnObjs
				});
			}
		});
	},
	processImageJSONFromArray : function(data) {
		var self = this;
		var anArray = data.anArray;
		var returnObjs = new Array();
		var counter = 0;
		$.each(anArray, function() {
			var anObj = {
				id : this.id,
				owner : this.owner,
				caption : this.title,
				secret : this.secret,
				thumb : "http://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_s.jpg",
				small : "http://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_m.jpg",
				medium : "http://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_-.jpg",
				large : "http://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_b.jpg",
				index : counter++
			};
			anObj.domEl = self.createDomItem({
				anItemObj : anObj
			});
			returnObjs.push(anObj);
		});
		return returnObjs;
	},
	createDomItem : function(data) {
		var self = this;
		var anItemObj = data.anItemObj;
		var thumbUrl = anItemObj.thumb;
		var index = anItemObj.index;
		var extraClass = (index % (self.numItemsPerPage / 2) == 0) ? " tl-ah-fis-image-block-row-start" : "";
		var insertHTML = "";
		insertHTML += '<div class="tl-ah-fis-image-block' + extraClass + '">';
		insertHTML += '<a class="ajk-fis-select-click tl-ah-fis-image-holder" href="#">';
		insertHTML += '<img src="' + thumbUrl + '"/>';
		insertHTML += '</a>';
		insertHTML += '<a class="tl-ah-fis-image-expand ajk-fis-image-expand" href="#">' + TLConfigText['flickrImageSelector_Expand'] + '</a>';
		insertHTML += '</div>';
		return $(insertHTML).get()[0];
	},
	updateRemainingImages : function() {
		var self = this;
		if (self.remainingFlickrImagesFunc && !self.controller.isStandardPage) {
			var numImages = self.remainingFlickrImagesFunc();
			$(self.domNumImages).text(numImages);
			if (numImages > 0) {
				$(self.domRoot).removeClass("tl-ah-fis-disable-image-selection");
			} else {
				$(self.domRoot).addClass("tl-ah-fis-disable-image-selection");
			}
		}
	},
	launch : function(data) {
		var self = this;
		self.imageSize = data.imageSize;
		self.domCaptionField = data.domCaptionField;
		self.domThumbPosField = data.domThumbPosField;
		if (self.alreadyLaunched) {
			return self.open();
		}
		self.alreadyLaunched = true;
		self.updateRemainingImages();
		self.feedSelector.openPanel();
	},
	close : function() {
		var self = this;
		self.updateRemainingImages();
		self.feedSelector.closePanel();
	},
	open : function() {
		var self = this;
		self.feedSelector.openPanel();
	}
});