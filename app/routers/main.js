
let Backbone         = require('backbone');
let AnswerCollection = require('../collections/answers');
let AskView          = require('../views/ask');

module.exports = Backbone.Router.extend({

    routes: {
        'ask': 'ask'
    },

    ask() {
        let answers = new AnswerCollection(window.BOOTSTRAP_ANSWERS);

        new AskView({ el: '.content-column', answers });
    }

});