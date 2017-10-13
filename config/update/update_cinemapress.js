'use strict';

/**
 * Module dependencies.
 */

var CP_save = require('../../lib/CP_save.min');

/**
 * Configuration dependencies.
 */

var config  = require('../production/config');
var modules = require('../production/modules');

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
    fs.statSync(path.join(__dirname, '..', 'default', 'config.js'));
    fs.statSync(path.join(__dirname, '..', 'default', 'modules.js'));
}
catch(err) {
    return console.log('NOT DEFAULT CONFIG AND MODULES');
}

/**
 * New configuration dependencies.
 */

var config_default  = require('../default/config');
var modules_default = require('../default/modules');

function objReplace(obj_new, obj_old) {

    obj_new = JSON.stringify(obj_new);
    obj_new = JSON.parse(obj_new);

    obj_old = JSON.stringify(obj_old);
    obj_old = JSON.parse(obj_old);

    for (var key in obj_new) {
        if (obj_new.hasOwnProperty(key) && obj_old.hasOwnProperty(key)) {
            if (typeof obj_new[key] === 'object' && !Array.isArray(obj_new[key])) {
                obj_new[key] = objReplace(obj_new[key], obj_old[key]);
            }
            else {
                if (typeof obj_new[key] === typeof obj_old[key]) {
                    if (key === 'addr' && !process.argv[2]) continue;
                    obj_new[key] = obj_old[key];
                }
            }
        }
    }

    return obj_new;

}

function objAdd(obj_new, obj_old) {

    obj_new = JSON.stringify(obj_new);
    obj_new = JSON.parse(obj_new);

    obj_old = JSON.stringify(obj_old);
    obj_old = JSON.parse(obj_old);

    for (var key in obj_old) {
        if (obj_old.hasOwnProperty(key) && obj_new.hasOwnProperty(key)) {
            if (typeof obj_old[key] === 'object' && !Array.isArray(obj_old[key])) {
                obj_new[key] = objAdd(obj_new[key], obj_old[key]);
            }
        }
        else if (obj_old.hasOwnProperty(key) && !obj_new.hasOwnProperty(key)) {
            obj_new[key] = obj_old[key];
        }
    }

    return obj_new;

}

async.series({
        "config": function (callback) {
            CP_save.save(
                objAdd(objReplace(config_default, config), config),
                'config',
                function (err, result) {
                    return (err)
                        ? callback(err)
                        : callback(null, result)
                });
        },
        "modules": function (callback) {
            CP_save.save(
                objAdd(objReplace(modules_default, modules), modules),
                'modules',
                function (err, result) {
                    return (err)
                        ? callback(err)
                        : callback(null, result)
                });
        }
    },
    function(err, result) {

        if (err) {
            return console.log(err);
        }

        CP_save.restart(
            true,
            function (err, result) {
                return (err)
                    ? console.log(err)
                    : console.log(result)
            });

    });