'use strict';

var loadScript = require('./utils/loadScript');

var Analytics = require('./components/Analytics');
var App = require('./App');

var init = function () {
	var externalsDelay;

	// TODO: maybe change to see if MutationObserver exists & screw IE10?
	if (document.documentElement.classList) {
		new App();
		externalsDelay = 1200;
	}
	else {
		new Analytics('UA-54501731-1', 'minimalmonkey.github.io');
		externalsDelay = 0;
	}

	loadScript('twitter-wjs', '//platform.twitter.com/widgets.js', externalsDelay);
};

init();
