# Sunforge Cards Website [![Build Status](https://travis-ci.org/monovertex/sunforgecards.svg?branch=master)](https://travis-ci.org/monovertex/sunforgecards)

This application represents a 3rd-party client for a Tumblr blog, that scrapes a certain blog for its posts through the Tumblr API and then buids a static, HTML-enabled collection of pages.

These pages are later displayed through an Express.js server.

The motivation for this application is the lack of optimization options provided by Tumblr, resulting in a slow front-end that is not really optimized for slow connections and loads a bunch of unnecessary scripts on the page.

This 3rd-party client is highly optimized, with everything minified and gzipped. Critical CSS is also inline and everything else is loaded asynchronously, to ensure the loading speed of the website.

## Dependencies

* [Node.js & NPM](https://nodejs.org/en/)
* [Grunt CLI](https://github.com/gruntjs/grunt-cli)
* [PhantomJS](http://phantomjs.org/)
* [Graphics Magick](http://www.graphicsmagick.org/)
* [Ruby](https://www.ruby-lang.org/en/) & [scss-lint](https://github.com/brigade/scss-lint) (optional, for SCSS linting, if your editor supports it)

## How to use

* Create a `app/credentials.js` file, with your [Tumblr API application](https://www.tumblr.com/docs/en/api/v2) credentials (see the `app/credentials.example.js` file).
* Update the `app/settings.js` file with the correct information (blog & application port)
* Use the `grunt serve` command to run all the development tasks and then run a local Express.js server (this should be used for development only)
* For production, use the `grunt prod` command to run all the production tasks (minification, compression) and use an application watcher to run the Express.js server (for example, [Supervisord](http://supervisord.org/)). For best results, you should also use a reverse proxy like [NGINX](https://www.nginx.com/resources/wiki/) that would also serve the static files.
