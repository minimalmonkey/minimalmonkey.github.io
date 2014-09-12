'use strict';

var setColor = require('./utils/setColor');

var Router = require('./components/Router');
var Header = require('./views/Header');
var Panels = require('./views/Panels');
var Posts = require('./views/Posts');
var Lab = require('./views/Lab');

function App (analytics) {

	this.showHeader = this.showHeader.bind(this);
	this.showPanels = this.showPanels.bind(this);
	this.showPost = this.showPost.bind(this);
	this.showLab = this.showLab.bind(this);

	this.onPanelShowComplete = this.onPanelShowComplete.bind(this);
	this.onPanelHideComplete = this.onPanelHideComplete.bind(this);
	this.onPostShowComplete = this.onPostShowComplete.bind(this);
	this.onPostHideComplete = this.onPostHideComplete.bind(this);

	this.initViews();
	this.initRouter(analytics);

	window.requestAnimationFrame(function () {
		document.body.classList.add('is-introtransition');
		document.body.classList.remove('is-intro');
	});
}

var proto = App.prototype;

proto.initViews = function () {
	this.header = new Header();
	this.panels = new Panels();
	this.posts = new Posts();
	this.lab = new Lab();
};

proto.initRouter = function (analytics) {
	this.router = new Router(analytics, [
		this.panels.el
	]);

	var headerLinks = this.header.getPageLinks();
	var i = headerLinks.length;
	while (i--) {
		this.router.add(headerLinks[i], this.showHeader);
	}
	this.router.add('/', this.showPanels);
	this.router.add('/lab/', this.showLab);
	this.router.add('*post', this.showPost);

	this.router.match(location.pathname);

	if (this.view && this.view.introWatcher) {
		this.onIntroComplete = this.onIntroComplete.bind(this);
		this.view.introWatcher.on('complete', this.onIntroComplete);
	}
	else {
		this.onIntroComplete();
	}
};

proto.showHeader = function (match, params) {
	this.header.open(match, this.state !== 'header' ? this.router.lastURL : false);
	this.view = this.header;
	this.setState('header');
};

proto.showPanels = function (match, params) {
	if (this.state === 'panels') {
		// already panels
	}
	else if (this.state === 'post') {
		this.panels.preload();
		document.body.classList.add('is-muted', 'is-transition-topanelsfrompost');
		this.watcher = this.posts.hide();
		this.watcher.on('complete', this.onPostHideComplete);
	}
	else if (this.state === 'lab') {
		console.log('show panels from lab!');
		document.body.classList.add('is-muted', 'is-transition-panelsbelow');
		document.body.classList.remove('is-darktheme');
		this.watcher = this.panels.transitionFromBelow();
		this.watcher.on('complete', this.onPanelShowComplete);
	}
	else if (this.state === 'header') {
		this.header.close();
	}
	this.view = this.panels;
	this.setState('panels');
};

proto.showPost = function (match, params) {
	if (this.state === 'panels') {
		// preload post while animating
		var color = this.panels.getCurrentColor(params);
		document.body.classList.add('is-muted', 'is-transition-topostfrompanels');
		setColor(document.body, color);
		this.watcher = this.panels.transitionToPost();
		this.watcher.on('complete', this.onPanelHideComplete);
	}
	else if (this.state === 'post') {
		this.posts.slide(location.pathname);
	}
	else if (this.state === 'header') {
		this.header.close();
	}
	this.view = this.posts;
	this.setState('post');
};

proto.showLab = function (match, params) {
	if (this.state === 'panels') {
		document.body.classList.add('is-muted', 'is-transition-panelsbelow', 'is-darktheme');
		this.panels.hideBelow();
		this.watcher = this.panels.transitionBelow();
		this.watcher.on('complete', this.onPanelHideComplete);
	}
	else if (this.state === 'header') {
		this.header.close();
	}
	this.view = this.lab;
	this.setState('lab');
};

proto.setState = function (state) {
	if (this.state) {
		document.body.classList.remove('is-' + this.state);
	}
	this.state = state;
	document.body.classList.add('is-' + this.state);
};

proto.onIntroComplete = function () {
	if (this.view.introWatcher) {
		this.view.introWatcher.clear();
	}
	document.body.classList.remove('is-introtransition');
};

proto.onPanelShowComplete = function () {
	this.watcher.off('complete', this.onPanelShowComplete);
	document.body.classList.remove('is-muted', 'is-transition-topanelsfrompost', 'is-transition-panelsbelow'); // TODO: be more specific
};

proto.onPanelHideComplete = function () {
	this.watcher.off('complete', this.onPanelHideComplete);
	this.panels.hide();

	if (this.state === 'post') {
		this.panels.resetTransition();
		this.watcher = this.posts.show(location.pathname);
		this.watcher.on('complete', this.onPostShowComplete);
	}
	else if (this.state === 'lab') {
		document.body.classList.remove('is-muted', 'is-transition-panelsbelow');
	}
};

proto.onPostShowComplete = function () {
	this.watcher.off('complete', this.onPostShowComplete);
	document.body.classList.remove('is-muted', 'is-transition-topostfrompanels');
};

proto.onPostHideComplete = function () {
	this.watcher.off('complete', this.onPostHideComplete);

	if (this.state === 'panels') {
		this.watcher = this.panels.transitionFromPost(this.router.lastURL);
		this.watcher.on('complete', this.onPanelShowComplete);
	}
};

module.exports = App;
