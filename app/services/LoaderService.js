var MapReader = require('../maps/MapReader.js');

/*

    Aysnc load assets and cache them locally

*/

var asyncLoad = function(fileName) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest(),
            path = fileName;

        xhr.open("GET", path, true);
        xhr.responseType = "arraybuffer";
        
        xhr.onload = function (e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var arrayBuffer = xhr.response;
                if (arrayBuffer) {
                    resolve(new DataView(arrayBuffer));
                    return;
                } 
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
            asyncLoad("http://mirjs.com/maps/" + mapName + ".map")
                .then(function(arrayBuffer) {
                    var mapReader = new MapReader(mapName, arrayBuffer);
                    resolve(mapReader.loadMap());
                }, function(error) {
                    reject(error);
                });
        });
    }
};

module.exports = LoaderService;