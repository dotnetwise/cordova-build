module.exports = Build
require('fast-class');
var shortid = require('shortid');
function Build(conf, client, platform) {
    this.conf = conf;
	this.client = client;
    this.id = shortid.generate();
    this.platform = platform;
}
Build.define({

});