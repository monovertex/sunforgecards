
let Backbone        = require('backbone');
let PostView        = require('./post');

module.exports =  Backbone.View.extend({

    initialize() {
        this.$('.post').each((index, post) => {
            new PostView({ el: post });
        });
    },

});