$import("assets.js.core.utils.AJKHelpers");
Class.forName({
	name : "class assets.js.launcher.TLUCDateTimeFilter extends Object",
	"@Getter @Setter private controller" : null,
	"@Getter @Setter private initialised" : false,
	TLUCDateTimeFilter : function(data) {
		this.controller = data.controller;
	},
	init : function() {
		var self = this;
		this.prepareForView();
		return self;
	},
	updateView : function() {
		var self = this;
		if (!self.initialised) {
			return;
		}
		self.showAllTypes();
		self.flushTimelineCategories();
		// $(self.domCarousel).removeClass("tl-ccl-denser");
		$(self.domList).empty();
		self.initialised = false;
		if (self.controller.isActiveBlock({
			block : self
		})) {
			self.prepareForView();
		}
	},
	initialise : function() {
		var self = this;
		self.activeCounter = 0;

		self.domRoot = $("#tl-uc-view-datetime-block").get()[0];
		// self.domCarousel = $(self.domRoot).find(".ajk-cs-carousel").get()[0];
		self.domList = $(self.domRoot).find(".tl-colour-checkbox-list").get()[0];
		self.mainController = theTLMainController;
		self.timeline = self.mainController.timeline;

		// "filter-label"
		self.categories = [ {
			title : "3H",
			key : "0",
			colour : "37474f"
		}, {
			title : "6H",
			key : "1",
			colour : "37474f"
		}, {
			title : "12H",
			key : "2",
			colour : "37474f"
		}, {
			title : "1D",
			key : "3",
			colour : "37474f"
		}, {
			title : "3D",
			key : "4",
			colour : "37474f"
		}, {
			title : "自定义",
			key : "-1",
			colour : "37474f"
		} ];

		if (self.categories.length > 0 && !(self.categories.length == 1 && self.categories[0].autoGenerated == true)) {
			self.generateCheckboxes();
		} else {
			$(self.domList).remove();
			self.showEmptyMessage();
		}
		$(self.domList).unbind("click").click(function(e) {
			var domItem = assets.js.core.utils.AJKHelpers.getSelfOrFirstParantOfClass({
				domEl : e.target,
				className : "tl-ccl-item"
			});
			if (domItem) {

				$(self.domList).find("li").removeClass("inactive").removeClass("selected");
				$(domItem).addClass("selected");

				var iKey = $(domItem).attr("key");

				$.each(self.categories, function(i) {
					if (i == iKey) {
						this.active = true;
						self.activeCounter = i;
					} else {
						this.active = false;
					}
					this.hide = false;
				});

				if (iKey == "-1") {
					$(self.domList).find("li.startTime").show();
					$(self.domList).find("li.rangeTo").show();
					$(self.domList).find("li.endTime").show();
				} else {
					$(self.domList).find("li.startTime").hide();
					$(self.domList).find("li.rangeTo").hide();
					$(self.domList).find("li.endTime").hide();
				}
			}
		});
		// self.contentScroller = new AJKContentScrollerController({
		// domRootEl : self.domCarousel
		// }).init();
		self.initialised = true;
	},

	flushTimelineCategories : function() {
	},
	prepareForView : function() {
		var self = this;
		if (!self.initialised) {
			self.initialise();
		}
		// setTimeout(function() {
		// self.contentScroller.reset();
		// self.contentScroller.resetSize();
		// }, 1);
	},
	generateCheckboxes : function() {
		var self = this;
		var iHTML = "";
		$.each(self.categories, function() {
			if (this.key == -1) {
				iHTML += [ '<li key="', this.key, '" style="line-height: 18px;" class="tl-ccl-item ', (this.key == 0 ? 'selected' : ''), '"><span style="background-color: #',
						this.colour, '"></span><p>', assets.js.core.utils.AJKHelpers.clipToMaxCharWords({
							aString : this.title,
							maxChars : 16
						}), '</p></li>',

						'<li class="startTime" style="float: left; display:none; width: 196px; height: 18px;">',
						'<div class="ft-p1-input-holder" style="width: 196px; height: 18px;">',
						'<input class="form_date" type="text" value="" style="width: 120px; top: 1px; font-size: 12px; height:16px;">',
						'<a href="#" style="width: 64px; line-height: 16px; top: 1px; height: 16px;">起始时间</a>', '</div></li>',

						'<li class="rangeTo" style="float: left; display:none; height: 18px; line-height:18px;">~</li>',

						'<li class="endTime" style="float:left; display:none; width: 196px; height: 18px;">',
						'<div class="ft-p1-input-holder" style="width: 196px; height: 18px;">',
						'<input class="form_date" type="text" value="" style="width: 120px; top: 1px; font-size: 12px; height:16px;">',
						'<a href="#" style="width: 64px; line-height: 16px; top: 1px; height: 16px;">结束时间</a>', '</div></li>' ].join('');
			} else {
				iHTML += '<li key="' + this.key + '" style="line-height: 18px;" class="tl-ccl-item"><span style="background-color: #' + this.colour + '"></span><p>'
						+ assets.js.core.utils.AJKHelpers.clipToMaxCharWords({
							aString : this.title,
							maxChars : 16
						}) + '</p></li>';
			}
		});
		$(self.domList).empty().append(iHTML);

		$(self.domList).find('.form_date').datetimepicker({
			language : 'zh-CN',
			weekStart : 1,
			todayBtn : 1,
			autoclose : 1,
			todayHighlight : 1,
			startView : 2,
			minView : 2,
			forceParse : 0
		});

		self.domItemsByKey = [];
		$(self.domList).find("li").each(function() {
			self.domItemsByKey[$(this).attr("key")] = this;
		});
	},
	showEmptyMessage : function() {
		var self = this;
		$(self.domRoot).append(
				'<p class="message">date time range filtering has been disabled for this timeline because it does not include any date time range for filtering.</p>');
	},
	viewHasEnded : function() {
		var self = this;
	}
});