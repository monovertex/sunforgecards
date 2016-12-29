
let Backbone    = require('backbone');
let _           = require('lodash');
let plyr        = require('plyr');

/**
 * Logic for a video posts. Enables the Plyr video and plays / stops it when
 * required.
 */
module.exports = Backbone.View.extend({


    initialize() {
        _.bindAll(this, 'play', 'pause');

        // Setup the plyr video player.
        this.plyr = plyr.setup(this.el, {
            volume: 0
        })[0];

        this.delays = {};

        // Make sure the video is replayed when it ends.
        this.plyr.on('ended', this.play);
    },

    /**
     * Delay an action, but make sure to also cancel the previously scheduled one.
     * @param {Function} callback
     */
    delay(callback) {
        if (this.actionDelay) {
            clearTimeout(this.actionDelay);
        }

        this.actionDelay = setTimeout(callback, 200);
    },

    /**
     * Play the video, but make sure the volume is set to 0, for auto-play.
     */
    play() {
        this.delay(() => {
            this.plyr.setVolume(0);
            this.plyr.play();
        });
    },

    /**
     * Pause the video object.
     */
    pause() {
        this.delay(() => {
            this.plyr.pause();
        });
    }

});