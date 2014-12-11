
function AnimationControl(data) {
	this._direction = data.direction || 0;
	this._action = data.action !== null ? data.action : 0;
	this._newFrameEvent = data.newFrameEvent || null;
	this._beginEvent = data.beginEvent || null;
	this._animationCompleteEvent = data.animationCompleteEvent || null;
}

AnimationControl.prototype.getAction = function() {
	return this._action;
}

AnimationControl.prototype.getDirection = function() {
	return this._direction;
}

AnimationControl.prototype.getNewFrameEvent = function() {
	return this._newFrameEvent;
}

AnimationControl.prototype.getBeginEvent = function() {
	return this._beginEvent;
}

AnimationControl.prototype.getAnimationCompleteEvent = function() {
	return this._animationCompleteEvent;
}

module.exports = AnimationControl;