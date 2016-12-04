
let Backbone = require('backbone');
let _ = require('lodash');
let plyr = require('plyr');

module.exports = Backbone.View.extend({


    initialize() {
        _.bindAll(this, 'play', 'pause');

        this.plyr = plyr.setup(this.el, {
            volume: 0
        })[0];
    },

    play() {
        this.plyr.setVolume(0);
        this.plyr.play();
    },

    pause() {
        this.plyr.pause();
    }

});