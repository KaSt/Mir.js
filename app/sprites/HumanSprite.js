var PIXI = require('pixi.js');

function HumanSprite( data ) {
	this._hasLight = data.hasLight || false;
	this._direction = data.direction || null;
	this._action = null;
	this._z = data.z || null;
	this._look = data.look || null;

	this._sprites = new PIXI.DisplayObjectContainer();

	this._bodySprite = null;
	this._bodySprite = null;
	this._weaponSprite = null;
	this._effectsSprite = null;
	this._hairSprite = null;	

	this._init();
}

HumanSprite.prototype._init = function() {
	//from the look, we can create the differnet sprites
}

module.exports = HumanSprite;