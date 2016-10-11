
let tumblr = require('tumblr.js');
let _ = require('lodash');
let PostCollection = require('../app/collections/posts');
let AnswerCollection = require('../app/collections/answers');
let Post = require('../app/models/post');
let http = require('http');
let fs = require('fs');
let path = require('path');
let url = require('url');
let mkdirp = require('mkdirp');

const C = require('./constants');

let client = tumblr.createClient({ credentials: C.credentials });


function _iteratePosts(resolve, reject,
    posts=(new PostCollection()), answers=(new AnswerCollection()),
    offset=0, limit=20) {

    console.log(`--- Fetching posts from ${offset} to ${(offset + limit)} ---`);

    client.blogPosts(C.blog, { offset, limit }, (err, data) => {
        if (data.posts.length) {
            for (let post of data.posts) {
                if (post.state === 'published') {
                    if (post.type === 'video' || post.type === 'photo' ||
                        post.type === 'text') {

                        let postInstance = new Post({
                            id: post.id,
                            slug: post.slug,
                            date: post.date,
                            type: post.type,
                            tags: post.tags,
                            caption: post.caption
                        });

                        if (post.type === 'video') {
                            postInstance.set({
                                video: post.source_url ||
                                    post.permalink_url ||
                                    post.video_url
                            });
                        } else if (post.type === 'photo') {
                            let postPhotos = [];

                            for (let photo of post.photos) {
                                let sourceUrl = photo.original_size.url
                                    .replace('https', 'http');
                                let sourceFilename = path.basename(
                                    url.parse(sourceUrl).pathname);
                                let destPath = path.join(C.paths.photos, String(post.id),
                                    sourceFilename);

                                mkdirp(path.dirname(destPath));

                                http.get(sourceUrl, (response) =>
                                    response.pipe(fs.createWriteStream(destPath)));

                                postPhotos.push(sourceFilename);
                            }

                            postInstance.set({
                                photos: postPhotos
                            });
                        }

                        posts.add(postInstance);
                    } else if (post.type === 'answer') {
                        answers.add({
                            id: post.id,
                            date: post.date,
                            question: post.question,
                            answer: post.answer
                        });
                    } else {
                        console.log(post.type);
                    }
                }
            }
        }

        // resolve({ posts, answers });

        if (data.posts.length < limit) {

        } else {
            _iteratePosts(resolve, reject, posts, answers,
                offset + data.posts.length);
        }
    });
}

function iteratePosts() {
    return new Promise(_iteratePosts);
}

iteratePosts().then(({ posts, answers }) => {
    let postsPath = path.join(C.paths.data, 'posts.json');
    let answersPath = path.join(C.paths.data, 'answers.json');

    fs.writeFile(postsPath, JSON.stringify(posts.toJSON()), 'utf8');
    fs.writeFile(answersPath, JSON.stringify(answers.toJSON()), 'utf8');
});
