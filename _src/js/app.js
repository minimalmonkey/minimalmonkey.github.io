'use strict';

var loadScript = require('./external/loadScript');

var Router = require('./components/Router');
var Header = require('./views/Header');
var Panels = require('./views/Panels');
var Posts = require('./views/Posts');

// views
var header = new Header();
var panels = new Panels();
var posts = new Posts();

// router
var router = new Router();

var showHeader = function (match, params) {
	header.show(match);
};

var headerLinks = header.getPageLinks();
var i = headerLinks.length;
while (i--) {
	router.add(headerLinks[i], showHeader);
}

// intro
window.requestAnimationFrame(function () {
	document.body.classList.remove('is-intro');
});

// external
// loadScript('twitter-wjs', '//platform.twitter.com/widgets.js', 2000);
