
var GameService = {
	player: null,
	npcs: [],
	otherPlayers: [],
	mobs: [],
	scene: null,
	loggedIn: false,
	map: {
		file: '',
		name: ''
	},
	defaults: {
		viewRangeX: 35,
		viewRangeY: 35,
		cellWidth: 48,
        cellHeight: 32,
        screenWidth: 1024,
        screenHeight: 768
	},

	loadScene: function(newScene) {

		var processScene = function processScene() {
			this.scene = newScene;

			newScene.init();

			//show loading?

			//then show scene
			this.scene.show();
		}.bind(this);

		if(this.scene !== null) {
			this.scene.hide().then(function() {
				processScene();
			}.bind(this));
		} else {
			processScene();
		}
	},

	addNpc: function(npc) {
		this.npcs.push(npc);
	},

	addMob: function(mob) {
		this.mobs.push(mob);
	}	
};

module.exports = GameService;