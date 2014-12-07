var PIXI = require('pixi.js');
var LoaderService = require('../services/LoaderService.js');
var ResourceService = require('../services/ResourceService.js');

var addPathNamePadding = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function HumanSprite( scene, data ) {
	this.hasLight = data.hasLight !== null ? data.hasLight : null;
	this._direction = data.direction !== null ? data.direction : null;
	this.action = data.action || null;
	this._z = data.z !== null ? data.z : null;
	this.look = data.look !== null ? data.look : null;

	this.animationX = 0;
	this.animationY = 0;

	this.sprites = new PIXI.DisplayObjectContainer();

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
}

HumanSprite.prototype.updateZ = function(z) {
	this.z = z;
	this.sprites.z = this.z + 0.1;	
}

HumanSprite.prototype.updateDirection = function(direction) {
	this._direction = direction;
	this._updateBodyTexture();
}

HumanSprite.prototype._updateBodyTexture = function() {
	//fow now we simply set it to 9
	var index = this.look + (8 * this._direction); // 0 in this case
	var humLib = ResourceService.graphics.humLib(this.look);

	var placementX = this._scene._graphicsPlacements[humLib.path][index][0];
	var placementY = this._scene._graphicsPlacements[humLib.path][index][1];	

	LoaderService.loadTexture(humLib.path + '/' + addPathNamePadding(index, 6) + '.' + humLib.type).then(function(texture) {
		if(this._bodySprite === null) {
			this._bodySprite = new PIXI.Sprite(texture);
			this.sprites.addChild(this._bodySprite);
			
			this._bodySprite.x = placementX;
			this._bodySprite.y = -this._bodySprite.height + placementY;
		} else {
			this._bodySprite.setTexture(texture);
		}
	}.bind(this));
}

module.exports = HumanSprite;