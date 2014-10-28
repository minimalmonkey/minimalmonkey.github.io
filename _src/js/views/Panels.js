'use strict';

var createPageItem = require('../utils/createPageItem');
var isMouseOut = require('../utils/isMouseOut');
var loadPage = require('../components/loadPage');
var setColor = require('../utils/setColor');
var transitionEndEvent = require('../utils/transitionEndEvent')();
var waitAnimationFrames = require('../utils/waitAnimationFrames');

var BaseView = require('./BaseView');
var Breakpoints = require('../components/Breakpoints');
var ColorDictionary = require('../components/ColorDictionary');
var PanelsNav = require('./PanelsNav');
var ScrollEvents = require('../components/ScrollEvents');

function Panels () {
	this.el = document.getElementById('panels') || createPageItem('panels', 'div', 'pagecontent-item', 'is-hidden');
	this.nav = new PanelsNav();
	this.scrollEvents = new ScrollEvents(this.el);
	this.panels = document.querySelectorAll('#panels .panel');
	this.panels = Array.prototype.slice.call(this.panels);
	this.panelsUrlMap = {};
	this.totalPanels = this.panels.length;
	this.currentIndex = -1;

	this.loadSelectors = [
		'#panels .panel',
		'#panels-nav'
	];

	this.onMouseOver = this.onMouseOver.bind(this);
	this.onMouseOut = this.onMouseOut.bind(this);
	this.onScrolledToEnd = this.onScrolledToEnd.bind(this);
	this.onScrolledToPoint = this.onScrolledToPoint.bind(this);
	this.onNavClicked = this.onNavClicked.bind(this);
	this.onHiddenToPost = this.onHiddenToPost.bind(this);

	this.on('onloaded', this.onPanelsLoaded.bind(this));

	if (document.body.classList.contains('is-panels')) {
		if (Breakpoints.contains(Breakpoints.HORIZONTAL)) {
			this.listenToTransitionEnd(this.panels[this.totalPanels - 1], this.onIntroComplete.bind(this));
		}
		else {
			// currently stacked view has no intro
			waitAnimationFrames(this.onIntroComplete.bind(this), 2);
		}
		this.deeplinked();
	}
	else if (document.body.classList.contains('is-lab') || document.body.classList.contains('is-404')) {
		this.hideBelow();
	}
}

var proto = Panels.prototype = new BaseView();

proto.show = function (fromState, lastUrl) {
	switch (fromState) {
		case 'post' :
			this.showFromPost(lastUrl);
			break;

		case 'lab' :
		case '404' :
			this.showFromBelow();
			break;

		default :
			// TODO: add default
	}
};

proto.hide = function (nextState) {
	switch (nextState) {
		case 'post' :
			this.transitionToPost();
			this.on('onhidden', this.onHiddenToPost);
			break;

		case 'lab' :
		case '404' :
			this.hideBelow();
			window.requestAnimationFrame(this.onHidden.bind(this));
			break;

		default :
			this.disable(); // do you need disable here ?
			this.el.classList.add('is-hidden');
			this.onScrolledToPoint();
	}
};

proto.fadeInTransition = function () {
	if (Breakpoints.contains(Breakpoints.STACKED)) {
		window.scrollTo(0, this.storedScrollY || 0);
	}

	this.el.classList.add('is-fadeout');

	waitAnimationFrames(function () {
		document.body.classList.add('is-transition-fade');
		this.el.classList.remove('is-fadeout');
		this.listenToTransitionEnd(this.el, this.onShowed);
	}.bind(this), 2);
};

proto.fadeOutTransition = function () {
	this.storedScrollY = window.pageYOffset;
	document.body.classList.add('is-transition-fade');

	waitAnimationFrames(function () {
		this.el.classList.add('is-fadeout');
		this.listenToTransitionEnd(this.el, this.onHidden);
	}.bind(this), 2);
};

proto.showFromBelow = function () {
	this.el.classList.remove('is-hidden');
	this.listenToTransitionEnd(this.getLastShownPanel(), this.onShowed);
	waitAnimationFrames(function () {
		this.el.classList.remove('is-hidebelow');
	}.bind(this), 2);
};

proto.hideBelow = function () {
	setColor(document.body);
	document.body.classList.add('is-transition-panelsbelow'); // TODO: check this is removed in app
	this.el.classList.add('is-hidebelow');
};

proto.showFromPost = function (url) {
	this.el.classList.remove('is-hidden');
	var panelObj = this.panelsUrlMap[url];
	if (panelObj && Breakpoints.contains(Breakpoints.HORIZONTAL)) {
		this.transitionFromPost(panelObj);
	}
	else {
		document.body.classList.remove('is-transition-topanelsfrompost');
		this.fadeInTransition();
	}
};

proto.load = function (url) {
	BaseView.prototype.load.call(this, url || '/');
};

proto.onHiddenToPost = function (evt) {
	this.off('onhidden', this.onHiddenToPost);
	this.hide();
	this.resetTransition();
};

