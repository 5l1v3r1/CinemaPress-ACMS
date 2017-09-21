'use strict';

/**
 * Module dependencies.
 */

var CP_get = require('../lib/CP_get.min');

/**
 * Configuration dependencies.
 */

var config  = require('../config/production/config');
var modules = require('../config/production/modules');

/**
 * Node dependencies.
 */

var express = require('express');
var router  = express.Router();

/**
 * RSS.
 */

router.get('/?', function(req, res) {

    var render = {};
    render.config = config;
    render.movies = [];

    if (!modules.rss.status) {
        res.header('Content-Type', 'application/xml');
        return res.render('desktop/rss', render);
    }

    CP_get.publishIds(true, function (err, ids) {
        if (err) {
            res.status(404).render('error', {
                "search"  : config.urls.search,
                "status"  : 404,
                "message" : err
            });
            return;
        }
        else if (!ids) {
            res.status(404).render('error', {
                "search"  : config.urls.search,
                "status"  : 404,
                "message" : "Публикация окончена!"
            });
            return;
        }
        render.movies = ids.movies;
        res.header('Content-Type', 'application/xml');
        res.render('desktop/rss', render);
    });

});

module.exports = router;