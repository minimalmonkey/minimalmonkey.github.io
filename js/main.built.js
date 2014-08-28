/* BUILT FILE DO NOT EDIT */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var setColor = require('./utils/setColor');

var Router = require('./components/Router');
var Header = require('./views/Header');
var Panels = require('./views/Panels');
var Posts = require('./views/Posts');

function App () {

	this.showHeader = this.showHeader.bind(this);
	this.showHome = this.showHome.bind(this);
	this.showPost = this.showPost.bind(this);
	this.onPanelToPostComplete = this.onPanelToPostComplete.bind(this);
	this.onPostShowComplete = this.onPostShowComplete.bind(this);

	this.initViews();
	this.initRouter();

	window.requestAnimationFrame(function () {
		document.body.classList.remove('is-intro');
	});
}

var proto = App.prototype;

proto.initViews = function () {
	this.header = new Header();
	this.panels = new Panels();
	this.posts = new Posts();
};

proto.initRouter = function () {
	this.router = new Router();

	var headerLinks = this.header.getPageLinks();
	var i = headerLinks.length;
	while (i--) {
		this.router.add(headerLinks[i], this.showHeader);
	}
	this.router.add('/', this.showHome);
	this.router.add('*post', this.showPost);

	this.router.match(location.pathname);
};

proto.showHeader = function (match, params) {
	this.header.open(match, this.state !== 'header' ? this.router.lastURL : false);
	this.state = 'header';
};

proto.showHome = function (match, params) {
	if (this.state === 'panels') {
		console.log('already here...');
	}
	else if (this.state === 'post') {
		console.log('from post transition');
	}
	else if (this.state === 'header') {
		this.header.close();
	}
	this.state = 'panels';
};

proto.showPost = function (match, params) {
	if (this.state === 'panels') {
		this.panels.disable();
		var color = this.panels.getCurrentColor(params);
		document.body.classList.add('is-muted', 'is-transition-topost');
		setColor(document.body, color);
		this.watcher = this.panels.transitionToPost();
		this.watcher.on('complete', this.onPanelToPostComplete);
	}
	else if (this.state === 'post') {
		this.posts.slide(location.pathname);
	}
	else if (this.state === 'header') {
		this.header.close();
	}
	this.state = 'post';
};

proto.onPanelToPostComplete = function () {
	this.watcher.off('complete', this.onPanelToPostComplete);
	this.panels.hide();
	this.watcher = this.posts.show(location.pathname);
	this.watcher.on('complete', this.onPostShowComplete);
};

proto.onPostShowComplete = function () {
	this.watcher = undefined;
	document.body.classList.remove('is-muted', 'is-transition-topost');
};

