'use strict';

/**
 * Module dependencies.
 */

var CP_get  = require('./CP_get.min');
var CP_save = require('./CP_save.min');

/**
 * Configuration dependencies.
 */

var config  = require('../config/production/config');
var modules = require('../config/production/modules');

/**
 * Node dependencies.
 */

var request = require('request');
var async   = require('async');
var path    = require('path');
var fs      = require('fs');
var Imap    = require('imap');
var base64  = require('base64-stream');

/**
 * Route dependencies.
 */

var movie = require('../routes/paths/movie');

var hour = new Date().getHours()+1;

/**
 * Addet new movie ids.
 */

if (hour && modules.content.status) {

    var keys = {
        "kodik_movies": [
            "http://bd.kodik.biz/films.json"
        ],
        "kodik_serials": [
            "http://bd.kodik.biz/serials.json"
        ],
        "hdgo_movies": [
            "http://hdgo.cc/api/movies.json?token=[token]"
        ],
        "hdgo_serials": [
            "http://hdgo.cc/api/movies.json?token=[token]"
        ],
        "moonwalk_movies": [
            "http://moonwalk.cc/api/movies_updates.json?api_token=[token]",
            "http://moonwalk.cc/api/movies_updates.json?api_token=[token]&category=Russian",
            "http://moonwalk.cc/api/movies_updates.json?api_token=[token]&category=CamRip",
            "http://moonwalk.cc/api/movies_updates.json?api_token=[token]&category=Anime"
        ],
        "moonwalk_serials": [
            "http://moonwalk.cc/api/serials_updates.json?api_token=[token]",
            "http://moonwalk.cc/api/serials_updates.json?api_token=[token]&category=Russian",
            "http://moonwalk.cc/api/serials_updates.json?api_token=[token]&category=Anime"
        ],
        "iframe_movies": [
            "https://iframe.video/api/movies_updates.json?api_token=[token]"
        ],
        "iframe_serials": [
            "https://iframe.video/api/serials_updates.json?api_token=[token]"
        ]
    };

    var all_movies = [];
    var all_serials = [];

    async.eachOfLimit(keys, 1, function (arr, key, callback) {
        if (!modules.content.data.auto[key] ||
            !modules.content.data.auto[key].url ||
            !modules.content.data.auto[key].count) {
            return callback();
        }
        var ids = [];
        var mvs = [];
        if (key === 'moonwalk_movies' && modules.player.data.moonwalk.token) {
            async.eachOf(arr, function (url, id, callback) {
                url = url.replace('[token]', modules.player.data.moonwalk.token.trim());
                request({url: url, method: 'GET'}, function (error, response, movies) {
                    if (error) return console.log('moonwalk_movies', error.code);
                    movies = tryParseJSON(movies);
                    if (response.statusCode === 200 && movies && movies.updates && movies.updates.length) {
                        movies.updates.forEach(function (movie) {
                            if (movie && movie.kinopoisk_id && parseInt(movie.kinopoisk_id)) {
                                movie.kinopoisk_id = parseInt(movie.kinopoisk_id);
                                if (!(ids.indexOf(movie.kinopoisk_id)+1)) {
                                    ids.push(movie.kinopoisk_id);
                                    mvs.push({
                                        "kinopoisk_id": movie.kinopoisk_id,
                                        "added_at": movie.added_at
                                    });
                                }
                            }
                        });
                    }
                    callback();
                });
            }, function (err) {
                if (err) console.log(err);
                mvs.sort(function (a, b) {
                    return new Date(b.added_at) - new Date(a.added_at);
                });
                mvs = mvs.slice(0, parseInt(modules.content.data.auto[key].count));
                all_movies = all_movies.concat(mvs);
                var array_ids = [];
                mvs.forEach(function (m) {
                    array_ids.push(m.kinopoisk_id)
                });
                saveContent(key, array_ids, function () {
                    callback();
                });
            });
        }
        else if (key === 'moonwalk_serials' && modules.player.data.moonwalk.token) {
            async.eachOf(arr, function (url, id, callback) {
                url = url.replace('[token]', modules.player.data.moonwalk.token.trim());
                request({url: url, method: 'GET'}, function (error, response, movies) {
                    if (error) return console.log('moonwalk_serials', error.code);
                    movies = tryParseJSON(movies);
                    if (response.statusCode === 200 && movies && movies.updates && movies.updates.length) {
                        movies.updates.forEach(function (movie) {
                            if (movie && movie.serial && movie.serial.kinopoisk_id && parseInt(movie.serial.kinopoisk_id)) {
                                movie.serial.kinopoisk_id = parseInt(movie.serial.kinopoisk_id);
                                if (!(ids.indexOf(movie.serial.kinopoisk_id)+1)) {
                                    ids.push(movie.serial.kinopoisk_id);
                                    mvs.push({
                                        "kinopoisk_id": movie.serial.kinopoisk_id,
                                        "added_at": movie.added_at
                                    });
                                }
                            }
                        });
                    }
                    callback();
                });
            }, function (err) {
                if (err) console.log(err);
                mvs.sort(function (a, b) {
                    return new Date(b.added_at) - new Date(a.added_at);
                });
                mvs = mvs.slice(0, parseInt(modules.content.data.auto[key].count));
                all_serials = all_serials.concat(mvs);
                var array_ids = [];
                mvs.forEach(function (m) {
                    array_ids.push(m.kinopoisk_id)
                });
                saveContent(key, array_ids, function () {
                    callback();
                });
            });
        }
        else if (key === 'iframe_movies' && modules.player.data.iframe.token) {
            async.eachOf(arr, function (url, id, callback) {
                url = url.replace('[token]', modules.player.data.iframe.token.trim());
                request({url: url, method: 'GET'}, function (error, response, movies) {
                    if (error) return console.log('iframe_movies', error.code);
                    movies = tryParseJSON(movies);
                    if (response.statusCode === 200 && movies && movies.updates && movies.updates.length) {
                        movies.updates.forEach(function (movie) {
                            if (movie && movie.kinopoisk_id && parseInt(movie.kinopoisk_id)) {
                                movie.kinopoisk_id = parseInt(movie.kinopoisk_id);
                                if (!(ids.indexOf(movie.kinopoisk_id)+1)) {
                                    ids.push(movie.kinopoisk_id);
                                    mvs.push({
                                        "kinopoisk_id": movie.kinopoisk_id,
                                        "added_at": movie.added_at
                                    });
                                }
                            }
                        });
                    }
                    callback();
                });
            }, function (err) {
                if (err) console.log(err);
                mvs.sort(function (a, b) {
                    return new Date(b.added_at) - new Date(a.added_at);
                });
                mvs = mvs.slice(0, parseInt(modules.content.data.auto[key].count));
                all_movies = all_movies.concat(mvs);
                var array_ids = [];
                mvs.forEach(function (m) {
                    array_ids.push(m.kinopoisk_id)
                });
                saveContent(key, array_ids, function () {
                    callback();
                });
            });
        }
        else if (key === 'iframe_serials' && modules.player.data.iframe.token) {
            async.eachOf(arr, function (url, id, callback) {
                url = url.replace('[token]', modules.player.data.iframe.token.trim());
                request({url: url, method: 'GET'}, function (error, response, movies) {
                    if (error) return console.log('iframe_serials', error.code);
                    movies = tryParseJSON(movies);
                    if (response.statusCode === 200 && movies && movies.updates && movies.updates.length) {
                        movies.updates.forEach(function (movie) {
                            if (movie && movie.serial && movie.serial.kinopoisk_id && parseInt(movie.serial.kinopoisk_id)) {
                                movie.serial.kinopoisk_id = parseInt(movie.serial.kinopoisk_id);
                                if (!(ids.indexOf(movie.serial.kinopoisk_id)+1)) {
                                    ids.push(movie.serial.kinopoisk_id);
                                    mvs.push({
                                        "kinopoisk_id": movie.serial.kinopoisk_id,
                                        "added_at": movie.added_at
                                    });
                                }
                            }
                        });
                    }
                    callback();
                });
            }, function (err) {
                if (err) console.log(err);
                mvs.sort(function (a, b) {
                    return new Date(b.added_at) - new Date(a.added_at);
                });
                mvs = mvs.slice(0, parseInt(modules.content.data.auto[key].count));
                all_serials = all_serials.concat(mvs);
                var array_ids = [];
                mvs.forEach(function (m) {
                    array_ids.push(m.kinopoisk_id)
                });
                saveContent(key, array_ids, function () {
                    callback();
                });
            });
        }
        else if (key === 'hdgo_movies' && modules.player.data.hdgo.token) {
            async.eachOf(arr, function (url, id, callback) {
                url = url.replace('[token]', modules.player.data.hdgo.token.trim());
                request({url: url, method: 'GET'}, function (error, response, movies) {
                    if (error) return console.log('hdgo_movies', error.code);
                    movies = tryParseJSON(movies);
                    if (response.statusCode === 200 && movies && movies.length) {
                        movies.forEach(function (movie) {
                            if (movie && movie.type === 'movie' && movie.kinopoisk_id && parseInt(movie.kinopoisk_id)) {
                                movie.kinopoisk_id = parseInt(movie.kinopoisk_id);
                                if (!(ids.indexOf(movie.kinopoisk_id)+1)) {
                                    ids.push(movie.kinopoisk_id);
                                    mvs.push({
                                        "kinopoisk_id": movie.kinopoisk_id,
                                        "added_at": movie.added_at
                                    });
                                }
                            }
                        });
                    }
                    callback();
                });
            }, function (err) {
                if (err) console.log(err);
                mvs.sort(function (a, b) {
                    return new Date(b.added_at) - new Date(a.added_at);
                });
                mvs = mvs.slice(0, parseInt(modules.content.data.auto[key].count));
                all_movies = all_movies.concat(mvs);
                var array_ids = [];
                mvs.forEach(function (m) {
                    array_ids.push(m.kinopoisk_id)
                });
                saveContent(key, array_ids, function () {
                    callback();
                });
            });
        }
        else if (key === 'hdgo_serials' && modules.player.data.hdgo.token) {
            async.eachOf(arr, function (url, id, callback) {
                url = url.replace('[token]', modules.player.data.hdgo.token.trim());
                request({url: url, method: 'GET'}, function (error, response, movies) {
                    if (error) return console.log('hdgo_serials', error.code);
                    movies = tryParseJSON(movies);
                    if (response.statusCode === 200 && movies && movies.length) {
                        movies.forEach(function (movie) {
                            if (movie && movie.type === 'serial' && movie.kinopoisk_id && parseInt(movie.kinopoisk_id)) {
                                movie.kinopoisk_id = parseInt(movie.kinopoisk_id);
                                if (!(ids.indexOf(movie.kinopoisk_id)+1)) {
                                    ids.push(movie.kinopoisk_id);
                                    mvs.push({
                                        "kinopoisk_id": movie.kinopoisk_id,
                                        "added_at": movie.added_at
                                    });
                                }
                            }
                        });
                    }
                    callback();
                });
            }, function (err) {
                if (err) console.log(err);
                mvs.sort(function (a, b) {
                    return new Date(b.added_at) - new Date(a.added_at);
                });
                mvs = mvs.slice(0, parseInt(modules.content.data.auto[key].count));
                all_serials = all_serials.concat(mvs);
                var array_ids = [];
                mvs.forEach(function (m) {
                    array_ids.push(m.kinopoisk_id)
                });
                saveContent(key, array_ids, function () {
                    callback();
                });
            });
        }
        else if (key === 'kodik_movies') {
            async.eachOf(arr, function (url, id, callback) {
                request({url: url, method: 'GET'}, function (error, response, movies) {
                    if (error) return console.log('kodik_movies', error.code);
                    movies = tryParseJSON(movies);
                    if (response.statusCode === 200 && movies && movies.length) {
                        movies.forEach(function (movie) {
                            if (movie && movie.kp_link && parseInt(movie.kp_link)) {
                                movie.kp_link = parseInt(movie.kp_link);
                                if (!(ids.indexOf(movie.kp_link)+1)) {
                                    ids.push(movie.kp_link);
                                    mvs.push({
                                        "kinopoisk_id": movie.kp_link,
                                        "added_at": movie.updated_at
                                    });
                                }
                            }
                        });
                    }
                    callback();
                });
            }, function (err) {
                if (err) console.log(err);
                mvs.sort(function (a, b) {
                    return new Date(b.added_at) - new Date(a.added_at);
                });
                mvs = mvs.slice(0, parseInt(modules.content.data.auto[key].count));
                all_movies = all_movies.concat(mvs);
                var array_ids = [];
                mvs.forEach(function (m) {
                    array_ids.push(m.kinopoisk_id)
                });
                saveContent(key, array_ids, function () {
                    callback();
                });
            });
        }
        else if (key === 'kodik_serials') {
            async.eachOf(arr, function (url, id, callback) {
                request({url: url, method: 'GET'}, function (error, response, movies) {
                    if (error) return console.log('kodik_serials', error.code);
                    movies = tryParseJSON(movies);
                    if (response.statusCode === 200 && movies && movies.length) {
                        movies.forEach(function (movie) {
                            if (movie && movie.kp_link && parseInt(movie.kp_link)) {
                                movie.kp_link = parseInt(movie.kp_link);
                                if (!(ids.indexOf(movie.kp_link)+1)) {
                                    ids.push(movie.kp_link);
                                    mvs.push({
                                        "kinopoisk_id": movie.kp_link,
                                        "added_at": movie.updated_at
                                    });
                                }
                            }
                        });
                    }
                    callback();
                });
            }, function (err) {
                if (err) console.log(err);
                mvs.sort(function (a, b) {
                    return new Date(b.added_at) - new Date(a.added_at);
                });
                mvs = mvs.slice(0, parseInt(modules.content.data.auto[key].count));
                all_serials = all_serials.concat(mvs);
                var array_ids = [];
                mvs.forEach(function (m) {
                    array_ids.push(m.kinopoisk_id)
                });
                saveContent(key, array_ids, function () {
                    callback();
                });
            });
        }
        else {
            callback();
        }
    }, function (err) {
        if (err) console.log(err);
        var array_ids = [];

        var m = [
            modules.content.data.auto.moonwalk_movies.url,
            modules.content.data.auto.hdgo_movies.url,
            modules.content.data.auto.kodik_movies.url,
            modules.content.data.auto.iframe_movies.url
        ];
        var s = [
            modules.content.data.auto.moonwalk_serials.url,
            modules.content.data.auto.hdgo_serials.url,
            modules.content.data.auto.kodik_serials.url,
            modules.content.data.auto.iframe_serials.url
        ];
        var a = s.concat(m);

        var mov = m.filter(urlUnique);
        var ser = s.filter(urlUnique);
        var all = a.filter(urlUnique);

        if (all.length === 1) {
            all_movies = arrayUnique(all_movies.concat(all_serials));
            all_movies.sort(function (a, b) {
                return new Date(b.added_at) - new Date(a.added_at);
            });
            all_movies = all_movies.slice(0, parseInt(modules.content.data.auto.moonwalk_movies.count));
            array_ids = [];
            all_movies.forEach(function (m) {
                array_ids.push(m.kinopoisk_id)
            });
            saveContent('moonwalk_movies', array_ids, function () {
                console.log(new Date(), 'ALL');
            });
        }
        else {
            if (mov.length === 1) {
                all_movies = arrayUnique(all_movies);
                all_movies.sort(function (a, b) {
                    return new Date(b.added_at) - new Date(a.added_at);
                });
                all_movies = all_movies.slice(0, parseInt(modules.content.data.auto.moonwalk_movies.count));
                array_ids = [];
                all_movies.forEach(function (m) {
                    array_ids.push(m.kinopoisk_id)
                });
                saveContent('moonwalk_movies', array_ids, function () {
                    console.log(new Date(), 'MOVIES');
                });
            }
            if (ser.length === 1) {
                all_serials = arrayUnique(all_serials);
                all_serials.sort(function (a, b) {
                    return new Date(b.added_at) - new Date(a.added_at);
                });
                all_serials = all_serials.slice(0, parseInt(modules.content.data.auto.moonwalk_serials.count));
                array_ids = [];
                all_serials.forEach(function (m) {
                    array_ids.push(m.kinopoisk_id)
                });
                saveContent('moonwalk_serials', array_ids, function () {
                    console.log(new Date(), 'SERIALS');
                });
            }
        }
    });

}

