'use strict';

// analytics
var Analytics = require('./components/Analytics');
var analytics = new Analytics('UA-54501731-1', 'minimalmonkey.github.io', 200);

// app
if (document.documentElement.classList) { // TODO: maybe change to see if MutationObserver exists & screw IE10?
	var App = require('./App');
	var app = new App(analytics);
}

// external
var loadScript = require('./external/loadScript');
loadScript('twitter-wjs', '//platform.twitter.com/widgets.js', 1200);
