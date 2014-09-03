'use strict';

var setColor = require('./utils/setColor');

var Router = require('./components/Router');
var Header = require('./views/Header');
var Panels = require('./views/Panels');
var Posts = require('./views/Posts');

function App () {

	this.showHeader = this.showHeader.bind(this);
	this.showPanels = this.showPanels.bind(this);
	this.showPost = this.showPost.bind(this);
	this.onPanelShowComplete = this.onPanelShowComplete.bind(this);
	this.onPanelHideComplete = this.onPanelHideComplete.bind(this);
	this.onPostShowComplete = this.onPostShowComplete.bind(this);
	this.onPostHideComplete = this.onPostHideComplete.bind(this);

	this.initViews();
	this.initRouter();

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
};

proto.initRouter = function () {
	this.router = new Router();

	var headerLinks = this.header.getPageLinks();
	var i = headerLinks.length;
	while (i--) {
		this.router.add(headerLinks[i], this.showHeader);
	}
	this.router.add('/', this.showPanels);
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
	this.state = 'header';
};

proto.showPanels = function (match, params) {
	if (this.state === 'panels') {
		console.log('already here...');
	}
	else if (this.state === 'post') {
		document.body.classList.add('is-muted', 'is-transition-topanelsfrompost');
		this.watcher = this.posts.hide();
		this.watcher.on('complete', this.onPostHideComplete);
	}
	else if (this.state === 'header') {
		this.header.close();
	}
	this.view = this.panels;
	this.state = 'panels';
};

proto.showPost = function (match, params) {
	if (this.state === 'panels') {
		this.panels.disable();
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
	this.state = 'post';
};

proto.onIntroComplete = function () {
	this.view.introWatcher.clear();
	document.body.classList.remove('is-introtransition');
};

proto.onPanelShowComplete = function () {
	this.watcher.off('complete', this.onPanelShowComplete);
	document.body.classList.remove('is-muted', 'is-transition-topanelsfrompost');
};

proto.onPanelHideComplete = function () {
	this.watcher.off('complete', this.onPanelHideComplete);
	this.panels.hide();
	this.panels.resetTransition();

	if (this.state === 'post') {
		this.watcher = this.posts.show(location.pathname);
		this.watcher.on('complete', this.onPostShowComplete);
	}
};

proto.onPostShowComplete = function () {
	this.watcher.off('complete', this.onPostShowComplete);
	document.body.classList.remove('is-muted', 'is-transition-topostfrompanels');
};

proto.onPostHideComplete = function () {
	this.watcher.off('complete', this.onPostHideComplete);

	if (this.state === 'panels') {
		this.watcher = this.panels.show(this.router.lastURL);
		this.watcher.on('complete', this.onPanelShowComplete);
	}
};

module.exports = App;
