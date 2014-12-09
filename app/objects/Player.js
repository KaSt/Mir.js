var HumanSprite = require('../sprites/HumanSprite.js');
var HumanActionEnum = require('../enums/HumanActionEnum.js');
var AnimationControl = require('../animations/AnimationControl.js');

function Player( data ) {
	this.name = data.name || null;
	this.level = data.level || null;
	this.exp = data.exp !== null ? data.exp : null;
	this.maxExp = data.maxExp !== null ? data.maxExp : null;
	this.x = data.x !== null ? data.x : null;
	this.y = data.y !== null ? data.y : null;
	this.virtualX = data.x !== null ? data.x : null;
	this.virtualY = data.y !== null ? data.y : null;

	this.direction = data.direction !== null ? data.direction : null;
	this.hp = data.hp !== null ? data.hp : null;
	this.mp = data.mp !== null ? data.mp : null;
	this.maxHp = data.maxHp !== null ? data.maxHp : null;
	this.maxMp = data.maxMp !== null ? data.maxMp : null;
	this.weight = data.weight !== null ? data.weight : null;
	this.weight = data.maxWeight !== null ? data.maxWeight : null;
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

Player.prototype.setZ = function(z) {
	this.humanSprite.setZ(z);	
}

Player.prototype.setVirtualLocation = function(diffX, diffY) {
	this.virtualX = this.virtualX + diffX;
	this.virtualY = this.virtualY + diffY;
}

Player.prototype.update = function() {
	this.humanSprite.update();
}

Player.prototype.move = function(distance, direction, beginMoveCallback, cameraMoveCallback, doneCallback, inputReadyCallback) {
	//first we check we can move there
	this.humanSprite.queueAnimation(new AnimationControl(
		distance === 1 ? HumanActionEnum.Walking : HumanActionEnum.Running,
		direction,
		function(beginMoveCallback) {
			beginMoveCallback();
		}.bind(this, beginMoveCallback),
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