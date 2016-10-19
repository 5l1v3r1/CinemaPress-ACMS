'use strict';

/**
 * Module dependencies.
 */

var CP_text     = require('./CP_text');

var CP_player   = require('../modules/CP_player');
var CP_schema   = require('../modules/CP_schema');
var CP_comments = require('../modules/CP_comments');
var CP_social   = require('../modules/CP_social');
var CP_abuse    = require('../modules/CP_abuse');
var CP_viewed   = require('../modules/CP_viewed');
var CP_continue = require('../modules/CP_continue');
var CP_mobile   = require('../modules/CP_mobile');
var CP_episode  = require('../modules/CP_episode');

/**
 * Configuration dependencies.
 */

var config  = require('../config/config');
var modules = require('../config/modules');
var texts   = require('../config/texts');

/**
 * Callback.
 *
 * @callback Callback
 * @param {Object} err
 * @param {Object} [render]
 */

/**
 * Adding basic information on the index page:
 * protocol, domain, email, url, urls, codes, seo, title,
 * description, head, footer.
 *
 * Data from modules:
 * viewed, continue, social, schema, mobile, episode.
 *
 * @param {Object} result
 * @param {Object} [options]
 * @param {Callback} callback
 */

function pageIndex(result, options, callback) {

    if (!arguments.length) {
        options = {};
        options.domain = '' + config.domain;
    }

    var page = {};

    page.protocol = config.protocol;
    page.domain   = options.domain;
    page.email    = config.email;
    page.url      = config.protocol + page.domain;
    page.urls     = formatUrls(config.urls);
    page.codes    = formatCodes(config.codes);
    page.seo      = CP_text.formatting(config.descriptions.index);

    page.title       = CP_text.formatting(config.titles.index);
    page.description = formatDescription(page.seo);

    if (modules.viewed.status) {
        page.codes.footer = CP_viewed.code() + page.codes.footer;
    }
    if (modules.continue.status) {
        page.codes.footer = CP_continue.code() + page.codes.footer;
    }
    if (modules.social.status) {
        page.social = CP_social.pages();
    }
    if (modules.schema.status) {
        page.codes.head = CP_schema.general(page, options) + page.codes.head;
    }
    if (modules.mobile.status) {
        page.codes.head = CP_mobile.mobile(page.url) + page.codes.head;
    }
    if (modules.episode.status) {
        page.codes.footer = CP_episode.code('serials') + page.codes.footer;
    }

    result.page = page;
    callback(null, result);

}

/**
 * Adding basic information on the movie page:
 * protocol, domain, email, url, urls, codes, seo, title,
 * description, head, footer.
 *
 * Data from modules:
 * player, viewed, continue, social, schema, comments,
 * abuse, mobile, episode.
 *
 * @param {Object} result
 * @param {String} type - One type of movie, online,
 * download, picture, trailer or episode.
 * @param {Object} [options]
 * @param {Callback} callback
 */

function pageMovie(result, type, options, callback) {

    if (arguments.length == 3) {
        options = {};
        options.domain = '' + config.domain;
    }

    var movie = result.movie;
    var movies = result.movies;
    var page = {};

    page.protocol = config.protocol;
    page.domain   = options.domain;
    page.email    = config.email;
    page.url      = (type == 'movie') ? movie.url : movie.url + '/' + (config.urls.movies[type] || type);
    page.urls     = formatUrls(config.urls);
    page.codes    = formatCodes(config.codes);
    page.seo      = (config.descriptions.movie[type]) ? CP_text.formatting(config.descriptions.movie[type], movie) : '';

    page.title       = uniqueTitle();
    page.description = formatDescription(page.seo);

    if (modules.player.status || type == 'trailer' || type == 'picture') {
        var player = CP_player.code(type, movie, options);
        page.codes.head = player.head + page.codes.head;
        page.player = player.player;
        page.codes.footer = player.footer + page.codes.footer;
    }
    if (modules.viewed.status) {
        page.codes.footer = CP_viewed.code() + page.codes.footer;
    }
    if (modules.continue.status) {
        page.codes.footer = CP_continue.code() + page.codes.footer;
    }
    if (modules.social.status) {
        page.social = CP_social.pages();
    }
    if (modules.schema.status) {
        page.codes.head = CP_schema.fullMovie(movie, movies, options) + page.codes.head;
    }
    if (modules.comments.status) {
        page.codes.head = CP_comments.head() + page.codes.head;
        page.comments = CP_comments.codes(movie);
    }
    if (modules.abuse.status) {
        page.abuse = CP_abuse.hide();
    }
    if (modules.mobile.status) {
        page.codes.head = CP_mobile.mobile(page.url) + page.codes.head;
    }
    if (modules.episode.status) {
        if (!page.title) {
            var serial = CP_episode.parse(type, options);

            movie.season    = serial.season;
            movie.episode   = serial.episode;
            movie.translate = serial.translate;

            page.seo = CP_text.formatting(modules.episode.data.description, movie);

            page.title       = CP_text.formatting(modules.episode.data.title, movie);
            page.description = formatDescription(page.seo);
        }

        page.codes.footer = CP_episode.code() + page.codes.footer;
    }

    /**
     * Choose a unique title, if any.
     *
     * @return {String}
     */

    function uniqueTitle() {

        var id = parseInt(movie.kp_id);

        return (type == 'movie' && texts.ids.indexOf(id)+1 && texts.movies[id].title)
            ? CP_text.formatting(texts.movies[id].title)
            : (config.titles.movie[type])
            ? CP_text.formatting(config.titles.movie[type], movie)
            : ''

    }

    result.page = page;
    callback(null, result);

}

