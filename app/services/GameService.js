
var GameService = {
	player: null,
	scene: null,
	loggedIn: false,
	defaults: {
		viewRangeX: 15,
		viewRangeY: 15,
		cellWidth: 48,
        cellHeight: 32,
        screenWidth: 1024,
        screenHeight: 768
	},

	loadScene: function(newScene, appContainer) {

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
	}
};

module.exports = GameService;