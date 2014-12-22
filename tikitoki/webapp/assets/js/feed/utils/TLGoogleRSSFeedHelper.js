Class.forName({
	name : "class assets.js.feed.utils.TLGoogleRSSFeedHelper extends Object",
	"public static defautNumRSSEntries" : 5,
	"public static googleFeedsApiKey" : "ABQIAAAAoS3NPqk2d6o96HgQgEr7jBQUtt4mvZP9P5pNofftEDxlb2GQSRSf6RrGPPDdNE4zh8WtTHRlW4a1xw",
	"public static getRSSEntriesForFeed" : function(data) {
		var feed = data.feed;
		var callback = data.callback;
		TLGoogleRSSFeedHelper.getRSSEntries({
			numRSSEntries : feed.numItems,
			startIndex : 1,
			url : feed.filter,
			callback : function(data) {
				callback({
					entries : data.itemObjs
				});
			}
		});
	},
	"public static getRSSEntries" : function(data) {
		var url = data.url;
		var callback = data.callback;
		var numRSSEntries = data.numRSSEntries;
		var startIndex = data.startIndex;
		var url = (url.indexOf("http:") == -1 && url.indexOf("https:") == -1) ? "http://" + url : url;
		var path = "http://ajax.googleapis.com/ajax/services/feed/load?callback=?";
		var key = TLGoogleRSSFeedHelper.googleFeedsApiKey;
		if (key) {
			path += ("&key=" + key);
		}
		$.getJSON(path, {
			"v" : "1.0",
			"q" : url,
			"num" : numRSSEntries
		}, function(data) {
			TLGoogleRSSFeedHelper.feedLoadFunc({
				callback : callback,
				feedData : data
			});
		});
	},
	"public static feedLoadFunc" : function(data) {
		var callback = data.callback;
		var feedData = data.feedData;
		if (!feedData || !feedData.responseData) {
			callback({
				itemObjs : []
			});
			return;
		}
		var returnObjs = TLGoogleRSSFeedHelper.processJSONFromArray({
			anArray : feedData.responseData.feed.entries
		});
		callback({
			itemObjs : returnObjs
		});
	},
	"public static processDate" : function(data) {
		var aDate = data.dateString;
		var retDate = (Date.parse(aDate));
		if (retDate) {
			return retDate;
		}
		var aDateSplit = aDate.split(" ");
		var newDateString = aDateSplit[1] + " " + aDateSplit[2] + " " + aDateSplit[3] + " " + aDateSplit[4];
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
			var aDate = TLGoogleRSSFeedHelper.processDate({
				dateString : this.publishedDate
			});
			if (!aDate || !aDate.getTime) {
				aDate = new Date();
			}
			var feedImages = [];
			var feedAudio = [];
			if (this.mediaGroups && this.mediaGroups[0] && this.mediaGroups[0].contents) {
				$.each(this.mediaGroups[0].contents, function() {
					if (this.url && this.type && this.type.indexOf("audio") != -1) {
						feedAudio.push(this.url);
					} else if (this.url) {
						feedImages.push(this.url);
					}
				});
			}
			var domContent = $("<div>" + this.content + "</div>").get()[0];
			$(domContent).find("img").each(
					function() {
						var src = $(this).attr("src");
						if (src
								&& src.indexOf("http:") != -1
								&& (src.toLowerCase().indexOf(".png") != -1 || src.toLowerCase().indexOf(".jpg") != -1 || src.toLowerCase().indexOf(".jpeg") != -1 || src
										.toLowerCase().indexOf(".gif") != -1)) {
							feedImages.push(src);
						}
					});
			var anObj = {
				id : this.link,
				owner : "",
				title : this.title,
				description : this.contentSnippet,
				url : this.link,
				images : feedImages,
				audio : feedAudio,
				ownername : this.author,
				date : aDate,
				index : counter++
			};
			returnObjs.push(anObj);
		});
		return returnObjs;
	}
});