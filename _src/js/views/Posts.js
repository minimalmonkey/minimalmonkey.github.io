'use strict';

var loadPage = require('../components/loadPage');

function Posts (options) {
	this.loadSiblingPosts();
}

var proto = Posts.prototype;

proto.loadSiblingPosts = function () {
	var nextNav = document.querySelector('.post-nav-next');
	if (nextNav && !nextNav.classList.contains('is-hidden')) {
		loadPage(nextNav.href, function (post, next, previous) {
			this.onSiblingPostLoaded({
				post: post[0],
				next: next[0],
				previous: previous[0]
			}, nextNav);
		}.bind(this), '.post', '.post-nav-next', '.post-nav-previous');
	}

	var previousNav = document.querySelector('.post-nav-previous');
	if (previousNav && !previousNav.classList.contains('is-hidden')) {
		loadPage(previousNav.href, function (post, next, previous) {
			this.onSiblingPostLoaded({
				post: post[0],
				next: next[0],
				previous: previous[0]
			}, previousNav);
		}.bind(this), '.post', '.post-nav-next', '.post-nav-previous');
	}
};

proto.onSiblingPostLoaded = function (elements, nav) {
	if (elements.post && elements.post.dataset) {
		nav.classList.add('color-' + elements.post.dataset.color);
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
