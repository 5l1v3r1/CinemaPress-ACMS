'use strict';

/**
 * Module dependencies.
 */

var CP_save = require('../../lib/CP_save');

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
    fs.statSync(path.join(__dirname, '..', 'production', 'texts.js'));
}
catch(err) {
    return console.log('NOT FILE TEXTS');
}

/**
 * New configuration dependencies.
 */

var texts_production = require('../production/texts');

if (!texts_production.movies) {
    return console.log('NOT MOVIES');
}

async.eachOfLimit(texts_production.movies, 1, function (movie, key, callback) {
    var id = parseInt(key);
    var rt = {};
    rt.id = id;
    rt.kp_id = id;
    rt.title_page = movie.title || '';
    rt.description = movie.description || '';
    rt.quality = movie.quality || '';
    rt.translate = movie.translate || '';
    rt.player = movie.player || '';
    CP_save.save(
        rt,
        'rt',
        function (err, result) {
            console.log(err || '', result);
            return callback();
        });
}, function (err) {
    console.log(err);
});