TLTranslation = [];

try {
	document.execCommand("BackgroundImageCache", false, true);
} catch (err) {
}

$import([ "assets.js.launcher.TLUserCharts", "assets.js.launcher.TLUserControls" ]);

// $import("assets.js.core.setting.TLConfigText");

$import("assets.js.core.utils.Date");

$import("assets.js.core.controller.AJKAjaxController");

// $import("assets.js.core.utils.AJKHelpers");

$import("assets.js.core.component.AJKImageLoader");
$import("assets.js.core.component.AJKImageGallery");

$import("assets.js.core.controller.AJKGalleryThumbsController");

$import("assets.js.core.component.AJKImage");

$import("assets.js.core.effect.AJKImageTransitions");

$import("assets.js.core.event.AJKWindowResizeEvent");
$import("assets.js.core.event.AJKMouseMoveEvent");
$import("assets.js.core.event.AJKWindowBlurEvent");

$import("assets.js.core.effect.AJKDraggable");

$import("assets.js.core.event.AJKMouseScrollEvent");

// $import("assets.js.core.component.AJKSelectReplacer");

$import("assets.js.core.controller.TLHashController");

$import("assets.js.core.setting.TLSettings");

$import("assets.js.core.effect.TLSliderDragger");

$import("assets.js.core.controller.TLMainController");
// $import("assets.js.core.controller.TL3DViewController");
$import("assets.js.core.controller.TLViewController");

// $import("assets.js.core.component.TLViewCategoryBand");
// $import("assets.js.core.component.TLViewScaleBlock");

// $import("assets.js.core.component.TLMarker");

// $import("assets.js.core.controller.TLContentPanelController");

$import("assets.js.core.component.TLCPImageViewer");

$import("assets.js.core.controller.AJKButtonPopupController");

$import("assets.js.core.component.AJKButtonPopup");

// $import("assets.js.core.controller.TLLoginPanelController");

// $import("assets.js.core.controller.TLSignupPanelController");

$import("assets.js.core.component.AJKValueSlider");

$import("assets.js.core.component.AJKVerifier");
$import("assets.js.core.component.AJKVerifierField");

$import("assets.js.core.event.AJKKeyEvent");

$import("assets.js.core.controller.AJKContentScrollerController");

// $import("assets.js.core.controller.TLSecretLoginController");

$import([ "assets.js.feed.controller.TLFeedController", "assets.js.feed.utils.TLFlickrFeedHelper", "assets.js.feed.utils.TLYouTubeFeedHelper",
		"assets.js.feed.utils.TLTwitterFeedHelper", "assets.js.feed.utils.TLGoogleRSSFeedHelper" ]);

