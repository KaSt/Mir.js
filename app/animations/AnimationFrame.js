
function AnimationFrame(action, direction, newFrameEvent, animationCompleteEvent) {
	this._direction = direction;
	this._action = action;
	this._newFrameEvent = newFrameEvent;
	this._animationCompleteEvent = animationCompleteEvent;
}

AnimationFrame.prototype.getAction = function() {
	return this._action;
}

AnimationFrame.prototype.getDirection = function() {
	return this._direction;
}

AnimationFrame.prototype.getNewFrameEvent = function() {
	return this._newFrameEvent;
}

AnimationFrame.prototype.getAnimationCompleteEvent = function() {
	return this._animationCompleteEvent;
}

module.exports = AnimationFrame;