
let Backbone        = require('backbone');
let PostView        = require('./post');

/**
 * The page view is simply initializing the post view for each post inside of it.
 * This is an easy bootstrapping for the photoset and view logic.
 */
module.exports =  Backbone.View.extend({

    initialize() {
        this.$('.post').each((index, post) => {
            new PostView({ el: post });
        });
    },

});