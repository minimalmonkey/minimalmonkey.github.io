'use strict';

var createPageItem = require('../utils/createPageItem');
var isMouseOut = require('../utils/isMouseOut');
var loadPage = require('../components/loadPage');
var setColor = require('../utils/setColor');
var transitionEndEvent = require('../utils/transitionEndEvent')();
var waitAnimationFrames = require('../utils/waitAnimationFrames');

var BaseView = require('./BaseView');
var PanelsNav = require('./PanelsNav');
var ScrollEvents = require('../components/ScrollEvents');
var TransitionWatcher = require('../components/TransitionWatcher');

function Panels () {
	// this.stateName = 'panels';
	this.el = document.getElementById('panels') || createPageItem('panels', 'div', 'pagecontent-item', 'is-hidden');
	this.nav = new PanelsNav();
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
	// this.onPanelsLoaded = this.onPanelsLoaded.bind(this);
	this.onNavClicked = this.onNavClicked.bind(this);
	this.onHiddenToPost = this.onHiddenToPost.bind(this);

	this.on('onloaded', this.onPanelsLoaded.bind(this));

	if (document.body.classList.contains('is-panels', 'is-intro')) {
		this.introWatcher = new TransitionWatcher();
		this.onIntroEnded = this.onIntroEnded.bind(this);
		this.panels[this.totalPanels - 1].addEventListener(transitionEndEvent, this.onIntroEnded, false);

		this.deeplinked();
	}
	else if (document.body.classList.contains('is-lab')) {
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
			this.showFromBelow();
			break;

		default :
			// TODO: add default
	}
};

// proto.preload = function () {
// 	if (this.panels.length <= 0) {
// 		loadPage('/', this.onPanelsLoaded, '#panels .panel', '#panels-nav');
// 	}
// };

proto.showFromPost = function (url) {

	this.el.classList.remove('is-hidden');

	// this.scrollEvents.update(this.el);
	this.transitionFromPost(url);

	this.enable();

	// window.requestAnimationFrame(function () {
	// 	this.scrollEvents.update(this.el);
	// 	this.transitionFromPost(url);
	// }.bind(this));

	// waitAnimationFrames(function () {
	// 	this.scrollEvents.update(this.el);
	// 	this.transitionFromPost(url);
	// }.bind(this), 20);
};

proto.showFromBelow = function () {

	this.el.classList.remove('is-hidden');

	waitAnimationFrames(function () {
		this.el.classList.remove('is-hidebelow');
	}.bind(this), 2);

	// return
	this.transitionBelow();

	this.enable();
};

proto.hideBelow = function () {
	setColor(document.body);
	document.body.classList.add('is-transition-panelsbelow');
	this.el.classList.add('is-hidebelow');
};

proto.hide = function (nextState) {
	switch (nextState) {
		case 'post' :
			this.transitionToPost();
			this.on('onhidden', this.onHiddenToPost);
			break;

		case 'lab' :
			this.hideBelow();
			window.requestAnimationFrame(this.onHidden.bind(this));
			break;

		default :
			this.disable();
			this.el.classList.add('is-hidden');
			this.onScrolledToPoint();
	}
};

