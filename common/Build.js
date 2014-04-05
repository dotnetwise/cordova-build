module.exports = Build
require('fast-class');
var extend = require('extend');
var shortid = require('shortid');
function Build(conf, client, agent, platform, files, outputFiles, id, masterId) {
    this.conf = extend(true, {}, conf);
    this.client = client;
    this.agent = agent;
    if (files)
        this.files = files;
    this.id = id || shortid.generate();
    this.conf.platform = platform;
    this.conf.logs = conf.logs || [];
    if (masterId)
        this.masterId = masterId;
    if (outputFiles)
        this.outputFiles = outputFiles;
}
Build.define({
    serialize: function (includeOptions) {
        var result = {
            conf: this.conf,
            id: this.id,
        };
        if (this.masterId)
            result.masterId = this.masterId;
        if (includeOptions) {
            if (includeOptions.files) result.files = this.files;
            if (includeOptions.outputFiles) result.outputFiles = this.outputFiles;
            if (includeOptions.platforms) {
                //serialize individual build per platform
                if (this.platforms) {
                    result.platforms = [];
                    (this.platforms || []).forEach(function (platformBuild) {
                        result.platforms.push(platformBuild.serialize());
                    });
                }
            }
        }
        return result;
    }
});