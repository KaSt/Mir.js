var PIXI = require('pixi.js');
var LoaderService = require('../services/LoaderService.js');
var ResourceService = require('../services/ResourceService.js');
var HumanActionEnum = require('../enums/HumanActionEnum.js');
var AnimationControl = require('../animations/AnimationControl.js');

var addPathNamePadding = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function HumanSprite( scene, data ) {
	this.hasLight = data.hasLight !== null ? data.hasLight : null;
	this._direction = data.direction !== null ? data.direction : null;
	this._action = data.action !== null ? data.action : null;
	this.z = null;
	this.look = data.look !== null ? data.look : null;

	this._animationControl = null;
	this._animationKeyFrame = 0;
	this._animationFrame = 0;
	this._animationCameraFrame = 0;
	this._lastAnimationTime = 0;
	this._animationAlt = false;

	this.sprites = new PIXI.DisplayObjectContainer();

	this._actionQueue = [];

	this._scene = scene;
	this._bodySprite = null;
	this._weaponSprite = null;
	this._effectsSprite = null;
	this._hairSprite = null;	
	this.loaded = false;
}

HumanSprite.prototype.init = function() {
	//add the sprites to our container
	this.sprites.x = this.x;
	this.sprites.y = this.y;
	this.sprites.z = this.z + 0.1;

	this._updateBodyTexture();
	this._nextAnimation();
}

HumanSprite.prototype.setZ = function(z) {
	this.z = z;
	this.sprites.z = this.z + 0.1;	
}

HumanSprite.prototype.getScene = function() {
	return this._scene;	
}

HumanSprite.prototype.setDirection = function(direction) {
	this._direction = direction;
}

HumanSprite.prototype.update = function() {
	if(this._bodySprite === null) {
		return false;
	}

	switch(this._animationControl.getAction()) {
		case HumanActionEnum.Standing:
			this._handleStandingAnimation();
			break;
		case HumanActionEnum.Walking:
		case HumanActionEnum.Running:
			this._handleMovingAnimation();
			break;
	}


	this._updateBodyTexture();
}

HumanSprite.prototype._nextAnimation = function() {
	//if nothing left, we set back to normal
	if(this._actionQueue.length === 0) {
		this._animationControl = new AnimationControl(HumanActionEnum.Standing, this._direction);
		this._animationAlt = false;
	} else {
		if(this._animationControl.getAction() === this._actionQueue[0].getAction()) {
			this._animationAlt = !this._animationAlt;	
		}
		this._animationControl = this._actionQueue[0];
		if(this._animationControl.getBeginEvent() != null) {
			this._animationControl.getBeginEvent().call();
		}
		this._direction = this._animationControl.getDirection();
		this._actionQueue.shift();
	}
	this._animationCameraFrame = 0;
}

HumanSprite.prototype.queueAnimation = function(animationControl) {
	this._actionQueue.push(animationControl);
}

HumanSprite.prototype._handleStandingAnimation = function() {
	if(this._tickElapsed(200)) {	
		this._animationKeyFrame = 0;

		if(this._animationFrame === 3) {
			this._animationFrame = 0;
			this._nextAnimation();
		} else {
			this._animationFrame++
			this._updateTick();
		}	
	}	
}

HumanSprite.prototype._handleMovingAnimation = function() {
	var tickTime = 16;

	this._animationKeyFrame = this._animationControl.getAction() === HumanActionEnum.Walking ? 64 : 128;

	if(this._actionQueue.length === 0 && this._animationCameraFrame === 16) {
		tickTime = 100;
	}
	if(this._tickElapsed(tickTime)) {
		if(this._animationCameraFrame === 16) { 
			this._animationControl.getAnimationCompleteEvent().call();
			//check queue for more animations
			this._nextAnimation();
			this._animationFrame = 0
		} else {
			this._animationControl.getNewFrameEvent().call(this, this._animationCameraFrame);
			this._animationCameraFrame++

			if(this._animationCameraFrame % 6 === 0) {
				this._animationFrame++;
			}
			this._updateTick();
		}
	}		
}


HumanSprite.prototype._updateTick = function() {
	this._lastAnimationTime = Date.now();
}

HumanSprite.prototype._tickElapsed = function(value) {
	return Date.now() - this._lastAnimationTime > value;
}

HumanSprite.prototype._updateBodyTexture = function() {
	var index = (this.look * 600) + (8 * this._direction) + (this._animationAlt === true ? this._animationFrame + 3 : this._animationFrame) + this._animationKeyFrame; // 0 in this case
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

		this._bodySprite.x = placementX;
		this._bodySprite.y = placementY;
	}.bind(this));
}

module.exports = HumanSprite;