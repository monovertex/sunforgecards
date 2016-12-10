
let Backbone = require('backbone');
let PageView = require('./page');
let $        = require('jquery');
let _        = require('lodash');

module.exports =  Backbone.View.extend({

    bufferHeight: 800,

    initialize() {
        _.bindAll(this, 'onScroll');

        this.pages = [];

        this.insertPage(this.$('.page').first());

        this.$scrollTarget = $(window).scroll(_.throttle(this.onScroll, 100));
    },

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

    insertPage($el) {
        this.pages.push(new PageView({ el: $el }));
    },

    requestPage() {
        let index = this.pages.length;

        if (!this.lockRequest) {
            this.lockRequest = true;

            $.ajax({
                url      : `/page/${index}/`,
                method   : 'post',
                dataType : 'text'
            }).done((response) => {
                let $page = $(response).appendTo(this.$el);

                this.insertPage($page);

                this.lockRequest = false;
            });
        }
    },

});