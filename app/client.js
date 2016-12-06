
let PostView = require('./views/post');
let $ = require('jquery');
let attachFastClick = require('fastclick');

attachFastClick(document.body);

global.$ = global.jQuery = $;


$(() => {

    $('.post').each((index, post) => {
        new PostView({ el: post });
    });

});
