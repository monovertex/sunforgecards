
/**
 * Initializes the Disqus library, where needed, if the container element
 * exists.
 */

let $ = require('jquery');

$(() => {
    if ($('#disqus_thread').length) {
        var d = document, s = d.createElement('script');

        s.src = '//ygo3d.disqus.com/embed.js';

        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    }
});