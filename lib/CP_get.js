'use strict';

/**
 * Module dependencies.
 */

var CP_publish   = require('./CP_publish');
var CP_structure = require('./CP_structure');
var CP_cache     = require('./CP_cache');
var CP_sphinx    = require('./CP_sphinx');
var CP_text      = require('./CP_text');

/**
 * Configuration dependencies.
 */

var config  = require('../config/config');
var modules = require('../config/modules');
var texts   = require('../config/texts');

/**
 * Node dependencies.
 */

var async = require('async');
var md5   = require('md5');

/**
 * Sphinx fulltext search.
 */

var sphinx = {
    "movies" : 'movies_' + config.domain.replace(/[^A-Za-z0-9]/g,'_')
};

/**
 * Callback.
 *
 * @callback Callback
 * @param {Object} err
 * @param {Object} [render]
 */

/**
 * Getting all movies for a particular query.
 *
 * @param {Object} query
 * @param {Number} [count]
 * @param {String} [sorting]
 * @param {Number} [page]
 * @param {Boolean} [structure]
 * @param {Object} [options]
 * @param {Callback} callback
 */

function moviesGet(query, count, sorting, page, structure, options, callback) {

    if (arguments.length == 6) {
        callback = options;
        options = {};
        options.domain = '' + config.domain;
    }
    if (arguments.length == 5) {
        callback = structure;
        structure = true;
        options = {};
        options.domain = '' + config.domain;
    }
    else if (arguments.length == 4) {
        callback = page;
        page = 1;
        structure = true;
        options = {};
        options.domain = '' + config.domain;
    }
    else if (arguments.length == 3) {
        callback = sorting;
        sorting  = 'kinopoisk-vote-up';
        page = 1;
        structure = true;
        options = {};
        options.domain = '' + config.domain;
    }
    else if (arguments.length == 2) {
        callback = count;
        count = config.default.count;
        sorting  = 'kinopoisk-vote-up';
        page = 1;
        structure = true;
        options = {};
        options.domain = '' + config.domain;
    }

    var start = parseInt(page) * parseInt(count) - parseInt(count);
    var max   = start + parseInt(count);

    var publish = {};
    publish.select = '';
    publish.where = '';

    if (query.certainly) {
        delete query.certainly;
    }
    else {
        if (query.query_id) {
            publish = CP_publish.queryCondition(query.query_id);
        }
        else {
            publish = CP_publish.queryCondition();
        }
    }

    var queryString = '' +
        ' SELECT * ' + publish.select +
        ' FROM ' + sphinx.movies +
        ' WHERE ' +
        createWhere() + publish.where +
        createOrderBy() +
        ' LIMIT ' + start + ', ' + count +
        ' OPTION max_matches = ' + max;

    CP_sphinx.query(queryString, function (err, movies) {

        if (err) return callback(err);

        if (movies && movies.length) {
            if (structure) {
                movies = CP_structure.movie(movies, options);
            }
        }
        else {
            movies = [];
        }

        callback(null, movies);

    });

    /**
     * Create WHERE for query.
     *
     * @return {String}
     */

    function createWhere() {

        var thematic = CP_publish.thematic();

        var where = thematic.where_config;
        var match = thematic.match_config;

        match.push('@all_movies _all_');

        if (sorting.indexOf('kinopoisk-rating') + 1) {
            where.push('`kp_vote` > ' + config.default.votes.kp);
        }
        else if (sorting.indexOf('imdb-rating') + 1) {
            where.push('`imdb_vote` > ' + config.default.votes.imdb);
        }
        else if (sorting.indexOf('year') + 1 || sorting.indexOf('premiere') + 1) {
            where.push('`premiere` <= ' + toDays());
        }
        else if (sorting.indexOf('soon') + 1) {
            where.push('`premiere` > ' + toDays());
        }

        for (var attribute in query) {
            if (query.hasOwnProperty(attribute)) {

                var search = ('' + query[attribute]).toLowerCase();
                search = search.replace(/[^0-9A-Za-zА-Яа-яЁё\s+-|!]/g,'');
                search = search.replace(/\s+/g, ' ');
                search = search.replace(/(^\s*)|(\s*)$/g, '');

                if (attribute == 'type') {
                    if (search == config.urls.types.serial.toLowerCase()) {
                        where.push('`type` = 1');
                        match.push('@genre !аниме !короткометражка');
                    }
                    else if (search == config.urls.types.mult.toLowerCase()) {
                        where.push('`type` != 1');
                        match.push('@genre мультфильм | детский !аниме !короткометражка');
                    }
                    else if (search == config.urls.types.anime.toLowerCase()) {
                        match.push('@genre аниме');
                    }
                    else if (search == config.urls.types.tv.toLowerCase()) {
                        match.push('@genre шоу | новости | реальное | церемония | концерт');
                    }
                    else if (search == config.urls.types.movie.toLowerCase()) {
                        where.push('`type` != 1');
                        match.push('@genre !мультфильм !аниме !короткометражка !шоу !новости !реальное !церемония !концерт !детский !документальный');
                    }
                }
                else {
                    match.push('@' + attribute + ' (' + search + ')');
                }

            }
        }

        where.push('MATCH(\'' + match.join(' ').trim() + '\')');

        return where.join(' AND ');

    }

    /**
     * Create ORDER BY for query.
     *
     * @return {String}
     */

    function createOrderBy() {

        var ob = '';

        switch (sorting) {
            case ('kinopoisk-rating-up'):
                ob = 'kp_rating DESC';
                break;
            case ('kinopoisk-rating-down'):
                ob = 'kp_rating ASC';
                break;
            case ('imdb-rating-up'):
                ob = 'imdb_rating DESC';
                break;
            case ('imdb-rating-down'):
                ob = 'imdb_rating ASC';
                break;
            case ('kinopoisk-vote-up'):
                ob = 'kp_vote DESC';
                break;
            case ('kinopoisk-vote-down'):
                ob = 'kp_vote ASC';
                break;
            case ('imdb-vote-up'):
                ob = 'imdb_vote DESC';
                break;
            case ('imdb-vote-down'):
                ob = 'imdb_vote ASC';
                break;
            case ('year-up'):
                ob = 'year DESC';
                break;
            case ('year-down'):
                ob = 'year ASC';
                break;
            case ('premiere-up'):
                ob = 'premiere DESC';
                break;
            case ('premiere-down'):
                ob = 'premiere ASC';
                break;
            default:
                ob = '';
                break;
        }

        return (ob != '') ? ' ORDER BY ' + ob : '';

    }

    /**
     * The number of days to the current time.
     *
     * @return {Number}
     */

    function toDays() {

        return 719527 + Math.floor(new Date().getTime()/(1000*60*60*24));

    }

}