module.exports = App;

},{"./components/Router":2,"./utils/setColor":11,"./views/Header":14,"./views/Panels":15,"./views/Posts":16}],2:[function(require,module,exports){
'use strict';

var addEventListenerList = require('../utils/addEventListenerList');
var routeToRegExp = require('./routeToRegExp');

function Router () {
	this.lastURL = this.currentURL = location.pathname;

	this.onClicked = this.onClicked.bind(this);
	addEventListenerList(document.querySelectorAll('[data-router]'), 'click', this.onClicked);

	window.addEventListener('popstate', function(evt) {
		this.navigate(location.pathname, true);
	}.bind(this));

	this.routes = {};
}

var proto = Router.prototype;

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

proto.add = function (route, callback) {

	route = routeToRegExp(route);

	if (this.routes[route]) {
		if (this.routes[route].indexOf(callback) < 0) {
			this.routes[route].push(callback);
		}
	}
	else {
		this.routes[route] = [route, callback];
	}
};

proto.remove = function (route, callback) {
	//
};

proto.match = function (route) {
	var exec;
	for (var key in this.routes) {
		exec = this.routes[key][0].exec(route);
		if (exec && exec.length) {
			var i = this.routes[key].length;
			while (--i > 0) {
				this.routes[key][i].apply(this, exec.splice(0, 2));
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

},{"../utils/addEventListenerList":9,"./routeToRegExp":6}],3:[function(require,module,exports){
'use strict';

var throttleEvent = require('../utils/throttleEvent');

function ScrollEvents (el) {
	this.onScrolled = this.onScrolled.bind(this);
	this.onResized = this.onResized.bind(this);
	this.update(el);
	this.enable();
	this.points = [];
}

var proto = ScrollEvents.prototype;

proto.scrollToPoint = function (index) {
	if (this.points[index]) {
		var tx = this.points[index];
		var animateScroll = function () {
			var px = window.pageXOffset;
			var lx = window.pageXOffset;
			var vx = (tx - px) * 0.175;
			px += vx;
			window.scrollTo(px, window.pageYOffset);
			if (~~px != lx) {
				window.requestAnimationFrame(animateScroll);
			}
		};
		animateScroll();
	}
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
	this.throttledScroll = throttleEvent(this.onScrolled, 50);
	window.addEventListener('scroll', this.throttledScroll, false);

	this.throttledResize = throttleEvent(this.onResized, 50);
	window.addEventListener('resize', this.throttledResize, false);
	this.onResized();
};

proto.disable = function () {
	window.removeEventListener('scroll', this.throttledScroll);
	window.removeEventListener('resize', this.throttledResize);
};

module.exports = ScrollEvents;

},{"../utils/throttleEvent":12}],4:[function(require,module,exports){
'use strict';

function TransitionWatcher () {
	this.listeners = [];
}

var proto = TransitionWatcher.prototype;

proto.complete = function () {
	this.trigger('complete');
};

proto.trigger = function (evt) {
	if (this.listeners[evt] && this.listeners[evt].length) {
		var i = this.listeners[evt].length;
		while (i--) {
			this.listeners[evt][i].call();
		}
	}
};

proto.on = function (evt, callback) {
	if (this.listeners[evt]) {
		this.listeners[evt].push(callback);
	}
	else {
		this.listeners[evt] = [callback];
	}
};

proto.off = function (evt, callback) {
	if (this.listeners[evt] && this.listeners[evt].length) {
		var i = this.listeners[evt].indexOf(callback);
		if (i > -1) {
			this.listeners[evt].splice(i, 1);
		}
	}
};

proto.clear = function () {
	this.listeners = [];
};

module.exports = TransitionWatcher;

},{}],5:[function(require,module,exports){
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

				callback.apply(this, elements.length ? elements.concat(url) : [this.responseText, url]);
			}
		}
	};

	req.open('get', url, true);
	req.send();
};

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict';

// app
if (document.documentElement.classList) {
	var App = require('./App');
	new App();
}

// external
var loadScript = require('./external/loadScript');
// loadScript('twitter-wjs', '//platform.twitter.com/widgets.js', 2000);

},{"./App":1,"./external/loadScript":7}],9:[function(require,module,exports){
'use strict';

module.exports = function addEventListenerList (list, type, listener, useCapture) {
	var i = list.length;
	while (i--) {
		list[i].addEventListener(type, listener, useCapture);
	}
};

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function setColor (element, color) {
	if (element.dataset.color) {
		element.classList.remove('color-' + element.dataset.color);
	}
	element.dataset.color = color;
	element.classList.add('color-' + color);
};

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
'use strict';

function Header () {
	this.el = document.getElementById('siteheader');
	this.pageContent = document.getElementById('pagecontent');
	this.closeButton = document.getElementById('siteheader-close');

	this.pages = {};
	var pages = document.querySelectorAll('.siteheader-page');
	var url;
	var i = pages.length;
	while (i--) {
		url = pages[i].id.split('-')[0];
		this.pages['/' + url + '/'] = {
			nav: document.querySelector('.sitenav a[href*="' + url + '"]'),
			page: pages[i]
		};
	}
}

var proto = Header.prototype;

proto.open = function (key, lastURL) {
	this.el.classList.remove('is-collapsed');
	this.pageContent.classList.add('is-disabled');
	this.hideCurrent();
	this.pages[key].nav.classList.add('is-selected');
	this.pages[key].page.classList.add('is-visible');

	if (lastURL) {
		this.closeButton.href = lastURL;
	}
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

},{}],15:[function(require,module,exports){
'use strict';

var isMouseOut = require('../utils/isMouseOut');
var loadPage = require('../components/loadPage');
var transitionEndEvent = require('../utils/transitionEndEvent')();

var PanelsNav = require('./components/PanelsNav');
var ScrollEvents = require('../components/ScrollEvents');
var TransitionWatcher = require('../components/TransitionWatcher');

function Panels () {
	this.el = document.getElementById('panels');
	this.nav = new PanelsNav();
	this.panels = document.querySelectorAll('#panels .panel');
	this.panels = Array.prototype.slice.call(this.panels);
	this.panelsUrlMap = {};
	this.totalPanels = this.panels.length;
	this.currentIndex = -1;

	this.onMouseOver = this.onMouseOver.bind(this);
	this.onMouseOut = this.onMouseOut.bind(this);
	this.onScrolledToEnd = this.onScrolledToEnd.bind(this);
	this.onScrolledToPoint = this.onScrolledToPoint.bind(this);
	this.onPanelsLoaded = this.onPanelsLoaded.bind(this);
	this.onNavClicked = this.onNavClicked.bind(this);

	if (document.body.classList.contains('is-panels', 'is-intro')) {
		this.onIntroEnded = this.onIntroEnded.bind(this);
		this.panels[this.totalPanels - 1].addEventListener(transitionEndEvent, this.onIntroEnded, false);
	}
	else {
		this.enable();
	}
}

var proto = Panels.prototype;

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
	this.el.addEventListener('mouseout', this.onMouseOut, false);
	this.el.classList.add('is-hovered');
};

proto.onMouseOut = function (evt) {
	if (isMouseOut(evt)) {
		this.el.removeEventListener('mouseout', this.onMouseOut);
		this.el.addEventListener('mouseover', this.onMouseOver, false);
		this.el.classList.remove('is-hovered');

		if (this.currentIndex > -1) {
			this.removeExpandClass();
			this.currentIndex = -1;
		}
	}
};

proto.onPanelsLoaded = function (panels, nav) {

	this.nav.setLoading(false);
	this.panels = this.panels.concat(Array.prototype.slice.call(panels));
	var index = this.totalPanels;
	this.totalPanels = this.panels.length;
	this.addPanels(index, true);

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
	loadPage(this.nav.getPath(), this.onPanelsLoaded, '#panels .panel', '#panels-nav');
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

proto.transitionToPost = function () {
	var listenTo;
	var panelWidth = this.panels[0].offsetWidth;
	var panelExpandWidth = 25; // actually half the expand width - maybe make this dynamic?
	var winWidth = window.innerWidth;
	var scrollLeft = window.pageXOffset;
	var slideAmount = winWidth - ((this.panels[this.currentIndex].offsetLeft - scrollLeft) + panelWidth + panelExpandWidth);
	var style = '-webkit-transform: translateX(' + slideAmount + 'px); transform: translateX(' + slideAmount + 'px)';
	var i = this.currentIndex;

	while (++i && i < this.totalPanels) {
		if (this.panels[i].offsetLeft - scrollLeft < winWidth) {
			this.panels[i].style.cssText = style;
			if (listenTo === undefined) {
				listenTo = this.panels[i];
			}
		}
		else {
			i = Infinity;
		}
	}

	slideAmount = this.panels[this.currentIndex].offsetLeft - scrollLeft - panelExpandWidth;
	style = '-webkit-transform: translateX(-' + slideAmount + 'px); transform: translateX(-' + slideAmount + 'px)';
	scrollLeft -= panelWidth;
	i = this.currentIndex;

	while (i--) {
		if (this.panels[i].offsetLeft - scrollLeft) {
			this.panels[i].style.cssText = style;
			if (listenTo === undefined) {
				listenTo = this.panels[i];
			}
		}
		else {
			i = -1;
		}
	}

	var watcher = new TransitionWatcher();
	var onTransitionEnded = function (evt) {
		listenTo.removeEventListener(transitionEndEvent, onTransitionEnded);
		watcher.complete();
	};
	listenTo.addEventListener(transitionEndEvent, onTransitionEnded, false);
	return watcher;
};

proto.enable = function () {
	if (this.el) {
		this.el.addEventListener('mouseover', this.onMouseOver, false);
		this.el.addEventListener('reachedend', this.onScrolledToEnd, false);
		this.addPanels();
		if (this.nav.hasEl() && this.scrollEvents === undefined) {
			this.scrollEvents = new ScrollEvents(this.el);
		}
	}
};

proto.disable = function () {
	if (this.el) {
		this.el.removeEventListener('mouseover', this.onMouseOver);
		this.el.removeEventListener('mouseout', this.onMouseOut);
	}
};

proto.hide = function () {
	this.el.classList.add('is-hidden');
};

module.exports = Panels;

},{"../components/ScrollEvents":3,"../components/TransitionWatcher":4,"../components/loadPage":5,"../utils/isMouseOut":10,"../utils/transitionEndEvent":13,"./components/PanelsNav":17}],16:[function(require,module,exports){
'use strict';

var loadPage = require('../components/loadPage');
var setColor = require('../utils/setColor');
var transitionEndEvent = require('../utils/transitionEndEvent')();

var TransitionWatcher = require('../components/TransitionWatcher');

function Posts (options) {
	this.el = document.getElementById('post') || this.create();
	this.nextNav = document.querySelector('.post-nav-next');
	this.previousNav = document.querySelector('.post-nav-previous');
	this.closeNav = document.querySelector('.post-nav-close');

	this.onPostLoaded = this.onPostLoaded.bind(this);

	this.posts = {};

	this.loadSiblingPosts();
}

var proto = Posts.prototype;

proto.create = function() {
	var el = document.createElement('div');
	el.id = 'post';
	el.classList.add('post', 'pagecontent-item', 'is-hidden');
	document.getElementById('pagecontent').appendChild(el);
	return el;
};

proto.preload = function(url) {
	//
};

proto.show = function(url) {
	this.watcher = new TransitionWatcher();
	this.showNext = url;
	this.loadPost(url);
	return this.watcher;
};

proto.slide = function(url) {
	this.showNext = url;
	this.loadPost(url);
};

proto.loadPost = function (url) {
	loadPage(url, this.onPostLoaded, '.post', '.post-nav-next', '.post-nav-previous');
};

proto.loadSiblingPosts = function () {
	if (this.nextNav.pathname !== location.pathname) {
		this.loadPost(this.nextNav.pathname);
	}

	if (this.previousNav.pathname !== location.pathname) {
		this.loadPost(this.previousNav.pathname);
	}
};

proto.onPostLoaded = function (post, next, previous, url) {

	var currentPost = this.posts[url] = {
		post: post[0],
		html: post[0].innerHTML,
		color: post[0].dataset.color,
		next: next[0].classList.contains('is-hidden') ? false : next[0].pathname,
		previous: previous[0].classList.contains('is-hidden') ? false : previous[0].pathname
	};

	if (this.showNext) {
		this.showNext = undefined;

		if (this.el.classList.contains('is-hidden')) {
			this.el.innerHTML = currentPost.html;
			this.el.classList.remove('is-hidden');
			var onTransitionEnded = function (evt) {
				this.closeNav.classList.remove('is-hidden');
				this.el.removeEventListener(transitionEndEvent, onTransitionEnded);
				this.watcher.complete();
			}.bind(this);
			this.el.addEventListener(transitionEndEvent, onTransitionEnded, false);
		}
		else {
			// navigating to another post
			setColor(document.body, currentPost.color);
			console.log(url, this.nextNav.pathname);
			var slideDirection = (!this.nextNav.classList.contains('is-hidden') && url === this.nextNav.pathname) ? 'right' : 'left';
			document.body.classList.add('is-slideoff', 'is-slideoff-' + slideDirection, 'is-muted');
		}

		this.setNavHref(currentPost);
	}
	else if (url === this.nextNav.pathname) {
		setColor(this.nextNav, currentPost.color);
	}
	else if (url === this.previousNav.pathname) {
		setColor(this.previousNav, currentPost.color);
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

proto.enable = function () {
	if (this.el) {
		//
	}
};

proto.disable = function () {
	//
};

module.exports = Posts;

},{"../components/TransitionWatcher":4,"../components/loadPage":5,"../utils/setColor":11,"../utils/transitionEndEvent":13}],17:[function(require,module,exports){
'use strict';

function PanelsNav () {
	this.el = document.getElementById('panels-nav');
}

var proto = PanelsNav.prototype;

proto.hasEl = function () {
	return this.el !== null;
};

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

},{}]},{},[8]);
