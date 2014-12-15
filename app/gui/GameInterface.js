var GameService = require('../services/GameService.js');
var InputService = require('../services/InputService.js');
var Draggabilly = require('Draggabilly');
var ItemTypeEnum = require('../enums/ItemTypeEnum.js');

function GameInterface(appContainer) {
	this._appContainer = appContainer;

	this._gameInterfaceContainer = null;
	this._bottomInterface = null;
	this._miniMapContainer = null;
	this._inventoryContainer = null;
	this._chatContainer = null;
	this._coordsLabel = null;
	this._debugLabel = null;
	this._levelLabel = null;
	this._goldLabel = null;
	this._hpMpLabel = null;
	this._hpBar = null;
	this._mpBar = null;
	this._expBar = null;
	this._characterButton = null;
	this._inventoryContainerGrid = [];
	this._inventoryContainerEquip = {};
	this._draggingItem = false;
	this._draggingInventoryGridItem = null;

	this._init();
}

GameInterface.prototype._init = function() {
	this._gameInterfaceContainer = document.createElement('div');
	this._gameInterfaceContainer.id = "game-interface-container";

	this._appContainer.appendChild(this._gameInterfaceContainer);

	this._initBottomInterface();
	this._initCoordsLabel();
	this._initMiniMapContainer();
	this._initInventoryContainer();
}

GameInterface.prototype._initInventoryContainer = function() {
	this._inventoryContainer = document.createElement('div');
	this._inventoryContainer.id = "inventory-container";
	this._inventoryContainer.excludeFromInput = true;

	this._gameInterfaceContainer.appendChild(this._inventoryContainer);

	var inventoryTitleLabel = document.createElement('div');
	inventoryTitleLabel.classList.add("inventory-title-label");
	inventoryTitleLabel.innerHTML = "My Inventory"	

	this._inventoryContainer.appendChild(inventoryTitleLabel);

	InputService.on('keyup', function(keycode) {
		if(keycode === 73 || keycode === 67) {
			this._toggleInventoryContainer();
		}
	}.bind(this));

	this._initInventoryContainerHeader();
	this._initInventoryContainerCloseButton();
	this._initInventoryContainerPlayer();
	this._initInventoryContainerGoldLabel();
	this._initInventoryContainerGrid();
	this._initInventoryContainerEquip();
}

GameInterface.prototype._initInventoryContainerEquip = function() {

	var inventoryEquip = document.createElement('div');
	inventoryEquip.id = 'inventory-equip';
	inventoryEquip.excludeFromInput = true;

	this._createInventoryEquipItem(inventoryEquip, 4, 51, ItemTypeEnum.Weapon, 'weapon');
	this._createInventoryEquipItem(inventoryEquip, 4, 101, ItemTypeEnum.Armour, 'armour');
	this._createInventoryEquipItem(inventoryEquip, 4, 152, ItemTypeEnum.Bracelet, 'bracelet1');
	this._createInventoryEquipItem(inventoryEquip, 4, 203, ItemTypeEnum.Ring, 'ring1');
	this._createInventoryEquipItem(inventoryEquip, 4, 254, ItemTypeEnum.Belt, 'belt');
	this._createInventoryEquipItem(inventoryEquip, 56, 254, ItemTypeEnum.Amulet, 'amulet');
	this._createInventoryEquipItem(inventoryEquip, 160, 254, ItemTypeEnum.Gem, 'gem');
	this._createInventoryEquipItem(inventoryEquip, 262, 254, ItemTypeEnum.Boots, 'boots');
	this._createInventoryEquipItem(inventoryEquip, 262, 203, ItemTypeEnum.Boots, 'ring2');
	this._createInventoryEquipItem(inventoryEquip, 262, 152, ItemTypeEnum.Boots, 'bracelet1');
	this._createInventoryEquipItem(inventoryEquip, 262, 101, ItemTypeEnum.Torch, 'torch');
	this._createInventoryEquipItem(inventoryEquip, 262, 51, ItemTypeEnum.Necklace, 'necklace');
	this._createInventoryEquipItem(inventoryEquip, 262, 0, ItemTypeEnum.Helmet, 'helmet');

	this._inventoryContainer.appendChild(inventoryEquip);
}

GameInterface.prototype._createInventoryEquipItem = function(inventoryEquip, x, y, itemType, binding) {
	this._inventoryContainerEquip[binding] = document.createElement('div');
	this._inventoryContainerEquip[binding].classList.add('inventory-equip-item');
	this._inventoryContainerEquip[binding].dataset.id = binding;
	this._inventoryContainerEquip[binding].style.left = x + 'px';
	this._inventoryContainerEquip[binding].style.top = y + 'px';
	this._inventoryContainerEquip[binding].excludeFromInput = true;

	inventoryEquip.appendChild(this._inventoryContainerEquip[binding]);
}

