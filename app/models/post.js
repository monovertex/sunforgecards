
let Backbone                  = require('backbone');
let { postUrl, postShortUrl } = require('../utils/post-url');
let _                         = require('lodash');

module.exports = Backbone.Model.extend({

    /**
     * Initialize several attributes, depending on the Model initialization.
     */
    initialize() {
        _.bindAll(this, 'checkInstagramUrl');

        // Build the URL and the short URL based on the slug and id.
        let id = this.get('id'), slug = this.get('slug'),
            shortUrl = postShortUrl(id),
            url = postUrl(id, slug),
            summary = this.get('summary');

        // Also shorten the summary, as well as replace whitespace with dashes
        // inside of it.
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

    /**
     * If the video type is `instagram`, make sure the video URL ends with `embed`,
     * so the Instagram video will be properly inserted into the page.
     */
    checkInstagramUrl() {
        if (this.get('videoType') === 'instagram') {
            let videoUrl = this.get('video');

            if (!videoUrl.endsWith('/embed')) {
                this.set('video', videoUrl + '/embed', { silent: true });
            }
        }
    }

});