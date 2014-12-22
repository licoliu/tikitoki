$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.feed.controller.TLFeedController extends Object",

	TLFeedController : function(data) {
		var self = this;
		self.feeds = data.feeds;
		self.feedsByKey = [];
		self.keyPrefix = "tl-feed-";
		self.feedsLoadedCallback = data.feedsLoadedCallback;
		self.controller = data.controller;
		self.timeline = self.controller.timeline;
		self.feedStoryId = 1;
		self.feedStoryIdPrefix = "tl-feed-story-";
	},
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
		feed.name = assets.js.core.utils.AJKHelpers.removeScript({
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
						var markerDate = assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
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
							headline : assets.js.core.utils.AJKHelpers.clipToMaxCharWords({
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
							headline : assets.js.core.utils.AJKHelpers.clipToMaxCharWords({
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
									startDate : assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
										dateString : this.startDate
									}),
									headline : this.title,
									introText : this.text,
									media : this.media,
									endDate : assets.js.core.utils.AJKHelpers.dateFromMySQLDate({
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
});