/**
 * The additional for index/related movies.
 *
 * @param {Object} query
 * @param {String} type
 * @param {Object} [options]
 * @param {Callback} callback
 */

function additionalMoviesGet(query, type, options, callback) {

    if (arguments.length == 3) {
        callback = options;
        options = {};
        options.domain = '' + config.domain;
    }

    var key, values, name, sorting, count, certainly;
    var titles = [];

    for (var q in query) {
        if (query.hasOwnProperty(q)) {
            key = q;
            values = query[q];
        }
    }

    values = (typeof values === 'object')
        ? values
        : ('' + values).split(',');

    switch (type) {
        case 'related':
            name = modules.related.data.types[key].name;
            sorting = modules.related.data.types[key].sorting;
            count = modules.related.data.types[key].count;
            break;
        case 'index':
            name = config.index[key].name;
            sorting = config.index[key].sorting;
            count = config.index[key].count;
            break;
        case 'ids':
            name = 'Фильмы по ID';
            sorting = '';
            values = [formatIds(values)];
            count = values[0].split('|').length;
            break;
        case 'index_ids':
            name = config.index.ids.name;
            sorting = '';
            values = [formatIds(values)];
            count = values[0].split('|').length;
            break;
        case 'index_collections':
            sorting = '';
            titles = values.map(function(name) {
                name = name.replace(/[^0-9A-Za-z_-]/g,'');
                return (modules.collections.data.collections[name] && modules.collections.data.collections[name].title)
                    ? modules.collections.data.collections[name].title
                    : ''
            });
            values = values.map(function(name) {
                name = name.replace(/[^0-9A-Za-z_-]/g,'');
                if (modules.collections.data.collections[name] && modules.collections.data.collections[name].movies.length) {
                    var ids = [];
                    for (var i = 0, len = modules.collections.data.collections[name].movies.length; i < len; i++) {
                        var id = parseInt(modules.collections.data.collections[name].movies[i]);
                        var start = parseInt(config.publish.start);
                        var stop = parseInt(config.publish.stop);
                        if ((id > start && id < stop) || texts.ids.indexOf(id)+1) {
                            ids.push(id);
                        }
                        if (ids.length >= config.index.collections.count) {
                            break;
                        }
                    }
                    return ids.join('|');
                }
                else {
                    return '';
                }
            });
            count = config.index.collections.count;
            break;
        case 'top':
            name = 'Топ фильмы';
            sorting = modules.top.data.sorting;
            count = modules.top.data.count;
            break;
        case 'soon':
            name = 'Скоро выйдет';
            if (modules.soon.data.movies.length) {
                type = 'ids';
                key = 'query_id';
                sorting = '';
                values = [formatIds(modules.soon.data.movies)];
                count = values[0].split('|').length;
            }
            else {
                sorting = 'soon';
                count = modules.soon.data.count;
            }
            break;
        default:
            name = 'Список фильмов';
            sorting = 'kinopoisk-vote-up';
            count = 10;
    }

    var hash = md5(key + values.join(',') + count + sorting + options.domain);

    return (config.cache.time)
        ? CP_cache.get(
        hash,
        function (err, render) {
            if (err) return callback(err);
            return (render)
                ? callback(null, render)
                : getSphinx(
                function (err, render) {
                    return (err)
                        ? callback(err)
                        : callback(null, render)
                });
        })
        : getSphinx(
        function (err, render) {
            return (err)
                ? callback(err)
                : callback(null, render)
        });

    /**
     * If not cache to get Sphinx.
     *
     * @param {Callback} callback
     */

    function getSphinx(callback) {
        
        var m = [];

        async.forEachOfSeries(values, function (value, k, callback) {

            var query = {};
            query[key] = ('' + value).replace(/\s+/g, ' ').replace(/(^\s*)|(\s*)$/g, '');

            if (!query[key]) {
                return callback();
            }

            if (titles.length) {
                name = titles[k];
            }

            if (certainly) {
                query.certainly = certainly;
            }

            moviesGet(query, count, sorting, 1, true, options, function (err, movies) {

                if (err) return callback(err);

                if (movies && movies.length) {
                    m.push({
                        "movies" : (key == 'query_id') ? sortingIds('' + value, movies) : movies,
                        "name"   : CP_text.formatting(name, query)
                    });
                }

                callback();

            });

        }, function (err) {

            if (err) return callback(err);

            callback(null, m);

            if (config.cache.time && m) {
                
                CP_cache.set(
                    hash,
                    m,
                    config.cache.time,
                    function (err) {
                        if (err) {
                            console.log('[modules/CP_get.js:additionalMoviesGet] Cache Set Error:', err);
                        }
                    }
                );
                
            }

        });

    }

    /**
     * Sort films are turned by id list.
     *
     * @param {String} ids
     * @param {Object} movies
     * @return {Array}
     */

    function sortingIds(ids, movies) {

        var arr = ids.split('|');

        var result = [];

        for (var id = 0; id < arr.length; id++) {
            for (var i = 0; i < movies.length; i++) {
                if (movies[i].kp_id == arr[id])
                    result.push(movies[i]);
            }
        }

        return result;

    }

    /**
     * Delete empty id in query.
     *
     * @param {Array} value
     * @return {String}
     */

    function formatIds(value) {

        var ids = JSON.parse(JSON.stringify(value));

        var all = ids.join(',').replace(/\s*\(\s*([0-9]{3,7})\s*\)\s*\{[^]*?}\s*/gi, ',$1,');

        ids = all.split(',');

        var result = [];

        for (var id = 0; id < ids.length; id++) {
            ids[id] = ids[id].replace(/\s+/g, ' ').replace(/(^\s*)|(\s*)$/g, '');
            if (ids[id]) {
                result.push(ids[id]);
            }
        }

        return result.join('|');

    }

}

