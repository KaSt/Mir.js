var EventEmitter = require('events').EventEmitter;
var util = require('util');
var PIXI = require('pixi.js');
var LoaderService = require('../services/LoaderService.js');
var ResourceService = require('../services/ResourceService.js');
var HumanActionEnum = require('../enums/HumanActionEnum.js');

var addPathNamePadding = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function HumanSprite( scene, data ) {
	EventEmitter.call(this);
	this.hasLight = data.hasLight !== null ? data.hasLight : null;
	this._direction = data.direction !== null ? data.direction : null;
	this._action = data.action !== null ? data.action : null;
	this._z = data.z !== null ? data.z : null;
	this.look = data.look !== null ? data.look : null;

	this._animationKeyFrame = 0;
	this._animationFrame = 0;
	this._lastAnimationTime = 0;

	this.sprites = new PIXI.DisplayObjectContainer();

	this._actionQueue = [];

	this._scene = scene;
	this._bodySprite = null;
	this._weaponSprite = null;
	this._effectsSprite = null;
	this._hairSprite = null;	
	this.loaded = false;
}

util.inherits(HumanSprite, EventEmitter);

HumanSprite.prototype.init = function() {
	//add the sprites to our container
	this.sprites.x = this.x;
	this.sprites.y = this.y;
	this.sprites.z = this.z + 0.1;

	this._updateBodyTexture();
}

HumanSprite.prototype.setZ = function(z) {
	this.z = z;
	this.sprites.z = this.z + 0.1;	
}

HumanSprite.prototype.setDirection = function(direction) {
	this._direction = direction;
}

HumanSprite.prototype.update = function() {
	if(this._bodySprite === null) {
		return false;
	}

	switch(this._action) {
		case HumanActionEnum.Standing:
			this._handleStandingAnimation();
			break;
		case HumanActionEnum.Walking:
			this._handleWalkingAnimation();
			break;
	}


	this._updateBodyTexture();
}

HumanSprite.prototype._nextAnimation = function() {
	//if nothing left, we set back to normal
	if(this._actionQueue.length === 0) {
		this._action = HumanActionEnum.Standing;
	} else {
		this._action = this._actionQueue[0];
		this._actionQueue.shift();
		this._updateTick();
	}
	this._animationFrame = 0;
}

HumanSprite.prototype.queueAnimation = function(action) {
	this._actionQueue.push(action);
}

HumanSprite.prototype._handleStandingAnimation = function() {
	if(this._tickElapsed(200)) {	
		this._animationKeyFrame = 0;

		if(this._animationFrame === 3) {
			this._nextAnimation();
		} else {
			this._animationFrame++
			this._updateTick();
		}	
	}	
}

HumanSprite.prototype._handleWalkingAnimation = function() {
	this._animationKeyFrame = 64;

	if(this._animationFrame === 5) {
		if(this._tickElapsed(250)) {
			this.emit('animationDone');
			//check queue for more animations
			this._nextAnimation();
		}
	} else {
		if(this._tickElapsed(100)) {
			if(this._animationFrame === 3) {
				this.emit('inputReady');
			} else {
				this.emit('animationFrame', this._animationFrame);
				this._animationFrame++
				this._updateTick();
			}	
		}			
	}

}

HumanSprite.prototype._updateTick = function() {
	this._lastAnimationTime = Date.now();
}

HumanSprite.prototype._tickElapsed = function(value) {
	return Date.now() - this._lastAnimationTime > value;
}

HumanSprite.prototype.setAction = function(action) {
	this._action = action;
}

HumanSprite.prototype._updateBodyTexture = function() {
	//fow now we simply set it to 9
	var index = (this.look * 600) + (8 * this._direction) + this._animationFrame + this._animationKeyFrame; // 0 in this case
	var humLib = ResourceService.graphics.humLib(this.look);

	var placementX = this._scene._graphicsPlacements[humLib.path][index][0];
	var placementY = this._scene._graphicsPlacements[humLib.path][index][1];	


	LoaderService.loadTexture(humLib.path + '/' + addPathNamePadding(index, 6) + '.' + humLib.type).then(function(texture) {
		if(this._bodySprite === null) {
			this._bodySprite = new PIXI.Sprite(texture);
			this.sprites.addChild(this._bodySprite);
		} else {
			this._bodySprite.setTexture(texture);
		}

		this._bodySprite.x = + placementX;
		this._bodySprite.y = -this._bodySprite.height + placementY;
	}.bind(this));
}

module.exports = HumanSprite;