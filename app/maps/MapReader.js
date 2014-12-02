var Map = require('./Map.js');
var MapCell = require('./MapCell.js');

function MapReader(mapName, dataBuffer) {
	this._dataBufferBuffer = dataBuffer;
	this._mapName = mapName;
	this._mapCells = [];
	this._map = new Map();
}

MapReader.prototype.loadMap() {

	//wemade mir3 maps have no title they just start with blank bytes
    if (this._dataBuffer.getInt8(0) == 0) {
        this._loadMapType5();
        return;
    }
    //shanda mir3 maps start with title: (C) SNDA, MIR3.
    if ((this._dataBuffer.getInt8(0) == 0x0F) && (this._dataBuffer.getInt8(5) == 0x53) && (this._dataBuffer.getInt8(14) == 0x33))
    {
        this._loadMapType6();
        return;
    }
    //wemades antihack map (laby maps) title start with: Mir2 AntiHack
    if ((this._dataBuffer.getInt8(0) == 0x15) && (this._dataBuffer.getInt8(4) == 0x32) && (this._dataBuffer.getInt8(6) == 0x41) && (this._dataBuffer.getInt8(19) == 0x31))
    {
        this._loadMapType4();
        return;
    }
    //wemades 2010 map format i guess title starts with: Map 2010 Ver 1.0
    if ((this._dataBuffer.getInt8(0) == 0x10) && (this._dataBuffer.getInt8(2) == 0x61) && (this._dataBuffer.getInt8(7) == 0x31) && (this._dataBuffer.getInt8(14) == 0x31))
    {
        this._loadMapType1();
        return;
    }
    //shanda's 2012 format and one of shandas(wemades) older formats share same header info, only difference is the filesize
    if ((this._dataBuffer.getInt8(4) == 0x0F) && (this._dataBuffer.getInt8(18) == 0x0D) && (this._dataBuffer.getInt8(19) == 0x0A))
    {
        var w = this._dataBuffer.getUint8(0) + (this._dataBuffer.getUint8(1) << 8);
        var h = this._dataBuffer.getUint8(2) + (this._dataBuffer.getUint8(3) << 8);
        if (this._dataBuffer.byteLength > (52 + (w * h * 14)))
        {
            this._loadMapType3();
            return;
        }
        else
        {
            this._loadMapType2(w, h);
            return;
        }
    }

    //3/4 heroes map format (myth/lifcos i guess)
    if ((this._dataBuffer.getInt8(0) == 0x0D) && (this._dataBuffer.getInt8(1) == 0x4C) && (this._dataBuffer.getInt8(7) == 0x20) && (this._dataBuffer.getInt8(11) == 0x6D))
    {
        this._loadMapType7();
        return;
    }
    //if it's none of the above load the default old school format
    this._loadMapType0();    
}

MapReader.prototype._loadMapType0 = function() {
}

MapReader.prototype._loadMapType1 = function() {
}

MapReader.prototype._loadMapType2 = function(width, height) {
    var offset = 52;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
        	if(this._mapCells[x] == null) {
        		this._mapCells[x] = [];
        	}
            this._mapCells[x][y] = new MapCell();
            this._mapCells[x][y].backImage = this._dataBuffer.getInt16(offset);
            offset += 2;
            this._mapCells[x][y].middleImage = this._dataBuffer.getInt16(offset);
            offset += 2;
            this._mapCells[x][y].frontImage = this._dataBuffer.getInt16(offset);
            offset += 2;
            this._mapCells[x][y].doorIndex = this._dataBuffer.getInt8(offset++);
            this._mapCells[x][y].doorOffset = this._dataBuffer.getInt8(offset++);
            this._mapCells[x][y].frontAnimationFrame = this._dataBuffer.getInt8(offset++);
            this._mapCells[x][y].frontAnimationTick = this._dataBuffer.getInt8(offset++);
            this._mapCells[x][y].frontIndex = this._dataBuffer.getInt8(offset++) + 120;
            this._mapCells[x][y].light = this._dataBuffer.getInt8(offset++);
            this._mapCells[x][y].backIndex = this._dataBuffer.getInt8(offset++) + 100;
            this._mapCells[x][y].middleIndex = this._dataBuffer.getInt8(offset++) + 110;
            if ((this._mapCells[x][y].backImage & 0x8000) != 0) {
                this._mapCells[x][y].backImage = (this._mapCells[x][y].backImage & 0x7FFF) | 0x20000000;
            }
    	}
	}		
}

MapReader.prototype._loadMapType3 = function() {
}

MapReader.prototype._loadMapType4 = function() {
}

MapReader.prototype._loadMapType5 = function() {
}

module.exports = MapReader;