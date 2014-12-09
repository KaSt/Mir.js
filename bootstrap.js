/*

	Mir.js

	By Dominic Gannaway
	aka TrueADM

	Browserify command to compile and bundle code (run in root directory):
	"browserify app.js > bundle.js"

*/

var GameService = require('./app/services/GameService.js');
var Player = require('./app/objects/Player.js');
var Npc = require('./app/objects/Npc.js');
var App = require('./app/App.js');

//make a dummy player for our game server
GameService.player = new Player({
	name: 'TrueADM',
	level: 30,
	exp: 2000,
	x: 300,
	y: 300,
	hp: 100,
	mp: 100,
	maxHp: 100,
	maxMp: 100,
	direction: 0,
	bag: [],
	equiped: {}
});

//set map
GameService.map.file = "0";
GameService.map.name = "BichonProvince";

//add an NPC into the middle of BW
GameService.addNpc(new Npc({
	id: 1,
	name: 'Fred',
	look: 0,
	x: 300,
	y: 290
}));

window.GameService = GameService;

//we haven't got the login scene or char select scene yet, so let's cheat and say we have
GameService.loggedIn = true;

//now start the app
var app = new App(document.getElementById('app'));