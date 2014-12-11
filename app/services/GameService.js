
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
        screenWidth: 1920,
        screenHeight: 1080
	},
	debug: {
		enabled: false,
		x: 0,
		y: 0
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