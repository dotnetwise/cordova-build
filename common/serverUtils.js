var path = require('path');
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var extend = require('extend');
module.exports = {
    writeFiles: function (folder, files, locationMsg, done) {
        var server = this;
        mkdirp(folder, function (err) {
            if (err) {
                err = "error creating folder {0} on {1}\n{2}".format(folder, locationMsg, err);
                done(err);
            } else {
                files.length ? async.each(files, function (file, cb) {
                    console.log("FFFFFF", folder.replace('d:\\Work\\DotNetWise\\Nuggets\\cordova-build\\', ''), 
                        file.file.replace('d:\\Work\\DotNetWise\\Nuggets\\cordova-build\\', ''),
                            path.resolve(folder, path.basename(file.file)).replace('d:\\Work\\DotNetWise\\Nuggets\\cordova-build\\', ''),
                            path.basename(file.file));
                    var fileName = path.resolve(folder, path.basename(file.file));
                    file.file = fileName;
                    file.content ? fs.writeFile(fileName, new Buffer(file.content.data, 'binary').toString(), {
                        encoding: 'binary',
                    }, function (err) {
                        delete file.content; //free server's memory with file's content
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
                encoding: 'binary',
            }, function (err, data) {
                if (!err) {
                    file.content = {
                        data: new Buffer(data).toString('binary'),
                    };
                }
                cb(err);
            });
        }, function (err) {
            if (err)
                err = "error reading build input files on {0}\n{1}".format(locationMsg, err);
            done(err);
        }) : done(null);
    },
};