
var PostView = require('./views/post');

window.jQuery(() => {

    FastClick.attach(document.body);

    $('.post').each((index, post) => {
        new PostView({ el: post });
    });

});
