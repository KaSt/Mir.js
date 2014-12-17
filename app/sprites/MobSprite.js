var PIXI = require('pixi.js');
var LoaderService = require('../services/LoaderService.js');
var ResourceService = require('../services/ResourceService.js');

var addPathNamePadding = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function MobSprite( scene, data ) {
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
	this._mobSprite = null;
	this.loaded = false;
}

MobSprite.prototype.init = function() {
	//add the sprites to our container
	this.sprites.x = this.x;
	this.sprites.y = this.y;
	this.sprites.z = this.z + 0.1;

	this._updateSpriteTexture();
}

MobSprite.prototype.setZ = function(z) {
	this.z = z;
	this.sprites.z = this.z + 0.1;	
}

MobSprite.prototype.update = function() {
	if(this._mobSprite === null) {
		return false;
	}

	this._handleStandingAnimation();

	this._updateSpriteTexture();
}

MobSprite.prototype._handleStandingAnimation = function() {
	if(this._tickElapsed(400)) {	
		this._animationKeyFrame = (8 * this._direction);

		if(this._animationFrame === 3) {
			this._animationFrame = 0;
			this._updateTick();
		} else {
			this._animationFrame++
			this._updateTick();
		}	
	}	
}

MobSprite.prototype._updateSpriteTexture = function() {
	var index = (this.look * 60) + (10 * this._direction) + this._animationFrame + this._animationKeyFrame;
	var mobLib = ResourceService.graphics.mobLib(this.look);

	var placementX = this._scene._graphicsPlacements[mobLib.path][index][0];
	var placementY = this._scene._graphicsPlacements[mobLib.path][index][1];	

	LoaderService.loadTexture(mobLib.path + '/' + addPathNamePadding(index, 6) + '.' + mobLib.type).then(function(texture) {
		if(this._mobSprite === null) {
			this._mobSprite = new PIXI.Sprite(texture);
			this.sprites.addChild(this._mobSprite);
		} else {
			this._mobSprite.setTexture(texture);
		}

		this._mobSprite.x = placementX;
		this._mobSprite.y = placementY;
	}.bind(this));
}

MobSprite.prototype._updateTick = function() {
	this._lastAnimationTime = Date.now();
}

MobSprite.prototype._tickElapsed = function(value) {
	return Date.now() - this._lastAnimationTime > value;
}

module.exports = MobSprite;