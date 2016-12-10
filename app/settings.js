
let path = require('path');


module.exports = {
    blog: 'sunforgecards.tumblr.com',
    maxPosts: 10,
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