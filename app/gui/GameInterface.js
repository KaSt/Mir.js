var GameService = require('../services/GameService.js');

function GameInterface(appContainer) {
	this._appContainer = appContainer;

	this._gameInterfaceContainer = null;
	this._bottomInterface = null;

	this._init();
}

GameInterface.prototype._init = function() {
	this._gameInterfaceContainer = document.createElement('div');
	this._gameInterfaceContainer.id = "game-interface-container";

	this._appContainer.appendChild(this._gameInterfaceContainer);

	this._bottomInterface = document.createElement('div');
	this._bottomInterface.id = "bottom-interface";

	this._gameInterfaceContainer.appendChild(this._bottomInterface);
}

module.exports = GameInterface;