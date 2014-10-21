'use strict';

function ColorDictionary () {
	this._colors = {};
}

var proto = ColorDictionary.prototype;

proto.add = function (url, color) {
	this._colors[url] = color;
};

proto.get = function (url) {
	return this._colors[url];
};

module.exports = new ColorDictionary();
