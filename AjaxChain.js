/*
Script: AjaxChain.js
	Contains the <AjaxChain> class.

License:
	MIT-style license.
*/

/*
Class: AjaxChain
	A chain implementation for Ajax requests.

Events:
	onEnd - Called when chain length goes from one to empty.
	onStart - Called when chain length goes from empty to one.

Example:
	>// ajax request will execute only after the last one finished
	>while (true) {
	>	this.chain(function() {
	>		new Ajax('/', {
	>			onComplete: function() {
	>				this.callChain();
	>			}.bind(this),
	>			onFailure: function() {
	>				this.callChain(true);	// call chain again
	>			}.bind(this)
	>		}).request();
	>	}.bind(this));
	>}
*/

var AjaxChain = new Class({

	chain: function(fn){
		this.chains = this.chains || [];
		this.chains.push(fn);
		
		if (this.chains.length == 1) {
			this.fireEvent('onStart');
			fn.delay(10, this);
		}
		
		return this;
	},

	callChain: function(failed){
		if (this.chains && this.chains.length) {
			if (failed)
				this.chains[0].delay(10, this);
			else {
				this.chains.shift();
  			if (this.chains.length)
  				this.chains[0].delay(10, this);
  			else
  				this.fireEvent('onEnd');
  		}
		}
	},

	clearChain: function(){
		this.chains = [];
	}

});

AjaxChain.implement(new Events);