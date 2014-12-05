var GameService = require('./services/GameService.js');
var PIXI = require('pixi.js');
require('../fpsmeter.min.js');

function Renderer(appContainer) {
	this._stopped = false;
	this._renderer = null;
	this._appContainer = appContainer;
	this._init();
	this._fpsMeter = new FPSMeter();
}

Renderer.prototype._init = function() {
	this._renderer = new PIXI.WebGLRenderer(1024, 768);
	this._appContainer.appendChild(this._renderer.view);
	this._render();
}

Renderer.prototype._render = function() {

	var loop = function loop() {
		var scene = GameService.scene;

		this._fpsMeter.tick();
		this._fpsMeter.tickStart();

		//if the renderer has stopped
		if(this._stopped === true) {
			return;
		}

		if(scene !== null) {
			scene.process().then(this._renderSceneStage.bind(this, loop));
			return;
		};

		requestAnimationFrame(loop.bind(this));

	}.bind(this);

	requestAnimationFrame(loop.bind(this));
}

Renderer.prototype._renderSceneStage = function(loop, stage) {
	this._renderer.render(stage);	
	requestAnimationFrame(loop.bind(this));
}

Renderer.prototype.start = function() {
	this._stopped = false;
}

Renderer.prototype.end = function() {
	this._stopped = true;
}

module.exports = Renderer;