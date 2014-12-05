var LoaderService = require('../services/LoaderService.js');
var GameService = require('../services/GameService.js');
var InputService = require('../services/InputService.js');
var PIXI = require('pixi.js');

function WorldScene(appContainer) {
	this._appContainer = appContainer;
	this._stage = new PIXI.Stage();
	this._map = null;
	this._isLoadingMap = false;
	this._gameOffSetX = null;
	this._gameOffSetY = null;
	this._tileLayer = new PIXI.SpriteBatch();
	this._smTileLayer = new PIXI.SpriteBatch();
	this._lastProcessedX = null;
	this._lastProcessedY = null;
	this._cameraDeltaX = 0;
	this._cameraDeltaY = 0;
}

WorldScene.prototype.init = function() {
	var defaults = GameService.defaults;
	this._gameOffSetX = defaults.screenWidth / 2;
    this._gameOffSetY = defaults.screenHeight / 2 - 1;

    //add
    this._stage.addChild(this._tileLayer);
    this._stage.addChild(this._smTileLayer);

	this._initGui();
	this._enableInput();
}

WorldScene.prototype._enableInput = function() {
	InputService.on('pressed left', this._moveLeft.bind(this), true);
	InputService.on('pressed right', this._moveRight.bind(this), true);
	InputService.on('pressed up', this._moveUp.bind(this), true);
	InputService.on('pressed down', this._moveDown.bind(this), true);
}

WorldScene.prototype._moveLeft = function() {
	this._updateCamera(-1, 0);
}

WorldScene.prototype._moveRight = function() {
	this._updateCamera(1, 0);
}

WorldScene.prototype._moveUp = function() {
	this._updateCamera(0, -1);
}

WorldScene.prototype._moveDown = function() {
	this._updateCamera(0, 1);
}

WorldScene.prototype._updateCamera = function(diffX, diffY) {
	var defaults = GameService.defaults;

	//move this out eventually
	GameService.player.x = GameService.player.x + diffX;
	GameService.player.y = GameService.player.y + diffY;

	this._cameraDeltaX = this._cameraDeltaX + (defaults.cellWidth * diffX);
	this._cameraDeltaY = this._cameraDeltaY + (defaults.cellHeight * diffY);
	
	this._tileLayer.x = this._tileLayer.x + (defaults.cellWidth * -diffX);
	this._tileLayer.y = this._tileLayer.y + (defaults.cellHeight * -diffY);
}

WorldScene.prototype.process = function() {
	return new Promise(function(resolve, reject) {
		//if we have no map, lets show the loading screen with info on loading map
		if(this._map === null && this._isLoadingMap === false) {
			this._loadMap();
		} else if(this._map !== null && this._isLoadingMap === false) {
			this._processMap();
		}
		resolve(this._stage);
	}.bind(this));
}

WorldScene.prototype._processMap = function() {
	var player = GameService.player,
		defaults = GameService.defaults,
		topBound = player.y - defaults.viewRangeY < 0 ? 0 : player.y - defaults.viewRangeY,
		leftBound = player.x - defaults.viewRangeX < 0 ? 0 : player.x - defaults.viewRangeX,
		rightBound = player.x + defaults.viewRangeX > this._map.getWidth() ? this._map.getWidth() : player.x + defaults.viewRangeX,
		bottomBound = player.y + defaults.viewRangeY > this._map.getHeight() ? this._map.getHeight() : player.y + defaults.viewRangeY;

	//if we have a different lastProcessed X/Y from now, our player has moved, so we need handle some old tiles
	if(this._lastProcessedX !== null && this._lastProcessedY !== null) {
		if(this._lastProcessedX !== player.x || this._lastProcessedY !== player.y) {
			if(this._lastProcessedX > player.x && this._lastProcessedX < player.rightBound) {
				//player has moved left, so let's clear the far right sprites
				this._clearSpritesFromStage(rightBound + 1, rightBound + this._lastProcessedX - player.x, topBound, bottomBound)
			} else if(this._lastProcessedX < player.x && this._lastProcessedX > player.leftBound) {
				//player has moved right, so let's clear the far left sprites
				this._clearSpritesFromStage(leftBound - player.x + this._lastProcessedX, leftBound - 1, topBound, bottomBound)
			}

			if(this._lastProcessedY > player.y && this._lastProcessedY < player.bottomBound) {
				//player has moved up, so let's clear the bottom sprites
				this._clearSpritesFromStage(leftBound, rightBound, bottomBound + 1, bottomBound + this._lastProcessedY - player.y)
			} else if(this._lastProcessedY < player.y && this._lastProcessedY > player.topBound) {
				//player has moved right, so let's clear the far left sprites
				this._clearSpritesFromStage(leftBound, rightBound, topBound - player.y + this._lastProcessedY, topBound - 1)
			}			

			if (this._lastProcessedX < leftBound || this._lastProcessedX > rightBound
				|| this._lastProcessedY < topBound || this._lastProcessedY > bottomBound) {
				//player has completely moved from the last place (new area, teleport)
				this._clearAllSpritesFromStage();
			}
		}
	}

	this._addSpritesToStage(leftBound, rightBound, topBound, bottomBound);

	this._lastProcessedX = player.x;
	this._lastProcessedY = player.y;
}

