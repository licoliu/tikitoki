var TLFeedController = function(data) {
	var self = this;
	self.feeds = data.feeds;
	self.feedsByKey = [];
	self.keyPrefix = "tl-feed-";
	self.feedsLoadedCallback = data.feedsLoadedCallback;
	self.controller = data.controller;
	self.timeline = self.controller.timeline;
	self.feedStoryId = 1;
	self.feedStoryIdPrefix = "tl-feed-story-";
};
TLFeedController.prototype = {
	init : function() {
		var self = this;
		$.each(self.feeds, function() {
			self.initialiseFeed({
				feed : this
			});
		});
		self.loadFeeds({
			callback : self.feedsLoadedCallback
		});
		return self;
	},
	initialiseFeed : function(data) {
		var self = this;
		var feed = data.feed;
		feed.name = AJKHelpers.removeScript({
			content : feed.name
		});
		feed.feedsKey = self.keyPrefix + feed.id;
		self.feedsByKey[feed.feedsKey] = feed;
		var feedCat = self.timeline.categoriesByKey[self.controller.categoriesKeyPrefix + feed.category];
		feedCat = (feedCat) ? feedCat : (self.timeline.categories[0]) ? self.timeline.categories[0] : self.controller.defaultCategory;
		feed.category = feedCat;
	},
	removeFeed : function(data) {
		var self = this;
		var feed = data.feed;
		$.each(feed.markers, function() {
			this.toBeRemoved = true;
		});
		var newMarkerArray = [];
		$.each(self.controller.markers, function() {
			if (!this.toBeRemoved) {
				newMarkerArray.push(this);
			}
		});
		self.controller.markers = newMarkerArray;
	},
	loadNewFeed : function(data) {
		var self = this;
		var callback = data.callback;
		var feed = data.feed;
		self.initialiseFeed({
			feed : feed
		});
		self.loadFeed({
			feed : feed,
			callback : function() {
				if (callback) {
					callback();
				}
			}
		});
	},
	loadFeeds : function() {
		var self = this;
		var numFeeds = self.feeds.length;
		var feedsLoaded = 0;
		if (numFeeds > 0) {
			$.each(self.feeds, function() {
				self.loadFeed({
					feed : this,
					callback : function() {
						if (++feedsLoaded >= numFeeds) {
							self.feedsLoadedCallback();
						}
					}
				});
			});
		} else {
			self.feedsLoadedCallback();
		}
	},
	loadFeed : function(data) {
		var self = this;
		var callback = data.callback;
		var feed = data.feed;
		var feedCancelled = false;
		var cancelFeedTimer = setTimeout(function() {
			feedCancelled = true;
			callback();
		}, 5000);
		if (feed.source == "flickr") {
			TLFlickrFeedHelper.getPhotosForFeed({
				feed : feed,
				callback : function(data) {
					if (feedCancelled) {
						return;
					}
					clearTimeout(cancelFeedTimer);
					var photos = data.photos;
					$.each(photos, function() {
						var markerDate = AJKHelpers.dateFromMySQLDate({
							dateString : this.datetaken
						});
						var aMarker = self.controller.createMarker({
							id : self.feedStoryIdPrefix + self.feedStoryId,
							ownerId : "",
							ownerName : this.ownername,
							startDate : markerDate,
							endDate : new Date(markerDate.getTime()),
							media : [ {
								id : this.id,
								src : this.small,
								caption : "",
								type : "Image",
								externalMediaThumb : "",
								externalMediaType : "",
								externalMediaId : "",
								orderIndex : 10
							} ],
							headline : this.caption,
							introText : "An image uploaded to Flickr by " + this.ownername,
							category : feed.category
						});
						aMarker.extraInfoLoaded = true;
						aMarker.feedSource = "flickr";
						aMarker.uneditable = true;
						if (!feed.markers) {
							feed.markers = [];
						}
						feed.markers.push(aMarker);
					});
					callback();
				}
			});
		} else if (feed.source == "youtube") {
			TLYouTubeFeedHelper.getVideosForFeed({
				feed : feed,
				callback : function(data) {
					if (feedCancelled) {
						return;
					}
					clearTimeout(cancelFeedTimer);
					var videos = data.videos;
					$.each(videos, function() {
						var markerDate = this.date;
						var aMarker = self.controller.createMarker({
							id : self.feedStoryIdPrefix + self.feedStoryId,
							ownerId : "",
							ownerName : this.ownername,
							startDate : markerDate,
							endDate : new Date(markerDate.getTime()),
							media : [ {
								id : this.id,
								src : "http://www.youtube.com/watch?v=" + this.id,
								caption : "",
								type : "Video",
								externalMediaThumb : this.image,
								externalMediaType : "youtube",
								externalMediaId : this.id,
								orderIndex : 10
							} ],
							headline : this.title,
							introText : this.description,
							category : feed.category,
							externalLink : this.url
						});
						aMarker.extraInfoLoaded = true;
						aMarker.feedSource = "youtube";
						aMarker.uneditable = true;
						if (!feed.markers) {
							feed.markers = [];
						}
						feed.markers.push(aMarker);
					});
					callback();
				}
			});
		} else if (feed.source == "twitter") {
			TLTwitterFeedHelper.getTweetsForFeed({
				feed : feed,
				callback : function(data) {
					if (feedCancelled) {
						return;
					}
					clearTimeout(cancelFeedTimer);
					var tweets = data.tweets;
					$.each(tweets, function() {
						var markerDate = this.date;
						var aMarker = self.controller.createMarker({
							id : self.feedStoryIdPrefix + self.feedStoryId,
							ownerId : "",
							ownerName : this.ownername,
							startDate : markerDate,
							endDate : new Date(markerDate.getTime()),
							media : [ {
								id : this.id,
								src : this.image,
								caption : "",
								type : "Image",
								externalMediaThumb : "",
								externalMediaType : "",
								externalMediaId : "",
								orderIndex : 10
							} ],
							headline : AJKHelpers.clipToMaxCharWords({
								aString : this.title,
								maxChars : 50
							}),
							introText : this.description,
							category : feed.category,
							externalLink : "http://www.twitter.com/" + this.ownername
						});
						aMarker.extraInfoLoaded = true;
						aMarker.feedSource = "twitter";
						aMarker.uneditable = true;
						if (!feed.markers) {
							feed.markers = [];
						}
						feed.markers.push(aMarker);
					});
					callback();
				}
			});
		} else if (feed.source == "rss") {
			TLGoogleRSSFeedHelper.getRSSEntriesForFeed({
				feed : feed,
				callback : function(data) {
					if (feedCancelled) {
						return;
					}
					clearTimeout(cancelFeedTimer);
					var entries = data.entries;
					$.each(entries, function() {
						var markerDate = this.date;
						var media = [];
						$.each(this.images, function() {
							media.push({
								id : this,
								src : this,
								caption : "",
								type : "Image",
								externalMediaThumb : "",
								externalMediaType : "",
								externalMediaId : "",
								orderIndex : 10
							});
						});
						$.each(this.audio, function() {
							media.push({
								id : this,
								src : this,
								caption : "",
								type : "Audio",
								externalMediaThumb : "",
								externalMediaType : "",
								externalMediaId : "",
								orderIndex : 10
							});
						});
						var aMarker = self.controller.createMarker({
							id : self.feedStoryIdPrefix + self.feedStoryId,
							ownerId : "",
							ownerName : this.ownername,
							startDate : markerDate,
							endDate : new Date(markerDate.getTime()),
							media : media,
							headline : AJKHelpers.clipToMaxCharWords({
								aString : this.title,
								maxChars : 50
							}),
							introText : this.description,
							category : feed.category,
							externalLink : this.url
						});
						aMarker.extraInfoLoaded = true;
						aMarker.feedSource = "RSS";
						aMarker.uneditable = true;
						if (!feed.markers) {
							feed.markers = [];
						}
						feed.markers.push(aMarker);
					});
					callback();
				}
			});
		} else if (feed.source == "json") {
			$.ajax({
				url : feed.filter,
				dataType : 'jsonp',
				jsonp : false,
				jsonpCallback : "TLonJSONPLoad",
				crossDomain : true,
				success : function(data) {
					if (feedCancelled) {
						return;
					}
					clearTimeout(cancelFeedTimer);
					if (data && data.length > 0) {
						$.each(data, function() {
							if (typeof this.text == "undefined") {
								this.uneditable = true;
								self.controller.addNewCategory({
									category : this
								});
								if (!this.size) {
									this.size = 10;
								}
								if (!this.order) {
									this.order = 10;
								}
							} else {
								var aMarker = self.controller.createMarker({
									id : this.id,
									ownerId : this.ownerId,
									ownerName : this.ownerName,
									startDate : AJKHelpers.dateFromMySQLDate({
										dateString : this.startDate
									}),
									headline : this.title,
									introText : this.text,
									media : this.media,
									endDate : AJKHelpers.dateFromMySQLDate({
										dateString : this.endDate
									}),
									category : self.timeline.categoriesByKey[self.controller.categoriesKeyPrefix + this.category],
									externalLink : this.externalLink,
									fullText : this.fullText
								});
								aMarker.extraInfoLoaded = true;
								aMarker.feedSource = "RSS";
								aMarker.uneditable = true;
								if (!feed.markers) {
									feed.markers = [];
								}
								feed.markers.push(aMarker);
							}
						});
					}
					callback();
				}
			});
		}
	}
};
var TLFlickrFeedHelper = {
	defautPerPage : 20,
	cachedFlickrUsers : [],
	getPhotosForFeed : function(data) {
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
	getPhotosFromUsername : function(data) {
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
	feedLoadFunc : function(data) {
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
	getPhotosForSearchTerm : function(data) {
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
	getPhotosForUser : function(data) {
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
	getMostInterestingPhotos : function(data) {
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
	getLatestPhotos : function(data) {
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
	processImageJSONFromArray : function(data) {
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
};
var TLYouTubeFeedHelper = {
	defautNumVideos : 20,
	defaultThumbImage : "/assets/ui/youtube-default-thumb.jpg",
	getVideosForFeed : function(data) {
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
	getVideosFromUsername : function(data) {
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
	getVideosForStandardFeedOfType : function(data) {
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
	getVideosForSearchTerm : function(data) {
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
	feedLoadFunc : function(data) {
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
	processJSONFromArray : function(data) {
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
				date : AJKHelpers.dateFromMySQLDate({
					dateString : aDate
				}),
				index : counter++
			};
			returnObjs.push(anObj);
		});
		return returnObjs;
	}
};
var TLTwitterFeedHelper = {
	defautNumTweets : 5,
	getTweetsForFeed : function(data) {
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
	getTweetsFromUsername : function(data) {
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
	getTweetsForSearchTerm : function(data) {
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
	feedLoadFunc : function(data) {
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
	processDate : function(data) {
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
	processJSONFromArray : function(data) {
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
};
var TLGoogleRSSFeedHelper = {
	defautNumRSSEntries : 5,
	googleFeedsApiKey : "ABQIAAAAoS3NPqk2d6o96HgQgEr7jBQUtt4mvZP9P5pNofftEDxlb2GQSRSf6RrGPPDdNE4zh8WtTHRlW4a1xw",
	getRSSEntriesForFeed : function(data) {
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
	getRSSEntries : function(data) {
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
	feedLoadFunc : function(data) {
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
	processDate : function(data) {
		var aDate = data.dateString;
		var retDate = (Date.parse(aDate));
		if (retDate) {
			return retDate;
		}
		var aDateSplit = aDate.split(" ");
		var newDateString = aDateSplit[1] + " " + aDateSplit[2] + " " + aDateSplit[3] + " " + aDateSplit[4];
		return Date.parse(newDateString);
	},
	processJSONFromArray : function(data) {
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
};