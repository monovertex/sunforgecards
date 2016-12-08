
let Backbone    = require('backbone');
let $           = require('jquery');
let _           = require('lodash');

module.exports = Backbone.View.extend({

    el: '#navbar',

    stickClassName: 'sticky',
    animatedClassName: 'animated',
    hideClassName: 'fade-out',

    initialize() {
        _.bindAll(this, 'onScroll');

        this.$parent = this.$el.parent();
        this.$placeholder = $('<div></div>').hide();
        this.$el.after(this.$placeholder);

        $(window).scroll(_.throttle(this.onScroll, 100));
        this.onScroll();
    },

    applyAnimation(callback, duration=10) {
        clearTimeout(this.animationTimeout);
        this.animationTimeout = setTimeout(callback, duration);
    },

    onScroll() {
        let $el = this.$el,
            top = $(window).scrollTop(),
            threshold = this.$parent.offset().top + this.$parent.outerHeight() + 100,
            dimensions = $el[0].getBoundingClientRect(),
            width = dimensions.width,
            height = dimensions.height,
            stickyClass = this.stickClassName,
            animatedClass = this.animatedClassName,
            hideClass = this.hideClassName,
            isSticky = $el.hasClass(stickyClass);

        if (top > threshold) {
            if (!isSticky) {
                $el
                    .removeClass(hideClass)
                    .width(width)
                    .addClass(stickyClass);

                this.$placeholder.width(width).height(height).show();

                this.applyAnimation(() => $el.addClass(animatedClass));
            }
        } else {
            if (isSticky) {
                $el.addClass(hideClass);

                this.applyAnimation(() => {
                    $el
                        .removeClass(hideClass)
                        .removeClass(stickyClass)
                        .removeClass(animatedClass)
                        .width('auto');

                    this.$placeholder.hide();
                }, 150);
            }
        }
    }

});