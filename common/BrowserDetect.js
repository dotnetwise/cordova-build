module.exports = function BrowserDetect(userAgent){
    this.userAgent = userAgent || '';
}.define({
    android: function() {
        return this.userAgent.match(/Android/i);
    },
    blackBerry: function() {
        return this.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return this.userAgent.match(/iPhone|iPad|iPod/i);
    },
    opera: function() {
        return this.userAgent.match(/Opera Mini/i);
    },
    windows: function() {
        return this.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (this.isMobile.android() || this.blackBerry() || this.iOS() || this.opera() || this.windows());
    }
});
