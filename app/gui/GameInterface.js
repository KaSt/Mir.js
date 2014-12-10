var GameService = require('../services/GameService.js');
var PathObserver = require('../../observe-js.js').PathObserver;

function GameInterface(appContainer) {
	this._appContainer = appContainer;

	this._gameInterfaceContainer = null;
	this._bottomInterface = null;
	this._hpMpContainer = null;
	this._chatContainer = null;
	this._coordsLabel = null;
	this._debugLabel = null;
	this._levelLabel = null;
	this._hpMpLabel = null;
	this._hpBar = null;
	this._mpBar = null;

	this._init();
}

GameInterface.prototype._init = function() {
	this._gameInterfaceContainer = document.createElement('div');
	this._gameInterfaceContainer.id = "game-interface-container";

	this._appContainer.appendChild(this._gameInterfaceContainer);

	this._initBottomInterface();
	this._initDebugLabel();
}

GameInterface.prototype._initDebugLabel = function() {
	//Cords label
	this._debugLabel = document.createElement('div');
	this._debugLabel.id = "debug-label";

	var updateLabelText = function() {
		this._debugLabel.innerHTML = 'Debug: ' + GameService.debug.x + ' ' + GameService.debug.y;
	}.bind(this);

	var observeDebugXChange = new PathObserver(GameService, 'debug.x');
	var observeDebugYChange = new PathObserver(GameService, 'debug.y');

	observeDebugXChange.open(updateLabelText);
	observeDebugYChange.open(updateLabelText);

	//update label
	updateLabelText();

	this._appContainer.appendChild(this._debugLabel);
}

GameInterface.prototype._initBottomInterface = function() {

	this._bottomInterface = document.createElement('div');
	this._bottomInterface.id = "bottom-interface";
	this._bottomInterface.excludeFromInput = true;

	this._gameInterfaceContainer.appendChild(this._bottomInterface);

	this._initCoordsLabel();
	this._initLevelLabel();
	this._initHpMpContainer();
	this._initChatContainer();
}

GameInterface.prototype._initChatContainer = function() {
	this._chatContainer = document.createElement('div');
	this._chatContainer.id = "chat-container";

	this._bottomInterface.appendChild(this._chatContainer);
}

GameInterface.prototype._initHpMpContainer = function() {
	this._hpMpContainer = document.createElement('div');
	this._hpMpContainer.id = "hp-mp-container";

	this._bottomInterface.appendChild(this._hpMpContainer);

	this._initHpMpLabel();
	this._initHpBar();
	this._initMpBar();
}

GameInterface.prototype._initHpBar = function() {
	this._hpBar = document.createElement('div');
	this._hpBar.id = "hp-bar";
	

	var updateHpBar = function() {
		this._hpBar.style.height = parseInt(GameService.player.hp / GameService.player.maxHp * 94);
	}.bind(this);

	var observePlayerHpChange = new PathObserver(GameService, 'player.hp');

	this._hpMpContainer.appendChild(this._hpBar);
	observePlayerHpChange.open(updateHpBar);

	updateHpBar();
}

GameInterface.prototype._initMpBar = function() {
	this._mpBar = document.createElement('div');
	this._mpBar.id = "mp-bar";
	

	var updateMpBar = function() {
		this._mpBar.style.height = parseInt(GameService.player.mp / GameService.player.maxMp * 94);
	}.bind(this);

	var observePlayerMpChange = new PathObserver(GameService, 'player.mp');

	this._hpMpContainer.appendChild(this._mpBar);
	observePlayerMpChange.open(updateMpBar);

	updateMpBar();
}

GameInterface.prototype._initHpMpLabel = function() {
	//Cords label
	this._hpMpLabel = document.createElement('div');
	this._hpMpLabel.id = "hp-mp-label";

	var updateLabelText = function() {
		this._hpMpLabel.innerHTML = '<span>' + GameService.player.hp + '/' + GameService.player.maxHp + '</span>'
								  + '<span>' + GameService.player.mp + '/' + GameService.player.maxMp + '</span>';
	}.bind(this);

	var observePlayerHpChange = new PathObserver(GameService, 'player.hp');
	var observePlayerMpChange = new PathObserver(GameService, 'player.mp');

	observePlayerHpChange.open(updateLabelText);
	observePlayerMpChange.open(updateLabelText);

	//update label
	updateLabelText();

	this._hpMpContainer.appendChild(this._hpMpLabel);
}

GameInterface.prototype._initCoordsLabel = function() {
	//Cords label
	this._coordsLabel = document.createElement('div');
	this._coordsLabel.id = "coords-label";

	var updateLabelText = function() {
		this._coordsLabel.innerHTML = GameService.map.name + ' ' + GameService.player.x + ':' + GameService.player.y;	
	}.bind(this);

	var observePlayerXChange = new PathObserver(GameService, 'player.x');
	var observePlayerYChange = new PathObserver(GameService, 'player.y');

	observePlayerXChange.open(updateLabelText);
	observePlayerYChange.open(updateLabelText);

	//update label
	updateLabelText();

	this._bottomInterface.appendChild(this._coordsLabel);
}

GameInterface.prototype._initLevelLabel = function() {
	//Cords label
	this._levelLabel = document.createElement('div');
	this._levelLabel.id = "level-label";

	var updateLabelText = function() {
		this._levelLabel.innerHTML = GameService.player.level;
	}.bind(this);

	var observePlayerLevelChange = new PathObserver(GameService, 'player.level');

	observePlayerLevelChange.open(updateLabelText);

	//update label
	updateLabelText();

	this._bottomInterface.appendChild(this._levelLabel);
}

module.exports = GameInterface;