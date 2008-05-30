var Bench = {
  /*
	Property: time
		Starts a timer.
	Argument:
		name - the name of the timer
	*/

	time: function(name){
	  this.timers = this.timers || [];
		this.timers[name] = new Date().getTime();
	},

	/*
	Property: timeEnd
		Ends a timer and logs that value to the console.
		Argument:
		name - the name of the timer
	*/

	timeEnd: function(name){
		if (this.timers[name]) console.log('%s: %s', name, new Date().getTime() - this.timers[name]);
		else console.log('no such timer: %s', name);
	}
};