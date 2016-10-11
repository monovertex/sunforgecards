
var Backbone = require('backbone');
var Answer = require('../models/answer');

module.exports = Backbone.Collection.extend({
    model: Answer
});