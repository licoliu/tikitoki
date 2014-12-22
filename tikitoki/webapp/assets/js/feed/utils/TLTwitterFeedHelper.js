Class.forName({
	name : "class assets.js.feed.utils.TLTwitterFeedHelper extends Object",
	"public static defautNumTweets" : 5,
	"public static getTweetsForFeed" : function(data) {
		var feed = data.feed;
		var callback = data.callback;
		if (feed.filter == "twitter-username") {
			TLTwitterFeedHelper.getTweetsFromUsername({
				numTweets : feed.numItems,
				startIndex : 1,
				username : feed.param1,
				callback : function(data) {
					callback({
						tweets : data.itemObjs
					});
				}
			});
		} else if (feed.filter == "twitter-search") {
			TLTwitterFeedHelper.getTweetsForSearchTerm({
				numTweets : feed.numItems,
				startIndex : 1,
				searchTerm : feed.param1,
				callback : function(data) {
					callback({
						tweets : data.itemObjs
					});
				}
			});
		}
	},
	"public static getTweetsFromUsername" : function(data) {
		var callback = data.callback;
		$.getJSON("http://api.twitter.com/1/statuses/user_timeline.json?callback=?", {
			"screen_name" : data.username,
			"include_rts" : 1,
			"page" : data.startIndex,
			"count" : data.numTweets
		}, function(data) {
			TLTwitterFeedHelper.feedLoadFunc({
				callback : callback,
				feedData : data
			});
		});
	},
	"public static getTweetsForSearchTerm" : function(data) {
		var callback = data.callback;
		$.getJSON("http://search.twitter.com/search.json?callback=?", {
			"q" : data.searchTerm,
			"result_type" : "recent",
			"rpp" : data.numTweets
		}, function(data) {
			TLTwitterFeedHelper.feedLoadFunc({
				callback : callback,
				feedData : data.results
			});
		});
	},
	"public static feedLoadFunc" : function(data) {
		var callback = data.callback;
		var feedData = data.feedData;
		if (!feedData) {
			callback({
				itemObjs : []
			});
			return;
		}
		var returnObjs = TLTwitterFeedHelper.processJSONFromArray({
			anArray : feedData
		});
		callback({
			itemObjs : returnObjs
		});
	},
	"public static processDate" : function(data) {
		var aDate = data.dateString;
		var searchFormat = data.searchFormat;
		var aDateSplit = aDate.split(" ");
		if (!searchFormat) {
			var newDateString = aDateSplit[1] + " " + aDateSplit[2] + " " + aDateSplit[5] + " " + aDateSplit[3];
		} else {
			var newDateString = aDateSplit[1] + " " + aDateSplit[2] + " " + aDateSplit[3] + " " + aDateSplit[4];
		}
		return Date.parse(newDateString);
	},
	"public static processJSONFromArray" : function(data) {
		var anArray = data.anArray;
		var returnObjs = new Array();
		var counter = 0;
		if (!anArray) {
			return [];
		}
		$.each(anArray, function() {
			if (this.user) {
				var anImage = this.user.profile_image_url;
				var ownername = this.user.screen_name;
				var aDate = TLTwitterFeedHelper.processDate({
					dateString : this.created_at
				});
			} else {
				var anImage = this.profile_image_url;
				var ownername = this.from_user;
				var aDate = TLTwitterFeedHelper.processDate({
					dateString : this.created_at,
					searchFormat : true
				});
			}
			var anObj = {
				id : this.id,
				owner : "",
				title : this.text,
				description : this.text,
				url : "",
				image : anImage,
				ownername : ownername,
				date : aDate,
				index : counter++
			};
			returnObjs.push(anObj);
		});
		return returnObjs;
	}
});