var GameService = require('./services/GameService.js');
var ScenesEnum = require('./scenes/ScenesEnum.js');

function App(appContainer) {
	this._appContainer = appContainer;

	//do some network stuff here

	this._init();
}

App.prototype._init = function() {
	//check if we have a scene
	if(GameService.scene === null && GameService.loggedIn === true) {
		//load a scene
		GameService.loadScene(ScenesEnum.WORLD_SCENE);
	}
}

module.exports = App;