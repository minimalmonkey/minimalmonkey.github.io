var loadScript = require('./external/loadScript');
loadScript('twitter-wjs', '//platform.twitter.com/widgets.js', 500);

var Panels = require('./views/Panels');
var panels = new Panels({
	id: 'panels'
});
