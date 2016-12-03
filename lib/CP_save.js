'use strict';

/**
 * Configuration dependencies.
 */

var config  = require('../config/config');
var modules = require('../config/modules');

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

    var data = JSON.stringify(content);

    var dir = '/home/' + config.domain + '/config/';

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
                callback(null, 'Save file - config/' + name + '.js');
            }
        );
    });

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

    exec('echo "' + new Date() + ' - Restart" >> /home/' + config.domain + '/restart.server', function(error, stdout, stderr) {
        if (error) console.log(error);
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
    });

}

module.exports = {
    "save"    : saveContent,
    "restart" : restartServer
};