/**
 * Adding basic information on the movie page:
 * protocol, domain, email, url, urls, codes, seo, title,
 * description, url, sorting, pagination, head, footer.
 *
 * Data from modules:
 * viewed, continue, social, schema, mobile, episode.
 *
 * @param {Object} result
 * @param {Object} query
 * @param {String} sorting
 * @param {Number} num
 * @param {Object} [options]
 * @param {Callback} callback
 */

function pageCategory(result, query, sorting, num, options, callback) {

    if (arguments.length == 5) {
        options = {};
        options.domain = '' + config.domain;
    }

    var all = result.count;
    var movies = result.movies;
    var page = {};

    page.protocol = config.protocol;
    page.domain   = options.domain;
    page.email    = config.email;
    page.urls     = formatUrls(config.urls);
    page.codes    = formatCodes(config.codes);

    for (var type in query) {
        if (query.hasOwnProperty(type)) {

            query['sorting'] = (config.default.sorting != sorting)
                ? config.titles.sorting[sorting] || ''
                : '';
            query['page'] = (num != 1)
                ? config.titles.num.replace('[num]', '' + num)
                : '';

            page.seo = CP_text.formatting(config.descriptions[type], query);

            page.title       = CP_text.formatting(config.titles[type], query);
            page.description = formatDescription(page.seo);
            page.url         = categoryUrl(config.urls[type], query[type], options);
            page.sorting     = sortingUrl(page.url, sorting);
            page.pagination  = createPagination(page.url, sorting, num, all);

            if (config.default.sorting != sorting || num != 1) {
                page.seo = '';
            }

        }
    }

    if (modules.viewed.status) {
        page.codes.footer = CP_viewed.code() + page.codes.footer;
    }
    if (modules.continue.status) {
        page.codes.footer = CP_continue.code() + page.codes.footer;
    }
    if (modules.social.status) {
        page.social = CP_social.pages();
    }
    if (modules.schema.status) {
        page.codes.head = CP_schema.category(page, movies, options) + page.codes.head;
    }
    if (modules.mobile.status) {
        page.codes.head = CP_mobile.mobile(page.url) + page.codes.head;
    }
    if (modules.episode.status) {
        page.codes.footer = CP_episode.code('serials') + page.codes.footer;
    }

    result.page = page;
    callback(null, result);

}

/**
 * Adding basic information on the collection page:
 * protocol, domain, email, url, urls, codes, seo, title,
 * description, url, sorting, pagination, head, footer.
 *
 * Data from modules:
 * viewed, continue, social, schema, mobile, episode.
 *
 * @param {Object} result
 * @param {String} url - The unique key collection.
 * @param {String} sorting
 * @param {Number} num
 * @param {Object} [options]
 * @param {Callback} callback
 */

