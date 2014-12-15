"use strict";

var HumanSprite = require('../sprites/HumanSprite.js');
var HumanActionEnum = require('../enums/HumanActionEnum.js');
var AnimationControl = require('../animations/AnimationControl.js');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Player( data ) {
	this._name = data.name || null;
	this._level = data.level || null;
	this._exp = data.exp !== null ? data.exp : null;
	this._gender = data.gender !== null ? data.gender : null;
	this._maxExp = data.maxExp !== null ? data.maxExp : null;
	this._x = data.x !== null ? data.x : null;
	this._y = data.y !== null ? data.y : null;
	this._mirClass = data.mirClass !== null ? data.mirClass : null;
	this._virtualX = data.x !== null ? data.x : null;
	this._virtualY = data.y !== null ? data.y : null;
	this._gold = data.gold !== null ? data.gold : null;

	this._direction = data.direction !== null ? data.direction : null;
	this._hp = data.hp !== null ? data.hp : null;
	this._mp = data.mp !== null ? data.mp : null;
	this._maxHp = data.maxHp !== null ? data.maxHp : null;
	this._maxMp = data.maxMp !== null ? data.maxMp : null;
	this._weight = data.weight !== null ? data.weight : null;
	this._weight = data.maxWeight !== null ? data.maxWeight : null;
	this._inventory = data.inventory || [];
	this._equipped = data._equipped || {};
	this._humanSprite = null;

	this.isMoving = false;

	EventEmitter.call(this);
}

util.inherits(Player, EventEmitter);

Player.prototype.initHumanSprite = function(scene) {
	//make the human sprite for the player
	this._humanSprite = new HumanSprite(scene, {
		z: this._y,
		direction: this._direction,
		look: this._gender,
		gender: this._gender
	});
}

Player.prototype.getMirClassToString = function() {
	switch(this._mirClass) {
		case 0:
			return "Warrior";
		case 1:
			return "Wizard";
		case 2:
			return "Taoist";
		case 3:
			return "Assassin";
		case 4:
			return "Archer";
		case 5:
			return "Monk";
	}
}

Player.prototype.setGender = function(gender) {
	this._gender = gender;
	this._humanSprite.setLook(this._gender);
	this.emit('gender change', gender);
}

Player.prototype.setGold = function(gold) {
	this._gold = gold;
	this.emit('gold change', gold);
}

Player.prototype.setLocation = function(x, y) {
	this._x = x;
	this._y = y;
	this._humanSprite.setZ(y);	
	this.emit('location change', x, y);
}

Player.prototype.getHumanSprite = function() {
	return this._humanSprite;
}

Player.prototype.setZ = function(z) {
	this._humanSprite.setZ(z);	
}

Player.prototype.setExp = function(exp) {
	this._exp = exp;	
	this.emit('exp change', exp);
}

Player.prototype.setMaxExp = function(maxExp) {
	this._maxExp = maxExp;	
	this.emit('maxExp change', maxExp);
}

Player.prototype.getX = function() {
	return this._x;
}

Player.prototype.getY = function() {
	return this._y;
}

Player.prototype.getVirtualX = function() {
	return this._virtualX;
}

Player.prototype.getVirtualY = function() {
	return this._virtualY;
}

Player.prototype.getName = function() {
	return this._name;
}

Player.prototype.getMirClass = function() {
	return this._mirClass;
}

Player.prototype.getGender = function() {
	return this._gender;
}

Player.prototype.getGold = function() {
	return this._gold;
}

Player.prototype.getInventory = function() {
	return this._inventory;
}

Player.prototype.getEquipped = function() {
	return this._equipped;
}

Player.prototype.getDirection = function() {
	return this._direction;
}

Player.prototype.getHp = function() {
	return this._hp;
}

Player.prototype.getMp = function() {
	return this._mp;
}

Player.prototype.getMaxHp = function() {
	return this._maxHp;
}

Player.prototype.getMaxMp = function() {
	return this._maxMp;
}

Player.prototype.getExp = function() {
	return this._exp;
}

Player.prototype.getMaxExp = function() {
	return this._maxExp;
}

Player.prototype.getLevel = function() {
	return this._level;
}

Player.prototype.setVirtualLocation = function(diffX, diffY) {
	this._virtualX = this._virtualX + diffX;
	this._virtualY = this._virtualY + diffY;
	this.emit('virtualLocation change', this._virtualX, this._virtualX);	
}

Player.prototype.moveInventoryItemToInventory = function(fromIndex, toIndex) {
	var newItem = this._inventory[fromIndex],
		oldItem = this._inventory[toIndex];

	this._inventory[toIndex] = newItem;
	this._inventory[fromIndex] = oldItem;

	this.emit('inventory change',  fromIndex , oldItem);
	this.emit('inventory change', toIndex, newItem);	
}

Player.prototype.moveInventoryItemToEquipped = function(fromIndex, toBinding) {
	this._equipped[toBinding] = this._inventory[fromIndex];
	this._inventory[fromIndex] = null;

	this.emit('inventory change',  fromIndex , this._inventory[fromIndex]);
	this.emit('equip change', toBinding, this._equipped[toBinding]);	
}

Player.prototype.update = function() {
	this._humanSprite.update();
}

Player.prototype.meleeAttack = function(direction, doneCallback) {
	this._humanSprite.queueAnimation(new AnimationControl({
		//maybe random the attacks?
		action: HumanActionEnum.Attack1,
		direction: direction,
		beginEvent: function() {
			//send attack to server?
		}.bind(this),
		animationCompleteEvent: function(doneCallback) {
			//attack animation done
			doneCallback();
		}.bind(this, doneCallback)
	}));
}

Player.prototype.move = function(distance, direction, beginMoveCallback, cameraMoveCallback, doneCallback, inputReadyCallback) {
	this._humanSprite.queueAnimation(new AnimationControl({
		action: distance === 1 ? HumanActionEnum.Walking : HumanActionEnum.Running,
		direction: direction,
		beginEvent: function(beginMoveCallback) {
			beginMoveCallback();
			this.isMoving = true;
		}.bind(this, beginMoveCallback),
		newFrameEvent: function(cameraMoveCallback, inputReadyCallback, _animationCameraFrame) {
			cameraMoveCallback(distance / 8);
			if(_animationCameraFrame === 6) {
				inputReadyCallback();
			}
		}.bind(this, cameraMoveCallback, inputReadyCallback),
		animationCompleteEvent: function(doneCallback, stillRunning) {
			doneCallback();
			this.isMoving = stillRunning;
		}.bind(this, doneCallback)
	}));
}

module.exports = Player