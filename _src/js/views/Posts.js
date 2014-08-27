'use strict';

var loadPage = require('../components/loadPage');
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
		this.el.innerHTML = currentPost.html;

		if (this.el.classList.contains('is-hidden')) {
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
		}

		if (currentPost.next) {
			this.nextNav.href = currentPost.next;
			this.nextNav.classList.remove('is-hidden');
		}
		if (currentPost.previous) {
			this.previousNav.href = currentPost.previous;
			this.previousNav.classList.remove('is-hidden');
		}
		this.loadSiblingPosts();
	}
	else if (url === this.nextNav.pathname) {
		this.nextNav.classList.add('color-' + currentPost.color);
	}
	else if (url === this.previousNav.pathname) {
		this.previousNav.classList.add('color-' + currentPost.color);
	}
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
