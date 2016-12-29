
let express     = require('express');
let path        = require('path');
let _           = require('lodash');
let slash       = require('express-slash');
let glob        = require('glob');
let settings    = require('./settings');
let { postUrl } = require('./utils/post-url');


let app = express();

app.enable('strict routing');
app.set('json spaces', 4);

// Create the router using the same routing options as the app.
var router = express.Router({
    caseSensitive   : app.get('case sensitive routing'),
    strict          : app.get('strict routing')
});

app.use(router);
app.use(slash());

// 404 error generator for when a file is not found.
function fileNotFound(res) {
    return () => {
        res.status(404).sendFile(path.join(settings.path.dist, 'error.html'));
    };
}


/** Static files **************************************************************/

_.each(['assets', 'photos'], (static) => {
    app.use(`/${static}`, express.static(path.join(settings.path.dist, static)));
});



/** Posts *********************************************************************/

app.get('/post/:id/:slug/', (req, res) => {
    let { id, slug } = req.params;

    res.sendFile(path.join(settings.path.post, `${id}-${slug}.html`), fileNotFound(res));
});

// Posts may also be referenced by their ID only. When a GET request is sent to
// an URL like that, search for a corresponding template. If one is found,
// permanently redirect to the correct URL.
app.get('/post/:id/', (req, res) => {
    let { id } = req.params;

    glob(path.join(settings.path.post, `${id}-*.html`), {},  (er, files) => {
        if (files.length) {
            let re = new RegExp(`/${id}-(.*?).html$`, 'gi'),
                match = re.exec(files[0]);

            res.redirect(postUrl(id, match[1]));
        } else {
            fileNotFound(res)();
        }
    });
});


/** Main pages ****************************************************************/

app.get('/', (req, res) => {
    res.sendFile(path.join(settings.path.dist, 'index.html'), fileNotFound(res));
});

app.get('/ask', (req, res) => {
    res.sendFile(path.join(settings.path.dist, 'ask.html'), fileNotFound(res));
});


/** Data retrieval ************************************************************/

app.post('/page/:index/', (req, res) => {
    let { index } = req.params;

    res.sendFile(path.join(settings.path.page, `${index}.html`), fileNotFound(res));
});

/** Error handling ************************************************************/

app.use(function(req, res) {
    fileNotFound(res)();
});

app.listen(settings.port);

console.log(`Express.js listening on port 8300`);