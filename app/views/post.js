
let Backbone        = require('backbone');
let PhotosetView    = require('./photoset');
let VideoView       = require('./video');
let _               = require('lodash');
let $               = require('jquery');
                      require('magnific-popup');

/**
 * This view initializes the different type of posts, with their required logic.
 * It also keeps a static list of all the posts and delegates them activation
 * when they scroll into view.
 */
let PostView =  Backbone.View.extend({

    initialize() {
        this.initializeGallery();
        this.initializePhotoset();
        this.initializeVideo();

        // Register this post into the static register.
        PostView.registerPost(this);
    },

    /**
     * Initializes a photoset, if found in this post.
     */
    initializePhotoset() {
        let $photoset = this.$('.photoset');

        if ($photoset.length) {
            this.photosetView = new PhotosetView({ el: $photoset });

            // Delegate the event triggering. While the post is visible,
            // trigger the photoset actios.
            this.on('onviewportvisible', this.photosetView.onVisible);

            this.$viewportTarget = $photoset;
        }
    },

    /**
     * Initializes a video post, if found.
     */
    initializeVideo() {
        let $video = this.$('.video-wrapper');

        if ($video.length) {
            this.videoView = new VideoView({ el: $video });

            // When the post comes into view, play it, and when it goes out of
            // the view, stop it.
            this.on('onviewportin', this.videoView.play);
            this.on('onviewportout', this.videoView.pause);

            this.$viewportTarget = $video;
        }
    },

    /**
     * Initialize lightbox photos, with the Magnific Popup library.
     */
    initializeGallery() {
        this.$el.magnificPopup({
            delegate: '.photo',
            type: 'image',
            gallery: {
                enabled: true
            }
        });
    }

/**
 * Static class actions, that trigger the `onviewportin`, `onviewportout` and
 * `onviewportvisible` events.
 */
}, {

    /**
     * Initializes the interval checking for current viewport element and the
     * static post list.
     */
    initializeActiveInterval() {
        if (!PostView.activeInterval) {
            PostView.activeInterval = setInterval(PostView.checkActive, 100);
            PostView.posts = [];
        }
    },

    /**
     * Registers a post into the static list and makes sure that everything is
     * properly initialized.
     */
    registerPost(post) {
        PostView.initializeActiveInterval();
        PostView.posts.push(post);
    },

    /**
     * Interval callback that goes through the list of posts and triggers the
     * appropriate events for the currently visible posts.
     *
     * It only considers posts as visible if more than 70% of the post is
     * inside the viewport.
     */
    checkActive() {
        let scrollTop = $(window).scrollTop(),
            scrollBottom = scrollTop + $(window).height();

        // Iterate through the posts to determine the visible ones.
        _.each(PostView.posts, (post) => {
            let $el = post.$viewportTarget || post.$el,
                top = $el.offset().top,
                bottom = top + $el.outerHeight(),

                // Determine how much of the post is actually visible. It
                // computes the height of the intersection between the viewport
                // rect and the post rect.
                visiblePercent = Math.max(0, Math.min(scrollBottom, bottom) -
                    Math.max(scrollTop, top)) / (bottom - top);

            // Only valid posts have their events triggered.
            if (visiblePercent > 0.7) {
                // If the post was not previously visible, trigger the `in` event.
                if (!post._isViewportVisible) {
                    post.trigger('onviewportin');
                }

                // Always trigger the repeated event.
                post.trigger('onviewportvisible');

                post._isViewportVisible = true;
            } else if (post._isViewportVisible) {
                // Trigger the `out` event.
                post.trigger('onviewportout');

                post._isViewportVisible = false;
            }
        });
    }

});

module.exports = PostView;