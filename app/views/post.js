
let Backbone = require('backbone');
let PhotosetView = require('./photoset');

module.exports =  Backbone.View.extend({

    initialize() {
        this.initializePhotoset();
        this.initializeGallery();
    },

    initializePhotoset() {
        let $photoset = this.$('.photoset');

        if ($photoset.length) {
            this.photosetView = new PhotosetView({ el: $photoset });
        }
    },

    initializeGallery() {
        $(this.el).magnificPopup({
            delegate: '.photo',
            type: 'image',
            gallery: {
                enabled: true
            }
        });
    }

});