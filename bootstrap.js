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

//round to 128 so we get no blurry graphics
GameService.defaults.screenWidth = 16 * Math.round((window.innerWidth || 1024) / 16);
GameService.defaults.screenHeight = 16 * Math.round((window.innerHeight || 768) / 16);

document.body.style.width = GameService.defaults.screenWidth + 'px';
document.body.style.height = GameService.defaults.screenHeight + 'px';

//make a dummy player for our game server
GameService.player = new Player({
	name: 'TrueADM',
	level: 30,
	exp: 1000,
	maxExp: 2000,
	gender: 0,
	x: 311,
	y: 288,
	hp: 70,
	mp: 20,
	maxHp: 100,
	maxMp: 100,
	weight: 20,
	maxWeight: 100,
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