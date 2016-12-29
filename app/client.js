
let Backbone        = require('backbone');
let $               = require('jquery');
let attachFastClick = require('fastclick');
let { loadCSS }     = require('fg-loadcss');
let picturefill     = require('picturefill');
let NavbarView      = require('./views/navbar');
let MainRouter      = require('./routers/main');
                      require('./utils/disqus');

// Initiate global libraries.

picturefill();

attachFastClick(document.body);

global.$ = global.jQuery = $;


// When the document is ready, execute all the required instructions.
$(() => {

    // Initialize navbar.
    new NavbarView();

    // Initialize router.
    new MainRouter();
    Backbone.history.start({ pushState: true });

    // Load the Google Font CSS asynchronously.
    loadCSS('https://fonts.googleapis.com/css?family=Open+Sans:400,700');

});
