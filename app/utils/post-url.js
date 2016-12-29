/**
 * URL generator functions, that use the id and the slug of a post.
 */

function postShortUrl(id) {
    return `/post/${id}/`;
}

function postUrl(id, slug) {
    return `${postShortUrl(id)}${slug}/`;
}

module.exports = { postShortUrl, postUrl };