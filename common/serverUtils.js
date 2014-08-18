var path = require('path');
var fs = require('fs.extra');
var async = require('async');
var mkdirp = require('mkdirp');
var extend = require('extend');
var multiGlob = require('multi-glob');
module.exports = {
    writeFiles: function (folder, files, locationMsg, doNotFreeMem, done) {
        if (typeof doNotFreeMem == 'function') {
            done = doNotFreeMem;
            doNotFreeMem = false;
        }
        var server = this;
        mkdirp(folder, function (err) {
            if (err) {
                err = "error creating folder {0} on {1}\n{2}".format(folder, locationMsg, err);
                done(err);
            } else {
                files.length ? async.each(files, function (file, cb) {
                    //console.log("FFFFFF", folder.replace('d:\\Work\\DotNetWise\\Nuggets\\cordova-build\\', ''), 
                    //    file.file.replace('d:\\Work\\DotNetWise\\Nuggets\\cordova-build\\', ''),
                    //        path.resolve(folder, path.basename(file.file)).replace('d:\\Work\\DotNetWise\\Nuggets\\cordova-build\\', ''),
                    //        path.basename(file.file));
                    var fileName = path.resolve(folder, path.basename(file.file));
                    file.file = fileName;
                    var data = new Buffer(file.content.data, 'base64');
                    file.content ? fs.writeFile(fileName, data, {
                        encoding: 'binary',
                    }, function (err) {
                        !doNotFreeMem && delete file.content; //free server's memory with file's content
                        cb(err);
                    })
                    : cb(null);
                }, function (err) {
                    if (err)
                        err = "error saving cordova build files to {0} on {1}\n{2}".format(folder, locationMsg, err);
                    done(err);
                }) : done(null);
            }
        });
    },
    freeMemFiles: function (files) {
        files.forEach(function (file) {
            delete file.content;
        });
    },
    readFiles: function (files, locationMsg, done) {
        files.length ? async.each(files, function (file, cb) {
            fs.readFile(file.file, {
                //encoding: 'binary',
            }, function (err, data) {
                if (!err) {
                    var buf = new Buffer(data);
                    file.content = {
                        data: buf.toString('base64'),
                    };
                    var length = file.content.data.length;
                    global.bu = buf;
                }
                cb(err);
            });
        }, function (err) {
            if (err)
                err = "error reading build input files on {0}\n{1}".format(locationMsg, err);
            done(err);
        }) : done(null);
    },
    cleanLastFolders: function (keepLast, globsArray, done) {
    	if (keepLast <= 0)
    		done();
    	multiGlob.glob(globsArray, function (err, paths) {
    		if (err) return done(err);
    		if (!paths.length) return done();
				
    		async.map(paths, function (path, done) {
    			fs.stat(path, function (err, stat) {
    				done(err, { path: path, stat: stat });
    			});
    		}, function (err, stats) {
    			if (err) return done(err);
    			stats = stats.filter(function (stat) { return stat.stat.isDirectory(); });
    			stats.sort(function (a, b) { return b.stat.mtime - a.stat.mtime; });
    			stats.splice(0, keepLast);
    			async.each(stats, function (stat, cb) {
    				fs.remove(stat.path, cb);
    			}, function (err) {
    				done(err, stats);
    			});
    		});
    	});
    },
};