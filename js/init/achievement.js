/*=====================================================================================
ACHIEVEMENTS
=======================================================================================*/
Game.Achievements = [];
Game.AchievementsById = [];
Game.AchievementsN = 0;
Game.AchievementsOwned = 0;
Game.Achievement = function (name, desc, icon, pool) {
	this.id = Game.AchievementsN;
	this.name = name;
	this.desc = desc;
	this.baseDesc = this.desc;
	this.desc = BeautifyInText(this.baseDesc);
	this.icon = icon;
	this.won = 0;
	this.disabled = 0;
	this.order = this.id;
	if (order) this.order = order + this.id * 0.001;
	this.pool = pool || 'normal';
	this.vanilla = Game.vanilla;
	this.type = 'achievement';

	this.click = function () {
		if (this.clickFunction) this.clickFunction();
	}
	Game.last = this;
	Game.Achievements[this.name] = this;
	Game.AchievementsById[this.id] = this;
	Game.AchievementsN++;
	return this;
}

Game.Win = function (what) {
	if (typeof what === 'string') {
		if (Game.Achievements[what]) {
			if (Game.Achievements[what].won == 0) {
				var name = Game.Achievements[what].shortName ? Game.Achievements[what].shortName : Game.Achievements[what].name;
				Game.Achievements[what].won = 1;
				if (Game.prefs.popups) Game.Popup('Achievement unlocked :<br>' + name);
				else Game.Notify('Achievement unlocked', '<div class="title" style="font-size:18px;margin-top:-2px;">' + name + '</div>', Game.Achievements[what].icon);
				if (Game.CountsAsAchievementOwned(Game.Achievements[what].pool)) Game.AchievementsOwned++;
				Game.recalculateGains = 1;
			}
		}
	} else {
		for (var i in what) {
			Game.Win(what[i]);
		}
	}
}
Game.RemoveAchiev = function (what) {
	if (Game.Achievements[what]) {
		if (Game.Achievements[what].won == 1) {
			Game.Achievements[what].won = 0;
			if (Game.CountsAsAchievementOwned(Game.Achievements[what].pool)) Game.AchievementsOwned--;
			Game.recalculateGains = 1;
		}
	}
}
Game.Achievement.prototype.toggle = function () //cheating only
{
	if (!this.won) {
		Game.Win(this.name);
	} else {
		Game.RemoveAchiev(this.name);
	}
	if (Game.onMenu == 'stats') Game.UpdateMenu();
}

Game.CountsAsAchievementOwned = function (pool) {
	if (pool == '' || pool == 'normal') return true;
	else return false;
}

Game.HasAchiev = function (what) {
	return (Game.Achievements[what] ? Game.Achievements[what].won : 0);
}

Game.TieredAchievement = function (name, desc, building, tier) {
	var achiev = new Game.Achievement(name, desc, Game.GetIcon(building, tier), "building");
	Game.SetTier(building, tier);
	return achiev;
}

Game.ProductionAchievement = function (name, building, tier, q, mult) {
	var building = Game.Objects[building];
	var icon = [building.iconColumn, 22];
	var n = 12 + building.n + (mult || 0);
	if (tier == 2) {
		icon[1] = 23;
		n += 7;
	} else if (tier == 3) {
		icon[1] = 24;
		n += 14;
	}
	var pow = Math.pow(10, n);
	var achiev = new Game.Achievement(name, 'Make <b>' + toFixed(pow) + '</b> cookies just from ' + building.plural + '.' + (q ? '<q>' + q + '</q>' : ''), icon, "production");
	building.productionAchievs.push({
		pow: pow,
		achiev: achiev
	});
	return achiev;
}

Game.thresholdIcons = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 21, 22, 23, 24, 25, 26, 27, 28, 29, 21, 22, 23, 24, 25, 26, 27, 28, 29];
Game.BankAchievements = [];
Game.BankAchievement = function (name, q) {
	var threshold = Math.pow(10, Math.floor(Game.BankAchievements.length * 1.5 + 2));
	if (Game.BankAchievements.length == 0) threshold = 1;
	var achiev = new Game.Achievement(name, 'Bake <b>' + toFixed(threshold) + '</b> cookie' + (threshold == 1 ? '' : 's') + ' in one ascension.' + (q ? ('<q>' + q + '</q>') : ''), [Game.thresholdIcons[Game.BankAchievements.length], (Game.BankAchievements.length > 32 ? 1 : Game.BankAchievements.length > 23 ? 2 : 5)], "cookie");
	achiev.threshold = threshold;
	achiev.order = 100 + Game.BankAchievements.length * 0.01;
	Game.BankAchievements.push(achiev);
	return achiev;
}
Game.CpsAchievements = [];
Game.CpsAchievement = function (name, q) {
	var threshold = Math.pow(10, Math.floor(Game.CpsAchievements.length * 1.2));
	//if (Game.CpsAchievements.length==0) threshold=1;
	var achiev = new Game.Achievement(name, 'Bake <b>' + toFixed(threshold) + '</b> cookie' + (threshold == 1 ? '' : 's') + ' per second.' + (q ? ('<q>' + q + '</q>') : ''), [Game.thresholdIcons[Game.CpsAchievements.length], (Game.CpsAchievements.length > 32 ? 1 : Game.CpsAchievements.length > 23 ? 2 : 5)], "cookie");
	achiev.threshold = threshold;
	achiev.order = 200 + Game.CpsAchievements.length * 0.01;
	Game.CpsAchievements.push(achiev);
	return achiev;
}

//define achievements
//WARNING : do NOT add new achievements in between, this breaks the saves. Add them at the end !

var order = 0; //this is used to set the order in which the items are listed

Game.BankAchievement('Wake and bake');
Game.BankAchievement('Making some dough');
Game.BankAchievement('So baked right now');
Game.BankAchievement('Fledgling bakery');
Game.BankAchievement('Affluent bakery');
Game.BankAchievement('World-famous bakery');
Game.BankAchievement('Cosmic bakery');
Game.BankAchievement('Galactic bakery');
Game.BankAchievement('Universal bakery');
Game.BankAchievement('Timeless bakery');
Game.BankAchievement('Infinite bakery');
Game.BankAchievement('Immortal bakery');
Game.BankAchievement('Don\'t stop me now');
Game.BankAchievement('You can stop now');
Game.BankAchievement('Cookies all the way down');
Game.BankAchievement('Overdose');

Game.CpsAchievement('Casual baking');
Game.CpsAchievement('Hardcore baking');
Game.CpsAchievement('Steady tasty stream');
Game.CpsAchievement('Cookie monster');
Game.CpsAchievement('Mass producer');
Game.CpsAchievement('Cookie vortex');
Game.CpsAchievement('Cookie pulsar');
Game.CpsAchievement('Cookie quasar');
Game.CpsAchievement('Oh hey, you\'re still here');
Game.CpsAchievement('Let\'s never bake again');

order = 30010;
new Game.Achievement('Sacrifice', 'Ascend with <b>1 million</b> cookies baked.<q>Easy come, easy go.</q>', [11, 6]);
new Game.Achievement('Oblivion', 'Ascend with <b>1 billion</b> cookies baked.<q>Back to square one.</q>', [11, 6]);
new Game.Achievement('From scratch', 'Ascend with <b>1 trillion</b> cookies baked.<q>It\'s been fun.</q>', [11, 6]);

order = 11010;
new Game.Achievement('Neverclick', 'Make <b>1 million</b> cookies by only having clicked <b>15 times</b>.', [12, 0]); //Game.last.pool='shadow';
order = 1000;
new Game.Achievement('Clicktastic', 'Make <b>1,000</b> cookies from clicking.', [11, 0]);
new Game.Achievement('Clickathlon', 'Make <b>100,000</b> cookies from clicking.', [11, 1]);
new Game.Achievement('Clickolympics', 'Make <b>10,000,000</b> cookies from clicking.', [11, 2]);
new Game.Achievement('Clickorama', 'Make <b>1,000,000,000</b> cookies from clicking.', [11, 13]);

order = 1050;
Game.TieredAchievement('Click', 'Have <b>1</b> cursor.', 'Cursor', 1);
Game.TieredAchievement('Double-click', 'Have <b>2</b> cursors.', 'Cursor', 2);
Game.TieredAchievement('Mouse wheel', 'Have <b>50</b> cursors.', 'Cursor', 3);
Game.TieredAchievement('Of Mice and Men', 'Have <b>100</b> cursors.', 'Cursor', 4);
Game.TieredAchievement('The Digital', 'Have <b>200</b> cursors.', 'Cursor', 5);

