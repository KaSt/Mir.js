
function AnimationControl(action, direction, newFrameEvent, animationCompleteEvent) {
	this._direction = direction;
	this._action = action;
	this._newFrameEvent = newFrameEvent;
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

AnimationControl.prototype.getAnimationCompleteEvent = function() {
	return this._animationCompleteEvent;
}

module.exports = AnimationControl;