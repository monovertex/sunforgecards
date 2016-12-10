
let Backbone    = require('backbone');
let _           = require('lodash');
let $           = require('jquery');
let cssFlex     = require('../utils/css-flex');

module.exports = Backbone.View.extend({

    events: {
        'mouseover .photo': 'photoMouseover'
    },

    initialize() {
        _.bindAll(this, 'photoMouseover', 'onVisible', 'openNext');

        this.openNext();

        this.throttledOpenNext = _.throttle(this.openNext, 5000, {
            leading: false,
            trailing: true
        });
    },

    onVisible() {
        if (!this.$el.is(':hover')) {
            this.throttledOpenNext();
        }
    },

    open($photos) {
        $photos.each((index, photo) => {
            let $photo = $(photo),
                realWidth = $photo.data('real-width');

            if (!realWidth) {
                realWidth = $photo.find('img').outerWidth();
                $photo.data('real-width', realWidth);
            }

            $photo.addClass('open');

            cssFlex($photo, `0 0 ${$photo.data('real-width')}px`);

            this.close($photo.siblings());
        });
    },

    openNext() {
        let $next = this.$('.photo.open').next();

        if (!$next.length) {
            $next = this.$('.photo').first();
        }

        this.open($next);
    },

    close($photos) {
        $photos.each((index, photo) => {
            $(photo).removeClass('open').attr('style', '');
        });
    },

    photoMouseover(ev) {
        this.open($(ev.currentTarget));
    }

});