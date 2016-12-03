
let Backbone = require('backbone');
let _ = require('lodash');
let cssFlex = require('../utils/css-flex');

let PhotosetView = Backbone.View.extend({

    events: {
        'mouseover .photo': 'photoMouseover'
    },

    initialize() {
        _.bindAll(this, 'photoMouseover');

        this.$('.photo').each((index, photo) => {
            let $photo = $(photo),
                realWidth = $photo.find('img').outerWidth();

            $photo.data('real-width', realWidth);
        });

        PhotosetView.registerPhotoset(this);
        this.openNext();
    },

    open($photos) {
        $photos.each((index, photo) => {
            let $photo = $(photo);

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

}, {

    initializeAutoOpen() {
        if (!PhotosetView.autoOpenInterval) {
            PhotosetView.autoOpenInterval = setInterval(PhotosetView.autoOpen, 5000);
            PhotosetView.photosets = [];
        }
    },

    registerPhotoset(photoset) {
        PhotosetView.initializeAutoOpen();
        PhotosetView.photosets.push(photoset);
    },

    autoOpen() {
        let scrollTop = $(window).scrollTop(),
            scrollBottom = scrollTop + $(window).height();

        _.each(PhotosetView.photosets, (photoset) => {
            let top, bottom, $el = photoset.$el;

            if (!$el.is(':hover')) {
                top = $el.offset().top;
                bottom = top + $el.outerHeight();

                if (bottom > scrollTop && top < scrollBottom) {
                    photoset.openNext();
                }
            }
        });
    }

});

module.exports = PhotosetView;