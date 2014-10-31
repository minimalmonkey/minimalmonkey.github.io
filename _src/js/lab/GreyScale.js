'use strict';

var THRESHOLD = 0.1;

var BaseLab = require('./BaseLab');
var MouseTracker = require('../components/MouseTracker');

function Greyscale (canvas) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.mouseTracker = new MouseTracker(canvas);
}

var proto = Greyscale.prototype = new BaseLab();

proto.generate = function (space) {
	this.point = [];
	var wd = Math.ceil(this.width / space);
	var ht = Math.ceil(this.height / space);
	var layout = [];
	var p, w, h, i, j, l, c, g;

	for(w = 0; w <= wd; w++) {
		layout[w] = [];

		for(h = 0; h <= ht; h++) {
			p = {};
			p.x = p.ox = space * w;
			p.y = p.oy = space * h;

			this.point[this.point.length] = p;

			layout[w][h] = p;
		}
	}

	this.points = [];
	for(i = 0; i < layout.length-1; i++) {
		l = layout[i].length-1;
		for(j = 0; j < l; j++) {
			p = {};
			p.tl = layout[i][j];
			p.tr = layout[i][j+1];
			p.br = layout[i+1][j+1];
			p.bl = layout[i+1][j];
			c = 8 + Math.round(Math.random() * 30);
			g = c + 15;
			p.color1 = ['rgb(' + c, c, c + ')'].join(',');
			p.color2 = ['rgb(' + g, g, g + ')'].join(',');
			this.points[this.points.length] = p;
		}
	}
};

proto.resize = function () {
	var space = 40;
	this.maxDist = Math.ceil(space * 5);
	this.generate(space);
};

proto.update = function () {
	var i = this.point.length;
	while(i--) {
		this.calculate(this.point[i]);
	}
	this.render();
};

proto.calculate = function (p) {
	var easing;
	var dx = this.mouseTracker.x - p.ox;
	var dy = this.mouseTracker.y - p.oy;
	var dist = Math.sqrt(dx * dx + dy * dy);

	if(dist === 0 || (dist > this.maxDist && p.x === p.ox && p.y === p.oy)) {
		return;
	}

	var tx, ty;

	if(dist <= this.maxDist && this.mouseTracker.isOver) {
		var ratio = dy / dist;
		var ang = Math.asin(ratio) * 180 / Math.PI;

		if(this.mouseTracker.x < p.ox) {
			ang = 180 - ang;
		}

		ang = 270 - ang;

		var sin = Math.sin(ang / 180 * Math.PI);
		var cos = Math.cos(ang / 180 * Math.PI);
		var radius = this.maxDist - ((this.maxDist / dist - 1) * 8);
		radius = Math.max(this.maxDist * 0.25, radius);

		tx = this.mouseTracker.x + (sin * radius);
		ty = this.mouseTracker.y + (cos * radius);

		easing = 0.07;
	}
	else {
		tx = p.ox;
		ty = p.oy;
		easing = 0.03;
	}

	if(p.x != tx) {
		var vx = (tx - p.x) * easing;
		p.x += vx;
	}
	if(p.y != ty) {
		var vy = (ty - p.y) * easing;
		p.y += vy;
	}
	if(Math.abs(p.x - tx) < THRESHOLD) {
		p.x = tx;
	}
	if(Math.abs(p.y - ty) < THRESHOLD) {
		p.y = ty;
	}
};

proto.render = function () {
	var p, i = this.points.length;
	while(i--) {
		p = this.points[i];
		var grd = this.context.createLinearGradient(p.tl.x, p.tl.y, p.br.x, p.br.y);
		grd.addColorStop(0, p.color1);
		grd.addColorStop(1, p.color2);
		this.context.fillStyle = grd;
		this.context.beginPath();
		this.context.moveTo(p.tl.x, p.tl.y);
		this.context.lineTo(p.tr.x, p.tr.y);
		this.context.lineTo(p.br.x, p.br.y);
		this.context.lineTo(p.bl.x, p.bl.y);
		this.context.lineTo(p.tl.x, p.tl.y);
		this.context.closePath();
		this.context.fill();
	}
};

proto.enable = function () {
	this.mouseTracker.enable();
	BaseLab.prototype.enable.call(this);
};

proto.disable = function () {
	this.mouseTracker.disable();
	BaseLab.prototype.disable.call(this);
};

module.exports = Greyscale;
