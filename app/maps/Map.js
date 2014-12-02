
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

module.exports = Map;