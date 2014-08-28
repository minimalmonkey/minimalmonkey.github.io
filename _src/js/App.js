'use strict';

var setColor = require('./utils/setColor');

var Router = require('./components/Router');
var Header = require('./views/Header');
var Panels = require('./views/Panels');
var Posts = require('./views/Posts');

function App () {

	this.showHeader = this.showHeader.bind(this);
	this.showHome = this.showHome.bind(this);
	this.showPost = this.showPost.bind(this);
	this.onPanelToPostComplete = this.onPanelToPostComplete.bind(this);
	this.onPostShowComplete = this.onPostShowComplete.bind(this);

	this.initViews();
	this.initRouter();

	window.requestAnimationFrame(function () {
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
	this.router.add('/', this.showHome);
	this.router.add('*post', this.showPost);

	this.router.match(location.pathname);
};

proto.showHeader = function (match, params) {
	this.header.open(match, this.state !== 'header' ? this.router.lastURL : false);
	this.state = 'header';
};

proto.showHome = function (match, params) {
	if (this.state === 'panels') {
		console.log('already here...');
	}
	else if (this.state === 'post') {
		console.log('from post transition');
	}
	else if (this.state === 'header') {
		this.header.close();
	}
	this.state = 'panels';
};

proto.showPost = function (match, params) {
	if (this.state === 'panels') {
		this.panels.disable();
		var color = this.panels.getCurrentColor(params);
		document.body.classList.add('is-muted', 'is-transition-topost');
		setColor(document.body, color);
		this.watcher = this.panels.transitionToPost();
		this.watcher.on('complete', this.onPanelToPostComplete);
	}
	else if (this.state === 'post') {
		this.posts.slide(location.pathname);
	}
	else if (this.state === 'header') {
		this.header.close();
	}
	this.state = 'post';
};

proto.onPanelToPostComplete = function () {
	this.watcher.off('complete', this.onPanelToPostComplete);
	this.panels.hide();
	this.watcher = this.posts.show(location.pathname);
	this.watcher.on('complete', this.onPostShowComplete);
};

proto.onPostShowComplete = function () {
	this.watcher = undefined;
	document.body.classList.remove('is-muted', 'is-transition-topost');
};

module.exports = App;
