/*
Script: Indicator.js
	A class to easily hide and show a mouse indicator

License:
	MIT-style license.
*/

var Indicator = new Class({
	initialize: function(image, x, y) {
		this.container = new Element('div');
		this.container.setHTML('<img src="/images/' + image + '" />');
		this.container.setStyles({ position: 'absolute', opacity: 0, 'z-index': 5000 });
		this.container.injectInside(document.body);
		
		$(document.body).addEvent('mousemove', function(e) {
			this.container.setStyles({
				top: 	e.page.y + y + 'px',
				left: e.page.x + x + 'px'
			});
		}.bindWithEvent(this));
	},
	show: function() { this.container.fadeIn(500); },
	hide: function() { this.container.fadeOut(500); }
});