proto.onHiddenToPost = function (evt) {
	this.off('onhidden', this.onHiddenToPost);
	this.hide();
	this.resetTransition();

	// waitAnimationFrames(function () {
	// 	this.hide();
	// 	this.resetTransition();
	// }.bind(this), 2);
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

proto.onIntroEnded = function (evt) {
	this.panels[this.totalPanels - 1].removeEventListener(transitionEndEvent, this.onIntroEnded);
	this.enable();
	this.introWatcher.complete();

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

proto.onPanelsLoaded = function (evt) {

	var panels = evt.args[0];
	var nav = evt.args[1];

	// console.log('onPanelsLoaded!', evt);
	// return;

	// panels, nav

	this.nav.setLoading(false);
	this.panels = this.panels.concat(Array.prototype.slice.call(panels));
	var index = this.totalPanels;
	this.totalPanels = this.panels.length;
	this.addPanels(index, true);

	if (this.scrollEvents === undefined) {
		// not enabled yet
		if (nav[0]) {
			this.nav.setPath(nav[0].href);
		}
		return;
	}

	this.scrollEvents.addPoint(this.scrollEvents.widthMinusWindow + this.panels[0].offsetWidth);
	this.el.addEventListener('reachedpoint', this.onScrolledToPoint, false);
	this.nav.el.addEventListener('click', this.onNavClicked, false);

	if (nav[0]) {
		this.nav.setPath(nav[0].href);
		this.scrollEvents.update(this.el);
		this.el.addEventListener('reachedend', this.onScrolledToEnd, false);
	}
	else {
		this.allPanelsLoaded = true;
	}
};

proto.onScrolledToEnd = function (evt) {
	this.el.removeEventListener('reachedend', this.onScrolledToEnd);
	this.nav.setLoading(true);
	// TODO: make this just load()
	console.log('scrolled to end.... TODO');
	// loadPage(this.nav.getPath(), this.onPanelsLoaded, '#panels .panel', '#panels-nav');
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
		this.scrollEvents.scrollToPoint(0);
		this.onScrolledToPoint();
		this.nav.el.removeEventListener('click', this.onNavClicked);
	}
};

proto.getCurrentColor = function (url) {
	var panel = this.currentIndex ? this.panels[this.currentIndex] : this.panelsUrlMap[url].panel;
	return panel.dataset.color;
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

proto.transitionBelow = function () {
	// var watcher = new TransitionWatcher();

	// var listenTo = this.getLastShownPanel();

	/*if (listenTo === undefined) {
		console.log('wait for panels to load first....');
		// panel not loaded - do fade instead
		// also check if any panels, if not, load
		// them or wait until they have loaded
		return watcher;
	}*/

	// this.listenToTransitionEnd(listenTo, watcher);
	// return watcher;

	this.listenToTransitionEnd(this.getLastShownPanel(), this.onShowed);
};

proto.transitionToPost = function () {
	var color = this.getCurrentColor(location.pathname);
	document.body.classList.add('is-transition-topostfrompanels');
	setColor(document.body, color);

	// console.log('>>>>>> window.pageXOffset:', window.pageXOffset);

	// return;
	// if (this.foo) {
	// 	return;
	// }
	// this.foo = true;

	this.transformed = this.nudgeSiblingPanels(this.currentIndex, 25); // 25 is half the expand width - maybe make this dynamic?
	var listenTo = this.transformed[0];
	// var watcher = new TransitionWatcher();
	this.listenToTransitionEnd(listenTo, this.onHidden);
	// return watcher;
};

proto.transitionFromPost = function (url) {

	// console.log('YEAH, here');

	/*var watcher = new TransitionWatcher();
	var panelObj = this.panelsUrlMap[url];

	if (panelObj === undefined) {
		// panel not loaded - do fade instead
		// also check if any panels, if not, load
		// them or wait until they have loaded
		return watcher;
	}*/

	// console.log('window.pageXOffset:', window.pageXOffset);

	var panelObj = this.panelsUrlMap[url];
	var midPoint = window.innerWidth * 0.5;
	var left = panelObj.panel.offsetLeft + (this.panels[0].offsetWidth * 0.5);
	var scrollLeft = Math.round(left - midPoint);
	window.scrollTo(scrollLeft, 0);

	// console.log('window.pageXOffset:', window.pageXOffset);

	this.transformed = this.nudgeSiblingPanels(panelObj.index);
	var listenTo = this.transformed[0];

	panelObj.panel.classList.add('is-transition-panel');

	waitAnimationFrames(function () {
		document.body.classList.remove('is-transition-topanelsfrompost');
		panelObj.panel.classList.remove('is-transition-panel');
		this.resetTransition();
		this.listenToTransitionEnd(listenTo, this.onShowed);
	}.bind(this), 2);

	// return watcher;
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

// proto.listenToTransitionEnd = function (el, callback) {
// 	var context = this;
// 	var onTransitionEnded = function (evt) {
// 		el.removeEventListener(transitionEndEvent, onTransitionEnded);
// 		callback.call(context);
// 	};
// 	el.addEventListener(transitionEndEvent, onTransitionEnded, false);
// };

proto.resetTransition = function () {
	var i = this.transformed.length;
	while (i--) {
		this.transformed[i].style.cssText = '';
	}
	this.transformed = undefined;
	this.onMouseOut();
};

proto.enable = function () {
	this.el.addEventListener('mouseover', this.onMouseOver, false);
	this.el.addEventListener('reachedend', this.onScrolledToEnd, false);
	this.addPanels();
	if (this.scrollEvents === undefined) {
		this.scrollEvents = new ScrollEvents(this.el);
	}
	else {
		this.scrollEvents.update(this.el);
	}
};

proto.disable = function () {
	this.el.removeEventListener('mouseover', this.onMouseOver);
	this.el.removeEventListener('mouseout', this.onMouseOut);
};

module.exports = Panels;