order = 1100;
new Game.Achievement('Just wrong', 'Sell a grandma.<q>I thought you loved me.</q>', [10, 9], "misc");
Game.TieredAchievement('Grandma\'s cookies', 'Have <b>1</b> grandma.', 'Grandma', 1);
Game.TieredAchievement('Sloppy kisses', 'Have <b>50</b> grandmas.', 'Grandma', 2);
Game.TieredAchievement('Retirement home', 'Have <b>100</b> grandmas.', 'Grandma', 3);

order = 1200;
Game.TieredAchievement('Bought the farm', 'Have <b>1</b> farm.', 'Farm', 1);
Game.TieredAchievement('Reap what you sow', 'Have <b>50</b> farms.', 'Farm', 2);
Game.TieredAchievement('Farm ill', 'Have <b>100</b> farms.', 'Farm', 3);

order = 1400;
Game.TieredAchievement('Production chain', 'Have <b>1</b> factory.', 'Factory', 1);
Game.TieredAchievement('Industrial revolution', 'Have <b>50</b> factories.', 'Factory', 2);
Game.TieredAchievement('Global warming', 'Have <b>100</b> factories.', 'Factory', 3);

order = 1300;
Game.TieredAchievement('You know the drill', 'Have <b>1</b> mine.', 'Mine', 1);
Game.TieredAchievement('Excavation site', 'Have <b>50</b> mines.', 'Mine', 2);
Game.TieredAchievement('Hollow the planet', 'Have <b>100</b> mines.', 'Mine', 3);

order = 1500;
Game.TieredAchievement('Expedition', 'Have <b>1</b> shipment.', 'Shipment', 1);
Game.TieredAchievement('Galactic highway', 'Have <b>50</b> shipments.', 'Shipment', 2);
Game.TieredAchievement('Far far away', 'Have <b>100</b> shipments.', 'Shipment', 3);

order = 1600;
Game.TieredAchievement('Transmutation', 'Have <b>1</b> alchemy lab.', 'Alchemy lab', 1);
Game.TieredAchievement('Transmogrification', 'Have <b>50</b> alchemy labs.', 'Alchemy lab', 2);
Game.TieredAchievement('Gold member', 'Have <b>100</b> alchemy labs.', 'Alchemy lab', 3);

order = 1700;
Game.TieredAchievement('A whole new world', 'Have <b>1</b> portal.', 'Portal', 1);
Game.TieredAchievement('Now you\'re thinking', 'Have <b>50</b> portals.', 'Portal', 2);
Game.TieredAchievement('Dimensional shift', 'Have <b>100</b> portals.', 'Portal', 3);

order = 1800;
Game.TieredAchievement('Time warp', 'Have <b>1</b> time machine.', 'Time machine', 1);
Game.TieredAchievement('Alternate timeline', 'Have <b>50</b> time machines.', 'Time machine', 2);
Game.TieredAchievement('Rewriting history', 'Have <b>100</b> time machines.', 'Time machine', 3);


order = 7000;
new Game.Achievement('One with everything', 'Have <b>at least 1</b> of every building.', [2, 7], 'building');
new Game.Achievement('Mathematician', 'Have at least <b>1 of the most expensive object, 2 of the second-most expensive, 4 of the next</b> and so on (capped at 128).', [23, 12], 'building');
new Game.Achievement('Base 10', 'Have at least <b>10 of the most expensive object, 20 of the second-most expensive, 30 of the next</b> and so on.', [23, 12], 'building');

order = 10000;
new Game.Achievement('Golden cookie', 'Click a <b>golden cookie</b>.', [10, 14]);
new Game.Achievement('Lucky cookie', 'Click <b>7 golden cookies</b>.', [22, 6]);
new Game.Achievement('A stroke of luck', 'Click <b>27 golden cookies</b>.', [23, 6]);

order = 30200;
new Game.Achievement('Cheated cookies taste awful', 'Hack in some cookies.', [10, 6], "shadow");
new Game.Achievement('Rickroll\'d', 'Get rickrolled.<br><q>You were trying to cheat in some cookies, weren\'t you?</q>', [17, 5], "shadow");
order = 11010;
new Game.Achievement('Uncanny clicker', 'Click really, really fast.<q>Well I\'ll be!</q>', [12, 0]);

order = 5000;
new Game.Achievement('Builder', 'Own <b>100</b> buildings.', [2, 6]);
new Game.Achievement('Architect', 'Own <b>500</b> buildings.', [3, 6]);
order = 6000;
new Game.Achievement('Enhancer', 'Purchase <b>20</b> upgrades.', [9, 0]);
new Game.Achievement('Augmenter', 'Purchase <b>50</b> upgrades.', [9, 1]);

order = 11000;
new Game.Achievement('Cookie-dunker', 'Dunk the cookie.<q>You did it!</q>', [1, 8]);

order = 10000;
new Game.Achievement('Fortune', 'Click <b>77 golden cookies</b>.<q>You should really go to bed.</q>', [24, 6]);
order = 31000;
new Game.Achievement('True Neverclick', 'Make <b>1 million</b> cookies with <b>no</b> cookie clicks.<q>This kinda defeats the whole purpose, doesn\'t it?</q>', [12, 0], "shadow");

order = 20000;
new Game.Achievement('Elder nap', 'Appease the grandmatriarchs at least <b>once</b>.<q>we<br>are<br>eternal</q>', [8, 9]);
new Game.Achievement('Elder slumber', 'Appease the grandmatriarchs at least <b>5 times</b>.<q>our mind<br>outlives<br>the universe</q>', [8, 9]);

order = 1150;
new Game.Achievement('Elder', 'Own at least <b>7</b> grandma types.', [10, 9]);

order = 20000;
new Game.Achievement('Elder calm', 'Declare a covenant with the grandmatriarchs.<q>we<br>have<br>fed</q>', [8, 9]);

order = 5000;
new Game.Achievement('Engineer', 'Own <b>1000</b> buildings.', [4, 6]);

order = 10000;
new Game.Achievement('Leprechaun', 'Click <b>777 golden cookies</b>.', [25, 6]);
new Game.Achievement('Black cat\'s paw', 'Click <b>7777 golden cookies</b>.', [26, 6]);

order = 30050;
new Game.Achievement('Nihilism', 'Ascend with <b>1 quadrillion</b> cookies baked.<q>There are many things<br>that need to be erased</q>', [11, 7]);

order = 1900;
Game.TieredAchievement('Antibatter', 'Have <b>1</b> antimatter condenser.', 'Antimatter condenser', 1);
Game.TieredAchievement('Quirky quarks', 'Have <b>50</b> antimatter condensers.', 'Antimatter condenser', 2);
Game.TieredAchievement('It does matter!', 'Have <b>100</b> antimatter condensers.', 'Antimatter condenser', 3);

order = 6000;
new Game.Achievement('Upgrader', 'Purchase <b>100</b> upgrades.', [9, 2]);

order = 7000;
new Game.Achievement('Centennial', 'Have at least <b>100 of everything</b>.', [6, 6]);

order = 30500;
new Game.Achievement('Hardcore', 'Get to <b>1 billion</b> cookies baked with <b>no upgrades purchased</b>.', [12, 6]); //Game.last.pool='shadow';

order = 30600;
new Game.Achievement('Speed baking I', 'Get to <b>1 million</b> cookies baked in <b>35 minutes</b>.', [12, 5], 'shadow');
new Game.Achievement('Speed baking II', 'Get to <b>1 million</b> cookies baked in <b>25 minutes</b>.', [13, 5], 'shadow');
new Game.Achievement('Speed baking III', 'Get to <b>1 million</b> cookies baked in <b>15 minutes</b>.', [14, 5], 'shadow');


order = 61000;
var achiev = new Game.Achievement('Getting even with the oven', 'Defeat the <b>Sentient Furnace</b> in the factory dungeons.', [12, 7], 'dungeon');
var achiev = new Game.Achievement('Now this is pod-smashing', 'Defeat the <b>Ascended Baking Pod</b> in the factory dungeons.', [12, 7], 'dungeon');
var achiev = new Game.Achievement('Chirped out', 'Find and defeat <b>Chirpy</b>, the dysfunctionning alarm bot.', [13, 7], 'dungeon');
var achiev = new Game.Achievement('Follow the white rabbit', 'Find and defeat the elusive <b>sugar bunny</b>.', [14, 7], 'dungeon');

order = 1000;
new Game.Achievement('Clickasmic', 'Make <b>100,000,000,000</b> cookies from clicking.', [11, 14]);

order = 1100;
Game.TieredAchievement('Friend of the ancients', 'Have <b>150</b> grandmas.', 'Grandma', 4);
Game.TieredAchievement('Ruler of the ancients', 'Have <b>200</b> grandmas.', 'Grandma', 5);

order = 32000;
new Game.Achievement('Wholesome', 'Unlock <b>100%</b> of your heavenly chips power.', [15, 7]);

