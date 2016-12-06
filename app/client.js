
let PostView = require('./views/post');
let $ = require('jquery');
let attachFastClick = require('fastclick');
require('./utils/disqus');

attachFastClick(document.body);

global.$ = global.jQuery = $;


$(() => {

    $('.post').each((index, post) => {
        new PostView({ el: post });
    });

});