proto.addPanels = function (index, append) {
	function callback (index) {
		return function () {
			this.onPanelMouseOver(index);
		};
	}
	// TODO: add `is-shrunk-right` to the first added element if append is `true` and we're hovering
	var panel;
	var i = index || 0;
	for (i; i < this.totalPanels; ++i) {
		panel = this.panels[i];
		panel.addEventListener('mouseover', callback(i).bind(this), false);
		this.panelsUrlMap[panel.pathname] = {
			index: i,
			panel: panel
		};
		if (append) {
			this.el.appendChild(panel);
		}
	}
};

proto.addExpandClass = function () {
	this.panels[this.currentIndex].classList.add('is-expanded');

	if (this.currentIndex > 0) {
		this.panels[this.currentIndex - 1].classList.add('is-shrunk-left');
	}

	if (this.currentIndex < this.totalPanels - 1) {
		this.panels[this.currentIndex + 1].classList.add('is-shrunk-right');
	}
};

proto.removeExpandClass = function () {
	if (this.currentIndex > -1) {
		this.panels[this.currentIndex].classList.remove('is-expanded');

		if (this.currentIndex > 0) {
			this.panels[this.currentIndex - 1].classList.remove('is-shrunk-left');
		}

		if (this.currentIndex < this.totalPanels - 1) {
			this.panels[this.currentIndex + 1].classList.remove('is-shrunk-right');
		}
	}
};

proto.onPanelMouseOver = function (index) {
	if (this.currentIndex != index) {
		this.removeExpandClass();
		this.currentIndex = index;
		this.addExpandClass();
	}
};

proto.onMouseOver = function (evt) {
	this.el.removeEventListener('mouseover', this.onMouseOver);
	this.el.addEventListener('mouseout', this.onMouseOut, true);
	this.el.classList.add('is-hovered');
};

proto.onMouseOut = function (evt) {
	if (evt === undefined || isMouseOut(evt)) {
		this.el.removeEventListener('mouseout', this.onMouseOut);
		this.el.addEventListener('mouseover', this.onMouseOver, false);
		this.el.classList.remove('is-hovered');

		if (this.currentIndex > -1) {
			this.removeExpandClass();
			this.currentIndex = -1;
		}
	}
};

proto.setNav = function (nav) {
	this.nav.setLoading(false);
	this.nav.el.addEventListener('click', this.onNavClicked, false);
	if (nav) {
		this.nav.setPath(nav.href);
	}
	else {
		this.allPanelsLoaded = true;
		if (Breakpoints.contains(Breakpoints.STACKED)) {
			this.nav.hide();
		}
	}
};

proto.onPanelsLoaded = function (evt) {

	var panels = evt.args[0];
	var nav = evt.args[1][0];

	this.setNav(nav);
	this.panels = this.panels.concat(Array.prototype.slice.call(panels));
	var index = this.totalPanels;
	this.totalPanels = this.panels.length;
	this.addPanels(index, true);

	this.scrollEvents.addPoint(this.scrollEvents.widthMinusWindow + this.panels[0].offsetWidth);
	this.el.addEventListener('reachedpoint', this.onScrolledToPoint, false);

	if (!this.allPanelsLoaded) {
		this.scrollEvents.update(this.el);
		this.el.addEventListener('reachedend', this.onScrolledToEnd, false);
	}
};

proto.loadMorePanels = function () {
	this.nav.setLoading(true);
	this.load(this.nav.getPath());
};

proto.onScrolledToEnd = function (evt) {
	this.el.removeEventListener('reachedend', this.onScrolledToEnd);
	this.loadMorePanels();
};

proto.onScrolledToPoint = function (evt) {
	this.el.removeEventListener('reachedpoint', this.onScrolledToPoint);
	this.scrollEvents.clearPoints();
	this.nav.hide();
	if (this.allPanelsLoaded) {
		this.scrollEvents.disable();
	}
};

proto.onNavClicked = function (evt) {
	evt.preventDefault();
	if (!this.nav.getLoading()) {
		if (Breakpoints.contains(Breakpoints.HORIZONTAL)) {
			this.scrollEvents.scrollToPoint(0);
			this.onScrolledToPoint();
			this.nav.el.removeEventListener('click', this.onNavClicked);
		}
		else if (Breakpoints.contains(Breakpoints.STACKED)) {
			this.loadMorePanels();
		}
	}
};

proto.getLastShownPanel = function () {
	var panel = this.panels[0];
	var winWidth = window.innerWidth;
	var scrollLeft = window.pageXOffset;
	for (var i = 0; i < this.totalPanels; i++) {
		if (this.panels[i].offsetLeft - scrollLeft > winWidth && i > 0) {
			panel = this.panels[i - 1];
			i = this.totalPanels;
		}
	}
	return panel;
};

proto.getPanelFromURL = function (url) {
	var panelObj = this.panelsUrlMap[url];
	if (panelObj) {
		return panelObj.panel;
	}
	return undefined;
};

