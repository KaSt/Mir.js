
var GameService = {
	player: null,
	scene: null,
	loggedIn: false,

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