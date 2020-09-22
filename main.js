/*
All this code is copyright Orteil, 2013-2020.
	-with some help, advice and fixes by Nicholas Laux, Debugbro, Opti, and lots of people on reddit, Discord, and the DashNet forums
	-also includes a bunch of snippets found on stackoverflow.com and others
Hello, and welcome to the joyous mess that is main.js. Code contained herein is not guaranteed to be good, consistent, or sane. Most of this is years old at this point and harkens back to simpler, cruder times. Have a nice trip.
Spoilers ahead.
http://orteil.dashnet.org
*/

var VERSION = 2.029;
var BETA = 0;

function loadScript(fileLocaiton){
	return new Promise(function(resolve, reject) {
		var scriptTag = document.createElement('script');
		scriptTag.src = fileLocaiton;
		scriptTag.onload = resolve;
		document.head.appendChild(scriptTag);
	});
}


//asset-loading system
function Loader() {
	this.loadingN = 0;
	this.assetsN = 0;
	this.assets = [];
	this.assetsLoading = [];
	this.assetsLoaded = [];
	this.domain = '';
	this.loaded = 0; //callback
	this.doneLoading = 0;

	this.blank = document.createElement('canvas');
	this.blank.width = 8;
	this.blank.height = 8;
	this.blank.alt = 'blank';

	this.Load = function (assets) {
		for (var i in assets) {
			this.loadingN++;
			this.assetsN++;
			if (!this.assetsLoading[assets[i]] && !this.assetsLoaded[assets[i]]) {
				var img = new Image();
				img.src = this.domain + assets[i];
				img.alt = assets[i];
				img.onload = bind(this, this.onLoad);
				this.assets[assets[i]] = img;
				this.assetsLoading.push(assets[i]);
			}
		}
	}
	this.Replace = function (old, newer) {
		if (this.assets[old]) {
			var img = new Image();
			if (newer.indexOf('http') != -1) img.src = newer;
			else img.src = this.domain + newer;
			img.alt = newer;
			img.onload = bind(this, this.onLoad);
			this.assets[old] = img;
		}
	}
	this.onLoadReplace = function () {}
	this.onLoad = function (e) {
		this.assetsLoaded.push(e.target.alt);
		this.assetsLoading.splice(this.assetsLoading.indexOf(e.target.alt), 1);
		this.loadingN--;
		if (this.doneLoading == 0 && this.loadingN <= 0 && this.loaded != 0) {
			this.doneLoading = 1;
			this.loaded();
		}
	}
	this.getProgress = function () {
		return (1 - this.loadingN / this.assetsN);
	}
}

function Pic(what) {
	if (Game.Loader.assetsLoaded.indexOf(what) != -1) return Game.Loader.assets[what];
	else if (Game.Loader.assetsLoading.indexOf(what) == -1) Game.Loader.Load([what]);
	return Game.Loader.blank;
}

var Sounds = [];
var OldPlaySound = function (url, vol) {
	var volume = 1;
	if (vol !== undefined) volume = vol;
	if (!Game.volume || volume == 0) return 0;
	if (!Sounds[url]) {
		Sounds[url] = new Audio(url);
		Sounds[url].onloadeddata = function (e) {
			e.target.volume = Math.pow(volume * Game.volume / 100, 2);
		}
	} else if (Sounds[url].readyState >= 2) {
		Sounds[url].currentTime = 0;
		Sounds[url].volume = Math.pow(volume * Game.volume / 100, 2);
	}
	Sounds[url].play();
}

var SoundInsts = [];
var SoundI = 0;
for (var i = 0; i < 12; i++) {
	SoundInsts[i] = new Audio();
}
var pitchSupport = false;
//note : Chrome turns out to not support webkitPreservesPitch despite the specifications claiming otherwise, and Firefox clips some short sounds when changing playbackRate, so i'm turning the feature off completely until browsers get it together
//if (SoundInsts[0].preservesPitch || SoundInsts[0].mozPreservesPitch || SoundInsts[0].webkitPreservesPitch) pitchSupport=true;

function PlaySound(url, vol, pitchVar) {
	//url : the url of the sound to play (will be cached so it only loads once)
	//vol : volume between 0 and 1 (multiplied by game volume setting); defaults to 1 (full volume)
	//(DISABLED) pitchVar : pitch variance in browsers that support it (Firefox only at the moment); defaults to 0.05 (which means pitch can be up to -5% or +5% anytime the sound plays)
	var volume = 1;
	if (typeof vol !== 'undefined') volume = vol;
	if (!Game.volume || volume == 0) return 0;
	if (!Sounds[url]) {
		//sound isn't loaded, cache it
		Sounds[url] = new Audio(url);
		Sounds[url].onloadeddata = function (e) {
			PlaySound(url, vol, pitchVar);
		}
	} else if (Sounds[url].readyState >= 2) {
		var sound = SoundInsts[SoundI];
		SoundI++;
		if (SoundI >= 12) SoundI = 0;
		sound.src = Sounds[url].src;
		//sound.currentTime=0;
		sound.volume = Math.pow(volume * Game.volume / 100, 2);
		if (pitchSupport) {
			var pitchVar = (typeof pitchVar === 'undefined') ? 0.05 : pitchVar;
			var rate = 1 + (Math.random() * 2 - 1) * pitchVar;
			sound.preservesPitch = false;
			sound.mozPreservesPitch = false;
			sound.webkitPreservesPitch = false;
			sound.playbackRate = rate;
		}
		sound.play();
	}
}

if (!Date.now) {
	Date.now = function now() {
		return new Date().getTime();
	};
}

function triggerAnim(element, anim) {
	if (!element) return;
	element.classList.remove(anim);
	void element.offsetWidth;
	element.classList.add(anim);
};

var debugStr = '';
function Debug(what) {
	if (!debugStr) debugStr = what;
	else debugStr += '; ' + what;
}

var Timer = {
	t : Date.now(),
	labels : [],
	smoothed : [],

	reset : function () {
		Timer.labels = [];
		Timer.t = Date.now();
	},

	track : function (label) {
		if (!Game.sesame) return;
		var now = Date.now();
		if (!Timer.smoothed[label]) Timer.smoothed[label] = 0;
		Timer.smoothed[label] += ((now - Timer.t) - Timer.smoothed[label]) * 0.1;
		Timer.labels[label] = '<div style="padding-left:8px;">' + label + ' : ' + Math.round(Timer.smoothed[label]) + 'ms</div>';
		Timer.t = now;
	},

	clean : function () {
		if (!Game.sesame) return;
		var now = Date.now();
		Timer.t = now;
	},

	say : function (label) {
		if (!Game.sesame) return;
		Timer.labels[label] = '<div style="border-top:1px solid #ccc;">' + label + '</div>';
	}
};

/*=====================================================================================
LAUNCH THIS THING
=======================================================================================*/
//try {Game.Launch();}
//catch(err) {console.log('ERROR : '+err.message);}
loadScript("js/game.js")