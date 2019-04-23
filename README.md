
<p align="center"><img width="100" height="100" src="https://i.imgur.com/6QGo4Zn.jpg"/></p>

[![GitHub license](https://img.shields.io/github/license/ineventapp/musjs.svg)](https://github.com/ineventapp/musjs/blob/master/LICENSE)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

# mus.js
A simple mouse tracking library to provide insights on how your users are handling your layout / user experience.

This library was created so you don't need an external service to "record" your users mouse events and "play" them in a later moment.

**mus** works with any AMD you wish and its setup is extremely simple - **5.6kb**

## Recording
```js
// Instantiate a mus object
var mus = new Mus();

// Start recording
mus.record();

// After a while, stops
setTimeout(function() {
  mus.stop();
}, 5000);
```

## Playing
```js
// Sets playback speed (optional, default NORMAL)
mus.setPlaybackSpeed(mus.speed.SLOW);

// Starts playing and enjoy
mus.play();
```

## Example


<img height="300" src="https://i.imgur.com/GCYD9EP.gif"/>


## Public methods

### Controls

#### record()
Starts a recording session for current screen. If there is already a session recorded, it appends to it.

#### stop()
Stops a recording or a playback.

#### play(onfinish)
Plays current recording session.

#### pause()
Pauses current playback.

#### release()
Releases all data recorded or set.


### Getters and setters

#### getData()
Returns all data collected during recording.

#### setData(data)
Sets custom data for playback. It must be a JSON object collected from `getData`.

#### setFrames(frames)
Same as `setData`, but allows only to set the `frames` array.

#### setWindowSize(width, height)
During recording, all data collected contains window dimensions as well, so if your recorded data comes from a different window dimension, **mus** automatically adapts to current window size. This function allows you to set a custom playback window size if you decide to use `setFrames` instead of `setData` (that already sets windows dimensions).

#### setPlaybackSpeed(speed)
Allows playback to be faster or slower.
Default constants: `mus.speed.SLOW` (35), `mus.speed.NORMAL` (15), `mus.speed.FAST` (5)
You may decide to use custom values as you wish.

#### setTimePoint(bool)
Records time elapsed for each point for a precise data recording.
Default: disabled

#### isRecording()
Informs if **mus** is currently recording something.

#### isPlaying()
Informs if **mus** is currently playing something.

#### isTimePoint()
Informs if **mus** is recording time for each data point.

# Roadmap
- Detect touch movements and clicks;
- Get form inputs;
- Allows real clicks during setup (default false);
- Suggestions are greatly appreciated!

# Version history

## v1.1.0
- Added time point recording for precise data;

## v1.0.1
- Added minified file for distribution;

# License
MIT
