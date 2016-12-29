/**
 * General settings for the server app and the client-side app.
 */

let path = require('path');

module.exports = {
    blog: 'sunforgecards.tumblr.com',
    maxPosts: 10,
    port: 8300,

    // Build global paths. All of them are absolute, based on the current
    // file absolute path.
    path: (() => {
        let app = __dirname,
            project = path.join(app, '..'),
            dist = path.join(project, 'dist'),
            data = path.join(project, 'data'),
            post = path.join(dist, 'post'),
            page = path.join(dist, 'page');

        return { app, dist, post, project, data, page };
    })()
};