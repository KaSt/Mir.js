var ResourceService = require('../services/ResourceService.js');

var addPathNamePadding = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


function MapCell() {
    this.backIndex = null;
    this.backImage = null;
    this.middleIndex = null;
    this.middleImage = null;
    this.frontIndex = null;
    this.frontImage = null;

    this.doorIndex = null;
    this.doorOffset = null;

    this.frontAnimationFrame = null;
    this.frontAnimationTick = null;

    this.middleAnimationFrame = null;
    this.middleAnimationTick = null;

    this.tileAnimationImage = null;
    this.tileAnimationOffset = null;
    this.tileAnimationFrames = null;

    this.light = null;
    this.unknown = null;

    this.backSprite = null;
    this.middleSprite = null;
    this.frontSprite = null;
}

MapCell.prototype.getBackImageUrl = function() {
	var index = (this.backImage & 0x1FFFF) - 1;

	if(index < 0) {
		return null;
	}

    if(mapLib === null) {
        return null;
    }    

	var indexString = addPathNamePadding(index, 6),
		mapLib = ResourceService.graphics.mapLib(this.backIndex);

	return mapLib.path + "/" + indexString + "." + mapLib.type;
}

MapCell.prototype.getMiddleImageUrl = function() {
	var index = this.middleImage - 1;

	if(index < 0) {
		return null;
	}

    if(mapLib === null) {
        return null;
    }    

	var indexString = addPathNamePadding(index, 6),
		mapLib = ResourceService.graphics.mapLib(this.middleIndex);

	return mapLib.path + "/" + indexString + "." + mapLib.type;
}

MapCell.prototype.getFrontImageUrl = function() {
    var index = this.frontImage - 1;

    if(index < 0) {
        return null;
    }

    var indexString = addPathNamePadding(index, 6),
        mapLib = ResourceService.graphics.mapLib(this.frontIndex);

    if(mapLib === null) {
        return null;
    }

    return mapLib.path + "/" + indexString + "." + mapLib.type;
}

MapCell.prototype.clearSprite = function() {
	this.backSprite = null;
	this.middleSprite = null;
    this.frontSprite = null;
}

module.exports = MapCell;