order = 33000;
new Game.Achievement('Just plain lucky', 'You have <b>1 chance in 500,000</b> every second of earning this achievement.', [15, 6], 'shadow');

order = 21000;
new Game.Achievement('Itchscratcher', 'Burst <b>1 wrinkler</b>.', [19, 8]);
new Game.Achievement('Wrinklesquisher', 'Burst <b>50 wrinklers</b>.', [19, 8]);
new Game.Achievement('Moistburster', 'Burst <b>200 wrinklers</b>.', [19, 8]);

order = 22000;
new Game.Achievement('Spooky cookies', 'Unlock <b>every Halloween-themed cookie</b>.<div class="line"></div>Owning this achievement makes Halloween-themed cookies drop more frequently in future playthroughs.', [12, 8]);

order = 22100;
new Game.Achievement('Coming to town', 'Reach <b>Santa\'s 7th form</b>.', [18, 9]);
new Game.Achievement('All hail Santa', 'Reach <b>Santa\'s final form</b>.', [19, 10]);
new Game.Achievement('Let it snow', 'Unlock <b>every Christmas-themed cookie</b>.<div class="line"></div>Owning this achievement makes Christmas-themed cookies drop more frequently in future playthroughs.', [19, 9]);
new Game.Achievement('Oh deer', 'Pop <b>1 reindeer</b>.', [12, 9]);
new Game.Achievement('Sleigh of hand', 'Pop <b>50 reindeer</b>.', [12, 9]);
new Game.Achievement('Reindeer sleigher', 'Pop <b>200 reindeer</b>.', [12, 9]);

order = 1200;
Game.TieredAchievement('Perfected agriculture', 'Have <b>150</b> farms.', 'Farm', 4);
order = 1400;
Game.TieredAchievement('Ultimate automation', 'Have <b>150</b> factories.', 'Factory', 4);
order = 1300;
Game.TieredAchievement('Can you dig it', 'Have <b>150</b> mines.', 'Mine', 4);
order = 1500;
Game.TieredAchievement('Type II civilization', 'Have <b>150</b> shipments.', 'Shipment', 4);
order = 1600;
Game.TieredAchievement('Gild wars', 'Have <b>150</b> alchemy labs.', 'Alchemy lab', 4);
order = 1700;
Game.TieredAchievement('Brain-split', 'Have <b>150</b> portals.', 'Portal', 4);
order = 1800;
Game.TieredAchievement('Time duke', 'Have <b>150</b> time machines.', 'Time machine', 4);
order = 1900;
Game.TieredAchievement('Molecular maestro', 'Have <b>150</b> antimatter condensers.', 'Antimatter condenser', 4);

order = 2000;
Game.TieredAchievement('Lone photon', 'Have <b>1</b> prism.', 'Prism', 1);
Game.TieredAchievement('Dazzling glimmer', 'Have <b>50</b> prisms.', 'Prism', 2);
Game.TieredAchievement('Blinding flash', 'Have <b>100</b> prisms.', 'Prism', 3);
Game.TieredAchievement('Unending glow', 'Have <b>150</b> prisms.', 'Prism', 4);

order = 5000;
new Game.Achievement('Lord of Constructs', 'Own <b>2000</b> buildings.<q>He saw the vast plains stretching ahead of him, and he said : let there be civilization.</q>', [5, 6]);
order = 6000;
new Game.Achievement('Lord of Progress', 'Purchase <b>200</b> upgrades.<q>One can always do better. But should you?</q>', [9, 14]);
order = 7002;
new Game.Achievement('Bicentennial', 'Have at least <b>200 of everything</b>.<q>You crazy person.</q>', [8, 6]);

order = 22300;
new Game.Achievement('Lovely cookies', 'Unlock <b>every Valentine-themed cookie</b>.', [20, 3]);

order = 7001;
new Game.Achievement('Centennial and a half', 'Have at least <b>150 of everything</b>.', [7, 6]);

order = 11000;
new Game.Achievement('Tiny cookie', 'Click the tiny cookie.<q>These aren\'t the cookies<br>you\'re clicking for.</q>', [0, 5]);

order = 400000;
new Game.Achievement('You win a cookie', 'This is for baking 10 trillion cookies and making it on the local news.<q>We\'re all so proud of you.</q>', [10, 0]);

order = 1070;
Game.ProductionAchievement('Click delegator', 'Cursor', 1, 0, 7);
order = 1120;
Game.ProductionAchievement('Gushing grannies', 'Grandma', 1, 0, 6);
order = 1220;
Game.ProductionAchievement('I hate manure', 'Farm', 1);
order = 1320;
Game.ProductionAchievement('Never dig down', 'Mine', 1);
order = 1420;
Game.ProductionAchievement('The incredible machine', 'Factory', 1);
order = 1520;
Game.ProductionAchievement('And beyond', 'Shipment', 1);
order = 1620;
Game.ProductionAchievement('Magnum Opus', 'Alchemy lab', 1);
order = 1720;
Game.ProductionAchievement('With strange eons', 'Portal', 1);
order = 1820;
Game.ProductionAchievement('Spacetime jigamaroo', 'Time machine', 1);
order = 1920;
Game.ProductionAchievement('Supermassive', 'Antimatter condenser', 1);
order = 2020;
Game.ProductionAchievement('Praise the sun', 'Prism', 1);


order = 1000;
new Game.Achievement('Clickageddon', 'Make <b>10,000,000,000,000</b> cookies from clicking.', [11, 15]);
new Game.Achievement('Clicknarok', 'Make <b>1,000,000,000,000,000</b> cookies from clicking.', [11, 16]);

order = 1050;
Game.TieredAchievement('Extreme polydactyly', 'Have <b>300</b> cursors.', 'Cursor', 1);
Game.TieredAchievement('Dr. T', 'Have <b>400</b> cursors.', 'Cursor', 1);

order = 1100;
Game.TieredAchievement('The old never bothered me anyway', 'Have <b>250</b> grandmas.', 'Grandma', 6);
order = 1200;
Game.TieredAchievement('Homegrown', 'Have <b>200</b> farms.', 'Farm', 5);
order = 1400;
Game.TieredAchievement('Technocracy', 'Have <b>200</b> factories.', 'Factory', 5);
order = 1300;
Game.TieredAchievement('The center of the Earth', 'Have <b>200</b> mines.', 'Mine', 5);
order = 1500;
Game.TieredAchievement('We come in peace', 'Have <b>200</b> shipments.', 'Shipment', 5);
order = 1600;
Game.TieredAchievement('The secrets of the universe', 'Have <b>200</b> alchemy labs.', 'Alchemy lab', 5);
order = 1700;
Game.TieredAchievement('Realm of the Mad God', 'Have <b>200</b> portals.', 'Portal', 5);
order = 1800;
Game.TieredAchievement('Forever and ever', 'Have <b>200</b> time machines.', 'Time machine', 5);
order = 1900;
Game.TieredAchievement('Walk the planck', 'Have <b>200</b> antimatter condensers.', 'Antimatter condenser', 5);
order = 2000;
Game.TieredAchievement('Rise and shine', 'Have <b>200</b> prisms.', 'Prism', 5);

order = 30200;
new Game.Achievement('God complex', 'Name yourself <b>Orteil</b>.<div class="warning">Note : usurpers incur a -1% CpS penalty until they rename themselves something else.</div><q>But that\'s not you, is it?</q>', [17, 5], 'shadow');
new Game.Achievement('Third-party', 'Use an <b>add-on</b>.<q>Some find vanilla to be the most boring flavor.</q>', [16, 5], 'shadow'); //if you're making a mod, add a Game.Win('Third-party') somewhere in there!

order = 30050;
new Game.Achievement('Dematerialize', 'Ascend with <b>1 quintillion</b> cookies baked.<q>Presto!<br>...where\'d the cookies go?</q>', [11, 7]);
new Game.Achievement('Nil zero zilch', 'Ascend with <b>1 sextillion</b> cookies baked.<q>To summarize : really not very much at all.</q>', [11, 7]);
new Game.Achievement('Transcendence', 'Ascend with <b>1 septillion</b> cookies baked.<q>Your cookies are now on a higher plane of being.</q>', [11, 8]);
new Game.Achievement('Obliterate', 'Ascend with <b>1 octillion</b> cookies baked.<q>Resistance is futile, albeit entertaining.</q>', [11, 8]);
new Game.Achievement('Negative void', 'Ascend with <b>1 nonillion</b> cookies baked.<q>You now have so few cookies that it\'s almost like you have a negative amount of them.</q>', [11, 8]);

