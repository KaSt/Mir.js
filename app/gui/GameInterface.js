var GameService = require('../services/GameService.js');
var PathObserver = require('../../observe-js.js').PathObserver;

function GameInterface(appContainer) {
	this._appContainer = appContainer;

	this._gameInterfaceContainer = null;
	this._bottomInterface = null;
	this._miniMapContainer = null;
	this._chatContainer = null;
	this._coordsLabel = null;
	this._debugLabel = null;
	this._levelLabel = null;
	this._hpMpLabel = null;
	this._hpBar = null;
	this._mpBar = null;
	this._expBar = null;

	this._init();
}

GameInterface.prototype._init = function() {
	this._gameInterfaceContainer = document.createElement('div');
	this._gameInterfaceContainer.id = "game-interface-container";

	this._appContainer.appendChild(this._gameInterfaceContainer);

	this._initBottomInterface();
	if(GameService.debug.enabled === true) {
		this._initDebugLabel();
	}
	this._initCoordsLabel();
	this._initMiniMapContainer();
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

	this._initExpBar();
	this._initHpBar();
	this._initMpBar();
}

GameInterface.prototype._initExpBar = function() {
	this.expBar = document.createElement('div');
	this.expBar.id = "exp-bar";

	var updateBar = function() {

		this.expBar.style.width = Math.round(GameService.player.exp / GameService.player.maxExp * 536) + "px";

	}.bind(this);

	var observePlayerExpChange = new PathObserver(GameService, 'player.exp');
	var observePlayerMaxExpChange = new PathObserver(GameService, 'player.maxExp');	

	observePlayerExpChange.open(updateBar);
	observePlayerMaxExpChange.open(updateBar);		

	updateBar();

	this._bottomInterface.appendChild(this.expBar);
}

GameInterface.prototype._initChatContainer = function() {
	this._chatContainer = document.createElement('div');
	this._chatContainer.id = "chat-container";

	this._bottomInterface.appendChild(this._chatContainer);
}

GameInterface.prototype._initMiniMapContainer = function() {
	this._miniMapContainer = document.createElement('div');
	this._miniMapContainer.id = "mini-map-container";

	var minimapFrame = document.createElement('div');
	minimapFrame.id = "frame";

	var minimapMap = document.createElement('div');
	minimapMap.id = "map";
	minimapMap.style.backgroundImage = "url('gui/minimap/0.jpg')";


	var updateMapPosition = function() {
		var positionX = Math.round(GameService.player.x / GameService.scene.getMap().getWidth() * 1052) - 85;
		var positionY = Math.round(GameService.player.y / GameService.scene.getMap().getHeight() * 699) - 85;

		minimapMap.style.backgroundPosition = "-" + positionX + "px -" + positionY + "px";
	}.bind(this);

	var observePlayerXChange = new PathObserver(GameService, 'player.x');
	var observePlayerYChange = new PathObserver(GameService, 'player.y');	

	observePlayerXChange.open(updateMapPosition);
	observePlayerYChange.open(updateMapPosition);	

	updateMapPosition();

	this._miniMapContainer.appendChild(minimapMap);
	this._miniMapContainer.appendChild(minimapFrame);
	this._gameInterfaceContainer.appendChild(this._miniMapContainer);
}

GameInterface.prototype._initHpBar = function() {
	this._hpBar = document.createElement('div');
	this._hpBar.id = "hp-bar";
	

	var updateHpBar = function() {
		this._hpBar.style.height = parseInt(GameService.player.hp / GameService.player.maxHp * 102) + 'px';
	}.bind(this);

	var observePlayerHpChange = new PathObserver(GameService, 'player.hp');

	observePlayerHpChange.open(updateHpBar);

	updateHpBar();

	this._bottomInterface.appendChild(this._hpBar);
}

GameInterface.prototype._initMpBar = function() {
	this._mpBar = document.createElement('div');
	this._mpBar.id = "mp-bar";
	
	var updateMpBar = function() {
		this._mpBar.style.height = parseInt(GameService.player.mp / GameService.player.maxMp * 102) + 'px';
	}.bind(this);

	var observePlayerMpChange = new PathObserver(GameService, 'player.mp');

	observePlayerMpChange.open(updateMpBar);

	updateMpBar();

	this._bottomInterface.appendChild(this._mpBar);
}


GameInterface.prototype._initCoordsLabel = function() {
	//Cords label
	this._coordsLabel = document.createElement('div');
	this._coordsLabel.id = "coords-label";

	var updateLabelText = function() {
		this._coordsLabel.innerHTML = '<span>' + GameService.map.name + '</span><em>' + GameService.player.x + ':' + GameService.player.y + '</em>';	
	}.bind(this);

	var observePlayerXChange = new PathObserver(GameService, 'player.x');
	var observePlayerYChange = new PathObserver(GameService, 'player.y');

	observePlayerXChange.open(updateLabelText);
	observePlayerYChange.open(updateLabelText);

	//update label
	updateLabelText();

	this._gameInterfaceContainer.appendChild(this._coordsLabel);
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