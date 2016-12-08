
let Backbone                  = require('backbone');
let { postUrl, postShortUrl } = require('../utils/post-url');
let _                         = require('lodash');

module.exports = Backbone.Model.extend({

    initialize() {
        _.bindAll(this, 'checkInstagramUrl');

        let id = this.get('id'), slug = this.get('slug'),
            shortUrl = postShortUrl(id),
            url = postUrl(id, slug),
            summary = this.get('summary');

        if (summary) {
            summary = summary.replace(/[\n\t]+/g, ' - ').substring(0, 70) + ' […]';
        }

        this.set({
            url,
            shortUrl,
            summary
        });

        this.on('change:video change:videoType', this.checkInstagramUrl);
    },

    checkInstagramUrl() {
        if (this.get('videoType') === 'instagram') {
            let videoUrl = this.get('video');

            if (!videoUrl.endsWith('/embed')) {
                this.set('video', videoUrl + '/embed', { silent: true });
            }
        }
    }

});