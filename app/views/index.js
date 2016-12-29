
let Backbone = require('backbone');
let PageView = require('./page');
let $        = require('jquery');
let _        = require('lodash');

/**
 * Manages the infinite loading index page.
 */
module.exports =  Backbone.View.extend({

    // Height offset to trigger the loading of a new page.
    bufferHeight: 800,

    initialize() {
        _.bindAll(this, 'onScroll');

        this.pages = [];

        // Make sure the first page is inserted into the array of views.
        this.insertPage(this.$('.page').first());

        // Save the scroll target and throttle the scroll listener.
        this.$scrollTarget = $(window).scroll(_.throttle(this.onScroll, 100));
    },

    /**
     * While scrolling, detect the current position and request a new page
     * if needed.
     */
    onScroll() {
        let scrollTop = this.$scrollTarget.scrollTop(),
            $el = this.$el,
            bottom = $el.offset().top + $el.get(0).getBoundingClientRect().height,
            windowHeight = $(window).height(),
            threshold = bottom - windowHeight - this.bufferHeight;

        if (scrollTop > threshold) {
            this.requestPage();
        }
    },

    /**
     * Insert a new page view into the internal list.
     * @param {jQuery} $el
     */
    insertPage($el) {
        this.pages.push(new PageView({ el: $el }));
    },

    /**
     * Grabs a new page from the server and injects it into the DOM, at the end
     * of the post list.
     */
    requestPage() {
        let index = this.pages.length;

        // Prevent multiple requests while the new page is still loading and
        // not yet injected into the DOM.
        if (!this.lockRequest) {
            this.lockRequest = true;

            // Request the page and inject it into the DOM afterwards.
            $.ajax({
                url      : `/page/${index}/`,
                method   : 'post',
                dataType : 'text'
            }).done((response) => {
                // Inject the HTML.
                let $page = $(response).appendTo(this.$el);

                // Keep track of the page in the list.
                this.insertPage($page);

                // Make sure the lock is cleared.
                this.lockRequest = false;
            });
        }
    },

});