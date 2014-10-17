'use strict';

function FeatureDetect() {}

FeatureDetect.touch = function () {
	return 'ontouchstart' in window || 'onmsgesturechange' in window;
};

module.exports = FeatureDetect;