GameInterface.prototype._initInventoryContainerGrid = function() {

	var inventoryGrid = document.createElement('div');
	inventoryGrid.id = 'inventory-grid';
	inventoryGrid.excludeFromInput = true;

	//bind the grid with the player inventory
	var bindGridWithPlayerInventory = function(index) {
		var item = GameService.player.getInventory()[index];
		
		if(item != null) {
			this._inventoryContainerGrid[index].children[0].style.backgroundImage = 'url("gui/inventory/' + item.inventoryLook  + '.png")';
			this._inventoryContainerGrid[index].children[0].style.display = 'block';
		} else {
			this._inventoryContainerGrid[index].children[0].style.display = 'none';
		}
	}.bind(this);

	inventoryGrid.addEventListener('click', this._inventoryClickEvent.bind(this), true);

	for(var i = 0 ; i < 40; i++) {
		this._inventoryContainerGrid[i] = document.createElement('div');
		this._inventoryContainerGrid[i].classList.add('inventory-grid-item');
		this._inventoryContainerGrid[i].dataset.id = i;
		this._inventoryContainerGrid[i].excludeFromInput = true;

		var inventoryItem = document.createElement('div');
		inventoryItem.excludeFromInput = true;
		inventoryItem.classList.add('item');
		this._inventoryContainerGrid[i].appendChild(inventoryItem);

		bindGridWithPlayerInventory(i);

		inventoryGrid.appendChild(this._inventoryContainerGrid[i]);
	}

	GameService.player.on('inventory change', bindGridWithPlayerInventory)

	this._inventoryContainer.appendChild(inventoryGrid);
}

GameInterface.prototype._inventoryClickEvent = function(event) {
	var item = null;
	//make sure we are clicking one of inventory slots
	if(event.target.classList.contains('inventory-grid-item')) {
		item = GameService.player.getInventory()[event.target.dataset.id];
		if(item != null && this._draggingItem === false) {
			this._dragItem(item, event.target.children[0]);
		} else if(this._draggingItem === true) {	
			this._dropItem(event.target.children[0]);
		}
	}

	if(event.target.classList.contains('item')) {
		item = GameService.player.getInventory()[event.target.parentElement.dataset.id];
		if(item != null && this._draggingItem === false) {
			this._dragItem(item, event.target);
		} else if(this._draggingItem === true) {	
			this._dropItem(event.target);
		}	
	}
}

GameInterface.prototype._dragItem = function(item, inventoryGridItem) {
	this._draggingItem = true;
	inventoryGridItem.style.display = "none";
	this._draggingInventoryGridItem = inventoryGridItem; 
	document.body.style.cursor = inventoryGridItem.style.backgroundImage + ", pointer";
}

GameInterface.prototype._dropItem = function(inventoryGridItem) {
	this._draggingItem = false;
	document.body.style.cursor = "";
	GameService.player.moveInventoryItem(
		this._draggingInventoryGridItem.parentElement.dataset.id, 
		inventoryGridItem.parentElement.dataset.id
	);
}

GameInterface.prototype._initInventoryContainerGoldLabel = function() {
	//Cords label
	this._goldLabel = document.createElement('div');
	this._goldLabel.id = "gold-label";

	var updateLabelText = function() {
		this._goldLabel.innerHTML = GameService.player.getGold().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}.bind(this);

	GameService.player.on('gold change', updateLabelText)

	//update label
	updateLabelText();

	this._inventoryContainer.appendChild(this._goldLabel);
}

GameInterface.prototype._initInventoryContainerPlayer = function() {
	var playerLook = document.createElement('div');
	playerLook.classList.add("player");
	playerLook.style.backgroundImage = "url('gui/looks/0.png')"
	playerLook.excludeFromInput = true;

	this._inventoryContainer.appendChild(playerLook);
}

GameInterface.prototype._initInventoryContainerCloseButton = function() {
	var closeButton = document.createElement('button');
	closeButton.classList.add("close-button");
	closeButton.excludeFromInput = true;

	closeButton.addEventListener('click', this._toggleInventoryContainer.bind(this), true);

	this._inventoryContainer.appendChild(closeButton);
}

GameInterface.prototype._initInventoryContainerHeader = function() {
	var header = document.createElement('header');
	header.classList.add("header");
	header.excludeFromInput = true;
	this._inventoryContainer.appendChild(header);

	var headerPlayerName = document.createElement('span');
	headerPlayerName.classList.add("player-name");
	headerPlayerName.excludeFromInput = true;
	headerPlayerName.innerHTML = GameService.player.getName();
	header.appendChild(headerPlayerName);

	var headerPlayerDetails = document.createElement('span');
	headerPlayerDetails.classList.add("player-details");
	headerPlayerDetails.excludeFromInput = true;
	headerPlayerDetails.innerHTML = 'Level ' + GameService.player.getLevel() + ' ' + GameService.player.getMirClassToString();
	header.appendChild(headerPlayerDetails);


	var draggie = new Draggabilly(this._inventoryContainer, {
		handle: '.header'
	});
}

