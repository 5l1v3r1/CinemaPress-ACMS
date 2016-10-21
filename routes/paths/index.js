'use strict';

/**
 * Module dependencies.
 */

var CP_page = require('../../lib/CP_page');
var CP_get  = require('../../lib/CP_get');

var CP_episode = require('../../modules/CP_episode');

/**
 * Configuration dependencies.
 */

var config  = require('../../config/config');
var modules = require('../../config/modules');

/**
 * Node dependencies.
 */

var async = require('async');

/**
 * Callback.
 *
 * @callback Callback
 * @param {Object} err
 * @param {Object} [render]
 */

/**
 * Getting the data to render index page.
 *
 * @param {Object} [options]
 * @param {Callback} callback
 */

function dataIndex(options, callback) {

    if (arguments.length == 1) {
        callback = options;
        options = {};
        options.domain = '' + config.domain;
    }

    async.parallel({
            "slider": function (callback) {
                return (modules.slider.status)
                    ? CP_get.additional(
                    {"query_id": modules.slider.data.movies},
                    'ids',
                    options,
                    function (err, movies) {
                        if (err) return callback(err);

                        return (movies && movies.length)
                            ? callback(null, movies[0])
                            : callback(null, null)
                    })
                    : callback(null, null)
            },
            "soon": function (callback) {
                return (modules.soon.status)
                    ? CP_get.additional(
                    {"all_movies": "_all_"},
                    'soon',
                    options,
                    function (err, movies) {
                        if (err) return callback(err);

                        return (movies && movies.length)
                            ? callback(null, movies[0])
                            : callback(null, null)
                    })
                    : callback(null, null)
            },
            "movies": function(callback) {
                async.parallel({
                        "type": function (callback) {
                            return (config.index.type.keys)
                                ? CP_get.additional(
                                {"type": config.index.type.keys},
                                'index',
                                options,
                                function (err, movies) {
                                    if (err) return callback(err);

                                    return (movies && movies.length)
                                        ? callback(null, movies)
                                        : callback(null, [])
                                })
                                : callback(null, [])
                        },
                        "country": function (callback) {
                            return (config.index.country.keys)
                                ? CP_get.additional(
                                {"country": config.index.country.keys},
                                'index',
                                options,
                                function (err, movies) {
                                    if (err) return callback(err);

                                    return (movies && movies.length)
                                        ? callback(null, movies)
                                        : callback(null, [])
                                })
                                : callback(null, [])
                        },
                        "genre": function (callback) {
                            return (config.index.genre.keys)
                                ? CP_get.additional(
                                {"genre": config.index.genre.keys},
                                'index',
                                options,
                                function (err, movies) {
                                    if (err) return callback(err);

                                    return (movies && movies.length)
                                        ? callback(null, movies)
                                        : callback(null, [])
                                })
                                : callback(null, [])
                        },
                        "director": function (callback) {
                            return (config.index.director.keys)
                                ? CP_get.additional(
                                {"director": config.index.director.keys},
                                'index',
                                options,
                                function (err, movies) {
                                    if (err) return callback(err);

                                    return (movies && movies.length)
                                        ? callback(null, movies)
                                        : callback(null, [])
                                })
                                : callback(null, [])
                        },
                        "actor": function (callback) {
                            return (config.index.actor.keys)
                                ? CP_get.additional(
                                {"actor": config.index.actor.keys},
                                'index',
                                options,
                                function (err, movies) {
                                    if (err) return callback(err);

                                    return (movies && movies.length)
                                        ? callback(null, movies)
                                        : callback(null, [])
                                })
                                : callback(null, [])
                        },
                        "year": function (callback) {
                            return (config.index.year.keys)
                                ? CP_get.additional(
                                {"year": config.index.year.keys},
                                'index',
                                options,
                                function (err, movies) {
                                    if (err) return callback(err);

                                    return (movies && movies.length)
                                        ? callback(null, movies)
                                        : callback(null, [])
                                })
                                : callback(null, [])
                        },
                        "ids": function (callback) {
                            return (config.index.ids.keys)
                                ? CP_get.additional(
                                {"query_id": config.index.ids.keys},
                                'index_ids',
                                options,
                                function (err, movies) {
                                    if (err) return callback(err);

                                    return (movies && movies.length)
                                        ? callback(null, movies)
                                        : callback(null, [])
                                })
                                : callback(null, [])
                        },
                        "collections": function (callback) {
                            return (config.index.collections.keys && modules.collections.status)
                                ? CP_get.additional(
                                {"query_id": config.index.collections.keys},
                                'index_collections',
                                options,
                                function (err, movies) {
                                    if (err) return callback(err);

                                    return (movies && movies.length)
                                        ? callback(null, movies)
                                        : callback(null, [])
                                })
                                : callback(null, [])
                        },
                        "episode": function (callback) {
                            return (modules.episode.status)
                                ? CP_episode.index(
                                options,
                                function (err, movies) {
                                    if (err) return callback(err);

                                    config.index.episode = {};
                                    config.index.episode.order = modules.episode.data.index.order;

                                    return (movies && movies.length)
                                        ? callback(null, movies)
                                        : callback(null, [])
                                })
                                : callback(null, [])
                        }
                    },
                    function(err, result) {

                        if (err) return callback(err);

                        var keysSorted = Object.keys(result).sort(
                            function(a, b){
                                return config.index[a].order-config.index[b].order;
                            }
                        );

                        var r = {};
                        keysSorted.forEach(function (key) {
                            if (result[key].length) {
                                r[key] = result[key];
                            }
                        });

                        callback(null, r);

                    });
            }
        },
        function(err, result) {

            if (err) return callback(err);

            for (var r in result) {
                if (result.hasOwnProperty(r) && result[r] === null) {
                    delete result[r];
                }
            }

            CP_page.index(result, options, function (err, result) {
                callback(err, result);
            });

        });

}

module.exports = {
    "data": dataIndex
};