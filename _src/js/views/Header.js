'use strict';

var transitionEndEvent = require('../utils/transitionEndEvent')();
var waitAnimationFrames = require('../utils/waitAnimationFrames');

var BaseView = require('./BaseView');

function Header () {
	this.el = document.getElementById('siteheader');
	this.closeButton = document.getElementById('siteheader-close');

	this.closeURL = '/';
	this.pages = {};
	var pages = document.querySelectorAll('.siteheader-page');
	var url, page;
	var i = pages.length;
	while (i--) {
		url = pages[i].id.split('-')[0];
		page = this.pages['/' + url + '/'] = {
			nav: document.querySelector('.sitenav a[href*="' + url + '"]'),
			page: pages[i]
		};
		page.nav.dataset.url = page.nav.href;
	}
}

var proto = Header.prototype = new BaseView();

proto.open = function (key, lastURL) {
	this.hideCurrent();
	this.pages[key].nav.classList.add('is-selected');
	this.pages[key].page.classList.add('is-visible');

	if (lastURL) {
		this.closeURL = lastURL;
		this.closeButton.href = lastURL;
	}

	this.pages[key].nav.href = this.closeURL;

	waitAnimationFrames(function () {
		document.body.classList.add('is-headeropen');
	}, 2);
};

proto.close = function () {
	waitAnimationFrames(function () {
		this.hideCurrent();
		document.body.classList.remove('is-headeropen');
	}.bind(this), 2);
};

proto.hideCurrent = function () {
	var currentNav = document.querySelector('.sitenavlink.is-selected');
	if (currentNav) {
		currentNav.classList.remove('is-selected');
		currentNav.href = currentNav.dataset.url;
	}

	var currentPage = document.querySelector('.siteheader-page.is-visible');
	if (currentPage) {
		currentPage.classList.remove('is-visible');
	}
};

proto.getPageLinks = function () {
	var links = document.querySelectorAll('.sitenavlink[data-router]');
	var pathnames = [];
	var i = links.length;
	while (i--) {
		pathnames[i] = links[i].pathname;
	}
	return pathnames;
};

module.exports = Header;
