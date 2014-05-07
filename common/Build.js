module.exports = Build
require('fast-class');
var CircularJSON = require('circular-json');
var extend = require('extend');
var fs = require('fs.extra');
var path = require('path');
var shortid = require('shortid');
var statuses = ['unknown', 'cancelled', 'success', 'planned', 'queued', 'building', 'failed']
var working = [];
function Build(conf, client, agent, platform, files, outputFiles, id, masterId) {
    if (arguments.length == 1) {
        var b = conf || {};
        var r = new Build(b.conf, b.client, b.agent, b.conf && b.conf.platform, b.files, b.outputFiles, b.id, b.masterId);
        if (Array.isArray(b.platforms))
        {
                r.platforms = [];
                b.platforms.forEach(function(platformBuild) {
                    var pb = new Build(platformBuild);
                    pb.master = r;
                    r.platforms.push(pb);
                });
        }
        return r;
    }
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
	Id: function () { return this.conf.number || this.id; },
    serialize: function (includeOptions, platformOptions) {
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
                        result.platforms.push(platformBuild.serialize(platformOptions));
                    });
                }
            }
        }
        return result;
    },
    updateStatus: function (newStatus, location) {
    	var save = this.conf.status != newStatus;
        this.conf.status = newStatus;
        if (this.master) 
        {
            var masterStatus = 0;
            this.master.platforms.forEach(function(child, i) {
                i = statuses.indexOf(child && child.conf && child.conf.status);
                if (i > masterStatus)
                    masterStatus = i;
            });
            if (this.master.conf.status != statuses[masterStatus]) {
            	this.master.updateStatus(statuses[masterStatus], location);
            }
        }
        else {
        	if (save) {
        		var buildPath = path.resolve(location, this.Id(), 'build.json');
        		this.save(buildPath);
        	}
        }
    },
    save: function (buildPath, callback) {
    	var build = this;
    	var json = CircularJSON.stringify(build.serialize({
    		files: true,
    		outputFiles: true,
    		platforms: true,
    	}, {
    		files: true,
    		outputFiles: true,
    	}), null, 4);
    	if (working.length == 0) {
    		save();
    	}
    	else working.unshift(save);

    	function save() {
    		working.push(save);
    		fs.writeFile(buildPath, json, function (e) {
    			if (e) return callback && callback("Error while saving build.json for {0}:\n{1}".format(build.Id(), e), e, buildPath, json);
    			callback && callback(null, null, buildPath, json);
    			working.pop();
    			var next = working.pop();
    			next && next();
    		});
    	}
    },
});