var LoaderService = require('../services/LoaderService.js');
var GameService = require('../services/GameService.js');
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
}

WorldScene.prototype.init = function() {
	var defaults = GameService.defaults;
	this._gameOffSetX = defaults.screenWidth / 2;
    this._gameOffSetY = defaults.screenHeight / 2 - 1;

    //add
    this._stage.addChild(this._tileLayer);
    this._stage.addChild(this._smTileLayer);

	this._initGui();
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
			if(this._lastProcessedX === player.x + 1 && this._lastProcessedY === player.y) {
				//player has moved left, so let's clear the far right sprites
				this._clearSpritesFromStage(rightBound + 1, rightBound + 1, topBound, bottomBound)
			} else if(this._lastProcessedX === player.x - 1 && this._lastProcessedY === player.y) {
				//player has moved right, so let's clear the far right sprites
				this._clearSpritesFromStage(rightBound - 1, rightBound - 1, topBound, bottomBound)
			} else if (this._lastProcessedX < leftBound || this._lastProcessedX > rightBound
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
		drawY = (y - player.y) * defaults.cellHeight + this._gameOffSetY; //Moving OffSet

	    for (var x = leftBound; x <= rightBound; x++) {
			drawX = (x - player.x) * defaults.cellWidth + this._gameOffSetX; //Moving OffSet
			mapCell = this._map.getMapCell(x, y);

			//handle tiles, objects and players/mobs/items
			if(x % 2 === 0 && y % 2 === 0) {
				//if we do not have backSprite for this tile, generate one and store it to the tileLayer
				if(mapCell.backSprite === null && mapCell.backIndex > 0 && mapCell.backImage > 0) {
					imageUrl = mapCell.getBackImageUrl();
					if(imageUrl !== null) {
						texture = LoaderService.loadMapTexture(imageUrl);
						mapCell.backSprite = new PIXI.Sprite(texture);
						mapCell.backSprite.x = drawX;
						mapCell.backSprite.y = drawY;
						this._tileLayer.addChild(mapCell.backSprite);
					} else {
						console.log('Failed loading map graphics ' + imageUrl + ' at index: ' + mapCell.backIndex);
					}
				}
			} 

			//middle sprites (sm tiles)
			if(mapCell.middleSprite === null && mapCell.middleIndex > 0 && mapCell.middleImage > 0) {
				imageUrl = mapCell.getMiddleImageUrl();
				if(imageUrl !== null) {
					texture = LoaderService.loadMapTexture(imageUrl);
					mapCell.middleSprite = new PIXI.Sprite(texture);
					mapCell.middleSprite.x = drawX;
					mapCell.middleSprite.y = drawY;
					this._smTileLayer.addChild(mapCell.middleSprite);
				} else {
					console.log('Failed loading map graphics ' + imageUrl + ' at index: ' + mapCell.middleIndex);
				}
			}			
	    }
	}
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