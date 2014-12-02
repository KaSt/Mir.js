(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var GameService = require('./services/GameService.js');
var ScenesEnum = require('./scenes/ScenesEnum.js');

function App(appContainer) {
	this._appContainer = appContainer;

	//do some network stuff here

	this._init();
}

App.prototype._init = function() {
	//check if we have a scene
	if(GameService.scene === null && GameService.loggedIn === true) {
		//load a scene
		GameService.loadScene(ScenesEnum.WORLD_SCENE);
	}
}

module.exports = App;
},{"./scenes/ScenesEnum.js":3,"./services/GameService.js":5}],2:[function(require,module,exports){

function Player( data ) {
	this.name = data.name || null;
	this.level = data.level || null;
	this.exp = data.exp || null;
	this.map = data.map || null;
	this.x = data.x || null;
	this.y = data.y || null;
	this.hp = data.hp || null;
	this.mp = data.mp || null;
	this.bag = data.bag || [];
	this.equiped = data.equiped || {};
}

module.exports = Player
},{}],3:[function(require,module,exports){

var ScenesEnum = {
	LOGIN_SCENE: 0,
	CHAR_SELECT_SCENE: 1,
	WORLD_SCENE: 2
};

module.exports = ScenesEnum;
},{}],4:[function(require,module,exports){

function WorldScene() {

}

module.exports = WorldScene;
},{}],5:[function(require,module,exports){
var ScenesEnum = require('../scenes/ScenesEnum.js');
var WorldScene = require('../scenes/WorldScene.js');

var GameService = {
	player: null,
	currentScene: null,
	loggedIn: false,

	loadScene: function(newScene) {
		this.currentScene.hide().then(function() {
			switch(newScene) {
				case ScenesEnum.WORLD_SCENE:
					this.currentScene = new WorldScene();
					break;
			}

			//show loading?

			//then show scene
			this.currentScene.show();
		}.bind(this));
	}
};

module.exports = GameService;
},{"../scenes/ScenesEnum.js":3,"../scenes/WorldScene.js":4}],6:[function(require,module,exports){
/*

	Mir.js

	By Dominic Gannaway
	aka TrueADM

	Browserify command to compile and bundle code (run in root directory):
	"browserify app.js > bundle.js"

*/

var GameService = require('./app/services/GameService.js');
var Player = require('./app/objects/Player.js');
var App = require('./app/App.js');

//make a dummy player for our game server
GameService.player = new Player({
	name: 'TrueADM',
	level: 30,
	exp: 2000,
	map: 100,
	x: 350,
	y: 350,
	hp: 100,
	mp: 100,
	bag: [],
	equiped: {}
});

//we haven't got the login scene or char select scene yet, so let's cheat and say we have
GameService.loggedIn = true;

//now start the app
var app = new App(document.getElementById('app'));
},{"./app/App.js":1,"./app/objects/Player.js":2,"./app/services/GameService.js":5}]},{},[6]);
