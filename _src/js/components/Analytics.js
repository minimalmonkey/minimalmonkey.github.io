'use strict';

var loadScript = require('../utils/loadScript');

function Analytics (id, domain, delay) {
	if (id && domain) {
		window._gaq = window._gaq || [];
		window._gaq.push(
			['_setAccount', id],
			['_setDomainName', domain],
			['_setAllowLinker', true],
			['_trackPageview']
		);
		var url = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		loadScript('analytics-wjs', url, delay);
	}
}

var proto = Analytics.prototype;

proto.update = function (url) {
	if (url.length && url.substr(0, 1) === '/') {
		url = url.substr(1);
	}
	try {
		if (window._gaq) {
			window._gaq.push(['_trackPageview', url]);
		}
	} catch(error) {
		console.warn('Error sending Google Analytics script.');
	}
};

module.exports = Analytics;
