'use strict';

var Analytics = require('./components/Analytics');
var Header = require('./views/Header');
var Lab = require('./views/Lab');
var Panels = require('./views/Panels');
var Posts = require('./views/Posts');
var Router = require('./components/Router');

function App (analytics) {
	this.onNavigate = this.onNavigate.bind(this);
	this.onIntroComplete = this.onIntroComplete.bind(this);
	this.onViewHidden = this.onViewHidden.bind(this);
	this.onViewLoaded = this.onViewLoaded.bind(this);

	this.init(analytics);
}

var proto = App.prototype;

proto.init = function (analytics) {
	this.analytics = new Analytics('UA-54501731-1', 'minimalmonkey.github.io', 200);

	this.header = new Header();
	this.panels = new Panels();
	this.posts = new Posts();
	this.lab = new Lab();

	this.router = new Router([
		this.panels.el
	]);

	var headerLinks = this.header.getPageLinks();
	var i = headerLinks.length;
	while (i--) {
		this.router.add(headerLinks[i], this.onNavigate, this.header, 'header');
	}
	this.router.add('/', this.onNavigate, this.panels, 'panels');
	this.router.add('/lab/', this.onNavigate, this.lab, 'lab');
	this.router.add('*post', this.onNavigate, this.posts, 'post');

	this.router.match(location.pathname);

	this.view.on('onintrocomplete', this.onIntroComplete);

	window.requestAnimationFrame(function () {
		document.body.classList.add('is-introtransition');
		document.body.classList.remove('is-intro');
	});
};

proto.onNavigate = function (view, state, match, params) {
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
	this.analytics.update(location.pathname);
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
