'use strict';

var Panels = require('./views/Panels');
var panels = new Panels({
	id: 'panels'
});

window.requestAnimationFrame(function () {
	document.body.classList.remove('is-intro');
});

var loadScript = require('./external/loadScript');
loadScript('twitter-wjs', '//platform.twitter.com/widgets.js', 500);