function pageCollection(result, url, sorting, num, options, callback) {

    if (arguments.length == 5) {
        options = {};
        options.domain = '' + config.domain;
    }

    var all = result.count;
    var movies = result.movies;
    var page = {},
        keys = {};

    page.protocol = config.protocol;
    page.domain   = options.domain;
    page.email    = config.email;
    page.urls     = formatUrls(config.urls);
    page.codes    = formatCodes(config.codes);

    keys['sorting'] = (config.default.sorting != sorting)
        ? config.titles.sorting[sorting] || ''
        : '';
    keys['page'] = (num != 1)
        ? config.titles.num.replace('[num]', '' + num)
        : '';

    page.seo = CP_text.formatting(modules.collections.data.collections[url].description, keys);

    page.title       = CP_text.formatting(modules.collections.data.collections[url].title, keys);
    page.description = formatDescription(page.seo);
    page.url         = categoryUrl(modules.collections.data.url, url, options);
    page.sorting     = sortingUrl(page.url, sorting);
    page.pagination  = createPagination(page.url, sorting, num, all);

    if (config.default.sorting != sorting || num != 1) {
        page.seo = '';
    }
    if (modules.viewed.status) {
        page.codes.footer = CP_viewed.code() + page.codes.footer;
    }
    if (modules.continue.status) {
        page.codes.footer = CP_continue.code() + page.codes.footer;
    }
    if (modules.social.status) {
        page.social = CP_social.pages();
    }
    if (modules.schema.status) {
        page.codes.head = CP_schema.category(page, movies, options) + page.codes.head;
    }
    if (modules.mobile.status) {
        page.codes.head = CP_mobile.mobile(page.url) + page.codes.head;
    }
    if (modules.episode.status) {
        page.codes.footer = CP_episode.code('serials') + page.codes.footer;
    }

    result.page = page;
    callback(null, result);

}

/**
 * Adding basic information on the collections page:
 * protocol, domain, email, url, urls, codes, url, seo, title,
 * description, head, footer.
 *
 * Data from modules:
 * viewed, continue, social, schema, mobile, episode.
 *
 * @param {Object} result
 * @param {Object} [options]
 * @param {Callback} callback
 */

function pageCollections(result, options, callback) {

    if (!arguments.length) {
        options = {};
        options.domain = '' + config.domain;
    }

    var page = {};

    page.protocol = config.protocol;
    page.domain   = options.domain;
    page.email    = config.email;
    page.urls     = formatUrls(config.urls);
    page.codes    = formatCodes(config.codes);
    page.url      = categoriesUrl(modules.collections.data.url, options);
    page.seo      = CP_text.formatting(modules.collections.data.description);

    page.title       = CP_text.formatting(modules.collections.data.title);
    page.description = formatDescription(page.seo);

    if (modules.viewed.status) {
        page.codes.footer = CP_viewed.code() + page.codes.footer;
    }
    if (modules.continue.status) {
        page.codes.footer = CP_continue.code() + page.codes.footer;
    }
    if (modules.social.status) {
        page.social = CP_social.pages();
    }
    if (modules.schema.status) {
        page.codes.head = CP_schema.general(page, options) + page.codes.head;
    }
    if (modules.mobile.status) {
        page.codes.head = CP_mobile.mobile(page.url) + page.codes.head;
    }
    if (modules.episode.status) {
        page.codes.footer = CP_episode.code('serials') + page.codes.footer;
    }

    result.page = page;
    callback(null, result);

}

/**
 * Adding basic information on the categories page:
 * protocol, domain, email, url, urls, codes, seo, title,
 * description, head, footer.
 *
 * Data from modules:
 * viewed, continue, social, schema, mobile, episode.
 *
 * @param {Object} result
 * @param {String} category
 * @param {Object} [options]
 * @param {Callback} callback
 */

function pageCategories(result, category, options, callback) {

    if (arguments.length == 1) {
        options = {};
        options.domain = '' + config.domain;
    }

    var page = {};

    var categories = {
        "year"       : "years",
        "genre"      : "genres",
        "actor"      : "actors",
        "country"    : "countries",
        "director"   : "directors"
    };

    page.protocol = config.protocol;
    page.domain   = options.domain;
    page.email    = config.email;
    page.urls     = formatUrls(config.urls);
    page.codes    = formatCodes(config.codes);
    page.url      = categoriesUrl(config.urls[category], options);
    page.seo      = CP_text.formatting(config.descriptions[categories[category]]);

    page.title       = CP_text.formatting(config.titles[categories[category]]);
    page.description = formatDescription(page.seo);

    if (modules.viewed.status) {
        page.codes.footer = CP_viewed.code() + page.codes.footer;
    }
    if (modules.continue.status) {
        page.codes.footer = CP_continue.code() + page.codes.footer;
    }
    if (modules.social.status) {
        page.social = CP_social.pages();
    }
    if (modules.schema.status) {
        page.codes.head = CP_schema.general(page, options) + page.codes.head;
    }
    if (modules.mobile.status) {
        page.codes.head = CP_mobile.mobile(page.url) + page.codes.head;
    }
    if (modules.episode.status) {
        page.codes.footer = CP_episode.code('serials') + page.codes.footer;
    }

    result.page = page;
    callback(null, result);

}

