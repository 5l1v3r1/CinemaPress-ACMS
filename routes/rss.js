'use strict';

/**
 * Module dependencies.
 */

var CP_get    = require('../lib/CP_get.min');
var CP_regexp = require('../lib/CP_regexp');

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
    var collection = (req.query.collection) ? CP_regexp.str(req.query.collection) : '';

    if (!modules.rss.status) {
        res.header('Content-Type', 'application/xml');
        return res.render('desktop/rss', render);
    }

    if (modules.content.status && collection) {
        CP_get.contents(
            {"content_url": collection},
            function (err, contents) {
                if (err) {
                    res.status(404).render('error', {
                        "search"  : config.urls.search,
                        "status"  : 404,
                        "message" : err
                    });
                    return;
                }
                if (contents && contents.length && contents[0].movies) {
                    var query_id = [];
                    contents[0].movies.forEach(function (item, i, arr) {
                        query_id.push(item + '^' + (parseInt(arr.length) - parseInt(i)))
                    });
                    var query = {"query_id": query_id.join('|')};
                    CP_get.movies(
                        query,
                        contents[0].movies.length,
                        '',
                        1,
                        function (err, movies) {
                            if (err) {
                                res.status(404).render('error', {
                                    "search": config.urls.search,
                                    "status": 404,
                                    "message": err
                                });
                                return;
                            }

                            render.movies = movies;
                            res.header('Content-Type', 'application/xml');
                            res.render('desktop/rss', render);
                        });
                }
                else {
                    res.status(404).render('error', {
                        "search"  : config.urls.search,
                        "status"  : 404,
                        "message" : "Коллекция пустая!"
                    });
                }
            });
    }
    else {
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
    }

});

module.exports = router;