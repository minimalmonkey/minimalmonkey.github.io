'use strict';

var loadPage = require('../components/loadPage');

function Posts (options) {
	this.loadSiblingPosts();
}

var proto = Posts.prototype;

proto.loadSiblingPosts = function () {
	var nextNav = document.querySelector('.post-nav-next');
	if (nextNav && !nextNav.classList.contains('is-hidden')) {
		loadPage(nextNav.href, function (pagecontent) {
			this.onSiblingPostLoaded(pagecontent, nextNav);
		}.bind(this), '.pagecontent');
	}

	var previousNav = document.querySelector('.post-nav-previous');
	if (previousNav && !previousNav.classList.contains('is-hidden')) {
		loadPage(previousNav.href, function (pagecontent) {
			this.onSiblingPostLoaded(pagecontent, previousNav);
		}.bind(this), '.pagecontent');
	}
};

proto.onSiblingPostLoaded = function (pagecontent, nav) {
	nav.classList.add('color-' + pagecontent[0].dataset.color);
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
