var ScenesEnum = require('../scenes/ScenesEnum.js');
var WorldScene = require('../scenes/WorldScene.js');

var GameService = {
	player: null,
	currentScene: null,
	loggedIn: false,

	loadScene: function(newScene) {
		this.currentScene.hide().then(function() {
			switch(newScene) {
				case ScenesEnum.WORLD_SCENE:
					this.currentScene = new WorldScene();
					break;
			}

			//show loading?

			//then show scene
			this.currentScene.show();
		}.bind(this));
	}
};

module.exports = GameService;