order = 22400;
new Game.Achievement('The hunt is on', 'Unlock <b>1 egg</b>.', [1, 12]);
new Game.Achievement('Egging on', 'Unlock <b>7 eggs</b>.', [4, 12]);
new Game.Achievement('Mass Easteria', 'Unlock <b>14 eggs</b>.', [7, 12]);
new Game.Achievement('Hide & seek champion', 'Unlock <b>all the eggs</b>.<div class="line"></div>Owning this achievement makes eggs drop more frequently in future playthroughs.', [13, 12]);

order = 11000;
new Game.Achievement('What\'s in a name', 'Give your bakery a name.', [15, 9]);


order = 1425;
Game.TieredAchievement('Pretty penny', 'Have <b>1</b> bank.', 'Bank', 1);
Game.TieredAchievement('Fit the bill', 'Have <b>50</b> banks.', 'Bank', 2);
Game.TieredAchievement('A loan in the dark', 'Have <b>100</b> banks.', 'Bank', 3);
Game.TieredAchievement('Need for greed', 'Have <b>150</b> banks.', 'Bank', 4);
Game.TieredAchievement('It\'s the economy, stupid', 'Have <b>200</b> banks.', 'Bank', 5);
order = 1450;
Game.TieredAchievement('Your time to shrine', 'Have <b>1</b> temple.', 'Temple', 1);
Game.TieredAchievement('Shady sect', 'Have <b>50</b> temples.', 'Temple', 2);
Game.TieredAchievement('New-age cult', 'Have <b>100</b> temples.', 'Temple', 3);
Game.TieredAchievement('Organized religion', 'Have <b>150</b> temples.', 'Temple', 4);
Game.TieredAchievement('Fanaticism', 'Have <b>200</b> temples.', 'Temple', 5);
order = 1475;
Game.TieredAchievement('Bewitched', 'Have <b>1</b> wizard tower.', 'Wizard tower', 1);
Game.TieredAchievement('The sorcerer\'s apprentice', 'Have <b>50</b> wizard towers.', 'Wizard tower', 2);
Game.TieredAchievement('Charms and enchantments', 'Have <b>100</b> wizard towers.', 'Wizard tower', 3);
Game.TieredAchievement('Curses and maledictions', 'Have <b>150</b> wizard towers.', 'Wizard tower', 4);
Game.TieredAchievement('Magic kingdom', 'Have <b>200</b> wizard towers.', 'Wizard tower', 5);

order = 1445;
Game.ProductionAchievement('Vested interest', 'Bank', 1);
order = 1470;
Game.ProductionAchievement('New world order', 'Temple', 1);
order = 1495;
Game.ProductionAchievement('Hocus pocus', 'Wizard tower', 1);



order = 1070;
Game.ProductionAchievement('Finger clickin\' good', 'Cursor', 2, 0, 7);
order = 1120;
Game.ProductionAchievement('Panic at the bingo', 'Grandma', 2, 0, 6);
order = 1220;
Game.ProductionAchievement('Rake in the dough', 'Farm', 2);
order = 1320;
Game.ProductionAchievement('Quarry on', 'Mine', 2);
order = 1420;
Game.ProductionAchievement('Yes I love technology', 'Factory', 2);
order = 1445;
Game.ProductionAchievement('Paid in full', 'Bank', 2);
order = 1470;
Game.ProductionAchievement('Church of Cookiology', 'Temple', 2);
order = 1495;
Game.ProductionAchievement('Too many rabbits, not enough hats', 'Wizard tower', 2);
order = 1520;
Game.ProductionAchievement('The most precious cargo', 'Shipment', 2);
order = 1620;
Game.ProductionAchievement('The Aureate', 'Alchemy lab', 2);
order = 1720;
Game.ProductionAchievement('Ever more hideous', 'Portal', 2);
order = 1820;
Game.ProductionAchievement('Be kind, rewind', 'Time machine', 2);
order = 1920;
Game.ProductionAchievement('Infinitesimal', 'Antimatter condenser', 2);
order = 2020;
Game.ProductionAchievement('A still more glorious dawn', 'Prism', 2);

order = 30000;
new Game.Achievement('Rebirth', 'Ascend at least once.', [21, 6]);

order = 11000;
new Game.Achievement('Here you go', 'Click this achievement\'s slot.<q>All you had to do was ask.</q>', [1, 7]);
Game.last.clickFunction = function () {
	if (!Game.HasAchiev('Here you go')) {
		PlaySound('assets/snd/tick.mp3');
		Game.Win('Here you go');
	}
};

order = 30000;
new Game.Achievement('Resurrection', 'Ascend <b>10 times</b>.', [21, 6]);
new Game.Achievement('Reincarnation', 'Ascend <b>100 times</b>.', [21, 6]);
new Game.Achievement('Endless cycle', 'Ascend <b>1000 times</b>.<q>Oh hey, it\'s you again.</q>', [2, 7], 'shadow');



order = 1100;
Game.TieredAchievement('The agemaster', 'Have <b>300</b> grandmas.', 'Grandma', 7);
Game.TieredAchievement('To oldly go', 'Have <b>350</b> grandmas.', 'Grandma', 8);

order = 1200;
Game.TieredAchievement('Gardener extraordinaire', 'Have <b>250</b> farms.', 'Farm', 6);
order = 1300;
Game.TieredAchievement('Tectonic ambassador', 'Have <b>250</b> mines.', 'Mine', 6);
order = 1400;
Game.TieredAchievement('Rise of the machines', 'Have <b>250</b> factories.', 'Factory', 6);
order = 1425;
Game.TieredAchievement('Acquire currency', 'Have <b>250</b> banks.', 'Bank', 6);
order = 1450;
Game.TieredAchievement('Zealotry', 'Have <b>250</b> temples.', 'Temple', 6);
order = 1475;
Game.TieredAchievement('The wizarding world', 'Have <b>250</b> wizard towers.', 'Wizard tower', 6);
order = 1500;
Game.TieredAchievement('Parsec-masher', 'Have <b>250</b> shipments.', 'Shipment', 6);
order = 1600;
Game.TieredAchievement('The work of a lifetime', 'Have <b>250</b> alchemy labs.', 'Alchemy lab', 6);
order = 1700;
Game.TieredAchievement('A place lost in time', 'Have <b>250</b> portals.', 'Portal', 6);
order = 1800;
Game.TieredAchievement('Heat death', 'Have <b>250</b> time machines.', 'Time machine', 6);
order = 1900;
Game.TieredAchievement('Microcosm', 'Have <b>250</b> antimatter condensers.', 'Antimatter condenser', 6);
order = 2000;
Game.TieredAchievement('Bright future', 'Have <b>250</b> prisms.', 'Prism', 6);

order = 25000;
new Game.Achievement('Here be dragon', 'Complete your <b>dragon\'s training</b>.', [21, 12]);

Game.BankAchievement('How?');
Game.BankAchievement('The land of milk and cookies');
Game.BankAchievement('He who controls the cookies controls the universe', 'The milk must flow!');
Game.BankAchievement('Tonight on Hoarders');
Game.BankAchievement('Are you gonna eat all that?');
Game.BankAchievement('We\'re gonna need a bigger bakery');
Game.BankAchievement('In the mouth of madness', 'A cookie is just what we tell each other it is.');
Game.BankAchievement('Brought to you by the letter <div style="display:inline-block;background:url(assets/img/money.png);width:16px;height:16px;"></div>');


Game.CpsAchievement('A world filled with cookies');
Game.CpsAchievement('When this baby hits ' + Beautify(10000000000000 * 60 * 60) + ' cookies per hour');
Game.CpsAchievement('Fast and delicious');
Game.CpsAchievement('Cookiehertz : a really, really tasty hertz', 'Tastier than a hertz donut, anyway.');
Game.CpsAchievement('Woops, you solved world hunger');
Game.CpsAchievement('Turbopuns', 'Mother Nature will be like "slowwwww dowwwwwn".');
Game.CpsAchievement('Faster menner');
Game.CpsAchievement('And yet you\'re still hungry');
Game.CpsAchievement('The Abakening');
Game.CpsAchievement('There\'s really no hard limit to how long these achievement names can be and to be quite honest I\'m rather curious to see how far we can go.<br>Adolphus W. Green (1844–1917) started as the Principal of the Groton School in 1864. By 1865, he became second assistant librarian at the New York Mercantile Library; from 1867 to 1869, he was promoted to full librarian. From 1869 to 1873, he worked for Evarts, Southmayd & Choate, a law firm co-founded by William M. Evarts, Charles Ferdinand Southmayd and Joseph Hodges Choate. He was admitted to the New York State Bar Association in 1873.<br>Anyway, how\'s your day been?'); //Game.last.shortName='There\'s really no hard limit to how long these achievement names can be and to be quite honest I\'m [...]';
Game.CpsAchievement('Fast', 'Wow!');

