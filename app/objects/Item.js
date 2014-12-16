var ItemTypeEnum = require('../enums/ItemTypeEnum.js');

function Item( data ) {
	this.name = data.name;
	this.inventoryLook = data.inventoryLook;
	//armour, weapon, helm
	this.equippedLook = data.equippedLook;
	this.spriteLook = data.spriteLook;
	this.description = data.description;
	this.itemType = data.itemType;
	this.restrictions = data.restrictions;
	this.price = data.price;
	this.durability = data.durability;
	this.maxDurability = data.maxDurability;
	this.stats = data.stats;
	this.weight = data.weight

	this.itemSprite = null;
}

Item.prototype.getItemTypeAsSring = function() {
	switch(this.itemType) {
		case ItemTypeEnum.Weapon:
			return "Weapon";
		case ItemTypeEnum.Book:
			return "Book";			
		case ItemTypeEnum.Potion:
			return "Potion";
		case ItemTypeEnum.Torch:
			return "Light";			
		default:
			return "Unknown";
	}
}

module.exports = Item;