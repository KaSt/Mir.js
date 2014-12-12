var HumanSprite = require('../sprites/HumanSprite.js');
var HumanActionEnum = require('../enums/HumanActionEnum.js');
var AnimationControl = require('../animations/AnimationControl.js');

function Player( data ) {
	this.name = data.name || null;
	this.level = data.level || null;
	this.exp = data.exp !== null ? data.exp : null;
	this.gender = data.gender !== null ? data.gender : null;
	this.maxExp = data.maxExp !== null ? data.maxExp : null;
	this.x = data.x !== null ? data.x : null;
	this.y = data.y !== null ? data.y : null;
	this.mirClass = data.mirClass !== null ? data.mirClass : null;
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

	this.isMoving = false;
}

Player.prototype.initHumanSprite = function(scene) {
	//make the human sprite for the player
	this.humanSprite = new HumanSprite(scene, {
		z: this.y,
		direction: this.direction,
		look: this.gender,
		gender: this.gender
	});
}

Player.prototype.setGender = function(gender) {
	this.gender = gender;
	this.humanSprite.setLook(this.gender);
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

Player.prototype.meleeAttack = function(direction, doneCallback) {
	this.humanSprite.queueAnimation(new AnimationControl({
		//maybe random the attacks?
		action: HumanActionEnum.Attack1,
		direction: direction,
		beginEvent: function() {
			//send attack to server?
		}.bind(this),
		animationCompleteEvent: function(doneCallback) {
			//attack animation done
			doneCallback();
		}.bind(this, doneCallback)
	}));
}

Player.prototype.move = function(distance, direction, beginMoveCallback, cameraMoveCallback, doneCallback, inputReadyCallback) {
	this.humanSprite.queueAnimation(new AnimationControl({
		action: distance === 1 ? HumanActionEnum.Walking : HumanActionEnum.Running,
		direction: direction,
		beginEvent: function(beginMoveCallback) {
			beginMoveCallback();
			this.isMoving = true;
		}.bind(this, beginMoveCallback),
		newFrameEvent: function(cameraMoveCallback, inputReadyCallback, _animationCameraFrame) {
			cameraMoveCallback(distance / 8);
			if(_animationCameraFrame === 6) {
				inputReadyCallback();
			}
		}.bind(this, cameraMoveCallback, inputReadyCallback),
		animationCompleteEvent: function(doneCallback, stillRunning) {
			doneCallback();
			this.isMoving = stillRunning;
		}.bind(this, doneCallback)
	}));
}

module.exports = Player