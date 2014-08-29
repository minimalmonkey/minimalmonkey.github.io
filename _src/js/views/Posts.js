'use strict';

var loadPage = require('../components/loadPage');
var setColor = require('../utils/setColor');
var transitionEndEvent = require('../utils/transitionEndEvent')();
var waitAnimationFrames = require('../utils/waitAnimationFrames');

var TransitionWatcher = require('../components/TransitionWatcher');

function Posts (options) {
	this.el = document.getElementById('post') || this.create();
	this.nextNav = document.querySelector('.post-nav-next');
	this.previousNav = document.querySelector('.post-nav-previous');
	this.closeNav = document.querySelector('.post-nav-close');

	this.onPostLoaded = this.onPostLoaded.bind(this);
	this.onShowTransitionEnd = this.onShowTransitionEnd.bind(this);
	this.onHideTransitionEnd = this.onHideTransitionEnd.bind(this);
	this.onSlideOffTransitionEnd = this.onSlideOffTransitionEnd.bind(this);
	this.onSlideOnTransitionEnd = this.onSlideOnTransitionEnd.bind(this);

	this.posts = {};

	this.loadSiblingPosts();

	if (document.body.classList.contains('is-post', 'is-intro')) {
		this.introWatcher = new TransitionWatcher();
		this.onIntroEnded = this.onIntroEnded.bind(this);
		this.el.addEventListener(transitionEndEvent, this.onIntroEnded, false);
	}
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

proto.hide = function(url) {
	this.watcher = new TransitionWatcher();
	this.el.addEventListener(transitionEndEvent, this.onHideTransitionEnd, false);
	this.el.classList.add('is-hidden');
	this.nextNav.classList.add('is-hidden');
	this.previousNav.classList.add('is-hidden');
	this.closeNav.classList.add('is-hidden');
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
			this.el.addEventListener(transitionEndEvent, this.onShowTransitionEnd, false);
		}
		else {
			// navigating to another post
			setColor(document.body, currentPost.color);
			this.closeNav.classList.add('is-hidden');
			var slideDirection = (!this.nextNav.classList.contains('is-hidden') && url === this.nextNav.pathname) ? 'right' : 'left';
			document.body.classList.add('is-slideoff', 'is-slideoff-' + slideDirection);
			this.el.removeEventListener(transitionEndEvent, this.onSlideOnTransitionEnd);
			this.el.addEventListener(transitionEndEvent, this.onSlideOffTransitionEnd, false);
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

proto.onShowTransitionEnd = function () {
	this.el.removeEventListener(transitionEndEvent, this.onShowTransitionEnd);
	this.closeNav.classList.remove('is-hidden');
	this.watcher.complete();
};

proto.onHideTransitionEnd = function () {
	this.el.removeEventListener(transitionEndEvent, this.onHideTransitionEnd);
	this.watcher.complete();
};

proto.onSlideOffTransitionEnd = function () {
	this.el.removeEventListener(transitionEndEvent, this.onSlideOffTransitionEnd);
	this.el.innerHTML = this.posts[location.pathname].html;

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
	}.bind(this), 2);
};

proto.onSlideOnTransitionEnd = function () {
	this.el.removeEventListener(transitionEndEvent, this.onSlideOnTransitionEnd);
	this.closeNav.classList.remove('is-hidden');
};

proto.onIntroEnded = function (evt) {
	this.el.removeEventListener(transitionEndEvent, this.onIntroEnded);
	this.introWatcher.complete();
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