WorldScene.prototype._clearAllSpritesFromStage = function() {
	this._tileLayer.removeChildren();
	this._smTileLayer.removeChildren();
	this._map.clearSprites();
}

WorldScene.prototype._clearSpritesFromStage = function(leftBound, rightBound, topBound, bottomBound) {
	var mapCell;
	for (var y = topBound; y <= bottomBound; y++) {
		for (var x = leftBound; x <= rightBound; x++) {
			mapCell = this._map.getMapCell(x, y);

			if(mapCell.backSprite !== null) {
				this._tileLayer.removeChild(mapCell.backSprite);
				mapCell.clearSprite();
			}
			if(mapCell.middleSprite !== null) {
				this._smTileLayer.removeChild(mapCell.middleSprite);
				mapCell.clearSprite();
			}			
		}
	}
}

WorldScene.prototype._addSpritesToStage = function(leftBound, rightBound, topBound, bottomBound) {
	var texture = null,
		imageUrl = '',
		player = GameService.player,
		defaults = GameService.defaults,
		drawX,
		drawY,
		mapCell;

	for (var y = topBound; y <= bottomBound; y++) {
		drawY = (y - player.y) * defaults.cellHeight + this._gameOffSetY + this._cameraDeltaY; //Moving OffSet

	    for (var x = leftBound; x <= rightBound; x++) {
			drawX = (x - player.x) * defaults.cellWidth + this._gameOffSetX + this._cameraDeltaX; //Moving OffSet
			mapCell = this._map.getMapCell(x, y);

			//handle tiles, objects and players/mobs/items
			if(x % 2 === 0 && y % 2 === 0) {
				//if we do not have backSprite for this tile, generate one and store it to the tileLayer
				if(mapCell.backSprite === null && mapCell.backIndex > 0 && mapCell.backImage > 0) {
					imageUrl = mapCell.getBackImageUrl();
					if(imageUrl !== null) {
						mapCell.backSprite = false;
						LoaderService.loadMapTexture(imageUrl).then(this._addBackSprite.bind(this, mapCell, drawX, drawY));
					} else {
						console.log('Failed loading map graphics ' + imageUrl + ' at index: ' + mapCell.backIndex);
					}
				}
			} 

			//middle sprites (sm tiles)
			if(mapCell.middleSprite === null && mapCell.middleIndex > 0 && mapCell.middleImage > 0) {
				imageUrl = mapCell.getMiddleImageUrl();
				if(imageUrl !== null) {
					mapCell.backSprite = false;
					LoaderService.loadMapTexture(imageUrl).then(this._addMiddleSprite.bind(this, mapCell, drawX, drawY));
				} else {
					console.log('Failed loading map graphics ' + imageUrl + ' at index: ' + mapCell.middleIndex);
				}
			}			
	    }
	}
}

WorldScene.prototype._addBackSprite = function(mapCell, drawX, drawY, texture){
	mapCell.backSprite = new PIXI.Sprite(texture);
	mapCell.backSprite.x = drawX;
	mapCell.backSprite.y = drawY;
	this._tileLayer.addChild(mapCell.backSprite);	
}

WorldScene.prototype._addMiddleSprite = function(mapCell, drawX, drawY, texture){
	mapCell.middleSprite = new PIXI.Sprite(texture);
	mapCell.middleSprite.x = drawX;
	mapCell.middleSprite.y = drawY;
	this._smTileLayer.addChild(mapCell.middleSprite);
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