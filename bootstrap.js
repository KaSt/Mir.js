/*

	Mir.js

	By Dominic Gannaway
	aka TrueADM

	Browserify command to compile and bundle code (run in root directory):
	"browserify app.js > bundle.js"

*/

var GameService = require('./app/services/GameService.js');
var Player = require('./app/objects/Player.js');
var Item = require('./app/objects/Item.js');
var Npc = require('./app/objects/Npc.js');
var App = require('./app/App.js');
var MirClassEnum = require('./app/enums/MirClassEnum.js');
var ItemTypeEnum = require('./app/enums/ItemTypeEnum.js');

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
	gold: 10000,
	y: 288,
	hp: 70,
	mp: 20,
	mirClass: MirClassEnum.Warrior,
	maxHp: 100,
	maxMp: 100,
	weight: 20,
	maxWeight: 100,
	direction: 0,
	inventory: [
		new Item({
			name: 'Candle',
			inventoryLook: 0,
			spriteLook: 0,
			description: "A basic candle that provides a source of light when equipped",
			itemType: ItemTypeEnum.Torch,
			restrictions: null,
			price: 10,
			durability: 5,
			maxDurability: 5,
			stats: null,
			weight: 1
		}),
		new Item({
			name: 'Torch',
			inventoryLook: 1,
			spriteLook: 0,
			description: "A durable torch that provides a source of light when equipped",
			itemType: ItemTypeEnum.Torch,
			restrictions: null,
			price: 50,
			durability: 10,
			maxDurability: 10,
			stats: null,
			weight: 2
		}),
		new Item({
			name: 'Book of Fireball',
			inventoryLook: 2,
			spriteLook: 0,
			description: "An ancient spell book that allows Wizards to study and learn the Fireball spell'",
			itemType: ItemTypeEnum.Book,
			restrictions: {
				mirClass: MirClassEnum.Wizard,
				level: 7
			},
			price: 200,
			stats: null,
			weight: 5
		}),
		new Item({
			name: 'Small Health Potion',
			inventoryLook: 3,
			spriteLook: 0,
			description: "A small health potion that heals 50 HP over 5 seconds'",
			itemType: ItemTypeEnum.Potion,
			restrictions: null,
			price: 25,
			stats: null,
			weight: 2
		}),
		new Item({
			name: 'Medium Health Potion',
			inventoryLook: 4,
			spriteLook: 0,
			description: "A medium health potion that heals 125 HP over 5 seconds'",
			itemType: ItemTypeEnum.Potion,
			restrictions: null,
			price: 100,
			stats: null,
			weight: 3
		}),
		new Item({
			name: 'Large Health Potion',
			inventoryLook: 5,
			spriteLook: 0,
			description: "A medium health potion that heals 250 HP over 5 seconds'",
			itemType: ItemTypeEnum.Potion,
			restrictions: null,
			price: 250,
			stats: null,
			weight: 4
		}),
		new Item({
			name: 'Small Mana Potion',
			inventoryLook: 6,
			spriteLook: 0,
			description: "A small health potion that heals 50 MP over 5 seconds'",
			itemType: ItemTypeEnum.Potion,
			restrictions: null,
			price: 25,
			stats: null,
			weight: 2
		}),
		new Item({
			name: 'Medium Mana Potion',
			inventoryLook: 7,
			spriteLook: 0,
			description: "A medium health potion that heals 125 MP over 5 seconds'",
			itemType: ItemTypeEnum.Potion,
			restrictions: null,
			price: 100,
			stats: null,
			weight: 3
		}),
		new Item({
			name: 'Large Mana Potion',
			inventoryLook: 8,
			spriteLook: 0,
			description: "A medium health potion that heals 250 MP over 5 seconds'",
			itemType: ItemTypeEnum.Potion,
			restrictions: null,
			price: 250,
			stats: null,
			weight: 4
		})		
	],
	equipped: {
		weapon: null,
		bracelet1: null,
		bracelet2: null,
		ring1: null,
		ring2: null,
		armour: null,
		gem: null,
		boots: null,
		belt: null,
		torch: null,
		amulet: null,
		necklace: null,
		helmet: null
	}
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