'use strict';

/**
 * Module dependencies.
 */

var CP_sphinx = require('../lib/CP_sphinx.min');
var CP_text   = require('../lib/CP_text');

/**
 * Configuration dependencies.
 */

var config  = require('../config/production/config');
var modules = require('../config/production/modules');

/**
 * Node dependencies.
 */

var exec    = require('child_process').exec;
var request = require('request');
var path    = require('path');
var fs      = require('fs');

/**
 * Callback.
 *
 * @callback Callback
 * @param {Object} err
 * @param {String} [result]
 */

/**
 * Save config.
 *
 * @param {Object} content
 * @param {String} name
 * @param {Callback} callback
 */

function saveContent(content, name, callback) {

    if (name === 'config' || name === 'modules') {

        var data = JSON.stringify(content);
        var dir = '/home/' + config.domain + '/config/production/';
        cp(dir + name + '.js', dir + name + '.prev.js', function (err) {
            if (err) return callback(err);
            fs.writeFile(
                dir + name + '.js',
                'module.exports = ' + data + ';',
                function (err) {
                    if (err) {
                        cp(dir + name + '.prev.js', dir + name + '.js', function (err) {
                            if (err) console.log(err);
                        });
                        return callback(err);
                    }
                    callback(null, 'Save');
                }
            );
        });

    }
    else {

        var db = name + '_' + config.domain.replace(/[^A-Za-z0-9]/g,'_');

        if (content.delete) {
            CP_sphinx.query('DELETE FROM ' + db + ' WHERE id IN (' + content.id + ')', function (err) {
                if (err) return callback(err);
                callback(null, 'Delete');
            });
        }
        else if (content.id) {
            CP_sphinx.query('SELECT * FROM ' + process.env.CP_XMLPIPE2 + ' WHERE id = ' + content.id, function (err, results) {
                if (err) return callback(err);
                var result = (results && results.length) ? results[0] : {};
                content = Object.assign({}, result, content);
                var query = insertQuery(content, name);
                CP_sphinx.query(query, function (err) {
                    if (err) return callback(err);
                    callback(null, 'Insert');
                });
            });
        }
        else {
            var query = insertQuery(content, name);
            CP_sphinx.query(query, function (err) {
                if (err) return callback(err);
                callback(null, 'Insert');
            });
        }

    }

    /**
     * Copy config.
     *
     * @param {String} oldName
     * @param {String} newName
     * @param {Callback} callback
     */

    function cp(oldName, newName, callback) {
        exec('cp ' + oldName + ' ' + newName, function(error, stdout, stderr) {
            if (error) return callback(error);
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);
            callback(null);
        });
    }

    /**
     * Create insert query.
     *
     * @param {Object} content
     * @param {String} name
     * @return {String}
     */

    function insertQuery(content, name) {

        var id = (content.id)
            ? content.id
            : 0;
        delete content.id;

        if (name === 'rt') {
            if (!id) {
                id = content.kp_id;
            }
            if (!content.query_id) {
                content.query_id = content.kp_id;
            }
            if (!content.all_movies) {
                content.all_movies = '_' + config.domain.replace(/[^A-Za-z0-9]/g,'_') + '_';
            }
        }
        else if (name === 'content') {
            if (!id) {
                id = new Date().getTime();
            }
            if (!content.all_contents) {
                content.all_contents = '_' + config.domain.replace(/[^A-Za-z0-9]/g,'_') + '_';
            }
            if (!content.content_publish) {
                var now = new Date().getTime();
                content.content_publish = now + 719528 * 1000 * 60 * 60 * 24;
            }
        }

        var keys = Object.keys(content);
        var insert = [];
        var columns = Object.keys(content);
        for (var i = 0, len = columns.length; i < len; i++) {
            insert.push(mysqlEscape(content[columns[i]]));
        }

        keys.unshift('id');
        insert.unshift(id);

        var db = name + '_' + config.domain.replace(/[^A-Za-z0-9]/g,'_');

        return 'REPLACE INTO ' + db + ' ( ' + keys.join(', ') + ' ) VALUES ( \'' + insert.join('\', \'') + '\' )';

    }

    function mysqlEscape(stringToEscape) {
        return ('' + stringToEscape)
            .replace(/'/ig, "\\'")
            .replace(/\n/ig, "\\n")
            .replace(/\r/ig, "\\r");
    }

}

/**
 * Restart server.
 *
 * @param {Callback} callback
 */

function restartServer(callback) {

    exec('pm2 reload ' + config.domain + ' --force', function(error, stdout, stderr) {
        if (error) return callback(error);
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
        callback(null);
    });

}

module.exports = {
    "save"    : saveContent,
    "restart" : restartServer
};