proto.transitionToPost = function () {
	document.body.classList.add('is-transition-topostfrompanels');
	var panel = this.panels[this.currentIndex] || this.getPanelFromURL(location.pathname);
	if (panel === undefined) {
		setColor(document.body, ColorDictionary.get(location.pathname));
		this.fadeOutTransition();
		return;
	}
	setColor(document.body, panel.dataset.color);
	if (Breakpoints.contains(Breakpoints.HORIZONTAL)) {
		if (this.currentIndex < 0) {
			this.onPanelMouseOver(this.panels.indexOf(panel));
		}
		this.transformed = this.nudgeSiblingPanels(this.currentIndex, 25); // 25 is half the expand width - maybe make this dynamic?
		var listenTo = this.transformed[0];
		this.listenToTransitionEnd(listenTo, this.onHidden);
	}
	else {
		this.fadeOutTransition();
	}
};

proto.transitionFromPost = function (panelObj) {
	var midPoint = window.innerWidth * 0.5;
	var left = panelObj.panel.offsetLeft + (this.panels[0].offsetWidth * 0.5);
	var scrollLeft = Math.round(left - midPoint);
	window.scrollTo(scrollLeft, 0);

	this.transformed = this.nudgeSiblingPanels(panelObj.index);
	var listenTo = this.transformed[0];

	panelObj.panel.classList.add('is-transition-panel');

	waitAnimationFrames(function () {
		document.body.classList.remove('is-transition-topanelsfrompost');
		panelObj.panel.classList.remove('is-transition-panel');
		this.resetTransition();
		this.listenToTransitionEnd(listenTo, this.onShowed);
	}.bind(this), 2);
};

proto.nudgeSiblingPanels = function (index, expandWidth) {
	expandWidth = expandWidth || 0;
	var nudgedPanels = [];
	var panelWidth = this.panels[0].offsetWidth;
	var winWidth = window.innerWidth;
	var scrollLeft = window.pageXOffset;
	var slideAmount = winWidth - ((this.panels[index].offsetLeft - scrollLeft) + panelWidth + expandWidth);
	var style = '-webkit-transform: translateX(' + slideAmount + 'px); transform: translateX(' + slideAmount + 'px)';
	var i = index;

	while (++i && i < this.totalPanels) {
		if (this.panels[i].offsetLeft - scrollLeft < winWidth) {
			nudgedPanels.push(this.panels[i]);
			this.panels[i].style.cssText = style;
		}
		else {
			i = Infinity;
		}
	}

	slideAmount = this.panels[index].offsetLeft - scrollLeft - expandWidth;
	style = '-webkit-transform: translateX(-' + slideAmount + 'px); transform: translateX(-' + slideAmount + 'px)';
	scrollLeft -= panelWidth;
	i = index;

	while (i--) {
		if (this.panels[i].offsetLeft - scrollLeft) {
			nudgedPanels.push(this.panels[i]);
			this.panels[i].style.cssText = style;
		}
		else {
			i = -1;
		}
	}

	return nudgedPanels;
};

proto.resetTransition = function () {
	if (this.transformed) {
		var i = this.transformed.length;
		while (i--) {
			this.transformed[i].style.cssText = '';
		}
		this.transformed = undefined;
		this.onMouseOut();
	}
};

proto.onStackedBreakpoint = function (evt) {
	this.scrollEvents.disable();
	if (!this.allPanelsLoaded) {
		this.nav.show();
		this.nav.el.addEventListener('click', this.onNavClicked, false);
	}
};

proto.onHorizontalBreakpoint = function (evt) {
	if (!this.allPanelsLoaded) {
		this.scrollEvents.enable();
	}
	this.nav.hide();
	this.nav.el.removeEventListener('click', this.onNavClicked);
};

proto.enable = function () {
	this.el.addEventListener('mouseover', this.onMouseOver, false);
	this.el.addEventListener('reachedend', this.onScrolledToEnd, false);
	this.bindBreakpointListeners();
	this.addPanels();
	this.scrollEvents.update(this.el);

	if (Breakpoints.contains(Breakpoints.HORIZONTAL)) {
		this.onHorizontalBreakpoint();
	}
	else {
		this.onStackedBreakpoint();
	}

	var onMouseMove = function (evt) {
		document.removeEventListener('mousemove', onMouseMove);
		var index = this.panels.indexOf(evt.target);
		if (index > -1) {
			this.onMouseOver();
			this.onPanelMouseOver(index);
		}
	}.bind(this);
	document.addEventListener('mousemove', onMouseMove, false);
};

proto.disable = function () {
	this.el.removeEventListener('mouseover', this.onMouseOver);
	this.el.removeEventListener('mouseout', this.onMouseOut);
	this.el.classList.remove('is-fadeout');
	this.nav.hide();
	this.nav.el.removeEventListener('click', this.onNavClicked);
	this.unbindBreakpointListeners();
	this.scrollEvents.disable();
};

module.exports = Panels;
