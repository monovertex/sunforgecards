
/**
 * Assigns the prefixed flex values on a jQuery element.
 * @param {jQuery} $targets
 * @param {String} value
 * @return {jQuery}
 */
module.exports = function ($targets, value) {
    return $targets.each(function () {
        this.style.webkitFlex = value;
        this.style.msFlex = value;
        this.style.flex = value;
    });
};