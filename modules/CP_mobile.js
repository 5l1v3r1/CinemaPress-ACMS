'use strict';

/**
 * Configuration dependencies.
 */

var config  = require('../config/production/config');
var modules = require('../config/production/modules');

/**
 * Node dependencies.
 */

var path = require('path');
var fs   = require('fs');

/**
 * Adding to the pages of the website information on the mobile site.
 *
 * @param {String} url
 * @return {Object}
 */

function mobileVersion(url) {

    var data = '';

    if (url.indexOf('://m.')+1) {
        data += '<link rel="canonical" href="' + url.replace('://m.', '://') + '">';
        var css = fs.readFileSync(path.join(path.dirname(__dirname), 'themes', 'default', 'public', 'mobile', modules.mobile.data.theme, 'css', 'style.css'));
        data += '<style>' + css + '</style>';
    }
    else {
        data += '<link rel="alternate" media="only screen and (max-width: 1000px)" href="' + url.replace('://', '://m.') + '">';
    }

    return data;

}

module.exports = {
    "mobile" : mobileVersion
};