order = 7002;
new Game.Achievement('Bicentennial and a half', 'Have at least <b>250 of everything</b>.<q>Keep on truckin\'.</q>', [9, 6]);

order = 11000;
new Game.Achievement('Tabloid addiction', 'Click on the news ticker <b>50 times</b>.<q>Page 6 : Mad individual clicks on picture of pastry in a futile attempt to escape boredom!<br>Also page 6 : British parliament ate my baby!</q>', [27, 7]);

order = 1000;
new Game.Achievement('Clickastrophe', 'Make <b>100,000,000,000,000,000</b> cookies from clicking.', [11, 17]);
new Game.Achievement('Clickataclysm', 'Make <b>10,000,000,000,000,000,000</b> cookies from clicking.', [11, 18]);

order = 1050;
Game.TieredAchievement('Thumbs, phalanges, metacarpals', 'Have <b>500</b> cursors.<q>& KNUCKLES</q>', 'Cursor', 1);

order = 6000;
new Game.Achievement('Polymath', 'Own <b>300</b> upgrades and <b>3000</b> buildings.<q>Excellence doesn\'t happen overnight - it usually takes a good couple days.</q>', [29, 7]);

order = 6005;
new Game.Achievement('The elder scrolls', 'Own a combined <b>777</b> grandmas and cursors.<q>Let me guess. Someone stole your cookie.</q>', [10, 9]);

order = 30050;
new Game.Achievement('To crumbs, you say?', 'Ascend with <b>1 decillion</b> cookies baked.<q>Very well then.</q>', [29, 6]);

order = 1200;
Game.TieredAchievement('Seedy business', 'Have <b>300</b> farms.', 'Farm', 7);
order = 1300;
Game.TieredAchievement('Freak fracking', 'Have <b>300</b> mines.', 'Mine', 7);
order = 1400;
Game.TieredAchievement('Modern times', 'Have <b>300</b> factories.', 'Factory', 7);
order = 1425;
Game.TieredAchievement('The nerve of war', 'Have <b>300</b> banks.', 'Bank', 7);
order = 1450;
Game.TieredAchievement('Wololo', 'Have <b>300</b> temples.', 'Temple', 7);
order = 1475;
Game.TieredAchievement('And now for my next trick, I\'ll need a volunteer from the audience', 'Have <b>300</b> wizard towers.', 'Wizard tower', 7);
order = 1500;
Game.TieredAchievement('It\'s not delivery', 'Have <b>300</b> shipments.', 'Shipment', 7);
order = 1600;
Game.TieredAchievement('Gold, Jerry! Gold!', 'Have <b>300</b> alchemy labs.', 'Alchemy lab', 7);
order = 1700;
Game.TieredAchievement('Forbidden zone', 'Have <b>300</b> portals.', 'Portal', 7);
order = 1800;
Game.TieredAchievement('cookie clicker forever and forever a hundred years cookie clicker, all day long forever, forever a hundred times, over and over cookie clicker adventures dot com', 'Have <b>300</b> time machines.', 'Time machine', 7);
order = 1900;
Game.TieredAchievement('Scientists baffled everywhere', 'Have <b>300</b> antimatter condensers.', 'Antimatter condenser', 7);
order = 2000;
Game.TieredAchievement('Harmony of the spheres', 'Have <b>300</b> prisms.', 'Prism', 7);

order = 35000;
new Game.Achievement('Last Chance to See', 'Burst the near-extinct <b>shiny wrinkler</b>.<q>You monster!</q>', [24, 12], 'shadow');

order = 10000;
new Game.Achievement('Early bird', 'Click a golden cookie <b>less than 1 second after it spawns</b>.', [10, 14]);
new Game.Achievement('Fading luck', 'Click a golden cookie <b>less than 1 second before it dies</b>.', [10, 14]);

order = 22100;
new Game.Achievement('Eldeer', 'Pop a reindeer <b>during an elder frenzy</b>.', [12, 9]);

order = 21100;
new Game.Achievement('Dude, sweet', 'Harvest <b>7 coalescing sugar lumps</b>.', [24, 14]);
new Game.Achievement('Sugar rush', 'Harvest <b>30 coalescing sugar lumps</b>.', [26, 14]);
new Game.Achievement('Year\'s worth of cavities', 'Harvest <b>365 coalescing sugar lumps</b>.<q>My lumps my lumps my lumps.</q>', [29, 14]);
new Game.Achievement('Hand-picked', 'Successfully harvest a coalescing sugar lump before it\'s ripe.', [28, 14]);
new Game.Achievement('Sugar sugar', 'Harvest a <b>bifurcated sugar lump</b>.', [29, 15]);
new Game.Achievement('All-natural cane sugar', 'Harvest a <b>golden sugar lump</b>.', [29, 16], 'shadow');
new Game.Achievement('Sweetmeats', 'Harvest a <b>meaty sugar lump</b>.', [29, 17]);

order = 7002;
new Game.Achievement('Tricentennial', 'Have at least <b>300 of everything</b>.<q>Can\'t stop, won\'t stop. Probably should stop, though.</q>', [29, 12]);

Game.CpsAchievement('Knead for speed', 'How did we not make that one yet?');
Game.CpsAchievement('Well the cookies start coming and they don\'t stop coming', 'Didn\'t make sense not to click for fun.');
Game.CpsAchievement('I don\'t know if you\'ve noticed but all these icons are very slightly off-center');
Game.CpsAchievement('The proof of the cookie is in the baking', 'How can you have any cookies if you don\'t bake your dough?');
Game.CpsAchievement('If it\'s worth doing, it\'s worth overdoing');

Game.BankAchievement('The dreams in which I\'m baking are the best I\'ve ever had');
Game.BankAchievement('Set for life');

order = 1200;
Game.TieredAchievement('You and the beanstalk', 'Have <b>350</b> farms.', 'Farm', 8);
order = 1300;
Game.TieredAchievement('Romancing the stone', 'Have <b>350</b> mines.', 'Mine', 8);
order = 1400;
Game.TieredAchievement('Ex machina', 'Have <b>350</b> factories.', 'Factory', 8);
order = 1425;
Game.TieredAchievement('And I need it now', 'Have <b>350</b> banks.', 'Bank', 8);
order = 1450;
Game.TieredAchievement('Pray on the weak', 'Have <b>350</b> temples.', 'Temple', 8);
order = 1475;
Game.TieredAchievement('It\'s a kind of magic', 'Have <b>350</b> wizard towers.', 'Wizard tower', 8);
order = 1500;
Game.TieredAchievement('Make it so', 'Have <b>350</b> shipments.', 'Shipment', 8);
order = 1600;
Game.TieredAchievement('All that glitters is gold', 'Have <b>350</b> alchemy labs.', 'Alchemy lab', 8);
order = 1700;
Game.TieredAchievement('H̸̷͓̳̳̯̟͕̟͍͍̣͡ḛ̢̦̰̺̮̝͖͖̘̪͉͘͡ ̠̦͕̤̪̝̥̰̠̫̖̣͙̬͘ͅC̨̦̺̩̲̥͉̭͚̜̻̝̣̼͙̮̯̪o̴̡͇̘͎̞̲͇̦̲͞͡m̸̩̺̝̣̹̱͚̬̥̫̳̼̞̘̯͘ͅẹ͇̺̜́̕͢s̶̙̟̱̥̮̯̰̦͓͇͖͖̝͘͘͞', 'Have <b>350</b> portals.', 'Portal', 8);
order = 1800;
Game.TieredAchievement('Way back then', 'Have <b>350</b> time machines.', 'Time machine', 8);
order = 1900;
Game.TieredAchievement('Exotic matter', 'Have <b>350</b> antimatter condensers.', 'Antimatter condenser', 8);
order = 2000;
Game.TieredAchievement('At the end of the tunnel', 'Have <b>350</b> prisms.', 'Prism', 8);



order = 1070;
Game.ProductionAchievement('Click (starring Adam Sandler)', 'Cursor', 3, 0, 7);
order = 1120;
Game.ProductionAchievement('Frantiquities', 'Grandma', 3, 0, 6);
order = 1220;
Game.ProductionAchievement('Overgrowth', 'Farm', 3);
order = 1320;
Game.ProductionAchievement('Sedimentalism', 'Mine', 3);
order = 1420;
Game.ProductionAchievement('Labor of love', 'Factory', 3);
order = 1445;
Game.ProductionAchievement('Reverse funnel system', 'Bank', 3);
order = 1470;
Game.ProductionAchievement('Thus spoke you', 'Temple', 3);
order = 1495;
Game.ProductionAchievement('Manafest destiny', 'Wizard tower', 3);
order = 1520;
Game.ProductionAchievement('Neither snow nor rain nor heat nor gloom of night', 'Shipment', 3);
order = 1620;
Game.ProductionAchievement('I\'ve got the Midas touch', 'Alchemy lab', 3);
order = 1720;
Game.ProductionAchievement('Which eternal lie', 'Portal', 3);
order = 1820;
Game.ProductionAchievement('D&eacute;j&agrave; vu', 'Time machine', 3);
order = 1920;
Game.ProductionAchievement('Powers of Ten', 'Antimatter condenser', 3);
order = 2020;
Game.ProductionAchievement('Now the dark days are gone', 'Prism', 3);

