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

	this.onSlideOffTransitionEnd = this.onSlideOffTransitionEnd.bind(this);
	this.onSlideOnTransitionEnd = this.onSlideOnTransitionEnd.bind(this);

	this.posts = {};
	this.comments = new Comments();

	this.on('onloaded', this.onPostLoaded.bind(this));
	this.on('onshowed', this.onShow.bind(this)); // maybe store and remove?

	if (document.body.classList.contains('is-post')) {
		if (Breakpoints.contains('horizontal')) {
			this.listenToTransitionEnd(this.el, this.onIntroComplete.bind(this));
		}
		else {
			// currently stacked view has no intro
			waitAnimationFrames(this.onIntroComplete.bind(this), 2);
		}
		this.deeplinked();
		this.comments.refresh();

		this.onPostLoaded({
			url: location.pathname,
			args: this.pages[location.pathname]
		});

		this.loadSiblingPosts();
	}
}

var proto = Posts.prototype = new BaseView();

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

proto.slide = function (url) {
	// maybe just put all this in update ??
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

proto.onShow = function () {
	this.closeNav.classList.remove('is-hidden');
	this.comments.refresh();
};

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

module.exports = Posts;
