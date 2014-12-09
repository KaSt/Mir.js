
function AnimationControl(action, direction, beginEvent, newFrameEvent, animationCompleteEvent) {
	this._direction = direction;
	this._action = action;
	this._newFrameEvent = newFrameEvent;
	this._beginEvent = beginEvent;
	this._animationCompleteEvent = animationCompleteEvent;
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