/**
 * Getting count movies for a particular query.
 *
 * @param {Object} query
 * @param {String} [sorting]
 * @param {Callback} callback
 */

function countMoviesGet(query, sorting, callback) {

    if (arguments.length == 2) {
        callback = sorting;
        sorting = 'kinopoisk-vote-up';
    }

    var publish = CP_publish.queryCondition();

    if (query.certainly) {
        delete query.certainly;
        publish.select = ', ( kp_id >= 298 AND kp_id <= 1100000 ) AS movie ';
    }

    var queryString = '' +
        ' SELECT COUNT(*) AS num ' +
        publish.select +
        ' FROM ' + sphinx.movies +
        ' WHERE ' +
        createWhere() +
        publish.where +
        ' OPTION max_matches = 1';

    CP_sphinx.query(queryString, function (err, count) {

        if (err) return callback(err);

        if (count && count.length) {
            count = count[0].num;
        }
        else {
            count = 0;
        }

        callback(null, count);

    });

    /**
     * Create WHERE for query.
     *
     * @return {String}
     */

    function createWhere() {

        var thematic = CP_publish.thematic();

        var where = thematic.where_config;
        var match = thematic.match_config;

        match.push('@all_movies _all_');

        if (sorting.indexOf('kinopoisk-rating') + 1) {
            where.push('`kp_vote` > ' + config.default.votes.kp);
        }
        else if (sorting.indexOf('imdb-rating') + 1) {
            where.push('`imdb_vote` > ' + config.default.votes.imdb);
        }
        else if (sorting.indexOf('year') + 1 || sorting.indexOf('premiere') + 1) {
            where.push('`premiere` <= ' + toDays());
        }
        else if (sorting.indexOf('soon') + 1) {
            where.push('`premiere` > ' + toDays());
        }

        for (var attribute in query) {
            if (query.hasOwnProperty(attribute)) {

                var search = ('' + query[attribute]).toLowerCase();
                search = search.replace(/[^0-9A-Za-zА-Яа-яЁё\s\+-\|]/g,'');
                search = search.replace(/\s+/g, ' ');
                search = search.replace(/(^\s*)|(\s*)$/g, '');

                if (attribute == 'type') {
                    if (search == config.urls.types.serial) {
                        where.push('`type` = 1');
                        match.push('@genre !аниме !короткометражка');
                    }
                    else if (search == config.urls.types.mult) {
                        where.push('`type` != 1');
                        match.push('@genre мультфильм | детский !аниме !короткометражка');
                    }
                    else if (search == config.urls.types.anime) {
                        match.push('@genre аниме');
                    }
                    else if (search == config.urls.types.tv) {
                        match.push('@genre шоу | новости | реальное | церемония | концерт');
                    }
                    else if (search == config.urls.types.movie) {
                        where.push('`type` != 1');
                        match.push('@genre !мультфильм !аниме !короткометражка !шоу !новости !реальное !церемония !концерт !детский !документальный');
                    }
                }
                else {
                    match.push('@' + attribute + ' (' + search + ')');
                }

            }
        }

        where.push('MATCH(\'' + match.join(' ').trim() + '\')');

        return where.join(' AND ');

    }

    /**
     * The number of days to the current time.
     *
     * @return {Number}
     */

    function toDays() {

        return 719527 + Math.floor(new Date().getTime()/(1000*60*60*24));

    }

}

