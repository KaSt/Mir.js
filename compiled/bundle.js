(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
		GameService.loadScene(new SceneTypes.WORLD_SCENE(this._appContainer));
	}

	this._renderer.start();
}

module.exports = App;
},{"./Renderer.js":2,"./scenes/SceneTypes.js":11,"./services/GameService.js":13}],2:[function(require,module,exports){
var GameService = require('./services/GameService.js');
var PIXI = require('pixi.js');
require('../fpsmeter.min.js');

function Renderer(appContainer) {
	this._stopped = false;
	this._renderer = null;
	this._appContainer = appContainer;
	this._init();
	this._fpsMeter = new FPSMeter();
}

Renderer.prototype._init = function() {
	this._renderer = new PIXI.WebGLRenderer(1024, 768);
	this._appContainer.appendChild(this._renderer.view);
	this._render();
}

Renderer.prototype._render = function() {

	var loop = function loop() {
		var scene = GameService.scene;

		this._fpsMeter.tickStart();

		if(this._stopped === true) {
			return;
		}

		if(scene !== null && scene.isLoadingMap() === false) {
			scene.checkInputs();
			scene.updateAnimations();
			this._renderer.render(scene.getStage());
		};

		this._fpsMeter.tick();

		requestAnimationFrame(loop.bind(this));

	}.bind(this);

	requestAnimationFrame(loop.bind(this));
}


Renderer.prototype.start = function() {
	this._stopped = false;
}

Renderer.prototype.end = function() {
	this._stopped = true;
}

module.exports = Renderer;
},{"../fpsmeter.min.js":20,"./services/GameService.js":13,"pixi.js":21}],3:[function(require,module,exports){

function AnimationControl(action, direction, beginEvent, newFrameEvent, animationCompleteEvent) {
	this._direction = direction;
	this._action = action;
	this._newFrameEvent = newFrameEvent;
	this._beginEvent = beginEvent;
	this._animationCompleteEvent = animationCompleteEvent;
}

AnimationControl.prototype.getAction = function() {
	return this._action;
}

AnimationControl.prototype.getDirection = function() {
	return this._direction;
}

AnimationControl.prototype.getNewFrameEvent = function() {
	return this._newFrameEvent;
}

AnimationControl.prototype.getBeginEvent = function() {
	return this._beginEvent;
}

AnimationControl.prototype.getAnimationCompleteEvent = function() {
	return this._animationCompleteEvent;
}

module.exports = AnimationControl;
},{}],4:[function(require,module,exports){

var DirectionEnum = {
    North: 0,
    NorthEast: 1,
    East: 2,
    SouthEast: 3,
    South: 4,
    SouthWest: 5,
    West: 6,
    NorthWest: 7
}

module.exports = DirectionEnum;

},{}],5:[function(require,module,exports){

var HumanActionEnum = {
    Standing: 0,
    Walking: 1,
    Running: 2,
    Pushed: 3,
    DashL: 4,
    DashR: 5,
    DashFail: 6,
    Stance: 7,
    Stance2: 8,
    Attack1: 9,
    Attack2: 10,
    Attack3: 11,
    Attack4: 12,
    AttackRange1: 13,
    AttackRange2: 14,
    AttackRange3: 15,
    Special: 16,
    Struck: 17,
    Harvest: 18,
    Spell: 19,
    Die: 20,
    Dead: 21,
    Skeleton: 22,
    Show: 23,
    Hide: 24,
    Stoned: 25,
    Appear: 26,
    Revive: 27,
    SitDown: 28,
    Mine: 29,

    WalkingBow: 30,
    RunningBow: 31,
    Jump: 32,

    MountStanding: 33,
    MountWalking: 34,
    MountRunning: 35,
    MountStruck: 36,
    MountAttack: 37,

    FishingCast: 38,
    FishingWait: 39,
    FishingReel: 40	

}

module.exports = HumanActionEnum;
},{}],6:[function(require,module,exports){
var GameService = require('../services/GameService.js');
var PathObserver = require('../../observe-js.js').PathObserver;

function GameInterface(appContainer) {
	this._appContainer = appContainer;

	this._gameInterfaceContainer = null;
	this._bottomInterface = null;
	this._hpMpContainer = null;
	this._chatContainer = null;
	this._coordsLabel = null;
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
}

GameInterface.prototype._initBottomInterface = function() {

	this._bottomInterface = document.createElement('div');
	this._bottomInterface.id = "bottom-interface";
	this._bottomInterface.excludeFromInput = true;

	this._gameInterfaceContainer.appendChild(this._bottomInterface);

	this._initCoordsLabel();
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

module.exports = GameInterface;
},{"../../observe-js.js":22,"../services/GameService.js":13}],7:[function(require,module,exports){
var ResourceService = require('../services/ResourceService.js');

var addPathNamePadding = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function Map(width, height) {
	this._mapCells = [];
	this._width = width;
	this._height = height;
}

Map.prototype.setMapCell = function(mapCell, x, y) {
	if(this._mapCells[x] == null) {
		this._mapCells[x] = [];
	}
	this._mapCells[x][y] = mapCell;
}

Map.prototype.getMapCells = function() {
	return this._mapCells;
}

Map.prototype.getMapCell = function(x, y) {
	return this._mapCells[x][y];
}

Map.prototype.getWidth = function() {
	return this._width;
}

Map.prototype.getHeight = function() {
	return this._height;
}

Map.prototype.clearSprites = function() {
    for (var x = 0; x < this._width; x++) {
        for (var y = 0; y < this._height; y++) {
        	this._mapCells[x][y].clearSprite();
      	}
	}
}

Map.prototype.getBackImageUrl = function(mapCell) {
	var index = (mapCell.backImage & 0x1FFFF) - 1;

	if(index < 0) {
		return null;
	}

    if(mapLib === null) {
        return null;
    }    

	var indexString = addPathNamePadding(index, 6),
		mapLib = ResourceService.graphics.mapLib(mapCell.backIndex);

	return mapLib.path + "/" + indexString + "." + mapLib.type;
}

Map.prototype.getMiddleImageUrl = function(mapCell) {
	var index = mapCell.middleImage - 1;

	if(index < 0) {
		return null;
	}

    if(mapLib === null) {
        return null;
    }    

	var indexString = addPathNamePadding(index, 6),
		mapLib = ResourceService.graphics.mapLib(mapCell.middleIndex);

	return mapLib.path + "/" + indexString + "." + mapLib.type;
}

Map.prototype.getFrontImageUrlAndPlacements = function(mapCell) {
    var index = mapCell.frontImage - 1;

    if(index < 0) {
        return null;
    }

    var indexString = addPathNamePadding(index, 6),
        mapLib = ResourceService.graphics.mapLib(mapCell.frontIndex);

    if(mapLib === null) {
        return null;
    }

    return {
    	url: mapLib.path + "/" + indexString + "." + mapLib.type,
    	placements: mapLib.path,
    	index: index
    }
}

Map.prototype.clearSprite = function(mapCell) {
	mapCell.backSprite = null;
	mapCell.middleSprite = null;
    mapCell.frontSprite = null;
}

Map.prototype.getTotalSprites = function() {
	var total = 0,
		mapCell = null;

    for (var x = 0; x < this._width; x++) {
        for (var y = 0; y < this._height; y++) {
        	mapCell = this._mapCells[x][y];

        	if(mapCell.backSprite !== null) {
        		total++;
        	}
        	if(mapCell.middleSprite !== null) {
        		total++;
        	}
        	if(mapCell.frontSprite !== null) {
        		total++;
        	}
      	}
	}	
	return total;
}

module.exports = Map;
},{"../services/ResourceService.js":16}],8:[function(require,module,exports){
var Map = require('./Map.js');

function MapReader(dataBuffer) {
	this._dataBuffer = dataBuffer;
}

MapReader.prototype.loadMap = function() {

	//wemade mir3 maps have no title they just start with blank bytes
    if (this._dataBuffer.getInt8(0) === 0) {
        return this._loadMapType5();
    }

    //shanda mir3 maps start with title: (C) SNDA, MIR3.
    if ((this._dataBuffer.getInt8(0) === 0x0F) 
        && (this._dataBuffer.getInt8(5) === 0x53) 
        && (this._dataBuffer.getInt8(14) === 0x33)) {
        return this._loadMapType6();
    }

    //wemades antihack map (laby maps) title start with: Mir2 AntiHack
    if ((this._dataBuffer.getInt8(0) === 0x15) 
        && (this._dataBuffer.getInt8(4) === 0x32) 
        && (this._dataBuffer.getInt8(6) === 0x41) 
        && (this._dataBuffer.getInt8(19) === 0x31)) {
        return this._loadMapType4();
    }

    //wemades 2010 map format i guess title starts with: Map 2010 Ver 1.0
    if ((this._dataBuffer.getInt8(0) === 0x10) 
        && (this._dataBuffer.getInt8(2) === 0x61) 
        && (this._dataBuffer.getInt8(7) === 0x31) 
        && (this._dataBuffer.getInt8(14) === 0x31)) {
        return this._loadMapType1();
    }

    //shanda's 2012 format and one of shandas(wemades) older formats share same header info, only difference is the filesize
    if ((this._dataBuffer.getInt8(4) === 0x0F) 
        && (this._dataBuffer.getInt8(18) === 0x0D) 
        && (this._dataBuffer.getInt8(19) === 0x0A)) {
        var w = this._dataBuffer.getUint8(0) + (this._dataBuffer.getUint8(1) << 8),
            h = this._dataBuffer.getUint8(2) + (this._dataBuffer.getUint8(3) << 8);

        if (this._dataBuffer.byteLength > (52 + (w * h * 14))) {
            return this._loadMapType3();
        } else {
            return this._loadMapType2(w, h);
        }
    }

    //3/4 heroes map format (myth/lifcos i guess)
    if ((this._dataBuffer.getInt8(0) === 0x0D) 
        && (this._dataBuffer.getInt8(1) === 0x4C) 
        && (this._dataBuffer.getInt8(7) === 0x20) 
        && (this._dataBuffer.getInt8(11) === 0x6D)) {
        return this._loadMapType7();
    }
    //if it's none of the above load the default old school format
    return this._loadMapType0();    
}

MapReader.prototype._loadMapType0 = function() {
}

MapReader.prototype._loadMapType1 = function() {
}

MapReader.prototype._loadMapType2 = function(width, height) {
    var map = new Map(width, height);

    //now popular the map's cells
    var offset = 52;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var mapCell = {};           

            mapCell.backImage = this._dataBuffer.getInt16(offset, true);
            offset += 2;
            mapCell.middleImage = this._dataBuffer.getInt16(offset, true);
            offset += 2;
            mapCell.frontImage = this._dataBuffer.getInt16(offset, true);
            offset += 2;
            mapCell.doorIndex = this._dataBuffer.getInt8(offset++);
            mapCell.doorOffset = this._dataBuffer.getInt8(offset++);
            mapCell.frontAnimationFrame = this._dataBuffer.getInt8(offset++);
            mapCell.frontAnimationTick = this._dataBuffer.getInt8(offset++);
            mapCell.frontIndex = this._dataBuffer.getInt8(offset++) + 120;
            mapCell.light = this._dataBuffer.getInt8(offset++);
            mapCell.backIndex = this._dataBuffer.getInt8(offset++) + 100;
            mapCell.middleIndex = this._dataBuffer.getInt8(offset++) + 110;

            mapCell.middleAnimationFrame = null;
            mapCell.middleAnimationTick = null;

            mapCell.tileAnimationImage = null;
            mapCell.tileAnimationOffset = null;
            mapCell.tileAnimationFrames = null;

            mapCell.backSprite = null;
            mapCell.middleSprite = null;
            mapCell.frontSprite = null;      

            mapCell.unknown;            

            if ((mapCell.backImage & 0x8000) !== 0) {
                mapCell.collision = true;
                mapCell.backImage = (mapCell.backImage & 0x7FFF) | 0x20000000;
            } else {
                mapCell.collision = false;
            }

            map.setMapCell(mapCell, x, y);
    	}
	}	

    return map;	
}

MapReader.prototype._loadMapType3 = function() {
}

MapReader.prototype._loadMapType4 = function() {
}

MapReader.prototype._loadMapType5 = function() {
}


module.exports = MapReader;
},{"./Map.js":7}],9:[function(require,module,exports){
var NpcSprite = require('../sprites/NpcSprite.js');

function Npc( data ) {
	this.name = data.name || null;
	this.look = data.look !== null ? data.look : null;
	this.id = data.id !== null ? data.id : null;
	this.x = data.x !== null ? data.x : null;
	this.y = data.y !== null ? data.y : null;
	this.npcSprite = null;
}

Npc.prototype.initNpcSprite = function(scene) {
	//make the human sprite for the player
	this.npcSprite = new NpcSprite(scene, {
		z: this.y,
		look: this.look
	});
}

Npc.prototype.setLocation = function(x, y) {
	this.x = x;
	this.y = y;
	this.npcSprite.setZ(y);	
}

Npc.prototype.update = function() {
	this.npcSprite.update();
}


module.exports = Npc
},{"../sprites/NpcSprite.js":18}],10:[function(require,module,exports){
var HumanSprite = require('../sprites/HumanSprite.js');
var HumanActionEnum = require('../enums/HumanActionEnum.js');
var AnimationControl = require('../animations/AnimationControl.js');

function Player( data ) {
	this.name = data.name || null;
	this.level = data.level || null;
	this.exp = data.exp !== null ? data.exp : null;
	this.x = data.x !== null ? data.x : null;
	this.y = data.y !== null ? data.y : null;
	this.virtualX = data.x !== null ? data.x : null;
	this.virtualY = data.y !== null ? data.y : null;

	this.direction = data.direction !== null ? data.direction : null;
	this.hp = data.hp !== null ? data.hp : null;
	this.mp = data.mp !== null ? data.mp : null;
	this.maxHp = data.maxHp !== null ? data.maxHp : null;
	this.maxMp = data.maxMp !== null ? data.maxMp : null;
	this.bag = data.bag || [];
	this.equiped = data.equiped || {};
	this.humanSprite = null;
}

Player.prototype.initHumanSprite = function(scene) {
	//make the human sprite for the player
	this.humanSprite = new HumanSprite(scene, {
		z: this.y,
		direction: this.direction,
		look: 0
	});
}

Player.prototype.setLocation = function(x, y) {
	this.x = x;
	this.y = y;
	this.humanSprite.setZ(y);	
}

Player.prototype.setZ = function(z) {
	this.humanSprite.setZ(z);	
}

Player.prototype.setVirtualLocation = function(diffX, diffY) {
	this.virtualX = this.virtualX + diffX;
	this.virtualY = this.virtualY + diffY;
}

Player.prototype.update = function() {
	this.humanSprite.update();
}

Player.prototype.move = function(distance, direction, beginMoveCallback, cameraMoveCallback, doneCallback, inputReadyCallback) {
	//first we check we can move there
	this.humanSprite.queueAnimation(new AnimationControl(
		distance === 1 ? HumanActionEnum.Walking : HumanActionEnum.Running,
		direction,
		function(beginMoveCallback) {
			beginMoveCallback();
		}.bind(this, beginMoveCallback),
		function(cameraMoveCallback, inputReadyCallback, _animationCameraFrame) {
			cameraMoveCallback(distance / 8);
			if(_animationCameraFrame === 2) {
				inputReadyCallback();
			}
		}.bind(this, cameraMoveCallback, inputReadyCallback),
		function(doneCallback) {
			doneCallback();
		}.bind(this, doneCallback)
	));
}

module.exports = Player
},{"../animations/AnimationControl.js":3,"../enums/HumanActionEnum.js":5,"../sprites/HumanSprite.js":17}],11:[function(require,module,exports){
var WorldScene = require('./WorldScene.js');

var SceneTypes = {
	LOGIN_SCENE: null,
	CHAR_SELECT_SCENE: null,
	WORLD_SCENE: WorldScene
};

module.exports = SceneTypes;
},{"./WorldScene.js":12}],12:[function(require,module,exports){
var LoaderService = require('../services/LoaderService.js');
var GameService = require('../services/GameService.js');
var ResourceService = require('../services/ResourceService.js');
var InputService = require('../services/InputService.js');
var DirectionEnum = require('../enums/DirectionEnum.js');
var GameInterface = require('../gui/GameInterface.js');
var PIXI = require('pixi.js');

function depthCompare(a,b) {
	if (a.z < b.z) {
	 return -1;
	}
	if (a.z > b.z) {
		return 1;
	}
	return 0;
}

function WorldScene(appContainer) {
	this._appContainer = appContainer;
	this._stage = new PIXI.Stage();
	this._map = null;
	this._isLoadingMap = false;
	this._gameOffSetX = null;
	this._gameOffSetY = null;
	this._tileLayer = new PIXI.DisplayObjectContainer();
	this._smTileLayer = new PIXI.DisplayObjectContainer();
	this._objTileLayer = new PIXI.DisplayObjectContainer();
	this._lastProcessedX = null;
	this._lastProcessedY = null;
	this._cameraDeltaX = 0;
	this._cameraDeltaY = 0;
	this._topBound = null;
	this._leftBound = null;
	this._rightBound = null;
	this._bottomBound = null;
	this._graphicsPlacements = [];
	this._readyForInput = false;
	this._mainPlayer = GameService.player;
	this._gameInterface = null;
}

WorldScene.prototype.init = function() {
	var defaults = GameService.defaults;
	this._gameOffSetX = defaults.screenWidth / 2;
    this._gameOffSetY = defaults.screenHeight / 2 - 48;

    //add
    this._stage.addChild(this._tileLayer);
    this._stage.addChild(this._smTileLayer);
    this._stage.addChild(this._objTileLayer);

    this._gameInterface = new GameInterface(this._appContainer);

	this._initGui();
	this._enableInput();
	this._initObjects();

	//load the placements and the starting map
	this._loadGraphicsPlacements()
		.then(this._loadMap.bind(this))
		.then(function(map) {
			this._map = map;
			this._lastProcessedX = this._mainPlayer.x;
			this._lastProcessedY = this._mainPlayer.y;	
			this._readyForInput = true;
			this._updateCamera(0, 0);		
			this._isLoadingMap = false;
		}.bind(this));
}

WorldScene.prototype._initObjects = function() {
	//init the sprites for our objects
	this._mainPlayer.initHumanSprite(this);
	for(var i = 0; i < GameService.npcs.length; i++) {
		GameService.npcs[i].initNpcSprite(this);
	}
}

WorldScene.prototype._enableInput = function() {
	//InputService.on('pressed left', this._moveLeft.bind(this), true);
	//InputService.on('pressed right', this._moveRight.bind(this), true);
	//InputService.on('pressed up', this._moveUp.bind(this), true);
	//InputService.on('pressed down', this._moveDown.bind(this), true);
}

WorldScene.prototype._moveNorthWest = function(distance) {
	if(this._readyForInput === true && this.checkCollision(-distance, -distance) === false) {
		this._readyForInput = false;
		this._mainPlayer.setVirtualLocation(-distance, -distance);
	
		this._mainPlayer.move(distance, 7, function begin() {
			//do nothing
		}.bind(this), function cameraMove(value) {
			this._updateCameraOffset(-value, -value);
		}.bind(this), function done() {
			this._updateCamera(-distance, -distance);
		}.bind(this), function inputReady() {
			this._readyForInput = true;
		}.bind(this));
	}
}


WorldScene.prototype._moveWest = function(distance) {
	if(this._readyForInput === true && this.checkCollision(-distance, 0) === false) {
		this._readyForInput = false;
		this._mainPlayer.setVirtualLocation(-distance, 0);
	
		this._mainPlayer.move(distance, 6, function begin() {
			//do nothing
		}.bind(this), function cameraMove(value) {
			this._updateCameraOffset(-value, 0);
		}.bind(this), function done() {
			this._updateCamera(-distance, 0);
		}.bind(this), function inputReady() {
			this._readyForInput = true;
		}.bind(this));
	}
}

WorldScene.prototype._moveEast = function(distance) {
	if(this._readyForInput === true && this.checkCollision(distance, 0) === false) {
		this._readyForInput = false;
		this._mainPlayer.setVirtualLocation(distance, 0);
	
		this._mainPlayer.move(distance, 2, function begin() {
			//do nothing
		}.bind(this), function cameraMove(value) {
			this._updateCameraOffset(value, 0);
		}.bind(this), function done() {
			this._updateCamera(distance, 0);
		}.bind(this), function inputReady() {
			this._readyForInput = true;
		}.bind(this));
	}
}

WorldScene.prototype._moveNorth = function(distance) {
	if(this._readyForInput === true && this.checkCollision(0, -distance) === false) {
		this._readyForInput = false;
		this._mainPlayer.setVirtualLocation(0, -distance);
	
		this._mainPlayer.move(distance, 0, function begin() {
			//do nothing
		}.bind(this), function cameraMove(value) {
			this._updateCameraOffset(0, -value);
		}.bind(this), function done() {
			this._updateCamera(0, -distance);
		}.bind(this), function inputReady() {
			this._readyForInput = true;
		}.bind(this));
	}
}

WorldScene.prototype._moveNorthEast = function(distance) {
	if(this._readyForInput === true && this.checkCollision(distance, -distance) === false) {
		this._readyForInput = false;
		this._mainPlayer.setVirtualLocation(distance, -distance);
		
		this._mainPlayer.move(distance, 1, function begin() {
			//do nothing
		}.bind(this), function cameraMove(value) {
			this._updateCameraOffset(value, -value);
		}.bind(this), function done() {
			this._updateCamera(distance, -distance);
		}.bind(this), function inputReady() {
			this._readyForInput = true;
		}.bind(this));
	}
}

WorldScene.prototype._moveSouth = function(distance) {
	if(this._readyForInput === true && this.checkCollision(0, distance) === false) {
		this._readyForInput = false;
		this._mainPlayer.setVirtualLocation(0, distance);
		
		this._mainPlayer.move(distance, 4, function begin() {
			this._mainPlayer.setZ(this._mainPlayer.y + distance);
			this._objTileLayer.children.sort(depthCompare);
		}.bind(this), function cameraMove(value) {
			this._updateCameraOffset(0, value);
		}.bind(this), function done() {
			this._updateCamera(0, distance);
		}.bind(this), function inputReady() {
			this._readyForInput = true;
		}.bind(this));
	}
}

WorldScene.prototype._moveSouthWest = function(distance) {
	if(this._readyForInput === true && this.checkCollision(-distance, distance) === false) {
		this._readyForInput = false;
		this._mainPlayer.setVirtualLocation(-distance, distance);
		
		this._mainPlayer.move(distance, 5, function begin() {
			this._mainPlayer.setZ(this._mainPlayer.y + distance);
			this._objTileLayer.children.sort(depthCompare);
		}.bind(this), function cameraMove(value) {
			this._updateCameraOffset(-value, value);
		}.bind(this), function done() {
			this._updateCamera(-distance, distance);
		}.bind(this), function inputReady() {
			this._readyForInput = true;
		}.bind(this));
	}
}

WorldScene.prototype._moveSouthEast = function(distance) {
	if(this._readyForInput === true && this.checkCollision(distance, distance) === false) {
		this._readyForInput = false;
		this._mainPlayer.setVirtualLocation(distance, distance);

		this._mainPlayer.move(distance, 3, function begin() {
			this._mainPlayer.setZ(this._mainPlayer.y + distance);
			this._objTileLayer.children.sort(depthCompare);
		}.bind(this), function cameraMove(value) {
			this._updateCameraOffset(value, value);
		}.bind(this), function done() {
			this._updateCamera(distance, distance);
		}.bind(this), function inputReady() {
			this._readyForInput = true;
		}.bind(this));
	}
}

WorldScene.prototype.checkCollision = function(diffX, diffY) {
	var x, y;

	if(diffX < 0 && diffY == 0) {
		for(distance = diffX; distance < 0; distance++) {
			if(this._checkCollision(distance, 0) === true) {
				return true;
			}
		}
	} else if(diffX > 0 && diffY == 0) {
		for(distance = -diffX; distance < 0; distance++) {
			if(this._checkCollision(-distance, 0) === true) {
				return true;
			}
		}		
	} else if(diffX === 0 && diffY < 0) {
		for(distance = diffY; distance < 0; distance++) {
			if(this._checkCollision(0, distance) === true) {
				return true;
			}
		}		
	} else if(diffX === 0 && diffY > 0) {
		for(distance = -diffY; distance < 0; distance++) {
			if(this._checkCollision(0, -distance) === true) {
				return true;
			}
		}				
	} else if(diffX < 0 && diffY < 0) {
		for(distance = diffX; distance < 0; distance++) {
			if(this._checkCollision(distance, distance) === true) {
				return true;
			}
		}
	} else if(diffX < 0 && diffY > 0) {
		for(distance = diffX; distance < 0; distance++) {
			if(this._checkCollision(distance, -distance) === true) {
				return true;
			}
		}
	} else if(diffX > 0 && diffY < 0) {
		for(distance = diffY; distance < 0; distance++) {
			if(this._checkCollision(-distance, distance) === true) {
				return true;
			}
		}
	}
	return false;
}

WorldScene.prototype._checkCollision = function(x, y) {
	var mapCell = this._map.getMapCell(this._mainPlayer.virtualX + x, this._mainPlayer.virtualY + y),
		npcs = GameService.npcs,
		i = 0;

	if(mapCell.collision) {
		return true;
	}

	//check npcs
	for(i = 0; i < npcs.length; i++) {
		if(this._mainPlayer.virtualX + x === npcs[i].x && this._mainPlayer.virtualY + y === npcs[i].y) {
			return true;
		}
	}	

	return false;
}

WorldScene.prototype._updateCameraOffset = function(diffX, diffY) {
	var defaults = GameService.defaults;

	var moveX = parseInt(defaults.cellWidth * diffX);
	var moveY = parseInt(defaults.cellHeight * diffY);

	this._tileLayer.x = this._tileLayer.x - moveX;
	this._tileLayer.y = this._tileLayer.y - moveY;
	this._smTileLayer.x = this._smTileLayer.x - moveX;
	this._smTileLayer.y = this._smTileLayer.y - moveY;
	this._objTileLayer.x = this._objTileLayer.x - moveX;
	this._objTileLayer.y = this._objTileLayer.y - moveY;

	this._mainPlayer.humanSprite.sprites.x = this._mainPlayer.humanSprite.sprites.x + moveX;
	this._mainPlayer.humanSprite.sprites.y = this._mainPlayer.humanSprite.sprites.y + moveY;
	this._mainPlayer.humanSprite.sprites.z = this._mainPlayer.humanSprite.sprites.z + 0.1; 
}

WorldScene.prototype._updateCamera = function(diffX, diffY) {
	var defaults = GameService.defaults;

	var moveX = parseInt(defaults.cellWidth * diffX);
	var moveY = parseInt(defaults.cellHeight * diffY);

	//move this out eventually
	this._mainPlayer.setLocation(this._mainPlayer.x + diffX, this._mainPlayer.y + diffY);

	this._cameraDeltaX = this._cameraDeltaX + moveX;
	this._cameraDeltaY = this._cameraDeltaY + moveY;

	this._updateBounds();
	this._handleOldSprites();
	this._handleNewSprites();

}

WorldScene.prototype._calculateDirection = function() {
    var fDistanceX = InputService.mouseX - this._gameOffSetX; 
    var fDistanceY = InputService.mouseY - this._gameOffSetY + 64; 

    var n = Math.abs(fDistanceX) + Math.abs(fDistanceY); 

    var fMouseDir; 

    if( ( fDistanceX >= 0 ) & ( fDistanceY >= 0 ) ) fMouseDir = 90 * ( fDistanceY / n ); 
    else 
    if( ( fDistanceX <= 0 ) && ( fDistanceY >= 0 ) ) fMouseDir = -90 * ( fDistanceX / n ) + 90; 
    else 
    if( ( fDistanceX <= 0 ) && ( ( fDistanceY ) <= 0 ) ) fMouseDir = -90 * ( fDistanceY / n ) + 180; 
    else 
        fMouseDir = 90 * ( fDistanceX / n ) + 270; 

    var direction;

    //225  270  315
    //    - - -
    //180 - X - 0
    //    - - -
    //135  90   45

    if( fMouseDir > 315 - 22.5 && fMouseDir < 315 + 22.5  ) { direction = DirectionEnum.NorthEast; } 
    if( fMouseDir > 360 - 22.5 || fMouseDir < 22.5 ) { direction = DirectionEnum.East; } 
    if( fMouseDir > 45 - 22.25 && fMouseDir < 45 + 22.5 ) { direction = DirectionEnum.SouthEast; } 
    if( fMouseDir > 90 - 22.5 && fMouseDir < 90 + 22.5 ) { direction = DirectionEnum.South; } 
    if( fMouseDir > 135 - 22.5 && fMouseDir < 135 + 22.5 ) { direction = DirectionEnum.SouthWest; } 
    if( fMouseDir > 180 - 22.5 && fMouseDir < 180 + 22.5 ) { direction = DirectionEnum.West; } 
    if( fMouseDir > 225 - 22.5 && fMouseDir < 225 + 22.5 ) { direction = DirectionEnum.NorthWest; } 
    if( fMouseDir > 270 - 22.5 && fMouseDir < 270 + 22.5 ) { direction = DirectionEnum.North; } 

    return direction;
}

WorldScene.prototype.checkInputs = function() {
	if(this._readyForInput === true) {
		if(InputService.leftMouseButtonDown === true || InputService.rightMouseButtonDown === true) {
			var direction = this._calculateDirection(),
				distance = InputService.rightMouseButtonDown === true ? 2 : 1;

			switch(direction) {
				case DirectionEnum.North:
					this._moveNorth(distance);
					break;
				case DirectionEnum.NorthEast:
					this._moveNorthEast(distance);
					break;
				case DirectionEnum.East:
					this._moveEast(distance);
					break;
				case DirectionEnum.SouthEast:
					this._moveSouthEast(distance);
					break;
				case DirectionEnum.South:
					this._moveSouth(distance);
					break;
				case DirectionEnum.SouthWest:
					this._moveSouthWest(distance);
					break;
				case DirectionEnum.West:
					this._moveWest(distance);
					break;
				case DirectionEnum.NorthWest:
					this._moveNorthWest(distance);
					break;										
			}
		}
	}
}

WorldScene.prototype.updateAnimations = function() {
	var npcs = GameService.npcs;
	//update main player
	this._mainPlayer.update();
	//update npcs
	for(var i = 0; i < npcs.length; i++) {
		npcs[i].update();
	}	
}

WorldScene.prototype._updateBounds = function() {
	var defaults = GameService.defaults;

	this._topBound = this._mainPlayer.y - defaults.viewRangeY < 0 ? 0 : this._mainPlayer.y - defaults.viewRangeY;
	this._leftBound = this._mainPlayer.x - defaults.viewRangeX < 0 ? 0 : this._mainPlayer.x - defaults.viewRangeX;
	this._rightBound = this._mainPlayer.x + defaults.viewRangeX > this._map.getWidth() - 1 ? this._map.getWidth() - 1 : this._mainPlayer.x + defaults.viewRangeX;
	this._bottomBound = this._mainPlayer.y + defaults.viewRangeY > this._map.getHeight() - 1 ? this._map.getHeight() - 1 : this._mainPlayer.y + defaults.viewRangeY;
}

WorldScene.prototype._handleOldSprites = function() {
	var defaults = GameService.defaults;

	//if we have a different lastProcessed X/Y from now, our player has moved, so we need handle some old tiles
	if(this._lastProcessedX !== null && this._lastProcessedY !== null) {
		if(this._lastProcessedX !== this._mainPlayer.x || this._lastProcessedY !== this._mainPlayer.y) {
			if(this._lastProcessedX > this._mainPlayer.x && this._lastProcessedX < this._rightBound) {
				//player has moved left, so let's clear the far right sprites
				this._clearSpritesFromStage(this._rightBound + 1, this._rightBound + this._lastProcessedX - this._mainPlayer.x, this._topBound, this._bottomBound)
			} else if(this._lastProcessedX < this._mainPlayer.x && this._lastProcessedX > this._leftBound) {
				//player has moved right, so let's clear the far left sprites
				this._clearSpritesFromStage(this._leftBound - this._mainPlayer.x + this._lastProcessedX, this._leftBound - 1, this._topBound, this._bottomBound)
			}

			if(this._lastProcessedY > this._mainPlayer.y && this._lastProcessedY < this._bottomBound) {
				//player has moved up, so let's clear the bottom sprites
				this._clearSpritesFromStage(this._leftBound, this._rightBound, this._bottomBound + 1, this._bottomBound + this._lastProcessedY - this._mainPlayer.y)
			} else if(this._lastProcessedY < this._mainPlayer.y && this._lastProcessedY > this._topBound) {
				//player has moved right, so let's clear the far left sprites
				this._clearSpritesFromStage(this._leftBound, this._rightBound, this._topBound - this._mainPlayer.y + this._lastProcessedY, this._topBound - 1)
			}			

			if (this._lastProcessedX < this._leftBound || this._lastProcessedX > this._rightBound
				|| this._lastProcessedY < this._topBound || this._lastProcessedY > this._bottomBound) {
				//player has completely moved from the last place (new area, teleport)
				this._clearAllSpritesFromStage();
			}

			this._lastProcessedX = this._mainPlayer.x;
			this._lastProcessedY = this._mainPlayer.y;				
		}
	}
}

WorldScene.prototype._clearAllSpritesFromStage = function() {
	this._tileLayer.removeChildren();
	this._smTileLayer.removeChildren();
	this._objTileLayer.removeChildren();
	if(this._map) {
		this._map.clearSprites();
	}
}

WorldScene.prototype._clearSpritesFromStage = function(leftBound, rightBound, topBound, bottomBound) {
	var mapCell;
	if(leftBound < 0) {
		leftBound = 0;
	}
	if(rightBound > this._map.getWidth() - 1) {
		rightBound = this._map.getWidth() - 1;
	}
	if(topBound < 0) {
		topBound = 0;
	}
	if(bottomBound > this._map.getHeight() - 1) {
		bottomBound = this._map.getHeight() - 1;
	}	
	for (var y = topBound; y <= bottomBound; y++) {
		for (var x = leftBound; x <= rightBound; x++) {
			mapCell = this._map.getMapCell(x, y);

			if(mapCell.backSprite !== null) {
				this._tileLayer.removeChild(mapCell.backSprite);
				this._map.clearSprite(mapCell);
			}
			if(mapCell.middleSprite !== null) {
				this._smTileLayer.removeChild(mapCell.middleSprite);
				this._map.clearSprite(mapCell);
			}			

			if(mapCell.frontSprite !== null) {
				this._objTileLayer.removeChild(mapCell.frontSprite);
				this._map.clearSprite(mapCell);
			}					
		}
	}
}

WorldScene.prototype.getMap = function() {
	return this._map;
}

WorldScene.prototype._handleNewSprites = function() {
	var texture = null,
		imageUrl = '',
		imageUrlAndPlacements = {},
		defaults = GameService.defaults,
		drawX = 0,
		drawY = 0,
		mapCell = null,
		placementX = 0,
		placementY = 0,
		x = 0,
		y = 0,
		i = 0,
		npcs = GameService.npcs,
		mobs = GameService.mobs,
		otherPlayers = GameService.otherPlayers,
		npc = null,
		mob = null,
		otherPlayer = null;

	for (y = this._topBound; y <= this._bottomBound; y++) {
		drawY = (y - this._mainPlayer.y) * defaults.cellHeight + this._gameOffSetY + this._cameraDeltaY; //Moving OffSet

	    for (x = this._leftBound; x <= this._rightBound; x++) {
			drawX = (x - this._mainPlayer.x) * defaults.cellWidth + this._gameOffSetX + this._cameraDeltaX; //Moving OffSet
			mapCell = this._map.getMapCell(x, y);

			//handle big tiles
			if(x % 2 === 0 && y % 2 === 0) {
				//if we do not have backSprite for this tile, generate one and store it to the tileLayer
				if(mapCell.backSprite === null && mapCell.backIndex > 0 && mapCell.backImage > 0) {
					getBackImageUrl = this._map.getBackImageUrl(mapCell);
					if(getBackImageUrl !== null) {
						mapCell.backSprite = false;					
						LoaderService.loadTexture(getBackImageUrl)
							.then(this._addBackSprite.bind(this, mapCell, drawX, drawY));
					} else {
						console.log('Failed loading map graphics ' + imageUrl + ' at index: ' + mapCell.backIndex);
					}
				}
			} else if (mapCell.backSprite !== null) {
				this._handleSpriteVisibility(mapCell.backSprite);
			}		

			//middle sprites (sm tiles)
			if(mapCell.middleSprite === null && mapCell.middleIndex > 0 && mapCell.middleImage > 0) {
				imageUrl = this._map.getMiddleImageUrl(mapCell);
				if(imageUrl !== null) {
					mapCell.middleSprite = false;
					LoaderService.loadTexture(imageUrl)
						.then(this._addMiddleSprite.bind(this, mapCell, drawX, drawY));
				} else {
					console.log('Failed loading map graphics ' + imageUrl + ' at index: ' + mapCell.middleIndex);
				}
			} else if (mapCell.middleSprite !== null) {
				this._handleSpriteVisibility(mapCell.middleSprite);
			}

			//top sprites (objects)
			if(mapCell.frontSprite === null && mapCell.frontIndex > 0 && mapCell.frontImage > 0) {
				imageUrlAndPlacements = this._map.getFrontImageUrlAndPlacements(mapCell);
				if(imageUrlAndPlacements !== null) {
					mapCell.frontSprite = false;

					placementX = this._graphicsPlacements[imageUrlAndPlacements.placements][imageUrlAndPlacements.index][0];
					placementY = this._graphicsPlacements[imageUrlAndPlacements.placements][imageUrlAndPlacements.index][1];

					LoaderService.loadTexture(imageUrlAndPlacements.url)
						.then(this._addFrontSprite.bind(
							this, 
							mapCell, 
							drawX + placementX, 
							drawY + placementY,
							y
						));
				} else {
					console.log('Failed loading map graphics ' + imageUrl + ' at index: ' + mapCell.frontIndex);
				}
			} else if (mapCell.frontSprite !== null) {
				this._handleSpriteVisibility(mapCell.frontSprite);
			}		

			//handle main player
			if(this._mainPlayer.x === x && this._mainPlayer.y === y && this._mainPlayer.humanSprite.loaded === false) {
				this._mainPlayer.humanSprite.loaded = true;
				this._mainPlayer.humanSprite.init();
				this._mainPlayer.humanSprite.sprites.x = drawX;
				this._mainPlayer.humanSprite.sprites.y = drawY - defaults.cellHeight * 2;
				this._objTileLayer.addChild(this._mainPlayer.humanSprite.sprites);
			}

			//handle Npcs
			for(i = 0; i < npcs.length; i++) {
				npc = npcs[i];
				if(npc.x === x & npc.y === y && npc.npcSprite.loaded === false) {
					npc.npcSprite.loaded = true;
					npc.npcSprite.init();
					npc.npcSprite.sprites.x = drawX;
					npc.npcSprite.sprites.y = drawY  - defaults.cellHeight * 2;
					this._objTileLayer.addChild(npc.npcSprite.sprites);
				}
			}
	    }
	}

	//handle layer order for objects
	this._objTileLayer.children.sort(depthCompare);
}

WorldScene.prototype._handleSpriteVisibility = function(sprite) {
	var defaults = GameService.defaults;

	if(sprite.x - this._cameraDeltaX > defaults.screenWidth + (defaults.cellWidth * 3)) {
		sprite.visible = false;
	} else if(sprite.x + sprite.width - this._cameraDeltaX < (defaults.cellWidth * -3)) {
		sprite.visible = false;
	} else if(sprite.y + sprite.height - this._cameraDeltaY < (defaults.cellheight * -3)) {
		sprite.visible = false;
	} else if(sprite.y - this._cameraDeltaY > defaults.screenHeight + (defaults.cellheight * 5)) {
		sprite.visible = false;
	} else {
		sprite.visible = true;
	}
}

WorldScene.prototype._addBackSprite = function(mapCell, drawX, drawY, texture){
	mapCell.backSprite = new PIXI.Sprite(texture);
	mapCell.backSprite.x = drawX + 7;
	mapCell.backSprite.y = drawY - texture.height;
	this._tileLayer.addChild(mapCell.backSprite);	
}

WorldScene.prototype._addMiddleSprite = function(mapCell, drawX, drawY, texture){
	mapCell.middleSprite = new PIXI.Sprite(texture);
	mapCell.middleSprite.x = drawX;
	mapCell.middleSprite.y = drawY - texture.height;
	this._smTileLayer.addChild(mapCell.middleSprite);
}

WorldScene.prototype._addFrontSprite = function(mapCell, drawX, drawY, z, texture){
	mapCell.frontSprite = new PIXI.Sprite(texture);
	mapCell.frontSprite.z = z;

	//light source
	if(mapCell.light === 5 && mapCell.frontImage >= 2723 && mapCell.frontImage  <= 2732) {
		mapCell.frontSprite.blendMode = PIXI.blendModes.SCREEN;
		mapCell.frontSprite.y = drawY - texture.height - 44;
		mapCell.frontSprite.x = drawX + 4;
	} else {
		mapCell.frontSprite.y = drawY - texture.height;
		mapCell.frontSprite.x = drawX;
	}
	this._objTileLayer.addChild(mapCell.frontSprite);
}

WorldScene.prototype._loadGraphicsPlacements = function() {
	return new Promise(function(resolve, reject) {
		var total = ResourceService.graphics.placements.length,
			count = 0;
		for(var i = 0; i < total; i++) {
			var placementsName = ResourceService.graphics.placements[i];
			LoaderService.loadGraphicsPlacements(placementsName).then(function(placementsName, placements) {
				this._graphicsPlacements[placementsName] = placements;
				count++

				if(count === total) {
					resolve();
				}
			}.bind(this, placementsName));
		}
	}.bind(this));
}

WorldScene.prototype._loadMap = function() {
	return new Promise(function(resolve, reject) {
		this._isLoadingMap = true;
		this._clearAllSpritesFromStage();
		LoaderService.loadMap(GameService.map.file)
			.then(function(map) {
				resolve(map);
			});
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

WorldScene.prototype.isLoadingMap = function() {
	return this._isLoadingMap;
}

module.exports = WorldScene;
},{"../enums/DirectionEnum.js":4,"../gui/GameInterface.js":6,"../services/GameService.js":13,"../services/InputService.js":14,"../services/LoaderService.js":15,"../services/ResourceService.js":16,"pixi.js":21}],13:[function(require,module,exports){

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
        screenWidth: 1024,
        screenHeight: 768
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
},{}],14:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function InputService() {
	this.leftMouseButtonDown = false;
	this.rightMouseButtonDown = false;
	this.mouseX = 0;
	this.mouseY = 0;
	EventEmitter.call(this);
	window.addEventListener('keydown', this._keyDown.bind(this), true)
	window.addEventListener('mousedown', this._mouseDown.bind(this), true)
	window.addEventListener('mouseup', this._mouseUp.bind(this), true)
	window.addEventListener('mousemove', this._mouseMove.bind(this), true)
	document.addEventListener('contextmenu', function(e) {
    	e.preventDefault();
	}, false);
}

util.inherits(InputService, EventEmitter);

InputService.prototype._keyDown = function(e) {
	switch(e.keyCode) {
		case 37:
			this.emit('pressed left', e.keyCode);
			break;							
		case 38:
			this.emit('pressed up', e.keyCode);
			break;
		case 39:
			this.emit('pressed right', e.keyCode);
			break;				
		case 40:
			this.emit('pressed down', e.keyCode);
			break;								
	}
}

InputService.prototype._mouseDown = function(e) {
	if(!e.target.excludeFromInput || e.target.excludeFromInput === false) {
		switch(e.button) {
			case 0:
				this.leftMouseButtonDown = true;
				this.emit('mousedown left', e.keyCode);
				break;							
			case 2:
				this.rightMouseButtonDown = true;
				this.emit('mousedown right', e.keyCode);
				break;						
		}
	}
}

InputService.prototype._mouseUp = function(e) {
	if(!e.target.excludeFromInput || e.target.excludeFromInput === false) {
		switch(e.button) {
			case 0:
				this.leftMouseButtonDown = false;
				this.emit('mouseup left', e.keyCode);
				break;							
			case 2:
				this.rightMouseButtonDown = false;
				this.emit('mouseup right', e.keyCode);
				break;						
		}
	}
}

InputService.prototype._mouseMove = function(e) {
	if(!e.target.excludeFromInput || e.target.excludeFromInput === false) {
		var x = e.offsetX === undefined ? e.layerX : e.offsetX;
		var y = e.offsetY === undefined ? e.layerY : e.offsetY;

		this.mouseX = x;
		this.mouseY = y;
	} else {
		this.leftMouseButtonDown = false;
		this.rightMouseButtonDown = false;
	}
}

module.exports = new InputService();
},{"events":23,"util":27}],15:[function(require,module,exports){
var MapReader = require('../maps/MapReader.js');
var PIXI = require('pixi.js');

/*

    Aysnc load assets and cache them locally

*/

var asyncLoad = function(fileName, type) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest(),
            path = fileName;

        xhr.open("GET", path, true);
        xhr.responseType = type;
        
        xhr.onload = function (e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                resolve(xhr.response)
            }
            reject();
        };
        xhr.onerror = function (e) {
          reject(new Error(xhr.statusText));
        };
        xhr.send(null);
    });
}

var LoaderService = {
    loadMap: function(mapName) {
        return new Promise(function(resolve, reject) {
            console.log('Loading map ' + mapName);
            asyncLoad("http://mirjs.com/maps/" + mapName + ".map", 'arraybuffer')
                .then(function(arrayBuffer) {
                    var mapReader = new MapReader(new DataView(arrayBuffer));
                    console.log('Loaded map ' + mapName);
                    resolve(mapReader.loadMap());
                    mapReader = null;
                }, function(error) {
                    console.log('Failed to load map ' + mapName);
                    reject(error);
                }).catch(function(e){
                    console.log('Failed to load map ' + mapName);
                    reject(error); 
                });
        });
    },
    loadTexture: function(assetPath) {
        return new Promise(function(resolve, reject) {
            var texture = PIXI.Texture.fromImage("http://mirjs.com/" + assetPath);
            if(texture.baseTexture.hasLoaded) {
                resolve(texture);
            } else {
                texture.on('update', function(texture) {
                    texture.off('update');
                    resolve(texture);
                }.bind(this, texture));
            }
        });
    },
    loadGraphicsPlacements: function(assetPath) {
        return new Promise(function(resolve, reject) {
            var loader = new PIXI.JsonLoader("http://mirjs.com/" + assetPath + '.json');
            loader.on('loaded', function(evt) {
                resolve(evt.data.content.json);
            });
            loader.load();
        });
    }
};

module.exports = LoaderService;
},{"../maps/MapReader.js":8,"pixi.js":21}],16:[function(require,module,exports){
var ResourceService = {
	graphics: {
		mapLib: function(index) {
			switch(index) {
				case 100:
					return {
						path: "data/tiles" + (index - 99),
						type: 'jpg',
						placements: 'data/tiles' + (index - 99) + '.json'
					};
				case 110:
					return {
						path: "data/smtiles" + (index - 109),
						type: 'jpg'			
					};		
				case 120:
				case 123:
				case 125:
					return {
						path: "data/objects" + (index - 119),
						type: 'png',
						placements: 'data/objects' + (index - 119) + '.json'		
					};		
				default:
					return null;		
			}
		},
		humLib: function(look) {
			switch(look) {
				case 0:
					return {
						path: "data/hum" + (look + 1),
						type: 'png',
						placements: 'data/hum' + (look + 1) + '.json'
					};
			}
		},
		npcLib: function(look) {
			switch(look) {
				case 0:
					return {
						path: "data/npc" + (look + 1),
						type: 'png',
						placements: 'data/npc' + (look + 1) + '.json'
					};
			}
		},		
		placements: [
			"data/hum1",
			"data/npc1",
			"data/tiles1",
			"data/objects1",
			"data/objects3",
			"data/objects4",
			"data/objects6"
		]
	}
}

module.exports = ResourceService;
},{}],17:[function(require,module,exports){
var PIXI = require('pixi.js');
var LoaderService = require('../services/LoaderService.js');
var ResourceService = require('../services/ResourceService.js');
var HumanActionEnum = require('../enums/HumanActionEnum.js');
var AnimationControl = require('../animations/AnimationControl.js');

var addPathNamePadding = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function HumanSprite( scene, data ) {
	this.hasLight = data.hasLight !== null ? data.hasLight : null;
	this._direction = data.direction !== null ? data.direction : null;
	this._action = data.action !== null ? data.action : null;
	this.z = null;
	this.look = data.look !== null ? data.look : null;

	this._animationControl = null;
	this._animationKeyFrame = 0;
	this._animationFrame = 0;
	this._animationCameraFrame = 0;
	this._lastAnimationTime = 0;
	this._animationAlt = false;

	this.sprites = new PIXI.DisplayObjectContainer();

	this._actionQueue = [];

	this._scene = scene;
	this._bodySprite = null;
	this._weaponSprite = null;
	this._effectsSprite = null;
	this._hairSprite = null;	
	this.loaded = false;
}

HumanSprite.prototype.init = function() {
	//add the sprites to our container
	this.sprites.x = this.x;
	this.sprites.y = this.y;
	this.sprites.z = this.z + 0.1;

	this._updateBodyTexture();
	this._nextAnimation();
}

HumanSprite.prototype.setZ = function(z) {
	this.z = z;
	this.sprites.z = this.z + 0.1;	
}

HumanSprite.prototype.getScene = function() {
	return this._scene;	
}

HumanSprite.prototype.setDirection = function(direction) {
	this._direction = direction;
}

HumanSprite.prototype.update = function() {
	if(this._bodySprite === null) {
		return false;
	}

	switch(this._animationControl.getAction()) {
		case HumanActionEnum.Standing:
			this._handleStandingAnimation();
			break;
		case HumanActionEnum.Walking:
		case HumanActionEnum.Running:
			this._handleMovingAnimation();
			break;
	}


	this._updateBodyTexture();
}

HumanSprite.prototype._nextAnimation = function() {
	//if nothing left, we set back to normal
	if(this._actionQueue.length === 0) {
		this._animationControl = new AnimationControl(HumanActionEnum.Standing, this._direction);
		this._animationAlt = false;
	} else {
		if(this._animationControl.getAction() === this._actionQueue[0].getAction()) {
			this._animationAlt = !this._animationAlt;	
		}
		this._animationControl = this._actionQueue[0];
		if(this._animationControl.getBeginEvent() != null) {
			this._animationControl.getBeginEvent().call();
		}
		this._direction = this._animationControl.getDirection();
		this._actionQueue.shift();
	}
	this._animationCameraFrame = 0;
}

HumanSprite.prototype.queueAnimation = function(animationControl) {
	this._actionQueue.push(animationControl);
}

HumanSprite.prototype._handleStandingAnimation = function() {
	if(this._tickElapsed(200)) {	
		this._animationKeyFrame = 0;

		if(this._animationFrame === 3) {
			this._animationFrame = 0;
			this._nextAnimation();
		} else {
			this._animationFrame++
			this._updateTick();
		}	
	}	
}

HumanSprite.prototype._handleMovingAnimation = function() {
	var tickTime = 40;

	this._animationKeyFrame = this._animationControl.getAction() === HumanActionEnum.Walking ? 64 : 128;

	if(this._actionQueue.length === 0 && this._animationCameraFrame === 8) {
		tickTime = 100;
	}
	if(this._tickElapsed(tickTime)) {
		if(this._animationCameraFrame === 8) { 
			this._animationControl.getAnimationCompleteEvent().call();
			//check queue for more animations
			this._nextAnimation();
			if(tickTime === 400) {
				this._updateTick();	
			} else {
				this._animationFrame = 0
			}
		} else {
			this._animationControl.getNewFrameEvent().call(this, this._animationCameraFrame);
			this._animationCameraFrame++

			if(this._animationCameraFrame % 4 === 0) {
				this._animationFrame++;
			}
			this._updateTick();
		}
	}		
}


HumanSprite.prototype._updateTick = function() {
	this._lastAnimationTime = Date.now();
}

HumanSprite.prototype._tickElapsed = function(value) {
	return Date.now() - this._lastAnimationTime > value;
}

HumanSprite.prototype._updateBodyTexture = function() {
	var index = (this.look * 600) + (8 * this._direction) + (this._animationAlt === true ? this._animationFrame + 3 : this._animationFrame) + this._animationKeyFrame; // 0 in this case
	var humLib = ResourceService.graphics.humLib(this.look);

	var placementX = this._scene._graphicsPlacements[humLib.path][index][0];
	var placementY = this._scene._graphicsPlacements[humLib.path][index][1];	

	LoaderService.loadTexture(humLib.path + '/' + addPathNamePadding(index, 6) + '.' + humLib.type).then(function(texture) {
		if(this._bodySprite === null) {
			this._bodySprite = new PIXI.Sprite(texture);
			this.sprites.addChild(this._bodySprite);
		} else {
			this._bodySprite.setTexture(texture);
		}

		this._bodySprite.x = placementX;
		this._bodySprite.y = placementY;
	}.bind(this));
}

module.exports = HumanSprite;
},{"../animations/AnimationControl.js":3,"../enums/HumanActionEnum.js":5,"../services/LoaderService.js":15,"../services/ResourceService.js":16,"pixi.js":21}],18:[function(require,module,exports){
var PIXI = require('pixi.js');
var LoaderService = require('../services/LoaderService.js');
var ResourceService = require('../services/ResourceService.js');

var addPathNamePadding = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function NpcSprite( scene, data ) {
	this.hasLight = data.hasLight !== null ? data.hasLight : null;
	this._direction = 0;
	this.z = data.z !== null ? data.z : null;
	this.look = data.look !== null ? data.look : null;

	this._animationKeyFrame = 0;
	this._animationFrame = 0;
	this._lastAnimationTime = 0;
	this._animationAmounts = 0;
	this._animateAltEffect = false;

	this.sprites = new PIXI.DisplayObjectContainer();

	this._scene = scene;
	this._npcSprite = null;
	this.loaded = false;
}

NpcSprite.prototype.init = function() {
	//add the sprites to our container
	this.sprites.x = this.x;
	this.sprites.y = this.y;
	this.sprites.z = this.z + 0.1;

	this._updateSpriteTexture();
}

NpcSprite.prototype.setZ = function(z) {
	this.z = z;
	this.sprites.z = this.z + 0.1;	
}

NpcSprite.prototype.setDirection = function(direction) {
	this._direction = direction;
}

NpcSprite.prototype.update = function() {
	if(this._npcSprite === null) {
		return false;
	}

	if(this._animationAmounts > 4) {
		this._animationAmounts = 0
		this._animateAltEffect = true;
		this._direction++;
		if(this._direction === 3) {
			this._direction = 0;
		}
	}

	if(this._animateAltEffect === false) {
		this._handleStandingAnimation();
	} else {
		this._handleAltEffectAnimation();
	}

	this._updateSpriteTexture();
}

NpcSprite.prototype._handleStandingAnimation = function() {
	if(this._tickElapsed(500)) {	
		this._animationKeyFrame = 0;

		if(this._animationFrame === 3) {
			this._animationFrame = 0;
			this._animationAmounts++;
			this._updateTick();
		} else {
			this._animationFrame++
			this._updateTick();
		}	
	}	
}

NpcSprite.prototype._handleAltEffectAnimation = function() {
	if(this._tickElapsed(75)) {	
		this._animationKeyFrame = 30;

		if(this._animationFrame === 9) {
			this._animationFrame = 0;
			this._animateAltEffect = false;
		} else {
			this._animationFrame++
			this._updateTick();
		}	
	}	
}

NpcSprite.prototype._updateTick = function() {
	this._lastAnimationTime = Date.now();
}

NpcSprite.prototype._tickElapsed = function(value) {
	return Date.now() - this._lastAnimationTime > value;
}

NpcSprite.prototype._updateSpriteTexture = function() {
	var index = (this.look * 60) + (10 * this._direction) + this._animationFrame + this._animationKeyFrame;
	var npcLib = ResourceService.graphics.npcLib(this.look);

	var placementX = this._scene._graphicsPlacements[npcLib.path][index][0];
	var placementY = this._scene._graphicsPlacements[npcLib.path][index][1];	

	LoaderService.loadTexture(npcLib.path + '/' + addPathNamePadding(index, 6) + '.' + npcLib.type).then(function(texture) {
		if(this._npcSprite === null) {
			this._npcSprite = new PIXI.Sprite(texture);
			this.sprites.addChild(this._npcSprite);
		} else {
			this._npcSprite.setTexture(texture);
		}

		this._npcSprite.x = placementX;
		this._npcSprite.y = placementY;
	}.bind(this));
}

module.exports = NpcSprite;
},{"../services/LoaderService.js":15,"../services/ResourceService.js":16,"pixi.js":21}],19:[function(require,module,exports){
/*

	Mir.js

	By Dominic Gannaway
	aka TrueADM

	Browserify command to compile and bundle code (run in root directory):
	"browserify app.js > bundle.js"

*/

var GameService = require('./app/services/GameService.js');
var Player = require('./app/objects/Player.js');
var Npc = require('./app/objects/Npc.js');
var App = require('./app/App.js');

//make a dummy player for our game server
GameService.player = new Player({
	name: 'TrueADM',
	level: 30,
	exp: 2000,
	x: 300,
	y: 300,
	hp: 100,
	mp: 100,
	maxHp: 100,
	maxMp: 100,
	direction: 0,
	bag: [],
	equiped: {}
});

//set map
GameService.map.file = "0";
GameService.map.name = "BichonProvince";

//add an NPC into the middle of BW
GameService.addNpc(new Npc({
	id: 1,
	name: 'Fred',
	look: 0,
	x: 300,
	y: 290
}));

window.GameService = GameService;

//we haven't got the login scene or char select scene yet, so let's cheat and say we have
GameService.loggedIn = true;

//now start the app
var app = new App(document.getElementById('app'));
},{"./app/App.js":1,"./app/objects/Npc.js":9,"./app/objects/Player.js":10,"./app/services/GameService.js":13}],20:[function(require,module,exports){
/*! FPSMeter 0.3.1 - 9th May 2013 | https://github.com/Darsain/fpsmeter */
(function(m,j){function s(a,e){for(var g in e)try{a.style[g]=e[g]}catch(j){}return a}function H(a){return null==a?String(a):"object"===typeof a||"function"===typeof a?Object.prototype.toString.call(a).match(/\s([a-z]+)/i)[1].toLowerCase()||"object":typeof a}function R(a,e){if("array"!==H(e))return-1;if(e.indexOf)return e.indexOf(a);for(var g=0,j=e.length;g<j;g++)if(e[g]===a)return g;return-1}function I(){var a=arguments,e;for(e in a[1])if(a[1].hasOwnProperty(e))switch(H(a[1][e])){case "object":a[0][e]=
I({},a[0][e],a[1][e]);break;case "array":a[0][e]=a[1][e].slice(0);break;default:a[0][e]=a[1][e]}return 2<a.length?I.apply(null,[a[0]].concat(Array.prototype.slice.call(a,2))):a[0]}function N(a){a=Math.round(255*a).toString(16);return 1===a.length?"0"+a:a}function S(a,e,g,j){if(a.addEventListener)a[j?"removeEventListener":"addEventListener"](e,g,!1);else if(a.attachEvent)a[j?"detachEvent":"attachEvent"]("on"+e,g)}function D(a,e){function g(a,b,d,c){return y[0|a][Math.round(Math.min((b-d)/(c-d)*J,J))]}
function r(){f.legend.fps!==q&&(f.legend.fps=q,f.legend[T]=q?"FPS":"ms");K=q?b.fps:b.duration;f.count[T]=999<K?"999+":K.toFixed(99<K?0:d.decimals)}function m(){z=A();L<z-d.threshold&&(b.fps-=b.fps/Math.max(1,60*d.smoothing/d.interval),b.duration=1E3/b.fps);for(c=d.history;c--;)E[c]=0===c?b.fps:E[c-1],F[c]=0===c?b.duration:F[c-1];r();if(d.heat){if(w.length)for(c=w.length;c--;)w[c].el.style[h[w[c].name].heatOn]=q?g(h[w[c].name].heatmap,b.fps,0,d.maxFps):g(h[w[c].name].heatmap,b.duration,d.threshold,
0);if(f.graph&&h.column.heatOn)for(c=u.length;c--;)u[c].style[h.column.heatOn]=q?g(h.column.heatmap,E[c],0,d.maxFps):g(h.column.heatmap,F[c],d.threshold,0)}if(f.graph)for(p=0;p<d.history;p++)u[p].style.height=(q?E[p]?Math.round(O/d.maxFps*Math.min(E[p],d.maxFps)):0:F[p]?Math.round(O/d.threshold*Math.min(F[p],d.threshold)):0)+"px"}function k(){20>d.interval?(x=M(k),m()):(x=setTimeout(k,d.interval),P=M(m))}function G(a){a=a||window.event;a.preventDefault?(a.preventDefault(),a.stopPropagation()):(a.returnValue=
!1,a.cancelBubble=!0);b.toggle()}function U(){d.toggleOn&&S(f.container,d.toggleOn,G,1);a.removeChild(f.container)}function V(){f.container&&U();h=D.theme[d.theme];y=h.compiledHeatmaps||[];if(!y.length&&h.heatmaps.length){for(p=0;p<h.heatmaps.length;p++){y[p]=[];for(c=0;c<=J;c++){var b=y[p],e=c,g;g=0.33/J*c;var j=h.heatmaps[p].saturation,m=h.heatmaps[p].lightness,n=void 0,k=void 0,l=void 0,t=l=void 0,v=n=k=void 0,v=void 0,l=0.5>=m?m*(1+j):m+j-m*j;0===l?g="#000":(t=2*m-l,k=(l-t)/l,g*=6,n=Math.floor(g),
v=g-n,v*=l*k,0===n||6===n?(n=l,k=t+v,l=t):1===n?(n=l-v,k=l,l=t):2===n?(n=t,k=l,l=t+v):3===n?(n=t,k=l-v):4===n?(n=t+v,k=t):(n=l,k=t,l-=v),g="#"+N(n)+N(k)+N(l));b[e]=g}}h.compiledHeatmaps=y}f.container=s(document.createElement("div"),h.container);f.count=f.container.appendChild(s(document.createElement("div"),h.count));f.legend=f.container.appendChild(s(document.createElement("div"),h.legend));f.graph=d.graph?f.container.appendChild(s(document.createElement("div"),h.graph)):0;w.length=0;for(var q in f)f[q]&&
h[q].heatOn&&w.push({name:q,el:f[q]});u.length=0;if(f.graph){f.graph.style.width=d.history*h.column.width+(d.history-1)*h.column.spacing+"px";for(c=0;c<d.history;c++)u[c]=f.graph.appendChild(s(document.createElement("div"),h.column)),u[c].style.position="absolute",u[c].style.bottom=0,u[c].style.right=c*h.column.width+c*h.column.spacing+"px",u[c].style.width=h.column.width+"px",u[c].style.height="0px"}s(f.container,d);r();a.appendChild(f.container);f.graph&&(O=f.graph.clientHeight);d.toggleOn&&("click"===
d.toggleOn&&(f.container.style.cursor="pointer"),S(f.container,d.toggleOn,G))}"object"===H(a)&&a.nodeType===j&&(e=a,a=document.body);a||(a=document.body);var b=this,d=I({},D.defaults,e||{}),f={},u=[],h,y,J=100,w=[],W=0,B=d.threshold,Q=0,L=A()-B,z,E=[],F=[],x,P,q="fps"===d.show,O,K,c,p;b.options=d;b.fps=0;b.duration=0;b.isPaused=0;b.tickStart=function(){Q=A()};b.tick=function(){z=A();W=z-L;B+=(W-B)/d.smoothing;b.fps=1E3/B;b.duration=Q<L?B:z-Q;L=z};b.pause=function(){x&&(b.isPaused=1,clearTimeout(x),
C(x),C(P),x=P=0);return b};b.resume=function(){x||(b.isPaused=0,k());return b};b.set=function(a,c){d[a]=c;q="fps"===d.show;-1!==R(a,X)&&V();-1!==R(a,Y)&&s(f.container,d);return b};b.showDuration=function(){b.set("show","ms");return b};b.showFps=function(){b.set("show","fps");return b};b.toggle=function(){b.set("show",q?"ms":"fps");return b};b.hide=function(){b.pause();f.container.style.display="none";return b};b.show=function(){b.resume();f.container.style.display="block";return b};b.destroy=function(){b.pause();
U();b.tick=b.tickStart=function(){}};V();k()}var A,r=m.performance;A=r&&(r.now||r.webkitNow)?r[r.now?"now":"webkitNow"].bind(r):function(){return+new Date};for(var C=m.cancelAnimationFrame||m.cancelRequestAnimationFrame,M=m.requestAnimationFrame,r=["moz","webkit","o"],G=0,k=0,Z=r.length;k<Z&&!C;++k)M=(C=m[r[k]+"CancelAnimationFrame"]||m[r[k]+"CancelRequestAnimationFrame"])&&m[r[k]+"RequestAnimationFrame"];C||(M=function(a){var e=A(),g=Math.max(0,16-(e-G));G=e+g;return m.setTimeout(function(){a(e+
g)},g)},C=function(a){clearTimeout(a)});var T="string"===H(document.createElement("div").textContent)?"textContent":"innerText";D.extend=I;window.FPSMeter=D;D.defaults={interval:100,smoothing:10,show:"fps",toggleOn:"click",decimals:1,maxFps:60,threshold:100,position:"absolute",zIndex:10,left:"5px",top:"5px",right:"auto",bottom:"auto",margin:"0 0 0 0",theme:"dark",heat:0,graph:0,history:20};var X=["toggleOn","theme","heat","graph","history"],Y="position zIndex left top right bottom margin".split(" ")})(window);(function(m,j){j.theme={};var s=j.theme.base={heatmaps:[],container:{heatOn:null,heatmap:null,padding:"5px",minWidth:"95px",height:"30px",lineHeight:"30px",textAlign:"right",textShadow:"none"},count:{heatOn:null,heatmap:null,position:"absolute",top:0,right:0,padding:"5px 10px",height:"30px",fontSize:"24px",fontFamily:"Consolas, Andale Mono, monospace",zIndex:2},legend:{heatOn:null,heatmap:null,position:"absolute",top:0,left:0,padding:"5px 10px",height:"30px",fontSize:"12px",lineHeight:"32px",fontFamily:"sans-serif",
textAlign:"left",zIndex:2},graph:{heatOn:null,heatmap:null,position:"relative",boxSizing:"padding-box",MozBoxSizing:"padding-box",height:"100%",zIndex:1},column:{width:4,spacing:1,heatOn:null,heatmap:null}};j.theme.dark=j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.8}],container:{background:"#222",color:"#fff",border:"1px solid #1a1a1a",textShadow:"1px 1px 0 #222"},count:{heatOn:"color"},column:{background:"#3f3f3f"}});j.theme.light=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.5}],
container:{color:"#666",background:"#fff",textShadow:"1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},count:{heatOn:"color"},column:{background:"#eaeaea"}});j.theme.colorful=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.6}],container:{heatOn:"backgroundColor",background:"#888",color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.2)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},column:{background:"#777",backgroundColor:"rgba(0,0,0,.2)"}});j.theme.transparent=
j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.5}],container:{padding:0,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.5)"},count:{padding:"0 5px",height:"40px",lineHeight:"40px"},legend:{padding:"0 5px",height:"40px",lineHeight:"42px"},graph:{height:"40px"},column:{width:5,background:"#999",heatOn:"backgroundColor",opacity:0.5}})})(window,FPSMeter);

},{}],21:[function(require,module,exports){
/**
 * @license
 * pixi.js - v2.1.0
 * Copyright (c) 2012-2014, Mat Groves
 * http://goodboydigital.com/
 *
 * Compiled: 2014-11-12
 *
 * pixi.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function(){var a=this,b=b||{};b.WEBGL_RENDERER=0,b.CANVAS_RENDERER=1,b.VERSION="v2.1.0",b.blendModes={NORMAL:0,ADD:1,MULTIPLY:2,SCREEN:3,OVERLAY:4,DARKEN:5,LIGHTEN:6,COLOR_DODGE:7,COLOR_BURN:8,HARD_LIGHT:9,SOFT_LIGHT:10,DIFFERENCE:11,EXCLUSION:12,HUE:13,SATURATION:14,COLOR:15,LUMINOSITY:16},b.scaleModes={DEFAULT:0,LINEAR:0,NEAREST:1},b._UID=0,"undefined"!=typeof Float32Array?(b.Float32Array=Float32Array,b.Uint16Array=Uint16Array):(b.Float32Array=Array,b.Uint16Array=Array),b.INTERACTION_FREQUENCY=30,b.AUTO_PREVENT_DEFAULT=!0,b.PI_2=2*Math.PI,b.RAD_TO_DEG=180/Math.PI,b.DEG_TO_RAD=Math.PI/180,b.RETINA_PREFIX="@2x",b.dontSayHello=!1,b.defaultRenderOptions={view:null,transparent:!1,antialias:!1,preserveDrawingBuffer:!1,resolution:1,clearBeforeRender:!0,autoResize:!1},b.sayHello=function(a){if(!b.dontSayHello){if(navigator.userAgent.toLowerCase().indexOf("chrome")>-1){var c=["%c %c %c Pixi.js "+b.VERSION+" - "+a+"  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥ ","background: #ff66a5","background: #ff66a5","color: #ff66a5; background: #030307;","background: #ff66a5","background: #ffc3dc","background: #ff66a5","color: #ff2424; background: #fff","color: #ff2424; background: #fff","color: #ff2424; background: #fff"];console.log.apply(console,c)}else window.console&&console.log("Pixi.js "+b.VERSION+" - http://www.pixijs.com/");b.dontSayHello=!0}},b.Point=function(a,b){this.x=a||0,this.y=b||0},b.Point.prototype.clone=function(){return new b.Point(this.x,this.y)},b.Point.prototype.set=function(a,b){this.x=a||0,this.y=b||(0!==b?this.x:0)},b.Point.prototype.constructor=b.Point,b.Rectangle=function(a,b,c,d){this.x=a||0,this.y=b||0,this.width=c||0,this.height=d||0},b.Rectangle.prototype.clone=function(){return new b.Rectangle(this.x,this.y,this.width,this.height)},b.Rectangle.prototype.contains=function(a,b){if(this.width<=0||this.height<=0)return!1;var c=this.x;if(a>=c&&a<=c+this.width){var d=this.y;if(b>=d&&b<=d+this.height)return!0}return!1},b.Rectangle.prototype.constructor=b.Rectangle,b.EmptyRectangle=new b.Rectangle(0,0,0,0),b.Polygon=function(a){if(a instanceof Array||(a=Array.prototype.slice.call(arguments)),a[0]instanceof b.Point){for(var c=[],d=0,e=a.length;e>d;d++)c.push(a[d].x,a[d].y);a=c}this.closed=!0,this.points=a},b.Polygon.prototype.clone=function(){var a=this.points.slice();return new b.Polygon(a)},b.Polygon.prototype.contains=function(a,b){for(var c=!1,d=this.points.length/2,e=0,f=d-1;d>e;f=e++){var g=this.points[2*e],h=this.points[2*e+1],i=this.points[2*f],j=this.points[2*f+1],k=h>b!=j>b&&(i-g)*(b-h)/(j-h)+g>a;k&&(c=!c)}return c},b.Polygon.prototype.constructor=b.Polygon,b.Circle=function(a,b,c){this.x=a||0,this.y=b||0,this.radius=c||0},b.Circle.prototype.clone=function(){return new b.Circle(this.x,this.y,this.radius)},b.Circle.prototype.contains=function(a,b){if(this.radius<=0)return!1;var c=this.x-a,d=this.y-b,e=this.radius*this.radius;return c*=c,d*=d,e>=c+d},b.Circle.prototype.getBounds=function(){return new b.Rectangle(this.x-this.radius,this.y-this.radius,2*this.radius,2*this.radius)},b.Circle.prototype.constructor=b.Circle,b.Ellipse=function(a,b,c,d){this.x=a||0,this.y=b||0,this.width=c||0,this.height=d||0},b.Ellipse.prototype.clone=function(){return new b.Ellipse(this.x,this.y,this.width,this.height)},b.Ellipse.prototype.contains=function(a,b){if(this.width<=0||this.height<=0)return!1;var c=(a-this.x)/this.width,d=(b-this.y)/this.height;return c*=c,d*=d,1>=c+d},b.Ellipse.prototype.getBounds=function(){return new b.Rectangle(this.x-this.width,this.y-this.height,this.width,this.height)},b.Ellipse.prototype.constructor=b.Ellipse,b.RoundedRectangle=function(a,b,c,d,e){this.x=a||0,this.y=b||0,this.width=c||0,this.height=d||0,this.radius=e||20},b.RoundedRectangle.prototype.clone=function(){return new b.RoundedRectangle(this.x,this.y,this.width,this.height,this.radius)},b.RoundedRectangle.prototype.contains=function(a,b){if(this.width<=0||this.height<=0)return!1;var c=this.x;if(a>=c&&a<=c+this.width){var d=this.y;if(b>=d&&b<=d+this.height)return!0}return!1},b.RoundedRectangle.prototype.constructor=b.RoundedRectangle,b.Matrix=function(){this.a=1,this.b=0,this.c=0,this.d=1,this.tx=0,this.ty=0},b.Matrix.prototype.fromArray=function(a){this.a=a[0],this.b=a[1],this.c=a[3],this.d=a[4],this.tx=a[2],this.ty=a[5]},b.Matrix.prototype.toArray=function(a){this.array||(this.array=new b.Float32Array(9));var c=this.array;return a?(c[0]=this.a,c[1]=this.b,c[2]=0,c[3]=this.c,c[4]=this.d,c[5]=0,c[6]=this.tx,c[7]=this.ty,c[8]=1):(c[0]=this.a,c[1]=this.c,c[2]=this.tx,c[3]=this.b,c[4]=this.d,c[5]=this.ty,c[6]=0,c[7]=0,c[8]=1),c},b.Matrix.prototype.apply=function(a,c){return c=c||new b.Point,c.x=this.a*a.x+this.c*a.y+this.tx,c.y=this.b*a.x+this.d*a.y+this.ty,c},b.Matrix.prototype.applyInverse=function(a,c){c=c||new b.Point;var d=1/(this.a*this.d+this.c*-this.b);return c.x=this.d*d*a.x+-this.c*d*a.y+(this.ty*this.c-this.tx*this.d)*d,c.y=this.a*d*a.y+-this.b*d*a.x+(-this.ty*this.a+this.tx*this.b)*d,c},b.Matrix.prototype.translate=function(a,b){return this.tx+=a,this.ty+=b,this},b.Matrix.prototype.scale=function(a,b){return this.a*=a,this.d*=b,this.c*=a,this.b*=b,this.tx*=a,this.ty*=b,this},b.Matrix.prototype.rotate=function(a){var b=Math.cos(a),c=Math.sin(a),d=this.a,e=this.c,f=this.tx;return this.a=d*b-this.b*c,this.b=d*c+this.b*b,this.c=e*b-this.d*c,this.d=e*c+this.d*b,this.tx=f*b-this.ty*c,this.ty=f*c+this.ty*b,this},b.Matrix.prototype.append=function(a){var b=this.a,c=this.b,d=this.c,e=this.d;return this.a=a.a*b+a.b*d,this.b=a.a*c+a.b*e,this.c=a.c*b+a.d*d,this.d=a.c*c+a.d*e,this.tx=a.tx*b+a.ty*d+this.tx,this.ty=a.tx*c+a.ty*e+this.ty,this},b.Matrix.prototype.identity=function(){return this.a=1,this.b=0,this.c=0,this.d=1,this.tx=0,this.ty=0,this},b.identityMatrix=new b.Matrix,b.DisplayObject=function(){this.position=new b.Point,this.scale=new b.Point(1,1),this.pivot=new b.Point(0,0),this.rotation=0,this.alpha=1,this.visible=!0,this.hitArea=null,this.buttonMode=!1,this.renderable=!1,this.parent=null,this.stage=null,this.worldAlpha=1,this._interactive=!1,this.defaultCursor="pointer",this.worldTransform=new b.Matrix,this._sr=0,this._cr=1,this.filterArea=null,this._bounds=new b.Rectangle(0,0,1,1),this._currentBounds=null,this._mask=null,this._cacheAsBitmap=!1,this._cacheIsDirty=!1},b.DisplayObject.prototype.constructor=b.DisplayObject,Object.defineProperty(b.DisplayObject.prototype,"interactive",{get:function(){return this._interactive},set:function(a){this._interactive=a,this.stage&&(this.stage.dirty=!0)}}),Object.defineProperty(b.DisplayObject.prototype,"worldVisible",{get:function(){var a=this;do{if(!a.visible)return!1;a=a.parent}while(a);return!0}}),Object.defineProperty(b.DisplayObject.prototype,"mask",{get:function(){return this._mask},set:function(a){this._mask&&(this._mask.isMask=!1),this._mask=a,this._mask&&(this._mask.isMask=!0)}}),Object.defineProperty(b.DisplayObject.prototype,"filters",{get:function(){return this._filters},set:function(a){if(a){for(var b=[],c=0;c<a.length;c++)for(var d=a[c].passes,e=0;e<d.length;e++)b.push(d[e]);this._filterBlock={target:this,filterPasses:b}}this._filters=a}}),Object.defineProperty(b.DisplayObject.prototype,"cacheAsBitmap",{get:function(){return this._cacheAsBitmap},set:function(a){this._cacheAsBitmap!==a&&(a?this._generateCachedSprite():this._destroyCachedSprite(),this._cacheAsBitmap=a)}}),b.DisplayObject.prototype.updateTransform=function(){var a,c,d,e,f,g,h=this.parent.worldTransform,i=this.worldTransform;this.rotation%b.PI_2?(this.rotation!==this.rotationCache&&(this.rotationCache=this.rotation,this._sr=Math.sin(this.rotation),this._cr=Math.cos(this.rotation)),a=this._cr*this.scale.x,c=this._sr*this.scale.x,d=-this._sr*this.scale.y,e=this._cr*this.scale.y,f=this.position.x,g=this.position.y,(this.pivot.x||this.pivot.y)&&(f-=this.pivot.x*a+this.pivot.y*d,g-=this.pivot.x*c+this.pivot.y*e),i.a=a*h.a+c*h.c,i.b=a*h.b+c*h.d,i.c=d*h.a+e*h.c,i.d=d*h.b+e*h.d,i.tx=f*h.a+g*h.c+h.tx,i.ty=f*h.b+g*h.d+h.ty):(a=this.scale.x,e=this.scale.y,f=this.position.x-this.pivot.x*a,g=this.position.y-this.pivot.y*e,i.a=a*h.a,i.b=a*h.b,i.c=e*h.c,i.d=e*h.d,i.tx=f*h.a+g*h.c+h.tx,i.ty=f*h.b+g*h.d+h.ty),this.worldAlpha=this.alpha*this.parent.worldAlpha},b.DisplayObject.prototype.displayObjectUpdateTransform=b.DisplayObject.prototype.updateTransform,b.DisplayObject.prototype.getBounds=function(a){return a=a,b.EmptyRectangle},b.DisplayObject.prototype.getLocalBounds=function(){return this.getBounds(b.identityMatrix)},b.DisplayObject.prototype.setStageReference=function(a){this.stage=a,this._interactive&&(this.stage.dirty=!0)},b.DisplayObject.prototype.generateTexture=function(a,c,d){var e=this.getLocalBounds(),f=new b.RenderTexture(0|e.width,0|e.height,d,c,a);return b.DisplayObject._tempMatrix.tx=-e.x,b.DisplayObject._tempMatrix.ty=-e.y,f.render(this,b.DisplayObject._tempMatrix),f},b.DisplayObject.prototype.updateCache=function(){this._generateCachedSprite()},b.DisplayObject.prototype.toGlobal=function(a){return this.updateTransform(),this.worldTransform.apply(a)},b.DisplayObject.prototype.toLocal=function(a,b){return b&&(a=b.toGlobal(a)),this.updateTransform(),this.worldTransform.applyInverse(a)},b.DisplayObject.prototype._renderCachedSprite=function(a){this._cachedSprite.worldAlpha=this.worldAlpha,a.gl?b.Sprite.prototype._renderWebGL.call(this._cachedSprite,a):b.Sprite.prototype._renderCanvas.call(this._cachedSprite,a)},b.DisplayObject.prototype._generateCachedSprite=function(){this._cacheAsBitmap=!1;var a=this.getLocalBounds();if(this._cachedSprite)this._cachedSprite.texture.resize(0|a.width,0|a.height);else{var c=new b.RenderTexture(0|a.width,0|a.height);this._cachedSprite=new b.Sprite(c),this._cachedSprite.worldTransform=this.worldTransform}var d=this._filters;this._filters=null,this._cachedSprite.filters=d,b.DisplayObject._tempMatrix.tx=-a.x,b.DisplayObject._tempMatrix.ty=-a.y,this._cachedSprite.texture.render(this,b.DisplayObject._tempMatrix),this._cachedSprite.anchor.x=-(a.x/a.width),this._cachedSprite.anchor.y=-(a.y/a.height),this._filters=d,this._cacheAsBitmap=!0},b.DisplayObject.prototype._destroyCachedSprite=function(){this._cachedSprite&&(this._cachedSprite.texture.destroy(!0),this._cachedSprite=null)},b.DisplayObject.prototype._renderWebGL=function(a){a=a},b.DisplayObject.prototype._renderCanvas=function(a){a=a},b.DisplayObject._tempMatrix=new b.Matrix,Object.defineProperty(b.DisplayObject.prototype,"x",{get:function(){return this.position.x},set:function(a){this.position.x=a}}),Object.defineProperty(b.DisplayObject.prototype,"y",{get:function(){return this.position.y},set:function(a){this.position.y=a}}),b.DisplayObjectContainer=function(){b.DisplayObject.call(this),this.children=[]},b.DisplayObjectContainer.prototype=Object.create(b.DisplayObject.prototype),b.DisplayObjectContainer.prototype.constructor=b.DisplayObjectContainer,Object.defineProperty(b.DisplayObjectContainer.prototype,"width",{get:function(){return this.scale.x*this.getLocalBounds().width},set:function(a){var b=this.getLocalBounds().width;this.scale.x=0!==b?a/b:1,this._width=a}}),Object.defineProperty(b.DisplayObjectContainer.prototype,"height",{get:function(){return this.scale.y*this.getLocalBounds().height},set:function(a){var b=this.getLocalBounds().height;this.scale.y=0!==b?a/b:1,this._height=a}}),b.DisplayObjectContainer.prototype.addChild=function(a){return this.addChildAt(a,this.children.length)},b.DisplayObjectContainer.prototype.addChildAt=function(a,b){if(b>=0&&b<=this.children.length)return a.parent&&a.parent.removeChild(a),a.parent=this,this.children.splice(b,0,a),this.stage&&a.setStageReference(this.stage),a;throw new Error(a+"addChildAt: The index "+b+" supplied is out of bounds "+this.children.length)},b.DisplayObjectContainer.prototype.swapChildren=function(a,b){if(a!==b){var c=this.getChildIndex(a),d=this.getChildIndex(b);if(0>c||0>d)throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");this.children[c]=b,this.children[d]=a}},b.DisplayObjectContainer.prototype.getChildIndex=function(a){var b=this.children.indexOf(a);if(-1===b)throw new Error("The supplied DisplayObject must be a child of the caller");return b},b.DisplayObjectContainer.prototype.setChildIndex=function(a,b){if(0>b||b>=this.children.length)throw new Error("The supplied index is out of bounds");var c=this.getChildIndex(a);this.children.splice(c,1),this.children.splice(b,0,a)},b.DisplayObjectContainer.prototype.getChildAt=function(a){if(0>a||a>=this.children.length)throw new Error("getChildAt: Supplied index "+a+" does not exist in the child list, or the supplied DisplayObject must be a child of the caller");return this.children[a]},b.DisplayObjectContainer.prototype.removeChild=function(a){var b=this.children.indexOf(a);if(-1!==b)return this.removeChildAt(b)},b.DisplayObjectContainer.prototype.removeChildAt=function(a){var b=this.getChildAt(a);return this.stage&&b.removeStageReference(),b.parent=void 0,this.children.splice(a,1),b},b.DisplayObjectContainer.prototype.removeChildren=function(a,b){var c=a||0,d="number"==typeof b?b:this.children.length,e=d-c;if(e>0&&d>=e){for(var f=this.children.splice(c,e),g=0;g<f.length;g++){var h=f[g];this.stage&&h.removeStageReference(),h.parent=void 0}return f}if(0===e&&0===this.children.length)return[];throw new Error("removeChildren: Range Error, numeric values are outside the acceptable range")},b.DisplayObjectContainer.prototype.updateTransform=function(){if(this.visible&&(this.displayObjectUpdateTransform(),!this._cacheAsBitmap))for(var a=0,b=this.children.length;b>a;a++)this.children[a].updateTransform()},b.DisplayObjectContainer.prototype.displayObjectContainerUpdateTransform=b.DisplayObjectContainer.prototype.updateTransform,b.DisplayObjectContainer.prototype.getBounds=function(){if(0===this.children.length)return b.EmptyRectangle;for(var a,c,d,e=1/0,f=1/0,g=-1/0,h=-1/0,i=!1,j=0,k=this.children.length;k>j;j++){var l=this.children[j];l.visible&&(i=!0,a=this.children[j].getBounds(),e=e<a.x?e:a.x,f=f<a.y?f:a.y,c=a.width+a.x,d=a.height+a.y,g=g>c?g:c,h=h>d?h:d)}if(!i)return b.EmptyRectangle;var m=this._bounds;return m.x=e,m.y=f,m.width=g-e,m.height=h-f,m},b.DisplayObjectContainer.prototype.getLocalBounds=function(){var a=this.worldTransform;this.worldTransform=b.identityMatrix;for(var c=0,d=this.children.length;d>c;c++)this.children[c].updateTransform();var e=this.getBounds();return this.worldTransform=a,e},b.DisplayObjectContainer.prototype.setStageReference=function(a){this.stage=a,this._interactive&&(this.stage.dirty=!0);for(var b=0,c=this.children.length;c>b;b++){var d=this.children[b];d.setStageReference(a)}},b.DisplayObjectContainer.prototype.removeStageReference=function(){for(var a=0,b=this.children.length;b>a;a++){var c=this.children[a];c.removeStageReference()}this._interactive&&(this.stage.dirty=!0),this.stage=null},b.DisplayObjectContainer.prototype._renderWebGL=function(a){if(this.visible&&!(this.alpha<=0)){if(this._cacheAsBitmap)return this._renderCachedSprite(a),void 0;var b,c;if(this._mask||this._filters){for(this._filters&&(a.spriteBatch.flush(),a.filterManager.pushFilter(this._filterBlock)),this._mask&&(a.spriteBatch.stop(),a.maskManager.pushMask(this.mask,a),a.spriteBatch.start()),b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a);a.spriteBatch.stop(),this._mask&&a.maskManager.popMask(this._mask,a),this._filters&&a.filterManager.popFilter(),a.spriteBatch.start()}else for(b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a)}},b.DisplayObjectContainer.prototype._renderCanvas=function(a){if(this.visible!==!1&&0!==this.alpha){if(this._cacheAsBitmap)return this._renderCachedSprite(a),void 0;this._mask&&a.maskManager.pushMask(this._mask,a);for(var b=0,c=this.children.length;c>b;b++){var d=this.children[b];d._renderCanvas(a)}this._mask&&a.maskManager.popMask(a)}},b.Sprite=function(a){b.DisplayObjectContainer.call(this),this.anchor=new b.Point,this.texture=a,this._width=0,this._height=0,this.tint=16777215,this.blendMode=b.blendModes.NORMAL,this.shader=null,a.baseTexture.hasLoaded?this.onTextureUpdate():this.texture.on("update",this.onTextureUpdate.bind(this)),this.renderable=!0},b.Sprite.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Sprite.prototype.constructor=b.Sprite,Object.defineProperty(b.Sprite.prototype,"width",{get:function(){return this.scale.x*this.texture.frame.width},set:function(a){this.scale.x=a/this.texture.frame.width,this._width=a}}),Object.defineProperty(b.Sprite.prototype,"height",{get:function(){return this.scale.y*this.texture.frame.height},set:function(a){this.scale.y=a/this.texture.frame.height,this._height=a}}),b.Sprite.prototype.setTexture=function(a){this.texture=a,this.cachedTint=16777215},b.Sprite.prototype.onTextureUpdate=function(){this._width&&(this.scale.x=this._width/this.texture.frame.width),this._height&&(this.scale.y=this._height/this.texture.frame.height)},b.Sprite.prototype.getBounds=function(a){var b=this.texture.frame.width,c=this.texture.frame.height,d=b*(1-this.anchor.x),e=b*-this.anchor.x,f=c*(1-this.anchor.y),g=c*-this.anchor.y,h=a||this.worldTransform,i=h.a,j=h.b,k=h.c,l=h.d,m=h.tx,n=h.ty,o=i*e+k*g+m,p=l*g+j*e+n,q=i*d+k*g+m,r=l*g+j*d+n,s=i*d+k*f+m,t=l*f+j*d+n,u=i*e+k*f+m,v=l*f+j*e+n,w=-1/0,x=-1/0,y=1/0,z=1/0;y=y>o?o:y,y=y>q?q:y,y=y>s?s:y,y=y>u?u:y,z=z>p?p:z,z=z>r?r:z,z=z>t?t:z,z=z>v?v:z,w=o>w?o:w,w=q>w?q:w,w=s>w?s:w,w=u>w?u:w,x=p>x?p:x,x=r>x?r:x,x=t>x?t:x,x=v>x?v:x;var A=this._bounds;return A.x=y,A.width=w-y,A.y=z,A.height=x-z,this._currentBounds=A,A},b.Sprite.prototype._renderWebGL=function(a){if(this.visible&&!(this.alpha<=0)){var b,c;if(this._mask||this._filters){var d=a.spriteBatch;for(this._filters&&(d.flush(),a.filterManager.pushFilter(this._filterBlock)),this._mask&&(d.stop(),a.maskManager.pushMask(this.mask,a),d.start()),d.render(this),b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a);d.stop(),this._mask&&a.maskManager.popMask(this._mask,a),this._filters&&a.filterManager.popFilter(),d.start()}else for(a.spriteBatch.render(this),b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a)}},b.Sprite.prototype._renderCanvas=function(a){if(!(this.visible===!1||0===this.alpha||this.texture.crop.width<=0||this.texture.crop.height<=0)){if(this.blendMode!==a.currentBlendMode&&(a.currentBlendMode=this.blendMode,a.context.globalCompositeOperation=b.blendModesCanvas[a.currentBlendMode]),this._mask&&a.maskManager.pushMask(this._mask,a),this.texture.valid){var c=this.texture.baseTexture.resolution/a.resolution;a.context.globalAlpha=this.worldAlpha,a.roundPixels?a.context.setTransform(this.worldTransform.a,this.worldTransform.b,this.worldTransform.c,this.worldTransform.d,this.worldTransform.tx*a.resolution|0,this.worldTransform.ty*a.resolution|0):a.context.setTransform(this.worldTransform.a,this.worldTransform.b,this.worldTransform.c,this.worldTransform.d,this.worldTransform.tx*a.resolution,this.worldTransform.ty*a.resolution),a.smoothProperty&&a.scaleMode!==this.texture.baseTexture.scaleMode&&(a.scaleMode=this.texture.baseTexture.scaleMode,a.context[a.smoothProperty]=a.scaleMode===b.scaleModes.LINEAR);var d=this.texture.trim?this.texture.trim.x-this.anchor.x*this.texture.trim.width:this.anchor.x*-this.texture.frame.width,e=this.texture.trim?this.texture.trim.y-this.anchor.y*this.texture.trim.height:this.anchor.y*-this.texture.frame.height;16777215!==this.tint?(this.cachedTint!==this.tint&&(this.cachedTint=this.tint,this.tintedTexture=b.CanvasTinter.getTintedTexture(this,this.tint)),a.context.drawImage(this.tintedTexture,0,0,this.texture.crop.width,this.texture.crop.height,d/c,e/c,this.texture.crop.width/c,this.texture.crop.height/c)):a.context.drawImage(this.texture.baseTexture.source,this.texture.crop.x,this.texture.crop.y,this.texture.crop.width,this.texture.crop.height,d/c,e/c,this.texture.crop.width/c,this.texture.crop.height/c)}for(var f=0,g=this.children.length;g>f;f++)this.children[f]._renderCanvas(a);this._mask&&a.maskManager.popMask(a)}},b.Sprite.fromFrame=function(a){var c=b.TextureCache[a];if(!c)throw new Error('The frameId "'+a+'" does not exist in the texture cache'+this);return new b.Sprite(c)},b.Sprite.fromImage=function(a,c,d){var e=b.Texture.fromImage(a,c,d);return new b.Sprite(e)},b.SpriteBatch=function(a){b.DisplayObjectContainer.call(this),this.textureThing=a,this.ready=!1},b.SpriteBatch.prototype=Object.create(b.DisplayObjectContainer.prototype),b.SpriteBatch.prototype.constructor=b.SpriteBatch,b.SpriteBatch.prototype.initWebGL=function(a){this.fastSpriteBatch=new b.WebGLFastSpriteBatch(a),this.ready=!0},b.SpriteBatch.prototype.updateTransform=function(){b.DisplayObject.prototype.updateTransform.call(this)},b.SpriteBatch.prototype._renderWebGL=function(a){!this.visible||this.alpha<=0||!this.children.length||(this.ready||this.initWebGL(a.gl),a.spriteBatch.stop(),a.shaderManager.setShader(a.shaderManager.fastShader),this.fastSpriteBatch.begin(this,a),this.fastSpriteBatch.render(this),a.spriteBatch.start())},b.SpriteBatch.prototype._renderCanvas=function(a){if(this.visible&&!(this.alpha<=0)&&this.children.length){var c=a.context;c.globalAlpha=this.worldAlpha,b.DisplayObject.prototype.updateTransform.call(this);for(var d=this.worldTransform,e=!0,f=0;f<this.children.length;f++){var g=this.children[f];if(g.visible){var h=g.texture,i=h.frame;if(c.globalAlpha=this.worldAlpha*g.alpha,g.rotation%(2*Math.PI)===0)e&&(c.setTransform(d.a,d.b,d.c,d.d,d.tx,d.ty),e=!1),c.drawImage(h.baseTexture.source,i.x,i.y,i.width,i.height,g.anchor.x*-i.width*g.scale.x+g.position.x+.5|0,g.anchor.y*-i.height*g.scale.y+g.position.y+.5|0,i.width*g.scale.x,i.height*g.scale.y);else{e||(e=!0),b.DisplayObject.prototype.updateTransform.call(g);var j=g.worldTransform;a.roundPixels?c.setTransform(j.a,j.b,j.c,j.d,0|j.tx,0|j.ty):c.setTransform(j.a,j.b,j.c,j.d,j.tx,j.ty),c.drawImage(h.baseTexture.source,i.x,i.y,i.width,i.height,g.anchor.x*-i.width+.5|0,g.anchor.y*-i.height+.5|0,i.width,i.height)}}}}},b.MovieClip=function(a){b.Sprite.call(this,a[0]),this.textures=a,this.animationSpeed=1,this.loop=!0,this.onComplete=null,this.currentFrame=0,this.playing=!1},b.MovieClip.prototype=Object.create(b.Sprite.prototype),b.MovieClip.prototype.constructor=b.MovieClip,Object.defineProperty(b.MovieClip.prototype,"totalFrames",{get:function(){return this.textures.length}}),b.MovieClip.prototype.stop=function(){this.playing=!1},b.MovieClip.prototype.play=function(){this.playing=!0},b.MovieClip.prototype.gotoAndStop=function(a){this.playing=!1,this.currentFrame=a;var b=this.currentFrame+.5|0;this.setTexture(this.textures[b%this.textures.length])},b.MovieClip.prototype.gotoAndPlay=function(a){this.currentFrame=a,this.playing=!0},b.MovieClip.prototype.updateTransform=function(){if(b.Sprite.prototype.updateTransform.call(this),this.playing){this.currentFrame+=this.animationSpeed;var a=this.currentFrame+.5|0;this.currentFrame=this.currentFrame%this.textures.length,this.loop||a<this.textures.length?this.setTexture(this.textures[a%this.textures.length]):a>=this.textures.length&&(this.gotoAndStop(this.textures.length-1),this.onComplete&&this.onComplete())}},b.MovieClip.fromFrames=function(a){for(var c=[],d=0;d<a.length;d++)c.push(new b.Texture.fromFrame(a[d]));return new b.MovieClip(c)},b.MovieClip.fromImages=function(a){for(var c=[],d=0;d<a.length;d++)c.push(new b.Texture.fromImage(a[d]));return new b.MovieClip(c)},b.FilterBlock=function(){this.visible=!0,this.renderable=!0},b.FilterBlock.prototype.constructor=b.FilterBlock,b.Text=function(a,c){this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.resolution=1,b.Sprite.call(this,b.Texture.fromCanvas(this.canvas)),this.setText(a),this.setStyle(c)},b.Text.prototype=Object.create(b.Sprite.prototype),b.Text.prototype.constructor=b.Text,Object.defineProperty(b.Text.prototype,"width",{get:function(){return this.dirty&&(this.updateText(),this.dirty=!1),this.scale.x*this.texture.frame.width},set:function(a){this.scale.x=a/this.texture.frame.width,this._width=a}}),Object.defineProperty(b.Text.prototype,"height",{get:function(){return this.dirty&&(this.updateText(),this.dirty=!1),this.scale.y*this.texture.frame.height},set:function(a){this.scale.y=a/this.texture.frame.height,this._height=a}}),b.Text.prototype.setStyle=function(a){a=a||{},a.font=a.font||"bold 20pt Arial",a.fill=a.fill||"black",a.align=a.align||"left",a.stroke=a.stroke||"black",a.strokeThickness=a.strokeThickness||0,a.wordWrap=a.wordWrap||!1,a.wordWrapWidth=a.wordWrapWidth||100,a.dropShadow=a.dropShadow||!1,a.dropShadowAngle=a.dropShadowAngle||Math.PI/6,a.dropShadowDistance=a.dropShadowDistance||4,a.dropShadowColor=a.dropShadowColor||"black",this.style=a,this.dirty=!0},b.Text.prototype.setText=function(a){this.text=a.toString()||" ",this.dirty=!0},b.Text.prototype.updateText=function(){this.texture.baseTexture.resolution=this.resolution,this.context.font=this.style.font;var a=this.text;this.style.wordWrap&&(a=this.wordWrap(this.text));for(var b=a.split(/(?:\r\n|\r|\n)/),c=[],d=0,e=this.determineFontProperties(this.style.font),f=0;f<b.length;f++){var g=this.context.measureText(b[f]).width;c[f]=g,d=Math.max(d,g)}var h=d+this.style.strokeThickness;this.style.dropShadow&&(h+=this.style.dropShadowDistance),this.canvas.width=(h+this.context.lineWidth)*this.resolution;var i=e.fontSize+this.style.strokeThickness,j=i*b.length;this.style.dropShadow&&(j+=this.style.dropShadowDistance),this.canvas.height=j*this.resolution,this.context.scale(this.resolution,this.resolution),navigator.isCocoonJS&&this.context.clearRect(0,0,this.canvas.width,this.canvas.height),this.context.font=this.style.font,this.context.strokeStyle=this.style.stroke,this.context.lineWidth=this.style.strokeThickness,this.context.textBaseline="alphabetic";var k,l;if(this.style.dropShadow){this.context.fillStyle=this.style.dropShadowColor;var m=Math.sin(this.style.dropShadowAngle)*this.style.dropShadowDistance,n=Math.cos(this.style.dropShadowAngle)*this.style.dropShadowDistance;for(f=0;f<b.length;f++)k=this.style.strokeThickness/2,l=this.style.strokeThickness/2+f*i+e.ascent,"right"===this.style.align?k+=d-c[f]:"center"===this.style.align&&(k+=(d-c[f])/2),this.style.fill&&this.context.fillText(b[f],k+m,l+n)}for(this.context.fillStyle=this.style.fill,f=0;f<b.length;f++)k=this.style.strokeThickness/2,l=this.style.strokeThickness/2+f*i+e.ascent,"right"===this.style.align?k+=d-c[f]:"center"===this.style.align&&(k+=(d-c[f])/2),this.style.stroke&&this.style.strokeThickness&&this.context.strokeText(b[f],k,l),this.style.fill&&this.context.fillText(b[f],k,l);this.updateTexture()},b.Text.prototype.updateTexture=function(){this.texture.baseTexture.width=this.canvas.width,this.texture.baseTexture.height=this.canvas.height,this.texture.crop.width=this.texture.frame.width=this.canvas.width,this.texture.crop.height=this.texture.frame.height=this.canvas.height,this._width=this.canvas.width,this._height=this.canvas.height,this.texture.baseTexture.dirty()},b.Text.prototype._renderWebGL=function(a){this.dirty&&(this.resolution=a.resolution,this.updateText(),this.dirty=!1),b.Sprite.prototype._renderWebGL.call(this,a)},b.Text.prototype._renderCanvas=function(a){this.dirty&&(this.resolution=a.resolution,this.updateText(),this.dirty=!1),b.Sprite.prototype._renderCanvas.call(this,a)},b.Text.prototype.determineFontProperties=function(a){var c=b.Text.fontPropertiesCache[a];if(!c){c={};var d=b.Text.fontPropertiesCanvas,e=b.Text.fontPropertiesContext;e.font=a;var f=Math.ceil(e.measureText("|Mq").width),g=Math.ceil(e.measureText("M").width),h=2*g;g=1.4*g|0,d.width=f,d.height=h,e.fillStyle="#f00",e.fillRect(0,0,f,h),e.font=a,e.textBaseline="alphabetic",e.fillStyle="#000",e.fillText("|Mq",0,g);var i,j,k=e.getImageData(0,0,f,h).data,l=k.length,m=4*f,n=0,o=!1;for(i=0;g>i;i++){for(j=0;m>j;j+=4)if(255!==k[n+j]){o=!0;break}if(o)break;n+=m}for(c.ascent=g-i,n=l-m,o=!1,i=h;i>g;i--){for(j=0;m>j;j+=4)if(255!==k[n+j]){o=!0;break}if(o)break;n-=m}c.descent=i-g,c.fontSize=c.ascent+c.descent,b.Text.fontPropertiesCache[a]=c}return c},b.Text.prototype.wordWrap=function(a){for(var b="",c=a.split("\n"),d=0;d<c.length;d++){for(var e=this.style.wordWrapWidth,f=c[d].split(" "),g=0;g<f.length;g++){var h=this.context.measureText(f[g]).width,i=h+this.context.measureText(" ").width;0===g||i>e?(g>0&&(b+="\n"),b+=f[g],e=this.style.wordWrapWidth-h):(e-=i,b+=" "+f[g])}d<c.length-1&&(b+="\n")}return b},b.Text.prototype.getBounds=function(a){return this.dirty&&(this.updateText(),this.dirty=!1),b.Sprite.prototype.getBounds.call(this,a)},b.Text.prototype.destroy=function(a){this.context=null,this.canvas=null,this.texture.destroy(void 0===a?!0:a)},b.Text.fontPropertiesCache={},b.Text.fontPropertiesCanvas=document.createElement("canvas"),b.Text.fontPropertiesContext=b.Text.fontPropertiesCanvas.getContext("2d"),b.BitmapText=function(a,c){b.DisplayObjectContainer.call(this),this.textWidth=0,this.textHeight=0,this._pool=[],this.setText(a),this.setStyle(c),this.updateText(),this.dirty=!1},b.BitmapText.prototype=Object.create(b.DisplayObjectContainer.prototype),b.BitmapText.prototype.constructor=b.BitmapText,b.BitmapText.prototype.setText=function(a){this.text=a||" ",this.dirty=!0},b.BitmapText.prototype.setStyle=function(a){a=a||{},a.align=a.align||"left",this.style=a;var c=a.font.split(" ");this.fontName=c[c.length-1],this.fontSize=c.length>=2?parseInt(c[c.length-2],10):b.BitmapText.fonts[this.fontName].size,this.dirty=!0,this.tint=a.tint},b.BitmapText.prototype.updateText=function(){for(var a=b.BitmapText.fonts[this.fontName],c=new b.Point,d=null,e=[],f=0,g=[],h=0,i=this.fontSize/a.size,j=0;j<this.text.length;j++){var k=this.text.charCodeAt(j);if(/(?:\r\n|\r|\n)/.test(this.text.charAt(j)))g.push(c.x),f=Math.max(f,c.x),h++,c.x=0,c.y+=a.lineHeight,d=null;else{var l=a.chars[k];l&&(d&&l.kerning[d]&&(c.x+=l.kerning[d]),e.push({texture:l.texture,line:h,charCode:k,position:new b.Point(c.x+l.xOffset,c.y+l.yOffset)}),c.x+=l.xAdvance,d=k)}}g.push(c.x),f=Math.max(f,c.x);var m=[];for(j=0;h>=j;j++){var n=0;"right"===this.style.align?n=f-g[j]:"center"===this.style.align&&(n=(f-g[j])/2),m.push(n)}var o=this.children.length,p=e.length,q=this.tint||16777215;for(j=0;p>j;j++){var r=o>j?this.children[j]:this._pool.pop();r?r.setTexture(e[j].texture):r=new b.Sprite(e[j].texture),r.position.x=(e[j].position.x+m[e[j].line])*i,r.position.y=e[j].position.y*i,r.scale.x=r.scale.y=i,r.tint=q,r.parent||this.addChild(r)}for(;this.children.length>p;){var s=this.getChildAt(this.children.length-1);this._pool.push(s),this.removeChild(s)}this.textWidth=f*i,this.textHeight=(c.y+a.lineHeight)*i},b.BitmapText.prototype.updateTransform=function(){this.dirty&&(this.updateText(),this.dirty=!1),b.DisplayObjectContainer.prototype.updateTransform.call(this)},b.BitmapText.fonts={},b.InteractionData=function(){this.global=new b.Point,this.target=null,this.originalEvent=null},b.InteractionData.prototype.getLocalPosition=function(a,c){var d=a.worldTransform,e=this.global,f=d.a,g=d.c,h=d.tx,i=d.b,j=d.d,k=d.ty,l=1/(f*j+g*-i);return c=c||new b.Point,c.x=j*l*e.x+-g*l*e.y+(k*g-h*j)*l,c.y=f*l*e.y+-i*l*e.x+(-k*f+h*i)*l,c},b.InteractionData.prototype.constructor=b.InteractionData,b.InteractionManager=function(a){this.stage=a,this.mouse=new b.InteractionData,this.touches={},this.tempPoint=new b.Point,this.mouseoverEnabled=!0,this.pool=[],this.interactiveItems=[],this.interactionDOMElement=null,this.onMouseMove=this.onMouseMove.bind(this),this.onMouseDown=this.onMouseDown.bind(this),this.onMouseOut=this.onMouseOut.bind(this),this.onMouseUp=this.onMouseUp.bind(this),this.onTouchStart=this.onTouchStart.bind(this),this.onTouchEnd=this.onTouchEnd.bind(this),this.onTouchMove=this.onTouchMove.bind(this),this.last=0,this.currentCursorStyle="inherit",this.mouseOut=!1,this.resolution=1},b.InteractionManager.prototype.constructor=b.InteractionManager,b.InteractionManager.prototype.collectInteractiveSprite=function(a,b){for(var c=a.children,d=c.length,e=d-1;e>=0;e--){var f=c[e];f._interactive?(b.interactiveChildren=!0,this.interactiveItems.push(f),f.children.length>0&&this.collectInteractiveSprite(f,f)):(f.__iParent=null,f.children.length>0&&this.collectInteractiveSprite(f,b))
}},b.InteractionManager.prototype.setTarget=function(a){this.target=a,this.resolution=a.resolution,null===this.interactionDOMElement&&this.setTargetDomElement(a.view)},b.InteractionManager.prototype.setTargetDomElement=function(a){this.removeEvents(),window.navigator.msPointerEnabled&&(a.style["-ms-content-zooming"]="none",a.style["-ms-touch-action"]="none"),this.interactionDOMElement=a,a.addEventListener("mousemove",this.onMouseMove,!0),a.addEventListener("mousedown",this.onMouseDown,!0),a.addEventListener("mouseout",this.onMouseOut,!0),a.addEventListener("touchstart",this.onTouchStart,!0),a.addEventListener("touchend",this.onTouchEnd,!0),a.addEventListener("touchmove",this.onTouchMove,!0),window.addEventListener("mouseup",this.onMouseUp,!0)},b.InteractionManager.prototype.removeEvents=function(){this.interactionDOMElement&&(this.interactionDOMElement.style["-ms-content-zooming"]="",this.interactionDOMElement.style["-ms-touch-action"]="",this.interactionDOMElement.removeEventListener("mousemove",this.onMouseMove,!0),this.interactionDOMElement.removeEventListener("mousedown",this.onMouseDown,!0),this.interactionDOMElement.removeEventListener("mouseout",this.onMouseOut,!0),this.interactionDOMElement.removeEventListener("touchstart",this.onTouchStart,!0),this.interactionDOMElement.removeEventListener("touchend",this.onTouchEnd,!0),this.interactionDOMElement.removeEventListener("touchmove",this.onTouchMove,!0),this.interactionDOMElement=null,window.removeEventListener("mouseup",this.onMouseUp,!0))},b.InteractionManager.prototype.update=function(){if(this.target){var a=Date.now(),c=a-this.last;if(c=c*b.INTERACTION_FREQUENCY/1e3,!(1>c)){this.last=a;var d=0;this.dirty&&this.rebuildInteractiveGraph();var e=this.interactiveItems.length,f="inherit",g=!1;for(d=0;e>d;d++){var h=this.interactiveItems[d];h.__hit=this.hitTest(h,this.mouse),this.mouse.target=h,h.__hit&&!g?(h.buttonMode&&(f=h.defaultCursor),h.interactiveChildren||(g=!0),h.__isOver||(h.mouseover&&h.mouseover(this.mouse),h.__isOver=!0)):h.__isOver&&(h.mouseout&&h.mouseout(this.mouse),h.__isOver=!1)}this.currentCursorStyle!==f&&(this.currentCursorStyle=f,this.interactionDOMElement.style.cursor=f)}}},b.InteractionManager.prototype.rebuildInteractiveGraph=function(){this.dirty=!1;for(var a=this.interactiveItems.length,b=0;a>b;b++)this.interactiveItems[b].interactiveChildren=!1;this.interactiveItems=[],this.stage.interactive&&this.interactiveItems.push(this.stage),this.collectInteractiveSprite(this.stage,this.stage)},b.InteractionManager.prototype.onMouseMove=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a;var b=this.interactionDOMElement.getBoundingClientRect();this.mouse.global.x=(a.clientX-b.left)*(this.target.width/b.width)/this.resolution,this.mouse.global.y=(a.clientY-b.top)*(this.target.height/b.height)/this.resolution;for(var c=this.interactiveItems.length,d=0;c>d;d++){var e=this.interactiveItems[d];e.mousemove&&e.mousemove(this.mouse)}},b.InteractionManager.prototype.onMouseDown=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a,b.AUTO_PREVENT_DEFAULT&&this.mouse.originalEvent.preventDefault();for(var c=this.interactiveItems.length,d=this.mouse.originalEvent,e=2===d.button||3===d.which,f=e?"rightdown":"mousedown",g=e?"rightclick":"click",h=e?"__rightIsDown":"__mouseIsDown",i=e?"__isRightDown":"__isDown",j=0;c>j;j++){var k=this.interactiveItems[j];if((k[f]||k[g])&&(k[h]=!0,k.__hit=this.hitTest(k,this.mouse),k.__hit&&(k[f]&&k[f](this.mouse),k[i]=!0,!k.interactiveChildren)))break}},b.InteractionManager.prototype.onMouseOut=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a;var b=this.interactiveItems.length;this.interactionDOMElement.style.cursor="inherit";for(var c=0;b>c;c++){var d=this.interactiveItems[c];d.__isOver&&(this.mouse.target=d,d.mouseout&&d.mouseout(this.mouse),d.__isOver=!1)}this.mouseOut=!0,this.mouse.global.x=-1e4,this.mouse.global.y=-1e4},b.InteractionManager.prototype.onMouseUp=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a;for(var b=this.interactiveItems.length,c=!1,d=this.mouse.originalEvent,e=2===d.button||3===d.which,f=e?"rightup":"mouseup",g=e?"rightclick":"click",h=e?"rightupoutside":"mouseupoutside",i=e?"__isRightDown":"__isDown",j=0;b>j;j++){var k=this.interactiveItems[j];(k[g]||k[f]||k[h])&&(k.__hit=this.hitTest(k,this.mouse),k.__hit&&!c?(k[f]&&k[f](this.mouse),k[i]&&k[g]&&k[g](this.mouse),k.interactiveChildren||(c=!0)):k[i]&&k[h]&&k[h](this.mouse),k[i]=!1)}},b.InteractionManager.prototype.hitTest=function(a,c){var d=c.global;if(!a.worldVisible)return!1;var e,f=a.worldTransform,g=f.a,h=f.b,i=f.c,j=f.tx,k=f.d,l=f.ty,m=1/(g*k+i*-h),n=k*m*d.x+-i*m*d.y+(l*i-j*k)*m,o=g*m*d.y+-h*m*d.x+(-l*g+j*h)*m;if(c.target=a,a.hitArea&&a.hitArea.contains)return a.hitArea.contains(n,o)?(c.target=a,!0):!1;if(a instanceof b.Sprite){var p,q=a.texture.frame.width,r=a.texture.frame.height,s=-q*a.anchor.x;if(n>s&&s+q>n&&(p=-r*a.anchor.y,o>p&&p+r>o))return c.target=a,!0}else if(a instanceof b.Graphics){var t=a.graphicsData;for(e=0;e<t.length;e++){var u=t[e];if(u.fill&&u.shape&&u.shape.contains(n,o))return c.target=a,!0}}var v=a.children.length;for(e=0;v>e;e++){var w=a.children[e],x=this.hitTest(w,c);if(x)return c.target=a,!0}return!1},b.InteractionManager.prototype.onTouchMove=function(a){this.dirty&&this.rebuildInteractiveGraph();var b,c=this.interactionDOMElement.getBoundingClientRect(),d=a.changedTouches,e=0;for(e=0;e<d.length;e++){var f=d[e];b=this.touches[f.identifier],b.originalEvent=a,b.global.x=(f.clientX-c.left)*(this.target.width/c.width)/this.resolution,b.global.y=(f.clientY-c.top)*(this.target.height/c.height)/this.resolution,!navigator.isCocoonJS||c.left||c.top||a.target.style.width||a.target.style.height||(b.global.x=f.clientX,b.global.y=f.clientY);for(var g=0;g<this.interactiveItems.length;g++){var h=this.interactiveItems[g];h.touchmove&&h.__touchData&&h.__touchData[f.identifier]&&h.touchmove(b)}}},b.InteractionManager.prototype.onTouchStart=function(a){this.dirty&&this.rebuildInteractiveGraph();var c=this.interactionDOMElement.getBoundingClientRect();b.AUTO_PREVENT_DEFAULT&&a.preventDefault();for(var d=a.changedTouches,e=0;e<d.length;e++){var f=d[e],g=this.pool.pop();g||(g=new b.InteractionData),g.originalEvent=a,this.touches[f.identifier]=g,g.global.x=(f.clientX-c.left)*(this.target.width/c.width)/this.resolution,g.global.y=(f.clientY-c.top)*(this.target.height/c.height)/this.resolution,!navigator.isCocoonJS||c.left||c.top||a.target.style.width||a.target.style.height||(g.global.x=f.clientX,g.global.y=f.clientY);for(var h=this.interactiveItems.length,i=0;h>i;i++){var j=this.interactiveItems[i];if((j.touchstart||j.tap)&&(j.__hit=this.hitTest(j,g),j.__hit&&(j.touchstart&&j.touchstart(g),j.__isDown=!0,j.__touchData=j.__touchData||{},j.__touchData[f.identifier]=g,!j.interactiveChildren)))break}}},b.InteractionManager.prototype.onTouchEnd=function(a){this.dirty&&this.rebuildInteractiveGraph();for(var b=this.interactionDOMElement.getBoundingClientRect(),c=a.changedTouches,d=0;d<c.length;d++){var e=c[d],f=this.touches[e.identifier],g=!1;f.global.x=(e.clientX-b.left)*(this.target.width/b.width)/this.resolution,f.global.y=(e.clientY-b.top)*(this.target.height/b.height)/this.resolution,!navigator.isCocoonJS||b.left||b.top||a.target.style.width||a.target.style.height||(f.global.x=e.clientX,f.global.y=e.clientY);for(var h=this.interactiveItems.length,i=0;h>i;i++){var j=this.interactiveItems[i];j.__touchData&&j.__touchData[e.identifier]&&(j.__hit=this.hitTest(j,j.__touchData[e.identifier]),f.originalEvent=a,(j.touchend||j.tap)&&(j.__hit&&!g?(j.touchend&&j.touchend(f),j.__isDown&&j.tap&&j.tap(f),j.interactiveChildren||(g=!0)):j.__isDown&&j.touchendoutside&&j.touchendoutside(f),j.__isDown=!1),j.__touchData[e.identifier]=null)}this.pool.push(f),this.touches[e.identifier]=null}},b.Stage=function(a){b.DisplayObjectContainer.call(this),this.worldTransform=new b.Matrix,this.interactive=!0,this.interactionManager=new b.InteractionManager(this),this.dirty=!0,this.stage=this,this.stage.hitArea=new b.Rectangle(0,0,1e5,1e5),this.setBackgroundColor(a)},b.Stage.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Stage.prototype.constructor=b.Stage,b.Stage.prototype.setInteractionDelegate=function(a){this.interactionManager.setTargetDomElement(a)},b.Stage.prototype.updateTransform=function(){this.worldAlpha=1;for(var a=0,b=this.children.length;b>a;a++)this.children[a].updateTransform();this.dirty&&(this.dirty=!1,this.interactionManager.dirty=!0),this.interactive&&this.interactionManager.update()},b.Stage.prototype.setBackgroundColor=function(a){this.backgroundColor=a||0,this.backgroundColorSplit=b.hex2rgb(this.backgroundColor);var c=this.backgroundColor.toString(16);c="000000".substr(0,6-c.length)+c,this.backgroundColorString="#"+c},b.Stage.prototype.getMousePosition=function(){return this.interactionManager.mouse.global},function(a){for(var b=0,c=["ms","moz","webkit","o"],d=0;d<c.length&&!a.requestAnimationFrame;++d)a.requestAnimationFrame=a[c[d]+"RequestAnimationFrame"],a.cancelAnimationFrame=a[c[d]+"CancelAnimationFrame"]||a[c[d]+"CancelRequestAnimationFrame"];a.requestAnimationFrame||(a.requestAnimationFrame=function(c){var d=(new Date).getTime(),e=Math.max(0,16-(d-b)),f=a.setTimeout(function(){c(d+e)},e);return b=d+e,f}),a.cancelAnimationFrame||(a.cancelAnimationFrame=function(a){clearTimeout(a)}),a.requestAnimFrame=a.requestAnimationFrame}(this),b.hex2rgb=function(a){return[(a>>16&255)/255,(a>>8&255)/255,(255&a)/255]},b.rgb2hex=function(a){return(255*a[0]<<16)+(255*a[1]<<8)+255*a[2]},"function"!=typeof Function.prototype.bind&&(Function.prototype.bind=function(){return function(a){function b(){for(var d=arguments.length,f=new Array(d);d--;)f[d]=arguments[d];return f=e.concat(f),c.apply(this instanceof b?this:a,f)}var c=this,d=arguments.length-1,e=[];if(d>0)for(e.length=d;d--;)e[d]=arguments[d+1];if("function"!=typeof c)throw new TypeError;return b.prototype=function f(a){return a&&(f.prototype=a),this instanceof f?void 0:new f}(c.prototype),b}}()),b.AjaxRequest=function(){var a=["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.3.0","Microsoft.XMLHTTP"];if(!window.ActiveXObject)return window.XMLHttpRequest?new window.XMLHttpRequest:!1;for(var b=0;b<a.length;b++)try{return new window.ActiveXObject(a[b])}catch(c){}},b.canUseNewCanvasBlendModes=function(){if("undefined"==typeof document)return!1;var a=document.createElement("canvas");a.width=1,a.height=1;var b=a.getContext("2d");return b.fillStyle="#000",b.fillRect(0,0,1,1),b.globalCompositeOperation="multiply",b.fillStyle="#fff",b.fillRect(0,0,1,1),0===b.getImageData(0,0,1,1).data[0]},b.getNextPowerOfTwo=function(a){if(a>0&&0===(a&a-1))return a;for(var b=1;a>b;)b<<=1;return b},b.EventTarget={call:function(a){a&&(a=a.prototype||a,b.EventTarget.mixin(a))},mixin:function(a){a.listeners=function(a){return this._listeners=this._listeners||{},this._listeners[a]?this._listeners[a].slice():[]},a.emit=a.dispatchEvent=function(a,c){if(this._listeners=this._listeners||{},"object"==typeof a&&(c=a,a=a.type),c&&c.__isEventObject===!0||(c=new b.Event(this,a,c)),this._listeners&&this._listeners[a]){var d,e=this._listeners[a].slice(0),f=e.length,g=e[0];for(d=0;f>d;g=e[++d])if(g.call(this,c),c.stoppedImmediate)return this;if(c.stopped)return this}return this.parent&&this.parent.emit&&this.parent.emit.call(this.parent,a,c),this},a.on=a.addEventListener=function(a,b){return this._listeners=this._listeners||{},(this._listeners[a]=this._listeners[a]||[]).push(b),this},a.once=function(a,b){function c(){b.apply(d.off(a,c),arguments)}this._listeners=this._listeners||{};var d=this;return c._originalHandler=b,this.on(a,c)},a.off=a.removeEventListener=function(a,b){if(this._listeners=this._listeners||{},!this._listeners[a])return this;for(var c=this._listeners[a],d=b?c.length:0;d-->0;)(c[d]===b||c[d]._originalHandler===b)&&c.splice(d,1);return 0===c.length&&delete this._listeners[a],this},a.removeAllListeners=function(a){return this._listeners=this._listeners||{},this._listeners[a]?(delete this._listeners[a],this):this}}},b.Event=function(a,b,c){this.__isEventObject=!0,this.stopped=!1,this.stoppedImmediate=!1,this.target=a,this.type=b,this.data=c,this.content=c,this.timeStamp=Date.now()},b.Event.prototype.stopPropagation=function(){this.stopped=!0},b.Event.prototype.stopImmediatePropagation=function(){this.stoppedImmediate=!0},b.autoDetectRenderer=function(a,c,d){a||(a=800),c||(c=600);var e=function(){try{var a=document.createElement("canvas");return!!window.WebGLRenderingContext&&(a.getContext("webgl")||a.getContext("experimental-webgl"))}catch(b){return!1}}();return e?new b.WebGLRenderer(a,c,d):new b.CanvasRenderer(a,c,d)},b.autoDetectRecommendedRenderer=function(a,c,d){a||(a=800),c||(c=600);var e=function(){try{var a=document.createElement("canvas");return!!window.WebGLRenderingContext&&(a.getContext("webgl")||a.getContext("experimental-webgl"))}catch(b){return!1}}(),f=/Android/i.test(navigator.userAgent);return e&&!f?new b.WebGLRenderer(a,c,d):new b.CanvasRenderer(a,c,d)},b.PolyK={},b.PolyK.Triangulate=function(a){var c=!0,d=a.length>>1;if(3>d)return[];for(var e=[],f=[],g=0;d>g;g++)f.push(g);g=0;for(var h=d;h>3;){var i=f[(g+0)%h],j=f[(g+1)%h],k=f[(g+2)%h],l=a[2*i],m=a[2*i+1],n=a[2*j],o=a[2*j+1],p=a[2*k],q=a[2*k+1],r=!1;if(b.PolyK._convex(l,m,n,o,p,q,c)){r=!0;for(var s=0;h>s;s++){var t=f[s];if(t!==i&&t!==j&&t!==k&&b.PolyK._PointInTriangle(a[2*t],a[2*t+1],l,m,n,o,p,q)){r=!1;break}}}if(r)e.push(i,j,k),f.splice((g+1)%h,1),h--,g=0;else if(g++>3*h){if(!c)return null;for(e=[],f=[],g=0;d>g;g++)f.push(g);g=0,h=d,c=!1}}return e.push(f[0],f[1],f[2]),e},b.PolyK._PointInTriangle=function(a,b,c,d,e,f,g,h){var i=g-c,j=h-d,k=e-c,l=f-d,m=a-c,n=b-d,o=i*i+j*j,p=i*k+j*l,q=i*m+j*n,r=k*k+l*l,s=k*m+l*n,t=1/(o*r-p*p),u=(r*q-p*s)*t,v=(o*s-p*q)*t;return u>=0&&v>=0&&1>u+v},b.PolyK._convex=function(a,b,c,d,e,f,g){return(b-d)*(e-c)+(c-a)*(f-d)>=0===g},b.initDefaultShaders=function(){},b.CompileVertexShader=function(a,c){return b._CompileShader(a,c,a.VERTEX_SHADER)},b.CompileFragmentShader=function(a,c){return b._CompileShader(a,c,a.FRAGMENT_SHADER)},b._CompileShader=function(a,b,c){var d=b.join("\n"),e=a.createShader(c);return a.shaderSource(e,d),a.compileShader(e),a.getShaderParameter(e,a.COMPILE_STATUS)?e:(window.console.log(a.getShaderInfoLog(e)),null)},b.compileProgram=function(a,c,d){var e=b.CompileFragmentShader(a,d),f=b.CompileVertexShader(a,c),g=a.createProgram();return a.attachShader(g,f),a.attachShader(g,e),a.linkProgram(g),a.getProgramParameter(g,a.LINK_STATUS)||window.console.log("Could not initialise shaders"),g},b.PixiShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision lowp float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;","}"],this.textureCount=0,this.firstRun=!0,this.dirty=!0,this.attributes=[],this.init()},b.PixiShader.prototype.constructor=b.PixiShader,b.PixiShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc||b.PixiShader.defaultVertexSrc,this.fragmentSrc);a.useProgram(c),this.uSampler=a.getUniformLocation(c,"uSampler"),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.dimensions=a.getUniformLocation(c,"dimensions"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.aTextureCoord=a.getAttribLocation(c,"aTextureCoord"),this.colorAttribute=a.getAttribLocation(c,"aColor"),-1===this.colorAttribute&&(this.colorAttribute=2),this.attributes=[this.aVertexPosition,this.aTextureCoord,this.colorAttribute];for(var d in this.uniforms)this.uniforms[d].uniformLocation=a.getUniformLocation(c,d);this.initUniforms(),this.program=c},b.PixiShader.prototype.initUniforms=function(){this.textureCount=1;var a,b=this.gl;for(var c in this.uniforms){a=this.uniforms[c];var d=a.type;"sampler2D"===d?(a._init=!1,null!==a.value&&this.initSampler2D(a)):"mat2"===d||"mat3"===d||"mat4"===d?(a.glMatrix=!0,a.glValueLength=1,"mat2"===d?a.glFunc=b.uniformMatrix2fv:"mat3"===d?a.glFunc=b.uniformMatrix3fv:"mat4"===d&&(a.glFunc=b.uniformMatrix4fv)):(a.glFunc=b["uniform"+d],a.glValueLength="2f"===d||"2i"===d?2:"3f"===d||"3i"===d?3:"4f"===d||"4i"===d?4:1)}},b.PixiShader.prototype.initSampler2D=function(a){if(a.value&&a.value.baseTexture&&a.value.baseTexture.hasLoaded){var b=this.gl;if(b.activeTexture(b["TEXTURE"+this.textureCount]),b.bindTexture(b.TEXTURE_2D,a.value.baseTexture._glTextures[b.id]),a.textureData){var c=a.textureData,d=c.magFilter?c.magFilter:b.LINEAR,e=c.minFilter?c.minFilter:b.LINEAR,f=c.wrapS?c.wrapS:b.CLAMP_TO_EDGE,g=c.wrapT?c.wrapT:b.CLAMP_TO_EDGE,h=c.luminance?b.LUMINANCE:b.RGBA;if(c.repeat&&(f=b.REPEAT,g=b.REPEAT),b.pixelStorei(b.UNPACK_FLIP_Y_WEBGL,!!c.flipY),c.width){var i=c.width?c.width:512,j=c.height?c.height:2,k=c.border?c.border:0;b.texImage2D(b.TEXTURE_2D,0,h,i,j,k,h,b.UNSIGNED_BYTE,null)}else b.texImage2D(b.TEXTURE_2D,0,h,b.RGBA,b.UNSIGNED_BYTE,a.value.baseTexture.source);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,d),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,e),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,f),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,g)}b.uniform1i(a.uniformLocation,this.textureCount),a._init=!0,this.textureCount++}},b.PixiShader.prototype.syncUniforms=function(){this.textureCount=1;var a,c=this.gl;for(var d in this.uniforms)a=this.uniforms[d],1===a.glValueLength?a.glMatrix===!0?a.glFunc.call(c,a.uniformLocation,a.transpose,a.value):a.glFunc.call(c,a.uniformLocation,a.value):2===a.glValueLength?a.glFunc.call(c,a.uniformLocation,a.value.x,a.value.y):3===a.glValueLength?a.glFunc.call(c,a.uniformLocation,a.value.x,a.value.y,a.value.z):4===a.glValueLength?a.glFunc.call(c,a.uniformLocation,a.value.x,a.value.y,a.value.z,a.value.w):"sampler2D"===a.type&&(a._init?(c.activeTexture(c["TEXTURE"+this.textureCount]),a.value.baseTexture._dirty[c.id]?b.instances[c.id].updateTexture(a.value.baseTexture):c.bindTexture(c.TEXTURE_2D,a.value.baseTexture._glTextures[c.id]),c.uniform1i(a.uniformLocation,this.textureCount),this.textureCount++):this.initSampler2D(a))},b.PixiShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attributes=null},b.PixiShader.defaultVertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","attribute vec4 aColor;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","varying vec2 vTextureCoord;","varying vec4 vColor;","const vec2 center = vec2(-1.0, 1.0);","void main(void) {","   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);","   vTextureCoord = aTextureCoord;","   vec3 color = mod(vec3(aColor.y/65536.0, aColor.y/256.0, aColor.y), 256.0) / 256.0;","   vColor = vec4(color * aColor.x, aColor.x);","}"],b.PixiFastShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision lowp float;","varying vec2 vTextureCoord;","varying float vColor;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aPositionCoord;","attribute vec2 aScale;","attribute float aRotation;","attribute vec2 aTextureCoord;","attribute float aColor;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","uniform mat3 uMatrix;","varying vec2 vTextureCoord;","varying float vColor;","const vec2 center = vec2(-1.0, 1.0);","void main(void) {","   vec2 v;","   vec2 sv = aVertexPosition * aScale;","   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);","   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);","   v = ( uMatrix * vec3(v + aPositionCoord , 1.0) ).xy ;","   gl_Position = vec4( ( v / projectionVector) + center , 0.0, 1.0);","   vTextureCoord = aTextureCoord;","   vColor = aColor;","}"],this.textureCount=0,this.init()},b.PixiFastShader.prototype.constructor=b.PixiFastShader,b.PixiFastShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.uSampler=a.getUniformLocation(c,"uSampler"),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.dimensions=a.getUniformLocation(c,"dimensions"),this.uMatrix=a.getUniformLocation(c,"uMatrix"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.aPositionCoord=a.getAttribLocation(c,"aPositionCoord"),this.aScale=a.getAttribLocation(c,"aScale"),this.aRotation=a.getAttribLocation(c,"aRotation"),this.aTextureCoord=a.getAttribLocation(c,"aTextureCoord"),this.colorAttribute=a.getAttribLocation(c,"aColor"),-1===this.colorAttribute&&(this.colorAttribute=2),this.attributes=[this.aVertexPosition,this.aPositionCoord,this.aScale,this.aRotation,this.aTextureCoord,this.colorAttribute],this.program=c},b.PixiFastShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attributes=null},b.StripShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","uniform float alpha;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * alpha;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","uniform mat3 translationMatrix;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","varying vec2 vTextureCoord;","void main(void) {","   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);","   v -= offsetVector.xyx;","   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);","   vTextureCoord = aTextureCoord;","}"],this.init()},b.StripShader.prototype.constructor=b.StripShader,b.StripShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.uSampler=a.getUniformLocation(c,"uSampler"),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.colorAttribute=a.getAttribLocation(c,"aColor"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.aTextureCoord=a.getAttribLocation(c,"aTextureCoord"),this.attributes=[this.aVertexPosition,this.aTextureCoord],this.translationMatrix=a.getUniformLocation(c,"translationMatrix"),this.alpha=a.getUniformLocation(c,"alpha"),this.program=c},b.StripShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attribute=null},b.PrimitiveShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision mediump float;","varying vec4 vColor;","void main(void) {","   gl_FragColor = vColor;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","attribute vec4 aColor;","uniform mat3 translationMatrix;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","uniform float alpha;","uniform vec3 tint;","varying vec4 vColor;","void main(void) {","   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);","   v -= offsetVector.xyx;","   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);","   vColor = aColor * vec4(tint * alpha, alpha);","}"],this.init()},b.PrimitiveShader.prototype.constructor=b.PrimitiveShader,b.PrimitiveShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.tintColor=a.getUniformLocation(c,"tint"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.colorAttribute=a.getAttribLocation(c,"aColor"),this.attributes=[this.aVertexPosition,this.colorAttribute],this.translationMatrix=a.getUniformLocation(c,"translationMatrix"),this.alpha=a.getUniformLocation(c,"alpha"),this.program=c},b.PrimitiveShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attributes=null},b.ComplexPrimitiveShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision mediump float;","varying vec4 vColor;","void main(void) {","   gl_FragColor = vColor;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","uniform mat3 translationMatrix;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","uniform vec3 tint;","uniform float alpha;","uniform vec3 color;","varying vec4 vColor;","void main(void) {","   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);","   v -= offsetVector.xyx;","   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);","   vColor = vec4(color * alpha * tint, alpha);","}"],this.init()},b.ComplexPrimitiveShader.prototype.constructor=b.ComplexPrimitiveShader,b.ComplexPrimitiveShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.tintColor=a.getUniformLocation(c,"tint"),this.color=a.getUniformLocation(c,"color"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.attributes=[this.aVertexPosition,this.colorAttribute],this.translationMatrix=a.getUniformLocation(c,"translationMatrix"),this.alpha=a.getUniformLocation(c,"alpha"),this.program=c},b.ComplexPrimitiveShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attribute=null},b.WebGLGraphics=function(){},b.WebGLGraphics.renderGraphics=function(a,c){var d,e=c.gl,f=c.projection,g=c.offset,h=c.shaderManager.primitiveShader;a.dirty&&b.WebGLGraphics.updateGraphics(a,e);for(var i=a._webGL[e.id],j=0;j<i.data.length;j++)1===i.data[j].mode?(d=i.data[j],c.stencilManager.pushStencil(a,d,c),e.drawElements(e.TRIANGLE_FAN,4,e.UNSIGNED_SHORT,2*(d.indices.length-4)),c.stencilManager.popStencil(a,d,c)):(d=i.data[j],c.shaderManager.setShader(h),h=c.shaderManager.primitiveShader,e.uniformMatrix3fv(h.translationMatrix,!1,a.worldTransform.toArray(!0)),e.uniform2f(h.projectionVector,f.x,-f.y),e.uniform2f(h.offsetVector,-g.x,-g.y),e.uniform3fv(h.tintColor,b.hex2rgb(a.tint)),e.uniform1f(h.alpha,a.worldAlpha),e.bindBuffer(e.ARRAY_BUFFER,d.buffer),e.vertexAttribPointer(h.aVertexPosition,2,e.FLOAT,!1,24,0),e.vertexAttribPointer(h.colorAttribute,4,e.FLOAT,!1,24,8),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,d.indexBuffer),e.drawElements(e.TRIANGLE_STRIP,d.indices.length,e.UNSIGNED_SHORT,0))},b.WebGLGraphics.updateGraphics=function(a,c){var d=a._webGL[c.id];d||(d=a._webGL[c.id]={lastIndex:0,data:[],gl:c}),a.dirty=!1;var e;if(a.clearDirty){for(a.clearDirty=!1,e=0;e<d.data.length;e++){var f=d.data[e];f.reset(),b.WebGLGraphics.graphicsDataPool.push(f)}d.data=[],d.lastIndex=0}var g;for(e=d.lastIndex;e<a.graphicsData.length;e++){var h=a.graphicsData[e];if(h.type===b.Graphics.POLY){if(h.points=h.shape.points.slice(),h.shape.closed&&h.points[0]!==h.points[h.points.length-2]&&h.points[1]!==h.points[h.points.length-1]&&h.points.push(h.points[0],h.points[1]),h.fill&&h.points.length>=6)if(h.points.length<12){g=b.WebGLGraphics.switchMode(d,0);var i=b.WebGLGraphics.buildPoly(h,g);i||(g=b.WebGLGraphics.switchMode(d,1),b.WebGLGraphics.buildComplexPoly(h,g))}else g=b.WebGLGraphics.switchMode(d,1),b.WebGLGraphics.buildComplexPoly(h,g);h.lineWidth>0&&(g=b.WebGLGraphics.switchMode(d,0),b.WebGLGraphics.buildLine(h,g))}else g=b.WebGLGraphics.switchMode(d,0),h.type===b.Graphics.RECT?b.WebGLGraphics.buildRectangle(h,g):h.type===b.Graphics.CIRC||h.type===b.Graphics.ELIP?b.WebGLGraphics.buildCircle(h,g):h.type===b.Graphics.RREC&&b.WebGLGraphics.buildRoundedRectangle(h,g);d.lastIndex++}for(e=0;e<d.data.length;e++)g=d.data[e],g.dirty&&g.upload()},b.WebGLGraphics.switchMode=function(a,c){var d;return a.data.length?(d=a.data[a.data.length-1],(d.mode!==c||1===c)&&(d=b.WebGLGraphics.graphicsDataPool.pop()||new b.WebGLGraphicsData(a.gl),d.mode=c,a.data.push(d))):(d=b.WebGLGraphics.graphicsDataPool.pop()||new b.WebGLGraphicsData(a.gl),d.mode=c,a.data.push(d)),d.dirty=!0,d},b.WebGLGraphics.buildRectangle=function(a,c){var d=a.shape,e=d.x,f=d.y,g=d.width,h=d.height;if(a.fill){var i=b.hex2rgb(a.fillColor),j=a.fillAlpha,k=i[0]*j,l=i[1]*j,m=i[2]*j,n=c.points,o=c.indices,p=n.length/6;n.push(e,f),n.push(k,l,m,j),n.push(e+g,f),n.push(k,l,m,j),n.push(e,f+h),n.push(k,l,m,j),n.push(e+g,f+h),n.push(k,l,m,j),o.push(p,p,p+1,p+2,p+3,p+3)}if(a.lineWidth){var q=a.points;a.points=[e,f,e+g,f,e+g,f+h,e,f+h,e,f],b.WebGLGraphics.buildLine(a,c),a.points=q}},b.WebGLGraphics.buildRoundedRectangle=function(a,c){var d=a.shape,e=d.x,f=d.y,g=d.width,h=d.height,i=d.radius,j=[];if(j.push(e,f+i),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e,f+h-i,e,f+h,e+i,f+h)),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e+g-i,f+h,e+g,f+h,e+g,f+h-i)),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e+g,f+i,e+g,f,e+g-i,f)),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e+i,f,e,f,e,f+i)),a.fill){var k=b.hex2rgb(a.fillColor),l=a.fillAlpha,m=k[0]*l,n=k[1]*l,o=k[2]*l,p=c.points,q=c.indices,r=p.length/6,s=b.PolyK.Triangulate(j),t=0;for(t=0;t<s.length;t+=3)q.push(s[t]+r),q.push(s[t]+r),q.push(s[t+1]+r),q.push(s[t+2]+r),q.push(s[t+2]+r);for(t=0;t<j.length;t++)p.push(j[t],j[++t],m,n,o,l)}if(a.lineWidth){var u=a.points;a.points=j,b.WebGLGraphics.buildLine(a,c),a.points=u}},b.WebGLGraphics.quadraticBezierCurve=function(a,b,c,d,e,f){function g(a,b,c){var d=b-a;return a+d*c}for(var h,i,j,k,l,m,n=20,o=[],p=0,q=0;n>=q;q++)p=q/n,h=g(a,c,p),i=g(b,d,p),j=g(c,e,p),k=g(d,f,p),l=g(h,j,p),m=g(i,k,p),o.push(l,m);return o},b.WebGLGraphics.buildCircle=function(a,c){var d,e,f=a.shape,g=f.x,h=f.y;a.type===b.Graphics.CIRC?(d=f.radius,e=f.radius):(d=f.width,e=f.height);var i=40,j=2*Math.PI/i,k=0;if(a.fill){var l=b.hex2rgb(a.fillColor),m=a.fillAlpha,n=l[0]*m,o=l[1]*m,p=l[2]*m,q=c.points,r=c.indices,s=q.length/6;for(r.push(s),k=0;i+1>k;k++)q.push(g,h,n,o,p,m),q.push(g+Math.sin(j*k)*d,h+Math.cos(j*k)*e,n,o,p,m),r.push(s++,s++);r.push(s-1)}if(a.lineWidth){var t=a.points;for(a.points=[],k=0;i+1>k;k++)a.points.push(g+Math.sin(j*k)*d,h+Math.cos(j*k)*e);b.WebGLGraphics.buildLine(a,c),a.points=t}},b.WebGLGraphics.buildLine=function(a,c){var d=0,e=a.points;if(0!==e.length){if(a.lineWidth%2)for(d=0;d<e.length;d++)e[d]+=.5;var f=new b.Point(e[0],e[1]),g=new b.Point(e[e.length-2],e[e.length-1]);if(f.x===g.x&&f.y===g.y){e=e.slice(),e.pop(),e.pop(),g=new b.Point(e[e.length-2],e[e.length-1]);var h=g.x+.5*(f.x-g.x),i=g.y+.5*(f.y-g.y);e.unshift(h,i),e.push(h,i)}var j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G=c.points,H=c.indices,I=e.length/2,J=e.length,K=G.length/6,L=a.lineWidth/2,M=b.hex2rgb(a.lineColor),N=a.lineAlpha,O=M[0]*N,P=M[1]*N,Q=M[2]*N;for(l=e[0],m=e[1],n=e[2],o=e[3],r=-(m-o),s=l-n,F=Math.sqrt(r*r+s*s),r/=F,s/=F,r*=L,s*=L,G.push(l-r,m-s,O,P,Q,N),G.push(l+r,m+s,O,P,Q,N),d=1;I-1>d;d++)l=e[2*(d-1)],m=e[2*(d-1)+1],n=e[2*d],o=e[2*d+1],p=e[2*(d+1)],q=e[2*(d+1)+1],r=-(m-o),s=l-n,F=Math.sqrt(r*r+s*s),r/=F,s/=F,r*=L,s*=L,t=-(o-q),u=n-p,F=Math.sqrt(t*t+u*u),t/=F,u/=F,t*=L,u*=L,x=-s+m-(-s+o),y=-r+n-(-r+l),z=(-r+l)*(-s+o)-(-r+n)*(-s+m),A=-u+q-(-u+o),B=-t+n-(-t+p),C=(-t+p)*(-u+o)-(-t+n)*(-u+q),D=x*B-A*y,Math.abs(D)<.1?(D+=10.1,G.push(n-r,o-s,O,P,Q,N),G.push(n+r,o+s,O,P,Q,N)):(j=(y*C-B*z)/D,k=(A*z-x*C)/D,E=(j-n)*(j-n)+(k-o)+(k-o),E>19600?(v=r-t,w=s-u,F=Math.sqrt(v*v+w*w),v/=F,w/=F,v*=L,w*=L,G.push(n-v,o-w),G.push(O,P,Q,N),G.push(n+v,o+w),G.push(O,P,Q,N),G.push(n-v,o-w),G.push(O,P,Q,N),J++):(G.push(j,k),G.push(O,P,Q,N),G.push(n-(j-n),o-(k-o)),G.push(O,P,Q,N)));for(l=e[2*(I-2)],m=e[2*(I-2)+1],n=e[2*(I-1)],o=e[2*(I-1)+1],r=-(m-o),s=l-n,F=Math.sqrt(r*r+s*s),r/=F,s/=F,r*=L,s*=L,G.push(n-r,o-s),G.push(O,P,Q,N),G.push(n+r,o+s),G.push(O,P,Q,N),H.push(K),d=0;J>d;d++)H.push(K++);
H.push(K-1)}},b.WebGLGraphics.buildComplexPoly=function(a,c){var d=a.points.slice();if(!(d.length<6)){var e=c.indices;c.points=d,c.alpha=a.fillAlpha,c.color=b.hex2rgb(a.fillColor);for(var f,g,h=1/0,i=-1/0,j=1/0,k=-1/0,l=0;l<d.length;l+=2)f=d[l],g=d[l+1],h=h>f?f:h,i=f>i?f:i,j=j>g?g:j,k=g>k?g:k;d.push(h,j,i,j,i,k,h,k);var m=d.length/2;for(l=0;m>l;l++)e.push(l)}},b.WebGLGraphics.buildPoly=function(a,c){var d=a.points;if(!(d.length<6)){var e=c.points,f=c.indices,g=d.length/2,h=b.hex2rgb(a.fillColor),i=a.fillAlpha,j=h[0]*i,k=h[1]*i,l=h[2]*i,m=b.PolyK.Triangulate(d);if(!m)return!1;var n=e.length/6,o=0;for(o=0;o<m.length;o+=3)f.push(m[o]+n),f.push(m[o]+n),f.push(m[o+1]+n),f.push(m[o+2]+n),f.push(m[o+2]+n);for(o=0;g>o;o++)e.push(d[2*o],d[2*o+1],j,k,l,i);return!0}},b.WebGLGraphics.graphicsDataPool=[],b.WebGLGraphicsData=function(a){this.gl=a,this.color=[0,0,0],this.points=[],this.indices=[],this.lastIndex=0,this.buffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),this.mode=1,this.alpha=1,this.dirty=!0},b.WebGLGraphicsData.prototype.reset=function(){this.points=[],this.indices=[],this.lastIndex=0},b.WebGLGraphicsData.prototype.upload=function(){var a=this.gl;this.glPoints=new b.Float32Array(this.points),a.bindBuffer(a.ARRAY_BUFFER,this.buffer),a.bufferData(a.ARRAY_BUFFER,this.glPoints,a.STATIC_DRAW),this.glIndicies=new b.Uint16Array(this.indices),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,this.glIndicies,a.STATIC_DRAW),this.dirty=!1},b.glContexts=[],b.instances=[],b.WebGLRenderer=function(a,c,d){if(d)for(var e in b.defaultRenderOptions)"undefined"==typeof d[e]&&(d[e]=b.defaultRenderOptions[e]);else d=b.defaultRenderOptions;b.defaultRenderer||(b.sayHello("webGL"),b.defaultRenderer=this),this.type=b.WEBGL_RENDERER,this.resolution=d.resolution,this.transparent=d.transparent,this.autoResize=d.autoResize||!1,this.preserveDrawingBuffer=d.preserveDrawingBuffer,this.clearBeforeRender=d.clearBeforeRender,this.width=a||800,this.height=c||600,this.view=d.view||document.createElement("canvas"),this.contextLostBound=this.handleContextLost.bind(this),this.contextRestoredBound=this.handleContextRestored.bind(this),this.view.addEventListener("webglcontextlost",this.contextLostBound,!1),this.view.addEventListener("webglcontextrestored",this.contextRestoredBound,!1),this._contextOptions={alpha:this.transparent,antialias:d.antialias,premultipliedAlpha:this.transparent&&"notMultiplied"!==this.transparent,stencil:!0,preserveDrawingBuffer:d.preserveDrawingBuffer},this.projection=new b.Point,this.offset=new b.Point(0,0),this.shaderManager=new b.WebGLShaderManager,this.spriteBatch=new b.WebGLSpriteBatch,this.maskManager=new b.WebGLMaskManager,this.filterManager=new b.WebGLFilterManager,this.stencilManager=new b.WebGLStencilManager,this.blendModeManager=new b.WebGLBlendModeManager,this.renderSession={},this.renderSession.gl=this.gl,this.renderSession.drawCount=0,this.renderSession.shaderManager=this.shaderManager,this.renderSession.maskManager=this.maskManager,this.renderSession.filterManager=this.filterManager,this.renderSession.blendModeManager=this.blendModeManager,this.renderSession.spriteBatch=this.spriteBatch,this.renderSession.stencilManager=this.stencilManager,this.renderSession.renderer=this,this.renderSession.resolution=this.resolution,this.initContext(),this.mapBlendModes()},b.WebGLRenderer.prototype.constructor=b.WebGLRenderer,b.WebGLRenderer.prototype.initContext=function(){var a=this.view.getContext("webgl",this._contextOptions)||this.view.getContext("experimental-webgl",this._contextOptions);if(this.gl=a,!a)throw new Error("This browser does not support webGL. Try using the canvas renderer");this.glContextId=a.id=b.WebGLRenderer.glContextId++,b.glContexts[this.glContextId]=a,b.instances[this.glContextId]=this,a.disable(a.DEPTH_TEST),a.disable(a.CULL_FACE),a.enable(a.BLEND),this.shaderManager.setContext(a),this.spriteBatch.setContext(a),this.maskManager.setContext(a),this.filterManager.setContext(a),this.blendModeManager.setContext(a),this.stencilManager.setContext(a),this.renderSession.gl=this.gl,this.resize(this.width,this.height)},b.WebGLRenderer.prototype.render=function(a){if(!this.contextLost){this.__stage!==a&&(a.interactive&&a.interactionManager.removeEvents(),this.__stage=a),a.updateTransform();var b=this.gl;a._interactive?a._interactiveEventsAdded||(a._interactiveEventsAdded=!0,a.interactionManager.setTarget(this)):a._interactiveEventsAdded&&(a._interactiveEventsAdded=!1,a.interactionManager.setTarget(this)),b.viewport(0,0,this.width,this.height),b.bindFramebuffer(b.FRAMEBUFFER,null),this.clearBeforeRender&&(this.transparent?b.clearColor(0,0,0,0):b.clearColor(a.backgroundColorSplit[0],a.backgroundColorSplit[1],a.backgroundColorSplit[2],1),b.clear(b.COLOR_BUFFER_BIT)),this.renderDisplayObject(a,this.projection)}},b.WebGLRenderer.prototype.renderDisplayObject=function(a,c,d){this.renderSession.blendModeManager.setBlendMode(b.blendModes.NORMAL),this.renderSession.drawCount=0,this.renderSession.projection=c,this.renderSession.offset=this.offset,this.spriteBatch.begin(this.renderSession),this.filterManager.begin(this.renderSession,d),a._renderWebGL(this.renderSession),this.spriteBatch.end()},b.WebGLRenderer.prototype.resize=function(a,b){this.width=a*this.resolution,this.height=b*this.resolution,this.view.width=this.width,this.view.height=this.height,this.autoResize&&(this.view.style.width=this.width/this.resolution+"px",this.view.style.height=this.height/this.resolution+"px"),this.gl.viewport(0,0,this.width,this.height),this.projection.x=this.width/2/this.resolution,this.projection.y=-this.height/2/this.resolution},b.WebGLRenderer.prototype.updateTexture=function(a){if(a.hasLoaded){var c=this.gl;return a._glTextures[c.id]||(a._glTextures[c.id]=c.createTexture()),c.bindTexture(c.TEXTURE_2D,a._glTextures[c.id]),c.pixelStorei(c.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultipliedAlpha),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,c.RGBA,c.UNSIGNED_BYTE,a.source),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MAG_FILTER,a.scaleMode===b.scaleModes.LINEAR?c.LINEAR:c.NEAREST),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,a.scaleMode===b.scaleModes.LINEAR?c.LINEAR:c.NEAREST),a._powerOf2?(c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,c.REPEAT),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,c.REPEAT)):(c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,c.CLAMP_TO_EDGE),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,c.CLAMP_TO_EDGE)),a._dirty[c.id]=!1,a._glTextures[c.id]}},b.WebGLRenderer.prototype.handleContextLost=function(a){a.preventDefault(),this.contextLost=!0},b.WebGLRenderer.prototype.handleContextRestored=function(){this.initContext();for(var a in b.TextureCache){var c=b.TextureCache[a].baseTexture;c._glTextures=[]}this.contextLost=!1},b.WebGLRenderer.prototype.destroy=function(){this.view.removeEventListener("webglcontextlost",this.contextLostBound),this.view.removeEventListener("webglcontextrestored",this.contextRestoredBound),b.glContexts[this.glContextId]=null,this.projection=null,this.offset=null,this.shaderManager.destroy(),this.spriteBatch.destroy(),this.maskManager.destroy(),this.filterManager.destroy(),this.shaderManager=null,this.spriteBatch=null,this.maskManager=null,this.filterManager=null,this.gl=null,this.renderSession=null},b.WebGLRenderer.prototype.mapBlendModes=function(){var a=this.gl;b.blendModesWebGL||(b.blendModesWebGL=[],b.blendModesWebGL[b.blendModes.NORMAL]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.ADD]=[a.SRC_ALPHA,a.DST_ALPHA],b.blendModesWebGL[b.blendModes.MULTIPLY]=[a.DST_COLOR,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.SCREEN]=[a.SRC_ALPHA,a.ONE],b.blendModesWebGL[b.blendModes.OVERLAY]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.DARKEN]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.LIGHTEN]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.COLOR_DODGE]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.COLOR_BURN]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.HARD_LIGHT]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.SOFT_LIGHT]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.DIFFERENCE]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.EXCLUSION]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.HUE]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.SATURATION]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.COLOR]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.LUMINOSITY]=[a.ONE,a.ONE_MINUS_SRC_ALPHA])},b.WebGLRenderer.glContextId=0,b.WebGLBlendModeManager=function(){this.currentBlendMode=99999},b.WebGLBlendModeManager.prototype.constructor=b.WebGLBlendModeManager,b.WebGLBlendModeManager.prototype.setContext=function(a){this.gl=a},b.WebGLBlendModeManager.prototype.setBlendMode=function(a){if(this.currentBlendMode===a)return!1;this.currentBlendMode=a;var c=b.blendModesWebGL[this.currentBlendMode];return this.gl.blendFunc(c[0],c[1]),!0},b.WebGLBlendModeManager.prototype.destroy=function(){this.gl=null},b.WebGLMaskManager=function(){},b.WebGLMaskManager.prototype.constructor=b.WebGLMaskManager,b.WebGLMaskManager.prototype.setContext=function(a){this.gl=a},b.WebGLMaskManager.prototype.pushMask=function(a,c){var d=c.gl;a.dirty&&b.WebGLGraphics.updateGraphics(a,d),a._webGL[d.id].data.length&&c.stencilManager.pushStencil(a,a._webGL[d.id].data[0],c)},b.WebGLMaskManager.prototype.popMask=function(a,b){var c=this.gl;b.stencilManager.popStencil(a,a._webGL[c.id].data[0],b)},b.WebGLMaskManager.prototype.destroy=function(){this.gl=null},b.WebGLStencilManager=function(){this.stencilStack=[],this.reverse=!0,this.count=0},b.WebGLStencilManager.prototype.setContext=function(a){this.gl=a},b.WebGLStencilManager.prototype.pushStencil=function(a,b,c){var d=this.gl;this.bindGraphics(a,b,c),0===this.stencilStack.length&&(d.enable(d.STENCIL_TEST),d.clear(d.STENCIL_BUFFER_BIT),this.reverse=!0,this.count=0),this.stencilStack.push(b);var e=this.count;d.colorMask(!1,!1,!1,!1),d.stencilFunc(d.ALWAYS,0,255),d.stencilOp(d.KEEP,d.KEEP,d.INVERT),1===b.mode?(d.drawElements(d.TRIANGLE_FAN,b.indices.length-4,d.UNSIGNED_SHORT,0),this.reverse?(d.stencilFunc(d.EQUAL,255-e,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)):(d.stencilFunc(d.EQUAL,e,255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)),d.drawElements(d.TRIANGLE_FAN,4,d.UNSIGNED_SHORT,2*(b.indices.length-4)),this.reverse?d.stencilFunc(d.EQUAL,255-(e+1),255):d.stencilFunc(d.EQUAL,e+1,255),this.reverse=!this.reverse):(this.reverse?(d.stencilFunc(d.EQUAL,e,255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)):(d.stencilFunc(d.EQUAL,255-e,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)),d.drawElements(d.TRIANGLE_STRIP,b.indices.length,d.UNSIGNED_SHORT,0),this.reverse?d.stencilFunc(d.EQUAL,e+1,255):d.stencilFunc(d.EQUAL,255-(e+1),255)),d.colorMask(!0,!0,!0,!0),d.stencilOp(d.KEEP,d.KEEP,d.KEEP),this.count++},b.WebGLStencilManager.prototype.bindGraphics=function(a,c,d){this._currentGraphics=a;var e,f=this.gl,g=d.projection,h=d.offset;1===c.mode?(e=d.shaderManager.complexPrimitiveShader,d.shaderManager.setShader(e),f.uniformMatrix3fv(e.translationMatrix,!1,a.worldTransform.toArray(!0)),f.uniform2f(e.projectionVector,g.x,-g.y),f.uniform2f(e.offsetVector,-h.x,-h.y),f.uniform3fv(e.tintColor,b.hex2rgb(a.tint)),f.uniform3fv(e.color,c.color),f.uniform1f(e.alpha,a.worldAlpha*c.alpha),f.bindBuffer(f.ARRAY_BUFFER,c.buffer),f.vertexAttribPointer(e.aVertexPosition,2,f.FLOAT,!1,8,0),f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,c.indexBuffer)):(e=d.shaderManager.primitiveShader,d.shaderManager.setShader(e),f.uniformMatrix3fv(e.translationMatrix,!1,a.worldTransform.toArray(!0)),f.uniform2f(e.projectionVector,g.x,-g.y),f.uniform2f(e.offsetVector,-h.x,-h.y),f.uniform3fv(e.tintColor,b.hex2rgb(a.tint)),f.uniform1f(e.alpha,a.worldAlpha),f.bindBuffer(f.ARRAY_BUFFER,c.buffer),f.vertexAttribPointer(e.aVertexPosition,2,f.FLOAT,!1,24,0),f.vertexAttribPointer(e.colorAttribute,4,f.FLOAT,!1,24,8),f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,c.indexBuffer))},b.WebGLStencilManager.prototype.popStencil=function(a,b,c){var d=this.gl;if(this.stencilStack.pop(),this.count--,0===this.stencilStack.length)d.disable(d.STENCIL_TEST);else{var e=this.count;this.bindGraphics(a,b,c),d.colorMask(!1,!1,!1,!1),1===b.mode?(this.reverse=!this.reverse,this.reverse?(d.stencilFunc(d.EQUAL,255-(e+1),255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)):(d.stencilFunc(d.EQUAL,e+1,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)),d.drawElements(d.TRIANGLE_FAN,4,d.UNSIGNED_SHORT,2*(b.indices.length-4)),d.stencilFunc(d.ALWAYS,0,255),d.stencilOp(d.KEEP,d.KEEP,d.INVERT),d.drawElements(d.TRIANGLE_FAN,b.indices.length-4,d.UNSIGNED_SHORT,0),this.reverse?d.stencilFunc(d.EQUAL,e,255):d.stencilFunc(d.EQUAL,255-e,255)):(this.reverse?(d.stencilFunc(d.EQUAL,e+1,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)):(d.stencilFunc(d.EQUAL,255-(e+1),255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)),d.drawElements(d.TRIANGLE_STRIP,b.indices.length,d.UNSIGNED_SHORT,0),this.reverse?d.stencilFunc(d.EQUAL,e,255):d.stencilFunc(d.EQUAL,255-e,255)),d.colorMask(!0,!0,!0,!0),d.stencilOp(d.KEEP,d.KEEP,d.KEEP)}},b.WebGLStencilManager.prototype.destroy=function(){this.stencilStack=null,this.gl=null},b.WebGLShaderManager=function(){this.maxAttibs=10,this.attribState=[],this.tempAttribState=[];for(var a=0;a<this.maxAttibs;a++)this.attribState[a]=!1;this.stack=[]},b.WebGLShaderManager.prototype.constructor=b.WebGLShaderManager,b.WebGLShaderManager.prototype.setContext=function(a){this.gl=a,this.primitiveShader=new b.PrimitiveShader(a),this.complexPrimitiveShader=new b.ComplexPrimitiveShader(a),this.defaultShader=new b.PixiShader(a),this.fastShader=new b.PixiFastShader(a),this.stripShader=new b.StripShader(a),this.setShader(this.defaultShader)},b.WebGLShaderManager.prototype.setAttribs=function(a){var b;for(b=0;b<this.tempAttribState.length;b++)this.tempAttribState[b]=!1;for(b=0;b<a.length;b++){var c=a[b];this.tempAttribState[c]=!0}var d=this.gl;for(b=0;b<this.attribState.length;b++)this.attribState[b]!==this.tempAttribState[b]&&(this.attribState[b]=this.tempAttribState[b],this.tempAttribState[b]?d.enableVertexAttribArray(b):d.disableVertexAttribArray(b))},b.WebGLShaderManager.prototype.setShader=function(a){return this._currentId===a._UID?!1:(this._currentId=a._UID,this.currentShader=a,this.gl.useProgram(a.program),this.setAttribs(a.attributes),!0)},b.WebGLShaderManager.prototype.destroy=function(){this.attribState=null,this.tempAttribState=null,this.primitiveShader.destroy(),this.complexPrimitiveShader.destroy(),this.defaultShader.destroy(),this.fastShader.destroy(),this.stripShader.destroy(),this.gl=null},b.WebGLSpriteBatch=function(){this.vertSize=6,this.size=2e3;var a=4*this.size*this.vertSize,c=6*this.size;this.vertices=new b.Float32Array(a),this.indices=new b.Uint16Array(c),this.lastIndexCount=0;for(var d=0,e=0;c>d;d+=6,e+=4)this.indices[d+0]=e+0,this.indices[d+1]=e+1,this.indices[d+2]=e+2,this.indices[d+3]=e+0,this.indices[d+4]=e+2,this.indices[d+5]=e+3;this.drawing=!1,this.currentBatchSize=0,this.currentBaseTexture=null,this.dirty=!0,this.textures=[],this.blendModes=[],this.shaders=[],this.sprites=[],this.defaultShader=new b.AbstractFilter(["precision lowp float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;","}"])},b.WebGLSpriteBatch.prototype.setContext=function(a){this.gl=a,this.vertexBuffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,this.indices,a.STATIC_DRAW),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bufferData(a.ARRAY_BUFFER,this.vertices,a.DYNAMIC_DRAW),this.currentBlendMode=99999;var c=new b.PixiShader(a);c.fragmentSrc=this.defaultShader.fragmentSrc,c.uniforms={},c.init(),this.defaultShader.shaders[a.id]=c},b.WebGLSpriteBatch.prototype.begin=function(a){this.renderSession=a,this.shader=this.renderSession.shaderManager.defaultShader,this.start()},b.WebGLSpriteBatch.prototype.end=function(){this.flush()},b.WebGLSpriteBatch.prototype.render=function(a){var b=a.texture;this.currentBatchSize>=this.size&&(this.flush(),this.currentBaseTexture=b.baseTexture);var c=b._uvs;if(c){var d,e,f,g,h=a.worldAlpha,i=a.tint,j=this.vertices,k=a.anchor.x,l=a.anchor.y;if(b.trim){var m=b.trim;e=m.x-k*m.width,d=e+b.crop.width,g=m.y-l*m.height,f=g+b.crop.height}else d=b.frame.width*(1-k),e=b.frame.width*-k,f=b.frame.height*(1-l),g=b.frame.height*-l;var n=4*this.currentBatchSize*this.vertSize,o=b.baseTexture.resolution,p=a.worldTransform,q=p.a/o,r=p.b/o,s=p.c/o,t=p.d/o,u=p.tx,v=p.ty;j[n++]=q*e+s*g+u,j[n++]=t*g+r*e+v,j[n++]=c.x0,j[n++]=c.y0,j[n++]=h,j[n++]=i,j[n++]=q*d+s*g+u,j[n++]=t*g+r*d+v,j[n++]=c.x1,j[n++]=c.y1,j[n++]=h,j[n++]=i,j[n++]=q*d+s*f+u,j[n++]=t*f+r*d+v,j[n++]=c.x2,j[n++]=c.y2,j[n++]=h,j[n++]=i,j[n++]=q*e+s*f+u,j[n++]=t*f+r*e+v,j[n++]=c.x3,j[n++]=c.y3,j[n++]=h,j[n++]=i,this.sprites[this.currentBatchSize++]=a}},b.WebGLSpriteBatch.prototype.renderTilingSprite=function(a){var c=a.tilingTexture;this.currentBatchSize>=this.size&&(this.flush(),this.currentBaseTexture=c.baseTexture),a._uvs||(a._uvs=new b.TextureUvs);var d=a._uvs;a.tilePosition.x%=c.baseTexture.width*a.tileScaleOffset.x,a.tilePosition.y%=c.baseTexture.height*a.tileScaleOffset.y;var e=a.tilePosition.x/(c.baseTexture.width*a.tileScaleOffset.x),f=a.tilePosition.y/(c.baseTexture.height*a.tileScaleOffset.y),g=a.width/c.baseTexture.width/(a.tileScale.x*a.tileScaleOffset.x),h=a.height/c.baseTexture.height/(a.tileScale.y*a.tileScaleOffset.y);d.x0=0-e,d.y0=0-f,d.x1=1*g-e,d.y1=0-f,d.x2=1*g-e,d.y2=1*h-f,d.x3=0-e,d.y3=1*h-f;var i=a.worldAlpha,j=a.tint,k=this.vertices,l=a.width,m=a.height,n=a.anchor.x,o=a.anchor.y,p=l*(1-n),q=l*-n,r=m*(1-o),s=m*-o,t=4*this.currentBatchSize*this.vertSize,u=c.baseTexture.resolution,v=a.worldTransform,w=v.a/u,x=v.b/u,y=v.c/u,z=v.d/u,A=v.tx,B=v.ty;k[t++]=w*q+y*s+A,k[t++]=z*s+x*q+B,k[t++]=d.x0,k[t++]=d.y0,k[t++]=i,k[t++]=j,k[t++]=w*p+y*s+A,k[t++]=z*s+x*p+B,k[t++]=d.x1,k[t++]=d.y1,k[t++]=i,k[t++]=j,k[t++]=w*p+y*r+A,k[t++]=z*r+x*p+B,k[t++]=d.x2,k[t++]=d.y2,k[t++]=i,k[t++]=j,k[t++]=w*q+y*r+A,k[t++]=z*r+x*q+B,k[t++]=d.x3,k[t++]=d.y3,k[t++]=i,k[t++]=j,this.sprites[this.currentBatchSize++]=a},b.WebGLSpriteBatch.prototype.flush=function(){if(0!==this.currentBatchSize){var a,c=this.gl;if(this.dirty){this.dirty=!1,c.activeTexture(c.TEXTURE0),c.bindBuffer(c.ARRAY_BUFFER,this.vertexBuffer),c.bindBuffer(c.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a=this.defaultShader.shaders[c.id];var d=4*this.vertSize;c.vertexAttribPointer(a.aVertexPosition,2,c.FLOAT,!1,d,0),c.vertexAttribPointer(a.aTextureCoord,2,c.FLOAT,!1,d,8),c.vertexAttribPointer(a.colorAttribute,2,c.FLOAT,!1,d,16)}if(this.currentBatchSize>.5*this.size)c.bufferSubData(c.ARRAY_BUFFER,0,this.vertices);else{var e=this.vertices.subarray(0,4*this.currentBatchSize*this.vertSize);c.bufferSubData(c.ARRAY_BUFFER,0,e)}for(var f,g,h,i,j=0,k=0,l=null,m=this.renderSession.blendModeManager.currentBlendMode,n=null,o=!1,p=!1,q=0,r=this.currentBatchSize;r>q;q++){if(i=this.sprites[q],f=i.texture.baseTexture,g=i.blendMode,h=i.shader||this.defaultShader,o=m!==g,p=n!==h,(l!==f||o||p)&&(this.renderBatch(l,j,k),k=q,j=0,l=f,o&&(m=g,this.renderSession.blendModeManager.setBlendMode(m)),p)){n=h,a=n.shaders[c.id],a||(a=new b.PixiShader(c),a.fragmentSrc=n.fragmentSrc,a.uniforms=n.uniforms,a.init(),n.shaders[c.id]=a),this.renderSession.shaderManager.setShader(a),a.dirty&&a.syncUniforms();var s=this.renderSession.projection;c.uniform2f(a.projectionVector,s.x,s.y);var t=this.renderSession.offset;c.uniform2f(a.offsetVector,t.x,t.y)}j++}this.renderBatch(l,j,k),this.currentBatchSize=0}},b.WebGLSpriteBatch.prototype.renderBatch=function(a,b,c){if(0!==b){var d=this.gl;a._dirty[d.id]?this.renderSession.renderer.updateTexture(a):d.bindTexture(d.TEXTURE_2D,a._glTextures[d.id]),d.drawElements(d.TRIANGLES,6*b,d.UNSIGNED_SHORT,6*c*2),this.renderSession.drawCount++}},b.WebGLSpriteBatch.prototype.stop=function(){this.flush(),this.dirty=!0},b.WebGLSpriteBatch.prototype.start=function(){this.dirty=!0},b.WebGLSpriteBatch.prototype.destroy=function(){this.vertices=null,this.indices=null,this.gl.deleteBuffer(this.vertexBuffer),this.gl.deleteBuffer(this.indexBuffer),this.currentBaseTexture=null,this.gl=null},b.WebGLFastSpriteBatch=function(a){this.vertSize=10,this.maxSize=6e3,this.size=this.maxSize;var c=4*this.size*this.vertSize,d=6*this.maxSize;this.vertices=new b.Float32Array(c),this.indices=new b.Uint16Array(d),this.vertexBuffer=null,this.indexBuffer=null,this.lastIndexCount=0;for(var e=0,f=0;d>e;e+=6,f+=4)this.indices[e+0]=f+0,this.indices[e+1]=f+1,this.indices[e+2]=f+2,this.indices[e+3]=f+0,this.indices[e+4]=f+2,this.indices[e+5]=f+3;this.drawing=!1,this.currentBatchSize=0,this.currentBaseTexture=null,this.currentBlendMode=0,this.renderSession=null,this.shader=null,this.matrix=null,this.setContext(a)},b.WebGLFastSpriteBatch.prototype.constructor=b.WebGLFastSpriteBatch,b.WebGLFastSpriteBatch.prototype.setContext=function(a){this.gl=a,this.vertexBuffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,this.indices,a.STATIC_DRAW),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bufferData(a.ARRAY_BUFFER,this.vertices,a.DYNAMIC_DRAW)},b.WebGLFastSpriteBatch.prototype.begin=function(a,b){this.renderSession=b,this.shader=this.renderSession.shaderManager.fastShader,this.matrix=a.worldTransform.toArray(!0),this.start()},b.WebGLFastSpriteBatch.prototype.end=function(){this.flush()},b.WebGLFastSpriteBatch.prototype.render=function(a){var b=a.children,c=b[0];if(c.texture._uvs){this.currentBaseTexture=c.texture.baseTexture,c.blendMode!==this.renderSession.blendModeManager.currentBlendMode&&(this.flush(),this.renderSession.blendModeManager.setBlendMode(c.blendMode));for(var d=0,e=b.length;e>d;d++)this.renderSprite(b[d]);this.flush()}},b.WebGLFastSpriteBatch.prototype.renderSprite=function(a){if(a.visible&&(a.texture.baseTexture===this.currentBaseTexture||(this.flush(),this.currentBaseTexture=a.texture.baseTexture,a.texture._uvs))){var b,c,d,e,f,g,h,i,j=this.vertices;if(b=a.texture._uvs,c=a.texture.frame.width,d=a.texture.frame.height,a.texture.trim){var k=a.texture.trim;f=k.x-a.anchor.x*k.width,e=f+a.texture.crop.width,h=k.y-a.anchor.y*k.height,g=h+a.texture.crop.height}else e=a.texture.frame.width*(1-a.anchor.x),f=a.texture.frame.width*-a.anchor.x,g=a.texture.frame.height*(1-a.anchor.y),h=a.texture.frame.height*-a.anchor.y;i=4*this.currentBatchSize*this.vertSize,j[i++]=f,j[i++]=h,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x0,j[i++]=b.y1,j[i++]=a.alpha,j[i++]=e,j[i++]=h,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x1,j[i++]=b.y1,j[i++]=a.alpha,j[i++]=e,j[i++]=g,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x2,j[i++]=b.y2,j[i++]=a.alpha,j[i++]=f,j[i++]=g,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x3,j[i++]=b.y3,j[i++]=a.alpha,this.currentBatchSize++,this.currentBatchSize>=this.size&&this.flush()}},b.WebGLFastSpriteBatch.prototype.flush=function(){if(0!==this.currentBatchSize){var a=this.gl;if(this.currentBaseTexture._glTextures[a.id]||this.renderSession.renderer.updateTexture(this.currentBaseTexture,a),a.bindTexture(a.TEXTURE_2D,this.currentBaseTexture._glTextures[a.id]),this.currentBatchSize>.5*this.size)a.bufferSubData(a.ARRAY_BUFFER,0,this.vertices);else{var b=this.vertices.subarray(0,4*this.currentBatchSize*this.vertSize);a.bufferSubData(a.ARRAY_BUFFER,0,b)}a.drawElements(a.TRIANGLES,6*this.currentBatchSize,a.UNSIGNED_SHORT,0),this.currentBatchSize=0,this.renderSession.drawCount++}},b.WebGLFastSpriteBatch.prototype.stop=function(){this.flush()},b.WebGLFastSpriteBatch.prototype.start=function(){var a=this.gl;a.activeTexture(a.TEXTURE0),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer);var b=this.renderSession.projection;a.uniform2f(this.shader.projectionVector,b.x,b.y),a.uniformMatrix3fv(this.shader.uMatrix,!1,this.matrix);var c=4*this.vertSize;a.vertexAttribPointer(this.shader.aVertexPosition,2,a.FLOAT,!1,c,0),a.vertexAttribPointer(this.shader.aPositionCoord,2,a.FLOAT,!1,c,8),a.vertexAttribPointer(this.shader.aScale,2,a.FLOAT,!1,c,16),a.vertexAttribPointer(this.shader.aRotation,1,a.FLOAT,!1,c,24),a.vertexAttribPointer(this.shader.aTextureCoord,2,a.FLOAT,!1,c,28),a.vertexAttribPointer(this.shader.colorAttribute,1,a.FLOAT,!1,c,36)},b.WebGLFilterManager=function(){this.filterStack=[],this.offsetX=0,this.offsetY=0},b.WebGLFilterManager.prototype.constructor=b.WebGLFilterManager,b.WebGLFilterManager.prototype.setContext=function(a){this.gl=a,this.texturePool=[],this.initShaderBuffers()},b.WebGLFilterManager.prototype.begin=function(a,b){this.renderSession=a,this.defaultShader=a.shaderManager.defaultShader;var c=this.renderSession.projection;this.width=2*c.x,this.height=2*-c.y,this.buffer=b},b.WebGLFilterManager.prototype.pushFilter=function(a){var c=this.gl,d=this.renderSession.projection,e=this.renderSession.offset;a._filterArea=a.target.filterArea||a.target.getBounds(),this.filterStack.push(a);var f=a.filterPasses[0];this.offsetX+=a._filterArea.x,this.offsetY+=a._filterArea.y;var g=this.texturePool.pop();g?g.resize(this.width,this.height):g=new b.FilterTexture(this.gl,this.width,this.height),c.bindTexture(c.TEXTURE_2D,g.texture);var h=a._filterArea,i=f.padding;h.x-=i,h.y-=i,h.width+=2*i,h.height+=2*i,h.x<0&&(h.x=0),h.width>this.width&&(h.width=this.width),h.y<0&&(h.y=0),h.height>this.height&&(h.height=this.height),c.bindFramebuffer(c.FRAMEBUFFER,g.frameBuffer),c.viewport(0,0,h.width,h.height),d.x=h.width/2,d.y=-h.height/2,e.x=-h.x,e.y=-h.y,c.colorMask(!0,!0,!0,!0),c.clearColor(0,0,0,0),c.clear(c.COLOR_BUFFER_BIT),a._glFilterTexture=g},b.WebGLFilterManager.prototype.popFilter=function(){var a=this.gl,c=this.filterStack.pop(),d=c._filterArea,e=c._glFilterTexture,f=this.renderSession.projection,g=this.renderSession.offset;if(c.filterPasses.length>1){a.viewport(0,0,d.width,d.height),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),this.vertexArray[0]=0,this.vertexArray[1]=d.height,this.vertexArray[2]=d.width,this.vertexArray[3]=d.height,this.vertexArray[4]=0,this.vertexArray[5]=0,this.vertexArray[6]=d.width,this.vertexArray[7]=0,a.bufferSubData(a.ARRAY_BUFFER,0,this.vertexArray),a.bindBuffer(a.ARRAY_BUFFER,this.uvBuffer),this.uvArray[2]=d.width/this.width,this.uvArray[5]=d.height/this.height,this.uvArray[6]=d.width/this.width,this.uvArray[7]=d.height/this.height,a.bufferSubData(a.ARRAY_BUFFER,0,this.uvArray);var h=e,i=this.texturePool.pop();i||(i=new b.FilterTexture(this.gl,this.width,this.height)),i.resize(this.width,this.height),a.bindFramebuffer(a.FRAMEBUFFER,i.frameBuffer),a.clear(a.COLOR_BUFFER_BIT),a.disable(a.BLEND);for(var j=0;j<c.filterPasses.length-1;j++){var k=c.filterPasses[j];a.bindFramebuffer(a.FRAMEBUFFER,i.frameBuffer),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,h.texture),this.applyFilterPass(k,d,d.width,d.height);var l=h;h=i,i=l}a.enable(a.BLEND),e=h,this.texturePool.push(i)}var m=c.filterPasses[c.filterPasses.length-1];this.offsetX-=d.x,this.offsetY-=d.y;var n=this.width,o=this.height,p=0,q=0,r=this.buffer;if(0===this.filterStack.length)a.colorMask(!0,!0,!0,!0);else{var s=this.filterStack[this.filterStack.length-1];d=s._filterArea,n=d.width,o=d.height,p=d.x,q=d.y,r=s._glFilterTexture.frameBuffer}f.x=n/2,f.y=-o/2,g.x=p,g.y=q,d=c._filterArea;var t=d.x-p,u=d.y-q;a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),this.vertexArray[0]=t,this.vertexArray[1]=u+d.height,this.vertexArray[2]=t+d.width,this.vertexArray[3]=u+d.height,this.vertexArray[4]=t,this.vertexArray[5]=u,this.vertexArray[6]=t+d.width,this.vertexArray[7]=u,a.bufferSubData(a.ARRAY_BUFFER,0,this.vertexArray),a.bindBuffer(a.ARRAY_BUFFER,this.uvBuffer),this.uvArray[2]=d.width/this.width,this.uvArray[5]=d.height/this.height,this.uvArray[6]=d.width/this.width,this.uvArray[7]=d.height/this.height,a.bufferSubData(a.ARRAY_BUFFER,0,this.uvArray),a.viewport(0,0,n,o),a.bindFramebuffer(a.FRAMEBUFFER,r),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,e.texture),this.applyFilterPass(m,d,n,o),this.texturePool.push(e),c._glFilterTexture=null},b.WebGLFilterManager.prototype.applyFilterPass=function(a,c,d,e){var f=this.gl,g=a.shaders[f.id];g||(g=new b.PixiShader(f),g.fragmentSrc=a.fragmentSrc,g.uniforms=a.uniforms,g.init(),a.shaders[f.id]=g),this.renderSession.shaderManager.setShader(g),f.uniform2f(g.projectionVector,d/2,-e/2),f.uniform2f(g.offsetVector,0,0),a.uniforms.dimensions&&(a.uniforms.dimensions.value[0]=this.width,a.uniforms.dimensions.value[1]=this.height,a.uniforms.dimensions.value[2]=this.vertexArray[0],a.uniforms.dimensions.value[3]=this.vertexArray[5]),g.syncUniforms(),f.bindBuffer(f.ARRAY_BUFFER,this.vertexBuffer),f.vertexAttribPointer(g.aVertexPosition,2,f.FLOAT,!1,0,0),f.bindBuffer(f.ARRAY_BUFFER,this.uvBuffer),f.vertexAttribPointer(g.aTextureCoord,2,f.FLOAT,!1,0,0),f.bindBuffer(f.ARRAY_BUFFER,this.colorBuffer),f.vertexAttribPointer(g.colorAttribute,2,f.FLOAT,!1,0,0),f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,this.indexBuffer),f.drawElements(f.TRIANGLES,6,f.UNSIGNED_SHORT,0),this.renderSession.drawCount++},b.WebGLFilterManager.prototype.initShaderBuffers=function(){var a=this.gl;this.vertexBuffer=a.createBuffer(),this.uvBuffer=a.createBuffer(),this.colorBuffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),this.vertexArray=new b.Float32Array([0,0,1,0,0,1,1,1]),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bufferData(a.ARRAY_BUFFER,this.vertexArray,a.STATIC_DRAW),this.uvArray=new b.Float32Array([0,0,1,0,0,1,1,1]),a.bindBuffer(a.ARRAY_BUFFER,this.uvBuffer),a.bufferData(a.ARRAY_BUFFER,this.uvArray,a.STATIC_DRAW),this.colorArray=new b.Float32Array([1,16777215,1,16777215,1,16777215,1,16777215]),a.bindBuffer(a.ARRAY_BUFFER,this.colorBuffer),a.bufferData(a.ARRAY_BUFFER,this.colorArray,a.STATIC_DRAW),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,1,3,2]),a.STATIC_DRAW)},b.WebGLFilterManager.prototype.destroy=function(){var a=this.gl;this.filterStack=null,this.offsetX=0,this.offsetY=0;for(var b=0;b<this.texturePool.length;b++)this.texturePool[b].destroy();this.texturePool=null,a.deleteBuffer(this.vertexBuffer),a.deleteBuffer(this.uvBuffer),a.deleteBuffer(this.colorBuffer),a.deleteBuffer(this.indexBuffer)},b.FilterTexture=function(a,c,d,e){this.gl=a,this.frameBuffer=a.createFramebuffer(),this.texture=a.createTexture(),e=e||b.scaleModes.DEFAULT,a.bindTexture(a.TEXTURE_2D,this.texture),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,e===b.scaleModes.LINEAR?a.LINEAR:a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,e===b.scaleModes.LINEAR?a.LINEAR:a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.bindFramebuffer(a.FRAMEBUFFER,this.frameBuffer),a.bindFramebuffer(a.FRAMEBUFFER,this.frameBuffer),a.framebufferTexture2D(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,this.texture,0),this.renderBuffer=a.createRenderbuffer(),a.bindRenderbuffer(a.RENDERBUFFER,this.renderBuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.DEPTH_STENCIL_ATTACHMENT,a.RENDERBUFFER,this.renderBuffer),this.resize(c,d)},b.FilterTexture.prototype.constructor=b.FilterTexture,b.FilterTexture.prototype.clear=function(){var a=this.gl;a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT)},b.FilterTexture.prototype.resize=function(a,b){if(this.width!==a||this.height!==b){this.width=a,this.height=b;var c=this.gl;c.bindTexture(c.TEXTURE_2D,this.texture),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,a,b,0,c.RGBA,c.UNSIGNED_BYTE,null),c.bindRenderbuffer(c.RENDERBUFFER,this.renderBuffer),c.renderbufferStorage(c.RENDERBUFFER,c.DEPTH_STENCIL,a,b)
}},b.FilterTexture.prototype.destroy=function(){var a=this.gl;a.deleteFramebuffer(this.frameBuffer),a.deleteTexture(this.texture),this.frameBuffer=null,this.texture=null},b.CanvasBuffer=function(a,b){this.width=a,this.height=b,this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.canvas.width=a,this.canvas.height=b},b.CanvasBuffer.prototype.constructor=b.CanvasBuffer,b.CanvasBuffer.prototype.clear=function(){this.context.setTransform(1,0,0,1,0,0),this.context.clearRect(0,0,this.width,this.height)},b.CanvasBuffer.prototype.resize=function(a,b){this.width=this.canvas.width=a,this.height=this.canvas.height=b},b.CanvasMaskManager=function(){},b.CanvasMaskManager.prototype.constructor=b.CanvasMaskManager,b.CanvasMaskManager.prototype.pushMask=function(a,c){var d=c.context;d.save();var e=a.alpha,f=a.worldTransform,g=c.resolution;d.setTransform(f.a*g,f.b*g,f.c*g,f.d*g,f.tx*g,f.ty*g),b.CanvasGraphics.renderGraphicsMask(a,d),d.clip(),a.worldAlpha=e},b.CanvasMaskManager.prototype.popMask=function(a){a.context.restore()},b.CanvasTinter=function(){},b.CanvasTinter.getTintedTexture=function(a,c){var d=a.texture;c=b.CanvasTinter.roundColor(c);var e="#"+("00000"+(0|c).toString(16)).substr(-6);if(d.tintCache=d.tintCache||{},d.tintCache[e])return d.tintCache[e];var f=b.CanvasTinter.canvas||document.createElement("canvas");if(b.CanvasTinter.tintMethod(d,c,f),b.CanvasTinter.convertTintToImage){var g=new Image;g.src=f.toDataURL(),d.tintCache[e]=g}else d.tintCache[e]=f,b.CanvasTinter.canvas=null;return f},b.CanvasTinter.tintWithMultiply=function(a,b,c){var d=c.getContext("2d"),e=a.crop;c.width=e.width,c.height=e.height,d.fillStyle="#"+("00000"+(0|b).toString(16)).substr(-6),d.fillRect(0,0,e.width,e.height),d.globalCompositeOperation="multiply",d.drawImage(a.baseTexture.source,e.x,e.y,e.width,e.height,0,0,e.width,e.height),d.globalCompositeOperation="destination-atop",d.drawImage(a.baseTexture.source,e.x,e.y,e.width,e.height,0,0,e.width,e.height)},b.CanvasTinter.tintWithOverlay=function(a,b,c){var d=c.getContext("2d"),e=a.crop;c.width=e.width,c.height=e.height,d.globalCompositeOperation="copy",d.fillStyle="#"+("00000"+(0|b).toString(16)).substr(-6),d.fillRect(0,0,e.width,e.height),d.globalCompositeOperation="destination-atop",d.drawImage(a.baseTexture.source,e.x,e.y,e.width,e.height,0,0,e.width,e.height)},b.CanvasTinter.tintWithPerPixel=function(a,c,d){var e=d.getContext("2d"),f=a.crop;d.width=f.width,d.height=f.height,e.globalCompositeOperation="copy",e.drawImage(a.baseTexture.source,f.x,f.y,f.width,f.height,0,0,f.width,f.height);for(var g=b.hex2rgb(c),h=g[0],i=g[1],j=g[2],k=e.getImageData(0,0,f.width,f.height),l=k.data,m=0;m<l.length;m+=4)l[m+0]*=h,l[m+1]*=i,l[m+2]*=j;e.putImageData(k,0,0)},b.CanvasTinter.roundColor=function(a){var c=b.CanvasTinter.cacheStepsPerColorChannel,d=b.hex2rgb(a);return d[0]=Math.min(255,d[0]/c*c),d[1]=Math.min(255,d[1]/c*c),d[2]=Math.min(255,d[2]/c*c),b.rgb2hex(d)},b.CanvasTinter.cacheStepsPerColorChannel=8,b.CanvasTinter.convertTintToImage=!1,b.CanvasTinter.canUseMultiply=b.canUseNewCanvasBlendModes(),b.CanvasTinter.tintMethod=b.CanvasTinter.canUseMultiply?b.CanvasTinter.tintWithMultiply:b.CanvasTinter.tintWithPerPixel,b.CanvasRenderer=function(a,c,d){if(d)for(var e in b.defaultRenderOptions)"undefined"==typeof d[e]&&(d[e]=b.defaultRenderOptions[e]);else d=b.defaultRenderOptions;b.defaultRenderer||(b.sayHello("Canvas"),b.defaultRenderer=this),this.type=b.CANVAS_RENDERER,this.resolution=d.resolution,this.clearBeforeRender=d.clearBeforeRender,this.transparent=d.transparent,this.autoResize=d.autoResize||!1,this.width=a||800,this.height=c||600,this.width*=this.resolution,this.height*=this.resolution,this.view=d.view||document.createElement("canvas"),this.context=this.view.getContext("2d",{alpha:this.transparent}),this.refresh=!0,this.view.width=this.width*this.resolution,this.view.height=this.height*this.resolution,this.count=0,this.maskManager=new b.CanvasMaskManager,this.renderSession={context:this.context,maskManager:this.maskManager,scaleMode:null,smoothProperty:null,roundPixels:!1},this.mapBlendModes(),this.resize(a,c),"imageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="imageSmoothingEnabled":"webkitImageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="webkitImageSmoothingEnabled":"mozImageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="mozImageSmoothingEnabled":"oImageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="oImageSmoothingEnabled":"msImageSmoothingEnabled"in this.context&&(this.renderSession.smoothProperty="msImageSmoothingEnabled")},b.CanvasRenderer.prototype.constructor=b.CanvasRenderer,b.CanvasRenderer.prototype.render=function(a){a.updateTransform(),this.context.setTransform(1,0,0,1,0,0),this.context.globalAlpha=1,this.renderSession.currentBlendMode=b.blendModes.NORMAL,this.context.globalCompositeOperation=b.blendModesCanvas[b.blendModes.NORMAL],navigator.isCocoonJS&&this.view.screencanvas&&(this.context.fillStyle="black",this.context.clear()),this.clearBeforeRender&&(this.transparent?this.context.clearRect(0,0,this.width,this.height):(this.context.fillStyle=a.backgroundColorString,this.context.fillRect(0,0,this.width,this.height))),this.renderDisplayObject(a),a.interactive&&(a._interactiveEventsAdded||(a._interactiveEventsAdded=!0,a.interactionManager.setTarget(this)))},b.CanvasRenderer.prototype.destroy=function(a){"undefined"==typeof a&&(a=!0),a&&this.view.parent&&this.view.parent.removeChild(this.view),this.view=null,this.context=null,this.maskManager=null,this.renderSession=null},b.CanvasRenderer.prototype.resize=function(a,b){this.width=a*this.resolution,this.height=b*this.resolution,this.view.width=this.width,this.view.height=this.height,this.autoResize&&(this.view.style.width=this.width/this.resolution+"px",this.view.style.height=this.height/this.resolution+"px")},b.CanvasRenderer.prototype.renderDisplayObject=function(a,b){this.renderSession.context=b||this.context,this.renderSession.resolution=this.resolution,a._renderCanvas(this.renderSession)},b.CanvasRenderer.prototype.mapBlendModes=function(){b.blendModesCanvas||(b.blendModesCanvas=[],b.canUseNewCanvasBlendModes()?(b.blendModesCanvas[b.blendModes.NORMAL]="source-over",b.blendModesCanvas[b.blendModes.ADD]="lighter",b.blendModesCanvas[b.blendModes.MULTIPLY]="multiply",b.blendModesCanvas[b.blendModes.SCREEN]="screen",b.blendModesCanvas[b.blendModes.OVERLAY]="overlay",b.blendModesCanvas[b.blendModes.DARKEN]="darken",b.blendModesCanvas[b.blendModes.LIGHTEN]="lighten",b.blendModesCanvas[b.blendModes.COLOR_DODGE]="color-dodge",b.blendModesCanvas[b.blendModes.COLOR_BURN]="color-burn",b.blendModesCanvas[b.blendModes.HARD_LIGHT]="hard-light",b.blendModesCanvas[b.blendModes.SOFT_LIGHT]="soft-light",b.blendModesCanvas[b.blendModes.DIFFERENCE]="difference",b.blendModesCanvas[b.blendModes.EXCLUSION]="exclusion",b.blendModesCanvas[b.blendModes.HUE]="hue",b.blendModesCanvas[b.blendModes.SATURATION]="saturation",b.blendModesCanvas[b.blendModes.COLOR]="color",b.blendModesCanvas[b.blendModes.LUMINOSITY]="luminosity"):(b.blendModesCanvas[b.blendModes.NORMAL]="source-over",b.blendModesCanvas[b.blendModes.ADD]="lighter",b.blendModesCanvas[b.blendModes.MULTIPLY]="source-over",b.blendModesCanvas[b.blendModes.SCREEN]="source-over",b.blendModesCanvas[b.blendModes.OVERLAY]="source-over",b.blendModesCanvas[b.blendModes.DARKEN]="source-over",b.blendModesCanvas[b.blendModes.LIGHTEN]="source-over",b.blendModesCanvas[b.blendModes.COLOR_DODGE]="source-over",b.blendModesCanvas[b.blendModes.COLOR_BURN]="source-over",b.blendModesCanvas[b.blendModes.HARD_LIGHT]="source-over",b.blendModesCanvas[b.blendModes.SOFT_LIGHT]="source-over",b.blendModesCanvas[b.blendModes.DIFFERENCE]="source-over",b.blendModesCanvas[b.blendModes.EXCLUSION]="source-over",b.blendModesCanvas[b.blendModes.HUE]="source-over",b.blendModesCanvas[b.blendModes.SATURATION]="source-over",b.blendModesCanvas[b.blendModes.COLOR]="source-over",b.blendModesCanvas[b.blendModes.LUMINOSITY]="source-over"))},b.CanvasGraphics=function(){},b.CanvasGraphics.renderGraphics=function(a,c){for(var d=a.worldAlpha,e="",f=0;f<a.graphicsData.length;f++){var g=a.graphicsData[f],h=g.shape;if(c.strokeStyle=e="#"+("00000"+(0|g.lineColor).toString(16)).substr(-6),c.lineWidth=g.lineWidth,g.type===b.Graphics.POLY){c.beginPath();var i=h.points;c.moveTo(i[0],i[1]);for(var j=1;j<i.length/2;j++)c.lineTo(i[2*j],i[2*j+1]);h.closed&&c.lineTo(i[0],i[1]),i[0]===i[i.length-2]&&i[1]===i[i.length-1]&&c.closePath(),g.fill&&(c.globalAlpha=g.fillAlpha*d,c.fillStyle=e="#"+("00000"+(0|g.fillColor).toString(16)).substr(-6),c.fill()),g.lineWidth&&(c.globalAlpha=g.lineAlpha*d,c.stroke())}else if(g.type===b.Graphics.RECT)(g.fillColor||0===g.fillColor)&&(c.globalAlpha=g.fillAlpha*d,c.fillStyle=e="#"+("00000"+(0|g.fillColor).toString(16)).substr(-6),c.fillRect(h.x,h.y,h.width,h.height)),g.lineWidth&&(c.globalAlpha=g.lineAlpha*d,c.strokeRect(h.x,h.y,h.width,h.height));else if(g.type===b.Graphics.CIRC)c.beginPath(),c.arc(h.x,h.y,h.radius,0,2*Math.PI),c.closePath(),g.fill&&(c.globalAlpha=g.fillAlpha*d,c.fillStyle=e="#"+("00000"+(0|g.fillColor).toString(16)).substr(-6),c.fill()),g.lineWidth&&(c.globalAlpha=g.lineAlpha*d,c.stroke());else if(g.type===b.Graphics.ELIP){var k=2*h.width,l=2*h.height,m=h.x-k/2,n=h.y-l/2;c.beginPath();var o=.5522848,p=k/2*o,q=l/2*o,r=m+k,s=n+l,t=m+k/2,u=n+l/2;c.moveTo(m,u),c.bezierCurveTo(m,u-q,t-p,n,t,n),c.bezierCurveTo(t+p,n,r,u-q,r,u),c.bezierCurveTo(r,u+q,t+p,s,t,s),c.bezierCurveTo(t-p,s,m,u+q,m,u),c.closePath(),g.fill&&(c.globalAlpha=g.fillAlpha*d,c.fillStyle=e="#"+("00000"+(0|g.fillColor).toString(16)).substr(-6),c.fill()),g.lineWidth&&(c.globalAlpha=g.lineAlpha*d,c.stroke())}else if(g.type===b.Graphics.RREC){var v=h.x,w=h.y,x=h.width,y=h.height,z=h.radius,A=Math.min(x,y)/2|0;z=z>A?A:z,c.beginPath(),c.moveTo(v,w+z),c.lineTo(v,w+y-z),c.quadraticCurveTo(v,w+y,v+z,w+y),c.lineTo(v+x-z,w+y),c.quadraticCurveTo(v+x,w+y,v+x,w+y-z),c.lineTo(v+x,w+z),c.quadraticCurveTo(v+x,w,v+x-z,w),c.lineTo(v+z,w),c.quadraticCurveTo(v,w,v,w+z),c.closePath(),(g.fillColor||0===g.fillColor)&&(c.globalAlpha=g.fillAlpha*d,c.fillStyle=e="#"+("00000"+(0|g.fillColor).toString(16)).substr(-6),c.fill()),g.lineWidth&&(c.globalAlpha=g.lineAlpha*d,c.stroke())}}},b.CanvasGraphics.renderGraphicsMask=function(a,c){var d=a.graphicsData.length;if(0!==d){d>1&&(d=1,window.console.log("Pixi.js warning: masks in canvas can only mask using the first path in the graphics object"));for(var e=0;1>e;e++){var f=a.graphicsData[e],g=f.shape;if(f.type===b.Graphics.POLY){c.beginPath();var h=g.points;c.moveTo(h[0],h[1]);for(var i=1;i<h.length/2;i++)c.lineTo(h[2*i],h[2*i+1]);h[0]===h[h.length-2]&&h[1]===h[h.length-1]&&c.closePath()}else if(f.type===b.Graphics.RECT)c.beginPath(),c.rect(g.x,g.y,g.width,g.height),c.closePath();else if(f.type===b.Graphics.CIRC)c.beginPath(),c.arc(g.x,g.y,g.radius,0,2*Math.PI),c.closePath();else if(f.type===b.Graphics.ELIP){var j=2*g.width,k=2*g.height,l=g.x-j/2,m=g.y-k/2;c.beginPath();var n=.5522848,o=j/2*n,p=k/2*n,q=l+j,r=m+k,s=l+j/2,t=m+k/2;c.moveTo(l,t),c.bezierCurveTo(l,t-p,s-o,m,s,m),c.bezierCurveTo(s+o,m,q,t-p,q,t),c.bezierCurveTo(q,t+p,s+o,r,s,r),c.bezierCurveTo(s-o,r,l,t+p,l,t),c.closePath()}else if(f.type===b.Graphics.RREC){var u=g.points,v=u[0],w=u[1],x=u[2],y=u[3],z=u[4],A=Math.min(x,y)/2|0;z=z>A?A:z,c.beginPath(),c.moveTo(v,w+z),c.lineTo(v,w+y-z),c.quadraticCurveTo(v,w+y,v+z,w+y),c.lineTo(v+x-z,w+y),c.quadraticCurveTo(v+x,w+y,v+x,w+y-z),c.lineTo(v+x,w+z),c.quadraticCurveTo(v+x,w,v+x-z,w),c.lineTo(v+z,w),c.quadraticCurveTo(v,w,v,w+z),c.closePath()}}}},b.Graphics=function(){b.DisplayObjectContainer.call(this),this.renderable=!0,this.fillAlpha=1,this.lineWidth=0,this.lineColor=0,this.graphicsData=[],this.tint=16777215,this.blendMode=b.blendModes.NORMAL,this.currentPath=null,this._webGL=[],this.isMask=!1,this.boundsPadding=0,this._localBounds=new b.Rectangle(0,0,1,1),this.dirty=!0,this.webGLDirty=!1,this.cachedSpriteDirty=!1},b.Graphics.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Graphics.prototype.constructor=b.Graphics,Object.defineProperty(b.Graphics.prototype,"cacheAsBitmap",{get:function(){return this._cacheAsBitmap},set:function(a){this._cacheAsBitmap=a,this._cacheAsBitmap?this._generateCachedSprite():(this.destroyCachedSprite(),this.dirty=!0)}}),b.Graphics.prototype.lineStyle=function(a,c,d){if(this.lineWidth=a||0,this.lineColor=c||0,this.lineAlpha=arguments.length<3?1:d,this.currentPath){if(this.currentPath.shape.points.length)return this.drawShape(new b.Polygon(this.currentPath.shape.points.slice(-2))),this;this.currentPath.lineWidth=this.lineWidth,this.currentPath.lineColor=this.lineColor,this.currentPath.lineAlpha=this.lineAlpha}return this},b.Graphics.prototype.moveTo=function(a,c){return this.drawShape(new b.Polygon([a,c])),this},b.Graphics.prototype.lineTo=function(a,b){return this.currentPath.shape.points.push(a,b),this.dirty=!0,this},b.Graphics.prototype.quadraticCurveTo=function(a,b,c,d){this.currentPath?0===this.currentPath.shape.points.length&&(this.currentPath.shape.points=[0,0]):this.moveTo(0,0);var e,f,g=20,h=this.currentPath.shape.points;0===h.length&&this.moveTo(0,0);for(var i=h[h.length-2],j=h[h.length-1],k=0,l=1;g>=l;l++)k=l/g,e=i+(a-i)*k,f=j+(b-j)*k,h.push(e+(a+(c-a)*k-e)*k,f+(b+(d-b)*k-f)*k);return this.dirty=!0,this},b.Graphics.prototype.bezierCurveTo=function(a,b,c,d,e,f){this.currentPath?0===this.currentPath.shape.points.length&&(this.currentPath.shape.points=[0,0]):this.moveTo(0,0);for(var g,h,i,j,k,l=20,m=this.currentPath.shape.points,n=m[m.length-2],o=m[m.length-1],p=0,q=1;l>=q;q++)p=q/l,g=1-p,h=g*g,i=h*g,j=p*p,k=j*p,m.push(i*n+3*h*p*a+3*g*j*c+k*e,i*o+3*h*p*b+3*g*j*d+k*f);return this.dirty=!0,this},b.Graphics.prototype.arcTo=function(a,b,c,d,e){this.currentPath?0===this.currentPath.shape.points.length&&this.currentPath.shape.points.push(a,b):this.moveTo(a,b);var f=this.currentPath.shape.points,g=f[f.length-2],h=f[f.length-1],i=h-b,j=g-a,k=d-b,l=c-a,m=Math.abs(i*l-j*k);if(1e-8>m||0===e)(f[f.length-2]!==a||f[f.length-1]!==b)&&f.push(a,b);else{var n=i*i+j*j,o=k*k+l*l,p=i*k+j*l,q=e*Math.sqrt(n)/m,r=e*Math.sqrt(o)/m,s=q*p/n,t=r*p/o,u=q*l+r*j,v=q*k+r*i,w=j*(r+s),x=i*(r+s),y=l*(q+t),z=k*(q+t),A=Math.atan2(x-v,w-u),B=Math.atan2(z-v,y-u);this.arc(u+a,v+b,e,A,B,j*k>l*i)}return this.dirty=!0,this},b.Graphics.prototype.arc=function(a,b,c,d,e,f){var g=a+Math.cos(d)*c,h=b+Math.sin(d)*c,i=this.currentPath.shape.points;if(0===i.length?(this.moveTo(g,h),i=this.currentPath.shape.points):(i[i.length-2]!==g||i[i.length-1]!==h)&&i.push(g,h),d===e)return this;!f&&d>=e?e+=2*Math.PI:f&&e>=d&&(d+=2*Math.PI);var j=f?-1*(d-e):e-d,k=Math.abs(j)/(2*Math.PI)*40;if(0===j)return this;for(var l=j/(2*k),m=2*l,n=Math.cos(l),o=Math.sin(l),p=k-1,q=p%1/p,r=0;p>=r;r++){var s=r+q*r,t=l+d+m*s,u=Math.cos(t),v=-Math.sin(t);i.push((n*u+o*v)*c+a,(n*-v+o*u)*c+b)}return this.dirty=!0,this},b.Graphics.prototype.beginFill=function(a,b){return this.filling=!0,this.fillColor=a||0,this.fillAlpha=void 0===b?1:b,this.currentPath&&this.currentPath.shape.points.length<=2&&(this.currentPath.fill=this.filling,this.currentPath.fillColor=this.fillColor,this.currentPath.fillAlpha=this.fillAlpha),this},b.Graphics.prototype.endFill=function(){return this.filling=!1,this.fillColor=null,this.fillAlpha=1,this},b.Graphics.prototype.drawRect=function(a,c,d,e){return this.drawShape(new b.Rectangle(a,c,d,e)),this},b.Graphics.prototype.drawRoundedRect=function(a,c,d,e,f){return this.drawShape(new b.RoundedRectangle(a,c,d,e,f)),this},b.Graphics.prototype.drawCircle=function(a,c,d){return this.drawShape(new b.Circle(a,c,d)),this},b.Graphics.prototype.drawEllipse=function(a,c,d,e){return this.drawShape(new b.Ellipse(a,c,d,e)),this},b.Graphics.prototype.drawPolygon=function(a){return a instanceof Array||(a=Array.prototype.slice.call(arguments)),this.drawShape(new b.Polygon(a)),this},b.Graphics.prototype.clear=function(){return this.lineWidth=0,this.filling=!1,this.dirty=!0,this.clearDirty=!0,this.graphicsData=[],this},b.Graphics.prototype.generateTexture=function(a,c){a=a||1;var d=this.getBounds(),e=new b.CanvasBuffer(d.width*a,d.height*a),f=b.Texture.fromCanvas(e.canvas,c);return f.baseTexture.resolution=a,e.context.scale(a,a),e.context.translate(-d.x,-d.y),b.CanvasGraphics.renderGraphics(this,e.context),f},b.Graphics.prototype._renderWebGL=function(a){if(this.visible!==!1&&0!==this.alpha&&this.isMask!==!0){if(this._cacheAsBitmap)return(this.dirty||this.cachedSpriteDirty)&&(this._generateCachedSprite(),this.updateCachedSpriteTexture(),this.cachedSpriteDirty=!1,this.dirty=!1),this._cachedSprite.worldAlpha=this.worldAlpha,b.Sprite.prototype._renderWebGL.call(this._cachedSprite,a),void 0;if(a.spriteBatch.stop(),a.blendModeManager.setBlendMode(this.blendMode),this._mask&&a.maskManager.pushMask(this._mask,a),this._filters&&a.filterManager.pushFilter(this._filterBlock),this.blendMode!==a.spriteBatch.currentBlendMode){a.spriteBatch.currentBlendMode=this.blendMode;var c=b.blendModesWebGL[a.spriteBatch.currentBlendMode];a.spriteBatch.gl.blendFunc(c[0],c[1])}if(this.webGLDirty&&(this.dirty=!0,this.webGLDirty=!1),b.WebGLGraphics.renderGraphics(this,a),this.children.length){a.spriteBatch.start();for(var d=0,e=this.children.length;e>d;d++)this.children[d]._renderWebGL(a);a.spriteBatch.stop()}this._filters&&a.filterManager.popFilter(),this._mask&&a.maskManager.popMask(this.mask,a),a.drawCount++,a.spriteBatch.start()}},b.Graphics.prototype._renderCanvas=function(a){if(this.visible!==!1&&0!==this.alpha&&this.isMask!==!0){if(this._cacheAsBitmap)return(this.dirty||this.cachedSpriteDirty)&&(this._generateCachedSprite(),this.updateCachedSpriteTexture(),this.cachedSpriteDirty=!1,this.dirty=!1),this._cachedSprite.alpha=this.alpha,b.Sprite.prototype._renderCanvas.call(this._cachedSprite,a),void 0;var c=a.context,d=this.worldTransform;this.blendMode!==a.currentBlendMode&&(a.currentBlendMode=this.blendMode,c.globalCompositeOperation=b.blendModesCanvas[a.currentBlendMode]),this._mask&&a.maskManager.pushMask(this._mask,a);var e=a.resolution;c.setTransform(d.a*e,d.b*e,d.c*e,d.d*e,d.tx*e,d.ty*e),b.CanvasGraphics.renderGraphics(this,c);for(var f=0,g=this.children.length;g>f;f++)this.children[f]._renderCanvas(a);this._mask&&a.maskManager.popMask(a)}},b.Graphics.prototype.getBounds=function(a){if(this.isMask)return b.EmptyRectangle;this.dirty&&(this.updateLocalBounds(),this.webGLDirty=!0,this.cachedSpriteDirty=!0,this.dirty=!1);var c=this._localBounds,d=c.x,e=c.width+c.x,f=c.y,g=c.height+c.y,h=a||this.worldTransform,i=h.a,j=h.b,k=h.c,l=h.d,m=h.tx,n=h.ty,o=i*e+k*g+m,p=l*g+j*e+n,q=i*d+k*g+m,r=l*g+j*d+n,s=i*d+k*f+m,t=l*f+j*d+n,u=i*e+k*f+m,v=l*f+j*e+n,w=o,x=p,y=o,z=p;return y=y>q?q:y,y=y>s?s:y,y=y>u?u:y,z=z>r?r:z,z=z>t?t:z,z=z>v?v:z,w=q>w?q:w,w=s>w?s:w,w=u>w?u:w,x=r>x?r:x,x=t>x?t:x,x=v>x?v:x,this._bounds.x=y,this._bounds.width=w-y,this._bounds.y=z,this._bounds.height=x-z,this._bounds},b.Graphics.prototype.updateLocalBounds=function(){var a=1/0,c=-1/0,d=1/0,e=-1/0;if(this.graphicsData.length)for(var f,g,h,i,j,k,l=0;l<this.graphicsData.length;l++){var m=this.graphicsData[l],n=m.type,o=m.lineWidth;if(f=m.shape,n===b.Graphics.RECT||n===b.Graphics.RREC)h=f.x-o/2,i=f.y-o/2,j=f.width+o,k=f.height+o,a=a>h?h:a,c=h+j>c?h+j:c,d=d>i?i:d,e=i+k>e?i+k:e;else if(n===b.Graphics.CIRC)h=f.x,i=f.y,j=f.radius+o/2,k=f.radius+o/2,a=a>h-j?h-j:a,c=h+j>c?h+j:c,d=d>i-k?i-k:d,e=i+k>e?i+k:e;else if(n===b.Graphics.ELIP)h=f.x,i=f.y,j=f.width+o/2,k=f.height+o/2,a=a>h-j?h-j:a,c=h+j>c?h+j:c,d=d>i-k?i-k:d,e=i+k>e?i+k:e;else{g=f.points;for(var p=0;p<g.length;p+=2)h=g[p],i=g[p+1],a=a>h-o?h-o:a,c=h+o>c?h+o:c,d=d>i-o?i-o:d,e=i+o>e?i+o:e}}else a=0,c=0,d=0,e=0;var q=this.boundsPadding;this._localBounds.x=a-q,this._localBounds.width=c-a+2*q,this._localBounds.y=d-q,this._localBounds.height=e-d+2*q},b.Graphics.prototype._generateCachedSprite=function(){var a=this.getLocalBounds();if(this._cachedSprite)this._cachedSprite.buffer.resize(a.width,a.height);else{var c=new b.CanvasBuffer(a.width,a.height),d=b.Texture.fromCanvas(c.canvas);this._cachedSprite=new b.Sprite(d),this._cachedSprite.buffer=c,this._cachedSprite.worldTransform=this.worldTransform}this._cachedSprite.anchor.x=-(a.x/a.width),this._cachedSprite.anchor.y=-(a.y/a.height),this._cachedSprite.buffer.context.translate(-a.x,-a.y),this.worldAlpha=1,b.CanvasGraphics.renderGraphics(this,this._cachedSprite.buffer.context),this._cachedSprite.alpha=this.alpha},b.Graphics.prototype.updateCachedSpriteTexture=function(){var a=this._cachedSprite,b=a.texture,c=a.buffer.canvas;b.baseTexture.width=c.width,b.baseTexture.height=c.height,b.crop.width=b.frame.width=c.width,b.crop.height=b.frame.height=c.height,a._width=c.width,a._height=c.height,b.baseTexture.dirty()},b.Graphics.prototype.destroyCachedSprite=function(){this._cachedSprite.texture.destroy(!0),this._cachedSprite=null},b.Graphics.prototype.drawShape=function(a){this.currentPath&&this.currentPath.shape.points.length<=2&&this.graphicsData.pop(),this.currentPath=null;var c=new b.GraphicsData(this.lineWidth,this.lineColor,this.lineAlpha,this.fillColor,this.fillAlpha,this.filling,a);return this.graphicsData.push(c),c.type===b.Graphics.POLY&&(c.shape.closed=this.filling,this.currentPath=c),this.dirty=!0,c},b.GraphicsData=function(a,b,c,d,e,f,g){this.lineWidth=a,this.lineColor=b,this.lineAlpha=c,this.fillColor=d,this.fillAlpha=e,this.fill=f,this.shape=g,this.type=g.type},b.Graphics.POLY=0,b.Graphics.RECT=1,b.Graphics.CIRC=2,b.Graphics.ELIP=3,b.Graphics.RREC=4,b.Polygon.prototype.type=b.Graphics.POLY,b.Rectangle.prototype.type=b.Graphics.RECT,b.Circle.prototype.type=b.Graphics.CIRC,b.Ellipse.prototype.type=b.Graphics.ELIP,b.RoundedRectangle.prototype.type=b.Graphics.RREC,b.Strip=function(a){b.DisplayObjectContainer.call(this),this.texture=a,this.uvs=new b.Float32Array([0,1,1,1,1,0,0,1]),this.verticies=new b.Float32Array([0,0,100,0,100,100,0,100]),this.colors=new b.Float32Array([1,1,1,1]),this.indices=new b.Uint16Array([0,1,2,3]),this.dirty=!0,this.blendMode=b.blendModes.NORMAL,this.padding=0},b.Strip.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Strip.prototype.constructor=b.Strip,b.Strip.prototype._renderWebGL=function(a){!this.visible||this.alpha<=0||(a.spriteBatch.stop(),this._vertexBuffer||this._initWebGL(a),a.shaderManager.setShader(a.shaderManager.stripShader),this._renderStrip(a),a.spriteBatch.start())},b.Strip.prototype._initWebGL=function(a){var b=a.gl;this._vertexBuffer=b.createBuffer(),this._indexBuffer=b.createBuffer(),this._uvBuffer=b.createBuffer(),this._colorBuffer=b.createBuffer(),b.bindBuffer(b.ARRAY_BUFFER,this._vertexBuffer),b.bufferData(b.ARRAY_BUFFER,this.verticies,b.DYNAMIC_DRAW),b.bindBuffer(b.ARRAY_BUFFER,this._uvBuffer),b.bufferData(b.ARRAY_BUFFER,this.uvs,b.STATIC_DRAW),b.bindBuffer(b.ARRAY_BUFFER,this._colorBuffer),b.bufferData(b.ARRAY_BUFFER,this.colors,b.STATIC_DRAW),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,this._indexBuffer),b.bufferData(b.ELEMENT_ARRAY_BUFFER,this.indices,b.STATIC_DRAW)},b.Strip.prototype._renderStrip=function(a){var b=a.gl,c=a.projection,d=a.offset,e=a.shaderManager.stripShader;a.blendModeManager.setBlendMode(this.blendMode),b.uniformMatrix3fv(e.translationMatrix,!1,this.worldTransform.toArray(!0)),b.uniform2f(e.projectionVector,c.x,-c.y),b.uniform2f(e.offsetVector,-d.x,-d.y),b.uniform1f(e.alpha,this.worldAlpha),this.dirty?(this.dirty=!1,b.bindBuffer(b.ARRAY_BUFFER,this._vertexBuffer),b.bufferData(b.ARRAY_BUFFER,this.verticies,b.STATIC_DRAW),b.vertexAttribPointer(e.aVertexPosition,2,b.FLOAT,!1,0,0),b.bindBuffer(b.ARRAY_BUFFER,this._uvBuffer),b.bufferData(b.ARRAY_BUFFER,this.uvs,b.STATIC_DRAW),b.vertexAttribPointer(e.aTextureCoord,2,b.FLOAT,!1,0,0),b.activeTexture(b.TEXTURE0),this.texture.baseTexture._dirty[b.id]?a.renderer.updateTexture(this.texture.baseTexture):b.bindTexture(b.TEXTURE_2D,this.texture.baseTexture._glTextures[b.id]),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,this._indexBuffer),b.bufferData(b.ELEMENT_ARRAY_BUFFER,this.indices,b.STATIC_DRAW)):(b.bindBuffer(b.ARRAY_BUFFER,this._vertexBuffer),b.bufferSubData(b.ARRAY_BUFFER,0,this.verticies),b.vertexAttribPointer(e.aVertexPosition,2,b.FLOAT,!1,0,0),b.bindBuffer(b.ARRAY_BUFFER,this._uvBuffer),b.vertexAttribPointer(e.aTextureCoord,2,b.FLOAT,!1,0,0),b.activeTexture(b.TEXTURE0),this.texture.baseTexture._dirty[b.id]?a.renderer.updateTexture(this.texture.baseTexture):b.bindTexture(b.TEXTURE_2D,this.texture.baseTexture._glTextures[b.id]),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,this._indexBuffer)),b.drawElements(b.TRIANGLE_STRIP,this.indices.length,b.UNSIGNED_SHORT,0)},b.Strip.prototype._renderCanvas=function(a){var b=a.context,c=this.worldTransform;a.roundPixels?b.setTransform(c.a,c.b,c.c,c.d,0|c.tx,0|c.ty):b.setTransform(c.a,c.b,c.c,c.d,c.tx,c.ty);var d=this,e=d.verticies,f=d.uvs,g=e.length/2;this.count++;for(var h=0;g-2>h;h++){var i=2*h,j=e[i],k=e[i+2],l=e[i+4],m=e[i+1],n=e[i+3],o=e[i+5];if(this.padding>0){var p=(j+k+l)/3,q=(m+n+o)/3,r=j-p,s=m-q,t=Math.sqrt(r*r+s*s);j=p+r/t*(t+3),m=q+s/t*(t+3),r=k-p,s=n-q,t=Math.sqrt(r*r+s*s),k=p+r/t*(t+3),n=q+s/t*(t+3),r=l-p,s=o-q,t=Math.sqrt(r*r+s*s),l=p+r/t*(t+3),o=q+s/t*(t+3)}var u=f[i]*d.texture.width,v=f[i+2]*d.texture.width,w=f[i+4]*d.texture.width,x=f[i+1]*d.texture.height,y=f[i+3]*d.texture.height,z=f[i+5]*d.texture.height;b.save(),b.beginPath(),b.moveTo(j,m),b.lineTo(k,n),b.lineTo(l,o),b.closePath(),b.clip();var A=u*y+x*w+v*z-y*w-x*v-u*z,B=j*y+x*l+k*z-y*l-x*k-j*z,C=u*k+j*w+v*l-k*w-j*v-u*l,D=u*y*l+x*k*w+j*v*z-j*y*w-x*v*l-u*k*z,E=m*y+x*o+n*z-y*o-x*n-m*z,F=u*n+m*w+v*o-n*w-m*v-u*o,G=u*y*o+x*n*w+m*v*z-m*y*w-x*v*o-u*n*z;b.transform(B/A,E/A,C/A,F/A,D/A,G/A),b.drawImage(d.texture.baseTexture.source,0,0),b.restore()}},b.Strip.prototype.renderStripFlat=function(a){var b=this.context,c=a.verticies,d=c.length/2;this.count++,b.beginPath();for(var e=1;d-2>e;e++){var f=2*e,g=c[f],h=c[f+2],i=c[f+4],j=c[f+1],k=c[f+3],l=c[f+5];b.moveTo(g,j),b.lineTo(h,k),b.lineTo(i,l)}b.fillStyle="#FF0000",b.fill(),b.closePath()},b.Strip.prototype.onTextureUpdate=function(){this.updateFrame=!0},b.Rope=function(a,c){b.Strip.call(this,a),this.points=c,this.verticies=new b.Float32Array(4*c.length),this.uvs=new b.Float32Array(4*c.length),this.colors=new b.Float32Array(2*c.length),this.indices=new b.Uint16Array(2*c.length),this.refresh()},b.Rope.prototype=Object.create(b.Strip.prototype),b.Rope.prototype.constructor=b.Rope,b.Rope.prototype.refresh=function(){var a=this.points;if(!(a.length<1)){var b=this.uvs,c=a[0],d=this.indices,e=this.colors;this.count-=.2,b[0]=0,b[1]=0,b[2]=0,b[3]=1,e[0]=1,e[1]=1,d[0]=0,d[1]=1;for(var f,g,h,i=a.length,j=1;i>j;j++)f=a[j],g=4*j,h=j/(i-1),j%2?(b[g]=h,b[g+1]=0,b[g+2]=h,b[g+3]=1):(b[g]=h,b[g+1]=0,b[g+2]=h,b[g+3]=1),g=2*j,e[g]=1,e[g+1]=1,g=2*j,d[g]=g,d[g+1]=g+1,c=f}},b.Rope.prototype.updateTransform=function(){var a=this.points;if(!(a.length<1)){var c,d=a[0],e={x:0,y:0};this.count-=.2;for(var f,g,h,i,j,k=this.verticies,l=a.length,m=0;l>m;m++)f=a[m],g=4*m,c=m<a.length-1?a[m+1]:f,e.y=-(c.x-d.x),e.x=c.y-d.y,h=10*(1-m/(l-1)),h>1&&(h=1),i=Math.sqrt(e.x*e.x+e.y*e.y),j=this.texture.height/2,e.x/=i,e.y/=i,e.x*=j,e.y*=j,k[g]=f.x+e.x,k[g+1]=f.y+e.y,k[g+2]=f.x-e.x,k[g+3]=f.y-e.y,d=f;b.DisplayObjectContainer.prototype.updateTransform.call(this)}},b.Rope.prototype.setTexture=function(a){this.texture=a},b.TilingSprite=function(a,c,d){b.Sprite.call(this,a),this._width=c||100,this._height=d||100,this.tileScale=new b.Point(1,1),this.tileScaleOffset=new b.Point(1,1),this.tilePosition=new b.Point(0,0),this.renderable=!0,this.tint=16777215,this.blendMode=b.blendModes.NORMAL},b.TilingSprite.prototype=Object.create(b.Sprite.prototype),b.TilingSprite.prototype.constructor=b.TilingSprite,Object.defineProperty(b.TilingSprite.prototype,"width",{get:function(){return this._width},set:function(a){this._width=a}}),Object.defineProperty(b.TilingSprite.prototype,"height",{get:function(){return this._height},set:function(a){this._height=a}}),b.TilingSprite.prototype.setTexture=function(a){this.texture!==a&&(this.texture=a,this.refreshTexture=!0,this.cachedTint=16777215)},b.TilingSprite.prototype._renderWebGL=function(a){if(this.visible!==!1&&0!==this.alpha){var c,d;for(this._mask&&(a.spriteBatch.stop(),a.maskManager.pushMask(this.mask,a),a.spriteBatch.start()),this._filters&&(a.spriteBatch.flush(),a.filterManager.pushFilter(this._filterBlock)),!this.tilingTexture||this.refreshTexture?(this.generateTilingTexture(!0),this.tilingTexture&&this.tilingTexture.needsUpdate&&(b.updateWebGLTexture(this.tilingTexture.baseTexture,a.gl),this.tilingTexture.needsUpdate=!1)):a.spriteBatch.renderTilingSprite(this),c=0,d=this.children.length;d>c;c++)this.children[c]._renderWebGL(a);a.spriteBatch.stop(),this._filters&&a.filterManager.popFilter(),this._mask&&a.maskManager.popMask(this._mask,a),a.spriteBatch.start()}},b.TilingSprite.prototype._renderCanvas=function(a){if(this.visible!==!1&&0!==this.alpha){var c=a.context;this._mask&&a.maskManager.pushMask(this._mask,c),c.globalAlpha=this.worldAlpha;var d,e,f=this.worldTransform,g=a.resolution;if(c.setTransform(f.a*g,f.c*g,f.b*g,f.d*g,f.tx*g,f.ty*g),!this.__tilePattern||this.refreshTexture){if(this.generateTilingTexture(!1),!this.tilingTexture)return;this.__tilePattern=c.createPattern(this.tilingTexture.baseTexture.source,"repeat")}this.blendMode!==a.currentBlendMode&&(a.currentBlendMode=this.blendMode,c.globalCompositeOperation=b.blendModesCanvas[a.currentBlendMode]);var h=this.tilePosition,i=this.tileScale;for(h.x%=this.tilingTexture.baseTexture.width,h.y%=this.tilingTexture.baseTexture.height,c.scale(i.x,i.y),c.translate(h.x+this.anchor.x*-this._width,h.y+this.anchor.y*-this._height),c.fillStyle=this.__tilePattern,c.fillRect(-h.x,-h.y,this._width/i.x,this._height/i.y),c.scale(1/i.x,1/i.y),c.translate(-h.x+this.anchor.x*this._width,-h.y+this.anchor.y*this._height),this._mask&&a.maskManager.popMask(a.context),d=0,e=this.children.length;e>d;d++)this.children[d]._renderCanvas(a)}},b.TilingSprite.prototype.getBounds=function(){var a=this._width,b=this._height,c=a*(1-this.anchor.x),d=a*-this.anchor.x,e=b*(1-this.anchor.y),f=b*-this.anchor.y,g=this.worldTransform,h=g.a,i=g.b,j=g.c,k=g.d,l=g.tx,m=g.ty,n=h*d+j*f+l,o=k*f+i*d+m,p=h*c+j*f+l,q=k*f+i*c+m,r=h*c+j*e+l,s=k*e+i*c+m,t=h*d+j*e+l,u=k*e+i*d+m,v=-1/0,w=-1/0,x=1/0,y=1/0;x=x>n?n:x,x=x>p?p:x,x=x>r?r:x,x=x>t?t:x,y=y>o?o:y,y=y>q?q:y,y=y>s?s:y,y=y>u?u:y,v=n>v?n:v,v=p>v?p:v,v=r>v?r:v,v=t>v?t:v,w=o>w?o:w,w=q>w?q:w,w=s>w?s:w,w=u>w?u:w;var z=this._bounds;return z.x=x,z.width=v-x,z.y=y,z.height=w-y,this._currentBounds=z,z},b.TilingSprite.prototype.onTextureUpdate=function(){},b.TilingSprite.prototype.generateTilingTexture=function(a){if(this.texture.baseTexture.hasLoaded){var c,d,e=this.originalTexture||this.texture,f=e.frame,g=f.width!==e.baseTexture.width||f.height!==e.baseTexture.height,h=!1;if(a?(c=b.getNextPowerOfTwo(f.width),d=b.getNextPowerOfTwo(f.height),(f.width!==c||f.height!==d)&&(h=!0)):g&&(c=f.width,d=f.height,h=!0),h){var i;this.tilingTexture&&this.tilingTexture.isTiling?(i=this.tilingTexture.canvasBuffer,i.resize(c,d),this.tilingTexture.baseTexture.width=c,this.tilingTexture.baseTexture.height=d,this.tilingTexture.needsUpdate=!0):(i=new b.CanvasBuffer(c,d),this.tilingTexture=b.Texture.fromCanvas(i.canvas),this.tilingTexture.canvasBuffer=i,this.tilingTexture.isTiling=!0),i.context.drawImage(e.baseTexture.source,e.crop.x,e.crop.y,e.crop.width,e.crop.height,0,0,c,d),this.tileScaleOffset.x=f.width/c,this.tileScaleOffset.y=f.height/d}else this.tilingTexture&&this.tilingTexture.isTiling&&this.tilingTexture.destroy(!0),this.tileScaleOffset.x=1,this.tileScaleOffset.y=1,this.tilingTexture=e;this.refreshTexture=!1,this.originalTexture=this.texture,this.texture=this.tilingTexture,this.tilingTexture.baseTexture._powerOf2=!0}};var c={};c.BoneData=function(a,b){this.name=a,this.parent=b},c.BoneData.prototype={length:0,x:0,y:0,rotation:0,scaleX:1,scaleY:1},c.SlotData=function(a,b){this.name=a,this.boneData=b},c.SlotData.prototype={r:1,g:1,b:1,a:1,attachmentName:null},c.Bone=function(a,b){this.data=a,this.parent=b,this.setToSetupPose()
},c.Bone.yDown=!1,c.Bone.prototype={x:0,y:0,rotation:0,scaleX:1,scaleY:1,m00:0,m01:0,worldX:0,m10:0,m11:0,worldY:0,worldRotation:0,worldScaleX:1,worldScaleY:1,updateWorldTransform:function(a,b){var d=this.parent;null!=d?(this.worldX=this.x*d.m00+this.y*d.m01+d.worldX,this.worldY=this.x*d.m10+this.y*d.m11+d.worldY,this.worldScaleX=d.worldScaleX*this.scaleX,this.worldScaleY=d.worldScaleY*this.scaleY,this.worldRotation=d.worldRotation+this.rotation):(this.worldX=this.x,this.worldY=this.y,this.worldScaleX=this.scaleX,this.worldScaleY=this.scaleY,this.worldRotation=this.rotation);var e=this.worldRotation*Math.PI/180,f=Math.cos(e),g=Math.sin(e);this.m00=f*this.worldScaleX,this.m10=g*this.worldScaleX,this.m01=-g*this.worldScaleY,this.m11=f*this.worldScaleY,a&&(this.m00=-this.m00,this.m01=-this.m01),b&&(this.m10=-this.m10,this.m11=-this.m11),c.Bone.yDown&&(this.m10=-this.m10,this.m11=-this.m11)},setToSetupPose:function(){var a=this.data;this.x=a.x,this.y=a.y,this.rotation=a.rotation,this.scaleX=a.scaleX,this.scaleY=a.scaleY}},c.Slot=function(a,b,c){this.data=a,this.skeleton=b,this.bone=c,this.setToSetupPose()},c.Slot.prototype={r:1,g:1,b:1,a:1,_attachmentTime:0,attachment:null,setAttachment:function(a){this.attachment=a,this._attachmentTime=this.skeleton.time},setAttachmentTime:function(a){this._attachmentTime=this.skeleton.time-a},getAttachmentTime:function(){return this.skeleton.time-this._attachmentTime},setToSetupPose:function(){var a=this.data;this.r=a.r,this.g=a.g,this.b=a.b,this.a=a.a;for(var b=this.skeleton.data.slots,c=0,d=b.length;d>c;c++)if(b[c]==a){this.setAttachment(a.attachmentName?this.skeleton.getAttachmentBySlotIndex(c,a.attachmentName):null);break}}},c.Skin=function(a){this.name=a,this.attachments={}},c.Skin.prototype={addAttachment:function(a,b,c){this.attachments[a+":"+b]=c},getAttachment:function(a,b){return this.attachments[a+":"+b]},_attachAll:function(a,b){for(var c in b.attachments){var d=c.indexOf(":"),e=parseInt(c.substring(0,d),10),f=c.substring(d+1),g=a.slots[e];if(g.attachment&&g.attachment.name==f){var h=this.getAttachment(e,f);h&&g.setAttachment(h)}}}},c.Animation=function(a,b,c){this.name=a,this.timelines=b,this.duration=c},c.Animation.prototype={apply:function(a,b,c){c&&this.duration&&(b%=this.duration);for(var d=this.timelines,e=0,f=d.length;f>e;e++)d[e].apply(a,b,1)},mix:function(a,b,c,d){c&&this.duration&&(b%=this.duration);for(var e=this.timelines,f=0,g=e.length;g>f;f++)e[f].apply(a,b,d)}},c.binarySearch=function(a,b,c){var d=0,e=Math.floor(a.length/c)-2;if(!e)return c;for(var f=e>>>1;;){if(a[(f+1)*c]<=b?d=f+1:e=f,d==e)return(d+1)*c;f=d+e>>>1}},c.linearSearch=function(a,b,c){for(var d=0,e=a.length-c;e>=d;d+=c)if(a[d]>b)return d;return-1},c.Curves=function(a){this.curves=[],this.curves.length=6*(a-1)},c.Curves.prototype={setLinear:function(a){this.curves[6*a]=0},setStepped:function(a){this.curves[6*a]=-1},setCurve:function(a,b,c,d,e){var f=.1,g=f*f,h=g*f,i=3*f,j=3*g,k=6*g,l=6*h,m=2*-b+d,n=2*-c+e,o=3*(b-d)+1,p=3*(c-e)+1,q=6*a,r=this.curves;r[q]=b*i+m*j+o*h,r[q+1]=c*i+n*j+p*h,r[q+2]=m*k+o*l,r[q+3]=n*k+p*l,r[q+4]=o*l,r[q+5]=p*l},getCurvePercent:function(a,b){b=0>b?0:b>1?1:b;var c=6*a,d=this.curves,e=d[c];if(!e)return b;if(-1==e)return 0;for(var f=d[c+1],g=d[c+2],h=d[c+3],i=d[c+4],j=d[c+5],k=e,l=f,m=8;;){if(k>=b){var n=k-e,o=l-f;return o+(l-o)*(b-n)/(k-n)}if(!m)break;m--,e+=g,f+=h,g+=i,h+=j,k+=e,l+=f}return l+(1-l)*(b-k)/(1-k)}},c.RotateTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=2*a},c.RotateTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/2},setFrame:function(a,b,c){a*=2,this.frames[a]=b,this.frames[a+1]=c},apply:function(a,b,d){var e,f=this.frames;if(!(b<f[0])){var g=a.bones[this.boneIndex];if(b>=f[f.length-2]){for(e=g.data.rotation+f[f.length-1]-g.rotation;e>180;)e-=360;for(;-180>e;)e+=360;return g.rotation+=e*d,void 0}var h=c.binarySearch(f,b,2),i=f[h-1],j=f[h],k=1-(b-j)/(f[h-2]-j);for(k=this.curves.getCurvePercent(h/2-1,k),e=f[h+1]-i;e>180;)e-=360;for(;-180>e;)e+=360;for(e=g.data.rotation+(i+e*k)-g.rotation;e>180;)e-=360;for(;-180>e;)e+=360;g.rotation+=e*d}}},c.TranslateTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=3*a},c.TranslateTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/3},setFrame:function(a,b,c,d){a*=3,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d},apply:function(a,b,d){var e=this.frames;if(!(b<e[0])){var f=a.bones[this.boneIndex];if(b>=e[e.length-3])return f.x+=(f.data.x+e[e.length-2]-f.x)*d,f.y+=(f.data.y+e[e.length-1]-f.y)*d,void 0;var g=c.binarySearch(e,b,3),h=e[g-2],i=e[g-1],j=e[g],k=1-(b-j)/(e[g+-3]-j);k=this.curves.getCurvePercent(g/3-1,k),f.x+=(f.data.x+h+(e[g+1]-h)*k-f.x)*d,f.y+=(f.data.y+i+(e[g+2]-i)*k-f.y)*d}}},c.ScaleTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=3*a},c.ScaleTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/3},setFrame:function(a,b,c,d){a*=3,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d},apply:function(a,b,d){var e=this.frames;if(!(b<e[0])){var f=a.bones[this.boneIndex];if(b>=e[e.length-3])return f.scaleX+=(f.data.scaleX-1+e[e.length-2]-f.scaleX)*d,f.scaleY+=(f.data.scaleY-1+e[e.length-1]-f.scaleY)*d,void 0;var g=c.binarySearch(e,b,3),h=e[g-2],i=e[g-1],j=e[g],k=1-(b-j)/(e[g+-3]-j);k=this.curves.getCurvePercent(g/3-1,k),f.scaleX+=(f.data.scaleX-1+h+(e[g+1]-h)*k-f.scaleX)*d,f.scaleY+=(f.data.scaleY-1+i+(e[g+2]-i)*k-f.scaleY)*d}}},c.ColorTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=5*a},c.ColorTimeline.prototype={slotIndex:0,getFrameCount:function(){return this.frames.length/5},setFrame:function(a,b,c,d,e,f){a*=5,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d,this.frames[a+3]=e,this.frames[a+4]=f},apply:function(a,b,d){var e=this.frames;if(!(b<e[0])){var f=a.slots[this.slotIndex];if(b>=e[e.length-5]){var g=e.length-1;return f.r=e[g-3],f.g=e[g-2],f.b=e[g-1],f.a=e[g],void 0}var h=c.binarySearch(e,b,5),i=e[h-4],j=e[h-3],k=e[h-2],l=e[h-1],m=e[h],n=1-(b-m)/(e[h-5]-m);n=this.curves.getCurvePercent(h/5-1,n);var o=i+(e[h+1]-i)*n,p=j+(e[h+2]-j)*n,q=k+(e[h+3]-k)*n,r=l+(e[h+4]-l)*n;1>d?(f.r+=(o-f.r)*d,f.g+=(p-f.g)*d,f.b+=(q-f.b)*d,f.a+=(r-f.a)*d):(f.r=o,f.g=p,f.b=q,f.a=r)}}},c.AttachmentTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=a,this.attachmentNames=[],this.attachmentNames.length=a},c.AttachmentTimeline.prototype={slotIndex:0,getFrameCount:function(){return this.frames.length},setFrame:function(a,b,c){this.frames[a]=b,this.attachmentNames[a]=c},apply:function(a,b){var d=this.frames;if(!(b<d[0])){var e;e=b>=d[d.length-1]?d.length-1:c.binarySearch(d,b,1)-1;var f=this.attachmentNames[e];a.slots[this.slotIndex].setAttachment(f?a.getAttachmentBySlotIndex(this.slotIndex,f):null)}}},c.SkeletonData=function(){this.bones=[],this.slots=[],this.skins=[],this.animations=[]},c.SkeletonData.prototype={defaultSkin:null,findBone:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},findBoneIndex:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].name==a)return c;return-1},findSlot:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].name==a)return slot[c];return null},findSlotIndex:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].name==a)return c;return-1},findSkin:function(a){for(var b=this.skins,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},findAnimation:function(a){for(var b=this.animations,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null}},c.Skeleton=function(a){this.data=a,this.bones=[];for(var b=0,d=a.bones.length;d>b;b++){var e=a.bones[b],f=e.parent?this.bones[a.bones.indexOf(e.parent)]:null;this.bones.push(new c.Bone(e,f))}for(this.slots=[],this.drawOrder=[],b=0,d=a.slots.length;d>b;b++){var g=a.slots[b],h=this.bones[a.bones.indexOf(g.boneData)],i=new c.Slot(g,this,h);this.slots.push(i),this.drawOrder.push(i)}},c.Skeleton.prototype={x:0,y:0,skin:null,r:1,g:1,b:1,a:1,time:0,flipX:!1,flipY:!1,updateWorldTransform:function(){for(var a=this.flipX,b=this.flipY,c=this.bones,d=0,e=c.length;e>d;d++)c[d].updateWorldTransform(a,b)},setToSetupPose:function(){this.setBonesToSetupPose(),this.setSlotsToSetupPose()},setBonesToSetupPose:function(){for(var a=this.bones,b=0,c=a.length;c>b;b++)a[b].setToSetupPose()},setSlotsToSetupPose:function(){for(var a=this.slots,b=0,c=a.length;c>b;b++)a[b].setToSetupPose(b)},getRootBone:function(){return this.bones.length?this.bones[0]:null},findBone:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return b[c];return null},findBoneIndex:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return c;return-1},findSlot:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return b[c];return null},findSlotIndex:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return c;return-1},setSkinByName:function(a){var b=this.data.findSkin(a);if(!b)throw"Skin not found: "+a;this.setSkin(b)},setSkin:function(a){this.skin&&a&&a._attachAll(this,this.skin),this.skin=a},getAttachmentBySlotName:function(a,b){return this.getAttachmentBySlotIndex(this.data.findSlotIndex(a),b)},getAttachmentBySlotIndex:function(a,b){if(this.skin){var c=this.skin.getAttachment(a,b);if(c)return c}return this.data.defaultSkin?this.data.defaultSkin.getAttachment(a,b):null},setAttachment:function(a,b){for(var c=this.slots,d=0,e=c.size;e>d;d++){var f=c[d];if(f.data.name==a){var g=null;if(b&&(g=this.getAttachment(d,b),null==g))throw"Attachment not found: "+b+", for slot: "+a;return f.setAttachment(g),void 0}}throw"Slot not found: "+a},update:function(a){time+=a}},c.AttachmentType={region:0},c.RegionAttachment=function(){this.offset=[],this.offset.length=8,this.uvs=[],this.uvs.length=8},c.RegionAttachment.prototype={x:0,y:0,rotation:0,scaleX:1,scaleY:1,width:0,height:0,rendererObject:null,regionOffsetX:0,regionOffsetY:0,regionWidth:0,regionHeight:0,regionOriginalWidth:0,regionOriginalHeight:0,setUVs:function(a,b,c,d,e){var f=this.uvs;e?(f[2]=a,f[3]=d,f[4]=a,f[5]=b,f[6]=c,f[7]=b,f[0]=c,f[1]=d):(f[0]=a,f[1]=d,f[2]=a,f[3]=b,f[4]=c,f[5]=b,f[6]=c,f[7]=d)},updateOffset:function(){var a=this.width/this.regionOriginalWidth*this.scaleX,b=this.height/this.regionOriginalHeight*this.scaleY,c=-this.width/2*this.scaleX+this.regionOffsetX*a,d=-this.height/2*this.scaleY+this.regionOffsetY*b,e=c+this.regionWidth*a,f=d+this.regionHeight*b,g=this.rotation*Math.PI/180,h=Math.cos(g),i=Math.sin(g),j=c*h+this.x,k=c*i,l=d*h+this.y,m=d*i,n=e*h+this.x,o=e*i,p=f*h+this.y,q=f*i,r=this.offset;r[0]=j-m,r[1]=l+k,r[2]=j-q,r[3]=p+k,r[4]=n-q,r[5]=p+o,r[6]=n-m,r[7]=l+o},computeVertices:function(a,b,c,d){a+=c.worldX,b+=c.worldY;var e=c.m00,f=c.m01,g=c.m10,h=c.m11,i=this.offset;d[0]=i[0]*e+i[1]*f+a,d[1]=i[0]*g+i[1]*h+b,d[2]=i[2]*e+i[3]*f+a,d[3]=i[2]*g+i[3]*h+b,d[4]=i[4]*e+i[5]*f+a,d[5]=i[4]*g+i[5]*h+b,d[6]=i[6]*e+i[7]*f+a,d[7]=i[6]*g+i[7]*h+b}},c.AnimationStateData=function(a){this.skeletonData=a,this.animationToMixTime={}},c.AnimationStateData.prototype={defaultMix:0,setMixByName:function(a,b,c){var d=this.skeletonData.findAnimation(a);if(!d)throw"Animation not found: "+a;var e=this.skeletonData.findAnimation(b);if(!e)throw"Animation not found: "+b;this.setMix(d,e,c)},setMix:function(a,b,c){this.animationToMixTime[a.name+":"+b.name]=c},getMix:function(a,b){var c=this.animationToMixTime[a.name+":"+b.name];return c?c:this.defaultMix}},c.AnimationState=function(a){this.data=a,this.queue=[]},c.AnimationState.prototype={animationSpeed:1,current:null,previous:null,currentTime:0,previousTime:0,currentLoop:!1,previousLoop:!1,mixTime:0,mixDuration:0,update:function(a){if(this.currentTime+=a*this.animationSpeed,this.previousTime+=a,this.mixTime+=a,this.queue.length>0){var b=this.queue[0];this.currentTime>=b.delay&&(this._setAnimation(b.animation,b.loop),this.queue.shift())}},apply:function(a){if(this.current)if(this.previous){this.previous.apply(a,this.previousTime,this.previousLoop);var b=this.mixTime/this.mixDuration;b>=1&&(b=1,this.previous=null),this.current.mix(a,this.currentTime,this.currentLoop,b)}else this.current.apply(a,this.currentTime,this.currentLoop)},clearAnimation:function(){this.previous=null,this.current=null,this.queue.length=0},_setAnimation:function(a,b){this.previous=null,a&&this.current&&(this.mixDuration=this.data.getMix(this.current,a),this.mixDuration>0&&(this.mixTime=0,this.previous=this.current,this.previousTime=this.currentTime,this.previousLoop=this.currentLoop)),this.current=a,this.currentLoop=b,this.currentTime=0},setAnimationByName:function(a,b){var c=this.data.skeletonData.findAnimation(a);if(!c)throw"Animation not found: "+a;this.setAnimation(c,b)},setAnimation:function(a,b){this.queue.length=0,this._setAnimation(a,b)},addAnimationByName:function(a,b,c){var d=this.data.skeletonData.findAnimation(a);if(!d)throw"Animation not found: "+a;this.addAnimation(d,b,c)},addAnimation:function(a,b,c){var d={};if(d.animation=a,d.loop=b,!c||0>=c){var e=this.queue.length?this.queue[this.queue.length-1].animation:this.current;c=null!=e?e.duration-this.data.getMix(e,a)+(c||0):0}d.delay=c,this.queue.push(d)},isComplete:function(){return!this.current||this.currentTime>=this.current.duration}},c.SkeletonJson=function(a){this.attachmentLoader=a},c.SkeletonJson.prototype={scale:1,readSkeletonData:function(a){for(var b,d=new c.SkeletonData,e=a.bones,f=0,g=e.length;g>f;f++){var h=e[f],i=null;if(h.parent&&(i=d.findBone(h.parent),!i))throw"Parent bone not found: "+h.parent;b=new c.BoneData(h.name,i),b.length=(h.length||0)*this.scale,b.x=(h.x||0)*this.scale,b.y=(h.y||0)*this.scale,b.rotation=h.rotation||0,b.scaleX=h.scaleX||1,b.scaleY=h.scaleY||1,d.bones.push(b)}var j=a.slots;for(f=0,g=j.length;g>f;f++){var k=j[f];if(b=d.findBone(k.bone),!b)throw"Slot bone not found: "+k.bone;var l=new c.SlotData(k.name,b),m=k.color;m&&(l.r=c.SkeletonJson.toColor(m,0),l.g=c.SkeletonJson.toColor(m,1),l.b=c.SkeletonJson.toColor(m,2),l.a=c.SkeletonJson.toColor(m,3)),l.attachmentName=k.attachment,d.slots.push(l)}var n=a.skins;for(var o in n)if(n.hasOwnProperty(o)){var p=n[o],q=new c.Skin(o);for(var r in p)if(p.hasOwnProperty(r)){var s=d.findSlotIndex(r),t=p[r];for(var u in t)if(t.hasOwnProperty(u)){var v=this.readAttachment(q,u,t[u]);null!=v&&q.addAttachment(s,u,v)}}d.skins.push(q),"default"==q.name&&(d.defaultSkin=q)}var w=a.animations;for(var x in w)w.hasOwnProperty(x)&&this.readAnimation(x,w[x],d);return d},readAttachment:function(a,b,d){b=d.name||b;var e=c.AttachmentType[d.type||"region"];if(e==c.AttachmentType.region){var f=new c.RegionAttachment;return f.x=(d.x||0)*this.scale,f.y=(d.y||0)*this.scale,f.scaleX=d.scaleX||1,f.scaleY=d.scaleY||1,f.rotation=d.rotation||0,f.width=(d.width||32)*this.scale,f.height=(d.height||32)*this.scale,f.updateOffset(),f.rendererObject={},f.rendererObject.name=b,f.rendererObject.scale={},f.rendererObject.scale.x=f.scaleX,f.rendererObject.scale.y=f.scaleY,f.rendererObject.rotation=-f.rotation*Math.PI/180,f}throw"Unknown attachment type: "+e},readAnimation:function(a,b,d){var e,f,g,h,i,j,k,l=[],m=0,n=b.bones;for(var o in n)if(n.hasOwnProperty(o)){var p=d.findBoneIndex(o);if(-1==p)throw"Bone not found: "+o;var q=n[o];for(g in q)if(q.hasOwnProperty(g))if(i=q[g],"rotate"==g){for(f=new c.RotateTimeline(i.length),f.boneIndex=p,e=0,j=0,k=i.length;k>j;j++)h=i[j],f.setFrame(e,h.time,h.angle),c.SkeletonJson.readCurve(f,e,h),e++;l.push(f),m=Math.max(m,f.frames[2*f.getFrameCount()-2])}else{if("translate"!=g&&"scale"!=g)throw"Invalid timeline type for a bone: "+g+" ("+o+")";var r=1;for("scale"==g?f=new c.ScaleTimeline(i.length):(f=new c.TranslateTimeline(i.length),r=this.scale),f.boneIndex=p,e=0,j=0,k=i.length;k>j;j++){h=i[j];var s=(h.x||0)*r,t=(h.y||0)*r;f.setFrame(e,h.time,s,t),c.SkeletonJson.readCurve(f,e,h),e++}l.push(f),m=Math.max(m,f.frames[3*f.getFrameCount()-3])}}var u=b.slots;for(var v in u)if(u.hasOwnProperty(v)){var w=u[v],x=d.findSlotIndex(v);for(g in w)if(w.hasOwnProperty(g))if(i=w[g],"color"==g){for(f=new c.ColorTimeline(i.length),f.slotIndex=x,e=0,j=0,k=i.length;k>j;j++){h=i[j];var y=h.color,z=c.SkeletonJson.toColor(y,0),A=c.SkeletonJson.toColor(y,1),B=c.SkeletonJson.toColor(y,2),C=c.SkeletonJson.toColor(y,3);f.setFrame(e,h.time,z,A,B,C),c.SkeletonJson.readCurve(f,e,h),e++}l.push(f),m=Math.max(m,f.frames[5*f.getFrameCount()-5])}else{if("attachment"!=g)throw"Invalid timeline type for a slot: "+g+" ("+v+")";for(f=new c.AttachmentTimeline(i.length),f.slotIndex=x,e=0,j=0,k=i.length;k>j;j++)h=i[j],f.setFrame(e++,h.time,h.name);l.push(f),m=Math.max(m,f.frames[f.getFrameCount()-1])}}d.animations.push(new c.Animation(a,l,m))}},c.SkeletonJson.readCurve=function(a,b,c){var d=c.curve;d&&("stepped"==d?a.curves.setStepped(b):d instanceof Array&&a.curves.setCurve(b,d[0],d[1],d[2],d[3]))},c.SkeletonJson.toColor=function(a,b){if(8!=a.length)throw"Color hexidecimal length must be 8, recieved: "+a;return parseInt(a.substr(2*b,2),16)/255},c.Atlas=function(a,b){this.textureLoader=b,this.pages=[],this.regions=[];var d=new c.AtlasReader(a),e=[];e.length=4;for(var f=null;;){var g=d.readLine();if(null==g)break;if(g=d.trim(g),g.length)if(f){var h=new c.AtlasRegion;h.name=g,h.page=f,h.rotate="true"==d.readValue(),d.readTuple(e);var i=parseInt(e[0],10),j=parseInt(e[1],10);d.readTuple(e);var k=parseInt(e[0],10),l=parseInt(e[1],10);h.u=i/f.width,h.v=j/f.height,h.rotate?(h.u2=(i+l)/f.width,h.v2=(j+k)/f.height):(h.u2=(i+k)/f.width,h.v2=(j+l)/f.height),h.x=i,h.y=j,h.width=Math.abs(k),h.height=Math.abs(l),4==d.readTuple(e)&&(h.splits=[parseInt(e[0],10),parseInt(e[1],10),parseInt(e[2],10),parseInt(e[3],10)],4==d.readTuple(e)&&(h.pads=[parseInt(e[0],10),parseInt(e[1],10),parseInt(e[2],10),parseInt(e[3],10)],d.readTuple(e))),h.originalWidth=parseInt(e[0],10),h.originalHeight=parseInt(e[1],10),d.readTuple(e),h.offsetX=parseInt(e[0],10),h.offsetY=parseInt(e[1],10),h.index=parseInt(d.readValue(),10),this.regions.push(h)}else{f=new c.AtlasPage,f.name=g,f.format=c.Atlas.Format[d.readValue()],d.readTuple(e),f.minFilter=c.Atlas.TextureFilter[e[0]],f.magFilter=c.Atlas.TextureFilter[e[1]];var m=d.readValue();f.uWrap=c.Atlas.TextureWrap.clampToEdge,f.vWrap=c.Atlas.TextureWrap.clampToEdge,"x"==m?f.uWrap=c.Atlas.TextureWrap.repeat:"y"==m?f.vWrap=c.Atlas.TextureWrap.repeat:"xy"==m&&(f.uWrap=f.vWrap=c.Atlas.TextureWrap.repeat),b.load(f,g),this.pages.push(f)}else f=null}},c.Atlas.prototype={findRegion:function(a){for(var b=this.regions,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},dispose:function(){for(var a=this.pages,b=0,c=a.length;c>b;b++)this.textureLoader.unload(a[b].rendererObject)},updateUVs:function(a){for(var b=this.regions,c=0,d=b.length;d>c;c++){var e=b[c];e.page==a&&(e.u=e.x/a.width,e.v=e.y/a.height,e.rotate?(e.u2=(e.x+e.height)/a.width,e.v2=(e.y+e.width)/a.height):(e.u2=(e.x+e.width)/a.width,e.v2=(e.y+e.height)/a.height))}}},c.Atlas.Format={alpha:0,intensity:1,luminanceAlpha:2,rgb565:3,rgba4444:4,rgb888:5,rgba8888:6},c.Atlas.TextureFilter={nearest:0,linear:1,mipMap:2,mipMapNearestNearest:3,mipMapLinearNearest:4,mipMapNearestLinear:5,mipMapLinearLinear:6},c.Atlas.TextureWrap={mirroredRepeat:0,clampToEdge:1,repeat:2},c.AtlasPage=function(){},c.AtlasPage.prototype={name:null,format:null,minFilter:null,magFilter:null,uWrap:null,vWrap:null,rendererObject:null,width:0,height:0},c.AtlasRegion=function(){},c.AtlasRegion.prototype={page:null,name:null,x:0,y:0,width:0,height:0,u:0,v:0,u2:0,v2:0,offsetX:0,offsetY:0,originalWidth:0,originalHeight:0,index:0,rotate:!1,splits:null,pads:null},c.AtlasReader=function(a){this.lines=a.split(/\r\n|\r|\n/)},c.AtlasReader.prototype={index:0,trim:function(a){return a.replace(/^\s+|\s+$/g,"")},readLine:function(){return this.index>=this.lines.length?null:this.lines[this.index++]},readValue:function(){var a=this.readLine(),b=a.indexOf(":");if(-1==b)throw"Invalid line: "+a;return this.trim(a.substring(b+1))},readTuple:function(a){var b=this.readLine(),c=b.indexOf(":");if(-1==c)throw"Invalid line: "+b;for(var d=0,e=c+1;3>d;d++){var f=b.indexOf(",",e);if(-1==f){if(!d)throw"Invalid line: "+b;break}a[d]=this.trim(b.substr(e,f-e)),e=f+1}return a[d]=this.trim(b.substring(e)),d+1}},c.AtlasAttachmentLoader=function(a){this.atlas=a},c.AtlasAttachmentLoader.prototype={newAttachment:function(a,b,d){switch(b){case c.AttachmentType.region:var e=this.atlas.findRegion(d);if(!e)throw"Region not found in atlas: "+d+" ("+b+")";var f=new c.RegionAttachment(d);return f.rendererObject=e,f.setUVs(e.u,e.v,e.u2,e.v2,e.rotate),f.regionOffsetX=e.offsetX,f.regionOffsetY=e.offsetY,f.regionWidth=e.width,f.regionHeight=e.height,f.regionOriginalWidth=e.originalWidth,f.regionOriginalHeight=e.originalHeight,f}throw"Unknown attachment type: "+b}},c.Bone.yDown=!0,b.AnimCache={},b.Spine=function(a){if(b.DisplayObjectContainer.call(this),this.spineData=b.AnimCache[a],!this.spineData)throw new Error("Spine data must be preloaded using PIXI.SpineLoader or PIXI.AssetLoader: "+a);this.skeleton=new c.Skeleton(this.spineData),this.skeleton.updateWorldTransform(),this.stateData=new c.AnimationStateData(this.spineData),this.state=new c.AnimationState(this.stateData),this.slotContainers=[];for(var d=0,e=this.skeleton.drawOrder.length;e>d;d++){var f=this.skeleton.drawOrder[d],g=f.attachment,h=new b.DisplayObjectContainer;if(this.slotContainers.push(h),this.addChild(h),g instanceof c.RegionAttachment){var i=g.rendererObject.name,j=this.createSprite(f,g.rendererObject);f.currentSprite=j,f.currentSpriteName=i,h.addChild(j)}}},b.Spine.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Spine.prototype.constructor=b.Spine,b.Spine.prototype.updateTransform=function(){this.lastTime=this.lastTime||Date.now();var a=.001*(Date.now()-this.lastTime);this.lastTime=Date.now(),this.state.update(a),this.state.apply(this.skeleton),this.skeleton.updateWorldTransform();for(var d=this.skeleton.drawOrder,e=0,f=d.length;f>e;e++){var g=d[e],h=g.attachment,i=this.slotContainers[e];if(h instanceof c.RegionAttachment){if(h.rendererObject&&(!g.currentSpriteName||g.currentSpriteName!=h.name)){var j=h.rendererObject.name;if(void 0!==g.currentSprite&&(g.currentSprite.visible=!1),g.sprites=g.sprites||{},void 0!==g.sprites[j])g.sprites[j].visible=!0;else{var k=this.createSprite(g,h.rendererObject);i.addChild(k)}g.currentSprite=g.sprites[j],g.currentSpriteName=j}i.visible=!0;var l=g.bone;i.position.x=l.worldX+h.x*l.m00+h.y*l.m01,i.position.y=l.worldY+h.x*l.m10+h.y*l.m11,i.scale.x=l.worldScaleX,i.scale.y=l.worldScaleY,i.rotation=-(g.bone.worldRotation*Math.PI/180),i.alpha=g.a,g.currentSprite.tint=b.rgb2hex([g.r,g.g,g.b])}else i.visible=!1}b.DisplayObjectContainer.prototype.updateTransform.call(this)},b.Spine.prototype.createSprite=function(a,c){var d=b.TextureCache[c.name]?c.name:c.name+".png",e=new b.Sprite(b.Texture.fromFrame(d));return e.scale=c.scale,e.rotation=c.rotation,e.anchor.x=e.anchor.y=.5,a.sprites=a.sprites||{},a.sprites[c.name]=e,e},b.BaseTextureCache={},b.BaseTextureCacheIdGenerator=0,b.BaseTexture=function(a,c){if(this.resolution=1,this.width=100,this.height=100,this.scaleMode=c||b.scaleModes.DEFAULT,this.hasLoaded=!1,this.source=a,this._UID=b._UID++,this.premultipliedAlpha=!0,this._glTextures=[],this._dirty=[!0,!0,!0,!0],a){if((this.source.complete||this.source.getContext)&&this.source.width&&this.source.height)this.hasLoaded=!0,this.width=this.source.naturalWidth||this.source.width,this.height=this.source.naturalHeight||this.source.height,this.dirty();else{var d=this;this.source.onload=function(){d.hasLoaded=!0,d.width=d.source.naturalWidth||d.source.width,d.height=d.source.naturalHeight||d.source.height,d.dirty(),d.dispatchEvent({type:"loaded",content:d})},this.source.onerror=function(){d.dispatchEvent({type:"error",content:d})}}this.imageUrl=null,this._powerOf2=!1}},b.BaseTexture.prototype.constructor=b.BaseTexture,b.EventTarget.mixin(b.BaseTexture.prototype),b.BaseTexture.prototype.destroy=function(){this.imageUrl?(delete b.BaseTextureCache[this.imageUrl],delete b.TextureCache[this.imageUrl],this.imageUrl=null,navigator.isCocoonJS||(this.source.src="")):this.source&&this.source._pixiId&&delete b.BaseTextureCache[this.source._pixiId],this.source=null,this.unloadFromGPU()},b.BaseTexture.prototype.updateSourceImage=function(a){this.hasLoaded=!1,this.source.src=null,this.source.src=a},b.BaseTexture.prototype.dirty=function(){for(var a=0;a<this._glTextures.length;a++)this._dirty[a]=!0},b.BaseTexture.prototype.unloadFromGPU=function(){this.dirty();for(var a=this._glTextures.length-1;a>=0;a--){var c=this._glTextures[a],d=b.glContexts[a];d&&c&&d.deleteTexture(c)}this._glTextures.length=0,this.dirty()},b.BaseTexture.fromImage=function(a,c,d){var e=b.BaseTextureCache[a];if(void 0===c&&-1===a.indexOf("data:")&&(c=!0),!e){var f=new Image;c&&(f.crossOrigin=""),f.src=a,e=new b.BaseTexture(f,d),e.imageUrl=a,b.BaseTextureCache[a]=e,-1!==a.indexOf(b.RETINA_PREFIX+".")&&(e.resolution=2)}return e},b.BaseTexture.fromCanvas=function(a,c){a._pixiId||(a._pixiId="canvas_"+b.TextureCacheIdGenerator++);var d=b.BaseTextureCache[a._pixiId];return d||(d=new b.BaseTexture(a,c),b.BaseTextureCache[a._pixiId]=d),d},b.TextureCache={},b.FrameCache={},b.TextureCacheIdGenerator=0,b.Texture=function(a,c,d,e){this.noFrame=!1,c||(this.noFrame=!0,c=new b.Rectangle(0,0,1,1)),a instanceof b.Texture&&(a=a.baseTexture),this.baseTexture=a,this.frame=c,this.trim=e,this.valid=!1,this.requiresUpdate=!1,this._uvs=null,this.width=0,this.height=0,this.crop=d||new b.Rectangle(0,0,1,1),a.hasLoaded?(this.noFrame&&(c=new b.Rectangle(0,0,a.width,a.height)),this.setFrame(c)):a.addEventListener("loaded",this.onBaseTextureLoaded.bind(this))},b.Texture.prototype.constructor=b.Texture,b.EventTarget.mixin(b.Texture.prototype),b.Texture.prototype.onBaseTextureLoaded=function(){var a=this.baseTexture;a.removeEventListener("loaded",this.onLoaded),this.noFrame&&(this.frame=new b.Rectangle(0,0,a.width,a.height)),this.setFrame(this.frame),this.dispatchEvent({type:"update",content:this})},b.Texture.prototype.destroy=function(a){a&&this.baseTexture.destroy(),this.valid=!1},b.Texture.prototype.setFrame=function(a){if(this.noFrame=!1,this.frame=a,this.width=a.width,this.height=a.height,this.crop.x=a.x,this.crop.y=a.y,this.crop.width=a.width,this.crop.height=a.height,!this.trim&&(a.x+a.width>this.baseTexture.width||a.y+a.height>this.baseTexture.height))throw new Error("Texture Error: frame does not fit inside the base Texture dimensions "+this);this.valid=a&&a.width&&a.height&&this.baseTexture.source&&this.baseTexture.hasLoaded,this.trim&&(this.width=this.trim.width,this.height=this.trim.height,this.frame.width=this.trim.width,this.frame.height=this.trim.height),this.valid&&this._updateUvs()},b.Texture.prototype._updateUvs=function(){this._uvs||(this._uvs=new b.TextureUvs);var a=this.crop,c=this.baseTexture.width,d=this.baseTexture.height;this._uvs.x0=a.x/c,this._uvs.y0=a.y/d,this._uvs.x1=(a.x+a.width)/c,this._uvs.y1=a.y/d,this._uvs.x2=(a.x+a.width)/c,this._uvs.y2=(a.y+a.height)/d,this._uvs.x3=a.x/c,this._uvs.y3=(a.y+a.height)/d},b.Texture.fromImage=function(a,c,d){var e=b.TextureCache[a];return e||(e=new b.Texture(b.BaseTexture.fromImage(a,c,d)),b.TextureCache[a]=e),e},b.Texture.fromFrame=function(a){var c=b.TextureCache[a];if(!c)throw new Error('The frameId "'+a+'" does not exist in the texture cache ');return c},b.Texture.fromCanvas=function(a,c){var d=b.BaseTexture.fromCanvas(a,c);return new b.Texture(d)},b.Texture.addTextureToCache=function(a,c){b.TextureCache[c]=a},b.Texture.removeTextureFromCache=function(a){var c=b.TextureCache[a];return delete b.TextureCache[a],delete b.BaseTextureCache[a],c},b.TextureUvs=function(){this.x0=0,this.y0=0,this.x1=0,this.y1=0,this.x2=0,this.y2=0,this.x3=0,this.y3=0},b.Texture.emptyTexture=new b.Texture(new b.BaseTexture),b.RenderTexture=function(a,c,d,e,f){if(this.width=a||100,this.height=c||100,this.resolution=f||1,this.frame=new b.Rectangle(0,0,this.width*this.resolution,this.height*this.resolution),this.crop=new b.Rectangle(0,0,this.width*this.resolution,this.height*this.resolution),this.baseTexture=new b.BaseTexture,this.baseTexture.width=this.width*this.resolution,this.baseTexture.height=this.height*this.resolution,this.baseTexture._glTextures=[],this.baseTexture.resolution=this.resolution,this.baseTexture.scaleMode=e||b.scaleModes.DEFAULT,this.baseTexture.hasLoaded=!0,b.Texture.call(this,this.baseTexture,new b.Rectangle(0,0,this.width,this.height)),this.renderer=d||b.defaultRenderer,this.renderer.type===b.WEBGL_RENDERER){var g=this.renderer.gl;this.baseTexture._dirty[g.id]=!1,this.textureBuffer=new b.FilterTexture(g,this.width*this.resolution,this.height*this.resolution,this.baseTexture.scaleMode),this.baseTexture._glTextures[g.id]=this.textureBuffer.texture,this.render=this.renderWebGL,this.projection=new b.Point(.5*this.width,.5*-this.height)}else this.render=this.renderCanvas,this.textureBuffer=new b.CanvasBuffer(this.width*this.resolution,this.height*this.resolution),this.baseTexture.source=this.textureBuffer.canvas;this.valid=!0,this._updateUvs()},b.RenderTexture.prototype=Object.create(b.Texture.prototype),b.RenderTexture.prototype.constructor=b.RenderTexture,b.RenderTexture.prototype.resize=function(a,c,d){(a!==this.width||c!==this.height)&&(this.valid=a>0&&c>0,this.width=this.frame.width=this.crop.width=a,this.height=this.frame.height=this.crop.height=c,d&&(this.baseTexture.width=this.width,this.baseTexture.height=this.height),this.renderer.type===b.WEBGL_RENDERER&&(this.projection.x=this.width/2,this.projection.y=-this.height/2),this.valid&&this.textureBuffer.resize(this.width*this.resolution,this.height*this.resolution))},b.RenderTexture.prototype.clear=function(){this.valid&&(this.renderer.type===b.WEBGL_RENDERER&&this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER,this.textureBuffer.frameBuffer),this.textureBuffer.clear())},b.RenderTexture.prototype.renderWebGL=function(a,b,c){if(this.valid){var d=a.worldTransform;d.identity(),d.translate(0,2*this.projection.y),b&&d.append(b),d.scale(1,-1),a.worldAlpha=1;for(var e=a.children,f=0,g=e.length;g>f;f++)e[f].updateTransform();var h=this.renderer.gl;h.viewport(0,0,this.width*this.resolution,this.height*this.resolution),h.bindFramebuffer(h.FRAMEBUFFER,this.textureBuffer.frameBuffer),c&&this.textureBuffer.clear(),this.renderer.spriteBatch.dirty=!0,this.renderer.renderDisplayObject(a,this.projection,this.textureBuffer.frameBuffer),this.renderer.spriteBatch.dirty=!0}},b.RenderTexture.prototype.renderCanvas=function(a,b,c){if(this.valid){var d=a.worldTransform;d.identity(),b&&d.append(b),a.worldAlpha=1;for(var e=a.children,f=0,g=e.length;g>f;f++)e[f].updateTransform();c&&this.textureBuffer.clear();var h=this.textureBuffer.context,i=this.renderer.resolution;this.renderer.resolution=this.resolution,this.renderer.renderDisplayObject(a,h),this.renderer.resolution=i}},b.RenderTexture.prototype.getImage=function(){var a=new Image;return a.src=this.getBase64(),a},b.RenderTexture.prototype.getBase64=function(){return this.getCanvas().toDataURL()},b.RenderTexture.prototype.getCanvas=function(){if(this.renderer.type===b.WEBGL_RENDERER){var a=this.renderer.gl,c=this.textureBuffer.width,d=this.textureBuffer.height,e=new Uint8Array(4*c*d);a.bindFramebuffer(a.FRAMEBUFFER,this.textureBuffer.frameBuffer),a.readPixels(0,0,c,d,a.RGBA,a.UNSIGNED_BYTE,e),a.bindFramebuffer(a.FRAMEBUFFER,null);var f=new b.CanvasBuffer(c,d),g=f.context.getImageData(0,0,c,d);return g.data.set(e),f.context.putImageData(g,0,0),f.canvas}return this.textureBuffer.canvas},b.RenderTexture.tempMatrix=new b.Matrix,b.VideoTexture=function(a,c){if(!a)throw new Error("No video source element specified.");(a.readyState===a.HAVE_ENOUGH_DATA||a.readyState===a.HAVE_FUTURE_DATA)&&a.width&&a.height&&(a.complete=!0),b.BaseTexture.call(this,a,c),this.autoUpdate=!1,this.updateBound=this._onUpdate.bind(this),a.complete||(this._onCanPlay=this.onCanPlay.bind(this),a.addEventListener("canplay",this._onCanPlay),a.addEventListener("canplaythrough",this._onCanPlay),a.addEventListener("play",this.onPlayStart.bind(this)),a.addEventListener("pause",this.onPlayStop.bind(this)))
},b.VideoTexture.prototype=Object.create(b.BaseTexture.prototype),b.VideoTexture.constructor=b.VideoTexture,b.VideoTexture.prototype._onUpdate=function(){this.autoUpdate&&(window.requestAnimationFrame(this.updateBound),this.dirty())},b.VideoTexture.prototype.onPlayStart=function(){this.autoUpdate||(window.requestAnimationFrame(this.updateBound),this.autoUpdate=!0)},b.VideoTexture.prototype.onPlayStop=function(){this.autoUpdate=!1},b.VideoTexture.prototype.onCanPlay=function(){"canplaythrough"===event.type&&(this.hasLoaded=!0,this.source&&(this.source.removeEventListener("canplay",this._onCanPlay),this.source.removeEventListener("canplaythrough",this._onCanPlay),this.width=this.source.videoWidth,this.height=this.source.videoHeight,this.__loaded||(this.__loaded=!0,this.dispatchEvent({type:"loaded",content:this}))))},b.VideoTexture.baseTextureFromVideo=function(a,c){a._pixiId||(a._pixiId="video_"+b.TextureCacheIdGenerator++);var d=b.BaseTextureCache[a._pixiId];return d||(d=new b.VideoTexture(a,c),b.BaseTextureCache[a._pixiId]=d),d},b.VideoTexture.prototype.destroy=function(){this.source&&this.source._pixiId&&(b.BaseTextureCache[this.source._pixiId]=null,delete b.BaseTextureCache[this.source._pixiId],this.source._pixiId=null,delete this.source._pixiId),b.BaseTexture.prototype.destroy.call(this)},b.VideoTexture.textureFromVideo=function(a,c){var d=b.VideoTexture.baseTextureFromVideo(a,c);return new b.Texture(d)},b.VideoTexture.fromUrl=function(a,c){var d=document.createElement("video");return d.src=a,d.autoPlay=!0,d.play(),b.VideoTexture.textureFromVideo(d,c)},b.AssetLoader=function(a,c){this.assetURLs=a,this.crossorigin=c,this.loadersByType={jpg:b.ImageLoader,jpeg:b.ImageLoader,png:b.ImageLoader,gif:b.ImageLoader,webp:b.ImageLoader,json:b.JsonLoader,atlas:b.AtlasLoader,anim:b.SpineLoader,xml:b.BitmapFontLoader,fnt:b.BitmapFontLoader}},b.EventTarget.mixin(b.AssetLoader.prototype),b.AssetLoader.prototype.constructor=b.AssetLoader,b.AssetLoader.prototype._getDataType=function(a){var b="data:",c=a.slice(0,b.length).toLowerCase();if(c===b){var d=a.slice(b.length),e=d.indexOf(",");if(-1===e)return null;var f=d.slice(0,e).split(";")[0];return f&&"text/plain"!==f.toLowerCase()?f.split("/").pop().toLowerCase():"txt"}return null},b.AssetLoader.prototype.load=function(){function a(a){b.onAssetLoaded(a.data.content)}var b=this;this.loadCount=this.assetURLs.length;for(var c=0;c<this.assetURLs.length;c++){var d=this.assetURLs[c],e=this._getDataType(d);e||(e=d.split("?").shift().split(".").pop().toLowerCase());var f=this.loadersByType[e];if(!f)throw new Error(e+" is an unsupported file type");var g=new f(d,this.crossorigin);g.on("loaded",a),g.load()}},b.AssetLoader.prototype.onAssetLoaded=function(a){this.loadCount--,this.emit("onProgress",{content:this,loader:a}),this.onProgress&&this.onProgress(a),this.loadCount||(this.emit("onComplete",{content:this}),this.onComplete&&this.onComplete())},b.JsonLoader=function(a,b){this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.loaded=!1},b.JsonLoader.prototype.constructor=b.JsonLoader,b.EventTarget.mixin(b.JsonLoader.prototype),b.JsonLoader.prototype.load=function(){window.XDomainRequest&&this.crossorigin?(this.ajaxRequest=new window.XDomainRequest,this.ajaxRequest.timeout=3e3,this.ajaxRequest.onerror=this.onError.bind(this),this.ajaxRequest.ontimeout=this.onError.bind(this),this.ajaxRequest.onprogress=function(){}):this.ajaxRequest=window.XMLHttpRequest?new window.XMLHttpRequest:new window.ActiveXObject("Microsoft.XMLHTTP"),this.ajaxRequest.onload=this.onJSONLoaded.bind(this),this.ajaxRequest.open("GET",this.url,!0),this.ajaxRequest.send()},b.JsonLoader.prototype.onJSONLoaded=function(){if(!this.ajaxRequest.responseText)return this.onError(),void 0;if(this.json=JSON.parse(this.ajaxRequest.responseText),this.json.frames){var a=this.baseUrl+this.json.meta.image,d=new b.ImageLoader(a,this.crossorigin),e=this.json.frames;this.texture=d.texture.baseTexture,d.addEventListener("loaded",this.onLoaded.bind(this));for(var f in e){var g=e[f].frame;if(g){var h=new b.Rectangle(g.x,g.y,g.w,g.h),i=h.clone(),j=null;if(e[f].trimmed){var k=e[f].sourceSize,l=e[f].spriteSourceSize;j=new b.Rectangle(l.x,l.y,k.w,k.h)}b.TextureCache[f]=new b.Texture(this.texture,h,i,j)}}d.load()}else if(this.json.bones){var m=new c.SkeletonJson,n=m.readSkeletonData(this.json);b.AnimCache[this.url]=n,this.onLoaded()}else this.onLoaded()},b.JsonLoader.prototype.onLoaded=function(){this.loaded=!0,this.dispatchEvent({type:"loaded",content:this})},b.JsonLoader.prototype.onError=function(){this.dispatchEvent({type:"error",content:this})},b.AtlasLoader=function(a,b){this.url=a,this.baseUrl=a.replace(/[^\/]*$/,""),this.crossorigin=b,this.loaded=!1},b.AtlasLoader.constructor=b.AtlasLoader,b.EventTarget.mixin(b.AtlasLoader.prototype),b.AtlasLoader.prototype.load=function(){this.ajaxRequest=new b.AjaxRequest,this.ajaxRequest.onreadystatechange=this.onAtlasLoaded.bind(this),this.ajaxRequest.open("GET",this.url,!0),this.ajaxRequest.overrideMimeType&&this.ajaxRequest.overrideMimeType("application/json"),this.ajaxRequest.send(null)},b.AtlasLoader.prototype.onAtlasLoaded=function(){if(4===this.ajaxRequest.readyState)if(200===this.ajaxRequest.status||-1===window.location.href.indexOf("http")){this.atlas={meta:{image:[]},frames:[]};var a=this.ajaxRequest.responseText.split(/\r?\n/),c=-3,d=0,e=null,f=!1,g=0,h=0,i=this.onLoaded.bind(this);for(g=0;g<a.length;g++)if(a[g]=a[g].replace(/^\s+|\s+$/g,""),""===a[g]&&(f=g+1),a[g].length>0){if(f===g)this.atlas.meta.image.push(a[g]),d=this.atlas.meta.image.length-1,this.atlas.frames.push({}),c=-3;else if(c>0)if(c%7===1)null!=e&&(this.atlas.frames[d][e.name]=e),e={name:a[g],frame:{}};else{var j=a[g].split(" ");if(c%7===3)e.frame.x=Number(j[1].replace(",","")),e.frame.y=Number(j[2]);else if(c%7===4)e.frame.w=Number(j[1].replace(",","")),e.frame.h=Number(j[2]);else if(c%7===5){var k={x:0,y:0,w:Number(j[1].replace(",","")),h:Number(j[2])};k.w>e.frame.w||k.h>e.frame.h?(e.trimmed=!0,e.realSize=k):e.trimmed=!1}}c++}if(null!=e&&(this.atlas.frames[d][e.name]=e),this.atlas.meta.image.length>0){for(this.images=[],h=0;h<this.atlas.meta.image.length;h++){var l=this.baseUrl+this.atlas.meta.image[h],m=this.atlas.frames[h];this.images.push(new b.ImageLoader(l,this.crossorigin));for(g in m){var n=m[g].frame;n&&(b.TextureCache[g]=new b.Texture(this.images[h].texture.baseTexture,{x:n.x,y:n.y,width:n.w,height:n.h}),m[g].trimmed&&(b.TextureCache[g].realSize=m[g].realSize,b.TextureCache[g].trim.x=0,b.TextureCache[g].trim.y=0))}}for(this.currentImageId=0,h=0;h<this.images.length;h++)this.images[h].on("loaded",i);this.images[this.currentImageId].load()}else this.onLoaded()}else this.onError()},b.AtlasLoader.prototype.onLoaded=function(){this.images.length-1>this.currentImageId?(this.currentImageId++,this.images[this.currentImageId].load()):(this.loaded=!0,this.emit("loaded",{content:this}))},b.AtlasLoader.prototype.onError=function(){this.emit("error",{content:this})},b.SpriteSheetLoader=function(a,b){this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.texture=null,this.frames={}},b.SpriteSheetLoader.prototype.constructor=b.SpriteSheetLoader,b.EventTarget.mixin(b.SpriteSheetLoader.prototype),b.SpriteSheetLoader.prototype.load=function(){var a=this,c=new b.JsonLoader(this.url,this.crossorigin);c.on("loaded",function(b){a.json=b.data.content.json,a.onLoaded()}),c.load()},b.SpriteSheetLoader.prototype.onLoaded=function(){this.emit("loaded",{content:this})},b.ImageLoader=function(a,c){this.texture=b.Texture.fromImage(a,c),this.frames=[]},b.ImageLoader.prototype.constructor=b.ImageLoader,b.EventTarget.mixin(b.ImageLoader.prototype),b.ImageLoader.prototype.load=function(){this.texture.baseTexture.hasLoaded?this.onLoaded():this.texture.baseTexture.on("loaded",this.onLoaded.bind(this))},b.ImageLoader.prototype.onLoaded=function(){this.emit("loaded",{content:this})},b.ImageLoader.prototype.loadFramedSpriteSheet=function(a,c,d){this.frames=[];for(var e=Math.floor(this.texture.width/a),f=Math.floor(this.texture.height/c),g=0,h=0;f>h;h++)for(var i=0;e>i;i++,g++){var j=new b.Texture(this.texture.baseTexture,{x:i*a,y:h*c,width:a,height:c});this.frames.push(j),d&&(b.TextureCache[d+"-"+g]=j)}this.load()},b.BitmapFontLoader=function(a,b){this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.texture=null},b.BitmapFontLoader.prototype.constructor=b.BitmapFontLoader,b.EventTarget.mixin(b.BitmapFontLoader.prototype),b.BitmapFontLoader.prototype.load=function(){this.ajaxRequest=new b.AjaxRequest,this.ajaxRequest.onreadystatechange=this.onXMLLoaded.bind(this),this.ajaxRequest.open("GET",this.url,!0),this.ajaxRequest.overrideMimeType&&this.ajaxRequest.overrideMimeType("application/xml"),this.ajaxRequest.send(null)},b.BitmapFontLoader.prototype.onXMLLoaded=function(){if(4===this.ajaxRequest.readyState&&(200===this.ajaxRequest.status||-1===window.location.protocol.indexOf("http"))){var a=this.ajaxRequest.responseXML;if(!a||/MSIE 9/i.test(navigator.userAgent)||navigator.isCocoonJS)if("function"==typeof window.DOMParser){var c=new DOMParser;a=c.parseFromString(this.ajaxRequest.responseText,"text/xml")}else{var d=document.createElement("div");d.innerHTML=this.ajaxRequest.responseText,a=d}var e=this.baseUrl+a.getElementsByTagName("page")[0].getAttribute("file"),f=new b.ImageLoader(e,this.crossorigin);this.texture=f.texture.baseTexture;var g={},h=a.getElementsByTagName("info")[0],i=a.getElementsByTagName("common")[0];g.font=h.getAttribute("face"),g.size=parseInt(h.getAttribute("size"),10),g.lineHeight=parseInt(i.getAttribute("lineHeight"),10),g.chars={};for(var j=a.getElementsByTagName("char"),k=0;k<j.length;k++){var l=parseInt(j[k].getAttribute("id"),10),m=new b.Rectangle(parseInt(j[k].getAttribute("x"),10),parseInt(j[k].getAttribute("y"),10),parseInt(j[k].getAttribute("width"),10),parseInt(j[k].getAttribute("height"),10));g.chars[l]={xOffset:parseInt(j[k].getAttribute("xoffset"),10),yOffset:parseInt(j[k].getAttribute("yoffset"),10),xAdvance:parseInt(j[k].getAttribute("xadvance"),10),kerning:{},texture:b.TextureCache[l]=new b.Texture(this.texture,m)}}var n=a.getElementsByTagName("kerning");for(k=0;k<n.length;k++){var o=parseInt(n[k].getAttribute("first"),10),p=parseInt(n[k].getAttribute("second"),10),q=parseInt(n[k].getAttribute("amount"),10);g.chars[p].kerning[o]=q}b.BitmapText.fonts[g.font]=g,f.addEventListener("loaded",this.onLoaded.bind(this)),f.load()}},b.BitmapFontLoader.prototype.onLoaded=function(){this.emit("loaded",{content:this})},b.SpineLoader=function(a,b){this.url=a,this.crossorigin=b,this.loaded=!1},b.SpineLoader.prototype.constructor=b.SpineLoader,b.EventTarget.mixin(b.SpineLoader.prototype),b.SpineLoader.prototype.load=function(){var a=this,c=new b.JsonLoader(this.url,this.crossorigin);c.on("loaded",function(b){a.json=b.data.content.json,a.onLoaded()}),c.load()},b.SpineLoader.prototype.onLoaded=function(){this.loaded=!0,this.emit("loaded",{content:this})},b.AbstractFilter=function(a,b){this.passes=[this],this.shaders=[],this.dirty=!0,this.padding=0,this.uniforms=b||{},this.fragmentSrc=a||[]},b.AbstractFilter.prototype.constructor=b.AbstractFilter,b.AbstractFilter.prototype.syncUniforms=function(){for(var a=0,b=this.shaders.length;b>a;a++)this.shaders[a].dirty=!0},b.AlphaMaskFilter=function(a){b.AbstractFilter.call(this),this.passes=[this],a.baseTexture._powerOf2=!0,this.uniforms={mask:{type:"sampler2D",value:a},mapDimensions:{type:"2f",value:{x:1,y:5112}},dimensions:{type:"4fv",value:[0,0,0,0]}},a.baseTexture.hasLoaded?(this.uniforms.mask.value.x=a.width,this.uniforms.mask.value.y=a.height):(this.boundLoadedFunction=this.onTextureLoaded.bind(this),a.baseTexture.on("loaded",this.boundLoadedFunction)),this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D mask;","uniform sampler2D uSampler;","uniform vec2 offset;","uniform vec4 dimensions;","uniform vec2 mapDimensions;","void main(void) {","   vec2 mapCords = vTextureCoord.xy;","   mapCords += (dimensions.zw + offset)/ dimensions.xy ;","   mapCords.y *= -1.0;","   mapCords.y += 1.0;","   mapCords *= dimensions.xy / mapDimensions;","   vec4 original =  texture2D(uSampler, vTextureCoord);","   float maskAlpha =  texture2D(mask, mapCords).r;","   original *= maskAlpha;","   gl_FragColor =  original;","}"]},b.AlphaMaskFilter.prototype=Object.create(b.AbstractFilter.prototype),b.AlphaMaskFilter.prototype.constructor=b.AlphaMaskFilter,b.AlphaMaskFilter.prototype.onTextureLoaded=function(){this.uniforms.mapDimensions.value.x=this.uniforms.mask.value.width,this.uniforms.mapDimensions.value.y=this.uniforms.mask.value.height,this.uniforms.mask.value.baseTexture.off("loaded",this.boundLoadedFunction)},Object.defineProperty(b.AlphaMaskFilter.prototype,"map",{get:function(){return this.uniforms.mask.value},set:function(a){this.uniforms.mask.value=a}}),b.ColorMatrixFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={matrix:{type:"mat4",value:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float invert;","uniform mat4 matrix;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix;","}"]},b.ColorMatrixFilter.prototype=Object.create(b.AbstractFilter.prototype),b.ColorMatrixFilter.prototype.constructor=b.ColorMatrixFilter,Object.defineProperty(b.ColorMatrixFilter.prototype,"matrix",{get:function(){return this.uniforms.matrix.value},set:function(a){this.uniforms.matrix.value=a}}),b.GrayFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={gray:{type:"1f",value:1}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","uniform float gray;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord);","   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);","}"]},b.GrayFilter.prototype=Object.create(b.AbstractFilter.prototype),b.GrayFilter.prototype.constructor=b.GrayFilter,Object.defineProperty(b.GrayFilter.prototype,"gray",{get:function(){return this.uniforms.gray.value},set:function(a){this.uniforms.gray.value=a}}),b.DisplacementFilter=function(a){b.AbstractFilter.call(this),this.passes=[this],a.baseTexture._powerOf2=!0,this.uniforms={displacementMap:{type:"sampler2D",value:a},scale:{type:"2f",value:{x:30,y:30}},offset:{type:"2f",value:{x:0,y:0}},mapDimensions:{type:"2f",value:{x:1,y:5112}},dimensions:{type:"4fv",value:[0,0,0,0]}},a.baseTexture.hasLoaded?(this.uniforms.mapDimensions.value.x=a.width,this.uniforms.mapDimensions.value.y=a.height):(this.boundLoadedFunction=this.onTextureLoaded.bind(this),a.baseTexture.on("loaded",this.boundLoadedFunction)),this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D displacementMap;","uniform sampler2D uSampler;","uniform vec2 scale;","uniform vec2 offset;","uniform vec4 dimensions;","uniform vec2 mapDimensions;","void main(void) {","   vec2 mapCords = vTextureCoord.xy;","   mapCords += (dimensions.zw + offset)/ dimensions.xy ;","   mapCords.y *= -1.0;","   mapCords.y += 1.0;","   vec2 matSample = texture2D(displacementMap, mapCords).xy;","   matSample -= 0.5;","   matSample *= scale;","   matSample /= mapDimensions;","   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));","   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb, 1.0);","   vec2 cord = vTextureCoord;","}"]},b.DisplacementFilter.prototype=Object.create(b.AbstractFilter.prototype),b.DisplacementFilter.prototype.constructor=b.DisplacementFilter,b.DisplacementFilter.prototype.onTextureLoaded=function(){this.uniforms.mapDimensions.value.x=this.uniforms.displacementMap.value.width,this.uniforms.mapDimensions.value.y=this.uniforms.displacementMap.value.height,this.uniforms.displacementMap.value.baseTexture.off("loaded",this.boundLoadedFunction)},Object.defineProperty(b.DisplacementFilter.prototype,"map",{get:function(){return this.uniforms.displacementMap.value},set:function(a){this.uniforms.displacementMap.value=a}}),Object.defineProperty(b.DisplacementFilter.prototype,"scale",{get:function(){return this.uniforms.scale.value},set:function(a){this.uniforms.scale.value=a}}),Object.defineProperty(b.DisplacementFilter.prototype,"offset",{get:function(){return this.uniforms.offset.value},set:function(a){this.uniforms.offset.value=a}}),b.PixelateFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={invert:{type:"1f",value:0},dimensions:{type:"4fv",value:new b.Float32Array([1e4,100,10,10])},pixelSize:{type:"2f",value:{x:10,y:10}}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec2 testDim;","uniform vec4 dimensions;","uniform vec2 pixelSize;","uniform sampler2D uSampler;","void main(void) {","   vec2 coord = vTextureCoord;","   vec2 size = dimensions.xy/pixelSize;","   vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;","   gl_FragColor = texture2D(uSampler, color);","}"]},b.PixelateFilter.prototype=Object.create(b.AbstractFilter.prototype),b.PixelateFilter.prototype.constructor=b.PixelateFilter,Object.defineProperty(b.PixelateFilter.prototype,"size",{get:function(){return this.uniforms.pixelSize.value},set:function(a){this.dirty=!0,this.uniforms.pixelSize.value=a}}),b.BlurXFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={blur:{type:"1f",value:1/512}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float blur;","uniform sampler2D uSampler;","void main(void) {","   vec4 sum = vec4(0.0);","   sum += texture2D(uSampler, vec2(vTextureCoord.x - 4.0*blur, vTextureCoord.y)) * 0.05;","   sum += texture2D(uSampler, vec2(vTextureCoord.x - 3.0*blur, vTextureCoord.y)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x - 2.0*blur, vTextureCoord.y)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x - blur, vTextureCoord.y)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + blur, vTextureCoord.y)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + 2.0*blur, vTextureCoord.y)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + 3.0*blur, vTextureCoord.y)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + 4.0*blur, vTextureCoord.y)) * 0.05;","   gl_FragColor = sum;","}"]},b.BlurXFilter.prototype=Object.create(b.AbstractFilter.prototype),b.BlurXFilter.prototype.constructor=b.BlurXFilter,Object.defineProperty(b.BlurXFilter.prototype,"blur",{get:function(){return this.uniforms.blur.value/(1/7e3)},set:function(a){this.dirty=!0,this.uniforms.blur.value=1/7e3*a}}),b.BlurYFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={blur:{type:"1f",value:1/512}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float blur;","uniform sampler2D uSampler;","void main(void) {","   vec4 sum = vec4(0.0);","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 4.0*blur)) * 0.05;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 3.0*blur)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 2.0*blur)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - blur)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + blur)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 2.0*blur)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 3.0*blur)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 4.0*blur)) * 0.05;","   gl_FragColor = sum;","}"]},b.BlurYFilter.prototype=Object.create(b.AbstractFilter.prototype),b.BlurYFilter.prototype.constructor=b.BlurYFilter,Object.defineProperty(b.BlurYFilter.prototype,"blur",{get:function(){return this.uniforms.blur.value/(1/7e3)},set:function(a){this.uniforms.blur.value=1/7e3*a}}),b.BlurFilter=function(){this.blurXFilter=new b.BlurXFilter,this.blurYFilter=new b.BlurYFilter,this.passes=[this.blurXFilter,this.blurYFilter]},b.BlurFilter.prototype=Object.create(b.AbstractFilter.prototype),b.BlurFilter.prototype.constructor=b.BlurFilter,Object.defineProperty(b.BlurFilter.prototype,"blur",{get:function(){return this.blurXFilter.blur},set:function(a){this.blurXFilter.blur=this.blurYFilter.blur=a}}),Object.defineProperty(b.BlurFilter.prototype,"blurX",{get:function(){return this.blurXFilter.blur},set:function(a){this.blurXFilter.blur=a}}),Object.defineProperty(b.BlurFilter.prototype,"blurY",{get:function(){return this.blurYFilter.blur},set:function(a){this.blurYFilter.blur=a}}),b.InvertFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={invert:{type:"1f",value:1}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float invert;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord);","   gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, 1.0 - invert);","}"]},b.InvertFilter.prototype=Object.create(b.AbstractFilter.prototype),b.InvertFilter.prototype.constructor=b.InvertFilter,Object.defineProperty(b.InvertFilter.prototype,"invert",{get:function(){return this.uniforms.invert.value},set:function(a){this.uniforms.invert.value=a}}),b.SepiaFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={sepia:{type:"1f",value:1}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float sepia;","uniform sampler2D uSampler;","const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord);","   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);","}"]},b.SepiaFilter.prototype=Object.create(b.AbstractFilter.prototype),b.SepiaFilter.prototype.constructor=b.SepiaFilter,Object.defineProperty(b.SepiaFilter.prototype,"sepia",{get:function(){return this.uniforms.sepia.value},set:function(a){this.uniforms.sepia.value=a}}),b.TwistFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={radius:{type:"1f",value:.5},angle:{type:"1f",value:5},offset:{type:"2f",value:{x:.5,y:.5}}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec4 dimensions;","uniform sampler2D uSampler;","uniform float radius;","uniform float angle;","uniform vec2 offset;","void main(void) {","   vec2 coord = vTextureCoord - offset;","   float distance = length(coord);","   if (distance < radius) {","       float ratio = (radius - distance) / radius;","       float angleMod = ratio * ratio * angle;","       float s = sin(angleMod);","       float c = cos(angleMod);","       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);","   }","   gl_FragColor = texture2D(uSampler, coord+offset);","}"]},b.TwistFilter.prototype=Object.create(b.AbstractFilter.prototype),b.TwistFilter.prototype.constructor=b.TwistFilter,Object.defineProperty(b.TwistFilter.prototype,"offset",{get:function(){return this.uniforms.offset.value},set:function(a){this.dirty=!0,this.uniforms.offset.value=a}}),Object.defineProperty(b.TwistFilter.prototype,"radius",{get:function(){return this.uniforms.radius.value},set:function(a){this.dirty=!0,this.uniforms.radius.value=a}}),Object.defineProperty(b.TwistFilter.prototype,"angle",{get:function(){return this.uniforms.angle.value},set:function(a){this.dirty=!0,this.uniforms.angle.value=a}}),b.ColorStepFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={step:{type:"1f",value:5}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","uniform float step;","void main(void) {","   vec4 color = texture2D(uSampler, vTextureCoord);","   color = floor(color * step) / step;","   gl_FragColor = color;","}"]},b.ColorStepFilter.prototype=Object.create(b.AbstractFilter.prototype),b.ColorStepFilter.prototype.constructor=b.ColorStepFilter,Object.defineProperty(b.ColorStepFilter.prototype,"step",{get:function(){return this.uniforms.step.value},set:function(a){this.uniforms.step.value=a}}),b.DotScreenFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={scale:{type:"1f",value:1},angle:{type:"1f",value:5},dimensions:{type:"4fv",value:[0,0,0,0]}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec4 dimensions;","uniform sampler2D uSampler;","uniform float angle;","uniform float scale;","float pattern() {","   float s = sin(angle), c = cos(angle);","   vec2 tex = vTextureCoord * dimensions.xy;","   vec2 point = vec2(","       c * tex.x - s * tex.y,","       s * tex.x + c * tex.y","   ) * scale;","   return (sin(point.x) * sin(point.y)) * 4.0;","}","void main() {","   vec4 color = texture2D(uSampler, vTextureCoord);","   float average = (color.r + color.g + color.b) / 3.0;","   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);","}"]},b.DotScreenFilter.prototype=Object.create(b.AbstractFilter.prototype),b.DotScreenFilter.prototype.constructor=b.DotScreenFilter,Object.defineProperty(b.DotScreenFilter.prototype,"scale",{get:function(){return this.uniforms.scale.value},set:function(a){this.dirty=!0,this.uniforms.scale.value=a}}),Object.defineProperty(b.DotScreenFilter.prototype,"angle",{get:function(){return this.uniforms.angle.value},set:function(a){this.dirty=!0,this.uniforms.angle.value=a}}),b.CrossHatchFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={blur:{type:"1f",value:1/512}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float blur;","uniform sampler2D uSampler;","void main(void) {","    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);","    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);","    if (lum < 1.00) {","        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","    if (lum < 0.75) {","        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","    if (lum < 0.50) {","        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","    if (lum < 0.3) {","        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","}"]},b.CrossHatchFilter.prototype=Object.create(b.AbstractFilter.prototype),b.CrossHatchFilter.prototype.constructor=b.CrossHatchFilter,Object.defineProperty(b.CrossHatchFilter.prototype,"blur",{get:function(){return this.uniforms.blur.value/(1/7e3)},set:function(a){this.uniforms.blur.value=1/7e3*a}}),b.RGBSplitFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={red:{type:"2f",value:{x:20,y:20}},green:{type:"2f",value:{x:-20,y:20}},blue:{type:"2f",value:{x:20,y:-20}},dimensions:{type:"4fv",value:[0,0,0,0]}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec2 red;","uniform vec2 green;","uniform vec2 blue;","uniform vec4 dimensions;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;","   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;","   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;","   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;","}"]},b.RGBSplitFilter.prototype=Object.create(b.AbstractFilter.prototype),b.RGBSplitFilter.prototype.constructor=b.RGBSplitFilter,Object.defineProperty(b.RGBSplitFilter.prototype,"red",{get:function(){return this.uniforms.red.value},set:function(a){this.uniforms.red.value=a}}),Object.defineProperty(b.RGBSplitFilter.prototype,"green",{get:function(){return this.uniforms.green.value},set:function(a){this.uniforms.green.value=a}}),Object.defineProperty(b.RGBSplitFilter.prototype,"blue",{get:function(){return this.uniforms.blue.value},set:function(a){this.uniforms.blue.value=a}}),"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=b),exports.PIXI=b):"undefined"!=typeof define&&define.amd?define(b):a.PIXI=b}).call(this);
},{}],22:[function(require,module,exports){
(function (global){
/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(global) {
  'use strict';

  var testingExposeCycleCount = global.testingExposeCycleCount;

  // Detect and do basic sanity checking on Object/Array.observe.
  function detectObjectObserve() {
    if (typeof Object.observe !== 'function' ||
        typeof Array.observe !== 'function') {
      return false;
    }

    var records = [];

    function callback(recs) {
      records = recs;
    }

    var test = {};
    var arr = [];
    Object.observe(test, callback);
    Array.observe(arr, callback);
    test.id = 1;
    test.id = 2;
    delete test.id;
    arr.push(1, 2);
    arr.length = 0;

    Object.deliverChangeRecords(callback);
    if (records.length !== 5)
      return false;

    if (records[0].type != 'add' ||
        records[1].type != 'update' ||
        records[2].type != 'delete' ||
        records[3].type != 'splice' ||
        records[4].type != 'splice') {
      return false;
    }

    Object.unobserve(test, callback);
    Array.unobserve(arr, callback);

    return true;
  }

  var hasObserve = detectObjectObserve();

  function detectEval() {
    // Don't test for eval if we're running in a Chrome App environment.
    // We check for APIs set that only exist in a Chrome App context.
    if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
      return false;
    }

    // Firefox OS Apps do not allow eval. This feature detection is very hacky
    // but even if some other platform adds support for this function this code
    // will continue to work.
    if (typeof navigator != 'undefined' && navigator.getDeviceStorage) {
      return false;
    }

    try {
      var f = new Function('', 'return true;');
      return f();
    } catch (ex) {
      return false;
    }
  }

  var hasEval = detectEval();

  function isIndex(s) {
    return +s === s >>> 0 && s !== '';
  }

  function toNumber(s) {
    return +s;
  }

  function isObject(obj) {
    return obj === Object(obj);
  }

  var numberIsNaN = global.Number.isNaN || function(value) {
    return typeof value === 'number' && global.isNaN(value);
  }

  function areSameValue(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    if (numberIsNaN(left) && numberIsNaN(right))
      return true;

    return left !== left && right !== right;
  }

  var createObject = ('__proto__' in {}) ?
    function(obj) { return obj; } :
    function(obj) {
      var proto = obj.__proto__;
      if (!proto)
        return obj;
      var newObject = Object.create(proto);
      Object.getOwnPropertyNames(obj).forEach(function(name) {
        Object.defineProperty(newObject, name,
                             Object.getOwnPropertyDescriptor(obj, name));
      });
      return newObject;
    };

  var identStart = '[\$_a-zA-Z]';
  var identPart = '[\$_a-zA-Z0-9]';
  var identRegExp = new RegExp('^' + identStart + '+' + identPart + '*' + '$');

  function getPathCharType(char) {
    if (char === undefined)
      return 'eof';

    var code = char.charCodeAt(0);

    switch(code) {
      case 0x5B: // [
      case 0x5D: // ]
      case 0x2E: // .
      case 0x22: // "
      case 0x27: // '
      case 0x30: // 0
        return char;

      case 0x5F: // _
      case 0x24: // $
        return 'ident';

      case 0x20: // Space
      case 0x09: // Tab
      case 0x0A: // Newline
      case 0x0D: // Return
      case 0xA0:  // No-break space
      case 0xFEFF:  // Byte Order Mark
      case 0x2028:  // Line Separator
      case 0x2029:  // Paragraph Separator
        return 'ws';
    }

    // a-z, A-Z
    if ((0x61 <= code && code <= 0x7A) || (0x41 <= code && code <= 0x5A))
      return 'ident';

    // 1-9
    if (0x31 <= code && code <= 0x39)
      return 'number';

    return 'else';
  }

  var pathStateMachine = {
    'beforePath': {
      'ws': ['beforePath'],
      'ident': ['inIdent', 'append'],
      '[': ['beforeElement'],
      'eof': ['afterPath']
    },

    'inPath': {
      'ws': ['inPath'],
      '.': ['beforeIdent'],
      '[': ['beforeElement'],
      'eof': ['afterPath']
    },

    'beforeIdent': {
      'ws': ['beforeIdent'],
      'ident': ['inIdent', 'append']
    },

    'inIdent': {
      'ident': ['inIdent', 'append'],
      '0': ['inIdent', 'append'],
      'number': ['inIdent', 'append'],
      'ws': ['inPath', 'push'],
      '.': ['beforeIdent', 'push'],
      '[': ['beforeElement', 'push'],
      'eof': ['afterPath', 'push']
    },

    'beforeElement': {
      'ws': ['beforeElement'],
      '0': ['afterZero', 'append'],
      'number': ['inIndex', 'append'],
      "'": ['inSingleQuote', 'append', ''],
      '"': ['inDoubleQuote', 'append', '']
    },

    'afterZero': {
      'ws': ['afterElement', 'push'],
      ']': ['inPath', 'push']
    },

    'inIndex': {
      '0': ['inIndex', 'append'],
      'number': ['inIndex', 'append'],
      'ws': ['afterElement'],
      ']': ['inPath', 'push']
    },

    'inSingleQuote': {
      "'": ['afterElement'],
      'eof': ['error'],
      'else': ['inSingleQuote', 'append']
    },

    'inDoubleQuote': {
      '"': ['afterElement'],
      'eof': ['error'],
      'else': ['inDoubleQuote', 'append']
    },

    'afterElement': {
      'ws': ['afterElement'],
      ']': ['inPath', 'push']
    }
  }

  function noop() {}

  function parsePath(path) {
    var keys = [];
    var index = -1;
    var c, newChar, key, type, transition, action, typeMap, mode = 'beforePath';

    var actions = {
      push: function() {
        if (key === undefined)
          return;

        keys.push(key);
        key = undefined;
      },

      append: function() {
        if (key === undefined)
          key = newChar
        else
          key += newChar;
      }
    };

    function maybeUnescapeQuote() {
      if (index >= path.length)
        return;

      var nextChar = path[index + 1];
      if ((mode == 'inSingleQuote' && nextChar == "'") ||
          (mode == 'inDoubleQuote' && nextChar == '"')) {
        index++;
        newChar = nextChar;
        actions.append();
        return true;
      }
    }

    while (mode) {
      index++;
      c = path[index];

      if (c == '\\' && maybeUnescapeQuote(mode))
        continue;

      type = getPathCharType(c);
      typeMap = pathStateMachine[mode];
      transition = typeMap[type] || typeMap['else'] || 'error';

      if (transition == 'error')
        return; // parse error;

      mode = transition[0];
      action = actions[transition[1]] || noop;
      newChar = transition[2] === undefined ? c : transition[2];
      action();

      if (mode === 'afterPath') {
        return keys;
      }
    }

    return; // parse error
  }

  function isIdent(s) {
    return identRegExp.test(s);
  }

  var constructorIsPrivate = {};

  function Path(parts, privateToken) {
    if (privateToken !== constructorIsPrivate)
      throw Error('Use Path.get to retrieve path objects');

    for (var i = 0; i < parts.length; i++) {
      this.push(String(parts[i]));
    }

    if (hasEval && this.length) {
      this.getValueFrom = this.compiledGetValueFromFn();
    }
  }

  // TODO(rafaelw): Make simple LRU cache
  var pathCache = {};

  function getPath(pathString) {
    if (pathString instanceof Path)
      return pathString;

    if (pathString == null || pathString.length == 0)
      pathString = '';

    if (typeof pathString != 'string') {
      if (isIndex(pathString.length)) {
        // Constructed with array-like (pre-parsed) keys
        return new Path(pathString, constructorIsPrivate);
      }

      pathString = String(pathString);
    }

    var path = pathCache[pathString];
    if (path)
      return path;

    var parts = parsePath(pathString);
    if (!parts)
      return invalidPath;

    var path = new Path(parts, constructorIsPrivate);
    pathCache[pathString] = path;
    return path;
  }

  Path.get = getPath;

  function formatAccessor(key) {
    if (isIndex(key)) {
      return '[' + key + ']';
    } else {
      return '["' + key.replace(/"/g, '\\"') + '"]';
    }
  }

  Path.prototype = createObject({
    __proto__: [],
    valid: true,

    toString: function() {
      var pathString = '';
      for (var i = 0; i < this.length; i++) {
        var key = this[i];
        if (isIdent(key)) {
          pathString += i ? '.' + key : key;
        } else {
          pathString += formatAccessor(key);
        }
      }

      return pathString;
    },

    getValueFrom: function(obj, directObserver) {
      for (var i = 0; i < this.length; i++) {
        if (obj == null)
          return;
        obj = obj[this[i]];
      }
      return obj;
    },

    iterateObjects: function(obj, observe) {
      for (var i = 0; i < this.length; i++) {
        if (i)
          obj = obj[this[i - 1]];
        if (!isObject(obj))
          return;
        observe(obj, this[i]);
      }
    },

    compiledGetValueFromFn: function() {
      var str = '';
      var pathString = 'obj';
      str += 'if (obj != null';
      var i = 0;
      var key;
      for (; i < (this.length - 1); i++) {
        key = this[i];
        pathString += isIdent(key) ? '.' + key : formatAccessor(key);
        str += ' &&\n     ' + pathString + ' != null';
      }
      str += ')\n';

      var key = this[i];
      pathString += isIdent(key) ? '.' + key : formatAccessor(key);

      str += '  return ' + pathString + ';\nelse\n  return undefined;';
      return new Function('obj', str);
    },

    setValueFrom: function(obj, value) {
      if (!this.length)
        return false;

      for (var i = 0; i < this.length - 1; i++) {
        if (!isObject(obj))
          return false;
        obj = obj[this[i]];
      }

      if (!isObject(obj))
        return false;

      obj[this[i]] = value;
      return true;
    }
  });

  var invalidPath = new Path('', constructorIsPrivate);
  invalidPath.valid = false;
  invalidPath.getValueFrom = invalidPath.setValueFrom = function() {};

  var MAX_DIRTY_CHECK_CYCLES = 1000;

  function dirtyCheck(observer) {
    var cycles = 0;
    while (cycles < MAX_DIRTY_CHECK_CYCLES && observer.check_()) {
      cycles++;
    }
    if (testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    return cycles > 0;
  }

  function objectIsEmpty(object) {
    for (var prop in object)
      return false;
    return true;
  }

  function diffIsEmpty(diff) {
    return objectIsEmpty(diff.added) &&
           objectIsEmpty(diff.removed) &&
           objectIsEmpty(diff.changed);
  }

  function diffObjectFromOldObject(object, oldObject) {
    var added = {};
    var removed = {};
    var changed = {};

    for (var prop in oldObject) {
      var newValue = object[prop];

      if (newValue !== undefined && newValue === oldObject[prop])
        continue;

      if (!(prop in object)) {
        removed[prop] = undefined;
        continue;
      }

      if (newValue !== oldObject[prop])
        changed[prop] = newValue;
    }

    for (var prop in object) {
      if (prop in oldObject)
        continue;

      added[prop] = object[prop];
    }

    if (Array.isArray(object) && object.length !== oldObject.length)
      changed.length = object.length;

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  var eomTasks = [];
  function runEOMTasks() {
    if (!eomTasks.length)
      return false;

    for (var i = 0; i < eomTasks.length; i++) {
      eomTasks[i]();
    }
    eomTasks.length = 0;
    return true;
  }

  var runEOM = hasObserve ? (function(){
    return function(fn) {
      return Promise.resolve().then(fn);
    }
  })() :
  (function() {
    return function(fn) {
      eomTasks.push(fn);
    };
  })();

  var observedObjectCache = [];

  function newObservedObject() {
    var observer;
    var object;
    var discardRecords = false;
    var first = true;

    function callback(records) {
      if (observer && observer.state_ === OPENED && !discardRecords)
        observer.check_(records);
    }

    return {
      open: function(obs) {
        if (observer)
          throw Error('ObservedObject in use');

        if (!first)
          Object.deliverChangeRecords(callback);

        observer = obs;
        first = false;
      },
      observe: function(obj, arrayObserve) {
        object = obj;
        if (arrayObserve)
          Array.observe(object, callback);
        else
          Object.observe(object, callback);
      },
      deliver: function(discard) {
        discardRecords = discard;
        Object.deliverChangeRecords(callback);
        discardRecords = false;
      },
      close: function() {
        observer = undefined;
        Object.unobserve(object, callback);
        observedObjectCache.push(this);
      }
    };
  }

  /*
   * The observedSet abstraction is a perf optimization which reduces the total
   * number of Object.observe observations of a set of objects. The idea is that
   * groups of Observers will have some object dependencies in common and this
   * observed set ensures that each object in the transitive closure of
   * dependencies is only observed once. The observedSet acts as a write barrier
   * such that whenever any change comes through, all Observers are checked for
   * changed values.
   *
   * Note that this optimization is explicitly moving work from setup-time to
   * change-time.
   *
   * TODO(rafaelw): Implement "garbage collection". In order to move work off
   * the critical path, when Observers are closed, their observed objects are
   * not Object.unobserve(d). As a result, it's possible that if the observedSet
   * is kept open, but some Observers have been closed, it could cause "leaks"
   * (prevent otherwise collectable objects from being collected). At some
   * point, we should implement incremental "gc" which keeps a list of
   * observedSets which may need clean-up and does small amounts of cleanup on a
   * timeout until all is clean.
   */

  function getObservedObject(observer, object, arrayObserve) {
    var dir = observedObjectCache.pop() || newObservedObject();
    dir.open(observer);
    dir.observe(object, arrayObserve);
    return dir;
  }

  var observedSetCache = [];

  function newObservedSet() {
    var observerCount = 0;
    var observers = [];
    var objects = [];
    var rootObj;
    var rootObjProps;

    function observe(obj, prop) {
      if (!obj)
        return;

      if (obj === rootObj)
        rootObjProps[prop] = true;

      if (objects.indexOf(obj) < 0) {
        objects.push(obj);
        Object.observe(obj, callback);
      }

      observe(Object.getPrototypeOf(obj), prop);
    }

    function allRootObjNonObservedProps(recs) {
      for (var i = 0; i < recs.length; i++) {
        var rec = recs[i];
        if (rec.object !== rootObj ||
            rootObjProps[rec.name] ||
            rec.type === 'setPrototype') {
          return false;
        }
      }
      return true;
    }

    function callback(recs) {
      if (allRootObjNonObservedProps(recs))
        return;

      var observer;
      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.iterateObjects_(observe);
        }
      }

      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.check_();
        }
      }
    }

    var record = {
      objects: objects,
      get rootObject() { return rootObj; },
      set rootObject(value) {
        rootObj = value;
        rootObjProps = {};
      },
      open: function(obs, object) {
        observers.push(obs);
        observerCount++;
        obs.iterateObjects_(observe);
      },
      close: function(obs) {
        observerCount--;
        if (observerCount > 0) {
          return;
        }

        for (var i = 0; i < objects.length; i++) {
          Object.unobserve(objects[i], callback);
          Observer.unobservedCount++;
        }

        observers.length = 0;
        objects.length = 0;
        rootObj = undefined;
        rootObjProps = undefined;
        observedSetCache.push(this);
        if (lastObservedSet === this)
          lastObservedSet = null;
      },
    };

    return record;
  }

  var lastObservedSet;

  function getObservedSet(observer, obj) {
    if (!lastObservedSet || lastObservedSet.rootObject !== obj) {
      lastObservedSet = observedSetCache.pop() || newObservedSet();
      lastObservedSet.rootObject = obj;
    }
    lastObservedSet.open(observer, obj);
    return lastObservedSet;
  }

  var UNOPENED = 0;
  var OPENED = 1;
  var CLOSED = 2;
  var RESETTING = 3;

  var nextObserverId = 1;

  function Observer() {
    this.state_ = UNOPENED;
    this.callback_ = undefined;
    this.target_ = undefined; // TODO(rafaelw): Should be WeakRef
    this.directObserver_ = undefined;
    this.value_ = undefined;
    this.id_ = nextObserverId++;
  }

  Observer.prototype = {
    open: function(callback, target) {
      if (this.state_ != UNOPENED)
        throw Error('Observer has already been opened.');

      addToAll(this);
      this.callback_ = callback;
      this.target_ = target;
      this.connect_();
      this.state_ = OPENED;
      return this.value_;
    },

    close: function() {
      if (this.state_ != OPENED)
        return;

      removeFromAll(this);
      this.disconnect_();
      this.value_ = undefined;
      this.callback_ = undefined;
      this.target_ = undefined;
      this.state_ = CLOSED;
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      dirtyCheck(this);
    },

    report_: function(changes) {
      try {
        this.callback_.apply(this.target_, changes);
      } catch (ex) {
        Observer._errorThrownDuringCallback = true;
        console.error('Exception caught during observer callback: ' +
                       (ex.stack || ex));
      }
    },

    discardChanges: function() {
      this.check_(undefined, true);
      return this.value_;
    }
  }

  var collectObservers = !hasObserve;
  var allObservers;
  Observer._allObserversCount = 0;

  if (collectObservers) {
    allObservers = [];
  }

  function addToAll(observer) {
    Observer._allObserversCount++;
    if (!collectObservers)
      return;

    allObservers.push(observer);
  }

  function removeFromAll(observer) {
    Observer._allObserversCount--;
  }

  var runningMicrotaskCheckpoint = false;

  global.Platform = global.Platform || {};

  global.Platform.performMicrotaskCheckpoint = function() {
    if (runningMicrotaskCheckpoint)
      return;

    if (!collectObservers)
      return;

    runningMicrotaskCheckpoint = true;

    var cycles = 0;
    var anyChanged, toCheck;

    do {
      cycles++;
      toCheck = allObservers;
      allObservers = [];
      anyChanged = false;

      for (var i = 0; i < toCheck.length; i++) {
        var observer = toCheck[i];
        if (observer.state_ != OPENED)
          continue;

        if (observer.check_())
          anyChanged = true;

        allObservers.push(observer);
      }
      if (runEOMTasks())
        anyChanged = true;
    } while (cycles < MAX_DIRTY_CHECK_CYCLES && anyChanged);

    if (testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    runningMicrotaskCheckpoint = false;
  };

  if (collectObservers) {
    global.Platform.clearObservers = function() {
      allObservers = [];
    };
  }

  function ObjectObserver(object) {
    Observer.call(this);
    this.value_ = object;
    this.oldObject_ = undefined;
  }

  ObjectObserver.prototype = createObject({
    __proto__: Observer.prototype,

    arrayObserve: false,

    connect_: function(callback, target) {
      if (hasObserve) {
        this.directObserver_ = getObservedObject(this, this.value_,
                                                 this.arrayObserve);
      } else {
        this.oldObject_ = this.copyObject(this.value_);
      }

    },

    copyObject: function(object) {
      var copy = Array.isArray(object) ? [] : {};
      for (var prop in object) {
        copy[prop] = object[prop];
      };
      if (Array.isArray(object))
        copy.length = object.length;
      return copy;
    },

    check_: function(changeRecords, skipChanges) {
      var diff;
      var oldValues;
      if (hasObserve) {
        if (!changeRecords)
          return false;

        oldValues = {};
        diff = diffObjectFromChangeRecords(this.value_, changeRecords,
                                           oldValues);
      } else {
        oldValues = this.oldObject_;
        diff = diffObjectFromOldObject(this.value_, this.oldObject_);
      }

      if (diffIsEmpty(diff))
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([
        diff.added || {},
        diff.removed || {},
        diff.changed || {},
        function(property) {
          return oldValues[property];
        }
      ]);

      return true;
    },

    disconnect_: function() {
      if (hasObserve) {
        this.directObserver_.close();
        this.directObserver_ = undefined;
      } else {
        this.oldObject_ = undefined;
      }
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      if (hasObserve)
        this.directObserver_.deliver(false);
      else
        dirtyCheck(this);
    },

    discardChanges: function() {
      if (this.directObserver_)
        this.directObserver_.deliver(true);
      else
        this.oldObject_ = this.copyObject(this.value_);

      return this.value_;
    }
  });

  function ArrayObserver(array) {
    if (!Array.isArray(array))
      throw Error('Provided object is not an Array');
    ObjectObserver.call(this, array);
  }

  ArrayObserver.prototype = createObject({

    __proto__: ObjectObserver.prototype,

    arrayObserve: true,

    copyObject: function(arr) {
      return arr.slice();
    },

    check_: function(changeRecords) {
      var splices;
      if (hasObserve) {
        if (!changeRecords)
          return false;
        splices = projectArraySplices(this.value_, changeRecords);
      } else {
        splices = calcSplices(this.value_, 0, this.value_.length,
                              this.oldObject_, 0, this.oldObject_.length);
      }

      if (!splices || !splices.length)
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([splices]);
      return true;
    }
  });

  ArrayObserver.applySplices = function(previous, current, splices) {
    splices.forEach(function(splice) {
      var spliceArgs = [splice.index, splice.removed.length];
      var addIndex = splice.index;
      while (addIndex < splice.index + splice.addedCount) {
        spliceArgs.push(current[addIndex]);
        addIndex++;
      }

      Array.prototype.splice.apply(previous, spliceArgs);
    });
  };

  function PathObserver(object, path) {
    Observer.call(this);

    this.object_ = object;
    this.path_ = getPath(path);
    this.directObserver_ = undefined;
  }

  PathObserver.prototype = createObject({
    __proto__: Observer.prototype,

    get path() {
      return this.path_;
    },

    connect_: function() {
      if (hasObserve)
        this.directObserver_ = getObservedSet(this, this.object_);

      this.check_(undefined, true);
    },

    disconnect_: function() {
      this.value_ = undefined;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    iterateObjects_: function(observe) {
      this.path_.iterateObjects(this.object_, observe);
    },

    check_: function(changeRecords, skipChanges) {
      var oldValue = this.value_;
      this.value_ = this.path_.getValueFrom(this.object_);
      if (skipChanges || areSameValue(this.value_, oldValue))
        return false;

      this.report_([this.value_, oldValue, this]);
      return true;
    },

    setValue: function(newValue) {
      if (this.path_)
        this.path_.setValueFrom(this.object_, newValue);
    }
  });

  function CompoundObserver(reportChangesOnOpen) {
    Observer.call(this);

    this.reportChangesOnOpen_ = reportChangesOnOpen;
    this.value_ = [];
    this.directObserver_ = undefined;
    this.observed_ = [];
  }

  var observerSentinel = {};

  CompoundObserver.prototype = createObject({
    __proto__: Observer.prototype,

    connect_: function() {
      if (hasObserve) {
        var object;
        var needsDirectObserver = false;
        for (var i = 0; i < this.observed_.length; i += 2) {
          object = this.observed_[i]
          if (object !== observerSentinel) {
            needsDirectObserver = true;
            break;
          }
        }

        if (needsDirectObserver)
          this.directObserver_ = getObservedSet(this, object);
      }

      this.check_(undefined, !this.reportChangesOnOpen_);
    },

    disconnect_: function() {
      for (var i = 0; i < this.observed_.length; i += 2) {
        if (this.observed_[i] === observerSentinel)
          this.observed_[i + 1].close();
      }
      this.observed_.length = 0;
      this.value_.length = 0;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    addPath: function(object, path) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add paths once started.');

      var path = getPath(path);
      this.observed_.push(object, path);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = path.getValueFrom(object);
    },

    addObserver: function(observer) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add observers once started.');

      this.observed_.push(observerSentinel, observer);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = observer.open(this.deliver, this);
    },

    startReset: function() {
      if (this.state_ != OPENED)
        throw Error('Can only reset while open');

      this.state_ = RESETTING;
      this.disconnect_();
    },

    finishReset: function() {
      if (this.state_ != RESETTING)
        throw Error('Can only finishReset after startReset');
      this.state_ = OPENED;
      this.connect_();

      return this.value_;
    },

    iterateObjects_: function(observe) {
      var object;
      for (var i = 0; i < this.observed_.length; i += 2) {
        object = this.observed_[i]
        if (object !== observerSentinel)
          this.observed_[i + 1].iterateObjects(object, observe)
      }
    },

    check_: function(changeRecords, skipChanges) {
      var oldValues;
      for (var i = 0; i < this.observed_.length; i += 2) {
        var object = this.observed_[i];
        var path = this.observed_[i+1];
        var value;
        if (object === observerSentinel) {
          var observable = path;
          value = this.state_ === UNOPENED ?
              observable.open(this.deliver, this) :
              observable.discardChanges();
        } else {
          value = path.getValueFrom(object);
        }

        if (skipChanges) {
          this.value_[i / 2] = value;
          continue;
        }

        if (areSameValue(value, this.value_[i / 2]))
          continue;

        oldValues = oldValues || [];
        oldValues[i / 2] = this.value_[i / 2];
        this.value_[i / 2] = value;
      }

      if (!oldValues)
        return false;

      // TODO(rafaelw): Having observed_ as the third callback arg here is
      // pretty lame API. Fix.
      this.report_([this.value_, oldValues, this.observed_]);
      return true;
    }
  });

  function identFn(value) { return value; }

  function ObserverTransform(observable, getValueFn, setValueFn,
                             dontPassThroughSet) {
    this.callback_ = undefined;
    this.target_ = undefined;
    this.value_ = undefined;
    this.observable_ = observable;
    this.getValueFn_ = getValueFn || identFn;
    this.setValueFn_ = setValueFn || identFn;
    // TODO(rafaelw): This is a temporary hack. PolymerExpressions needs this
    // at the moment because of a bug in it's dependency tracking.
    this.dontPassThroughSet_ = dontPassThroughSet;
  }

  ObserverTransform.prototype = {
    open: function(callback, target) {
      this.callback_ = callback;
      this.target_ = target;
      this.value_ =
          this.getValueFn_(this.observable_.open(this.observedCallback_, this));
      return this.value_;
    },

    observedCallback_: function(value) {
      value = this.getValueFn_(value);
      if (areSameValue(value, this.value_))
        return;
      var oldValue = this.value_;
      this.value_ = value;
      this.callback_.call(this.target_, this.value_, oldValue);
    },

    discardChanges: function() {
      this.value_ = this.getValueFn_(this.observable_.discardChanges());
      return this.value_;
    },

    deliver: function() {
      return this.observable_.deliver();
    },

    setValue: function(value) {
      value = this.setValueFn_(value);
      if (!this.dontPassThroughSet_ && this.observable_.setValue)
        return this.observable_.setValue(value);
    },

    close: function() {
      if (this.observable_)
        this.observable_.close();
      this.callback_ = undefined;
      this.target_ = undefined;
      this.observable_ = undefined;
      this.value_ = undefined;
      this.getValueFn_ = undefined;
      this.setValueFn_ = undefined;
    }
  }

  var expectedRecordTypes = {
    add: true,
    update: true,
    delete: true
  };

  function diffObjectFromChangeRecords(object, changeRecords, oldValues) {
    var added = {};
    var removed = {};

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      if (!expectedRecordTypes[record.type]) {
        console.error('Unknown changeRecord type: ' + record.type);
        console.error(record);
        continue;
      }

      if (!(record.name in oldValues))
        oldValues[record.name] = record.oldValue;

      if (record.type == 'update')
        continue;

      if (record.type == 'add') {
        if (record.name in removed)
          delete removed[record.name];
        else
          added[record.name] = true;

        continue;
      }

      // type = 'delete'
      if (record.name in added) {
        delete added[record.name];
        delete oldValues[record.name];
      } else {
        removed[record.name] = true;
      }
    }

    for (var prop in added)
      added[prop] = object[prop];

    for (var prop in removed)
      removed[prop] = undefined;

    var changed = {};
    for (var prop in oldValues) {
      if (prop in added || prop in removed)
        continue;

      var newValue = object[prop];
      if (oldValues[prop] !== newValue)
        changed[prop] = newValue;
    }

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  function newSplice(index, removed, addedCount) {
    return {
      index: index,
      removed: removed,
      addedCount: addedCount
    };
  }

  var EDIT_LEAVE = 0;
  var EDIT_UPDATE = 1;
  var EDIT_ADD = 2;
  var EDIT_DELETE = 3;

  function ArraySplice() {}

  ArraySplice.prototype = {

    // Note: This function is *based* on the computation of the Levenshtein
    // "edit" distance. The one change is that "updates" are treated as two
    // edits - not one. With Array splices, an update is really a delete
    // followed by an add. By retaining this, we optimize for "keeping" the
    // maximum array items in the original array. For example:
    //
    //   'xxxx123' -> '123yyyy'
    //
    // With 1-edit updates, the shortest path would be just to update all seven
    // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
    // leaves the substring '123' intact.
    calcEditDistances: function(current, currentStart, currentEnd,
                                old, oldStart, oldEnd) {
      // "Deletion" columns
      var rowCount = oldEnd - oldStart + 1;
      var columnCount = currentEnd - currentStart + 1;
      var distances = new Array(rowCount);

      // "Addition" rows. Initialize null column.
      for (var i = 0; i < rowCount; i++) {
        distances[i] = new Array(columnCount);
        distances[i][0] = i;
      }

      // Initialize null row
      for (var j = 0; j < columnCount; j++)
        distances[0][j] = j;

      for (var i = 1; i < rowCount; i++) {
        for (var j = 1; j < columnCount; j++) {
          if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
            distances[i][j] = distances[i - 1][j - 1];
          else {
            var north = distances[i - 1][j] + 1;
            var west = distances[i][j - 1] + 1;
            distances[i][j] = north < west ? north : west;
          }
        }
      }

      return distances;
    },

    // This starts at the final weight, and walks "backward" by finding
    // the minimum previous weight recursively until the origin of the weight
    // matrix.
    spliceOperationsFromEditDistances: function(distances) {
      var i = distances.length - 1;
      var j = distances[0].length - 1;
      var current = distances[i][j];
      var edits = [];
      while (i > 0 || j > 0) {
        if (i == 0) {
          edits.push(EDIT_ADD);
          j--;
          continue;
        }
        if (j == 0) {
          edits.push(EDIT_DELETE);
          i--;
          continue;
        }
        var northWest = distances[i - 1][j - 1];
        var west = distances[i - 1][j];
        var north = distances[i][j - 1];

        var min;
        if (west < north)
          min = west < northWest ? west : northWest;
        else
          min = north < northWest ? north : northWest;

        if (min == northWest) {
          if (northWest == current) {
            edits.push(EDIT_LEAVE);
          } else {
            edits.push(EDIT_UPDATE);
            current = northWest;
          }
          i--;
          j--;
        } else if (min == west) {
          edits.push(EDIT_DELETE);
          i--;
          current = west;
        } else {
          edits.push(EDIT_ADD);
          j--;
          current = north;
        }
      }

      edits.reverse();
      return edits;
    },

    /**
     * Splice Projection functions:
     *
     * A splice map is a representation of how a previous array of items
     * was transformed into a new array of items. Conceptually it is a list of
     * tuples of
     *
     *   <index, removed, addedCount>
     *
     * which are kept in ascending index order of. The tuple represents that at
     * the |index|, |removed| sequence of items were removed, and counting forward
     * from |index|, |addedCount| items were added.
     */

    /**
     * Lacking individual splice mutation information, the minimal set of
     * splices can be synthesized given the previous state and final state of an
     * array. The basic approach is to calculate the edit distance matrix and
     * choose the shortest path through it.
     *
     * Complexity: O(l * p)
     *   l: The length of the current array
     *   p: The length of the old array
     */
    calcSplices: function(current, currentStart, currentEnd,
                          old, oldStart, oldEnd) {
      var prefixCount = 0;
      var suffixCount = 0;

      var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
      if (currentStart == 0 && oldStart == 0)
        prefixCount = this.sharedPrefix(current, old, minLength);

      if (currentEnd == current.length && oldEnd == old.length)
        suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);

      currentStart += prefixCount;
      oldStart += prefixCount;
      currentEnd -= suffixCount;
      oldEnd -= suffixCount;

      if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
        return [];

      if (currentStart == currentEnd) {
        var splice = newSplice(currentStart, [], 0);
        while (oldStart < oldEnd)
          splice.removed.push(old[oldStart++]);

        return [ splice ];
      } else if (oldStart == oldEnd)
        return [ newSplice(currentStart, [], currentEnd - currentStart) ];

      var ops = this.spliceOperationsFromEditDistances(
          this.calcEditDistances(current, currentStart, currentEnd,
                                 old, oldStart, oldEnd));

      var splice = undefined;
      var splices = [];
      var index = currentStart;
      var oldIndex = oldStart;
      for (var i = 0; i < ops.length; i++) {
        switch(ops[i]) {
          case EDIT_LEAVE:
            if (splice) {
              splices.push(splice);
              splice = undefined;
            }

            index++;
            oldIndex++;
            break;
          case EDIT_UPDATE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
          case EDIT_ADD:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;
            break;
          case EDIT_DELETE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
        }
      }

      if (splice) {
        splices.push(splice);
      }
      return splices;
    },

    sharedPrefix: function(current, old, searchLength) {
      for (var i = 0; i < searchLength; i++)
        if (!this.equals(current[i], old[i]))
          return i;
      return searchLength;
    },

    sharedSuffix: function(current, old, searchLength) {
      var index1 = current.length;
      var index2 = old.length;
      var count = 0;
      while (count < searchLength && this.equals(current[--index1], old[--index2]))
        count++;

      return count;
    },

    calculateSplices: function(current, previous) {
      return this.calcSplices(current, 0, current.length, previous, 0,
                              previous.length);
    },

    equals: function(currentValue, previousValue) {
      return currentValue === previousValue;
    }
  };

  var arraySplice = new ArraySplice();

  function calcSplices(current, currentStart, currentEnd,
                       old, oldStart, oldEnd) {
    return arraySplice.calcSplices(current, currentStart, currentEnd,
                                   old, oldStart, oldEnd);
  }

  function intersect(start1, end1, start2, end2) {
    // Disjoint
    if (end1 < start2 || end2 < start1)
      return -1;

    // Adjacent
    if (end1 == start2 || end2 == start1)
      return 0;

    // Non-zero intersect, span1 first
    if (start1 < start2) {
      if (end1 < end2)
        return end1 - start2; // Overlap
      else
        return end2 - start2; // Contained
    } else {
      // Non-zero intersect, span2 first
      if (end2 < end1)
        return end2 - start1; // Overlap
      else
        return end1 - start1; // Contained
    }
  }

  function mergeSplice(splices, index, removed, addedCount) {

    var splice = newSplice(index, removed, addedCount);

    var inserted = false;
    var insertionOffset = 0;

    for (var i = 0; i < splices.length; i++) {
      var current = splices[i];
      current.index += insertionOffset;

      if (inserted)
        continue;

      var intersectCount = intersect(splice.index,
                                     splice.index + splice.removed.length,
                                     current.index,
                                     current.index + current.addedCount);

      if (intersectCount >= 0) {
        // Merge the two splices

        splices.splice(i, 1);
        i--;

        insertionOffset -= current.addedCount - current.removed.length;

        splice.addedCount += current.addedCount - intersectCount;
        var deleteCount = splice.removed.length +
                          current.removed.length - intersectCount;

        if (!splice.addedCount && !deleteCount) {
          // merged splice is a noop. discard.
          inserted = true;
        } else {
          var removed = current.removed;

          if (splice.index < current.index) {
            // some prefix of splice.removed is prepended to current.removed.
            var prepend = splice.removed.slice(0, current.index - splice.index);
            Array.prototype.push.apply(prepend, removed);
            removed = prepend;
          }

          if (splice.index + splice.removed.length > current.index + current.addedCount) {
            // some suffix of splice.removed is appended to current.removed.
            var append = splice.removed.slice(current.index + current.addedCount - splice.index);
            Array.prototype.push.apply(removed, append);
          }

          splice.removed = removed;
          if (current.index < splice.index) {
            splice.index = current.index;
          }
        }
      } else if (splice.index < current.index) {
        // Insert splice here.

        inserted = true;

        splices.splice(i, 0, splice);
        i++;

        var offset = splice.addedCount - splice.removed.length
        current.index += offset;
        insertionOffset += offset;
      }
    }

    if (!inserted)
      splices.push(splice);
  }

  function createInitialSplices(array, changeRecords) {
    var splices = [];

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      switch(record.type) {
        case 'splice':
          mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
          break;
        case 'add':
        case 'update':
        case 'delete':
          if (!isIndex(record.name))
            continue;
          var index = toNumber(record.name);
          if (index < 0)
            continue;
          mergeSplice(splices, index, [record.oldValue], 1);
          break;
        default:
          console.error('Unexpected record type: ' + JSON.stringify(record));
          break;
      }
    }

    return splices;
  }

  function projectArraySplices(array, changeRecords) {
    var splices = [];

    createInitialSplices(array, changeRecords).forEach(function(splice) {
      if (splice.addedCount == 1 && splice.removed.length == 1) {
        if (splice.removed[0] !== array[splice.index])
          splices.push(splice);

        return
      };

      splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount,
                                           splice.removed, 0, splice.removed.length));
    });

    return splices;
  }

  // Export the observe-js object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, export as a global object.

  var expose = global;

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      expose = exports = module.exports;
    }
    expose = exports;
  } 

  expose.Observer = Observer;
  expose.Observer.runEOM_ = runEOM;
  expose.Observer.observerSentinel_ = observerSentinel; // for testing.
  expose.Observer.hasObjectObserve = hasObserve;
  expose.ArrayObserver = ArrayObserver;
  expose.ArrayObserver.calculateSplices = function(current, previous) {
    return arraySplice.calculateSplices(current, previous);
  };

  expose.ArraySplice = ArraySplice;
  expose.ObjectObserver = ObjectObserver;
  expose.PathObserver = PathObserver;
  expose.CompoundObserver = CompoundObserver;
  expose.Path = Path;
  expose.ObserverTransform = ObserverTransform;
  
})(typeof global !== 'undefined' && global && typeof module !== 'undefined' && module ? global : this || window);
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],23:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],24:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],25:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],26:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],27:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("q+64fw"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":26,"inherits":24,"q+64fw":25}]},{},[19])