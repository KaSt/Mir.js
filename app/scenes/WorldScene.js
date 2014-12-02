var Stage = require('pixi/display/Stage');
var LoaderService = require('../services/LoaderService.js');
var GameService = require('../services/GameService.js');

function WorldScene(appContainer) {
	this._appContainer = appContainer;
	this._stage = new Stage();
	this._map = null;
	this._isLoadingMap = false;
}

WorldScene.prototype.init = function() {
	this._initGui();
}

WorldScene.prototype.process = function() {
	return new Promise(function(resolve, reject) {

		//if we have no map, lets show the loading screen with info on loading map
		if(this._map === null && this._isLoadingMap === false) {
			this._loadMap();
		}

		resolve(this._stage);
	}.bind(this));
}

WorldScene.prototype._loadMap = function() {
	this._isLoadingMap = true;
	LoaderService.loadMap(GameService.player.map)
		.then(function(map) {
			this._map = map;
			this._isLoadingMap = false;
		}.bind(this));
}

WorldScene.prototype._initGui = function() {
	//init GUI?
}

WorldScene.prototype.getStage = function() {
	return this._stage;
}

WorldScene.prototype.hide = function() {
	return Promise.resolve();
}

WorldScene.prototype.show = function() {
	return Promise.resolve();
}

module.exports = WorldScene;