let Backbone = require('backbone');

module.exports = Backbone.Model.extend({

    initialize() {
        let shortURL = `/post/${this.get('id')}/`;
        let url = `${shortURL}${this.get('slug')}/`;
        let summary = this.get('summary');

        if (summary) {
            summary = summary.replace(/[\n\t]+/g, ' - ').substring(0, 70) + ' […]';
        }

        this.set({
            url,
            shortURL,
            summary
        });
    }

});