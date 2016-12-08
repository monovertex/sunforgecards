
let express     = require('express');
let app         = express();
let path        = require('path');
let _           = require('lodash');
let slash       = require('express-slash');
let glob        = require('glob');
let settings    = require('./settings');
let { postUrl } = require('./utils/post-url');

app.enable('strict routing');

// Create the router using the same routing options as the app.
var router = express.Router({
    caseSensitive   : app.get('case sensitive routing'),
    strict          : app.get('strict routing')
});

// Add the `slash()` middleware after your app's `router`, optionally specify
// an HTTP status code to use when redirecting (defaults to 301).
app.use(router);
app.use(slash());

_.each(['assets', 'photos'], (static) => {
    app.use(`/${static}`, express.static(path.join(settings.path.dist, static)));
});

app.get('/post/:id/:slug/',function(req, res){
    let { id, slug } = req.params;

    res.sendFile(path.join(settings.path.post, `${id}-${slug}.html`));
});

app.get('/post/:id/',function(req, res){
    let { id } = req.params;

    glob(path.join(settings.path.post, `${id}-*.html`), {}, function (er, files) {
        if (files.length) {
            let re = new RegExp(`/${id}-(.*?).html$`, 'gi'),
                match = re.exec(files[0]);

            res.redirect(postUrl(id, match[1]));
        }
    });
});

app.get('/',function(req, res){
    res.sendFile(path.join(settings.path.dist, 'index.html'));
});

app.get('/ask',function(req, res){
    res.sendFile(path.join(settings.path.dist, 'ask.html'));
});

app.listen(8000);

console.log('Express.js listening on port 8000');