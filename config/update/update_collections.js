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
    fs.statSync(path.join(__dirname, '..', 'production', 'modules.js'));
}
catch(err) {
    return console.log('NOT FILE MODULES');
}

/**
 * New configuration dependencies.
 */

var modules_production = require('../production/modules');

if (!modules_production.collections || !modules_production.collections.data.collections) {
    return console.log('NOT COLLECTIONS');
}

async.eachOfLimit(modules_production.collections.data.collections, 1, function (collection, key, callback) {
    var content = {};
    content.content_url = key;
    content.content_image = collection.image || '';
    content.content_title = collection.title || '';
    content.content_description = collection.description || '';
    content.content_tags = 'коллекция';
    content.content_movies = collection.movies.join(',');
    CP_save.save(
        content,
        'content',
        function (err, result) {
            console.log(err || '', result);
            return callback();
        });
}, function (err) {
    console.log(err);
});