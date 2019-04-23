/*!
 * Mus.js v1.1.0
 * (c) 2018 Mauricio Giordano <giordano@inevent.us> - InEvent
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Mus = factory());
}(this, (function () { 'use strict';

// Mus default cursor icon based on OSx default cursor
var cursorIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCSB2aWV3Qm94PSIwIDAgMjggMjgiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI4IDI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj48cG9seWdvbiBmaWxsPSIjRkZGRkZGIiBwb2ludHM9IjguMiwyMC45IDguMiw0LjkgMTkuOCwxNi41IDEzLDE2LjUgMTIuNiwxNi42ICIvPjxwb2x5Z29uIGZpbGw9IiNGRkZGRkYiIHBvaW50cz0iMTcuMywyMS42IDEzLjcsMjMuMSA5LDEyIDEyLjcsMTAuNSAiLz48cmVjdCB4PSIxMi41IiB5PSIxMy42IiB0cmFuc2Zvcm09Im1hdHJpeCgwLjkyMjEgLTAuMzg3MSAwLjM4NzEgMC45MjIxIC01Ljc2MDUgNi41OTA5KSIgd2lkdGg9IjIiIGhlaWdodD0iOCIvPjxwb2x5Z29uIHBvaW50cz0iOS4yLDcuMyA5LjIsMTguNSAxMi4yLDE1LjYgMTIuNiwxNS41IDE3LjQsMTUuNSAiLz48L3N2Zz4=';

/**
 * Mus constructor that defines initial variables and
 * sets browser width and height.
 * @knownbug: if user decides to change browser window size on-the-go
 * 		it may cause bugs during playback
 */
function Mus() {
	if (this === undefined) {
		console.error('Have you initialized Mus with "new" statement? (i.e. var mus = new Mus())');
		return;
	}
	this.frames = [];
	this.timeouts = [];
	this.pos = 0;
	this.currPos = 0;
	this.startedAt = 0;
	this.finishedAt = 0;
	this.timePoint = false;
	this.recording = false;
	this.playing = false;
	this.playbackSpeed = this.speed.NORMAL;
	this.window = {
		width : window.outerWidth,
		height : window.outerHeight
	};

	// Stores initial listeners
	this.onmousemove = window.onmousemove;
	this.onmousedown = window.onmousedown;
	this.onscroll = window.onscroll;
};

/**
 * Here goes all Mus magic
 */
