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
    async.eachOfLimit(data.movies, 1, function (movie, key, callback) {
        movie.id = movie.kp_id;
        CP_save.save(
            movie,
            'rt',
            function (err, result) {
                console.log(err || '', result);
                return callback();
            });
    }, function (err) {
        console.log(err || 'The movies has been added.');
    });
}

if (data.contents && data.contents.length) {
    async.eachOfLimit(data.contents, 1, function (content, key, callback) {
        CP_save.save(
            content,
            'content',
            function (err, result) {
                console.log(err || '', result);
                return callback();
            });
    }, function (err) {
        console.log(err || 'The contents has been added.');
    });
}