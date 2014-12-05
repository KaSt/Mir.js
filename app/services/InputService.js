var EventEmitter = require('events').EventEmitter;
var util = require('util');

function InputService() {
	EventEmitter.call(this);
	window.addEventListener('keydown', this._keyDown.bind(this), true)
}

util.inherits(InputService, EventEmitter);

InputService.prototype._keyDown = function(e) {
	switch(e.keyCode) {
		case 37:
			this.emit('pressed left', e.keyCode);
			break;							
		case 38:
			this.emit('pressed up', e.keyCode);
			break;
		case 39:
			this.emit('pressed right', e.keyCode);
			break;				
		case 40:
			this.emit('pressed down', e.keyCode);
			break;								
	}
}

module.exports = new InputService();