Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions extends Object",

	"public static makeTransition" : function(data) {
		return new this[data.transition];
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.SimpleSwitch extends Object",

	SimpleSwitch : function() {
	},
	init : function(data) {
		var self = this;
		self.domStage = data.domStage;
		self.displaySize = data.displaySize;
		self.previousImage = false;
	},
	showImage : function(data) {
		var self = this;
		self.direction = data.direction;
		var callback = data.callback;
		var anImage = data.anImage;
		if (!self.previousImage) {
			self.displayFirstImage({
				anImage : anImage,
				callback : function() {
					callback();
				}
			});
			return;
		}
		self.initialiseAndPlaceNewImage({
			anImage : anImage
		});
		setTimeout(function() {
			self.doTransition({
				anImage : anImage,
				callback : function() {
					if (self.previousImage) {
						self.previousImage.removeFromDom();
					}
					self.previousImage = anImage;
					callback();
				}
			});
		}, 1);
	},
	initialiseAndPlaceNewImage : function(data) {
		var self = this;
		$(self.domStage).append(data.anImage.html);
	},
	doTransition : function(data) {
		data.callback();
	},
	displayFirstImage : function(data) {
		var self = this;
		var anImage = data.anImage;
		var callback = data.callback;
		$(self.domStage).append(anImage.html);
		self.previousImage = anImage;
		callback();
	},
	updateDisplaySize : function(data) {
		var self = this;
		self.displaySize = data.size;
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.FadeIn extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",

	FadeIn : function() {
	},
	initialiseAndPlaceNewImage : function(data) {
		var self = this;
		var anImage = data.anImage;
		$(anImage.html).css({
			opacity : 0
		});
		$(self.domStage).append(anImage.html);
	},
	doTransition : function(data) {
		var anImage = data.anImage;
		var callback = data.callback;
		$(anImage.html).animate({
			opacity : 1
		}, 500, function() {
			callback();
		});
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.CarouselHorizontal extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",

	CarouselHorizontal : function() {
	},
	initialiseAndPlaceNewImage : function(data) {
		var self = this;
		var anImage = data.anImage;
		self.displayOffset = (self.direction == "backward") ? -self.displaySize.width : self.displaySize.width;
		$(anImage.html).css({
			left : self.displayOffset + "px"
		});
		$(self.domStage).append(anImage.html);
	},
	doTransition : function(data) {
		var self = this;
		var anImage = data.anImage;
		var callback = data.callback;
		var timer = Math.abs(self.displaySize.width / 2);
		$(self.domStage).animate({
			left : -self.displayOffset + "px"
		}, timer, function() {
			$(anImage.html).css({
				left : 0
			});
			$(self.domStage).css({
				left : 0
			});
			callback();
		});
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.CameraShutter extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",

	CameraShutter : function() {
	},
	initialiseAndPlaceNewImage : function(data) {
		var self = this;
		var anImage = data.anImage;
		$(anImage.html).css({
			opacity : 0
		});
		$(self.domStage).append(anImage.html);
		self.shutterTop = $('<div class="ak-image-gallery-camera-shutter"></div>').get()[0];
		self.shutterBottom = $('<div class="ak-image-gallery-camera-shutter"></div>').get()[0];
		$(self.shutterTop).css({
			top : 0,
			left : 0,
			height : 0,
			width : self.displaySize.width,
			opacity : 0
		});
		$(self.shutterBottom).css({
			bottom : 0,
			left : 0,
			height : 0,
			width : self.displaySize.width,
			opacity : 0
		});
		$(self.domStage).append(self.shutterTop);
		$(self.domStage).append(self.shutterBottom);
	},
	doTransition : function(data) {
		var self = this;
		var anImage = data.anImage;
		var callback = data.callback;
		var animates1 = new Array();
		var animates2 = new Array();
		animates1.push({
			element : self.shutterTop,
			elStyles : [ {
				elStyle : "height",
				endVal : self.displaySize.height / 2 + 1
			}, {
				elStyle : "opacity",
				endVal : 1
			} ]
		});
		animates1.push({
			element : self.shutterBottom,
			elStyles : [ {
				elStyle : "height",
				endVal : self.displaySize.height / 2 + 1
			}, {
				elStyle : "opacity",
				endVal : 1
			} ]
		});
		var closeShutterAnimation = new CustomAnimation(animates1, 200, 20, function() {
			$(anImage.html).css({
				opacity : 1
			});
			setTimeout(function() {
				animates2.push({
					element : self.shutterTop,
					elStyles : [ {
						elStyle : "height",
						endVal : 0
					} ]
				});
				animates2.push({
					element : self.shutterBottom,
					elStyles : [ {
						elStyle : "height",
						endVal : 0
					} ]
				});
				var openShutterAnimation = new CustomAnimation(animates2, 200, 20, function() {
					$(self.shutterTop).remove();
					$(self.shutterBottom).remove();
					callback();
				});
				openShutterAnimation.startAnimation();
			}, 200);
		});
		closeShutterAnimation.startAnimation();
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.Squares extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",

	Squares : function() {
	},
	initialiseAndPlaceNewImage : function(data) {
		var self = this;
		var anImage = data.anImage;
		$(anImage.html).css({
			opacity : 0
		});
		self.previousImage.removeFromDom();
		$(self.domStage).append(anImage.html);
		self.squareCols = Math.round(self.displaySize.width / 100) || 1;
		self.squareRows = Math.round(self.displaySize.height / 100) || 1;
		self.squareSize = {
			width : Math.ceil(self.displaySize.width / self.squareCols),
			height : Math.ceil(self.displaySize.height / self.squareRows)
		};
		var createSquareAtRowColWithImage = function(data) {
			var row = data.row;
			var col = data.col;
			var srcImage = data.srcImage;
			var startingOpacity = data.startingOpacity;
			var domSquare = $('<div class="ak-image-gallery-square"></div>').get()[0];
			$(domSquare).css({
				width : self.squareSize.width,
				height : self.squareSize.height,
				top : self.squareSize.height * row,
				left : self.squareSize.width * col,
				opacity : startingOpacity
			});
			var domImage = $(srcImage.html).clone();
			$(domImage).css({
				opacity : 1,
				left : -self.squareSize.width * col,
				top : -self.squareSize.height * row
			});
			$(domSquare).append(domImage);
			return domSquare;
		};
		self.domSquares = new Array();
		for (var row = 0; row < self.squareRows; row++) {
			for (var col = 0; col < self.squareCols; col++) {
				var domSquare = createSquareAtRowColWithImage({
					row : row,
					col : col,
					srcImage : self.previousImage,
					startingOpacity : 1
				});
				self.domSquares.push(domSquare);
				$(self.domStage).append(domSquare);
			}
		}
	},
	doTransition : function(data) {
		var self = this;
		var anImage = data.anImage;
		var timerInc = parseInt(1000 / (self.squareRows * self.squareCols));
		var callback = data.callback;
		$(anImage.html).css({
			opacity : 1
		});
		for (var row = 0; row < self.squareRows; row++) {
			for (var col = 0; col < self.squareCols; col++) {
				(function() {
					var delay = col * timerInc + row * timerInc / 3 * self.squareCols;
					var domSquare = self.domSquares[(row * self.squareCols) + col];
					var lastRow = (col == (self.squareCols - 1) && row == (self.squareRows - 1)) ? true : false;
					setTimeout(function() {
						$(domSquare).animate({
							opacity : 0
						}, 400, function() {
							$(this).remove();
						});
						if (lastRow) {
							callback();
						}
					}, delay);
				})();
			}
		}
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.SquaresFadeInAndOut extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",

	SquaresFadeInAndOut : function() {
	},
	initialiseAndPlaceNewImage : function(data) {
		var self = this;
		var anImage = data.anImage;
		$(anImage.html).css({
			opacity : 0
		});
		self.previousImage.removeFromDom();
		$(self.domStage).append(anImage.html);
		self.squareCols = Math.round(self.displaySize.width / 100) || 1;
		self.squareRows = Math.round(self.displaySize.height / 100) || 1;
		self.squareSize = {
			width : Math.ceil(self.displaySize.width / self.squareCols),
			height : Math.ceil(self.displaySize.height / self.squareRows)
		};
		var createSquareAtRowColWithImage = function(data) {
			var row = data.row;
			var col = data.col;
			var srcImage = data.srcImage;
			var startingOpacity = data.startingOpacity;
			var scale = (data.scale) ? data.scale : 1;
			var domSquare = $('<div class="ak-image-gallery-square"></div>').get()[0];
			$(domSquare).css({
				width : (self.squareSize.width * scale),
				height : (self.squareSize.height * scale),
				top : (self.squareSize.height * row) + (self.squareSize.height * (1 - scale)),
				left : (self.squareSize.width * col) + (self.squareSize.height * (1 - scale)),
				opacity : startingOpacity
			});
			var domImage = $(srcImage.html).clone();
			$(domImage).css({
				opacity : 1,
				left : -self.squareSize.width * col,
				top : -self.squareSize.height * row
			});
			$(domSquare).append(domImage);
			return {
				dom : domSquare,
				yOffset : self.squareSize.height * row,
				xOffset : self.squareSize.width * col
			};
		};
		self.squares = new Array();
		self.newSquares = new Array();
		for (var row = 0; row < self.squareRows; row++) {
			for (var col = 0; col < self.squareCols; col++) {
				var aSquare = createSquareAtRowColWithImage({
					row : row,
					col : col,
					srcImage : self.previousImage,
					startingOpacity : 1
				});
				self.squares.push(aSquare);
				$(self.domStage).append(aSquare.dom);
				var aNewSquare = createSquareAtRowColWithImage({
					row : row,
					col : col,
					srcImage : anImage,
					startingOpacity : 0
				});
				self.newSquares.push(aNewSquare);
				$(self.domStage).append(aNewSquare.dom);
			}
		}
	},
	doTransition : function(data) {
		var self = this;
		var anImage = data.anImage;
		var timerInc = 50;
		var callback = data.callback;
		$(anImage.html).css({
			opacity : 0
		});
		for (var row = 0; row < self.squareRows; row++) {
			for (var col = 0; col < self.squareCols; col++) {
				(function() {
					var delay = col * timerInc + row * timerInc / 3 * self.squareCols;
					var aSquare = self.squares[(row * self.squareCols) + col];
					var aNewSquare = self.newSquares[(row * self.squareCols) + col];
					var lastRow = (col == (self.squareCols - 1) && row == (self.squareRows - 1)) ? true : false;
					setTimeout(function() {
						$(aSquare.dom).animate({
							opacity : 0
						}, 500, function() {
							$(this).remove();
						});
					}, delay);
					setTimeout(function() {
						$(aNewSquare.dom).animate({
							opacity : 1
						}, 500, function() {
							if (lastRow) {
								$(anImage.html).css({
									opacity : 1
								});
								$.each(self.newSquares, function() {
									$(this.dom).remove();
								});
								callback();
							}
						});
					}, delay + 900);
				})();
			}
		}
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.SplitAndFadeIn extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",

	SplitAndFadeIn : function() {
	},
	initialiseAndPlaceNewImage : function(data) {
		var self = this;
		var anImage = data.anImage;
		$(anImage.html).css({
			opacity : 0
		});
		$(self.domStage).append(anImage.html);
		self.splitterLeft = $('<div class="ak-image-gallery-splitter"></div>').get()[0];
		self.splitterRight = $('<div class="ak-image-gallery-splitter"></div>').get()[0];
		$(self.splitterLeft).css({
			top : 0,
			left : 0,
			height : self.displaySize.height,
			width : self.displaySize.width / 2 + 1
		});
		$(self.splitterRight).css({
			top : 0,
			left : self.displaySize.width / 2,
			height : self.displaySize.height,
			width : self.displaySize.width / 2 + 1
		});
		$(self.splitterLeft).append($(self.previousImage.html).clone());
		var rightHTML = $(self.previousImage.html).clone();
		$(rightHTML).css({
			left : -self.displaySize.width / 2
		});
		$(self.splitterRight).append(rightHTML);
		self.previousImage.removeFromDom();
		$(self.domStage).append(self.splitterLeft);
		$(self.domStage).append(self.splitterRight);
	},
	doTransition : function(data) {
		var self = this;
		var anImage = data.anImage;
		var callback = data.callback;
		var animates1 = new Array();
		var animates2 = new Array();
		animates1.push({
			element : self.splitterLeft,
			elStyles : [ {
				elStyle : "left",
				endVal : -self.displaySize.width / 2
			} ]
		});
		animates1.push({
			element : self.splitterRight,
			elStyles : [ {
				elStyle : "left",
				endVal : self.displaySize.width
			} ]
		});
		animates1.push({
			element : anImage.html,
			elStyles : [ {
				elStyle : "opacity",
				endVal : 1
			} ]
		});
		var splitterAnimation = new CustomAnimation(animates1, 500, 50, function() {
			$(anImage.html).css({
				opacity : 1
			});
			$(self.splitterLeft).remove();
			$(self.splitterRight).remove();
			callback();
		});
		splitterAnimation.startAnimation();
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.SplitAndFadeOut extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",
	SplitAndFadeOut : function() {
	},
	doTransition : function(data) {
		var self = this;
		var anImage = data.anImage;
		var callback = data.callback;
		var animates1 = new Array();
		var animates2 = new Array();
		$(anImage.html).css({
			opacity : 1
		});
		animates1.push({
			element : self.splitterLeft,
			elStyles : [ {
				elStyle : "left",
				endVal : -self.displaySize.width / 2
			}, {
				elStyle : "opacity",
				endVal : 0
			} ]
		});
		animates1.push({
			element : self.splitterRight,
			elStyles : [ {
				elStyle : "left",
				endVal : self.displaySize.width
			}, {
				elStyle : "opacity",
				endVal : 0
			} ]
		});
		var splitterAnimation = new CustomAnimation(animates1, 500, 50, function() {
			$(anImage.html).css({
				opacity : 1
			});
			$(self.splitterLeft).remove();
			$(self.splitterRight).remove();
			callback();
		});
		splitterAnimation.startAnimation();
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.SplitAndFadeInAndOut extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",
	SplitAndFadeInAndOut : function() {
	},
	doTransition : function(data) {
		var self = this;
		var anImage = data.anImage;
		var callback = data.callback;
		var animates1 = new Array();
		var animates2 = new Array();
		animates1.push({
			element : self.splitterLeft,
			elStyles : [ {
				elStyle : "left",
				endVal : -self.displaySize.width / 2
			}, {
				elStyle : "opacity",
				endVal : 0
			} ]
		});
		animates1.push({
			element : self.splitterRight,
			elStyles : [ {
				elStyle : "left",
				endVal : self.displaySize.width
			}, {
				elStyle : "opacity",
				endVal : 0
			} ]
		});
		animates1.push({
			element : anImage.html,
			elStyles : [ {
				elStyle : "opacity",
				endVal : 1
			} ]
		});
		var splitterAnimation = new CustomAnimation(animates1, 500, 50, function() {
			$(anImage.html).css({
				opacity : 1
			});
			$(self.splitterLeft).remove();
			$(self.splitterRight).remove();
			callback();
		});
		splitterAnimation.startAnimation();
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.SplitInFourAndFadeIn extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",
	SplitInFourAndFadeIn : function() {
	},
	initialiseAndPlaceNewImage : function(data) {
		var self = this;
		var anImage = data.anImage;
		$(anImage.html).css({
			opacity : 0
		});
		$(self.domStage).append(anImage.html);
		var xAdjuster = ((anImage.adjustedDimensions.xOffset % 2) == 0) ? 0 : 1;
		var yAdjuster = ((anImage.adjustedDimensions.yOffset % 2) == 0) ? 0 : 1;
		self.splitterTopLeft = $('<div class="ak-image-gallery-splitter"></div>').get()[0];
		self.splitterTopRight = $('<div class="ak-image-gallery-splitter"></div>').get()[0];
		self.splitterBottomLeft = $('<div class="ak-image-gallery-splitter"></div>').get()[0];
		self.splitterBottomRight = $('<div class="ak-image-gallery-splitter"></div>').get()[0];
		$(self.splitterTopLeft).css({
			top : 0,
			left : 0,
			height : self.displaySize.height / 2,
			width : self.displaySize.width / 2
		});
		$(self.splitterTopRight).css({
			top : 0,
			left : self.displaySize.width / 2,
			height : self.displaySize.height / 2,
			width : Math.ceil(self.displaySize.width / 2)
		});
		$(self.splitterBottomLeft).css({
			top : self.displaySize.height / 2,
			left : 0,
			height : self.displaySize.height / 2 + (1 - yAdjuster),
			width : Math.ceil(self.displaySize.width / 2)
		});
		$(self.splitterBottomRight).css({
			top : self.displaySize.height / 2,
			left : self.displaySize.width / 2,
			height : self.displaySize.height / 2 + (1 - yAdjuster),
			width : Math.ceil(self.displaySize.width / 2)
		});
		$(self.splitterTopLeft).append($(self.previousImage.html).clone());
		var topRightHTML = $(self.previousImage.html).clone();
		$(topRightHTML).css({
			left : -self.displaySize.width / 2
		});
		$(self.splitterTopRight).append(topRightHTML);
		var bottomLeftHTML = $(self.previousImage.html).clone();
		$(bottomLeftHTML).css({
			top : -self.displaySize.height / 2
		});
		$(self.splitterBottomLeft).append(bottomLeftHTML);
		var bottomRightHTML = $(self.previousImage.html).clone();
		$(bottomRightHTML).css({
			left : -self.displaySize.width / 2 + xAdjuster,
			top : -self.displaySize.height / 2 + yAdjuster
		});
		$(self.splitterBottomRight).append(bottomRightHTML);
		self.previousImage.removeFromDom();
		$(self.domStage).append(self.splitterTopLeft);
		$(self.domStage).append(self.splitterTopRight);
		$(self.domStage).append(self.splitterBottomLeft);
		$(self.domStage).append(self.splitterBottomRight);
	},
	doTransition : function(data) {
		var self = this;
		var anImage = data.anImage;
		var callback = data.callback;
		var animates1 = new Array();
		animates1.push({
			element : self.splitterTopLeft,
			elStyles : [ {
				elStyle : "left",
				endVal : -self.displaySize.width / 2
			}, {
				elStyle : "top",
				endVal : -self.displaySize.height / 2
			} ]
		});
		animates1.push({
			element : self.splitterTopRight,
			elStyles : [ {
				elStyle : "left",
				endVal : self.displaySize.width
			}, {
				elStyle : "top",
				endVal : -self.displaySize.height / 2
			} ]
		});
		animates1.push({
			element : self.splitterBottomLeft,
			elStyles : [ {
				elStyle : "left",
				endVal : -self.displaySize.width / 2
			}, {
				elStyle : "top",
				endVal : self.displaySize.height
			} ]
		});
		animates1.push({
			element : self.splitterBottomRight,
			elStyles : [ {
				elStyle : "left",
				endVal : self.displaySize.width
			}, {
				elStyle : "top",
				endVal : self.displaySize.height
			} ]
		});
		animates1.push({
			element : anImage.html,
			elStyles : [ {
				elStyle : "opacity",
				endVal : 1
			} ]
		});
		var splitterAnimation = new CustomAnimation(animates1, 500, 50, function() {
			$(anImage.html).css({
				opacity : 1
			});
			$(self.splitterTopLeft).remove();
			$(self.splitterTopRight).remove();
			$(self.splitterBottomLeft).remove();
			$(self.splitterBottomRight).remove();
			callback();
		});
		splitterAnimation.startAnimation();
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.SplitInFourAndFadeInAndOut extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",
	SplitInFourAndFadeInAndOut : function() {
	},
	doTransition : function(data) {
		var self = this;
		var anImage = data.anImage;
		var callback = data.callback;
		var animates1 = new Array();
		animates1.push({
			element : self.splitterTopLeft,
			elStyles : [ {
				elStyle : "left",
				endVal : -self.displaySize.width / 2
			}, {
				elStyle : "top",
				endVal : -self.displaySize.height / 2
			}, {
				elStyle : "opacity",
				endVal : 0
			} ]
		});
		animates1.push({
			element : self.splitterTopRight,
			elStyles : [ {
				elStyle : "left",
				endVal : self.displaySize.width
			}, {
				elStyle : "top",
				endVal : -self.displaySize.height / 2
			}, {
				elStyle : "opacity",
				endVal : 0
			} ]
		});
		animates1.push({
			element : self.splitterBottomLeft,
			elStyles : [ {
				elStyle : "left",
				endVal : -self.displaySize.width / 2
			}, {
				elStyle : "top",
				endVal : self.displaySize.height
			}, {
				elStyle : "opacity",
				endVal : 0
			} ]
		});
		animates1.push({
			element : self.splitterBottomRight,
			elStyles : [ {
				elStyle : "left",
				endVal : self.displaySize.width
			}, {
				elStyle : "top",
				endVal : self.displaySize.height
			}, {
				elStyle : "opacity",
				endVal : 0
			} ]
		});
		animates1.push({
			element : anImage.html,
			elStyles : [ {
				elStyle : "opacity",
				endVal : 1
			} ]
		});
		var splitterAnimation = new CustomAnimation(animates1, 500, 50, function() {
			$(anImage.html).css({
				opacity : 1
			});
			$(self.splitterTopLeft).remove();
			$(self.splitterTopRight).remove();
			$(self.splitterBottomLeft).remove();
			$(self.splitterBottomRight).remove();
			callback();
		});
		splitterAnimation.startAnimation();
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.ZoomOut extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",

	ZoomOut : function() {
	},
	initialiseAndPlaceNewImage : function(data) {
		var self = this;
		var anImage = data.anImage;
		$(anImage.html).css({
			opacity : 1
		});
		$(self.domStage).append(anImage.html);
		$(self.domStage).append(self.previousImage.html);
	},
	doTransition : function(data) {
		var self = this;
		var anImage = data.anImage;
		var callback = data.callback;
		var animates1 = new Array();
		var prevImage = self.previousImage;
		var zoomVal = 2;
		var finalXOffset = -((prevImage.adjustedDimensions.width * zoomVal) - self.displaySize.width) / 2;
		var finalYOffset = -((prevImage.adjustedDimensions.height * zoomVal) - self.displaySize.height) / 2;
		animates1.push({
			element : prevImage.domImage,
			elStyles : [ {
				elStyle : "left",
				endVal : finalXOffset
			}, {
				elStyle : "top",
				endVal : finalYOffset
			}, {
				elStyle : "width",
				endVal : prevImage.adjustedDimensions.width * zoomVal
			}, {
				elStyle : "height",
				endVal : prevImage.adjustedDimensions.height * zoomVal
			} ]
		});
		animates1.push({
			element : prevImage.html,
			elStyles : [ {
				elStyle : "opacity",
				endVal : 0
			} ]
		});
		var zoomAnimation = new CustomAnimation(animates1, 500, 50, function() {
			$(anImage.html).css({
				opacity : 1
			});
			self.previousImage.removeFromDom();
			$(self.previousImage.domImage).css({
				left : prevImage.adjustedDimensions.xOffset,
				top : prevImage.adjustedDimensions.yOffset,
				width : prevImage.adjustedDimensions.width,
				height : prevImage.adjustedDimensions.height
			});
			callback();
		});
		zoomAnimation.startAnimation();
	}
});

Class.forName({
	name : "class assets.js.core.effect.AJKImageTransitions.ZoomOutAndZoomIn extends assets.js.core.effect.AJKImageTransitions.SimpleSwitch",

	ZoomOutAndZoomIn : function() {
	},
	initialiseAndPlaceNewImage : function(data) {
		var self = this;
		var anImage = data.anImage;
		self.zoomVal = 1.1;
		var startXOffset = -((anImage.adjustedDimensions.width * self.zoomVal) - self.displaySize.width) / 2;
		var startYOffset = -((anImage.adjustedDimensions.height * self.zoomVal) - self.displaySize.height) / 2;
		$(anImage.domImage).css({
			left : startXOffset,
			top : startYOffset,
			width : anImage.adjustedDimensions.width * self.zoomVal,
			height : anImage.adjustedDimensions.height * self.zoomVal,
			opacity : 1
		});
		$(anImage.html).css({
			opacity : 0
		});
		$(self.domStage).append(anImage.html);
		$(self.domStage).append(self.previousImage.html);
	},
	doTransition : function(data) {
		var self = this;
		var anImage = data.anImage;
		var callback = data.callback;
		var animates1 = new Array();
		var prevImage = self.previousImage;
		var zoomVal = self.zoomVal;
		var finalXOffset = -((prevImage.adjustedDimensions.width * zoomVal) - self.displaySize.width) / 2;
		var finalYOffset = -((prevImage.adjustedDimensions.height * zoomVal) - self.displaySize.height) / 2;
		animates1.push({
			element : prevImage.domImage,
			elStyles : [ {
				elStyle : "left",
				endVal : finalXOffset
			}, {
				elStyle : "top",
				endVal : finalYOffset
			}, {
				elStyle : "width",
				endVal : prevImage.adjustedDimensions.width * zoomVal
			}, {
				elStyle : "height",
				endVal : prevImage.adjustedDimensions.height * zoomVal
			} ]
		});
		animates1.push({
			element : anImage.domImage,
			elStyles : [ {
				elStyle : "left",
				endVal : anImage.adjustedDimensions.xOffset
			}, {
				elStyle : "top",
				endVal : anImage.adjustedDimensions.yOffset
			}, {
				elStyle : "width",
				endVal : anImage.adjustedDimensions.width
			}, {
				elStyle : "height",
				endVal : anImage.adjustedDimensions.height
			} ]
		});
		animates1.push({
			element : prevImage.html,
			elStyles : [ {
				elStyle : "opacity",
				endVal : 0
			} ]
		});
		animates1.push({
			element : anImage.html,
			elStyles : [ {
				elStyle : "opacity",
				endVal : 1
			} ]
		});
		var zoomAnimation = new CustomAnimation(animates1, 500, 50, function() {
			$(anImage.html).css({
				opacity : 1
			});
			self.previousImage.removeFromDom();
			$(self.previousImage.domImage).css({
				left : prevImage.adjustedDimensions.xOffset,
				top : prevImage.adjustedDimensions.yOffset,
				width : prevImage.adjustedDimensions.width,
				height : prevImage.adjustedDimensions.height
			});
			callback();
		});
		zoomAnimation.startAnimation();
	}
});