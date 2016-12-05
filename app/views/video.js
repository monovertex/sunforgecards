
let Backbone = require('backbone');
let _ = require('lodash');
let plyr = require('plyr');

module.exports = Backbone.View.extend({


    initialize() {
        _.bindAll(this, 'play', 'pause');

        this.plyr = plyr.setup(this.el, {
            volume: 0
        })[0];

        this.delays = {};

        this.plyr.on('ended', this.play);
    },

    delay(callback) {
        if (this.actionDelay) {
            clearTimeout(this.actionDelay);
        }

        this.actionDelay = setTimeout(callback, 200);
    },

    play() {
        this.delay(() => {
            this.plyr.setVolume(0);
            this.plyr.play();
        });
    },

    pause() {
        this.delay(() => {
            this.plyr.pause();
        });
    }

});