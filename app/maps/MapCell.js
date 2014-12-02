function MapCell() {
    this.backIndex = null;
    this.backImage = null;
    this.middleIndex = null;
    this.middleImage = null;
    this.frontIndex = null;
    this.frontImage = null;

    this.doorIndex = null;
    this.doorOffset = null;

    this.frontAnimationFrame = null;
    this.frontAnimationTick = null;

    this.middleAnimationFrame = null;
    this.middleAnimationTick = null;

    this.tileAnimationImage = null;
    this.tileAnimationOffset = null;
    this.tileAnimationFrames = null;

    this.light = null;
    this.unknown = null;
    this.graphic = null;
    this.failed = false;
}

module.exports = MapCell;