Mus.prototype = {
	
	/** Mus Listeners **/

	/**
	 * Listener intended to be used with onmousemove
	 * @param callback function a callback fnc
	 * @return function the mouse move listener
	 */
	moveListener : function(callback) {
		return function(e) {
			if (callback) callback(['m', e.clientX, e.clientY]);
		}
	},

	/**
	 * Listener intended to be used with onmousedown
	 * @param callback function a callback fnc
	 * @return function the mouse click listener
	 */
	clickListener : function(callback) {
		return function(e) {
			if (callback) callback(['c', e.clientX, e.clientY]);
		}
	},

	/**
	 * Listener intended to be used with onscroll
	 * @param callback function a callback fnc
	 * @return function the window scroll listener
	 */
	scrollListener : function(callback) {
		return function(e) {
			if (callback) callback(['s', document.scrollingElement.scrollLeft, document.scrollingElement.scrollTop]);
		}
	},

	/** Mus recording tools **/

	/**
	 * Starts screen recording
	 */
	record : function(onFrame) {
		if (this.recording) return;

		var self = this;
		if (self.startedAt == 0) self.startedAt = new Date().getTime() / 1000;

		// Sets initial scroll position of the window
		self.frames.push(['s', document.scrollingElement.scrollLeft, document.scrollingElement.scrollTop]);
		
		// Defines Mus listeners on window
		window.onmousemove = this.moveListener(function(pos) {
			self.frames.push(self.timePoint ? pos.concat(new Date().getTime() - (self.startedAt * 1000)) : pos);
			if (onFrame instanceof Function) onFrame();
		});
		window.onmousedown = this.clickListener(function(click) {
			self.frames.push(self.timePoint ? click.concat(new Date().getTime() - (self.startedAt * 1000)) : click);
			if (onFrame instanceof Function) onFrame();
		});
		window.onscroll = this.scrollListener(function(scroll) {
			self.frames.push(self.timePoint ? scroll.concat(new Date().getTime() - (self.startedAt * 1000)) : scroll);
			if (onFrame instanceof Function) onFrame();
		});

		// Sets our recording flag
		self.recording = true;
	},

	/**
	 * Stops screen recording
	 */
	stop : function() {
		this.finishedAt = new Date().getTime() / 1000;
		window.onmousemove = this.onmousemove;
		window.onmousedown = this.onmousedown;
		window.onscroll = this.onscroll;

		// Sets our recording flag
		this.timeouts = [];
		this.recording = false;
		this.playing = false;
		this.pos = 0;
	},

	/**
	 * Pauses current execution
	 */
	pause : function() {
		if (this.playing) {
			this.pos = this.currPos;
			this.playing = false;
			this.clearTimeouts();
		}
	},

	/**
	 * Runs a playback of a recording
	 * @param function onfinish a callback function
	 */
	play : function(onfinish) {
		if (this.playing) return;

		var self = this;
		self.createCursor();

		var node = document.getElementById("musCursor");

		for (; self.pos < self.frames.length; self.pos++) {
			var delay = self.frames[self.pos].length > 3 ?
				self.frames[self.pos][3] : self.pos * self.playbackSpeed;

			self.timeouts.push(setTimeout(function(pos) {

				// Plays specific timeout
				self.playFrame(self, self.frames[pos], node);
				self.currPos = pos;

				if (pos == self.frames.length - 1) {
					node.style.backgroundColor = "transparent";
					self.timeouts = [];
					self.playing = false;
					self.pos = 0;
					if (onfinish) onfinish();
				}
			}, delay, self.pos));
		};

		this.playing = true;
	},

	/**
	 * Releases Mus instance
	 */
	release : function() {
		this.frames = [];
		this.startedAt = 0;
		this.finishedAt = 0;
		this.stop();
		this.destroyCursor();
		this.destroyClickSnapshot();
	},

	/** Mus internal functions **/

	/**
	 * Play a specific frame from playback
	 */
	playFrame : function(self, frame, node) {

		if (frame[0] == 'm') {
			node.style.left = self.getXCoordinate(frame[1]) + "px";
			node.style.top = self.getYCoordinate(frame[2]) + "px";

		} else if (frame[0] == 'c') {
			self.createClickSnapshot(frame[2], frame[1]);

		} else if (frame[0] == 's') {
			window.scrollTo(frame[1], frame[2]);

		}
	},

	/**
	 * Clears all timeouts stored
	 */
	clearTimeouts : function() {
		for (var i in this.timeouts) {
			clearTimeout(this.timeouts[i]);
		}

		this.timeouts = [];
	},

	/**
	 * Calculates time elapsed during recording
	 * @return integer time elapsed
	 */
	timeElapsed : function() {
		return this.finishedAt - this.startedAt;
	},

	/**
	 * Creates Mus cursor if non-existent
	 */
	createCursor : function() {
		if (!document.getElementById("musCursor")) {
			var node = document.createElement("div");
			node.id = "musCursor";
			node.style.position = "fixed";
			node.style.width = "32px";
			node.style.height = "32px";
			node.style.top = "-100%";
			node.style.left = "-100%";
			node.style.borderRadius = "32px";
			node.style.backgroundImage = "url(" + cursorIcon + ")";
			document.body.appendChild(node);
		}
	},

	/**
	 * Destroys Mus cursor
	 */
	destroyCursor : function() {
		var cursor = document.getElementById("musCursor");
		if (cursor) cursor.remove();
	},

	/**
	 * Creates Mus click snapshot
	 */
	createClickSnapshot : function(x, y) {
		var left = document.scrollingElement.scrollLeft;
		var top = document.scrollingElement.scrollTop;
		var node = document.createElement("div");
		node.className = "musClickSnapshot";
		node.style.position = "absolute";
		node.style.width = "32px";
		node.style.height = "32px";
		node.style.top = (x + top) + "px";
		node.style.left = (y + left) + "px";
		node.style.borderRadius = "32px";
		node.style.backgroundColor = "red";
		node.style.opacity = 0.2;
		document.body.appendChild(node);
	},

	/**
	 * Destroys Mus click snapshot
	 */
	destroyClickSnapshot : function() {
		var nodes = document.getElementsByClassName("musClickSnapshot");
		while (nodes.length > 0) {
			nodes[0].remove();
		}
	},

	/**
	 * Calculates current X coordinate of mouse based on window dimensions provided
	 * @param x integer the x position
	 * @return integer calculated x position
	 */
	getXCoordinate : function(x) {
		if (window.outerWidth > this.window.width) {
			return parseInt(this.window.width * x / window.outerWidth);
		}

		return parseInt(window.outerWidth * x / this.window.width);
	},

	/**
	 * Calculates current Y coordinate of mouse based on window dimensions provided
	 * @param y integer the y position
	 * @return integer calculated y position
	 */
	getYCoordinate : function(y) {
		if (window.outerHeight > this.window.height) {
			return parseInt(this.window.height * y / window.outerHeight);
		}

		return parseInt(window.outerHeight * y / this.window.height);
	},

	/** Public getters and setters **/

	/**
	 * Get all generated Mus data
	 * @return array generated Mus data
	 */
	getData : function() {
		return {
			frames : this.frames,
			timeElapsed : this.timeElapsed(),
			window : {
				width : window.outerWidth,
				height : window.outerHeight
			}
		};
	},

	/**
	 * Get point time recording flag
	 * @return boolean point time flag
	 */
	isTimePoint : function() {
		return this.timePoint;
	},

	/**
	 * Sets generated Mus data for playback
	 * @param data array generated Mus data
	 */
	setData : function(data) {
		if (data.frames) this.frames = data.frames;
		if (data.window) this.window = data.window;
	},

	/**
	 * Sets recorded frames for playback
	 * @param frames array the frames array
	 */
	setFrames : function(frames) {
		this.frames = frames;
	},

	/**
	 * Sets custom window size for playback
	 * @param width integer window width
	 * @param height integer window height
	 */
	setWindowSize : function(width, height) {
		this.window.width = width;
		this.window.height = height;
	},

	/**
	 * Sets a playback speed based on Mus speed set
	 * @param speed integer the playback speed
	 */
	setPlaybackSpeed : function(speed) {
		this.playbackSpeed = speed;
	},

	/**
	 * Sets point time recording for accurate data
	 * @param 
	 */
	setTimePoint : function(timePoint) {
		this.timePoint = timePoint;
	},

	/**
	 * Informs if Mus is currently recording
	 * @return boolean is recording?
	 */
	isRecording : function() {
		return this.recording;
	},

	/**
	 * Informs if Mus is currently playing
	 * @return boolean is playing?
	 */
	isPlaying : function() {
		return this.playing;
	},

	/** Mus speed constants **/

	speed : {
		SLOW : 35,
		NORMAL : 15,
		FAST : 5
	}

};

return Mus;

})));