order = 1070;
new Game.Achievement('Freaky jazz hands', 'Reach level <b>10</b> cursors.', [0, 26]);
Game.Objects['Cursor'].levelAchiev10 = Game.last;
order = 1120;
new Game.Achievement('Methuselah', 'Reach level <b>10</b> grandmas.', [1, 26]);
Game.Objects['Grandma'].levelAchiev10 = Game.last;
order = 1220;
new Game.Achievement('Huge tracts of land', 'Reach level <b>10</b> farms.', [2, 26]);
Game.Objects['Farm'].levelAchiev10 = Game.last;
order = 1320;
new Game.Achievement('D-d-d-d-deeper', 'Reach level <b>10</b> mines.', [3, 26]);
Game.Objects['Mine'].levelAchiev10 = Game.last;
order = 1420;
new Game.Achievement('Patently genius', 'Reach level <b>10</b> factories.', [4, 26]);
Game.Objects['Factory'].levelAchiev10 = Game.last;
order = 1445;
new Game.Achievement('A capital idea', 'Reach level <b>10</b> banks.', [15, 26]);
Game.Objects['Bank'].levelAchiev10 = Game.last;
order = 1470;
new Game.Achievement('It belongs in a bakery', 'Reach level <b>10</b> temples.', [16, 26]);
Game.Objects['Temple'].levelAchiev10 = Game.last;
order = 1495;
new Game.Achievement('Motormouth', 'Reach level <b>10</b> wizard towers.', [17, 26]);
Game.Objects['Wizard tower'].levelAchiev10 = Game.last;
order = 1520;
new Game.Achievement('Been there done that', 'Reach level <b>10</b> shipments.', [5, 26]);
Game.Objects['Shipment'].levelAchiev10 = Game.last;
order = 1620;
new Game.Achievement('Phlogisticated substances', 'Reach level <b>10</b> alchemy labs.', [6, 26]);
Game.Objects['Alchemy lab'].levelAchiev10 = Game.last;
order = 1720;
new Game.Achievement('Bizarro world', 'Reach level <b>10</b> portals.', [7, 26]);
Game.Objects['Portal'].levelAchiev10 = Game.last;
order = 1820;
new Game.Achievement('The long now', 'Reach level <b>10</b> time machines.', [8, 26]);
Game.Objects['Time machine'].levelAchiev10 = Game.last;
order = 1920;
new Game.Achievement('Chubby hadrons', 'Reach level <b>10</b> antimatter condensers.', [13, 26]);
Game.Objects['Antimatter condenser'].levelAchiev10 = Game.last;
order = 2020;
new Game.Achievement('Palettable', 'Reach level <b>10</b> prisms.', [14, 26]);
Game.Objects['Prism'].levelAchiev10 = Game.last;

order = 61470;
order = 61495;
new Game.Achievement('Bibbidi-bobbidi-boo', 'Cast <b>9</b> spells.', [21, 11]);
new Game.Achievement('I\'m the wiz', 'Cast <b>99</b> spells.', [22, 11]);
new Game.Achievement('A wizard is you', 'Cast <b>999</b> spells.<q>I\'m a what?</q>', [29, 11]);

order = 10000;
new Game.Achievement('Four-leaf cookie', 'Have <b>4</b> golden cookies simultaneously.<q>Fairly rare, considering cookies don\'t even have leaves.</q>', [27, 6], 'shadow');

order = 2100;
Game.TieredAchievement('Lucked out', 'Have <b>1</b> chancemaker.', 'Chancemaker', 1);
Game.TieredAchievement('What are the odds', 'Have <b>50</b> chancemakers.', 'Chancemaker', 2);
Game.TieredAchievement('Grandma needs a new pair of shoes', 'Have <b>100</b> chancemakers.', 'Chancemaker', 3);
Game.TieredAchievement('Million to one shot, doc', 'Have <b>150</b> chancemakers.', 'Chancemaker', 4);
Game.TieredAchievement('As luck would have it', 'Have <b>200</b> chancemakers.', 'Chancemaker', 5);
Game.TieredAchievement('Ever in your favor', 'Have <b>250</b> chancemakers.', 'Chancemaker', 6);
Game.TieredAchievement('Be a lady', 'Have <b>300</b> chancemakers.', 'Chancemaker', 7);
Game.TieredAchievement('Dicey business', 'Have <b>350</b> chancemakers.', 'Chancemaker', 8);

order = 2120;
Game.ProductionAchievement('Fingers crossed', 'Chancemaker', 1);
Game.ProductionAchievement('Just a statistic', 'Chancemaker', 2);
Game.ProductionAchievement('Murphy\'s wild guess', 'Chancemaker', 3);

new Game.Achievement('Let\'s leaf it at that', 'Reach level <b>10</b> chancemakers.', [19, 26]);
Game.Objects['Chancemaker'].levelAchiev10 = Game.last;

order = 1000;
new Game.Achievement('The ultimate clickdown', 'Make <b>1,000,000,000,000,000,000,000</b> cookies from clicking.<q>(of ultimate destiny.)</q>', [11, 19]);


order = 1100;
Game.TieredAchievement('Aged well', 'Have <b>400</b> grandmas.', 'Grandma', 9);
Game.TieredAchievement('101st birthday', 'Have <b>450</b> grandmas.', 'Grandma', 10);
Game.TieredAchievement('Defense of the ancients', 'Have <b>500</b> grandmas.', 'Grandma', 11);
order = 1200;
Game.TieredAchievement('Harvest moon', 'Have <b>400</b> farms.', 'Farm', 9);
order = 1300;
Game.TieredAchievement('Mine?', 'Have <b>400</b> mines.', 'Mine', 9);
order = 1400;
Game.TieredAchievement('In full gear', 'Have <b>400</b> factories.', 'Factory', 9);
order = 1425;
Game.TieredAchievement('Treacle tart economics', 'Have <b>400</b> banks.', 'Bank', 9);
order = 1450;
Game.TieredAchievement('Holy cookies, grandma!', 'Have <b>400</b> temples.', 'Temple', 9);
order = 1475;
Game.TieredAchievement('The Prestige', 'Have <b>400</b> wizard towers.<q>(Unrelated to the Cookie Clicker feature of the same name.)</q>', 'Wizard tower', 9);
order = 1500;
Game.TieredAchievement('That\'s just peanuts to space', 'Have <b>400</b> shipments.', 'Shipment', 9);
order = 1600;
Game.TieredAchievement('Worth its weight in lead', 'Have <b>400</b> alchemy labs.', 'Alchemy lab', 9);
order = 1700;
Game.TieredAchievement('What happens in the vortex stays in the vortex', 'Have <b>400</b> portals.', 'Portal', 9);
order = 1800;
Game.TieredAchievement('Invited to yesterday\'s party', 'Have <b>400</b> time machines.', 'Time machine', 9);
order = 1900;
Game.TieredAchievement('Downsizing', 'Have <b>400</b> antimatter condensers.', 'Antimatter condenser', 9); //the trailer got me really hyped up but i've read some pretty bad reviews. is it watchable ? is it worth seeing ? i don't mind matt damon
order = 2000;
Game.TieredAchievement('My eyes', 'Have <b>400</b> prisms.', 'Prism', 9);
order = 2100;
Game.TieredAchievement('Maybe a chance in hell, actually', 'Have <b>400</b> chancemakers.', 'Chancemaker', 9);

