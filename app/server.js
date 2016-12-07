
let express = require('express');
let app     = express();
let path    = require('path');
let _       = require('lodash');
let slash   = require('express-slash');
let glob    = require('glob');

let distPath = path.join(__dirname, '..', 'dist');
let postPath = path.join(distPath, 'post');

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
    app.use(`/${static}`, express.static(path.join(distPath, static)));
});

app.get('/post/:id/:slug/',function(req, res){
    let { id, slug } = req.params;

    res.sendFile(path.join(postPath, `${id}-${slug}.html`));
});

app.get('/post/:id/',function(req, res){
    let { id } = req.params;

    glob(path.join(postPath, `${id}-*.html`), {}, function (er, files) {
        if (files.length) {
            let re = new RegExp(`/${id}-(.*?).html$`, 'gi'),
                match = re.exec(files[0]);

            res.redirect(`/post/${id}/${match[1]}/`);
        }
    });
});

app.get('/',function(req, res){
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(8000);

console.log('Express.js listening on port 8000');