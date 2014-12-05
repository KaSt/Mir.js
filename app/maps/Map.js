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

Map.prototype.getFrontImageUrl = function(mapCell) {
    var index = mapCell.frontImage - 1;

    if(index < 0) {
        return null;
    }

    var indexString = addPathNamePadding(index, 6),
        mapLib = ResourceService.graphics.mapLib(mapCell.frontIndex);

    if(mapLib === null) {
        return null;
    }

    return mapLib.path + "/" + indexString + "." + mapLib.type;
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