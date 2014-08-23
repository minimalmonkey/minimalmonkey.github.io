'use strict';

var Router = require('./components/Router');
var Header = require('./views/Header');
var Panels = require('./views/Panels');
var Posts = require('./views/Posts');

function App () {

	this.showHeader = this.showHeader.bind(this);
	this.showHome = this.showHome.bind(this);
	this.showPost = this.showPost.bind(this);

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
};

proto.showHeader = function (match, params) {
	this.header.open(match);
};

proto.showHome = function (match, params) {
	if (this.header.isOpen) {
		this.header.close();
	}
};

proto.showPost = function (match, params) {
	console.log('showPost', params);
};

module.exports = App;
