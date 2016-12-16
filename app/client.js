
let Backbone        = require('backbone');
let $               = require('jquery');
let attachFastClick = require('fastclick');
let { loadCSS }     = require('fg-loadcss');
let NavbarView      = require('./views/navbar');
let MainRouter      = require('./routers/main');
                      require('./utils/disqus');

attachFastClick(document.body);

global.$ = global.jQuery = $;

$(() => {

    new NavbarView();

    new MainRouter();

    Backbone.history.start({ pushState: true });

    loadCSS('https://fonts.googleapis.com/css?family=Open+Sans:400,700');

});
