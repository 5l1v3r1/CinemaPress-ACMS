'use strict';

/**
 * Module dependencies.
 */

var CP_page = require('../../lib/CP_page');
var CP_get  = require('../../lib/CP_get.min');

var CP_episode  = require('../../modules/CP_episode');
var CP_comments = require('../../modules/CP_comments');

/**
 * Configuration dependencies.
 */

var config  = require('../../config/production/config');
var modules = require('../../config/production/modules');

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

    if (arguments.length === 1) {
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
                            ? callback(null, movies)
                            : callback(null, [])
                    })
                    : callback(null, [])
            },
            "soon": function (callback) {
                return (modules.soon.status)
                    ? CP_get.additional(
                    {"all_movies": process.env.CP_ALL},
                    'soon',
                    options,
                    function (err, movies) {
                        if (err) return callback(err);

                        return (movies && movies.length)
                            ? callback(null, movies)
                            : callback(null, [])
                    })
                    : callback(null, [])
            },
            "news": function (callback) {
                return (modules.content.status && modules.content.data.news.tags && modules.content.data.news.count)
                    ? CP_get.contents(
                    {"content_tags": modules.content.data.news.tags},
                    modules.content.data.news.count,
                    1,
                    true,
                    options,
                    function (err, contents) {
                        if (err) return callback(err);

                        return (contents && contents.length)
                            ? callback(null, contents)
                            : callback(null, [])
                    })
                    : callback(null, [])
            },
            "recent": function (callback) {
                var service = [];
                if (modules.comments.data.disqus.shortname &&
                    modules.comments.data.disqus.recent.num_items &&
                    modules.comments.data.disqus.recent.display.indexOf('index')+1) {
                    service.push('disqus');
                }
                if (modules.comments.data.hypercomments.widget_id &&
                    modules.comments.data.hypercomments.recent.num_items &&
                    modules.comments.data.hypercomments.recent.display.indexOf('index')+1) {
                    service.push('hypercomments');
                }
                return (service.length)
                    ? CP_comments.recent(
                    service,
                    function (err, comments) {
                        if (err) return callback(err);

                        return (comments)
                            ? callback(null, comments)
                            : callback(null, [])
                    })
                    : callback(null, [])
            },
            "index": function(callback) {
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

                                    if (movies && movies.length) {
                                        movies = sortingIds(config.index.ids.keys.split(','), movies);
                                    }

                                    return (movies && movies.length)
                                        ? callback(null, movies)
                                        : callback(null, [])
                                })
                                : callback(null, [])
                        },
                        "content": function (callback) {
                            return (modules.content.status && modules.content.data.index.url)
                                ? CP_get.contents(
                                {"content_url": modules.content.data.index.url},
                                function (err, contents) {
                                    if (err) return callback(err);

                                    return (contents && contents.length && contents[0].movies)
                                        ? CP_get.movies(
                                        {"query_id": contents[0].movies.join('|')},
                                        contents[0].movies.length,
                                        function (err, movies) {
                                            if (err) return callback(err);

                                            config.index.content = {};
                                            config.index.content.order = modules.content.data.index.order;

                                            var r = [];
                                            r[0] = {};
                                            if (movies && movies.length) {
                                                r[0].movies = sortingIds(contents[0].movies, movies, modules.content.data.index.count);
                                            }
                                            r[0].name = contents[0].title;

                                            return (movies && movies.length)
                                                ? callback(null, r)
                                                : callback(null, [])
                                        })
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
                                return ((config.index[a]) ? config.index[a].order : 1) - ((config.index[b]) ? config.index[b].order : 1);
                            }
                        );

                        var r = {};
                        keysSorted.forEach(function (key) {
                            if (result[key].length && result[key][0].movies.length) {
                                r[key] = result[key];
                            }
                        });

                        callback(null, r);

                    });
            },
            "count": function (callback) {
                var qwry = {};
                qwry[config.index.count.type] = config.index.count.key;
                if (!config.default.lastpage && config.index.count.key) {
                    return callback(null, config.default.pages+1);
                }
                return (config.index.count.key)
                    ? CP_get.count(
                    qwry,
                    config.index.count.sorting,
                    function (err, num) {
                        if (err) return callback(err);

                        num = Math.ceil(parseInt(num)/config.default.count);

                        return (num)
                            ? callback(null, num)
                            : callback(null, 0)
                    })
                    : callback(null, 0);
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

    /**
     * Sort films are turned by id list.
     *
     * @param {Object} ids
     * @param {Object} movies
     * @param {Number} [count]
     * @return {Array}
     */

    function sortingIds(ids, movies, count) {

        if (arguments.length === 2) {
            count = 0;
        }

        var result = [];

        for (var id = 0; id < ids.length; id++) {
            for (var i = 0; i < movies.length; i++) {
                if (parseInt(movies[i].kp_id) === parseInt(('' + ids[id]).trim())) {
                    result.push(movies[i]);
                    if (result.length === count) return result;
                }
            }
        }

        return result;

    }

}

module.exports = {
    "data": dataIndex
};