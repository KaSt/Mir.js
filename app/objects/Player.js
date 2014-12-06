var HumanSprite = require('../sprites/HumanSprite.js');

function Player( data ) {
	this.name = data.name || null;
	this.level = data.level || null;
	this.exp = data.exp || null;
	this.map = data.map || null;
	this.x = data.x || null;
	this.y = data.y || null;
	this.offsetX = 0;
	this.offsetY = 0;
	this.hp = data.hp || null;
	this.mp = data.mp || null;
	this.bag = data.bag || [];
	this.equiped = data.equiped || {};
	this.humanSprite = null;

	this._init();
}

Player.prototype._init = function() {
	//make the human sprite for the player
	this.humanSprite = new HumanSprite();
}


module.exports = Player