/**
 * Create URL for category/collection.
 *
 * @param {String} category
 * @param {String} name
 * @param {Object} [options]
 * @return {String}
 */

function categoryUrl(category, name, options) {

    if (arguments.length == 2) {
        options = {};
        options.domain = '' + config.domain;
    }

    return config.protocol + options.domain + '/' + category + '/' + encodeURIComponent(name);

}

/**
 * Create URL for categories/collections.
 *
 * @param {String} category
 * @param {Object} [options]
 * @return {String}
 */

function categoriesUrl(category, options) {

    if (arguments.length == 1) {
        options = {};
        options.domain = '' + config.domain;
    }

    return config.protocol + options.domain + '/' + category;

}

/**
 * Create a URL including sorting.
 *
 * @param {String} url
 * @param {String} sorting
 * @return {Object}
 */

function sortingUrl(url, sorting) {

    var sortingUp = [
        'kinopoisk-rating-up',
        'imdb-rating-up',
        'kinopoisk-vote-up',
        'imdb-vote-up',
        'year-up',
        'premiere-up'
    ];

    var sortingDown = {
        "kinopoisk-rating-down" : sortingUp[0],
        "imdb-rating-down"      : sortingUp[1],
        "kinopoisk-vote-down"   : sortingUp[2],
        "imdb-vote-down"        : sortingUp[3],
        "year-down"             : sortingUp[4],
        "premiere-down"         : sortingUp[5]
    };

    return sortingUp.map(function(s) {

        var a = false;

        if (sorting == s) {
            s = sorting.replace('up','down');
            a = 'up';
        }
        else if (sortingDown[sorting] == s) {
            a = 'down';
        }

        return {
            "name"   : config.sorting[s],
            "url"    : url + '?sorting=' + s,
            "active" : a
        }

    });

}

/**
 * Remove excess, addet new in URLs.
 *
 * @param {Object} urls
 * @return {Object}
 */

function formatUrls(urls) {

    var a = JSON.stringify(urls);
    urls = JSON.parse(a);

    delete urls.prefix_id;
    delete urls.unique_id;
    delete urls.separator;
    delete urls.movie_url;
    delete urls.admin;
    delete urls.prefix_id;

    if (modules.collections.status) {
        urls.collection = modules.collections.data.url;
    }

    return urls;

}

/**
 * Remove excess, addet new in codes.
 *
 * @param {Object} codes
 * @return {Object}
 */

function formatCodes(codes) {

    var a = JSON.stringify(codes);
    codes = JSON.parse(a);

    delete codes.robots;

    return codes;

}

/**
 * SEO description 160 symbol.
 *
 * @param {String} text
 * @return {String}
 */

function formatDescription(text) {

    text = text.replace(/<(?:.|\n)*?>/gm, '');
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/(^\s*)|(\s*)$/g, '');

    if (text.length > 160) {
        var seo_text = text.substr(0, 160);
        var seo_arr = seo_text.split(' ');
        if (seo_arr.length > 1)
            seo_arr.pop();
        text = seo_arr.join(' ').trim();
    }

    return text;

}

/**
 * Create pagination links.
 *
 * @param {String} url
 * @param {String} sorting
 * @param {Number} current
 * @param {Number} all
 * @return {Object}
 */

function createPagination(url, sorting, current, all) {

    var pagination = {};
    pagination.prev = [];
    pagination.next = [];
    pagination.current = current;

    var number_prev = current;
    var number_next = current;

    var sorting_page = (sorting != config.default.sorting)
        ? '?sorting=' + sorting
        : '';

    for (var i = 1; i <= 10; i++) {
        number_prev = number_prev - 1;
        if (number_prev >= 1) {
            pagination.prev.push({
                "number" : number_prev,
                "link"   : url + '/' + number_prev + sorting_page
            });
        }
        number_next = number_next + 1;
        if (number_next <= all) {
            pagination.next.push({
                "number" : number_next,
                "link"   : url + '/' + number_next + sorting_page
            });
        }
    }

    pagination.prev.reverse();

    return pagination;

}

module.exports = {
    "index"       : pageIndex,
    "movie"       : pageMovie,
    "category"    : pageCategory,
    "categories"  : pageCategories,
    "collection"  : pageCollection,
    "collections" : pageCollections
};