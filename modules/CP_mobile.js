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

        if (modules.mobile.data.theme === 'custom') {
            data = data
                .replace('custom_a', modules.mobile.data.custom.a)
                .replace('custom_hover', modules.mobile.data.custom.hover)
                .replace('custom_body_color', modules.mobile.data.custom.body_color)
                .replace('custom_body_bg', modules.mobile.data.custom.body_bg)
                .replace('custom_title_color', modules.mobile.data.custom.title_color)
                .replace('custom_title_bg', modules.mobile.data.custom.title_bg)
                .replace('custom_description_color', modules.mobile.data.custom.description_color)
                .replace('custom_description_bg', modules.mobile.data.custom.description_bg)
                .replace('custom_block', modules.mobile.data.custom.block)
                .replace('custom_form', modules.mobile.data.custom.form)
                .replace('custom_btn_color', modules.mobile.data.custom.btn_color)
                .replace('custom_btn_bg', modules.mobile.data.custom.btn_bg);
        }
    }
    else {
        data += '<link rel="alternate" media="only screen and (max-width: 1000px)" href="' + url.replace('://', '://m.') + '">';
    }

    return data;

}

module.exports = {
    "mobile" : mobileVersion
};