Game.Object = function (name, commonName, desc, icon, iconColumn, art, price, cps, buyFunction) {
    this.id = Game.ObjectsN;
    this.name = name;
    this.displayName = this.name;
    commonName = commonName.split('|');
    this.single = commonName[0];
    this.plural = commonName[1];
    this.actionName = commonName[2];
    this.extraName = commonName[3];
    this.extraPlural = commonName[4];
    this.desc = desc;
    this.basePrice = price;
    this.price = this.basePrice;
    this.bulkPrice = this.price;
    this.cps = cps;
    this.baseCps = this.cps;
    this.mouseOn = false;
    this.mousePos = [-100, -100];
    this.productionAchievs = [];

    this.n = this.id;
    if (this.n != 0) {
        //new automated price and CpS curves
        //this.baseCps=Math.ceil(((this.n*0.5)*Math.pow(this.n*1,this.n*0.9))*10)/10;
        //this.baseCps=Math.ceil((Math.pow(this.n*1,this.n*0.5+2.35))*10)/10;//by a fortunate coincidence, this gives the 3rd, 4th and 5th buildings a CpS of 10, 69 and 420
        this.baseCps = Math.ceil((Math.pow(this.n * 1, this.n * 0.5 + 2)) * 10) / 10; //0.45 used to be 0.5
        //this.baseCps=Math.ceil((Math.pow(this.n*1,this.n*0.45+2.10))*10)/10;
        //clamp 14,467,199 to 14,000,000 (there's probably a more elegant way to do that)
        var digits = Math.pow(10, (Math.ceil(Math.log(Math.ceil(this.baseCps)) / Math.LN10))) / 100;
        this.baseCps = Math.round(this.baseCps / digits) * digits;

        this.basePrice = (this.n * 1 + 9 + (this.n < 5 ? 0 : Math.pow(this.n - 5, 1.75) * 5)) * Math.pow(10, this.n) * (Math.max(1, this.n - 14));
        //this.basePrice=(this.n*2.5+7.5)*Math.pow(10,this.n);
        var digits = Math.pow(10, (Math.ceil(Math.log(Math.ceil(this.basePrice)) / Math.LN10))) / 100;
        this.basePrice = Math.round(this.basePrice / digits) * digits;
        if (this.id >= 16) this.basePrice *= 10;
        this.price = this.basePrice;
        this.bulkPrice = this.price;
    }

    this.totalCookies = 0;
    this.storedCps = 0;
    this.storedTotalCps = 0;
    this.icon = icon;
    this.iconColumn = iconColumn;
    this.art = art;
    if (art.base) {
        art.pic = art.base + '.png';
        art.bg = art.base + 'Background.png';
    }
    this.buyFunction = buyFunction;
    this.locked = 1;
    this.level = 0;
    this.vanilla = Game.vanilla;

    this.tieredUpgrades = [];
    this.tieredAchievs = [];
    this.synergies = [];
    this.fortune = 0;

    this.amount = 0;
    this.bought = 0;
    this.highest = 0;
    this.free = 0;

    this.eachFrame = 0;

    this.minigameUrl = 0; //if this is defined, load the specified script if the building's level is at least 1
    this.minigameName = 0;
    this.onMinigame = false;
    this.minigameLoaded = false;

    this.switchMinigame = function (on) //change whether we're on the building's minigame
    {
        if (!Game.isMinigameReady(this)) on = false;
        if (on == -1) on = !this.onMinigame;
        this.onMinigame = on;
        if (this.id != 0) {
            if (this.onMinigame) {
                l('row' + this.id).classList.add('onMinigame');
                //l('rowSpecial'+this.id).style.display='block';
                //l('rowCanvas'+this.id).style.display='none';
                if (this.minigame.onResize) this.minigame.onResize();
            } else {
                l('row' + this.id).classList.remove('onMinigame');
                //l('rowSpecial'+this.id).style.display='none';
                //l('rowCanvas'+this.id).style.display='block';
            }
        }
        this.refresh();
    }

    this.getPrice = function (n) {
        var price = this.basePrice * Math.pow(Game.priceIncrease, Math.max(0, this.amount - this.free));
        price = Game.modifyBuildingPrice(this, price);
        return Math.ceil(price);
    }
    this.getSumPrice = function (amount) //return how much it would cost to buy [amount] more of this building
    {
        var price = 0;
        for (var i = Math.max(0, this.amount); i < Math.max(0, (this.amount) + amount); i++) {
            price += this.basePrice * Math.pow(Game.priceIncrease, Math.max(0, i - this.free));
        }
        price = Game.modifyBuildingPrice(this, price);
        return Math.ceil(price);
    }
    this.getReverseSumPrice = function (amount) //return how much you'd get from selling [amount] of this building
    {
        var price = 0;
        for (var i = Math.max(0, (this.amount) - amount); i < Math.max(0, this.amount); i++) {
            price += this.basePrice * Math.pow(Game.priceIncrease, Math.max(0, i - this.free));
        }
        price = Game.modifyBuildingPrice(this, price);
        price *= this.getSellMultiplier();
        return Math.ceil(price);
    }
    this.getSellMultiplier = function () {
        var giveBack = 0.25;
        //if (Game.hasAura('Earth Shatterer')) giveBack=0.5;
        giveBack *= 1 + Game.auraMult('Earth Shatterer');
        return giveBack;
    }

    this.buy = function (amount) {
        if (Game.buyMode == -1) {
            this.sell(Game.buyBulk, 1);
            return 0;
        }
        var success = 0;
        var moni = 0;
        var bought = 0;
        if (!amount) amount = Game.buyBulk;
        if (amount == -1) amount = 1000;
        for (var i = 0; i < amount; i++) {
            var price = this.getPrice();
            if (Game.cookies >= price) {
                bought++;
                moni += price;
                Game.Spend(price);
                this.amount++;
                this.bought++;
                price = this.getPrice();
                this.price = price;
                if (this.buyFunction) this.buyFunction();
                Game.recalculateGains = 1;
                if (this.amount == 1 && this.id != 0) l('row' + this.id).classList.add('enabled');
                this.highest = Math.max(this.highest, this.amount);
                Game.BuildingsOwned++;
                success = 1;
            }
        }
        if (success) {
            PlaySound('assets/snd/buy' + choose([1, 2, 3, 4]) + '.mp3', 0.75);
            this.refresh();
        }
        //if (moni>0 && amount>1) Game.Notify(this.name,'Bought <b>'+bought+'</b> for '+Beautify(moni)+' cookies','',2);
    }
    this.sell = function (amount, bypass) {
        var success = 0;
        var moni = 0;
        var sold = 0;
        if (amount == -1) amount = this.amount;
        if (!amount) amount = Game.buyBulk;
        for (var i = 0; i < amount; i++) {
            var price = this.getPrice();
            var giveBack = this.getSellMultiplier();
            price = Math.floor(price * giveBack);
            if (this.amount > 0) {
                sold++;
                moni += price;
                Game.cookies += price;
                Game.cookiesEarned = Math.max(Game.cookies, Game.cookiesEarned); //this is to avoid players getting the cheater achievement when selling buildings that have a higher price than they used to
                this.amount--;
                price = this.getPrice();
                this.price = price;
                if (this.sellFunction) this.sellFunction();
                Game.recalculateGains = 1;
                if (this.amount == 0 && this.id != 0) l('row' + this.id).classList.remove('enabled');
                Game.BuildingsOwned--;
                success = 1;
            }
        }
        if (success && Game.hasGod) {
            var godLvl = Game.hasGod('ruin');
            var old = Game.hasBuff('Devastation');
            if (old) {
                if (godLvl == 1) old.multClick += sold * 0.01;
                else if (godLvl == 2) old.multClick += sold * 0.005;
                else if (godLvl == 3) old.multClick += sold * 0.0025;
            } else {
                if (godLvl == 1) Game.gainBuff('devastation', 10, 1 + sold * 0.01);
                else if (godLvl == 2) Game.gainBuff('devastation', 10, 1 + sold * 0.005);
                else if (godLvl == 3) Game.gainBuff('devastation', 10, 1 + sold * 0.0025);
            }
        }
        if (success) {
            PlaySound('assets/snd/sell' + choose([1, 2, 3, 4]) + '.mp3', 0.75);
            this.refresh();
        }
        //if (moni>0) Game.Notify(this.name,'Sold <b>'+sold+'</b> for '+Beautify(moni)+' cookies','',2);
    }
    this.sacrifice = function (amount) //sell without getting back any money
    {
        var success = 0;
        //var moni=0;
        var sold = 0;
        if (amount == -1) amount = this.amount;
        if (!amount) amount = 1;
        for (var i = 0; i < amount; i++) {
            var price = this.getPrice();
            price = Math.floor(price * 0.5);
            if (this.amount > 0) {
                sold++;
                //moni+=price;
                //Game.cookies+=price;
                //Game.cookiesEarned=Math.max(Game.cookies,Game.cookiesEarned);
                this.amount--;
                price = this.getPrice();
                this.price = price;
                if (this.sellFunction) this.sellFunction();
                Game.recalculateGains = 1;
                if (this.amount == 0 && this.id != 0) l('row' + this.id).classList.remove('enabled');
                Game.BuildingsOwned--;
                success = 1;
            }
        }
        if (success) {
            this.refresh();
        }
        //if (moni>0) Game.Notify(this.name,'Sold <b>'+sold+'</b> for '+Beautify(moni)+' cookies','',2);
    }
    this.buyFree = function (amount) //unlike getFree, this still increases the price
    {
        for (var i = 0; i < amount; i++) {
            if (Game.cookies >= price) {
                this.amount++;
                this.bought++;
                this.price = this.getPrice();
                Game.recalculateGains = 1;
                if (this.amount == 1 && this.id != 0) l('row' + this.id).classList.add('enabled');
                this.highest = Math.max(this.highest, this.amount);
                Game.BuildingsOwned++;
            }
        }
        this.refresh();
    }
    this.getFree = function (amount) //get X of this building for free, with the price behaving as if you still didn't have them
    {
        this.amount += amount;
        this.bought += amount;
        this.free += amount;
        this.highest = Math.max(this.highest, this.amount);
        Game.BuildingsOwned += amount;
        this.highest = Math.max(this.highest, this.amount);
        this.refresh();
    }
    this.getFreeRanks = function (amount) //this building's price behaves as if you had X less of it
    {
        this.free += amount;
        this.refresh();
    }

    this.tooltip = function () {
        var me = this;
        var desc = me.desc;
        var name = me.name;
        if (Game.season == 'fools') {
            if (!Game.foolObjects[me.name]) {
                name = Game.foolObjects['Unknown'].name;
                desc = Game.foolObjects['Unknown'].desc;
            } else {
                name = Game.foolObjects[me.name].name;
                desc = Game.foolObjects[me.name].desc;
            }
        }
        var icon = [me.iconColumn, 0];
        if (me.locked) {
            name = '???';
            desc = '';
            icon = [0, 7];
        }
        //if (l('rowInfo'+me.id) && Game.drawT%10==0) l('rowInfoContent'+me.id).innerHTML='&bull; '+me.amount+' '+(me.amount==1?me.single:me.plural)+'<br>&bull; producing '+Beautify(me.storedTotalCps,1)+' '+(me.storedTotalCps==1?'cookie':'cookies')+' per second<br>&bull; total : '+Beautify(me.totalCookies)+' '+(Math.floor(me.totalCookies)==1?'cookie':'cookies')+' '+me.actionName;

        var canBuy = false;
        var price = me.bulkPrice;
        if ((Game.buyMode == 1 && Game.cookies >= price) || (Game.buyMode == -1 && me.amount > 0)) canBuy = true;

        var synergiesStr = '';
        //note : might not be entirely accurate, math may need checking
        if (me.amount > 0) {
            var synergiesWith = {};
            var synergyBoost = 0;

            if (me.name == 'Grandma') {
                for (var i in Game.GrandmaSynergies) {
                    if (Game.Has(Game.GrandmaSynergies[i])) {
                        var other = Game.Upgrades[Game.GrandmaSynergies[i]].buildingTie;
                        var mult = me.amount * 0.01 * (1 / (other.id - 1));
                        var boost = (other.storedTotalCps * Game.globalCpsMult) - (other.storedTotalCps * Game.globalCpsMult) / (1 + mult);
                        synergyBoost += boost;
                        if (!synergiesWith[other.plural]) synergiesWith[other.plural] = 0;
                        synergiesWith[other.plural] += mult;
                    }
                }
            } else if (me.name == 'Portal' && Game.Has('Elder Pact')) {
                var other = Game.Objects['Grandma'];
                var boost = (me.amount * 0.05 * other.amount) * Game.globalCpsMult;
                synergyBoost += boost;
                if (!synergiesWith[other.plural]) synergiesWith[other.plural] = 0;
                synergiesWith[other.plural] += boost / (other.storedTotalCps * Game.globalCpsMult);
            }

            for (var i in me.synergies) {
                var it = me.synergies[i];
                if (Game.Has(it.name)) {
                    var weight = 0.05;
                    var other = it.buildingTie1;
                    if (me == it.buildingTie1) {
                        weight = 0.001;
                        other = it.buildingTie2;
                    }
                    var boost = (other.storedTotalCps * Game.globalCpsMult) - (other.storedTotalCps * Game.globalCpsMult) / (1 + me.amount * weight);
                    synergyBoost += boost;
                    if (!synergiesWith[other.plural]) synergiesWith[other.plural] = 0;
                    synergiesWith[other.plural] += me.amount * weight;
                    //synergiesStr+='Synergy with '+other.name+'; we boost it by '+Beautify((me.amount*weight)*100,1)+'%, producing '+Beautify(boost)+' CpS. My synergy boost is now '+Beautify((synergyBoost/Game.cookiesPs)*100,1)+'%.<br>';
                }
            }
            if (synergyBoost > 0) {
                for (var i in synergiesWith) {
                    if (synergiesStr != '') synergiesStr += ', ';
                    synergiesStr += i + ' +' + Beautify(synergiesWith[i] * 100, 1) + '%';
                }
                //synergiesStr='...along with <b>'+Beautify(synergyBoost,1)+'</b> cookies through synergies with other buildings ('+synergiesStr+'; <b>'+Beautify((synergyBoost/Game.cookiesPs)*100,1)+'%</b> of total CpS)';
                //synergiesStr='...also boosting some other buildings, accounting for <b>'+Beautify(synergyBoost,1)+'</b> cookies per second (a combined <b>'+Beautify((synergyBoost/Game.cookiesPs)*100,1)+'%</b> of total CpS) : '+synergiesStr+'';
                synergiesStr = '...also boosting some other buildings : ' + synergiesStr + ' - all combined, these boosts account for <b>' + Beautify(synergyBoost, 1) + '</b> cookies per second (<b>' + Beautify((synergyBoost / Game.cookiesPs) * 100, 1) + '%</b> of total CpS)';
            }
        }

        return '<div style="min-width:350px;padding:8px;"><div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;' + (icon[2] ? 'background-image:url(' + icon[2] + ');' : '') + 'background-position:' + (-icon[0] * 48) + 'px ' + (-icon[1] * 48) + 'px;"></div><div style="float:right;text-align:right;"><span class="price' + (canBuy ? '' : ' disabled') + '">' + Beautify(Math.round(price)) + '</span>' + Game.costDetails(price) + '</div><div class="name">' + name + '</div>' + '<small>[owned : ' + me.amount + '</small>]' + (me.free > 0 ? ' <small>[free : ' + me.free + '</small>!]' : '') +
            '<div class="line"></div><div class="description">' + desc + '</div>' +
            (me.totalCookies > 0 ? (
                '<div class="line"></div><div class="data">' +
                (me.amount > 0 ? '&bull; each ' + me.single + ' produces <b>' + Beautify((me.storedTotalCps / me.amount) * Game.globalCpsMult, 1) + '</b> ' + ((me.storedTotalCps / me.amount) * Game.globalCpsMult == 1 ? 'cookie' : 'cookies') + ' per second<br>' : '') +
                '&bull; ' + me.amount + ' ' + (me.amount == 1 ? me.single : me.plural) + ' producing <b>' + Beautify(me.storedTotalCps * Game.globalCpsMult, 1) + '</b> ' + (me.storedTotalCps * Game.globalCpsMult == 1 ? 'cookie' : 'cookies') + ' per second (<b>' + Beautify(Game.cookiesPs > 0 ? ((me.amount > 0 ? ((me.storedTotalCps * Game.globalCpsMult) / Game.cookiesPs) : 0) * 100) : 0, 1) + '%</b> of total CpS)<br>' +
                (synergiesStr ? ('&bull; ' + synergiesStr + '<br>') : '') +
                '&bull; <b>' + Beautify(me.totalCookies) + '</b> ' + (Math.floor(me.totalCookies) == 1 ? 'cookie' : 'cookies') + ' ' + me.actionName + ' so far</div>'
            ) : '') +
            '</div>';
    }
    this.levelTooltip = function () {
        var me = this;
        return '<div style="width:280px;padding:8px;"><b>Level ' + Beautify(me.level) + ' ' + me.plural + '</b><div class="line"></div>' + (me.level == 1 ? me.extraName : me.extraPlural).replace('[X]', Beautify(me.level)) + ' granting <b>+' + Beautify(me.level) + '% ' + me.name + ' CpS</b>.<div class="line"></div>Click to level up for <span class="price lump' + (Game.lumps >= me.level + 1 ? '' : ' disabled') + '">' + Beautify(me.level + 1) + ' sugar lump' + (me.level == 0 ? '' : 's') + '</span>.' + ((me.level == 0 && me.minigameUrl) ? '<div class="line"></div><b>Levelling up this building unlocks a minigame.</b>' : '') + '</div>';
    }
    /*this.levelUp=function()
    {
        var me=this;
        if (Game.lumps<me.level+1) return 0;
        Game.lumps-=me.level+1;
        me.level+=1;
        if (me.level>=10 && me.levelAchiev10) Game.Win(me.levelAchiev10.name);
        PlaySound('assets/snd/upgrade.mp3',0.6);
        Game.LoadMinigames();
        me.refresh();
        if (l('productLevel'+me.id)){var rect=l('productLevel'+me.id).getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);}
        Game.recalculateGains=1;
        if (me.minigame && me.minigame.onLevel) me.minigame.onLevel(me.level);
    }*/
    this.levelUp = function (me) {
        return function () {
            Game.spendLump(me.level + 1, 'level up your ' + me.plural, function () {
                me.level += 1;
                if (me.level >= 10 && me.levelAchiev10) Game.Win(me.levelAchiev10.name);
                PlaySound('assets/snd/upgrade.mp3', 0.6);
                Game.LoadMinigames();
                me.refresh();
                if (l('productLevel' + me.id)) {
                    var rect = l('productLevel' + me.id).getBoundingClientRect();
                    Game.SparkleAt((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2 - 24);
                }
                if (me.minigame && me.minigame.onLevel) me.minigame.onLevel(me.level);
            })();
        };
    }(this);

    this.refresh = function () //show/hide the building display based on its amount, and redraw it
    {
        this.price = this.getPrice();
        if (Game.buyMode == 1) this.bulkPrice = this.getSumPrice(Game.buyBulk);
        else if (Game.buyMode == -1 && Game.buyBulk == -1) this.bulkPrice = this.getReverseSumPrice(1000);
        else if (Game.buyMode == -1) this.bulkPrice = this.getReverseSumPrice(Game.buyBulk);
        this.rebuild();
        if (this.amount == 0 && this.id != 0) l('row' + this.id).classList.remove('enabled');
        else if (this.amount > 0 && this.id != 0) l('row' + this.id).classList.add('enabled');
        if (this.muted > 0 && this.id != 0) {
            l('row' + this.id).classList.add('muted');
            l('mutedProduct' + this.id).style.display = 'inline-block';
        } else if (this.id != 0) {
            l('row' + this.id).classList.remove('muted');
            l('mutedProduct' + this.id).style.display = 'none';
        }
        //if (!this.onMinigame && !this.muted) {}
        //else this.pics=[];
    }
    this.rebuild = function () {
        var me = this;
        //var classes='product';
        var price = me.bulkPrice;
        /*if (Game.cookiesEarned>=me.basePrice || me.bought>0) {classes+=' unlocked';me.locked=0;} else {classes+=' locked';me.locked=1;}
        if (Game.cookies>=price) classes+=' enabled'; else classes+=' disabled';
        if (me.l.className.indexOf('toggledOff')!=-1) classes+=' toggledOff';
        */
        var icon = [0, me.icon];
        var iconOff = [1, me.icon];
        if (me.iconFunc) icon = me.iconFunc();

        var desc = me.desc;
        var name = me.name;
        var displayName = me.displayName;
        if (Game.season == 'fools') {
            if (!Game.foolObjects[me.name]) {
                icon = [2, 0];
                iconOff = [3, 0];
                name = Game.foolObjects['Unknown'].name;
                desc = Game.foolObjects['Unknown'].desc;
            } else {
                icon = [2, me.icon];
                iconOff = [3, me.icon];
                name = Game.foolObjects[me.name].name;
                desc = Game.foolObjects[me.name].desc;
            }
            displayName = name;
            if (name.length > 16) displayName = '<span style="font-size:75%;">' + name + '</span>';
        }
        icon = [icon[0] * 64, icon[1] * 64];
        iconOff = [iconOff[0] * 64, iconOff[1] * 64];

        //me.l.className=classes;
        //l('productIcon'+me.id).style.backgroundImage='url(assets/img/'+icon+')';
        l('productIcon' + me.id).style.backgroundPosition = '-' + icon[0] + 'px -' + icon[1] + 'px';
        //l('productIconOff'+me.id).style.backgroundImage='url(assets/img/'+iconOff+')';
        l('productIconOff' + me.id).style.backgroundPosition = '-' + iconOff[0] + 'px -' + iconOff[1] + 'px';
        l('productName' + me.id).innerHTML = displayName;
        l('productOwned' + me.id).innerHTML = me.amount ? me.amount : '';
        l('productPrice' + me.id).innerHTML = Beautify(Math.round(price));
        l('productPriceMult' + me.id).innerHTML = (Game.buyBulk > 1) ? ('x' + Game.buyBulk + ' ') : '';
        l('productLevel' + me.id).innerHTML = 'lvl ' + Beautify(me.level);
        if (Game.isMinigameReady(me) && Game.ascensionMode != 1) {
            l('productMinigameButton' + me.id).style.display = 'block';
            if (!me.onMinigame) l('productMinigameButton' + me.id).innerHTML = 'View ' + me.minigameName;
            else l('productMinigameButton' + me.id).innerHTML = 'Close ' + me.minigameName;
        } else l('productMinigameButton' + me.id).style.display = 'none';
    }
    this.muted = false;
    this.mute = function (val) {
        if (this.id == 0) return false;
        this.muted = val;
        if (val) {
            l('productMute' + this.id).classList.add('on');
            l('row' + this.id).classList.add('muted');
            l('mutedProduct' + this.id).style.display = 'inline-block';
        } else {
            l('productMute' + this.id).classList.remove('on');
            l('row' + this.id).classList.remove('muted');
            l('mutedProduct' + this.id).style.display = 'none';
        }
    };

    this.draw = function () {};

    if (this.id == 0) {
        var str = '<div class="productButtons">';
        str += '<div id="productLevel' + this.id + '" class="productButton productLevel lumpsOnly" onclick="Game.ObjectsById[' + this.id + '].levelUp()" ' + Game.getDynamicTooltip('Game.ObjectsById[' + this.id + '].levelTooltip', 'this') + '></div>';
        str += '<div id="productMinigameButton' + this.id + '" class="productButton productMinigameButton lumpsOnly" onclick="Game.ObjectsById[' + this.id + '].switchMinigame(-1);PlaySound(Game.ObjectsById[' + this.id + '].onMinigame?\'assets/snd/clickOn.mp3\':\'assets/snd/clickOff.mp3\');"></div>';
        str += '</div>';
        l('sectionLeftExtra').innerHTML = l('sectionLeftExtra').innerHTML + str;
    } else {
        var str = '<div class="row" id="row' + this.id + '"><div class="separatorBottom"></div>';
        str += '<div class="productButtons">';
        str += '<div id="productLevel' + this.id + '" class="productButton productLevel lumpsOnly" onclick="Game.ObjectsById[' + this.id + '].levelUp()" ' + Game.getDynamicTooltip('Game.ObjectsById[' + this.id + '].levelTooltip', 'this') + '></div>';
        str += '<div id="productMinigameButton' + this.id + '" class="productButton productMinigameButton lumpsOnly" onclick="Game.ObjectsById[' + this.id + '].switchMinigame(-1);PlaySound(Game.ObjectsById[' + this.id + '].onMinigame?\'assets/snd/clickOn.mp3\':\'assets/snd/clickOff.mp3\');"></div>';
        str += '<div class="productButton productMute" ' + Game.getTooltip('<div style="width:150px;text-align:center;font-size:11px;"><b>Mute</b><br>(Minimize this building)</div>', 'this') + ' onclick="Game.ObjectsById[' + this.id + '].mute(1);PlaySound(Game.ObjectsById[' + this.id + '].muted?\'assets/snd/clickOff.mp3\':\'assets/snd/clickOn.mp3\');" id="productMute' + this.id + '">Mute</div>';
        str += '</div>';
        str += '<canvas class="rowCanvas" id="rowCanvas' + this.id + '"></canvas>';
        str += '<div class="rowSpecial" id="rowSpecial' + this.id + '"></div>';
        str += '</div>';
        l('rows').innerHTML = l('rows').innerHTML + str;

        //building canvas
        this.pics = [];

        this.toResize = true;
        this.redraw = function () {
            var me = this;
            me.pics = [];
        }
        this.draw = function () {
            if (this.amount <= 0) return false;
            if (this.toResize) {
                this.canvas.width = this.canvas.clientWidth + 1;
                this.canvas.height = this.canvas.clientHeight;
                this.toResize = false;
            }
            var ctx = this.ctx;
            //clear
            //ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            ctx.globalAlpha = 1;

            //pic : a loaded picture or a function returning a loaded picture
            //bg : a loaded picture or a function returning a loaded picture - tiled as the background, 128x128
            //xV : the pictures will have a random horizontal shift by this many pixels
            //yV : the pictures will have a random vertical shift by this many pixels
            //w : how many pixels between each picture (or row of pictures)
            //x : horizontal offset
            //y : vertical offset (+32)
            //rows : if >1, arrange the pictures in rows containing this many pictures
            //frames : if present, slice the pic in [frames] horizontal slices and pick one at random

            var pic = this.art.pic;
            var bg = this.art.bg;
            var xV = this.art.xV || 0;
            var yV = this.art.yV || 0;
            var w = this.art.w || 48;
            var h = this.art.h || 48;
            var offX = this.art.x || 0;
            var offY = this.art.y || 0;
            var rows = this.art.rows || 1;
            var frames = this.art.frames || 1;

            if (typeof (bg) == 'string') ctx.fillPattern(Pic(this.art.bg), 0, 0, this.canvas.width, this.canvas.height, 128, 128);
            else bg(this, ctx);
            /*
            ctx.globalAlpha=0.5;
            if (typeof(bg)=='string')//test
            {
                ctx.fillPattern(Pic(this.art.bg),-128+Game.T%128,0,this.canvas.width+128,this.canvas.height,128,128);
                ctx.fillPattern(Pic(this.art.bg),-128+Math.floor(Game.T/2)%128,-128+Math.floor(Game.T/2)%128,this.canvas.width+128,this.canvas.height+128,128,128);
            }
            ctx.globalAlpha=1;
            */
            var maxI = Math.floor(this.canvas.width / (w / rows) + 1);
            var iT = Math.min(this.amount, maxI);
            var i = this.pics.length;


            var x = 0;
            var y = 0;
            var added = 0;
            if (i != iT) {
                //for (var iter=0;iter<3;iter++)
                //{
                while (i < iT)
                //if (i<iT)
                {
                    Math.seedrandom(Game.seed + ' ' + this.id + ' ' + i);
                    if (rows != 1) {
                        x = Math.floor(i / rows) * w + ((i % rows) / rows) * w + Math.floor((Math.random() - 0.5) * xV) + offX;
                        y = 32 + Math.floor((Math.random() - 0.5) * yV) + ((-rows / 2) * 32 / 2 + (i % rows) * 32 / 2) + offY;
                    } else {
                        x = i * w + Math.floor((Math.random() - 0.5) * xV) + offX;
                        y = 32 + Math.floor((Math.random() - 0.5) * yV) + offY;
                    }
                    var usedPic = (typeof (pic) == 'string' ? pic : pic(this, i));
                    var frame = -1;
                    if (frames > 1) frame = Math.floor(Math.random() * frames);
                    this.pics.push({
                        x: Math.floor(x),
                        y: Math.floor(y),
                        z: y,
                        pic: usedPic,
                        id: i,
                        frame: frame
                    });
                    i++;
                    added++;
                }
                while (i > iT)
                //else if (i>iT)
                {
                    this.pics.sort(Game.sortSpritesById);
                    this.pics.pop();
                    i--;
                    added--;
                }
                //}
                this.pics.sort(Game.sortSprites);
            }

            var len = this.pics.length;

            if (this.mouseOn) {
                var selected = -1;
                if (this.name == 'Grandma') {
                    //mouse detection only fits grandma sprites for now
                    var marginW = -18;
                    var marginH = -10;
                    for (var i = 0; i < len; i++) {
                        var pic = this.pics[i];
                        if (this.mousePos[0] >= pic.x - marginW && this.mousePos[0] < pic.x + 64 + marginW && this.mousePos[1] >= pic.y - marginH && this.mousePos[1] < pic.y + 64 + marginH) selected = i;
                    }
                    if (Game.prefs.customGrandmas && Game.customGrandmaNames.length > 0) {
                        var str = 'Names in white were submitted by our supporters on Patreon.';
                        ctx.globalAlpha = 0.75;
                        ctx.fillStyle = '#000';
                        ctx.font = '9px Merriweather';
                        ctx.textAlign = 'left';
                        ctx.fillRect(0, 0, ctx.measureText(str).width + 4, 12);
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'rgba(255,255,255,0.7)';
                        ctx.fillText(str, 2, 8);
                        ctx.fillStyle = 'rgba(255,255,255,1)';
                        ctx.fillText('white', 2 + ctx.measureText('Names in ').width, 8);
                    }
                }
            }

            Math.seedrandom();

            for (var i = 0; i < len; i++) {
                var pic = this.pics[i];
                var sprite = Pic(pic.pic);
                if (selected == i && this.name == 'Grandma') {
                    ctx.font = '14px Merriweather';
                    ctx.textAlign = 'center';
                    Math.seedrandom(Game.seed + ' ' + pic.id /*+' '+pic.id*/ ); //(Game.seed+' '+pic.id+' '+pic.x+' '+pic.y);
                    var years = ((Date.now() - new Date(2013, 7, 8)) / (1000 * 60 * 60 * 24 * 365)) + Math.random(); //the grandmas age with the game
                    var name = choose(Game.grandmaNames);
                    var custom = false;
                    if (Game.prefs.customGrandmas && Game.customGrandmaNames.length > 0 && Math.random() < 0.2) {
                        name = choose(Game.customGrandmaNames);
                        custom = true;
                    }
                    var text = name + ', age ' + Beautify(Math.floor(70 + Math.random() * 30 + years + this.level));
                    var width = ctx.measureText(text).width + 12;
                    var x = Math.max(0, Math.min(pic.x + 32 - width / 2 + Math.random() * 32 - 16, this.canvas.width - width));
                    var y = 4 + Math.random() * 8 - 4;
                    Math.seedrandom();
                    ctx.fillStyle = '#000';
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 8;
                    ctx.globalAlpha = 0.75;
                    ctx.beginPath();
                    ctx.moveTo(pic.x + 32, pic.y + 32);
                    ctx.lineTo(Math.floor(x + width / 2), Math.floor(y + 20));
                    ctx.stroke();
                    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(width), 24);
                    ctx.globalAlpha = 1;
                    if (custom) ctx.fillStyle = '#fff';
                    else ctx.fillStyle = 'rgba(255,255,255,0.7)';
                    ctx.fillText(text, Math.floor(x + width / 2), Math.floor(y + 16));

                    ctx.drawImage(sprite, Math.floor(pic.x + Math.random() * 4 - 2), Math.floor(pic.y + Math.random() * 4 - 2));
                }
                //else if (1) ctx.drawImage(sprite,0,0,sprite.width,sprite.height,pic.x,pic.y,sprite.width,sprite.height);
                else if (pic.frame != -1) ctx.drawImage(sprite, (sprite.width / frames) * pic.frame, 0, sprite.width / frames, sprite.height, pic.x, pic.y, (sprite.width / frames), sprite.height);
                else ctx.drawImage(sprite, pic.x, pic.y);

            }

            /*
            var picX=this.id;
            var picY=12;
            var w=1;
            var h=1;
            var w=Math.abs(Math.cos(Game.T*0.2+this.id*2-0.3))*0.2+0.8;
            var h=Math.abs(Math.sin(Game.T*0.2+this.id*2))*0.3+0.7;
            var x=64+Math.cos(Game.T*0.19+this.id*2)*8-24*w;
            var y=128-Math.abs(Math.pow(Math.sin(Game.T*0.2+this.id*2),5)*16)-48*h;
            ctx.drawImage(Pic('icons.png'),picX*48,picY*48,48,48,Math.floor(x),Math.floor(y),48*w,48*h);
            */
        }
    }

    Game.last = this;
    Game.Objects[this.name] = this;
    Game.ObjectsById[this.id] = this;
    Game.ObjectsN++;
    return this;
}