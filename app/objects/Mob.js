var MobSprite = require('../sprites/MobSprite.js');

function Mob( data ) {
	this.name = data.name || null;
	this.look = data.look !== null ? data.look : null;
	this.id = data.id !== null ? data.id : null;
	this.x = data.x !== null ? data.x : null;
	this.y = data.y !== null ? data.y : null;
	this._mobSprite = null;	
}

Mob.prototype.initMobSprite = function(scene) {
	//make the human sprite for the player
	this._mobSprite = new MobSprite(scene, {
		z: this.y,
		look: this.look
	});
}

Mob.prototype.setLocation = function(x, y) {
	this.x = x;
	this.y = y;
	this._mobSprite.setZ(y);	
}

Mob.prototype.update = function() {
	this._mobSprite.update();
}

Mob.prototype.getMobSprite = function() {
	return this._mobSprite;
}

module.exports = Mob;