/**
 * Gets an object with new ID for diapason.
 *
 * @param {Callback} callback
 */

function publishIdsGet(callback) {

    var limit = (config.publish.every.movies && config.publish.every.hours)
        ? (config.publish.every.movies/config.publish.every.hours)/2
        : 0;

    var start_limit = Math.ceil(limit);
    var stop_limit = Math.floor(limit);

    if ((start_limit && !stop_limit) || (!start_limit && stop_limit)) {
        start_limit = (start_limit) ? start_limit : 1;
        stop_limit = (stop_limit) ? stop_limit : 1;
    }

    if (!start_limit && !stop_limit) {
        return callback(null, null);
    }

    var publish = {};
    publish.where = ''; 

    var where = (config.publish.required.length)
        ? config.publish.required.map(function(ctgry) {
            return ' AND `' + ctgry.trim() + '` != \'\' ';
        })
        : [];
    where = (where.length) ? where.join(' ') : '';

    publish.where = where;

    var startQueryString = '' +
        ' SELECT kp_id' +
        ' FROM ' + sphinx.movies +
        ' WHERE kp_id < ' + config.publish.start + createWhere() + publish.where +
        ' ORDER BY kp_id DESC' +
        ' LIMIT ' + start_limit +
        ' OPTION max_matches = ' + start_limit;

    var stopQueryString = '' +
        ' SELECT kp_id' +
        ' FROM ' + sphinx.movies +
        ' WHERE kp_id > ' + config.publish.stop + createWhere() + publish.where +
        ' ORDER BY kp_id ASC' +
        ' LIMIT ' + stop_limit +
        ' OPTION max_matches = ' + stop_limit;

    var queryString = startQueryString + '; ' + stopQueryString;

    CP_sphinx.query(queryString, function (err, result) {

        if (err) return callback(err);

        if (result && result.length) {

            var ids = {};
            var i;

            ids.soon_id = [];
            ids.start_id = parseInt(config.publish.start);
            ids.stop_id = parseInt(config.publish.stop);

            for (i = 0; i < result[0].length; i++) {
                if (parseInt(result[0][i].kp_id) < ids.start_id) {
                    ids.start_id = parseInt(result[0][i].kp_id);
                    ids.soon_id.push(ids.start_id);
                }
            }

            for (i = 0; i < result[1].length; i++) {
                if (parseInt(result[1][i].kp_id) > ids.stop_id) {
                    ids.stop_id = parseInt(result[1][i].kp_id);
                    ids.soon_id.push(ids.stop_id);
                }
            }

            callback(null, ids);

        }
        else {

            callback(null, null);

        }

    });

    /**
     * Create WHERE for query.
     *
     * @return {String}
     */

    function createWhere() {

        var thematic = CP_publish.thematic();

        var where = thematic.where_config;
        var match = thematic.match_config;

        match.push('@all_movies _all_');

        if (match.length) {
            where.push('MATCH(\'' + match.join(' ').trim() + '\')');
        }

        return (where.length) ? ' AND ' + where.join(' AND ') : '';

    }

}

module.exports = {
    "movies"     : moviesGet,
    "additional" : additionalMoviesGet,
    "count"      : countMoviesGet,
    "publishIds" : publishIdsGet
};