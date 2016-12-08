
let Backbone    = require('backbone');
let Answer      = require('../models/answer');

module.exports = Backbone.Collection.extend({
    model: Answer
});