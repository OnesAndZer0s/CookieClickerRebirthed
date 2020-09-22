Game.seasons = {
    'christmas': {
        name: 'Christmas',
        start: 'Christmas season has started!',
        over: 'Christmas season is over.',
        trigger: 'Festive biscuit',
        time: [349, 365]
    },
    'valentines': {
        name: 'Valentine\'s day',
        start: 'Valentine\'s day has started!',
        over: 'Valentine\'s day is over.',
        trigger: 'Lovesick biscuit',
        time: [41, 46]
    },
    'fools': {
        name: 'Business day',
        start: 'Business day has started!',
        over: 'Business day is over.',
        trigger: 'Fool\'s biscuit',
        time: [90, 92]
    },
    'easter': {
        name: 'Easter',
        start: 'Easter season has started!',
        over: 'Easter season is over.',
        trigger: 'Bunny biscuit',
        time: [null, null]
    },
    'halloween': {
        name: 'Halloween',
        start: 'Halloween has started!',
        over: 'Halloween is over.',
        trigger: 'Ghostly biscuit',
        time: [null, null]
    },
    'patrick': {
        name: 'St. Patrick\'s Day',
        start: 'St. Patrick\'s Day has started!',
        over: 'St. Patrick\'s Day is over.',
        trigger: 'Ghostly biscuit',
        time: [null, null]
    },
    'thanksgiving': {
        name: 'Thanksgiving',
        start: 'Thanksgiving has started!',
        over: 'Thanksgiving is over.',
        trigger: 'Ghostly biscuit',
        time: [null, null]
    },
    'new_years': {
        name: 'New Year\'s',
        start: 'New Year\'s season has started!',
        over: 'New Year\'s season is over.',
        trigger: 'Ghostly biscuit',
        time: [null, null]
    },
    'groundhog': {
        name: 'Groundhog\'s Day',
        start: 'Groundhog\'s Day has started!',
        over: 'Groundhog\'s Day is over.',
        trigger: 'Ghostly biscuit',
        time: [null, null]
    }
};


Game.baseSeason = '';
var day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

var arr = Object.entries(Game.seasons);
for (var i = 0; i < arr.length; i++) {
    if (day >= arr[i][1].time[0] && day <= arr[i][1].time[1]) Game.baseSeason = arr[i][0];
}

Game.AnnounceSeason = function () {
    if (Game.season != '' && Game.season == Game.baseSeason) {
        switch (Game.season) {
            case 'valentines':
                Game.Notify('Valentine\'s Day!', 'It\'s <b>Valentine\'s season</b>!<br>Love\'s in the air and cookies are just that much sweeter!', [20, 3], 60 * 3); break;
            case 'fools':
                Game.Notify('Business Day!', 'It\'s <b>Business season</b>!<br>Don\'t panic! Things are gonna be looking a little more corporate for a few days.', [17, 6], 60 * 3); break;
            case 'halloween':
                Game.Notify('Halloween!', 'It\'s <b>Halloween season</b>!<br>Everything is just a little bit spookier!', [13, 8], 60 * 3); break;
            case 'christmas':
                Game.Notify('Christmas time!', 'It\'s <b>Christmas season</b>!<br>Bring good cheer to all and you just may get cookies in your stockings!', [12, 10], 60 * 3); break;
            case 'easter':
                Game.Notify('Easter!', 'It\'s <b>Easter season</b>!<br>Keep an eye out and you just might click a rabbit or two!', [0, 12], 60 * 3); break;
            case 'patrick':
                Game.Notify('St. Patricks Day!', 'It\'s <b>St. Patrick\'s season</b>!<br>Keep an eye out and you just might click a rabbit or two!', [0, 12], 60 * 3); break;
            case 'thanksgiving':
                Game.Notify('Thanksgiving!', 'It\'s <b>Thanksgiving season</b>!<br>Keep an eye out and you just might click a rabbit or two!', [0, 12], 60 * 3); break;
            case 'new_years':
                Game.Notify('New Years!', 'It\'s <b>New Year\'s season</b>!<br>Keep an eye out and you just might click a rabbit or two!', [0, 12], 60 * 3); break;
            case 'groundhog':
                Game.Notify('Groundhogs Day!', 'It\'s <b>Grondhog\'s season</b>!<br>It\'s <b>Grondhogs season</b>!<br>It\'s <b>Grondhogs season</b>!<br>It\'s <b>Grondhogs season</b>!<br>It\'s <b>Grondhogs season</b>!<br>It\'s <b>Grondhogs season</b>!<br>It\'s <b>Grondhogs season</b>!<br><i>Okay, you get the point.</i>', [0, 12], 60 * 3); break;
            default:
                Game.Notify('What the Fuck!', 'It\'s <b>a Fucking Mess</b>!<br>This isn\'t supposed to happen!', [0, 12], 60 * 3);
        }
    }
};