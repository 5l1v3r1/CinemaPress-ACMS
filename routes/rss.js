'use strict';

/**
 * Module dependencies.
 */

var CP_cache  = require('../lib/CP_cache');
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

var md5     = require('md5');
var express = require('express');
var router  = express.Router();

/**
 * RSS.
 */

router.get('/?', function(req, res, next) {

    var url = req.originalUrl;
    var urlHash = md5(url.toLowerCase());

    getRender(function (err, render) {

        renderData(err, render);

    });

    /**
     * Get render.
     *
     * @param {Callback} callback
     */

    function getRender(callback) {

        return (config.cache.time)
            ? getCache(
                function (err, render) {
                    return (err)
                        ? callback(err)
                        : callback(null, render)
                })
            : getSphinx(
                function (err, render) {
                    return (err)
                        ? callback(err)
                        : callback(null, render)
                });

    }

    /**
     * Get cache.
     *
     * @param {Callback} callback
     */

    function getCache(callback) {

        CP_cache.get(urlHash, function (err, render) {

            if (err) return callback(err);

            return (render)
                ? callback(null, render)
                : getSphinx(
                    function (err, render) {
                        return (err)
                            ? callback(err)
                            : callback(null, render)
                    });

        });

    }

    /**
     * Get sphinx.
     *
     * @param {Callback} callback
     */

    function getSphinx(callback) {

        if (!modules.rss.status) {
            return callback('RSS отключен!');
        }

        var render = {};
        render.config = config;
        render.movies = [];
        var collection = (req.query.collection) ? CP_regexp.str(req.query.collection) : '';

        if (modules.content.status && collection) {
            CP_get.contents(
                {"content_url": collection},
                function (err, contents) {
                    if (err) {
                        return callback(err);
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
                                    return callback(err);
                                }

                                render.movies = movies;
                                callback(null, render);
                            });
                    }
                    else {
                        return callback('Коллекция пустая!');
                    }
                });
        }
        else {
            CP_get.publishIds(true, function (err, ids) {
                if (err) {
                    return callback(err);
                }
                else if (!ids) {
                    return callback('Публикация окончена!');
                }
                render.movies = ids.movies;
                callback(null, render);
            });
        }

    }

    /**
     * Render data.
     *
     * @param {Object} err
     * @param {Object} render
     */

    function renderData(err, render) {

        if (err) {
            console.log('[routes/rss.js] Error:', url, err);

            return next({
                "status": 404,
                "message": err
            });
        }

        if (typeof render === 'object') {

            res.header('Content-Type', 'application/xml');
            res.render('desktop/rss', render, function(err, html) {
                if (err) console.log('[renderData] Render Error:', err);

                res.send(html);

                if (config.cache.time && html) {
                    CP_cache.set(
                        urlHash,
                        html,
                        config.cache.time,
                        function (err) {
                            if (err) console.log('[renderData] Cache Set Error:', err);
                        }
                    );
                }
            });

        }
        else {

            res.send(render);

        }

    }

});

module.exports = router;