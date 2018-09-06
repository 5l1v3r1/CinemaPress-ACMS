'use strict';

/**
 * Module dependencies.
 */

var CP_save = require('../../lib/CP_save.min');

/**
 * Node dependencies.
 */

var async = require('async');
var path  = require('path');
var fs    = require('fs');

/**
 * Check files.
 */

try {
    var data = tryParseJSON(fs.readFileSync(path.join(__dirname, 'default.json'), 'utf8'));
}
catch(err) {
    return console.log('NOT FILE DEFAULT DATA');
}

/**
 * Valid JSON.
 *
 * @param {String} jsonString
 */

function tryParseJSON(jsonString) {
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }
    return {};
}

if (data.movies && data.movies.length) {
    var m = 0;
    async.eachOfLimit(data.movies, 1, function (movie, key, callback) {
        movie.id = movie.kp_id;
        movie.duplicate = true;
        CP_save.save(
            movie,
            'rt',
            function (err, result) {
                if (err) {
                    console.log(err);
                }
                if (result) {
                    console.log(result);
                    m = m+1;
                }
                return callback();
            });
    }, function (err) {
        console.log('');
        console.log(err || m + ' movies added.');
        console.log('');
    });
}

if (data.contents && data.contents.length) {
    var c = 0;
    async.eachOfLimit(data.contents, 1, function (content, key, callback) {
        CP_save.save(
            content,
            'content',
            function (err, result) {
                if (err) {
                    console.log(err);
                }
                if (result) {
                    console.log(result);
                    c = c+1;
                }
                return callback();
            });
    }, function (err) {
        console.log('');
        console.log(err || m + ' contents added.');
        console.log('');
    });
}