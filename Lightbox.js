/*
Script: Lightbox.js
	A class that lightens or darkens the entire page

License:
	MIT-style license.
*/

var Lightbox = new Class({
	initialize: function(color, opacity) {
		this.box 	= new Element('div');
		this.fire	= this.fire.bind(this);
		
		this.box.setStyles({ background: color, opacity: opacity, 'z-index': 1000, position: 'absolute' });
		this.box.injectInside(document.body);
		this.box.hide();
		this.box.addEvent('click', this.fire);
		
		window.addEvent('resize', function() {
			if (this.box && this.box.visible()) this.box.expand();
		}.bind(this));
	},
	attachDialog: function(dialog) {
		dialog.addEvent('onShow', this.show.bind(this));
		dialog.addEvent('onHide', this.hide.bind(this));
	},
	detach: function() {
		delete this['$events'];
	},
	fire: function() {
		this.fireEvent('onClick');
	},
	hide: function(dialog, fx, keep_lightbox) {
		if (!keep_lightbox) {
			this.detach();
			this.box.hide();
		}
	},
	show: function(dialog) {
		this.box.expand();
		this.box.show();
	}
});

Lightbox.implement(new Events);
// onClick, onHide, onShow

Element.extend({
	expand: function() {
		this.setStyles({
			top: 		'0px',
			left: 	'0px',
			width: 	Window.getScrollWidth() + 'px',
			height: Window.getScrollHeight() + 'px'
		});
	}
});