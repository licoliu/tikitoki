
Class.forName({
	name : "class assets.js.core.component.TLViewScaleBlock extends Object",

	TLViewScaleBlock : function(data) {
		var self = this;
		self.type = data.type;
		self.viewScale = data.viewScale;
		self.numItems = (self.viewScale.numItems) ? self.viewScale.numItems : 1;
		self.index = data.index;
		self.domEl = "";
		self.width = data.width;
		self.text = data.text;
		self.leftOffset = data.leftOffset;
		self.colour = data.colour;
		self.domColourBlock;
		self.itemWidth = self.width / self.numItems;
		self.controller = data.controller;
		self.scaleGraphic = self.viewScale.segmentWidth ? 'assets/ui/stage/standard-scale-' + self.viewScale.segmentWidth + 'px-segments.png' : 'assets/ui/stage/scale-'
				+ self.type + '.png';
		self.foreignScaleGraphic = self.viewScale.segmentWidth ? 'assets/ui/stage/standard-scale-' + self.viewScale.segmentWidth + 'px-segments.png'
				: 'assets/ui/stage/foreign/scale-' + self.type + '.png';
	},
	init : function() {
		var self = this;
		var viewScaleExtraClass = " scale-block-" + self.type;
		var lang = theTLMainController.timeline.language;
		var scaleGraphic = (lang && lang != "english" && lang != "english-common") ? self.foreignScaleGraphic : self.scaleGraphic;
		var posClass = (self.index % 2) ? " scale-block-odd" : "";
		var blockStyle = (self.viewScale.segmentWidth) ? 'style="background: url(assets/ui/stage/zebra-' + self.viewScale.segmentWidth + 'px.png)"' : "";
		var insertHTML = '<div ' + blockStyle + 'class="scale-block ' + viewScaleExtraClass + posClass + '">';
		var backgroundStyle = (self.viewScale.segmentWidth) ? "none" : 'url(' + scaleGraphic + ') left bottom repeat-x';
		insertHTML += '<div style="background: ' + backgroundStyle + ';" class="index"><h4>' + self.text + '</h4>';
		for (var counter = 1; counter < self.numItems; counter++) {
			var offset = counter * self.itemWidth;
			var itemPos = Math.round(offset + 0.5 * self.itemWidth);
			var itemDate = self.controller.getDateFromLeftOffset({
				leftOffset : self.leftOffset + offset + 0.0005 * self.itemWidth
			});
			if (self.viewScale.segmentWidth) {
				insertHTML += '<div style="left: ' + (counter * self.viewScale.segmentWidth) + 'px; width: ' + (self.viewScale.segmentWidth - 2)
						+ 'px;" class="scale-block-label-v2"><span>' + self.viewScale.getTextForDate({
							date : itemDate,
							subItem : true
						}) + '</span></div>';
			} else {
				insertHTML += '<div style="left: ' + itemPos + 'px" class="scale-block-label"><span>' + self.viewScale.getTextForDate({
					date : itemDate,
					subItem : true
				}) + '</span></div>';
			}
		}
		insertHTML += '</div>';
		insertHTML += '<div class="content"></div>';
		insertHTML += '</div>';
		self.domEl = $(insertHTML).get()[0];
		$(self.domEl).css({
			width : self.width,
			left : self.leftOffset
		});
		self.domColourBlock = $(self.domEl).find("h4").get()[0];
		$(self.domColourBlock).css({
			background : "#" + self.colour
		});
		if (self.numItems > 1 && self.viewScale.segmentWidth) {
			$(self.domColourBlock).css({
				left : 2,
				width : self.viewScale.segmentWidth - 4
			});
		}
		if (self.viewScale.segmentWidth && (self.numItems % 2) && (self.index % 2)) {
			$(self.domEl).css({
				backgroundPosition : -Math.max(self.itemWidth) + "px bottom"
			});
		}
		return self;
	},
	setLeftPosition : function(data) {
		var self = this;
		var position = data.position;
		$(self.domEl).css({
			left : position
		});
	},
	updateScaleColour : function(data) {
		var self = this;
		self.colour = data.colour;
		$(self.domColourBlock).css({
			background : "#" + self.colour
		});
	}
});