order = 1200;
Game.TieredAchievement('Make like a tree', 'Have <b>450</b> farms.', 'Farm', 10);
order = 1300;
Game.TieredAchievement('Cave story', 'Have <b>450</b> mines.', 'Mine', 10);
order = 1400;
Game.TieredAchievement('In-cog-neato', 'Have <b>450</b> factories.', 'Factory', 10);
order = 1425;
Game.TieredAchievement('Save your breath because that\'s all you\'ve got left', 'Have <b>450</b> banks.', 'Bank', 10);
order = 1450;
Game.TieredAchievement('Vengeful and almighty', 'Have <b>450</b> temples.', 'Temple', 10);
order = 1475;
Game.TieredAchievement('Spell it out for you', 'Have <b>450</b> wizard towers.', 'Wizard tower', 10);
order = 1500;
Game.TieredAchievement('Space space space space space', 'Have <b>450</b> shipments.<q>It\'s too far away...</q>', 'Shipment', 10);
order = 1600;
Game.TieredAchievement('Don\'t get used to yourself, you\'re gonna have to change', 'Have <b>450</b> alchemy labs.', 'Alchemy lab', 10);
order = 1700;
Game.TieredAchievement('Objects in the mirror dimension are closer than they appear', 'Have <b>450</b> portals.', 'Portal', 10);
order = 1800;
Game.TieredAchievement('Groundhog day', 'Have <b>450</b> time machines.', 'Time machine', 10);
order = 1900;
Game.TieredAchievement('A matter of perspective', 'Have <b>450</b> antimatter condensers.', 'Antimatter condenser', 10);
order = 2000;
Game.TieredAchievement('Optical illusion', 'Have <b>450</b> prisms.', 'Prism', 10);
order = 2100;
Game.TieredAchievement('Jackpot', 'Have <b>450</b> chancemakers.', 'Chancemaker', 10);

order = 36000;
new Game.Achievement('So much to do so much to see', 'Manage a cookie legacy for <b>at least a year</b>.<q>Thank you so much for playing Cookie Clicker!</q>', [23, 11], 'shadow');



Game.CpsAchievement('Running with scissors');
Game.CpsAchievement('Rarefied air');
Game.CpsAchievement('Push it to the limit');
Game.CpsAchievement('Green cookies sleep furiously');

Game.BankAchievement('Panic! at Nabisco');
Game.BankAchievement('Bursting at the seams');
Game.BankAchievement('Just about full');
Game.BankAchievement('Hungry for more');

order = 1000;
new Game.Achievement('All the other kids with the pumped up clicks', 'Make <b>100,000,000,000,000,000,000,000</b> cookies from clicking.', [11, 28]);
new Game.Achievement('One...more...click...', 'Make <b>10,000,000,000,000,000,000,000,000</b> cookies from clicking.', [11, 30]);

order = 61515;
new Game.Achievement('Botany enthusiast', 'Harvest <b>100</b> mature garden plants.', [26, 20]);
new Game.Achievement('Green, aching thumb', 'Harvest <b>1000</b> mature garden plants.', [27, 20]);
new Game.Achievement('In the garden of Eden (baby)', 'Fill every tile of the biggest garden plot with plants.<q>Isn\'t tending to those precious little plants just so rock and/or roll?</q>', [28, 20]);

new Game.Achievement('Keeper of the conservatory', 'Unlock every garden seed.', [25, 20]);
new Game.Achievement('Seedless to nay', 'Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets.<div class="line"></div>Owning this achievement makes seeds <b>5% cheaper</b>, plants mature <b>5% sooner</b>, and plant upgrades drop <b>5% more</b>.', [29, 20]);

order = 30050;
new Game.Achievement('You get nothing', 'Ascend with <b>1 undecillion</b> cookies baked.<q>Good day sir!</q>', [29, 6]);
new Game.Achievement('Humble rebeginnings', 'Ascend with <b>1 duodecillion</b> cookies baked.<q>Started from the bottom, now we\'re here.</q>', [29, 6]);
new Game.Achievement('The end of the world', 'Ascend with <b>1 tredecillion</b> cookies baked.<q>(as we know it)</q>', [21, 25]);
new Game.Achievement('Oh, you\'re back', 'Ascend with <b>1 quattuordecillion</b> cookies baked.<q>Missed us?</q>', [21, 25]);
new Game.Achievement('Lazarus', 'Ascend with <b>1 quindecillion</b> cookies baked.<q>All rise.</q>', [21, 25]);

Game.CpsAchievement('Leisurely pace');
Game.CpsAchievement('Hypersonic');

Game.BankAchievement('Feed me, Orteil');
Game.BankAchievement('And then what?');

order = 7002;
new Game.Achievement('Tricentennial and a half', 'Have at least <b>350 of everything</b>.<q>(it\'s free real estate)</q>', [21, 26]);
new Game.Achievement('Quadricentennial', 'Have at least <b>400 of everything</b>.<q>You\'ve had to do horrible things to get this far.<br>Horrible... horrible things.</q>', [22, 26]);
new Game.Achievement('Quadricentennial and a half', 'Have at least <b>450 of everything</b>.<q>At this point, you might just be compensating for something.</q>', [23, 26]);

new Game.Achievement('Quincentennial', 'Have at least <b>500 of everything</b>.<q>Some people would say you\'re halfway there.<br>We do not care for those people and their reckless sense of unchecked optimism.</q>', [29, 25]);

order = 21100;
new Game.Achievement('Maillard reaction', 'Harvest a <b>caramelized sugar lump</b>.', [29, 27]);

order = 30250;
new Game.Achievement('When the cookies ascend just right', 'Ascend with exactly <b>1,000,000,000,000 cookies</b>.', [25, 7], 'shadow'); //this achievement is shadow because it is only achievable through blind luck or reading external guides; this may change in the future


order = 1050;
new Game.Achievement('With her finger and her thumb', 'Have <b>600</b> cursors.', [0, 16]);

order = 1100;
Game.TieredAchievement('But wait \'til you get older', 'Have <b>550</b> grandmas.', 'Grandma', 12);
order = 1200;
Game.TieredAchievement('Sharpest tool in the shed', 'Have <b>500</b> farms.', 'Farm', 11);
order = 1300;
Game.TieredAchievement('Hey now, you\'re a rock', 'Have <b>500</b> mines.', 'Mine', 11);
order = 1400;
Game.TieredAchievement('Break the mold', 'Have <b>500</b> factories.', 'Factory', 11);
order = 1425;
Game.TieredAchievement('Get the show on, get paid', 'Have <b>500</b> banks.', 'Bank', 11);
order = 1450;
Game.TieredAchievement('My world\'s on fire, how about yours', 'Have <b>500</b> temples.', 'Temple', 11);
order = 1475;
Game.TieredAchievement('The meteor men beg to differ', 'Have <b>500</b> wizard towers.', 'Wizard tower', 11);
order = 1500;
Game.TieredAchievement('Only shooting stars', 'Have <b>500</b> shipments.', 'Shipment', 11);
order = 1600;
Game.TieredAchievement('We could all use a little change', 'Have <b>500</b> alchemy labs.', 'Alchemy lab', 11); //"all that glitters is gold" was already an achievement
order = 1700;
Game.TieredAchievement('Your brain gets smart but your head gets dumb', 'Have <b>500</b> portals.', 'Portal', 11);
order = 1800;
Game.TieredAchievement('The years start coming', 'Have <b>500</b> time machines.', 'Time machine', 11);
order = 1900;
Game.TieredAchievement('What a concept', 'Have <b>500</b> antimatter condensers.', 'Antimatter condenser', 11);
order = 2000;
Game.TieredAchievement('You\'ll never shine if you don\'t glow', 'Have <b>500</b> prisms.', 'Prism', 11);
order = 2100;
Game.TieredAchievement('You\'ll never know if you don\'t go', 'Have <b>500</b> chancemakers.', 'Chancemaker', 11);

order = 2200;
Game.TieredAchievement('Self-contained', 'Have <b>1</b> fractal engine.', 'Fractal engine', 1);
Game.TieredAchievement('Threw you for a loop', 'Have <b>50</b> fractal engines.', 'Fractal engine', 2);
Game.TieredAchievement('The sum of its parts', 'Have <b>100</b> fractal engines.', 'Fractal engine', 3);
Game.TieredAchievement('Bears repeating', 'Have <b>150</b> fractal engines.<q>Where did these come from?</q>', 'Fractal engine', 4);
Game.TieredAchievement('More of the same', 'Have <b>200</b> fractal engines.', 'Fractal engine', 5);
Game.TieredAchievement('Last recurse', 'Have <b>250</b> fractal engines.', 'Fractal engine', 6);
Game.TieredAchievement('Out of one, many', 'Have <b>300</b> fractal engines.', 'Fractal engine', 7);
Game.TieredAchievement('An example of recursion', 'Have <b>350</b> fractal engines.', 'Fractal engine', 8);
Game.TieredAchievement('For more information on this achievement, please refer to its title', 'Have <b>400</b> fractal engines.', 'Fractal engine', 9);
Game.TieredAchievement('I\'m so meta, even this achievement', 'Have <b>450</b> fractal engines.', 'Fractal engine', 10);
Game.TieredAchievement('Never get bored', 'Have <b>500</b> fractal engines.', 'Fractal engine', 11);