TLTranslation["english"] = {
	months : [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
	shortMonths : [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
	daySuffixes : [ "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th",
			"th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th" ],
	weekDays : [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
	shortWeekDays : [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
	more : "more",
	by : "By",
	aboutThisTimeline : "About this timeline",
	"continue" : "Continue",
	clickToFindOutMore : "Click to find out more",
	findOutMore : "Find out more",
	videos : "Videos",
	audio : "Audio",
	images : "Images",
	stories : "x1 of x2 stories",
	playAudio : "Play audio",
	playVideo : "Play video",
	closeAudio : "Close audio",
	closeVideo : "Close video",
	BC : "BC",
	AD : "AD",
	million : "million",
	billion : "billion",
	userControls : {
		"search" : "Search",
		categories : "Categories",
		viewType : "View Type",
		spacing : "Spacing",
		zoom : "Zoom",
		enterSearchTerm : "Enter search term",
		"go" : "Go",
		displaying : "Displaying:",
		allStories : "All stories",
		stories : "stories",
		story : "story",
		matching : "matching",
		"clear" : "clear",
		showAll : "Show All",
		standard : "Standard",
		categoryBands : "Category Bands",
		colouredStories : "Coloured Stories",
		duration : "Duration",
		topToBottom : "Top to Bottom",
		"rows" : "rows",
		equalSpacing : "Equal Spacing"
	}
};
TLTranslation["english-common"] = {
	months : [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
	shortMonths : [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
	daySuffixes : [ "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th",
			"th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th" ],
	weekDays : [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
	shortWeekDays : [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
	more : "more",
	by : "By",
	aboutThisTimeline : "About this timeline",
	"continue" : "Continue",
	clickToFindOutMore : "Click to find out more",
	findOutMore : "Find out more",
	videos : "Videos",
	audio : "Audio",
	images : "Images",
	stories : "x1 of x2 stories",
	playAudio : "Play audio",
	playVideo : "Play video",
	closeAudio : "Close audio",
	closeVideo : "Close video",
	BC : "BCE",
	AD : "CE",
	million : "million",
	billion : "billion"
};
TLTranslation["chinese-simplified"] = {
	translation_credit : "Jeremy Wu PhD (www.jeremy-wu.com)",
	months : [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
	shortMonths : [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
	daySuffixes : [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
	weekDays : [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ],
	shortWeekDays : [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ],
	more : "更多",
	by : "经",
	aboutThisTimeline : "有关这时间轴",
	"continue" : "继续",
	findOutMore : "找到更多",
	videos : "视频",
	audio : "音响",
	images : "图像",
	stories : "x1 / x2 故事",
	playAudio : "开音响",
	playVideo : "开视频",
	closeAudio : "关音响",
	closeVideo : "关视频",
	BC : "公元前",
	AD : "公元后",
	million : "百万",
	billion : "十亿"
};
TLTranslation["chinese-traditional"] = {
	translation_credit : "Jeremy Wu PhD (www.jeremy-wu.com)",
	months : [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
	shortMonths : [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
	daySuffixes : [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ],
	weekDays : [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ],
	shortWeekDays : [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ],
	more : "更多",
	by : "經",
	aboutThisTimeline : "有關這時間軸",
	"continue" : "繼續",
	findOutMore : "找到更多",
	videos : "視頻",
	audio : "音響",
	images : "圖像",
	stories : "x1 / x2 故事",
	playAudio : "開音響",
	playVideo : "開視頻",
	closeAudio : "關音響",
	closeVideo : "關視頻",
	BC : "公元前",
	AD : "公元後",
	million : "百萬",
	billion : "十億"
};

$import("assets.js.security.setting.TLConfigText");
$import("assets.js.security.controller.TLAdminController");
$import("assets.js.security.controller.TLAdminFeedController");
$import("assets.js.security.controller.TLImagePositioningController");
$import("assets.js.security.component.AJKFeedItemSelector");
$import("assets.js.security.component.TLDateFormatterField");
$import("assets.js.security.component.TLStoryEditButton");
$import("assets.js.security.component.TLUserControlsExtender");

$import("assets.js.security.component.TLAdminLightbox");
$import("assets.js.security.controller.TLSecurityMainController");
$import("assets.js.security.component.TLSecurityMarker");

$import("assets.js.security.controller.AJKTabBlockController");
$import("assets.js.security.controller.AJKSwitchBlockController");
$import("assets.js.security.component.AJKAlert");
$import("assets.js.security.component.AJKImageSelector");
$import("assets.js.security.component.AJKSelectedImagePanel");
$import("assets.js.security.component.AJKImageUrlSelector");
$import("assets.js.security.component.AJKUploadImageSelector");
$import("assets.js.security.component.AJKFlickrImageSelector");
$import("assets.js.security.controller.AJKScrollableListController");
$import("assets.js.security.controller.TLTimelineAdvancedSettingsController");
$import("assets.js.security.service.TLPDFServices");
$import("assets.js.security.service.TLCSVServices");

$import("assets.js.security.event.TLAdminEventCatcher");
$import("assets.js.security.setting.TLTimeline3DSettings");
$import("assets.js.security.utils.TLAdminHelp");
$import("assets.js.security.component.TLGeneralPurposePanel");
$import("assets.js.security.controller.AJKDatePickerController");
$import("assets.js.security.component.AJKDatePicker");
$import("assets.js.security.utils.AJKDatePickerHelper");

if (typeof TLSingleTimelineLicense == "undefined") {
	var TLSingleTimelineLicense = false;
}
var theAJKWindowResizeEvent, theTLSettings, theTLMainController, theAJKMouseMoveEvent, theAJKMouseScrollEvent, theAJKButtonPopupController, theAJKKeyEvent, theAJKAjaxController, theTLHashController, TLGLOBALIsTouchDevice, TLGLOBALLastTouchEvent;
$(document).ready(function() {
	$.browser.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
	$.browser.isMac = navigator.userAgent.toLowerCase().indexOf('macintosh') > -1;
	$.browser.isWindows = navigator.userAgent.toLowerCase().indexOf('windows') > -1;
	$.browser.isIOS = (navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad)/)) ? true : false;
	if ($.browser.msie && $.browser.version >= 9) {
		$.browser.msie = false;
		$.browser.isIE9 = true;
		$.browser.isModernIE = true;
	}
	if ($.browser.msie && $.browser.version == 6) {
		$.browser.isIE6 = true;
	}
	if (window.document.body.style["borderRadius"] === undefined) {
		$("body").addClass("tl-browser-type-advanced-css-unavailable");
	}
	if ($.browser.isIOS) {
		$("body").addClass("tl-browser-type-ios");
	}
	theAJKWindowResizeEvent = new assets.js.core.event.AJKWindowResizeEvent().init();
	theAJKMouseMoveEvent = new assets.js.core.event.AJKMouseMoveEvent().init();
	// TODO
	theAJKMouseScrollEvent = new assets.js.core.event.AJKMouseScrollEvent({
		disableScrollPropagation : false
	}).init();
	theAJKKeyEvent = new assets.js.core.event.AJKKeyEvent().init();
	theAJKWindowBlurEvent = new assets.js.core.event.AJKWindowBlurEvent().init();
	theAJKAjaxController = new assets.js.core.controller.AJKAjaxController().init();
	theAJKButtonPopupController = new assets.js.core.controller.AJKButtonPopupController({
		domButtons : $("#tl-header .main-menu a").get()
	}).init();
	theTLSettings = new assets.js.core.setting.TLSettings().init();
	theTLHashController = new assets.js.core.controller.TLHashController().init();
	(function() {
		if ($("#tl-slider-scale canvas").get()[0].getContext) {
			theTLMainController = new assets.js.core.controller.TLMainController();
			theTLMainController.init();
		} else {
			var thisFunc = arguments.callee;
			setTimeout(function() {
				thisFunc();
			}, 5);
		}
	})();
	var onmessage = function(e) {
		if (e.data == "mouseup") {
			theAJKWindowBlurEvent.informObserversOfBlur();
		}
	};
	if (typeof window.addEventListener != 'undefined') {
		window.addEventListener('message', onmessage, false);
	} else if (typeof window.attachEvent != 'undefined') {
		window.attachEvent('onmessage', onmessage);
	}
	var isTouchDevice = false;
	if (!$.browser.msie && !$.browser.isIE9) {
		isTouchDevice = function() {
			return 'ontouchstart' in window;
		};
	}
	TLGLOBALIsTouchDevice = (isTouchDevice) ? isTouchDevice() : false;
	if (TLGLOBALIsTouchDevice) {
		var touchHandler = function(event) {
			var touches = event.changedTouches, first = touches[0], type = "";
			switch (event.type) {
			case "touchstart":
				type = "mousedown";
				break;
			case "touchmove":
				type = "mousemove";
				break;
			case "touchend":
				type = "mouseup";
				break;
			default:
				return;
			}
			TLGLOBALLastTouchEvent = event.type;
			var simulatedEvent = document.createEvent("MouseEvent");
			simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);
			first.target.dispatchEvent(simulatedEvent);
			if (event.type == "touchmove") {
				event.preventDefault();
			}
		};
		document.addEventListener("touchstart", touchHandler, true);
		document.addEventListener("touchmove", touchHandler, true);
		document.addEventListener("touchend", touchHandler, true);
		document.addEventListener("touchcancel", touchHandler, true);
	}

	var e = $("#tl-stage-holder").find(".scrolltop[role='scrolltop']");
	e.click(function() {
		$("#tl-stage-holder").animate({
			scrollTop : 0
		}, "slow", "linear");
	});
	$("#tl-stage-holder").scroll(function() {
		var scrolltop = $(this).scrollTop();
		if (scrolltop <= 8) {
			e.hide();
		} else {
			e.fadeTo("slow", 0.92);
		}
	});

});
