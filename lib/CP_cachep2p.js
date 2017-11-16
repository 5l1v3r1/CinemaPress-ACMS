'use strict';

/**
 * Configuration dependencies.
 */

var config = require('../config/production/config');

/**
 * Node dependencies.
 */

var path = require('path');
var fs   = require('fs');

/**
 * Set hash.
 *
 * @param {String} url
 * @param {String} hash
 */

function setHash(url, hash) {

    fs.readFile(path.join(path.dirname(__dirname), 'files', 'cachep2p.security.js'), 'utf8', function(err, cachep2p) {
        if (err) return console.log(err);
        cachep2p = (cachep2p)
            ? tryParseJSON(cachep2p
                .replace('document.security_sha1 = {', '{')
                .replace('};', ';'))
            : {};
        cachep2p[url] = hash;
        fs.writeFile(
            path.join(path.dirname(__dirname), 'files', 'cachep2p.security.js'),
            'document.security_sha1 = ' + JSON.stringify(cachep2p) + ';',
            function (err) {
                if (err) console.log(err);
            });
    });

}

/**
 * Set code in footer.
 */

function codeHash() {

    return '' +
        '<script src="//unpkg.com/cachep2p/cachep2p.min.js"></script>' +
        '<script src="/files/cachep2p.security.js"></script>' +
        '<script>var cachep2p = new CacheP2P;</script>';

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

module.exports = {
    "set": setHash,
    "code": codeHash
};