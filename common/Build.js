module.exports = Build
require('fast-class');
var extend = require('extend');
var shortid = require('shortid');
var statuses = ['unknown', 'success', 'planned', 'queued', 'building', 'failed']

function Build(conf, client, agent, platform, files, outputFiles, id, masterId) {
    this.conf = extend(true, {}, conf);
    this.client = client;
    this.agent = agent;
    if (files)
        this.files = files;
    this.id = id || shortid.generate();
    this.conf.platform = platform;
    this.conf.logs = conf.logs || [];
    if (masterId) {
        if (masterId.id)
            this.master = masterId;
        this.masterId = masterId && masterId.id || masterId;
    }
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
    },
    updateStatus: function(newStatus) {
        this.conf.status = newStatus;
        if (this.master) 
        {
            var masterStatus = 0;
            this.master.platforms.forEach(function(child, i) {
                i = statuses.indexOf(child && child.conf && child.conf.status);
                if (i > masterStatus)
                    masterStatus = i;
            });
            this.master.conf.status = statuses[masterStatus];
        }
    },
});