/**
 * Save content.
 *
 * @param {String} key
 * @param {Object} array_ids
 * @param {Callback} callback
 */

function saveContent(key, array_ids, callback) {

    if (!array_ids.length) {
        console.log('[saveContent]', key, modules.content.data.auto[key].url, array_ids.length);
        return callback(null);
    }

    CP_get.contents(
        {"content_url": modules.content.data.auto[key].url}, 1, 1, false,
        function (err, contents) {
            if (err) {
                console.log('[CP_get.contents]', key, modules.content.data.auto[key].url, err);
                return callback(null);
            }

            if (contents && contents.length && contents[0].id) {
                CP_get.movies(
                    {"query_id": array_ids.join('|')},
                    array_ids.length,
                    '',
                    1,
                    false,
                    function (err, movies) {
                        if (err) {
                            console.log('[CP_get.movies]', key, modules.content.data.auto[key].url, err);
                            return callback(null);
                        }

                        if (movies && movies.length) {
                            var ids = [];
                            movies.forEach(function (movie) {
                                movie.kp_id = parseInt(movie.kp_id);
                                if (!(ids.indexOf(movie.kp_id)+1)) {
                                    ids.push(movie.kp_id);
                                }
                            });
                            contents[0].content_movies.split(',').forEach(function (kp_id) {
                                kp_id = parseInt(kp_id);
                                if (!(ids.indexOf(kp_id)+1)) {
                                    ids.push(kp_id);
                                }
                            });
                            ids = ids.slice(0, parseInt(modules.content.data.auto[key].count));

                            contents[0].content_movies = ids.join(',');
                            CP_save.save(
                                contents[0],
                                'content',
                                function (err, result) {
                                    console.log('[CP_save.save]', key, modules.content.data.auto[key].url, err, ids.length, result);
                                    callback(null);
                                });
                        }
                        else {
                            console.log('[movies]', key, modules.content.data.auto[key].url, err, movies);
                            return callback(null);
                        }
                    });
            }
            else {
                console.log('[contents]', key, modules.content.data.auto[key].url, err, contents);
                callback(null);
            }
        })

}



