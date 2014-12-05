var MapReader = require('../maps/MapReader.js');
var PIXI = require('pixi.js');

/*

    Aysnc load assets and cache them locally

*/

var asyncLoad = function(fileName, type) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest(),
            path = fileName;

        xhr.open("GET", path, true);
        xhr.responseType = type;
        
        xhr.onload = function (e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                resolve(xhr.response)
            }
            reject();
        };
        xhr.onerror = function (e) {
          reject(new Error(xhr.statusText));
        };
        xhr.send(null);
    });
}

var LoaderService = {
    loadMap: function(mapName) {
        return new Promise(function(resolve, reject) {
            console.log('Loading map ' + mapName);
            asyncLoad("http://mirjs.com/maps/" + mapName + ".map", 'arraybuffer')
                .then(function(arrayBuffer) {
                    var mapReader = new MapReader(new DataView(arrayBuffer));
                    console.log('Loaded map ' + mapName);
                    resolve(mapReader.loadMap());
                    mapReader = null;
                }, function(error) {
                    console.log('Failed to load map ' + mapName);
                    reject(error);
                }).catch(function(e){
                    console.log('Failed to load map ' + mapName);
                    reject(error); 
                });
        });
    },
    loadMapTexture: function(assetPath) {
        return new Promise(function(resolve, reject) {
            var texture = PIXI.Texture.fromImage("http://mirjs.com/" + assetPath);
            if(texture.baseTexture.hasLoaded) {
                resolve(texture);
            } else {
                texture.on('update', function(texture) {
                    texture.off('update');
                    resolve(texture);
                }.bind(this, texture));
            }
        });
    },
    loadGraphicsPlacements: function(assetPath) {
        return new Promise(function(resolve, reject) {
            var loader = new PIXI.JsonLoader("http://mirjs.com/" + assetPath + '.json');
            loader.on('loaded', function(evt) {
                resolve(evt.data.content.json);
            });
            loader.load();
        });
    }
};

module.exports = LoaderService;