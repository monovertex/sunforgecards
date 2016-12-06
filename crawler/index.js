/*jshint loopfunc: true */

let tumblr = require('tumblr.js');
let PostCollection = require('../app/collections/posts');
let AnswerCollection = require('../app/collections/answers');
let Post = require('../app/models/post');
let http = require('http');
let fs = require('fs');
let path = require('path');
let url = require('url');
let mkdirp = require('mkdirp');
let removeMarkdown = require('remove-markdown');

let projectPath = path.join(__dirname, '..');
let dataPath = path.join(projectPath, 'data');

let C = require('./constants');

let client = tumblr.createClient({ credentials: C.credentials });

/**
 * Iterates the posts returned by the API calls and the resolves the promise
 * with all the posts and the Q&A models.
 * @param {Function} resolve Promise resolve
 * @param {Function} reject Promise reject
 * @param {Collection} posts Accumulator of post models
 * @param {Collection} answers Accumulator of Q&A models
 * @param {Number} offset Where the start the query from
 * @param {Number} limit How many posts to query
 */
function _iteratePosts(resolve, reject,
    posts=(new PostCollection()), answers=(new AnswerCollection()),
    offset=0, limit=20) {

    console.log(`--- Fetching posts from ${offset} to ${(offset + limit)} ---`);

    // Execute the API call.
    client.blogPosts(C.blog, { offset, limit }, (err, data) => {
        if (data.posts.length) {
            for (let post of data.posts) {

                // We're only showing published posts.
                if (post.state === 'published') {

                    // We're only showing some type of posts on this frontend.
                    if (post.type === 'video' || post.type === 'photo' ||
                        post.type === 'text') {

                        // Common information for posts.
                        let postInstance = new Post({
                            id: post.id,
                            slug: post.slug,
                            date: post.date,
                            type: post.type,
                            tags: post.tags,
                            caption: post.caption,
                            summary: removeMarkdown(post.summary)
                        });

                        // For video posts, grab their URL and determine if the
                        // URL is from YouTube or not.
                        if (post.type === 'video') {
                            let url = post.permalink_url ||
                                    post.video_url,
                                isYoutube = false;

                            url = decodeURI(url);

                            let m = /www\.youtube\.com\/watch\?v=(.*?)$/ig.exec(url);

                            if (m) {
                                url = m[1];
                                isYoutube = true;
                            }

                            postInstance.set({
                                video: url,
                                isYoutube: isYoutube
                            });

                        // For photo posts, download all the photos and save
                        // their paths.
                        } else if (post.type === 'photo') {
                            let postPhotos = [];

                            for (let photo of post.photos) {
                                // Make regular HTTP requests.
                                let sourceUrl = photo.original_size.url
                                    .replace('https', 'http');
                                let sourceFilename = path.basename(
                                    url.parse(sourceUrl).pathname);
                                let destPath = path.join(dataPath, 'photos',
                                    String(post.id), sourceFilename);

                                // Make sure the entire path exists.
                                mkdirp(path.dirname(destPath));

                                // Write the file.
                                http.get(sourceUrl, (response) =>
                                    response.pipe(fs.createWriteStream(destPath)));

                                postPhotos.push(sourceFilename);
                            }

                            postInstance.set({
                                photos: postPhotos
                            });
                        }

                        posts.add(postInstance);

                    // Save the Q&A posts in a different model.
                    } else if (post.type === 'answer') {
                        answers.add({
                            id: post.id,
                            date: post.date,
                            question: post.question,
                            answer: post.answer
                        });

                    // For any unexpected post type, log it out.
                    } else {
                        console.log(post.type);
                    }
                }
            }
        }

        resolve({ posts, answers });

        // if (data.posts.length < limit) {
        //     resolve({ posts, answers });
        // } else {
        //     _iteratePosts(resolve, reject, posts, answers,
        //         offset + data.posts.length);
        // }
    });
}

/**
 * Wrapper function that starts the recursive post fetching.
 * @return {Promise}
 */
function iteratePosts() {
    return new Promise(_iteratePosts);
}

// Iterate all the posts and save the data to disk.
iteratePosts().then(({ posts, answers }) => {
    let postsPath = path.join(dataPath, 'posts.json');
    let answersPath = path.join(dataPath, 'answers.json');

    fs.writeFile(postsPath, JSON.stringify(posts.toJSON()), 'utf8');
    fs.writeFile(answersPath, JSON.stringify(answers.toJSON()), 'utf8');
});