/**
 * Valid JSON.
 *
 * @param {String} jsonString
 */

function tryParseJSON(jsonString) {
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === 'object') {
            return o;
        }
    }
    catch (e) { }
    return {};
}

/**
 * Array unique.
 *
 * @param {Object} array
 */

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i].kinopoisk_id === a[j].kinopoisk_id)
                a.splice(j--, 1);
        }
    }
    return a;
}

/**
 * Unique array URLs.
 *
 * @param {String} value
 * @param {Number} index
 * @param {Object} self
 */

function urlUnique(value, index, self) {
    return self.indexOf(value) === index;
}

/**
 * Download new translators.
 */

if (modules.player.data.moonwalk.token && hour === 3) {

    request({url: 'http://translators.cinemapress.org/' + config.domain, method: 'POST'}, function (error, response, translators) {
        if (error) return console.log('translators', error.code);
        if (response.statusCode === 200 && translators) {
            fs.writeFile(
                path.join(path.dirname(__dirname), 'files', 'translators.json'),
                translators,
                function (err) {
                    if (err) console.log(err);
                });
        }
    });

}

/**
 * Publish new movies.
 */

if (config.publish.every.hours && config.publish.every.movies) {

    CP_get.publishIds(function (err, ids) {

        if (!ids) {
            console.log('[publish] Not Movies.');
            config.publish.every.hours = 0;
            config.publish.every.movies = 0;
        }
        else if (ids.start_id === config.publish.start && ids.stop_id === config.publish.stop) {
            console.log('[publish] All movies published.');
            config.publish.every.hours = 0;
            config.publish.every.movies = 0;
        }
        else {
            console.log('[publish] New IDs: ' + ids.start_id + ' - ' + ids.stop_id);
            config.publish.start = ids.start_id;
            config.publish.stop = ids.stop_id;
        }

        CP_save.save(config, 'config', function (err) {
            if (err) return console.log(err);
            var rand = Math.floor(Math.random() * 91) + 10;
            setTimeout(function () {
                CP_save.restart(true, function (err) {
                    if (err) return console.log(err);
                });
            }, rand * 100);
        });

    });

}

