var Stage = require('pixi/display/Stage');
var LoaderService = require('../services/LoaderService.js');
var ResourceService = require('../services/ResourceService.js');
var GameService = require('../services/GameService.js');
var Texture = require('pixi/textures/Texture');

function WorldScene(appContainer) {
	this._appContainer = appContainer;
	this._stage = new Stage();
	this._map = null;
	this._isLoadingMap = false;
	this._gameOffSetX = null;
	this._gameOffSetY = null;
}

WorldScene.prototype.init = function() {
	var defaults = GameService.defaults;
	this._gameOffSetX = defaults.screenWidth / 2 / defaults.cellWidth;
    this._gameOffSetY = defaults.screenHeight / 2 / defaults.cellHeight - 1;
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
		defaults = GameService.defaults;

	for (var y = player.y - defaults.viewRangeY; y <= player.y + defaults.viewRangeY; y++) {
	    if (y <= 0 || y % 2 === 1) {
	    	continue;
	    }

	    if (y >= this._map.getHeight()) {
	    	break;
	    }
	    
	    var drawY = (y - player.y + this._gameOffSetY) * defaults.cellHeight + player.offsetY; //Moving OffSet

	    for (var x = player.x - defaults.viewRangeX; x <= player.x + defaults.viewRangeX; x++) {
	        if (x <= 0 || x % 2 === 1) {
	        	continue;
	        }
	        if (x >= this._map.getWidth()) {
	        	break;
	        }

	        var mapCell = this._map.getMapCell(x, y),
				drawX = (x - player.x + this._gameOffSetX) * defaults.cellWidth - this._gameOffSetX + player.offsetX; //Moving OffSet

	        //work out if we need to load this image now
	        if(!mapCell.graphic && mapCell.failed === false) {

		        var backImage = mapCell.backImage,
		       		backIndex = mapCell.backIndex;

		        if (backImage > 0) {
			        var index = (backImage & 0x1FFFF) - 1,
			        	mapLib = ResourceService.graphics.mapLib(backIndex);

			        if(mapLib !== null) {
				        LoaderService.loadMapGraphics(mapLib, index).then(function(graphic) {
				        	this._stage.addChild( new Texture(graphic));
				        	mapCell.graphic = graphic;
				        }.bind(this), function() {
				        	mapCell.failed = true;
				        });
			       	}
		        }
	        }
	        //if we have the tile graphic loaded, we update its position 
	        else {
	        	mapCell.graphic.position.x = drawX;
	        	mapCell.graphic.position.y = drawY;
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