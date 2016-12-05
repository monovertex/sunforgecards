
let Backbone = require('backbone');
let PhotosetView = require('./photoset');
let VideoView = require('./video');
let _ = require('lodash');
let $ = require('jquery');
require('magnific-popup');

let PostView =  Backbone.View.extend({

    initialize() {
        this.initializeGallery();

        this.initializePhotoset();
        this.initializeVideo();

        PostView.registerPost(this);
    },

    initializePhotoset() {
        let $photoset = this.$('.photoset');

        if ($photoset.length) {
            this.photosetView = new PhotosetView({ el: $photoset });
            this.on('onviewportvisible', this.photosetView.onVisible);

            this.$viewportTarget = $photoset;
        }
    },

    initializeVideo() {
        let $video = this.$('.video-wrapper');

        if ($video.length) {
            this.videoView = new VideoView({ el: $video });
            this.on('onviewportin', this.videoView.play);
            this.on('onviewportout', this.videoView.pause);

            this.$viewportTarget = $video;
        }
    },

    initializeGallery() {
        this.$el.magnificPopup({
            delegate: '.photo',
            type: 'image',
            gallery: {
                enabled: true
            }
        });
    }

}, {

    initializeActiveInterval() {
        if (!PostView.activeInterval) {
            PostView.activeInterval = setInterval(PostView.checkActive, 100);
            PostView.posts = [];
        }
    },

    registerPost(post) {
        PostView.initializeActiveInterval();
        PostView.posts.push(post);
    },

    checkActive() {
        let scrollTop = $(window).scrollTop(),
            scrollBottom = scrollTop + $(window).height();

        _.each(PostView.posts, (post) => {
            let $el = post.$viewportTarget || post.$el,
                top = $el.offset().top,
                bottom = top + $el.outerHeight(),
                visiblePercent = Math.max(0, Math.min(scrollBottom, bottom) -
                    Math.max(scrollTop, top)) / (bottom - top);


            if (visiblePercent > 0.7) {
                if (!post._isViewportVisible) {
                    post.trigger('onviewportin');
                }

                post.trigger('onviewportvisible');
                post._isViewportVisible = true;
            } else if (post._isViewportVisible) {
                post.trigger('onviewportout');
                post._isViewportVisible = false;
            }
        });
    }

});

module.exports = PostView;