
let Backbone  = require('backbone');
let IndexView = require('../views/index');

module.exports = Backbone.Router.extend({

    routes: {
        '': 'index'
    },

    /**
     * Initializes the logic for the Index page, that manages infinite loading
     * of the post pages.
     */
    index() {
        new IndexView({ el: '.pages-wrapper' });
    }

});