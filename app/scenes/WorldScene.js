var LoaderService = require('../services/LoaderService.js');
var GameService = require('../services/GameService.js');
var ResourceService = require('../services/ResourceService.js');
var InputService = require('../services/InputService.js');
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
}

WorldScene.prototype.init = function() {
	var defaults = GameService.defaults;
	this._gameOffSetX = defaults.screenWidth / 2;
    this._gameOffSetY = defaults.screenHeight / 2 - 1;

    //add
    this._stage.addChild(this._tileLayer);
    this._stage.addChild(this._smTileLayer);
    this._stage.addChild(this._objTileLayer);

	this._initGui();
	this._enableInput();

	//load the placements and the starting map
	this._loadGraphicsPlacements()
		.then(this._loadMap.bind(this))
		.then(function(map) {
			this._map = map;
			this._lastProcessedX = GameService.player.x;
			this._lastProcessedY = GameService.player.y;	
			this._readyForInput = true;
			this._updateCamera(0, 0);		
			this._isLoadingMap = false;
		}.bind(this));
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

	if(this._readyForInput === true) {

		this._readyForInput = false;
		//move this out eventually
		GameService.player.x = GameService.player.x + diffX;
		GameService.player.y = GameService.player.y + diffY;

		this._cameraDeltaX = this._cameraDeltaX + (defaults.cellWidth * diffX);
		this._cameraDeltaY = this._cameraDeltaY + (defaults.cellHeight * diffY);
		
		this._tileLayer.x = this._tileLayer.x + (defaults.cellWidth * -diffX);
		this._tileLayer.y = this._tileLayer.y + (defaults.cellHeight * -diffY);
		this._smTileLayer.x = this._smTileLayer.x + (defaults.cellWidth * -diffX);
		this._smTileLayer.y = this._smTileLayer.y + (defaults.cellHeight * -diffY);
		this._objTileLayer.x = this._objTileLayer.x + (defaults.cellWidth * -diffX);
		this._objTileLayer.y = this._objTileLayer.y + (defaults.cellHeight * -diffY);

		this._updateBounds();
		this._handleOldSprites();
		this._handleNewSprites();
		this._readyForInput = true;
	}
}

WorldScene.prototype._updateBounds = function() {
	var player = GameService.player,
		defaults = GameService.defaults;

	this._topBound = player.y - defaults.viewRangeY < 0 ? 0 : player.y - defaults.viewRangeY;
	this._leftBound = player.x - defaults.viewRangeX < 0 ? 0 : player.x - defaults.viewRangeX;
	this._rightBound = player.x + defaults.viewRangeX > this._map.getWidth() - 1 ? this._map.getWidth() - 1 : player.x + defaults.viewRangeX;
	this._bottomBound = player.y + defaults.viewRangeY > this._map.getHeight() - 1 ? this._map.getHeight() - 1 : player.y + defaults.viewRangeY;
}

WorldScene.prototype._handleOldSprites = function() {
	var player = GameService.player,
		defaults = GameService.defaults;

	//if we have a different lastProcessed X/Y from now, our player has moved, so we need handle some old tiles
	if(this._lastProcessedX !== null && this._lastProcessedY !== null) {
		if(this._lastProcessedX !== player.x || this._lastProcessedY !== player.y) {
			if(this._lastProcessedX > player.x && this._lastProcessedX < this._rightBound) {
				//player has moved left, so let's clear the far right sprites
				this._clearSpritesFromStage(this._rightBound + 1, this._rightBound + this._lastProcessedX - player.x, this._topBound, this._bottomBound)
			} else if(this._lastProcessedX < player.x && this._lastProcessedX > this._leftBound) {
				//player has moved right, so let's clear the far left sprites
				this._clearSpritesFromStage(this._leftBound - player.x + this._lastProcessedX, this._leftBound - 1, this._topBound, this._bottomBound)
			}

			if(this._lastProcessedY > player.y && this._lastProcessedY < this._bottomBound) {
				//player has moved up, so let's clear the bottom sprites
				this._clearSpritesFromStage(this._leftBound, this._rightBound, this._bottomBound + 1, this._bottomBound + this._lastProcessedY - player.y)
			} else if(this._lastProcessedY < player.y && this._lastProcessedY > this._topBound) {
				//player has moved right, so let's clear the far left sprites
				this._clearSpritesFromStage(this._leftBound, this._rightBound, this._topBound - player.y + this._lastProcessedY, this._topBound - 1)
			}			

			if (this._lastProcessedX < this._leftBound || this._lastProcessedX > this._rightBound
				|| this._lastProcessedY < this._topBound || this._lastProcessedY > this._bottomBound) {
				//player has completely moved from the last place (new area, teleport)
				this._clearAllSpritesFromStage();
			}

			this._lastProcessedX = player.x;
			this._lastProcessedY = player.y;				
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

WorldScene.prototype._handleNewSprites = function() {
	var texture = null,
		imageUrl = '',
		imageUrlAndPlacements = {},
		player = GameService.player,
		defaults = GameService.defaults,
		drawX,
		drawY,
		mapCell,
		placementX,
		placementY,
		x,
		y;

	for (y = this._topBound; y <= this._bottomBound; y++) {
		drawY = (y - player.y) * defaults.cellHeight + this._gameOffSetY + this._cameraDeltaY; //Moving OffSet

	    for (x = this._leftBound; x <= this._rightBound; x++) {
			drawX = (x - player.x) * defaults.cellWidth + this._gameOffSetX + this._cameraDeltaX; //Moving OffSet
			mapCell = this._map.getMapCell(x, y);

			//handle big tiles
			if(x % 2 === 0 && y % 2 === 0) {
				//if we do not have backSprite for this tile, generate one and store it to the tileLayer
				if(mapCell.backSprite === null && mapCell.backIndex > 0 && mapCell.backImage > 0) {
					getBackImageUrl = this._map.getBackImageUrl(mapCell);
					if(getBackImageUrl !== null) {
						mapCell.backSprite = false;					
						LoaderService.loadMapTexture(getBackImageUrl)
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
					LoaderService.loadMapTexture(imageUrl)
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

					LoaderService.loadMapTexture(imageUrlAndPlacements.url)
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
	    }
	}

	//handle layer order for objects
	this._objTileLayer.children.sort(depthCompare);
}

WorldScene.prototype._handleSpriteVisibility = function(sprite) {
	if(sprite.x + this._cameraDeltaX > GameService.screenWidth) {
		sprite.visible = false;
	} else if(sprite.x + sprite.width - this._cameraDeltaX < 0) {
		sprite.visible = false;
	} else if(sprite.y + sprite.height - this._cameraDeltaY < 0) {
		sprite.visible = false;
	} else if(sprite.y + this._cameraDeltaY > GameService.screenHeight) {
		sprite.visible = false;
	} else {
		sprite.visible = true;
	}
}

WorldScene.prototype._addBackSprite = function(mapCell, drawX, drawY, texture){
	mapCell.backSprite = new PIXI.Sprite(texture);
	mapCell.backSprite.x = drawX + 7;
	mapCell.backSprite.y = drawY - texture.height - 24;
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
		LoaderService.loadMap(GameService.player.map)
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