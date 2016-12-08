let Backbone          = require('backbone');
let { postUrl, postShortUrl } = require('../utils/post-url');

module.exports = Backbone.Model.extend({

    initialize() {
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
    }

});