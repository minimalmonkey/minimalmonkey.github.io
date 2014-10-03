'use strict';

var createPageItem = require('../utils/createPageItem');
var loadPage = require('../components/loadPage');
var setColor = require('../utils/setColor');
var transitionEndEvent = require('../utils/transitionEndEvent')();
var waitAnimationFrames = require('../utils/waitAnimationFrames');

var BaseView = require('./BaseView');
var Comments = require('./Comments');
var TransitionWatcher = require('../components/TransitionWatcher');

function Posts (options) {
	// this.stateName = 'post';
	this.el = document.getElementById('post') || createPageItem('post', 'div', 'pagecontent-item', 'is-hidden');
	this.nextNav = document.querySelector('.post-nav-next');
	this.previousNav = document.querySelector('.post-nav-previous');
	this.closeNav = document.querySelector('.post-nav-close');

	this.loadSelectors = [
		'.post',
		'.post-nav-next',
		'.post-nav-previous'
	];

	// this.onPostLoaded = this.onPostLoaded.bind(this);
	// this.onShowTransitionEnd = this.onShowTransitionEnd.bind(this);
	this.onHideTransitionEnd = this.onHideTransitionEnd.bind(this);
	this.onSlideOffTransitionEnd = this.onSlideOffTransitionEnd.bind(this);
	this.onSlideOnTransitionEnd = this.onSlideOnTransitionEnd.bind(this);

	this.posts = {};
	this.comments = new Comments();

	this.on('onloaded', this.onPostLoaded.bind(this));

	this.on('onshowed', this.onShow.bind(this)); // maybe store and remove?

	// this.loadSiblingPosts(); why is this here??

	if (document.body.classList.contains('is-post', 'is-intro')) {
		this.introWatcher = new TransitionWatcher();
		this.onIntroEnded = this.onIntroEnded.bind(this);
		this.el.addEventListener(transitionEndEvent, this.onIntroEnded, false);
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

	if (url === this.nextNav.pathname) {
		setColor(this.nextNav, currentPost.color);
	}
	else if (url === this.previousNav.pathname) {
		setColor(this.previousNav, currentPost.color);
	}
};

proto.show = function(fromState) {
	switch (fromState) {
		case 'panels' :
			console.log('show post, transition from panels');
			this.showPost(location.pathname);
			break;
	}
};

// proto.show = function(url) {
// 	this.showNext = url;
// 	this.loadPost(url);
// 	this.watcher = new TransitionWatcher();
// 	return this.watcher;
// };

proto.hide = function (url) {
	this.watcher = new TransitionWatcher();
	this.el.addEventListener(transitionEndEvent, this.onHideTransitionEnd, false);
	this.el.classList.add('is-hidden');
	this.nextNav.classList.add('is-hidden');
	this.previousNav.classList.add('is-hidden');
	this.closeNav.classList.add('is-hidden');
	return this.watcher;
};

proto.slide = function (url) {
	console.log('slide!!!', url);
	// this.showNext = url;
	// this.loadPost(url);
};

// proto.loadPost = function (url) {
// 	loadPage(url, this.onPostLoaded, '.post', '.post-nav-next', '.post-nav-previous');
// };

proto.loadSiblingPosts = function () {
	if (this.nextNav.pathname !== location.pathname) {
		this.load(this.nextNav.pathname);
	}

	if (this.previousNav.pathname !== location.pathname) {
		this.load(this.previousNav.pathname);
	}
};

proto.setNavHref = function (post) {
	if (post.next) {
		this.nextNav.href = post.next;
		this.nextNav.classList.remove('is-hidden');
		this.load(post.next);
	}
	else {
		this.nextNav.classList.add('is-hidden');
	}

	if (post.previous) {
		this.previousNav.href = post.previous;
		this.previousNav.classList.remove('is-hidden');
		this.load(post.previous);
	}
	else {
		this.previousNav.classList.add('is-hidden');
	}
};

proto.showPost = function (url) {

	// console.log('here!', this.posts[url]);

	var currentPost = this.posts[url];

	// var post = this.pages[url][0][0];
	// var next = this.pages[url][1][0];
	// var previous = this.pages[url][2][0];

	// var currentPost = this.posts[url] = {
	// 	post: post,
	// 	html: post.innerHTML,
	// 	color: post.dataset.color,
	// 	next: navNext.classList.contains('is-hidden') ? false : navNext.pathname,
	// 	previous: navPrevious.classList.contains('is-hidden') ? false : navPrevious.pathname
	// };

	// if (this.showNext) {
	// 	this.showNext = undefined;

	if (this.el.classList.contains('is-hidden')) {
		this.el.innerHTML = currentPost.html;
		this.el.classList.remove('is-hidden');
		this.listenToTransitionEnd(this.el, this.onShowed);
		// this.el.addEventListener(transitionEndEvent, this.onShowTransitionEnd, false);
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

	// }
	// else if (url === this.nextNav.pathname) {
	// 	setColor(this.nextNav, currentPost.color);
	// }
	// else if (url === this.previousNav.pathname) {
	// 	setColor(this.previousNav, currentPost.color);
	// }
};

// proto.onPostLoaded = function (post, next, previous, url) {

// 	var currentPost = this.posts[url] = {
// 		post: post[0],
// 		html: post[0].innerHTML,
// 		color: post[0].dataset.color,
// 		next: next[0].classList.contains('is-hidden') ? false : next[0].pathname,
// 		previous: previous[0].classList.contains('is-hidden') ? false : previous[0].pathname
// 	};

// 	if (this.showNext) {
// 		this.showNext = undefined;

// 		if (this.el.classList.contains('is-hidden')) {
// 			this.el.innerHTML = currentPost.html;
// 			this.el.classList.remove('is-hidden');
// 			this.el.addEventListener(transitionEndEvent, this.onShowTransitionEnd, false);
// 		}
// 		else {
// 			// navigating to another post
// 			setColor(document.body, currentPost.color);
// 			this.closeNav.classList.add('is-hidden');
// 			var slideDirection = (!this.nextNav.classList.contains('is-hidden') && url === this.nextNav.pathname) ? 'right' : 'left';
// 			document.body.classList.add('is-slideoff', 'is-slideoff-' + slideDirection);
// 			this.el.removeEventListener(transitionEndEvent, this.onSlideOnTransitionEnd);
// 			this.el.addEventListener(transitionEndEvent, this.onSlideOffTransitionEnd, false);
// 		}

// 		this.setNavHref(currentPost);
// 	}
// 	else if (url === this.nextNav.pathname) {
// 		setColor(this.nextNav, currentPost.color);
// 	}
// 	else if (url === this.previousNav.pathname) {
// 		setColor(this.previousNav, currentPost.color);
// 	}
// };

// proto.onShowTransitionEnd = function () {
// 	this.el.removeEventListener(transitionEndEvent, this.onShowTransitionEnd);
// 	this.closeNav.classList.remove('is-hidden');
// 	this.watcher.complete();
// };

proto.onShow = function () {
	this.closeNav.classList.remove('is-hidden');
};

proto.onHideTransitionEnd = function () {
	this.el.removeEventListener(transitionEndEvent, this.onHideTransitionEnd);
	this.watcher.complete();
};

proto.onSlideOffTransitionEnd = function () {
	this.el.removeEventListener(transitionEndEvent, this.onSlideOffTransitionEnd);
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

proto.onSlideOnTransitionEnd = function () {
	this.el.removeEventListener(transitionEndEvent, this.onSlideOnTransitionEnd);
	this.closeNav.classList.remove('is-hidden');
};

proto.onIntroEnded = function (evt) {
	this.el.removeEventListener(transitionEndEvent, this.onIntroEnded);
	this.introWatcher.complete();
	this.comments.refresh();
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
