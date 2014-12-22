$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.feed.utils.TLYouTubeFeedHelper extends Object",
	"public static defautNumVideos" : 20,
	"public static defaultThumbImage" : "assets/ui/youtube-default-thumb.jpg",
	"public static getVideosForFeed" : function(data) {
		var feed = data.feed;
		var callback = data.callback;
		var numItems = (feed.numItems > 50) ? 50 : feed.numItems;
		if (feed.filter == "youtube-username") {
			TLYouTubeFeedHelper.getVideosFromUsername({
				numVideos : numItems,
				startIndex : 1,
				username : feed.param1,
				callback : function(data) {
					callback({
						videos : data.itemObjs
					});
				}
			});
		} else if (feed.filter == "youtube-search") {
			TLYouTubeFeedHelper.getVideosForSearchTerm({
				numVideos : numItems,
				startIndex : 1,
				searchTerm : feed.param1,
				callback : function(data) {
					callback({
						videos : data.itemObjs
					});
				}
			});
		} else {
			var feedType = feed.filter.split("youtube-")[1];
			TLYouTubeFeedHelper.getVideosForStandardFeedOfType({
				type : feedType,
				numVideos : numItems,
				startIndex : 1,
				callback : function(data) {
					callback({
						videos : data.itemObjs
					});
				}
			});
		}
	},
	"public static getVideosFromUsername" : function(data) {
		var callback = data.callback;
		$.getJSON("https://gdata.youtube.com/feeds/api/users/" + data.username + "/uploads" + "?callback=?", {
			"start-index" : data.startIndex,
			"max-results" : data.numVideos,
			"v" : 2,
			"alt" : "json"
		}, function(data) {
			TLYouTubeFeedHelper.feedLoadFunc({
				callback : callback,
				feedData : data
			});
		});
	},
	"public static getVideosForStandardFeedOfType" : function(data) {
		var callback = data.callback;
		$.getJSON("https://gdata.youtube.com/feeds/api/standardfeeds/" + data.type + "?callback=?", {
			"start-index" : data.startIndex,
			"max-results" : data.numVideos,
			"v" : 2,
			"alt" : "json",
			"orderby" : "published"
		}, function(data) {
			TLYouTubeFeedHelper.feedLoadFunc({
				callback : callback,
				feedData : data
			});
		});
	},
	"public static getVideosForSearchTerm" : function(data) {
		var callback = data.callback;
		$.getJSON("http://gdata.youtube.com/feeds/api/videos" + "?callback=?", {
			"q" : data.searchTerm,
			"start-index" : data.startIndex,
			"max-results" : data.numVideos,
			"v" : 2,
			"alt" : "json",
			"orderby" : "published"
		}, function(data) {
			TLYouTubeFeedHelper.feedLoadFunc({
				callback : callback,
				feedData : data
			});
		});
	},
	"public static feedLoadFunc" : function(data) {
		var callback = data.callback;
		var feedData = data.feedData;
		if (!feedData || !feedData.feed || !feedData.feed.entry) {
			return;
		}
		var returnObjs = TLYouTubeFeedHelper.processJSONFromArray({
			anArray : feedData.feed.entry
		});
		callback({
			itemObjs : returnObjs
		});
	},
	"public static processJSONFromArray" : function(data) {
		var anArray = data.anArray;
		var returnObjs = new Array();
		var counter = 0;
		if (!anArray) {
			return [];
		}
		$.each(anArray, function() {
			if (this["media$group"] && this["media$group"]["media$description"] && this["media$group"]["media$description"].type == "plain") {
				var description = this["media$group"]["media$description"]["$t"];
			} else {
				var description = "";
			}
			var thumbImage = (this["media$group"]["media$thumbnail"]) ? this["media$group"]["media$thumbnail"][1] || this["media$group"]["media$thumbnail"][0] : {
				url : TLYouTubeFeedHelper.defaultThumbImage
			};
			var aDate = this.published["$t"];
			aDate = aDate.replace("T", " ").replace(".000Z", "");
			var anObj = {
				id : this.id["$t"].split("video:")[1],
				owner : this.author[0].name["$t"],
				title : this.title["$t"],
				description : description,
				url : this.link[0].href,
				image : thumbImage.url,
				ownername : this.author[0].name["$t"],
				date : assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
					dateString : aDate
				}),
				index : counter++
			};
			returnObjs.push(anObj);
		});
		return returnObjs;
	}
});