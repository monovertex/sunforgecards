
let Backbone        = require('backbone');
let NavbarView      = require('./views/navbar');
let $               = require('jquery');
let attachFastClick = require('fastclick');
let MainRouter      = require('./routers/main');
                      require('./utils/disqus');

attachFastClick(document.body);

global.$ = global.jQuery = $;

$(() => {

    new NavbarView();

    new MainRouter();

    Backbone.history.start({ pushState: true });

});
