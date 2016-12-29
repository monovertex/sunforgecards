
let Backbone    = require('backbone');
let $           = require('jquery');
let _           = require('lodash');

/**
 * The navbar view keeps the navbar elements sticky if needed and only
 * after the correct height.
 */
module.exports = Backbone.View.extend({

    el: '#navbar',

    stickyClassName: 'sticky',
    animatedClassName: 'animated',
    hideClassName: 'fade-out',

    initialize() {
        _.bindAll(this, 'onScroll', 'disableSticky');

        // If the navbar element has no siblings, it should always be stickied.
        if (this.$el.siblings().length === 0) {
            this.enableSticky();
            this.$el.addClass(this.animatedClassName);

        // If there are siblings, we need to make sure the navbar only starts
        // being stickied after the parent goes out of the viewport.
        } else {
            this.$parent = this.$el.parent();

            // Also keep a placeholder for the navbar element, so the siblings
            // don't jump up.
            this.$placeholder = $('<div></div>').addClass('placeholder').hide();
            this.$el.after(this.$placeholder);

            // Attach scroll listeners.
            $(window).scroll(_.throttle(this.onScroll, 100));
            this.onScroll();
        }
    },

    /**
     * To enable the CSS animation, we need to attach a different class a few
     * milliseconds after the sticky class is attached.
     * @param {Function} callback Function to call after the period expires
     * @param {Number} duration
     */
    applyAnimation(callback, duration=10) {
        clearTimeout(this.animationTimeout);
        this.animationTimeout = setTimeout(callback, duration);
    },

    /**
     * Applies the needed classes for the navbar to become sticky.
     */
    enableSticky() {
        let width = this.$el[0].getBoundingClientRect().width;

        this.$el
            // Make sure the navbar is visible.
            .removeClass(this.hideClassName)
            // Fix its width so it doesn't spaz out after becoming `position: fixed`.
            .width(width)
            .addClass(this.stickyClassName);
    },

    /**
     * Remove all the sticky status classes.
     */
    disableSticky() {
        this.$el
            .removeClass(this.hideClassName)
            .removeClass(this.stickyClassName)
            .removeClass(this.animatedClassName)
            .width('auto');

        this.$placeholder.hide();
    },

    /**
     * Scroll event handler.
     */
    onScroll() {
        let $el = this.$el,
            top = $(window).scrollTop(),

            // The threshold for the sticky status is the parent's bottom limit.
            threshold = this.$parent.offset().top + this.$parent.outerHeight(),
            dimensions = $el[0].getBoundingClientRect(),
            width = dimensions.width,
            height = dimensions.height,
            stickyClass = this.stickyClassName,
            animatedClass = this.animatedClassName,
            hideClass = this.hideClassName,
            isSticky = $el.hasClass(stickyClass);

        // After the scroll passed the threshold, enable the sticky status.
        // The 100px value is a buffer so this triggers only after the scroll
        // has passed the threshold and the navbar parent is definitely out
        // of the view.
        if (top > (threshold + 100)) {
            if (!isSticky) {
                this.enableSticky();

                // Resize the placeholder accordingly.
                this.$placeholder.width(width).height(height).show();

                // Apply the animation on the navbar.
                this.applyAnimation(() => $el.addClass(animatedClass));
            }

        // When scrolling back up really fast, disable the sticky status
        // immediately, because otherwise there's some weird visual effects
        // going on.
        // This is what the -100px buffer is accomplishing.
        } else if (top < (threshold - 100)) {
            if (isSticky) {
                $el.addClass(hideClass);
                this.applyAnimation(this.disableSticky, 1);
            }

        // If the scrolling back up is slow, disable the sticky, but animate it
        // after a while, for a smooth transition.
        } else {
            if (isSticky) {
                $el.addClass(hideClass);
                this.applyAnimation(this.disableSticky, 150);
            }
        }
    }

});