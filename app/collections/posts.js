
var Backbone = require('backbone');
var Post = require('../models/post');

module.exports = Backbone.Collection.extend({
    model: Post
});