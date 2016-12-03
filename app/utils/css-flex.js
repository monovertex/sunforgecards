

module.exports = function ($targets, value) {
    return $targets.each(function () {
        this.style.webkitFlex = value;
        this.style.msFlex = value;
        this.style.flex = value;
    });
};