'use strict';

module.exports = function waitAnimationFrames (callback, howMany) {
	var args = Array.prototype.slice.call(arguments).splice(2);
	var count = 0;
	var checkCount = function () {
		++count;
		if (count === howMany) {
			callback.apply(this, args);
		}
		else {
			waitForNext();
		}
	};
	var waitForNext = function () {
		window.requestAnimationFrame(checkCount);
	};
	waitForNext();
};
