
let Backbone    = require('backbone');
let $           = require('jquery');
let _           = require('lodash');

module.exports = Backbone.View.extend({

    el: '#navbar',

    stickyClassName: 'sticky',
    animatedClassName: 'animated',
    hideClassName: 'fade-out',

    initialize() {
        _.bindAll(this, 'onScroll', 'disableSticky');

        if (this.$el.siblings().length === 0) {
            this.enableSticky();
            this.$el.addClass(this.animatedClassName);
        } else {
            this.$parent = this.$el.parent();
            this.$placeholder = $('<div></div>').addClass('placeholder').hide();
            this.$el.after(this.$placeholder);

            $(window).scroll(_.throttle(this.onScroll, 100));
            this.onScroll();
        }
    },

    applyAnimation(callback, duration=10) {
        clearTimeout(this.animationTimeout);
        this.animationTimeout = setTimeout(callback, duration);
    },

    enableSticky() {
        let width = this.$el[0].getBoundingClientRect().width;

        this.$el
            .removeClass(this.hideClassName)
            .width(width)
            .addClass(this.stickyClassName);
    },

    disableSticky() {
        this.$el
            .removeClass(this.hideClassName)
            .removeClass(this.stickyClassName)
            .removeClass(this.animatedClassName)
            .width('auto');

        this.$placeholder.hide();
    },

    onScroll() {
        let $el = this.$el,
            top = $(window).scrollTop(),
            threshold = this.$parent.offset().top + this.$parent.outerHeight(),
            dimensions = $el[0].getBoundingClientRect(),
            width = dimensions.width,
            height = dimensions.height,
            stickyClass = this.stickyClassName,
            animatedClass = this.animatedClassName,
            hideClass = this.hideClassName,
            isSticky = $el.hasClass(stickyClass);

        if (top > (threshold + 100)) {
            if (!isSticky) {
                this.enableSticky();

                this.$placeholder.width(width).height(height).show();

                this.applyAnimation(() => $el.addClass(animatedClass));
            }
        } else if (top < (threshold - 100)) {
            if (isSticky) {
                $el.addClass(hideClass);
                this.applyAnimation(this.disableSticky, 1);
            }
        } else {
            if (isSticky) {
                $el.addClass(hideClass);
                this.applyAnimation(this.disableSticky, 150);
            }
        }
    }

});