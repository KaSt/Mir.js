var Map = require('./Map.js');

function MapReader(mapName, dataBuffer) {
	this._dataBuffer = dataBuffer;
	this._mapName = mapName;
	this._map = null;
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
    this._map = new Map(width, height);

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
                mapCell.backImage = (mapCell.backImage & 0x7FFF) | 0x20000000;
            }

            this._map.setMapCell(mapCell, x, y);
    	}
	}	

    return this._map;	
}

MapReader.prototype._loadMapType3 = function() {
}

MapReader.prototype._loadMapType4 = function() {
}

MapReader.prototype._loadMapType5 = function() {
}

module.exports = MapReader;