/**
 * Delete abuse movies.
 */

if (modules.abuse.data.imap.user &&
    modules.abuse.data.imap.password &&
    modules.abuse.data.imap.host &&
    hour === 1) {

    var options = JSON.stringify(modules.abuse.data.imap);
    options = JSON.parse(options);

    options.tls = (options.tls !== 0);

    var imap = new Imap(options);

    imap.once('ready', function () {

        function saveData() {
            CP_save.save(modules, 'modules', function (err) {
                if (err) return console.log(err);
                var rand = Math.floor(Math.random() * 91) + 10;
                setTimeout(function () {
                    CP_save.restart(true, function (err) {
                        if (err) return console.log(err);
                    });
                }, rand * 10);
            });
        }

        imap.openBox('INBOX', true, function (err) {

            if (err) {
                console.log(new Date(), err);
                imap.end();
                process.exit(0);
                return null;
            }

            var date = new Date();
            date = date.setDate(date.getDate() - 1);

            imap.search(['ALL', ['SINCE', date]], function (err, results) {

                if (err || !results || !results.length) {
                    console.log(new Date(), err);
                    imap.end();
                    process.exit(0);
                    return null;
                }

                var save = false;

                var f = imap.fetch(results, {
                    bodies: ['TEXT', 'HEADER.FIELDS (TO FROM SUBJECT)'],
                    struct: true
                });

                f.on('message', function (msg) {

                    msg.on('body', function (stream) {
                        stream.on('data', function (chunk) {
                            var urls;
                            var expr = new RegExp(config.domain + '/[a-zа-яё0-9./_\\\'-]*', 'ig');
                            while ((urls = expr.exec(chunk.toString('utf8'))) !== null) {
                                var id = movie.id(urls[0]);
                                if (id >= 1 && id <= 3000000 && !(modules.abuse.data.movies.indexOf(''+id) + 1)) {
                                    console.log('TEXT', id);
                                    modules.abuse.data.movies.push(''+id);
                                    save = true;
                                }
                            }
                        });
                    });

                    /*msg.once('attributes', function (attrs) {

                        function toUpper(thing) {

                            return thing && thing.toUpperCase ? thing.toUpperCase() : thing;

                        }

                        function findAttachmentParts(struct, attachments) {

                            attachments = attachments || [];

                            for (var i = 0, len = struct.length; i < len; ++i) {
                                if (Array.isArray(struct[i])) {
                                    findAttachmentParts(struct[i], attachments);
                                } else {
                                    if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) + 1) {
                                        attachments.push(struct[i]);
                                    }
                                }
                            }

                            return attachments;

                        }

                        function buildAttMessageFunction(attachment) {

                            var encoding = attachment.encoding;

                            return function (msg) {
                                msg.on('body', function (stream) {
                                    if (encoding === 'BASE64') {
                                        stream = stream.pipe(base64.decode());
                                    }
                                    var chunks = [];
                                    stream.on('data', function (chunk) {
                                        chunks.push(chunk);
                                    });
                                    stream.on('end', function () {
                                        var urls;
                                        var string = chunks.join('')
                                            .replace(/\\u33\\\'3f/gi, '!')
                                            .replace(/\\u34\\\'3f/gi, '"')
                                            .replace(/\\u35\\\'3f/gi, '#')
                                            .replace(/\\u36\\\'3f/gi, '$')
                                            .replace(/\\u37\\\'3f/gi, '%')
                                            .replace(/\\u38\\\'3f/gi, '&')
                                            .replace(/\\u39\\\'3f/gi, "'")
                                            .replace(/\\u40\\\'3f/gi, '(')
                                            .replace(/\\u41\\\'3f/gi, ')')
                                            .replace(/\\u42\\\'3f/gi, '*')
                                            .replace(/\\u43\\\'3f/gi, '+')
                                            .replace(/\\u44\\\'3f/gi, ',')
                                            .replace(/\\u45\\\'3f/gi, '-')
                                            .replace(/\\u46\\\'3f/gi, '.')
                                            .replace(/\\u47\\\'3f/gi, '/')
                                            .replace(/\\u58\\\'3f/gi, ':')
                                            .replace(/\\u64\\\'3f/gi, '@')
                                            .replace(/\\u91\\\'3f/gi, '[')
                                            .replace(/\\u92\\\'3f/gi, '\\')
                                            .replace(/\\u93\\\'3f/gi, ']')
                                            .replace(/\\u94\\\'3f/gi, '^')
                                            .replace(/\\u95\\\'3f/gi, '_')
                                            .replace(/\\u123\\\'3f/gi, '{')
                                            .replace(/\\u124\\\'3f/gi, '|')
                                            .replace(/\\u125\\\'3f/gi, '}')
                                            .replace(/\\u126\\\'3f/gi, '~');
                                        var expr = new RegExp(config.domain + '/[a-zа-яё0-9./_\\\'-]*', 'ig');
                                        while ((urls = expr.exec(string)) !== null) {
                                            var id = movie.id(urls[0]);
                                            if (id >= 1 && id <= 3000000 && !(modules.abuse.data.movies.indexOf(''+id) + 1)) {
                                                modules.abuse.data.movies.push(''+id);
                                                saveData();
                                            }
                                        }
                                    });
                                });
                            };
                        }

                        var attachments = findAttachmentParts(attrs.struct);

                        for (var i = 0, len = attachments.length; i < len; i++) {

                            var attachment = attachments[i];

                            if (
                                attachment &&
                                attachment.disposition &&
                                attachment.disposition.params &&
                                attachment.disposition.params.filename &&
                                attachment.disposition.params.filename.indexOf('.rtf') + 1 &&
                                attachment.disposition.params.filename.indexOf('.sig') === -1
                            ) {
                                var f = imap.fetch(attrs.uid, {
                                    bodies: [attachment.partID],
                                    struct: true
                                });

                                f.on('message', buildAttMessageFunction(attachment));
                            }

                        }

                    });*/

                });

                f.once('error', function (err) {
                    console.log(err);
                });

                f.once('end', function () {
                    imap.end();
                    if (save) {
                        saveData();
                    }
                });

            });

        });

    });

    imap.once('error', function (err) {
        console.log(err);
    });

    imap.connect();

}