order = 2220;
Game.ProductionAchievement('The needs of the many', 'Fractal engine', 1);
Game.ProductionAchievement('Eating its own', 'Fractal engine', 2);
Game.ProductionAchievement('We must go deeper', 'Fractal engine', 3);

new Game.Achievement('Sierpinski rhomboids', 'Reach level <b>10</b> fractal engines.', [20, 26]);
Game.Objects['Fractal engine'].levelAchiev10 = Game.last;

Game.CpsAchievement('Gotta go fast');
Game.BankAchievement('I think it\'s safe to say you\'ve got it made');

order = 6000;
new Game.Achievement('Renaissance baker', 'Own <b>400</b> upgrades and <b>4000</b> buildings.<q>If you have seen further, it is by standing on the shoulders of giants - a mysterious species of towering humanoids until now thought long-extinct.</q>', [10, 10]);

order = 1150;
new Game.Achievement('Veteran', 'Own at least <b>14</b> grandma types.<q>14\'s a crowd!</q>', [10, 9]);

order = 10000;
new Game.Achievement('Thick-skinned', 'Have your <b>reinforced membrane</b> protect the <b>shimmering veil</b>.', [7, 10]);


order = 2300;
Game.TieredAchievement('F12', 'Have <b>1</b> javascript console.', 'Javascript console', 1);
Game.TieredAchievement('Variable success', 'Have <b>50</b> javascript consoles.', 'Javascript console', 2);
Game.TieredAchievement('No comments', 'Have <b>100</b> javascript consoles.', 'Javascript console', 3);
Game.TieredAchievement('Up to code', 'Have <b>150</b> javascript consoles.', 'Javascript console', 4);
Game.TieredAchievement('Works on my machine', 'Have <b>200</b> javascript consoles.', 'Javascript console', 5);
Game.TieredAchievement('Technical debt', 'Have <b>250</b> javascript consoles.', 'Javascript console', 6);
Game.TieredAchievement('Mind your language', 'Have <b>300</b> javascript consoles.', 'Javascript console', 7);
Game.TieredAchievement('Inconsolable', 'Have <b>350</b> javascript consoles.', 'Javascript console', 8);
Game.TieredAchievement('Closure', 'Have <b>400</b> javascript consoles.', 'Javascript console', 9);
Game.TieredAchievement('Dude what if we\'re all living in a simulation like what if we\'re all just code on a computer somewhere', 'Have <b>450</b> javascript consoles.', 'Javascript console', 10);
Game.TieredAchievement('Taking the back streets', 'Have <b>500</b> javascript consoles.', 'Javascript console', 11);

order = 2320;
Game.ProductionAchievement('Inherited prototype', 'Javascript console', 1);
Game.ProductionAchievement('A model of document object', 'Javascript console', 2);
Game.ProductionAchievement('First-class citizen', 'Javascript console', 3);

new Game.Achievement('Alexandria', 'Reach level <b>10</b> javascript consoles.', [32, 26]);
Game.Objects['Javascript console'].levelAchiev10 = Game.last;

Game.CpsAchievement('Bake him away, toys');
Game.CpsAchievement('You\'re #1 so why try harder');
Game.CpsAchievement('Haven\'t even begun to peak');
Game.BankAchievement('A sometimes food');
Game.BankAchievement('Not enough of a good thing');
Game.BankAchievement('Horn of plenty');

order = 30050;
new Game.Achievement('Smurf account', 'Ascend with <b>1 sexdecillion</b> cookies baked.<q>It\'s like you just appeared out of the blue!</q>', [21, 32]);
new Game.Achievement('If at first you don\'t succeed', 'Ascend with <b>1 septendecillion</b> cookies baked.<q>If at first you don\'t succeed, try, try, try again.<br>But isn\'t that the definition of insanity?</q>', [21, 32]);

order = 33000;
new Game.Achievement('O Fortuna', 'Own every <b>fortune upgrade</b>.<div class="line"></div>Owning this achievement makes fortunes appear <b>twice as often</b>; unlocked fortune upgrades also have a <b>40% chance</b> to carry over after ascending.', [29, 8]);

order = 61615;
new Game.Achievement('Initial public offering', 'Make your first stock market profit.', [0, 33]);
new Game.Achievement('Rookie numbers', 'Own at least <b>100</b> of every stock market good.<q>Gotta pump those numbers up!</q>', [9, 33]);
new Game.Achievement('No nobility in poverty', 'Own at least <b>500</b> of every stock market good.<q>What kind of twisted individual is out there cramming camels through needle holes anyway?</q>', [10, 33]);
new Game.Achievement('Full warehouses', 'Own at least <b>1,000</b> of a stock market good.', [11, 33]);
new Game.Achievement('Make my day', 'Make <b>a day</b> of CpS ($86,400) in 1 stock market sale.', [1, 33]);
new Game.Achievement('Buy buy buy', 'Spend <b>a day</b> of CpS ($86,400) in 1 stock market purchase.', [1, 33]);
new Game.Achievement('Liquid assets', 'Have your stock market profits surpass <b>a whole year</b> of CpS ($31,536,000).', [12, 33]);
new Game.Achievement('Pyramid scheme', 'Unlock the <b>highest-tier</b> stock market headquarters.', [18, 33]);

order = 10000;
new Game.Achievement('Jellicles', 'Own <b>10</b> kitten upgrades.<q>Jellicles can and jellicles do! Make sure to wash your jellicles every day!</q>', [18, 19]);

order = 7002;
new Game.Achievement('Quincentennial and a half', 'Have at least <b>550 of everything</b>.<q>This won\'t fill the churning void inside, you know.</q>', [29, 26]);

Game.CpsAchievement('What did we even eat before these');
Game.CpsAchievement('Heavy flow');
Game.CpsAchievement('More you say?');
Game.BankAchievement('Large and in charge');
Game.BankAchievement('Absolutely stuffed');
Game.BankAchievement('It\'s only wafer-thin', 'Just the one!');

order = 1000;
new Game.Achievement('Clickety split', 'Make <b>1,000,000,000,000,000,000,000,000,000</b> cookies from clicking.', [11, 31]);
order = 1050;
Game.TieredAchievement('Gotta hand it to you', 'Have <b>700</b> cursors.', 'Cursor', 1);
order = 1100;
Game.TieredAchievement('Okay boomer', 'Have <b>600</b> grandmas.', 'Grandma', 13);
order = 1200;
Game.TieredAchievement('Overripe', 'Have <b>550</b> farms.', 'Farm', 12);
order = 1300;
Game.TieredAchievement('Rock on', 'Have <b>550</b> mines.', 'Mine', 12);
order = 1400;
Game.TieredAchievement('Self-manmade man', 'Have <b>550</b> factories.', 'Factory', 12);
order = 1425;
Game.TieredAchievement('Checks out', 'Have <b>550</b> banks.', 'Bank', 12);
order = 1450;
Game.TieredAchievement('Living on a prayer', 'Have <b>550</b> temples.', 'Temple', 12);
order = 1475;
Game.TieredAchievement('Higitus figitus migitus mum', 'Have <b>550</b> wizard towers.', 'Wizard tower', 12);
order = 1500;
Game.TieredAchievement('The incredible journey', 'Have <b>550</b> shipments.', 'Shipment', 12);
order = 1600;
Game.TieredAchievement('Just a phase', 'Have <b>550</b> alchemy labs.', 'Alchemy lab', 12);
order = 1700;
Game.TieredAchievement('Don\'t let me leave, Murph', 'Have <b>550</b> portals.', 'Portal', 12);
order = 1800;
Game.TieredAchievement('Caveman to cosmos', 'Have <b>550</b> time machines.', 'Time machine', 12);
order = 1900;
Game.TieredAchievement('Particular tastes', 'Have <b>550</b> antimatter condensers.', 'Antimatter condenser', 12);
order = 2000;
Game.TieredAchievement('A light snack', 'Have <b>550</b> prisms.', 'Prism', 12);
order = 2100;
Game.TieredAchievement('Tempting fate', 'Have <b>550</b> chancemakers.', 'Chancemaker', 12);
order = 2200;
Game.TieredAchievement('Tautological', 'Have <b>550</b> fractal engines.', 'Fractal engine', 12);
order = 2300;
Game.TieredAchievement('Curly braces', 'Have <b>550</b> javascript consoles.<q>Or as the French call them, mustache boxes.<br>Go well with quotes.</q>', 'Javascript console', 12);

order = 10000;
new Game.Achievement('Seven horseshoes', 'Click <b>27777 golden cookies</b>.<q>Enough for one of those funky horses that graze near your factories.</q>', [21, 33], 'shadow');

order = 11000;
new Game.Achievement('Olden days', 'Find the <b>forgotten madeleine</b>.<q>DashNet Farms remembers.</q>', [12, 3]);

//end of achievements