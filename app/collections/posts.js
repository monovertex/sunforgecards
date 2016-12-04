
let Backbone = require('backbone');
let Post = require('../models/post');

module.exports = Backbone.Collection.extend({
    model: Post
});