var HumanSprite = require('../sprites/HumanSprite.js');
var HumanActionEnum = require('../enums/HumanActionEnum.js');

function Player( data ) {
	this.name = data.name || null;
	this.level = data.level || null;
	this.exp = data.exp || null;
	this.map = data.map || null;
	this.x = data.x || null;
	this.y = data.y || null;
	this.hp = data.hp || null;
	this.mp = data.mp || null;
	this.bag = data.bag || [];
	this.equiped = data.equiped || {};
	this.humanSprite = null;
}

Player.prototype.initHumanSprite = function(scene) {
	//make the human sprite for the player
	this.humanSprite = new HumanSprite(scene, {
		z: this.y,
		look: 0
	});
}

Player.prototype.setLocation = function(x, y) {
	this.x = x;
	this.y = y;
	this.humanSprite.updateZ(y);	
}

module.exports = Player