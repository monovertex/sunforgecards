
let Backbone = require('backbone');
let PhotosetView = require('./photoset');

module.exports =  Backbone.View.extend({

    initialize() {
        this.initializePhotoset();
    },

    initializePhotoset() {
        let $photoset = this.$('.photoset');

        if ($photoset.length) {
            this.photosetView = new PhotosetView({ el: $photoset });
        }
    }

});