'use strict';

var loadScript = require('./external/loadScript');

var Router = require('./components/Router');
var Panels = require('./views/Panels');
var Posts = require('./views/Posts');

var router = new Router({
	//
});

var panels = new Panels({
	id: 'panels',
	navId: 'panels-nav'
});

var posts = new Posts({
	//
});

window.requestAnimationFrame(function () {
	document.body.classList.remove('is-intro');
});

loadScript('twitter-wjs', '//platform.twitter.com/widgets.js', 2000);
