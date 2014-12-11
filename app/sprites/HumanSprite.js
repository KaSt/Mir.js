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

HumanSprite.prototype.setLook = function(look) {
	this.look = look;
	this._updateBodyTexture();
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
		case HumanActionEnum.Attack1:
			this._handleAttack1Animation();
			break;
		case HumanActionEnum.Stance1:
			this._handleStandingStance1();
			break;
	}


	this._updateBodyTexture();
}

HumanSprite.prototype._nextAnimation = function() {
	//if nothing left, we set back to normal
	if(this._actionQueue.length === 0) {

		//check if last animation a movement, then we want to be standing again, otherwise we have an attack stance
		if(this._animationControl !== null && this._animationControl.getAction() === HumanActionEnum.Attack1) {
			this._animationControl = new AnimationControl({
				action: HumanActionEnum.Stance1,
				direction: this._direction
			});			
		} else {
			this._animationControl = new AnimationControl({
				action: HumanActionEnum.Standing,
				direction: this._direction
			});	
		}

		this._animationAlt = false;
	} else {
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

HumanSprite.prototype._handleStandingStance1 = function() {
	this._animationKeyFrame = 192 + this._direction;
	this._animationFrame = 0;

	if(this._tickElapsed(1000)) {	
		
		if(this._animationCameraFrame === 5 || this._actionQueue.length > 0) { 
			this._nextAnimation();
			this._animationFrame = 0;
			this._updateTick();
		} else {
			this._animationCameraFrame++;
			this._updateTick();
		}
	}	
}

HumanSprite.prototype._handleStandingAnimation = function() {
	if(this._tickElapsed(200)) {	
		this._animationKeyFrame = (8 * this._direction);

		if(this._animationFrame === 3) {
			this._animationFrame = 0;
			this._nextAnimation();
		} else {
			this._animationFrame++
			this._updateTick();
		}	
	}	
}

HumanSprite.prototype._handleAttack1Animation = function() {
	if(this._tickElapsed(80)) {	
		this._animationKeyFrame = 200 + (8 * this._direction); 

		if(this._animationFrame === 5) {
			this._animationControl.getAnimationCompleteEvent().call();
			this._animationFrame = 0;
			this._nextAnimation();
		} else {
			this._animationFrame++
			this._updateTick();
		}	
	}	
}

HumanSprite.prototype._handleMovingAnimation = function() {
	var tickTime = 60,
		stillRunning = false;

	this._animationKeyFrame = (this._animationControl.getAction() === HumanActionEnum.Walking ? 64 : 128) + (8 * this._direction);

	if(this._tickElapsed(tickTime)) {
		if(this._animationCameraFrame === 8) { 

			if(this._actionQueue.length > 0) {
				stillRunning = (this._actionQueue[0].getAction() === HumanActionEnum.Walking 
					|| this._actionQueue[0].getAction() === HumanActionEnum.Running)
			}
			this._animationControl.getAnimationCompleteEvent().call(this, stillRunning);
			//check queue for more animations
			this._nextAnimation();
			this._animationFrame = 0;

		} else {
			this._animationControl.getNewFrameEvent().call(this, this._animationCameraFrame);
			this._animationCameraFrame++

			if(this._animationCameraFrame === 1) {
				this._animationFrame = 1;
			} else if(this._animationCameraFrame === 2) {
				this._animationFrame = 2;
			} else if(this._animationCameraFrame === 3) {
				this._animationFrame = 3;				
			} else if(this._animationCameraFrame === 5) {
				this._animationFrame = 4;
			} else if(this._animationCameraFrame === 6) {
				this._animationFrame = 5;
			} else if(this._animationCameraFrame === 7) {
				this._animationFrame = 0;
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
	var index = (this.look * 600) + this._animationFrame + this._animationKeyFrame;

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