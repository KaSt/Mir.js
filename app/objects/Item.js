
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

module.exports = Item;