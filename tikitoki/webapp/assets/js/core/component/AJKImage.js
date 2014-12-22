$import("assets.js.core.utils.AJKHelpers");
$import("assets.js.core.component.AJKImageLoader");

Class.forName({
	name : "class assets.js.core.component.AJKImage extends Object",

	AJKImage : function(data) {
		this.gallery = data.gallery;
		this.displaySize = data.displaySize;
		this.domImage = data.domImage;
		this.imageInfoHTML = data.imageInfoHTML;
		this.imageInfoFunction = data.imageInfoFunction;
		this.domPhotoCredit = "";
		this.index = data.index;
		this.imageHolderHTML = data.imageHolderHTML;
		this.imageOffset = data.imageOffset;
		this.size = {
			width : 0,
			height : 0
		};
		this.adjustedDimensions = {
			width : 0,
			height : 0,
			xOffset : 0,
			yOffset : 0
		};
		this.domHolder = $(this.imageHolderHTML).get()[0];
		this.html = this.domHolder;
		this.loaded = false;
		return this;
	},
	init : function() {
		var self = this;
		$(this.domHolder).css({
			width : this.displaySize.width,
			height : this.displaySize.height
		});
		$(self.domHolder).append(self.domImage);
		new assets.js.core.component.AJKImageLoader({
			imageUrl : $(self.domImage).attr("src"),
			loadCallback : function() {
				setTimeout(function() {
					self.size = {
						width : $(self.domImage).width(),
						height : $(self.domImage).height()
					};
					self.fitInBoxOfSize({
						boxSize : {
							width : self.displaySize.width,
							height : self.displaySize.height
						}
					});
					$(self.domImage).css({
						opacity : 1
					});
				});
			}
		}).init();
		$(self.domHolder).append(self.imageInfoHTML);
		return this;
	},
	fitInBoxOfSize : function(data) {
		var self = this;
		var boxSize = data.boxSize;
		assets.js.core.utils.AJKHelpers.sizeImageToFitInBoxOfSize({
			domImage : self.domImage,
			boxSize : boxSize,
			imageSize : {
				width : self.size.width,
				height : self.size.height
			},
			imageOffset : self.imageOffset
		});
	},
	removeFromDom : function() {
		var self = this;
		$(self.domHolder).remove();
	},
	resizeTo : function(data) {
		var self = this;
		self.displaySize = data.size;
		self.fitInBoxOfSize({
			boxSize : self.displaySize
		});
		$(self.html).css({
			width : self.displaySize.width,
			height : self.displaySize.height
		});
	}
});