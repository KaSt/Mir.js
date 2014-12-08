var HumanSprite = require('../sprites/HumanSprite.js');
var HumanActionEnum = require('../enums/HumanActionEnum.js');

function Player( data ) {
	this.name = data.name || null;
	this.level = data.level || null;
	this.exp = data.exp || null;
	this.map = data.map || null;
	this.x = data.x || null;
	this.y = data.y || null;
	this.direction = data.direction || 0;
	this.hp = data.hp || null;
	this.mp = data.mp || null;
	this.bag = data.bag || [];
	this.equiped = data.equiped || {};
	this.humanSprite = null;
}

Player.prototype.initHumanSprite = function(scene) {
	//make the human sprite for the player
	this.humanSprite = new HumanSprite(scene, {
		z: this.y,
		direction: this.direction,
		action: HumanActionEnum.Standing,
		look: 0
	});
}

Player.prototype.setLocation = function(x, y) {
	this.x = x;
	this.y = y;
	this.humanSprite.setZ(y);	
}

Player.prototype.update = function() {
	this.humanSprite.update();
}

Player.prototype.setDirection = function(direction) {
	this.direction = direction;
	this.humanSprite.setDirection(direction);	
}

Player.prototype.walk = function(cameraMoveCallback, doneCallback, inputReadyCallback) {
	this.humanSprite.queueAnimation(HumanActionEnum.Walking);

	var animationFrameEvent = function(animationFrame) {
		cameraMoveCallback(1/5);
	}

	var inputReadyEvent = function(animationFrame) {
		inputReadyCallback();
	}	

	var animationDoneEvent = function() {
		this.humanSprite.removeListener('animationFrame', animationFrameEvent);
		this.humanSprite.removeListener('animationDone', animationDoneEvent);
		this.humanSprite.removeListener('inputReady', inputReadyEvent);
		doneCallback();
	}.bind(this);

	this.humanSprite.on('animationFrame', animationFrameEvent);
	this.humanSprite.on('animationDone', animationDoneEvent);
	this.humanSprite.on('inputReady', inputReadyEvent);
}

module.exports = Player