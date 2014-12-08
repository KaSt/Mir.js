var EventEmitter = require('events').EventEmitter;
var util = require('util');

function InputService() {
	this.leftMouseButtonDown = false;
	this.rightMouseButtonDown = false;
	this.mouseX = 0;
	this.mouseY = 0;
	EventEmitter.call(this);
	window.addEventListener('keydown', this._keyDown.bind(this), true)
	window.addEventListener('mousedown', this._mouseDown.bind(this), true)
	window.addEventListener('mouseup', this._mouseUp.bind(this), true)
	window.addEventListener('mousemove', this._mouseMove.bind(this), true)
	document.addEventListener('contextmenu', function(e) {
    	e.preventDefault();
	}, false);
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

InputService.prototype._mouseDown = function(e) {
	switch(e.button) {
		case 0:
			this.leftMouseButtonDown = true;
			this.emit('mousedown left', e.keyCode);
			break;							
		case 2:
			this.rightMouseButtonDown = true;
			this.emit('mousedown right', e.keyCode);
			break;						
	}
}

InputService.prototype._mouseUp = function(e) {
	switch(e.button) {
		case 0:
			this.leftMouseButtonDown = false;
			this.emit('mouseup left', e.keyCode);
			break;							
		case 2:
			this.rightMouseButtonDown = false;
			this.emit('mouseup right', e.keyCode);
			break;						
	}
}

InputService.prototype._mouseMove = function(e) {
	var x = e.offsetX === undefined ? e.layerX : e.offsetX;
	var y = e.offsetY === undefined ? e.layerY : e.offsetY;

	this.mouseX = x;
	this.mouseY = y;
}

module.exports = new InputService();