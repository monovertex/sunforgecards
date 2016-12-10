
let express     = require('express');
let app         = express();
let path        = require('path');
let _           = require('lodash');
let slash       = require('express-slash');
let glob        = require('glob');
let settings    = require('./settings');
let { postUrl } = require('./utils/post-url');

app.enable('strict routing');
app.set('json spaces', 4);

// Create the router using the same routing options as the app.
var router = express.Router({
    caseSensitive   : app.get('case sensitive routing'),
    strict          : app.get('strict routing')
});

// Add the `slash()` middleware after your app's `router`, optionally specify
// an HTTP status code to use when redirecting (defaults to 301).
app.use(router);
app.use(slash());


/** Static files **************************************************************/

_.each(['assets', 'photos'], (static) => {
    app.use(`/${static}`, express.static(path.join(settings.path.dist, static)));
});



/** Posts *********************************************************************/

app.get('/post/:id/:slug/', (req, res) => {
    let { id, slug } = req.params;

    res.sendFile(path.join(settings.path.post, `${id}-${slug}.html`));
});

app.get('/post/:id/', (req, res) => {
    let { id } = req.params;

    glob(path.join(settings.path.post, `${id}-*.html`), {},  (er, files) => {
        if (files.length) {
            let re = new RegExp(`/${id}-(.*?).html$`, 'gi'),
                match = re.exec(files[0]);

            res.redirect(postUrl(id, match[1]));
        }
    });
});


/** Main pages ****************************************************************/

app.get('/', (req, res) => {
    res.sendFile(path.join(settings.path.dist, 'index.html'));
});

app.get('/ask', (req, res) => {
    res.sendFile(path.join(settings.path.dist, 'ask.html'));
});


/** Data retrieval ************************************************************/

app.get('/page/:index/', (req, res) => {
    let { index } = req.params;

    res.sendFile(path.join(settings.path.page, `${index}.html`));
});

// app.get('/post-list/', (req, res) => {
//     let posts = require(path.join(settings.path.data, 'posts.json')),
//         startId = req.query.id,
//         limit = Math.min(parseInt(req.query.limit, 10) || settings.maxPosts,
//             settings.maxPosts),
//         start,
//         results = [];

//     if (!startId) {
//         start = 0;
//     } else {
//         _.each(posts, (post, i) => {
//             if (post.id === startId) {
//                 start = i + 1;
//                 return false;
//             }
//         });
//     }

//     if (!_.isUndefined(start)) {
//         results = posts.slice(start, start + limit);
//     }

//     res.json(results);
// });

app.listen(8000);

console.log('Express.js listening on port 8000');