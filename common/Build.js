module.exports = Build
require('fast-class');
var Guid = require('guid');
function Build(conf, client, platform) {
    this.conf = conf;
	this.client = client;
    this.uuid = Guid.raw();
    this.platform = platform;
}
Build.define({

});