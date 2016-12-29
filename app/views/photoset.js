
let Backbone    = require('backbone');
let _           = require('lodash');
let $           = require('jquery');
let cssFlex     = require('../utils/css-flex');

/**
 * The photoset displays a list of photos, highlighting each one of them
 * one by one or on hover. This is done in a 16:9 container and each photo is
 * displayed in a vertical slice in the stand-by phase.
 */
module.exports = Backbone.View.extend({

    events: {
        'mouseover .photo': 'photoMouseover'
    },

    initialize() {
        _.bindAll(this, 'photoMouseover', 'onVisible', 'openNext');

        // Make sure the first photo is open when the post is first initialized.
        this.openNext();

        // Throttle the auto-open function.
        // This make sure that the auto-highlight process happens every 5
        // seconds, under the right conditions.
        this.throttledOpenNext = _.throttle(this.openNext, 5000, {
            leading: false,
            trailing: true
        });
    },

    /**
     * When the post comes into the viewport and is not hovered, auto-open the
     * next photo after the set delay (see the initializer).
     * @return {[type]} [description]
     */
    onVisible() {
        if (!this.$el.is(':hover')) {
            this.throttledOpenNext();
        }
    },

    /**
     * Highlight a photo.
     * @param {jQuery} $photo
     */
    open($photo) {
        let realWidth = $photo.data('real-width'),
            $img = $photo.find('img');

        // We need to make sure that the currently highlighted photo has
        // actually loaded, so the request might be locked if we're still
        // waiting for that to happen.
        if (!this.loadLock) {

            // If the width of the image is not cached, get it and cache it.
            if (!realWidth) {
                realWidth = $img.outerWidth();
                $photo.data('real-width', realWidth);

                // If the width of the photo is not available, the image is not
                // yet loaded, so wait for that to happen.
                if (!realWidth) {
                    // Lock the auto-open process.
                    this.loadLock = true;

                    // Wait for the image to load, clear the lock and re-open
                    // the current photo.
                    $img.on('load', () => {
                        this.loadLock = false;
                        this.open($photo);
                    });
                }
            }

            // Open the photo.
            $photo.addClass('open');
            cssFlex($photo, `0 0 ${$photo.data('real-width')}px`);

            // Close the siblings.
            this.close($photo.siblings());
        }
    },

    /**
     * Opens the next photo in the photoset.
     */
    openNext() {
        // Grab the currently open photo.
        let $next = this.$('.photo.open').next();

        // If there is none, grab the first one.
        if (!$next.length) {
            $next = this.$('.photo').first();
        }

        // Open the target.
        this.open($next);
    },

    /**
     * Un-highlights a list of photo elements.
     * @param {jQuery} $photos
     */
    close($photos) {
        $photos.each((index, photo) => {
            $(photo).removeClass('open').attr('style', '');
        });
    },

    /**
     * When the user hovers a certain photo, make sure that photo is highlighted,
     * for easier viewing and click access.
     * @param {Event} ev
     */
    photoMouseover(ev) {
        this.open($(ev.currentTarget));
    }

});