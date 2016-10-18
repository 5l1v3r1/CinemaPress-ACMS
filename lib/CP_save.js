'use strict';

/**
 * Configuration dependencies.
 */

var config  = require('../config/config');
var modules = require('../config/modules');

/**
 * Node dependencies.
 */

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

    var data = JSON.stringify(content);

    fs.readFile(
        path.join(path.dirname(__dirname), 'config', name + '.js'),
        function (err, contentOld) {
            if (err) return callback(err);
            fs.writeFile(
                path.join(path.dirname(__dirname), 'config', name + '.prev.js'),
                contentOld,
                function (err) {
                    if (err) return callback(err);
                    fs.writeFile(
                        path.join(path.dirname(__dirname), 'config',  name + '.js'),
                        'module.exports = ' + data + ';',
                        function (err) {
                            if (err) return callback(err);
                            callback(null, 'Save file - ' + 'config/' + name + '.js');
                        }
                    );
                }
            );
        }
    );

}

/**
 * Restart server.
 */

function restartServer() {

    if (modules.episode && modules.episode.status && modules.player.data.moonwalk.token) {
        request('http://moonwalk.cc/api/translators.json?api_token=' + modules.player.data.moonwalk.token.trim(), function (error, response, body) {
            if (response.statusCode == 200 && body) {
                fs.writeFile(
                    path.join(path.dirname(__dirname), 'config', 'translates.json'),
                    body,
                    function (err) {
                        if (err) console.log(err);
                    });
            }
        });
    }

    fs.stat(
        path.join(path.dirname(__dirname), 'restart.server'),
        function (err, stats) {
            return (!stats)
                ? fs.writeFile(
                path.join(path.dirname(__dirname), 'restart.server'),
                new Date() + ' - Restart',
                function (err) {
                    if (err) console.log(err);
                })
                : fs.readFile(
                path.join(path.dirname(__dirname), 'restart.server'),
                function (err, restart) {
                    if (err) return console.log(err);
                    fs.writeFile(
                        path.join(path.dirname(__dirname), 'restart.server'),
                        new Date() + ' - Restart\n' + restart,
                        function (err) {
                            if (err) console.log(err);
                        }
                    );
                });
        }
    );

}

module.exports = {
    "save"    : saveContent,
    "restart" : restartServer
};