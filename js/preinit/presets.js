/*=====================================================================================
	VARIABLES AND PRESETS
=======================================================================================*/
Game.T = 0;
Game.drawT = 0;
Game.loopT = 0;
Game.fps = 60;
// BOLLOCKS

Game.season = Game.baseSeason;

Game.l = l('game');
Game.bounds = 0; //rectangle defining screen limits (right,left,bottom,top) updated every logic frame

if (Game.mobile == 1) {
    l('wrapper').className = 'mobile';
}
Game.clickStr = Game.touchEvents ? 'ontouchend' : 'onclick';

Game.SaveTo = 'CookieClickerGame';
if (Game.beta) Game.SaveTo = 'CookieClickerGameBeta';
l('versionNumber').innerHTML = 'v. ' + Game.version + '<div id="httpsSwitch" style="cursor:pointer;display:inline-block;background:url(assets/img/' + (Game.https ? 'lockOn' : 'lockOff') + '.png);width:16px;height:16px;position:relative;top:4px;left:0px;margin:0px -2px;"></div>' + (Game.beta ? ' <span style="color:#ff0;">beta</span>' : '');

if (Game.beta) {
    var me = l('linkVersionBeta');
    me.parentNode.removeChild(me);
} else if (Game.version == 1.0466) {
    var me = l('linkVersionOld');
    me.parentNode.removeChild(me);
} else {
    var me = l('linkVersionLive');
    me.parentNode.removeChild(me);
}

//l('links').innerHTML=(Game.beta?'<a href="../" target="blank">Live version</a> | ':'<a href="beta" target="blank">Try the beta!</a> | ')+'<a href="http://orteil.dashnet.org/experiments/cookie/" target="blank">Classic</a>';
//l('links').innerHTML='<a href="http://orteil.dashnet.org/experiments/cookie/" target="blank">Cookie Clicker Classic</a>';

Game.lastActivity = Date.now(); //reset on mouse move, key press or click

//latency compensator stuff
Game.time = Date.now();
Game.accumulatedDelay = 0;
Game.delayTimeouts = 0; //how many times we've gone over the timeout delay
Game.catchupLogic = 0;
Game.fpsStartTime = 0;
Game.frameNumber = 0;
Game.currentFps = Game.fps;
Game.previousFps = Game.currentFps;
Game.getFps = function () {
    Game.frameNumber++;
    var currentTime = (Date.now() - Game.fpsStartTime) / 1000;
    var result = Math.floor((Game.frameNumber / currentTime));
    if (currentTime > 1) {
        Game.fpsStartTime = Date.now();
        Game.frameNumber = 0;
    }
    return result;
}

Game.cookiesEarned = 0; //all cookies earned during gameplay
Game.cookies = 0; //cookies
Game.cookiesd = 0; //cookies display
Game.cookiesPs = 1; //cookies per second (to recalculate with every new purchase)
Game.cookiesPsRaw = 0; //raw cookies per second
Game.cookiesPsRawHighest = 0; //highest raw cookies per second this ascension
Game.cookiesReset = 0; //cookies lost to resetting (used to determine prestige and heavenly chips)
Game.cookieClicks = 0; //+1 for each click on the cookie
Game.goldenClicks = 0; //+1 for each golden cookie clicked (all time)
Game.goldenClicksLocal = 0; //+1 for each golden cookie clicked (this game only)
Game.missedGoldenClicks = 0; //+1 for each golden cookie missed
Game.handmadeCookies = 0; //all the cookies made from clicking the cookie
Game.milkProgress = 0; //you gain a little bit for each achievement. Each increment of 1 is a different milk displayed.
Game.milkH = Game.milkProgress / 2; //milk height, between 0 and 1 (although should never go above 0.5)
Game.milkHd = 0; //milk height display
Game.milkType = 0; //custom milk
Game.bgType = 0; //custom background
Game.chimeType = 0; //golden cookie chime
Game.prestige = 0; //prestige level (recalculated depending on Game.cookiesReset)
Game.heavenlyChips = 0; //heavenly chips the player currently has
Game.heavenlyChipsDisplayed = 0; //ticks up or down to match Game.heavenlyChips
Game.heavenlyChipsSpent = 0; //heavenly chips spent on cookies, upgrades and such
Game.heavenlyCookies = 0; //how many cookies have we baked from chips (unused)
Game.permanentUpgrades = [-1, -1, -1, -1, -1];
Game.ascensionMode = 0; //type of challenge run if any
Game.resets = 0; //reset counter
Game.lumps = -1; //sugar lumps
Game.lumpsTotal = -1; //sugar lumps earned across all playthroughs (-1 means they haven't even started yet)
Game.lumpT = Date.now(); //time when the current lump started forming
Game.lumpRefill = 0; //time left before a sugar lump can be used again (on minigame refills etc) in logic frames

