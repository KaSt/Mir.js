
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

module.exports = Map;