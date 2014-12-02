var GameService = require('./services/GameService.js');
var SceneTypes = require('./scenes/SceneTypes.js');
var Renderer = require('./Renderer.js');

function App(appContainer) {
	this._appContainer = appContainer;
	this._renderer = new Renderer(appContainer);

	//do some network stuff here

	this._init();
}

App.prototype._init = function() {
	//check if we have a scene
	if(GameService.scene === null && GameService.loggedIn === true) {
		//load a scene
		GameService.loadScene(new SceneTypes.WORLD_SCENE, this._appContainer);
	}

	this._renderer.start();
}

module.exports = App;