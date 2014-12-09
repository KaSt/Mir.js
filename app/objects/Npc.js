var NpcSprite = require('../sprites/NpcSprite.js');

function Npc( data ) {
	this.name = data.name || null;
	this.look = data.look !== null ? data.look : null;
	this.id = data.id !== null ? data.id : null;
	this.x = data.x !== null ? data.x : null;
	this.y = data.y !== null ? data.y : null;
	this.npcSprite = null;
}

Npc.prototype.initNpcSprite = function(scene) {
	//make the human sprite for the player
	this.npcSprite = new NpcSprite(scene, {
		z: this.y,
		look: this.look
	});
}

Npc.prototype.setLocation = function(x, y) {
	this.x = x;
	this.y = y;
	this.npcSprite.setZ(y);	
}

Npc.prototype.update = function() {
	this.npcSprite.update();
}


module.exports = Npc