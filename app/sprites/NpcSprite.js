var PIXI = require('pixi.js');
var LoaderService = require('../services/LoaderService.js');
var ResourceService = require('../services/ResourceService.js');

var addPathNamePadding = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function NpcSprite( scene, data ) {
	this.hasLight = data.hasLight !== null ? data.hasLight : null;
	this._direction = 0;
	this.z = data.z !== null ? data.z : null;
	this.look = data.look !== null ? data.look : null;

	this._animationKeyFrame = 0;
	this._animationFrame = 0;
	this._lastAnimationTime = 0;
	this._animationAmounts = 0;
	this._animateAltEffect = false;

	this.sprites = new PIXI.DisplayObjectContainer();

	this._scene = scene;
	this._npcSprite = null;
	this.loaded = false;
}

NpcSprite.prototype.init = function() {
	//add the sprites to our container
	this.sprites.x = this.x;
	this.sprites.y = this.y;
	this.sprites.z = this.z + 0.1;

	this._updateSpriteTexture();
}

NpcSprite.prototype.setZ = function(z) {
	this.z = z;
	this.sprites.z = this.z + 0.1;	
}

NpcSprite.prototype.setDirection = function(direction) {
	this._direction = direction;
}

NpcSprite.prototype.update = function() {
	if(this._npcSprite === null) {
		return false;
	}

	if(this._animationAmounts > 4) {
		this._animationAmounts = 0
		this._animateAltEffect = true;
		this._direction++;
		if(this._direction === 3) {
			this._direction = 0;
		}
	}

	if(this._animateAltEffect === false) {
		this._handleStandingAnimation();
	} else {
		this._handleAltEffectAnimation();
	}

	this._updateSpriteTexture();
}

NpcSprite.prototype._handleStandingAnimation = function() {
	if(this._tickElapsed(500)) {	
		this._animationKeyFrame = 0;

		if(this._animationFrame === 3) {
			this._animationFrame = 0;
			this._animationAmounts++;
			this._updateTick();
		} else {
			this._animationFrame++
			this._updateTick();
		}	
	}	
}

NpcSprite.prototype._handleAltEffectAnimation = function() {
	if(this._tickElapsed(75)) {	
		this._animationKeyFrame = 30;

		if(this._animationFrame === 9) {
			this._animationFrame = 0;
			this._animateAltEffect = false;
		} else {
			this._animationFrame++
			this._updateTick();
		}	
	}	
}

NpcSprite.prototype._updateTick = function() {
	this._lastAnimationTime = Date.now();
}

NpcSprite.prototype._tickElapsed = function(value) {
	return Date.now() - this._lastAnimationTime > value;
}

NpcSprite.prototype._updateSpriteTexture = function() {
	var index = (this.look * 60) + (10 * this._direction) + this._animationFrame + this._animationKeyFrame;
	var npcLib = ResourceService.graphics.npcLib(this.look);

	var placementX = this._scene._graphicsPlacements[npcLib.path][index][0];
	var placementY = this._scene._graphicsPlacements[npcLib.path][index][1];	

	LoaderService.loadTexture(npcLib.path + '/' + addPathNamePadding(index, 6) + '.' + npcLib.type).then(function(texture) {
		if(this._npcSprite === null) {
			this._npcSprite = new PIXI.Sprite(texture);
			this.sprites.addChild(this._npcSprite);
		} else {
			this._npcSprite.setTexture(texture);
		}

		this._npcSprite.x = placementX;
		this._npcSprite.y = placementY;
	}.bind(this));
}

module.exports = NpcSprite;