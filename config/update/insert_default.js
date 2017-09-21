'use strict';

/**
 * Module dependencies.
 */

var CP_save = require('../../lib/CP_save');

/**
 * Node dependencies.
 */

var path = require('path');
var fs   = require('fs');

/**
 * Check files.
 */

try {
    var data = tryParseJSON(fs.readFileSync(path.join(__dirname, 'default.json'), 'utf8'));
}
catch(err) {
    return console.log('NOT FILE MODULES');
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
    return null;
}

if (data.movies && data.movies.length) {
    data.movies.forEach(function (movie) {
        sleep2(100);
        movie.id = movie.kp_id;
        CP_save.save(
            movie,
            'rt',
            function (err, result) {
                return (err)
                    ? console.log(err)
                    : console.log(result);
            });
    })
}

if (data.contents && data.contents.length) {
    data.contents.forEach(function (content) {
        sleep2(100);
        CP_save.save(
            content,
            'content',
            function (err, result) {
                return (err)
                    ? console.log(err)
                    : console.log(result);
            });
    });
}

function sleep2(ms) {
    ms += new Date().getTime();
    while (new Date() < ms){}
}