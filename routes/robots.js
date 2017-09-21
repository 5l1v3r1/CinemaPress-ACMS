'use strict';

/**
 * Configuration dependencies.
 */

var config = require('../config/production/config');

/**
 * Node dependencies.
 */

var express = require('express');
var router  = express.Router();

/**
 * Robots.
 */

router.get('/?', function(req, res) {

    var protocol = (config.protocol === 'https://')
        ? config.protocol
        : '';

    res.header('Content-Type', 'text/plain');

    res.send(
        config.codes.robots + '\n\n' +
        'Host: ' + protocol + config.domain + '\n\n' +
        'Sitemap: ' + config.protocol + config.domain + '/' + config.urls.sitemap
    );

});

module.exports = router;