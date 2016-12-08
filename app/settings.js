
let path = require('path');


module.exports = {
    blog: 'sunforgecards.tumblr.com',
    path: (() => {
        let app = __dirname,
            project = path.join(app, '..'),
            dist = path.join(project, 'dist'),
            data = path.join(project, 'data'),
            post = path.join(dist, 'post');

        return { app, dist, post, project, data };
    })()
};