Game.makeSeed = function () {
    var chars = 'abcdefghijklmnopqrstuvwxyz'.split('');
    var str = '';
    for (var i = 0; i < 5; i++) {
        str += choose(chars);
    }
    return str;
}
Game.seed = Game.makeSeed(); //each run has its own seed, used for deterministic random stuff

Game.volume = 50; //sound volume

Game.elderWrath = 0;
Game.elderWrathOld = 0;
Game.elderWrathD = 0;
Game.pledges = 0;
Game.pledgeT = 0;
Game.researchT = 0;
Game.nextResearch = 0;
Game.cookiesSucked = 0; //cookies sucked by wrinklers
Game.cpsSucked = 0; //percent of CpS being sucked by wrinklers
Game.wrinklersPopped = 0;
Game.santaLevel = 0;
Game.reindeerClicked = 0;
Game.seasonT = 0;
Game.seasonUses = 0;
Game.dragonLevel = 0;
Game.dragonAura = 0;
Game.dragonAura2 = 0;

Game.fortuneGC = 0;
Game.fortuneCPS = 0;

Game.blendModesOn = (document.createElement('detect').style.mixBlendMode === '');

Game.bg = ''; //background (grandmas and such)
Game.bgFade = ''; //fading to background
Game.bgR = 0; //ratio (0 - not faded, 1 - fully faded)
Game.bgRd = 0; //ratio displayed

Game.windowW = window.innerWidth;
Game.windowH = window.innerHeight;

window.addEventListener('resize', function (event) {
    Game.windowW = window.innerWidth;
    Game.windowH = window.innerHeight;

    for (var i in Game.Objects) {
        var me = Game.Objects[i];
        me.toResize = true;
        if (me.minigame && me.minigame.onResize) me.minigame.onResize();
    }
});

Game.startDate = Game.fullDate = Game.lastDate = parseInt(Date.now());
//when we started playing
//when we started playing (carries over with resets)
//when we last saved the game (used to compute "cookies made since we closed the game" etc)

Game.prefs = [];
Game.DefaultPrefs = function () {
    Game.prefs.particles = 1; //particle effects : falling cookies etc
    Game.prefs.numbers = 1; //numbers that pop up when clicking the cookie
    Game.prefs.autosave = 1; //save the game every minute or so
    Game.prefs.autoupdate = 1; //send an AJAX request to the server every 30 minutes (note : ignored)
    Game.prefs.milk = 1; //display milk
    Game.prefs.fancy = 1; //CSS shadow effects (might be heavy on some browsers)
    Game.prefs.warn = 0; //warn before closing the window
    Game.prefs.cursors = 1; //display cursors
    Game.prefs.focus = 1; //make the game refresh less frequently when off-focus
    Game.prefs.popups = 0; //use old-style popups
    Game.prefs.format = 0; //shorten numbers
    Game.prefs.notifs = 0; //notifications fade faster
    Game.prefs.animate = 1; //animate buildings
    Game.prefs.wobbly = 1; //wobbly cookie
    Game.prefs.monospace = 0; //alt monospace font for cookies
    Game.prefs.filters = 0; //CSS filter effects (might be heavy on some browsers)
    Game.prefs.cookiesound = 1; //use new cookie click sound
    Game.prefs.crates = 0; //show crates around icons in stats
    Game.prefs.altDraw = 0; //use requestAnimationFrame to update drawing instead of fixed 30 fps setTimeout
    Game.prefs.showBackupWarning = 1; //if true, show a "Have you backed up your save?" message on save load; set to false when save is exported
    Game.prefs.extraButtons = 1; //if true, show Mute buttons and the building master bar
    Game.prefs.askLumps = 0; //if true, show a prompt before spending lumps
    Game.prefs.customGrandmas = 1; //if true, show patreon names for grandmas
    Game.prefs.timeout = 0; //if true, game may show pause screen when timed out
}
Game.DefaultPrefs();

window.onbeforeunload = function (event) {
    if (Game.prefs && Game.prefs.warn) {
        if (typeof event == 'undefined') event = window.event;
        if (event) event.returnValue = 'Are you sure you want to close Cookie Clicker?';
    }
}