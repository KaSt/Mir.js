var MapReader = require('../maps/MapReader.js');

/*

    Aysnc load assets and cache them locally

*/

var addPathNamePadding = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

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
                    var mapReader = new MapReader(mapName, new DataView(arrayBuffer));
                    console.log('Loaded map ' + mapName);
                    resolve(mapReader.loadMap());
                }, function(error) {
                    console.log('Failed to load map ' + mapName);
                    reject(error);
                }).catch(function(e){
                    console.log('Failed to load map ' + mapName);
                    reject(error); 
                });
        });
    },
    loadMapGraphics: function(mapLib, index) {
        return new Promise(function(resolve, reject) {
            var fullPath = '';
            index = addPathNamePadding(index, 6);
            fullPath = "http://mirjs.com/" + mapLib.path + "/" + index + "." + mapLib.type;
            
            console.log('Loading map graphics ' + mapLib.path + ' - ' + index);
            // asyncLoad(fullPath, 'file')
            //     .then(function(blob) {
            //         console.log('Loaded map graphics ' + mapLib.path + ' - ' + index);
            //         resolve(fullPath);
            //     }, function(error) {
            //         console.log('Failed to load graphics ' + mapLib.path + ' - ' + index);
            //         reject(error);
            //     }).catch(function(e){
            //         console.log('Failed to load graphics ' + mapLib.path + ' - ' + index);
            //         reject(error); 
            //     });
        });
    }
};

module.exports = LoaderService;