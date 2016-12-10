
let Backbone  = require('backbone');
let IndexView = require('../views/index');

module.exports = Backbone.Router.extend({

    routes: {
        '': 'index'
    },

    index() {
        new IndexView({ el: '.pages-wrapper' });
    }

});