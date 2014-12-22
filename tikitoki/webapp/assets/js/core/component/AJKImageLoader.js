Class.forName({
	name : "class assets.js.core.component.AJKImageLoader extends Object",

	AJKImageLoader : function(data) {
		var self = this;
		self.loadCallback = data.loadCallback;
		self.imageUrl = data.imageUrl;
		self.imageHasLoaded = false;
	},
	init : function() {
		var self = this;
		var anImage = new Image();
		anImage.src = self.imageUrl;
		if (anImage.complete) {
			if (self.loadCallback) {
				self.loadCallback({
					image : anImage
				});
			}
		} else {
			$(anImage).load(function() {
				if (self.loadCallback && !self.imageHasLoaded) {
					self.loadCallback({
						image : anImage
					});
				}
				self.imageHasLoaded = true;
			});
		}
		return self;
	}
});