GameInterface.prototype._initBottomInterface = function() {

	this._bottomInterface = document.createElement('div');
	this._bottomInterface.id = "bottom-interface";
	this._bottomInterface.excludeFromInput = true;

	this._gameInterfaceContainer.appendChild(this._bottomInterface);

	this._characterButton = document.createElement('button');
	this._characterButton.id = "character-button";
	this._characterButton.excludeFromInput = true;

	this._characterButton.addEventListener('click', this._toggleInventoryContainer.bind(this), true);

	this._bottomInterface.appendChild(this._characterButton);

	this._initExpBar();
	this._initHpBar();
	this._initMpBar();
}

GameInterface.prototype._toggleInventoryContainer = function(event) {
	this._inventoryContainer.classList.toggle("visible");
	if(event) {
		event.stopPropagation();
		event.preventDefault();
	}
}

GameInterface.prototype._initExpBar = function() {
	this.expBar = document.createElement('div');
	this.expBar.id = "exp-bar";
	this.expBar.excludeFromInput = true;

	var updateBar = function() {

		this.expBar.style.width = Math.round(GameService.player.getExp() / GameService.player.getMaxExp() * 536) + "px";

	}.bind(this);

	GameService.player.on('exp change', updateBar)
	GameService.player.on('maxExp change', updateBar)	

	updateBar();

	this._bottomInterface.appendChild(this.expBar);
}

GameInterface.prototype._initChatContainer = function() {
	this._chatContainer = document.createElement('div');
	this._chatContainer.id = "chat-container";

	this._bottomInterface.appendChild(this._chatContainer);
}

GameInterface.prototype._initMiniMapContainer = function() {
	this._miniMapContainer = document.createElement('div');
	this._miniMapContainer.id = "mini-map-container";
	this._miniMapContainer.excludeFromInput = true;

	var minimapFrame = document.createElement('div');
	minimapFrame.id = "frame";

	var minimapMap = document.createElement('div');
	minimapMap.id = "map";
	minimapMap.style.backgroundImage = "url('gui/minimap/0.jpg')";


	var updateMapPosition = function() {
		var positionX = Math.round(GameService.player.getX() / GameService.scene.getMap().getWidth() * 1052) - 85;
		var positionY = Math.round(GameService.player.getY() / GameService.scene.getMap().getHeight() * 699) - 85;

		minimapMap.style.backgroundPosition = "-" + positionX + "px -" + positionY + "px";
	}.bind(this);

	GameService.player.on('location change', updateMapPosition)

	updateMapPosition();

	this._miniMapContainer.appendChild(minimapMap);
	this._miniMapContainer.appendChild(minimapFrame);
	this._gameInterfaceContainer.appendChild(this._miniMapContainer);
}

GameInterface.prototype._initHpBar = function() {
	this._hpBar = document.createElement('div');
	this._hpBar.id = "hp-bar";
	this._hpBar.excludeFromInput = true;

	var updateHpBar = function() {
		this._hpBar.style.height = parseInt(GameService.player.getHp() / GameService.player.getMaxHp() * 102) + 'px';
	}.bind(this);

	GameService.player.on('hp change', updateHpBar)

	updateHpBar();

	this._bottomInterface.appendChild(this._hpBar);
}

GameInterface.prototype._initMpBar = function() {
	this._mpBar = document.createElement('div');
	this._mpBar.id = "mp-bar";
	this._mpBar.excludeFromInput = true;
	
	var updateMpBar = function() {
		this._mpBar.style.height = parseInt(GameService.player.getMp() / GameService.player.getMaxMp() * 102) + 'px';
	}.bind(this);

	GameService.player.on('mp change', updateMpBar)

	updateMpBar();

	this._bottomInterface.appendChild(this._mpBar);
}


GameInterface.prototype._initCoordsLabel = function() {
	//Cords label
	this._coordsLabel = document.createElement('div');
	this._coordsLabel.id = "coords-label";

	var updateLabelText = function() {
		this._coordsLabel.innerHTML = '<span>' + GameService.map.name + '</span><em>' + GameService.player.getX() + ':' + GameService.player.getY() + '</em>';	
	}.bind(this);

	GameService.player.on('location change', updateLabelText)

	//update label
	updateLabelText();

	this._gameInterfaceContainer.appendChild(this._coordsLabel);
}

GameInterface.prototype._initLevelLabel = function() {
	//Cords label
	this._levelLabel = document.createElement('div');
	this._levelLabel.id = "level-label";

	var updateLabelText = function() {
		this._levelLabel.innerHTML = GameService.player.getLevel();
	}.bind(this);

	GameService.player.on('level change', updateLabelText)

	//update label
	updateLabelText();

	this._bottomInterface.appendChild(this._levelLabel);
}

module.exports = GameInterface;