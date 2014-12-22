Class.forName({
	name : "class assets.js.feed.utils.TLFlickrFeedHelper extends Object",

	"public static defautPerPage" : 20,
	"public static cachedFlickrUsers" : [],
	"public static getPhotosForFeed" : function(data) {
		var feed = data.feed;
		var callback = data.callback;
		if (feed.filter == "flickr-latest") {
			TLFlickrFeedHelper.getLatestPhotos({
				perPage : feed.numItems,
				page : 1,
				callback : function(data) {
					callback({
						photos : data.itemObjs
					});
				}
			});
		} else if (feed.filter == "flickr-interesting") {
			TLFlickrFeedHelper.getMostInterestingPhotos({
				perPage : feed.numItems,
				page : 1,
				callback : function(data) {
					callback({
						photos : data.itemObjs
					});
				}
			});
		} else if (feed.filter == "flickr-username") {
			TLFlickrFeedHelper.getPhotosFromUsername({
				perPage : feed.numItems,
				page : 1,
				username : feed.param1,
				callback : function(data) {
					callback({
						photos : data.itemObjs
					});
				}
			});
		} else if (feed.filter == "flickr-search") {
			TLFlickrFeedHelper.getPhotosForSearchTerm({
				perPage : feed.numItems,
				page : 1,
				searchTerm : feed.param1,
				callback : function(data) {
					callback({
						photos : data.itemObjs
					});
				}
			});
		}
	},
	"public static getPhotosFromUsername" : function(data) {
		var username = data.username;
		var callback = data.callback;
		var perPage = data.perPage;
		var page = data.page;
		if (!TLFlickrFeedHelper.cachedFlickrUsers[username]) {
			$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
				method : "flickr.people.findByUsername",
				username : username,
				api_key : theTLSettings.flickrApiKey,
				format : "json"
			}, function(data) {
				if (!data.user) {
					if (callback) {
						callback({
							itemObjs : []
						});
					}
					return;
				}
				var userId = data.user.nsid;
				TLFlickrFeedHelper.cachedFlickrUsers[username] = {
					username : username,
					userId : userId
				};
				TLFlickrFeedHelper.getPhotosForUser({
					userId : userId,
					perPage : perPage,
					page : page,
					callback : function(data) {
						if (callback) {
							callback(data);
						}
					}
				});
			});
		} else {
			TLFlickrFeedHelper.getPhotosForUser({
				userId : TLFlickrFeedHelper.cachedFlickrUsers[username].userId,
				page : page,
				perPage : perPage,
				callback : function(data) {
					if (callback) {
						callback(data);
					}
				}
			});
		}
	},
	"public static feedLoadFunc" : function(data) {
		var callback = data.callback;
		var feedData = data.feedData;
		if (!feedData || !feedData.photos || !feedData.photos.photo) {
			callback({
				itemObjs : []
			});
			return;
		}
		var returnObjs = TLFlickrFeedHelper.processImageJSONFromArray({
			anArray : feedData.photos.photo
		});
		callback({
			itemObjs : returnObjs
		});
	},
	"public static getPhotosForSearchTerm" : function(data) {
		console.log("hello");
		var callback = data.callback;
		var searchTerm = data.searchTerm;
		$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
			method : "flickr.photos.search",
			text : searchTerm,
			extras : "owner_name,date_upload,date_taken",
			page : data.page,
			per_page : data.perPage,
			license : "1,2,3,4,5,6,7",
			api_key : theTLSettings.flickrApiKey,
			format : "json"
		}, function(data) {
			TLFlickrFeedHelper.feedLoadFunc({
				callback : callback,
				feedData : data
			});
		});
	},
	"public static getPhotosForUser" : function(data) {
		var userId = data.userId;
		var callback = data.callback;
		var page = data.page;
		var perPage = data.perPage;
		$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
			method : "flickr.people.getPublicPhotos",
			extras : "owner_name,date_upload,date_taken",
			user_id : userId,
			page : page,
			per_page : perPage,
			api_key : theTLSettings.flickrApiKey,
			format : "json"
		}, function(data) {
			TLFlickrFeedHelper.feedLoadFunc({
				callback : callback,
				feedData : data
			});
		});
	},
	"public static getMostInterestingPhotos" : function(data) {
		var callback = data.callback;
		var page = data.page;
		var perPage = data.perPage;
		$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
			method : "flickr.interestingness.getList",
			page : data.page,
			per_page : data.perPage,
			api_key : theTLSettings.flickrApiKey,
			extras : "owner_name,date_upload,date_taken",
			format : "json"
		}, function(data) {
			TLFlickrFeedHelper.feedLoadFunc({
				callback : callback,
				feedData : data
			});
		});
	},
	"public static getLatestPhotos" : function(data) {
		var callback = data.callback;
		var page = data.page;
		var perPage = data.perPage;
		$.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
			method : "flickr.photos.getRecent",
			page : data.page,
			per_page : data.perPage,
			api_key : theTLSettings.flickrApiKey,
			extras : "owner_name,date_upload,date_taken",
			format : "json"
		}, function(data) {
			TLFlickrFeedHelper.feedLoadFunc({
				callback : callback,
				feedData : data
			});
		});
	},
	"public static processImageJSONFromArray" : function(data) {
		var anArray = data.anArray;
		var returnObjs = new Array();
		var counter = 0;
		if (!anArray) {
			return [];
		}
		$.each(anArray, function() {
			var anObj = {
				id : this.id,
				owner : this.owner,
				caption : this.title,
				secret : this.secret,
				thumb : "https://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_s.jpg",
				small : "https://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_m.jpg",
				medium : "https://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_-.jpg",
				large : "https://farm" + this.farm + ".static.flickr.com/" + this.server + "/" + this.id + "_" + this.secret + "_b.jpg",
				ownername : this.ownername,
				dateupload : this.dateupload,
				datetaken : this.datetaken,
				index : counter++
			};
			returnObjs.push(anObj);
		});
		return returnObjs;
	}
});