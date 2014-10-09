'use strict';

// var setColor = require('./utils/setColor');

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

	this.onViewHidden = this.onViewHidden.bind(this);
	this.onViewLoaded = this.onViewLoaded.bind(this);

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

	this.onIntroComplete = this.onIntroComplete.bind(this);

	if (this.view && this.view.introWatcher) {
		this.view.introWatcher.on('complete', this.onIntroComplete);
	}
	else {
		this.header.introWatcher.on('complete', this.onIntroComplete);
	}
};

proto.showHeader = function (match, params) {
	this.showDynamic(match, params, this.header, 'header');
	// this.header.open(match, this.state !== 'header' ? this.router.lastURL : false);
	// this.setView(this.header, 'header');
};

proto.showPanels = function (match, params) {
	this.showDynamic(match, '/', this.panels, 'panels'); // TODO: figure out how we do '/' for panels dynamically
	/*if (this.state === 'header') {
		this.header.close();
	}
	else if (this.state === 'panels') {
		this.view.update(params);
	}
	else if (this.state) {
		document.body.classList.add('is-muted');
		this.panels.load('/');
		this.view.on('onhidden', this.onViewHidden);
		this.view.hide('panels');
	}
	this.setView(this.panels, 'panels');*/
};

proto.showPost = function (match, params) {
	this.showDynamic(match, params, this.posts, 'post');
	/*if (this.state === 'header') {
		this.header.close();
	}
	else if (this.state === 'post') {
		this.view.update(params);
	}
	else if (this.state) {
		document.body.classList.add('is-muted');
		this.posts.load(params);
		this.view.on('onhidden', this.onViewHidden);
		this.view.hide('post');
	}
	this.setView(this.posts, 'post');*/
};

proto.showLab = function (match, params) {
	this.showDynamic(match, params, this.lab, 'lab');
	/*if (this.state === 'header') {
		this.header.close();
	}
	else if (this.state === 'lab') {
		this.view.update(params);
	}
	else if (this.state) {
		document.body.classList.add('is-muted');
		this.lab.load(params);
		this.view.on('onhidden', this.onViewHidden);
		this.view.hide('lab');
	}
	this.setView(this.lab, 'lab');*/
};

proto.showDynamic = function (match, params, view, state) {
	if (state === 'header') {
		this.header.open(match, this.state !== 'header' ? this.router.lastURL : false);
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
	if (this.view.introWatcher) {
		this.view.introWatcher.clear();
	}
	else {
		this.header.introWatcher.clear();
	}
	document.body.classList.remove('is-introtransition');
};

proto.showView = function () {
	this.view.on('onshowed', this.onViewShowed);
	this.view.show(this.lastState, this.router.lastURL);
};

proto.onViewShowed = function (evt) {
	evt.target.off('onshowed', this.onViewShowed);

	// document.body.classList.remove('is-muted', 'is-transition-topostfrompanels'); // need to store the transition class and remove it
	document.body.classList.remove('is-muted', 'is-transition-topostfrompanels', 'is-transition-topanelsfrompost', 'is-transition-panelsbelow'); // TODO: be more specific
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
