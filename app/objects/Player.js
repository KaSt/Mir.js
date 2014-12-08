var HumanSprite = require('../sprites/HumanSprite.js');
var HumanActionEnum = require('../enums/HumanActionEnum.js');
var AnimationControl = require('../animations/AnimationControl.js');

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

Player.prototype.move = function(distance, direction, cameraMoveCallback, doneCallback, inputReadyCallback) {
	this.humanSprite.queueAnimation(new AnimationControl(
		distance === 1 ? HumanActionEnum.Walking : HumanActionEnum.Running,
		direction,
		function(cameraMoveCallback, inputReadyCallback, _animationCameraFrame) {
			cameraMoveCallback(distance / 8);
			if(_animationCameraFrame === 2) {
				inputReadyCallback();
			}
		}.bind(this, cameraMoveCallback, inputReadyCallback),
		function(doneCallback) {
			doneCallback();
		}.bind(this, doneCallback)
	));
}

module.exports = Player