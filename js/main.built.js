/**
 * BUILT FILE DO NOT EDIT
 * src: https://github.com/minimalmonkey/minimalmonkey.github.io/tree/master/_src/js
 */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Analytics = require('./components/Analytics');
var Breakpoints = require('./components/Breakpoints');
var Error404 = require('./views/Error404');
var FeatureDetect = require('./utils/FeatureDetect');
var Header = require('./views/Header');
var Lab = require('./views/Lab');
var Panels = require('./views/Panels');
var Posts = require('./views/Posts');
var Router = require('./components/Router');

function App (analytics) {
	this.onNavigate = this.onNavigate.bind(this);
	this.onIntroComplete = this.onIntroComplete.bind(this);
	this.onViewHidden = this.onViewHidden.bind(this);
	this.onViewLoaded = this.onViewLoaded.bind(this);

	this.init(analytics);
}

var proto = App.prototype;

proto.init = function (analytics) {
	this.analytics = new Analytics('UA-54501731-1', 'minimalmonkey.github.io', 200);

	if (FeatureDetect.touch()) {
		document.documentElement.classList.remove('no-touch');
		document.documentElement.classList.add('touch');
	}

	Breakpoints.enable();

	this.logoButton = document.getElementById('siteheader-logo');
	this.logoButton.addEventListener('click', this.onLogoButtonClicked.bind(this));

	this.header = new Header();
	this.panels = new Panels();
	this.posts = new Posts();
	this.lab = new Lab();

	this.router = new Router([
		this.panels.el
	]);

	var headerLinks = this.header.getPageLinks();
	var i = headerLinks.length;
	while (i--) {
		this.router.add(headerLinks[i], this.onNavigate, this.header, 'header');
	}

	if (document.body.classList.contains('is-404')) {
		this.router.add(location.pathname, this.onNavigate, new Error404(), '404');
	}

	this.router.add('/', this.onNavigate, this.panels, 'panels');
	this.router.add('/lab/', this.onNavigate, this.lab, 'lab');
	this.router.add('*post', this.onNavigate, this.posts, 'post');
	this.router.match(location.pathname);

	this.view.on('onintrocomplete', this.onIntroComplete);
	window.requestAnimationFrame(function () {
		document.body.classList.add('is-introtransition');
		document.body.classList.remove('is-intro');
	});
};

proto.onNavigate = function (view, state, match, params) {
	if (state === 'header') {
		var lastURL = (this.state && this.state !== 'header') ? this.router.lastURL : false;
		this.header.open(match, lastURL);
	}
	else if (this.state === 'header') {
		this.header.close();
	}
	else if (this.state === state) {
		this.view.update(params);
	}
	else if (this.state) {
		document.body.classList.add('is-muted');
		view.load(params);
		this.view.on('onhidden', this.onViewHidden);
		this.view.hide(state);
	}
	this.setView(view, state);
	this.analytics.update(location.pathname);
};

proto.onLogoButtonClicked = function (evt) {
	evt.preventDefault();
	var path = '/';
	switch (this.state) {
		case 'panels' :
			if (window.pageXOffset > 0) {
				this.panels.scrollEvents.scrollToStart();
				return;
			}
			path = '/lab/';
			break;

		case 'header' :
			path = this.header.closeURL;
			break;
	}
	this.router.navigate(path);
};

proto.setView = function (view, state) {
	if (this.state === state) {
		return;
	}
	this.view = view;
	if (this.state) {
		this.lastState = this.state;
		document.body.classList.remove('is-' + this.state);
	}
	this.state = state;
	document.body.classList.add('is-' + this.state);
};

proto.onIntroComplete = function () {
	this.view.off('onintrocomplete', this.onIntroComplete);
	document.body.classList.remove('is-introtransition');
};

proto.showView = function () {
	this.view.on('onshowed', this.onViewShowed);
	this.view.show(this.lastState, this.router.lastURL);
};

proto.onViewShowed = function (evt) {
	evt.target.off('onshowed', this.onViewShowed);

	var classes = document.body.classList;
	var i = classes.length;
	while (i--) {
		if (classes[i].indexOf('is-transition-') === 0) {
			document.body.classList.remove(classes[i]);
		}
	}
	document.body.classList.remove('is-muted');
};

proto.onViewHidden = function (evt) {
	evt.target.off('onhidden', this.onViewHidden);
	if (this.view.hasPage(location.pathname)) {
		this.showView();
	}
	else {
		this.view.on('onloaded', this.onViewLoaded);
	}
};

proto.onViewLoaded = function (evt) {
	if (evt.url === location.pathname) {
		this.view.off('onloaded', this.onViewLoaded);
		this.showView();
	}
};

