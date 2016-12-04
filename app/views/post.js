
let Backbone = require('backbone');
let PhotosetView = require('./photoset');
let VideoView = require('./video');
let _ = require('lodash');
let $ = require('jquery');
require('magnific-popup');

let PostView =  Backbone.View.extend({

    initialize() {
        this.initializePhotoset();
        this.initializeGallery();
        this.initializeVideo();
        PostView.registerPost(this);
    },

    initializePhotoset() {
        let $photoset = this.$('.photoset');

        if ($photoset.length) {
            this.photosetView = new PhotosetView({ el: $photoset });
            this.on('onviewportin', this.photosetView.openNext);
        }
    },

    initializeVideo() {
        let $video = this.$('.video-wrapper');

        if ($video.length) {
            this.videoView = new VideoView({ el: $video });
            this.on('onviewportin', this.videoView.play);
            this.on('onviewportout', this.videoView.pause);
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

    currentPost: null,

    initializeActiveInterval() {
        if (!PostView.activeInterval) {
            PostView.activeInterval = setInterval(PostView.checkActive, 5000);
            PostView.posts = [];
        }
    },

    registerPost(post) {
        PostView.initializeActiveInterval();
        PostView.posts.push(post);
    },

    checkActive() {
        let scrollTop = $(window).scrollTop(),
            scrollBottom = scrollTop + $(window).height(),
            currentPost = null;

        _.each(PostView.posts, (post) => {
            let top, bottom, $el = post.$el;

            if (!$el.is(':hover')) {
                top = $el.offset().top;
                bottom = top + $el.outerHeight();

                if (bottom > scrollTop && top < scrollBottom) {
                    post.trigger('onviewportin');
                    currentPost = post;
                } else if (post === PostView.currentPost) {
                    post.trigger('onviewportout');
                }
            }
        });

        PostView.currentPost = currentPost;
    }

});

module.exports = PostView;