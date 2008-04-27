/*
Script: Array.js
	Contains Array prototypes.

License:
	MIT-style license.
*/

/*
Structure: Array
	Extensions to the native Array object.
*/

Array.extend({
	
	/*
	Property: toObject
		Returns an object with the Array's values as keys.
	
	Arguments:
		fill - (default: null) All values are set to this value.
	*/
	
	toObject: function(fill) {
		var obj = {};
		this.each(function(item) {
			obj[item] = (fill) ? fill : true;
		});
		return obj;
	},
	
	/*
	Property: zebra
		Adds the class name "zebra" to even or odd indices of the element array
	
	Arguments:
		odd - True if zebra'ing odd indexed elements instead of even.
	*/
	
	zebra: function(odd) {
		var add = (odd) ? 1 : 0;
		this.each(function(item, index) {
			((index + add) % 2 == 0) ? item.addClass('zebra') : item.removeClass('zebra');
		});
	}
});