module.exports = App;

},{"./components/Analytics":2,"./components/Breakpoints":3,"./components/Router":6,"./utils/FeatureDetect":11,"./views/Error404":22,"./views/Header":23,"./views/Lab":24,"./views/Panels":25,"./views/Posts":27}],2:[function(require,module,exports){
'use strict';

var loadScript = require('../utils/loadScript');

function Analytics (id, domain, delay) {
	if (id && domain) {
		window._gaq = window._gaq || [];
		window._gaq.push(
			['_setAccount', id],
			['_setDomainName', domain],
			['_setAllowLinker', true],
			['_trackPageview']
		);
		var url = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		loadScript('analytics-wjs', url, delay);
	}
}

var proto = Analytics.prototype;

proto.update = function (url) {
	if (url.length && url.substr(0, 1) === '/') {
		url = url.substr(1);
	}
	try {
		if (window._gaq) {
			window._gaq.push(['_trackPageview', url]);
		}
	} catch(error) {
		console.warn('Error sending Google Analytics script.');
	}
};

module.exports = Analytics;

},{"../utils/loadScript":15}],3:[function(require,module,exports){
'use strict';

var throttleEvent = require('../utils/throttleEvent');

var EventEmitter = require('../components/EventEmitter');

function Breakpoints() {
	this._points = {};
	this._currentPoints = {};
	this._generateFromJSON();
}

var proto = Breakpoints.prototype = new EventEmitter();

proto._generateFromJSON = function () {
	var str = window.getComputedStyle(document.querySelector('html'), '::after').getPropertyValue('content');
	if (str) {
		str = str.substr(1, str.length-2);
		var json = JSON.parse(str);
		this.addFromObject(json);
	}
};

proto.addFromObject = function (obj) {
	for (var name in obj) {
		this.add(name, obj[name].from, obj[name].to);
	}
};

proto.add = function (name, from, to) {
	this[name.toUpperCase()] = name;
	this._points[name] = {
		from: from,
		to: to
	};
};

proto.remove = function (name) {
	if (this._points[name]) {
		this[name.toUpperCase()] = undefined;
		delete this._points[name];
		delete this._currentPoints[name];
	}
};

proto.contains = function (name) {
	return this._currentPoints[name];
};

proto._onResized = function () {
	var isActive;
	var changed = false;
	var winWidth = window.innerWidth;

	for (var point in this._points) {
		isActive = this._points[point].from <= winWidth && this._points[point].to >= winWidth;
		if (this._currentPoints[point] !== isActive) {
			this._currentPoints[point] = isActive;
			this.trigger((isActive ? 'in' : 'out') + ':' + point);
			changed = true;
		}
	}

	if (changed) {
		this.trigger('update', {
			points: this._currentPoints
		});
	}
};

proto.enable = function () {
	this._throttledResize = throttleEvent(this._onResized.bind(this), 50);
	window.addEventListener('resize', this._throttledResize, false);
	this._onResized();
};

proto.disable = function () {
	window.removeEventListener('resize', this._throttledResize);
};

module.exports = new Breakpoints();

},{"../components/EventEmitter":5,"../utils/throttleEvent":17}],4:[function(require,module,exports){
'use strict';

function ColorDictionary () {
	this._colors = {};
}

var proto = ColorDictionary.prototype;

proto.add = function (url, color) {
	this._colors[url] = color;
};

proto.get = function (url) {
	return this._colors[url];
};

module.exports = new ColorDictionary();

},{}],5:[function(require,module,exports){
'use strict';

function EventEmitter() {}

var proto = EventEmitter.prototype;

proto._getEvents = function () {
	return this._events || (this._events = {});
};

proto._getListeners = function (evt) {
	var events = this._getEvents();
	return events[evt] || (events[evt] = []);
};

proto._setListeners = function (evt, listeners) {
	var events = this._getEvents();
	events[evt] = listeners;
};

proto.on = function (evt, listener) {
	if (typeof listener !== 'function') {
		// throw error ?
		return;
	}
	var listeners = this._getListeners(evt);
	var index = listeners.indexOf(listener);
	if (index < 0) {
		listeners.push(listener);
	}
};

proto.off = function (evt, listener) {
	var listeners = this._getListeners(evt);
	var index = listeners.indexOf(listener);
	if (index > -1) {
		this._setListeners(evt, listeners.slice(0, index).concat(listeners.slice(index + 1)));
	}
};

proto.trigger = function (evt, obj) {
	obj = obj || {};
	obj.target = obj.target || this;
	var listeners = this._getListeners(evt);
	var i, len = listeners.length;
	for (i = 0; i < len; i++) {
		listeners[i].call(this, obj);
	}
};

module.exports = EventEmitter;

},{}],6:[function(require,module,exports){
'use strict';

var addEventListenerList = require('../utils/addEventListenerList');
var routeToRegExp = require('./routeToRegExp');

function Router (observeList) {
	this.lastURL = this.currentURL = location.pathname;

	this.onClicked = this.onClicked.bind(this);
	addEventListenerList(document.querySelectorAll('[data-router]'), 'click', this.onClicked);

	if (observeList && observeList.length) {
		this.observer = new MutationObserver(this.onAddedElements.bind(this));
		var config = {
			attributes: false,
			characterData: false,
			childList: true
		};
		var i = observeList.length;
		while (i--) {
			this.observer.observe(observeList[i], config);
		}
	}

	window.addEventListener('popstate', function(evt) {
		this.navigate(location.pathname, true);
	}.bind(this));

	this.routes = {};
}

var proto = Router.prototype;

proto.onAddedElements = function (mutations) {
	mutations.forEach(function (mutation) {
		var i = mutation.addedNodes.length;
		while (i--) {
			if (mutation.addedNodes[i].dataset.router !== undefined) {
				mutation.addedNodes[i].addEventListener('click', this.onClicked);
			}
			else {
				// TODO: get any children nodes with data-router
			}
		}
	}.bind(this));
};

proto.onClicked = function (evt) {
	evt.preventDefault();
	this.navigate(evt.currentTarget.pathname);
};

proto.navigate = function (route, silent) {
	if (route === this.currentURL) {
		return;
	}

	if (!silent) {
		history.pushState(null, null, route);
	}

	this.lastURL = this.currentURL;
	this.currentURL = route;

	this.match(route);
};

proto.getRoutes = function (route) {
	if (this.routes[route] === undefined) {
		this.routes[route] = {
			pattern: route,
			listeners: []
		};
	}
	return this.routes[route];
};

proto.add = function (route, callback) {
	route = routeToRegExp(route);
	var routes = this.getRoutes(route);
	routes.listeners.push({
		callback: callback,
		args: Array.prototype.slice.call(arguments).splice(2)
	});
};

proto.remove = function (route, callback) {
	//
};

proto.match = function (route) {
	var exec;
	for (var key in this.routes) {
		exec = this.routes[key].pattern.exec(route);
		if (exec && exec.length) {
			exec = exec.splice(0, 2);
			var listener;
			var i = this.routes[key].listeners.length;
			while (i--) {
				listener = this.routes[key].listeners[i];
				listener.callback.apply(this, listener.args.concat(exec));
			}
			break;
		}
	}
};

proto.enable = function () {
	//
};

proto.disable = function () {
	//
};

module.exports = Router;

},{"../utils/addEventListenerList":12,"./routeToRegExp":9}],7:[function(require,module,exports){
'use strict';

var EASE = 0.175;

var throttleEvent = require('../utils/throttleEvent');

function ScrollEvents (el) {
	this.points = [];
	this.throttledScroll = throttleEvent(this.onScrolled.bind(this), 50);
	this.throttledResize = throttleEvent(this.onResized.bind(this), 50);
}

var proto = ScrollEvents.prototype;

proto.scrollToPoint = function (index) {
	if (this.points[index]) {
		this.animateScroll(this.points[index]);
	}
};

proto.scrollToStart = function () {
	this.animateScroll(0);
};

proto.animateScroll = function (tx) {
	var updateScrollPosition = function () {
		var px = window.pageXOffset;
		var lx = window.pageXOffset;
		var vx = (tx - px) * EASE;
		px += vx;
		window.scrollTo(px, window.pageYOffset);
		if (~~px != lx) {
			window.requestAnimationFrame(updateScrollPosition);
		}
	};
	updateScrollPosition();
};

proto.update = function (el) {
	this.el = el;
	this.onResized();
};

proto.addPoint = function (p) {
	if (this.points.indexOf(p) < 0) {
		this.points.push(p);
	}
};

proto.removePoint = function (p) {
	var index = this.points.indexOf(p);
	if (index > -1) {
		this.points.splice(index);
	}
};

proto.clearPoints = function () {
	this.points = [];
};

proto.onScrolled = function (evt) {

	var scrollLeft = window.pageXOffset;
	if (scrollLeft >= this.widthMinusWindow) {
		var reachedEnd = new CustomEvent('reachedend', {
			detail: {}
		});
		this.el.dispatchEvent(reachedEnd);
	}

	if (this.points.length) {
		var i = this.points.length;
		while (i--) {
			if (scrollLeft >= this.points[i]) {
				var reachedPoint = new CustomEvent('reachedpoint', {
					detail: {
						point: this.points[i]
					}
				});
				this.el.dispatchEvent(reachedPoint);
			}
		}
	}
};

proto.onResized = function (evt) {
	this.widthMinusWindow = this.el.offsetWidth - window.innerWidth;
};

proto.enable = function () {
	window.addEventListener('scroll', this.throttledScroll, false);
	window.addEventListener('resize', this.throttledResize, false);
	this.onResized();
};

proto.disable = function () {
	window.removeEventListener('scroll', this.throttledScroll);
	window.removeEventListener('resize', this.throttledResize);
};

module.exports = ScrollEvents;

},{"../utils/throttleEvent":17}],8:[function(require,module,exports){
'use strict';

module.exports = function loadPage (url, callback) {

	var selectors = Array.prototype.slice.call(arguments).splice(2);
	var req = new XMLHttpRequest();

	req.onload = function () {

		if (req.readyState === 4) {
			if (req.status === 200) {

				var fragment = document.createDocumentFragment();
				fragment.appendChild(document.createElement('body'));
				var body = fragment.querySelector('body');
				body.innerHTML = this.responseText;

				var elements = [];
				var i = selectors.length;

				while (i--) {
					elements[i] = fragment.querySelectorAll(selectors[i]);
				}

				callback.apply(this, elements.length ? [url].concat(elements) : [url, this.responseText]);
				// temp - simulate slow / random load time
				// setTimeout(function () {
				// 	callback.apply(this, elements.length ? [url].concat(elements) : [url, this.responseText]);
				// }.bind(this), 200 + (Math.random() * 500));
			}
		}
	};

	req.open('get', url, true);
	req.send();
};

},{}],9:[function(require,module,exports){
'use strict';

var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

/* From Backbone.js */
module.exports = function routeToRegExp (route) {

	if (route.exec) {
		return route;
	}

	route = route.replace(escapeRegExp, '\\$&')
				.replace(optionalParam, '(?:$1)?')
				.replace(namedParam, function(match, optional) {
					return optional ? match : '([^/?]+)';
				})
				.replace(splatParam, '([^?]*?)');

	return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
};

},{}],10:[function(require,module,exports){
'use strict';

var loadScript = require('./utils/loadScript');

var Analytics = require('./components/Analytics');
var App = require('./App');

var init = function () {
	var externalsDelay;

	if (document.documentElement.classList) { // TODO: maybe change to see if MutationObserver exists & screw IE10?
		new App();
		externalsDelay = 1200;
	}
	else {
		new Analytics('UA-54501731-1', 'minimalmonkey.github.io');
		externalsDelay = 0;
	}

	// loadScript('twitter-wjs', '//platform.twitter.com/widgets.js', externalsDelay);
};

init();

},{"./App":1,"./components/Analytics":2,"./utils/loadScript":15}],11:[function(require,module,exports){
'use strict';

function FeatureDetect() {}

FeatureDetect.touch = function () {
	return 'ontouchstart' in window || 'onmsgesturechange' in window;
};

module.exports = FeatureDetect;

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function addEventListenerList (list, type, listener, useCapture) {
	var i = list.length;
	while (i--) {
		list[i].addEventListener(type, listener, useCapture);
	}
};

},{}],13:[function(require,module,exports){
'use strict';

module.exports = function createPageItem (id, type) {
	var el = document.createElement(type || 'div');
	el.id = id;
	el.className = Array.prototype.slice.call(arguments).splice(2).concat(id).join(' ');
	document.getElementById('pagecontent').appendChild(el);
	return el;
};

},{}],14:[function(require,module,exports){
'use strict';

/**
 * @name isMouseOut
 * Loops through event target parent elements to see if mouse
 * has left or just event bubbling from child element.
 *
 * @kind function
 *
 * @param {MouseEvent} evt
 *        The DOM MouseEvent trigged by `mouseout`.
 *
 * @returns {Boolean} Returns true if mouse has left parent.
 */
module.exports = function isMouseOut (evt) {

	var target = evt.currentTarget ? evt.currentTarget: evt.srcElement;
	var child = evt.relatedTarget ? evt.relatedTarget : evt.toElement;

	if (child) {
		while (child.parentElement) {
			if (target === child) {
				return false;
			}
			child = child.parentElement;
		}
	}

	return true;
};

},{}],15:[function(require,module,exports){
'use strict';

/**
 * @name loadScript
 * Loads an external scripts onto the page.
 *
 * @kind function
 *
 * @param {String} id
 *        A string to use as the id of the script tag.
 *
 * @param {String} src
 *        The url of the script to be loaded.
 *
 * @param {Number} [delay=0]
 *        Amount of time (ms) to delay before loading the script.
 *
 * @param {Element} [dest=document]
 *        The element in which to create the script tag.
 *
 * @returns {Number} Returns a value which can be used to cancel the timer.
 */
module.exports = function loadScript (id, src, delay, dest) {

	delay = delay || 0;
	dest = dest || document;

	return setTimeout(function() {
		try {
			var js, fjs = dest.getElementsByTagName('script')[0];
			if(!dest.getElementById(id)) {
				js = dest.createElement('script');
				js.async = true;
				js.id = id;
				js.src = src;
				fjs.parentNode.insertBefore(js, fjs);
			}
		}
		catch(error) {
			// error
		}
	}, delay);
};

},{}],16:[function(require,module,exports){
'use strict';

module.exports = function setColor (element, color) {
	var current = element.dataset.color;
	if (current) {
		if (current === color) {
			return;
		}
		element.classList.remove('color-' + current);
	}
	if (color) {
		element.dataset.color = color;
		element.classList.add('color-' + color);
	}
	else {
		element.dataset.color = null;
	}
};

},{}],17:[function(require,module,exports){
'use strict';

/**
 * @name throttleEvent
 * Throttles an event.
 *
 * @kind function
 *
 * @param {String} evt
 *        Event name.
 *
 * @returns {Function} Returns object.
 */
module.exports = function throttleEvent (callback, delay) {
	var timeout = null;
	return function (evt) {
		if (timeout === null) {
			timeout = setTimeout(function () {
				callback.call();
				timeout = null;
			}, delay);
		}
	};
};

},{}],18:[function(require,module,exports){
'use strict';

var transitionEnd;

/* From Modernizr */
module.exports = function transitionEndEvent () {

	if (transitionEnd) {
		return transitionEnd;
	}

	var t;
	var el = document.createElement('fakeelement');
	var transitions = {
		'transition':'transitionend',
		'OTransition':'oTransitionEnd',
		'MozTransition':'transitionend',
		'WebkitTransition':'webkitTransitionEnd'
	};

	for (t in transitions) {
		if ( el.style[t] !== undefined ) {
			transitionEnd = transitions[t];
			return transitionEnd;
		}
	}
};

},{}],19:[function(require,module,exports){
'use strict';

module.exports = function waitAnimationFrames (callback, howMany) {
	var args = Array.prototype.slice.call(arguments).splice(2);
	var count = 0;
	var checkCount = function () {
		++count;
		if (count === howMany) {
			callback.apply(this, args);
		}
		else {
			waitForNext();
		}
	};
	var waitForNext = function () {
		window.requestAnimationFrame(checkCount);
	};
	waitForNext();
};

},{}],20:[function(require,module,exports){
'use strict';

var loadPage = require('../components/loadPage');
var transitionEndEvent = require('../utils/transitionEndEvent')();

var Breakpoints = require('../components/Breakpoints');
var EventEmitter = require('../components/EventEmitter');

function BaseView() {}

var proto = BaseView.prototype = new EventEmitter();

proto.loadSelectors = [];
proto.pages = {};

proto.bindBreakpointListeners = function () {
	if (!this.boundBreakpoints) {
		// hmmm don't really like this, think of a better way
		this.boundBreakpoints = true;
		this.onStackedBreakpoint = this.onStackedBreakpoint.bind(this);
		this.onHorizontalBreakpoint = this.onHorizontalBreakpoint.bind(this);
	}
	Breakpoints.on('in:' + Breakpoints.STACKED, this.onStackedBreakpoint);
	Breakpoints.on('in:' + Breakpoints.HORIZONTAL, this.onHorizontalBreakpoint);
};

proto.unbindBreakpointListeners = function () {
	Breakpoints.off('in:' + Breakpoints.STACKED, this.onStackedBreakpoint);
	Breakpoints.off('in:' + Breakpoints.HORIZONTAL, this.onHorizontalBreakpoint);
};

proto.deeplinked = function () {
	var elements = [];
	var i = this.loadSelectors.length;
	while (i--) {
		elements[i] = document.querySelectorAll(this.loadSelectors[i]);
	}
	this.pages[location.pathname] = elements;
};

proto.update = function (url) {};

proto.show = function (fromState, lastUrl) {};

proto.hide = function (nextState) {};

proto.load = function (url) {
	if (url && this.pages[url] === undefined) {
		this.pages[url] = 'loading';
		loadPage.apply(this, [url, this.onLoaded.bind(this)].concat(this.loadSelectors));
	}
};

proto.hasPage = function (url) {
	return this.pages[url] && this.pages[url] !== 'loading';
};

proto.listenToTransitionEnd = function (el, callback) {
	var context = this;
	var onTransitionEnded = function (evt) {
		el.removeEventListener(transitionEndEvent, onTransitionEnded);
		callback.call(context);
	};
	el.addEventListener(transitionEndEvent, onTransitionEnded, false);
};

proto.onShowed = function () {
	this.trigger('onshowed');
	this.enable();
};

proto.onHidden = function () {
	this.trigger('onhidden');
	this.disable();
};

proto.onIntroComplete = function (evt) {
	this.trigger('onintrocomplete');
	this.enable();
};

proto.onLoaded = function () {
	var args = Array.prototype.slice.call(arguments, 0);
	var url = args.shift();
	this.pages[url] = args;
	this.trigger('onloaded', {
		url: url,
		args: args
	});
};

proto.onStackedBreakpoint = function (evt) {};

proto.onHorizontalBreakpoint = function (evt) {};

proto.enable = function () {};

proto.disable = function () {};

module.exports = BaseView;

},{"../components/Breakpoints":3,"../components/EventEmitter":5,"../components/loadPage":8,"../utils/transitionEndEvent":18}],21:[function(require,module,exports){
'use strict';

var loadScript = require('../utils/loadScript');

function Comments () {
	this.onClicked = this.onClicked.bind(this);
}

var proto = Comments.prototype;

proto.refresh = function () {
	if (this.el) {
		this.el.removeEventListener('click', this.onClicked);
	}
	this.el = document.getElementById('postcommentslink');
	this.el.addEventListener('click', this.onClicked, false);
};

proto.load = function () {
	this.el.removeEventListener('click', this.onClicked);
	this.el.classList.add('is-hidden');
	var parent = this.el.parentNode;
	var container = document.createElement('div');
	container.id = 'disqus_thread';
	container.classList.add('postcomments');
	parent.appendChild(container);

	if (this.scriptLoaded) {
		window.DISQUS.reset({
			reload: true,
			config: function () {
				this.page.url = document.URL;
			}
		});
	}
	else {
		this.scriptLoaded = true;
		loadScript('disqus-wjs', '//minimalmonkey.disqus.com/embed.js');
	}
};

proto.onClicked = function () {
	this.load();
};

module.exports = Comments;

},{"../utils/loadScript":15}],22:[function(require,module,exports){
'use strict';

var BaseView = require('./BaseView');

function Error404 () {
	this.el = document.getElementById('error404');

	if (document.body.classList.contains('is-404', 'is-intro')) {
		// doesn't have an intro at the moment so listen to siteheader instead
		this.listenToTransitionEnd(document.getElementById('siteheader'), this.onIntroComplete.bind(this));
	}
}

var proto = Error404.prototype = new BaseView();

proto.hasPage = function (url) {
	// override and always return true until real labs page exists
	return true;
};

proto.hide = function (nextState) {
	switch (nextState) {
		case 'panels' :
			// TODO: add delay then remove whatever view we have here
			this.el.classList.add('is-hidden');
			document.body.classList.add('is-transition-panelsbelow');
			window.requestAnimationFrame(this.onHidden.bind(this));
			break;

		default :
			// TODO: add default
	}
};

proto.show = function (fromState, lastUrl) {
	this.el.classList.remove('is-hidden');
	window.requestAnimationFrame(this.onShowed.bind(this));
};

module.exports = Error404;

},{"./BaseView":20}],23:[function(require,module,exports){
'use strict';

var transitionEndEvent = require('../utils/transitionEndEvent')();

var BaseView = require('./BaseView');

function Header () {
	this.el = document.getElementById('siteheader');
	this.pageContent = document.getElementById('pagecontent');
	this.closeButton = document.getElementById('siteheader-close');

	this.closeURL = '/';
	this.pages = {};
	var pages = document.querySelectorAll('.siteheader-page');
	var url, page;
	var i = pages.length;
	while (i--) {
		url = pages[i].id.split('-')[0];
		page = this.pages['/' + url + '/'] = {
			nav: document.querySelector('.sitenav a[href*="' + url + '"]'),
			page: pages[i]
		};
		page.nav.dataset.url = page.nav.href;
	}

	this.listenToTransitionEnd(this.el, this.onIntroComplete.bind(this));
}

var proto = Header.prototype = new BaseView();

proto.open = function (key, lastURL) {
	this.el.classList.remove('is-collapsed');
	this.pageContent.classList.add('is-disabled');
	this.hideCurrent();
	this.pages[key].nav.classList.add('is-selected');
	this.pages[key].page.classList.add('is-visible');

	if (lastURL) {
		this.closeURL = lastURL;
		this.closeButton.href = lastURL;
	}

	this.pages[key].nav.href = this.closeURL;
};

proto.close = function () {
	this.el.classList.add('is-collapsed');
	this.pageContent.classList.remove('is-disabled');
	this.hideCurrent();
};

proto.hideCurrent = function () {
	var currentNav = document.querySelector('.sitenavlink.is-selected');
	if (currentNav) {
		currentNav.classList.remove('is-selected');
		currentNav.href = currentNav.dataset.url;
	}

	var currentPage = document.querySelector('.siteheader-page.is-visible');
	if (currentPage) {
		currentPage.classList.remove('is-visible');
	}
};

proto.getPageLinks = function () {
	var links = document.querySelectorAll('.sitenavlink[data-router]');
	var pathnames = [];
	var i = links.length;
	while (i--) {
		pathnames[i] = links[i].pathname;
	}
	return pathnames;
};

module.exports = Header;

},{"../utils/transitionEndEvent":18,"./BaseView":20}],24:[function(require,module,exports){
'use strict';

var BaseView = require('./BaseView');

function Labs () {
	if (document.body.classList.contains('is-lab', 'is-intro')) {
		// doesn't have an intro at the moment so listen to siteheader instead
		this.listenToTransitionEnd(document.getElementById('siteheader'), this.onIntroComplete.bind(this));
	}
}

var proto = Labs.prototype = new BaseView();

proto.hasPage = function (url) {
	// override and always return true until real labs page exists
	return true;
};

proto.hide = function (nextState) {
	switch (nextState) {
		case 'panels' :
			// TODO: add delay then remove whatever view we have here
			document.body.classList.add('is-transition-panelsbelow');
			document.body.classList.remove('is-darktheme');
			window.requestAnimationFrame(this.onHidden.bind(this));
			break;

		default :
			// TODO: add default
	}
};

proto.show = function (fromState, lastUrl) {
	document.body.classList.add('is-darktheme');
	window.requestAnimationFrame(this.onShowed.bind(this));
};

module.exports = Labs;

},{"./BaseView":20}],25:[function(require,module,exports){
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

	if (document.body.classList.contains('is-panels', 'is-intro')) {
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

},{"../components/Breakpoints":3,"../components/ColorDictionary":4,"../components/ScrollEvents":7,"../components/loadPage":8,"../utils/createPageItem":13,"../utils/isMouseOut":14,"../utils/setColor":16,"../utils/transitionEndEvent":18,"../utils/waitAnimationFrames":19,"./BaseView":20,"./PanelsNav":26}],26:[function(require,module,exports){
'use strict';

var createPageItem = require('../utils/createPageItem');

function PanelsNav () {
	this.el = document.getElementById('panels-nav') || createPageItem('panels-nav', 'a', 'is-hidden');
}

var proto = PanelsNav.prototype;

proto.getLoading = function () {
	return this.loading;
};

proto.setLoading = function (loading) {
	this.loading = loading;
	if (this.loading) {
		this.el.classList.add('is-loading');
		this.show();
	}
	else {
		this.el.classList.remove('is-loading');
	}
};

proto.show = function () {
	this.el.classList.remove('is-hidden');
};

proto.hide = function () {
	this.el.classList.add('is-hidden');
};

proto.getPath = function () {
	return this.el.href;
};

proto.setPath = function (path) {
	this.el.href = path;
};

module.exports = PanelsNav;

},{"../utils/createPageItem":13}],27:[function(require,module,exports){
'use strict';

var createPageItem = require('../utils/createPageItem');
var loadPage = require('../components/loadPage');
var setColor = require('../utils/setColor');
var transitionEndEvent = require('../utils/transitionEndEvent')();
var waitAnimationFrames = require('../utils/waitAnimationFrames');

var BaseView = require('./BaseView');
var Breakpoints = require('../components/Breakpoints');
var ColorDictionary = require('../components/ColorDictionary');
var Comments = require('./Comments');

function Posts (options) {
	this.el = document.getElementById('post') || createPageItem('post', 'div', 'pagecontent-item', 'is-hidden');
	this.nextNav = document.querySelector('.post-nav-next');
	this.previousNav = document.querySelector('.post-nav-previous');
	this.closeNav = document.querySelector('.post-nav-close');

	this.loadSelectors = [
		'.post',
		'.post-nav-next',
		'.post-nav-previous'
	];

	this.onHideTransitionEnd = this.onHideTransitionEnd.bind(this);
	this.onSlideOffTransitionEnd = this.onSlideOffTransitionEnd.bind(this);
	this.onSlideOnTransitionEnd = this.onSlideOnTransitionEnd.bind(this);

	this.posts = {};
	this.comments = new Comments();

	this.on('onloaded', this.onPostLoaded.bind(this));
	this.on('onshowed', this.onShow.bind(this)); // maybe store and remove?

	if (document.body.classList.contains('is-post', 'is-intro')) {
		if (Breakpoints.contains('horizontal')) {
			this.listenToTransitionEnd(this.el, this.onIntroComplete.bind(this));
		}
		else {
			// currently stacked view has no intro
			waitAnimationFrames(this.onIntroComplete.bind(this), 2);
		}
		this.deeplinked();

		this.onPostLoaded({
			url: location.pathname,
			args: this.pages[location.pathname]
		});

		this.loadSiblingPosts();
	}
}

var proto = Posts.prototype = new BaseView();

proto.onPostLoaded = function(evt) {
	var url = evt.url;
	var post = evt.args[0][0];
	var navNext = evt.args[1][0];
	var navPrevious = evt.args[2][0];
	var currentPost = this.posts[url] = {
		post: post,
		html: post.innerHTML,
		color: post.dataset.color,
		next: navNext.classList.contains('is-hidden') ? false : navNext.pathname,
		previous: navPrevious.classList.contains('is-hidden') ? false : navPrevious.pathname
	};

	ColorDictionary.add(url, currentPost.color);

	if (url === this.nextNav.pathname) {
		setColor(this.nextNav, currentPost.color);
	}
	else if (url === this.previousNav.pathname) {
		setColor(this.previousNav, currentPost.color);
	}
};

proto.show = function(fromState, lastUrl) {
	window.scrollTo(0, 0);
	switch (fromState) {
		case 'panels' :
			this.showPost(location.pathname);
			break;

		default :
			// TODO: add default
	}
};

proto.hide = function (nextState) {
	switch (nextState) {
		case 'panels' :
			document.body.classList.add('is-transition-topanelsfrompost');
			this.hidePost();
			// this.on('onhidden', this.onHiddenToPanels);
			break;

		default :
			// TODO: add default
	}
};

proto.hidePost = function () {
	this.listenToTransitionEnd(this.el, this.onHidden);
	this.el.classList.add('is-hidden');
	this.nextNav.classList.add('is-hidden');
	this.previousNav.classList.add('is-hidden');
	this.closeNav.classList.add('is-hidden');
};

proto.update = function (url) {
	this.slide(url);
};


// maybe just put all this in update ??
proto.slide = function (url) {
	this.slideOff(url);

	if (this.posts[url]) {
		// post is already loaded
		setColor(document.body, this.posts[url].color);
		this.setNavHref(this.posts[url]);
	}
	else {
		// need to load post
		var callback = function (evt) {
			if (evt.url === url) {
				this.off('onloaded', callback);
				setColor(document.body, this.posts[url].color);
				this.setNavHref(this.posts[url]);
			}
		};
		this.on('onloaded', callback);
		this.load(url);
	}
};

proto.slideOff = function (url) {
	this.closeNav.classList.add('is-hidden');
	var slideDirection = (!this.nextNav.classList.contains('is-hidden') && url === this.nextNav.pathname) ? 'right' : 'left';
	document.body.classList.add('is-slideoff', 'is-slideoff-' + slideDirection);
	this.el.removeEventListener(transitionEndEvent, this.onSlideOnTransitionEnd);
	this.el.addEventListener(transitionEndEvent, this.onSlideOffTransitionEnd, false);
};

proto.slideOn = function () {
	this.el.innerHTML = this.posts[location.pathname].html;

	window.scrollTo(0, 0);

	var remove;
	if (document.body.classList.contains('is-slideoff-right')) {
		document.body.classList.remove('is-slideoff-right');
		document.body.classList.add('is-slideoff-left', 'is-notransitions');
		remove = 'is-slideoff-left';
	}
	else {
		document.body.classList.remove('is-slideoff-left');
		document.body.classList.add('is-slideoff-right', 'is-notransitions');
		remove = 'is-slideoff-right';
	}

	waitAnimationFrames(function () {
		document.body.classList.remove('is-slideoff', remove, 'is-notransitions');
		this.el.addEventListener(transitionEndEvent, this.onSlideOnTransitionEnd, false);
		this.comments.refresh();
	}.bind(this), 2);
};

proto.loadSiblingPosts = function () {
	var currentUrl = location.pathname;
	var nextUrl = this.nextNav.pathname;
	var previousUrl = this.previousNav.pathname;

	if (nextUrl !== currentUrl && !this.nextNav.classList.contains('is-hidden')) {
		if (this.hasPage(nextUrl)) {
			setColor(this.nextNav, this.posts[nextUrl].color);
		}
		else {
			this.load(nextUrl);
		}
	}

	if (previousUrl !== currentUrl && !this.previousNav.classList.contains('is-hidden')) {
		if (this.hasPage(previousUrl)) {
			setColor(this.previousNav, this.posts[previousUrl].color);
		}
		else {
			this.load(previousUrl);
		}
	}
};

proto.setNavHref = function (post) {
	if (post.next) {
		this.nextNav.href = post.next;
		this.nextNav.classList.remove('is-hidden');
	}
	else {
		this.nextNav.classList.add('is-hidden');
	}

	if (post.previous) {
		this.previousNav.href = post.previous;
		this.previousNav.classList.remove('is-hidden');
	}
	else {
		this.previousNav.classList.add('is-hidden');
	}

	this.loadSiblingPosts();
};

proto.showPost = function (url) {
	var currentPost = this.posts[url];
	this.el.innerHTML = currentPost.html;
	this.el.classList.remove('is-hidden');
	this.listenToTransitionEnd(this.el, this.onShowed);
	this.setNavHref(currentPost);

	if (document.body.dataset.color !== currentPost.color) {
		setColor(document.body, currentPost.color);
	}
};

proto.onShow = function () {
	this.closeNav.classList.remove('is-hidden');
};

proto.onHideTransitionEnd = function () {
	this.el.removeEventListener(transitionEndEvent, this.onHideTransitionEnd);
	this.watcher.complete();
};

proto.onSlideOffTransitionEnd = function () {
	this.el.removeEventListener(transitionEndEvent, this.onSlideOffTransitionEnd);
	if (this.posts[location.pathname]) {
		this.slideOn();
	}
	else {
		var callback = function (evt) {
			if (evt.url === location.pathname) {
				this.off('onloaded', callback);
				this.slideOn();
			}
		};
		this.on('onloaded', callback);
	}
};

proto.onSlideOnTransitionEnd = function () {
	this.el.removeEventListener(transitionEndEvent, this.onSlideOnTransitionEnd);
	this.closeNav.classList.remove('is-hidden');
};

proto.onIntroEnded = function (evt) {
	this.el.removeEventListener(transitionEndEvent, this.onIntroEnded);
	this.introWatcher.complete();
	this.comments.refresh();
};

module.exports = Posts;

},{"../components/Breakpoints":3,"../components/ColorDictionary":4,"../components/loadPage":8,"../utils/createPageItem":13,"../utils/setColor":16,"../utils/transitionEndEvent":18,"../utils/waitAnimationFrames":19,"./BaseView":20,"./Comments":21}]},{},[10]);
