'use strict';

// app
if (document.documentElement.classList) {
	var App = require('./App');
	new App();
}

// external
var loadScript = require('./external/loadScript');
loadScript('twitter-wjs', '//platform.twitter.com/widgets.js', 2000);
