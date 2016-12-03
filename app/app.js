
var PostView = require('./views/post');

window.jQuery(() => {

    $('.post').each((index, post) => {
        new PostView({ el: post });
    });

});
