'use strict';

/**
 * Module dependencies.
 */

var CP_text     = require('./CP_text');
var CP_translit = require('./CP_translit');
var CP_cachep2p = require('./CP_cachep2p');

var CP_player   = require('../modules/CP_player');
var CP_schema   = require('../modules/CP_schema');
var CP_comments = require('../modules/CP_comments');
var CP_social   = require('../modules/CP_social');
var CP_abuse    = require('../modules/CP_abuse');
var CP_viewed   = require('../modules/CP_viewed');
var CP_continue = require('../modules/CP_continue');
var CP_mobile   = require('../modules/CP_mobile');
var CP_episode  = require('../modules/CP_episode');
var CP_adv      = require('../modules/CP_adv');

/**
 * Configuration dependencies.
 */

var config  = require('../config/production/config');
var modules = require('../config/production/modules');

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
 * description, sorting, pagination.
 *
 * Data from modules:
 * viewed, continue, social, schema, mobile, episode, adv.
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

    var all = result.count;
    delete result.count;
    var page = {};

    page.protocol    = config.protocol;
    page.domain      = options.domain;
    page.email       = config.email;
    page.language    = config.language;
    page.country     = config.country;
    page.url         = config.protocol + page.domain;
    page.pathname    = '/';
    page.urls        = formatUrls(config.urls);
    page.codes       = formatCodes(config.codes);
    page.seo         = CP_text.formatting(config.descriptions.index);

    if (Object.keys(result.index).length) {
        var type = (config.index.count.type === 'content_url')
            ? modules.content.data.url
            : config.urls[config.index.count.type];
        var url         = categoryUrl(type, config.index.count.key, options);
        page.sorting    = sortingUrl(url, config.index.count.sorting);
        page.pagination = createPagination(url, config.index.count.sorting, 1, all);
    }

    page.title       = optimalLength(CP_text.formatting(config.titles.index));
    page.description = optimalLength(page.seo);

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
    if (modules.adv.status) {
        page.adv = CP_adv.codes(options, 'index');
    }
    if (config.cache.p2p) {
        page.codes.footer = page.codes.footer + CP_cachep2p.code();
    }

    result.page = page;
    callback(null, result);

}

/**
 * Adding basic information on the movie page:
 * protocol, domain, email, url, urls, codes, seo, title,
 * description.
 *
 * Data from modules:
 * player, viewed, continue, social, schema, comments,
 * mobile, episode, schema, adv.
 *
 * @param {Object} result
 * @param {String} type - One type of movie, online,
 * download, picture, trailer or episode.
 * @param {Object} [options]
 * @param {Callback} callback
 */

function pageMovie(result, type, options, callback) {

    if (arguments.length === 3) {
        options = {};
        options.domain = '' + config.domain;
    }

    var movie = result.movie;
    var movies = result.movies;
    var page = {};

    page.protocol = config.protocol;
    page.domain   = options.domain;
    page.email    = config.email;
    page.language = config.language;
    page.country  = config.country;
    page.url      = (type === 'movie') ? movie.url : movie.url + '/' + (config.urls.movies[type] || type);
    page.pathname = (type === 'movie') ? movie.pathname : movie.pathname + '/' + (config.urls.movies[type] || type);
    page.urls     = formatUrls(config.urls);
    page.codes    = formatCodes(config.codes);
    page.seo      = (config.descriptions.movie[type]) ? CP_text.formatting(config.descriptions.movie[type], movie) : '';

    page.title       = optimalLength(uniqueTitle());
    page.description = optimalLength(movie.description_meta || page.seo);

    if (modules.player.status || type === 'trailer' || type === 'picture') {
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
    if (modules.comments.status) {
        page.codes.head = CP_comments.head() + page.codes.head;
        page.comments = CP_comments.codes(page.url, page.pathname);
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

            page.title       = optimalLength(CP_text.formatting(modules.episode.data.title, movie));
            page.description = optimalLength(page.seo);
        }

        page.codes.footer = CP_episode.code() + page.codes.footer;
    }
    if (modules.schema.status) {
        page.codes.head = CP_schema.fullMovie(page, movie, movies, options) + page.codes.head;
    }
    if (modules.adv.status) {
        var t = (config.titles.movie[type]) ? type : 'episode';
        page.adv = CP_adv.codes(options, t);
    }
    if (config.cache.p2p) {
        page.codes.footer = page.codes.footer + CP_cachep2p.code();
    }

    /**
     * Choose a unique title, if any.
     *
     * @return {String}
     */

    function uniqueTitle() {

        return (type === 'movie' && movie.title_page)
            ? CP_text.formatting(movie.title_page)
            : (config.titles.movie[type])
                ? CP_text.formatting(config.titles.movie[type], movie)
                : ''

    }

    result.page = page;
    callback(null, result);

}

/**
 * Adding basic information on the category page:
 * protocol, domain, email, url, urls, codes, seo, title,
 * description, sorting, pagination.
 *
 * Data from modules:
 * viewed, continue, social, schema, mobile, episode, adv.
 *
 * @param {Object} result
 * @param {Object} query
 * @param {String} sorting
 * @param {Number} num
 * @param {Object} [options]
 * @param {Callback} callback
 */

function pageCategory(result, query, sorting, num, options, callback) {

    if (arguments.length === 5) {
        options = {};
        options.domain = '' + config.domain;
    }

    var all = result.count;
    delete result.count;
    var movies = result.movies;
    var page = {};

    page.protocol = config.protocol;
    page.domain   = options.domain;
    page.email    = config.email;
    page.language = config.language;
    page.country  = config.country;
    page.urls     = formatUrls(config.urls);
    page.codes    = formatCodes(config.codes);

    for (var type in query) {
        if (query.hasOwnProperty(type)) {

            query['sorting'] = (config.default.sorting !== sorting)
                ? config.titles.sorting[sorting] || ''
                : '';
            query['page'] = (num !== 1)
                ? config.titles.num.replace('[num]', ('' + num))
                : '';

            page.seo = CP_text.formatting(config.descriptions[type], query);

            page.title       = optimalLength(CP_text.formatting(config.titles[type], query));
            page.description = optimalLength(page.seo);
            page.url         = categoryUrl(config.urls[type], query[type], options);
            page.pathname    = categoryUrl(config.urls[type], query[type], {protocol: '', domain: ''});

            if (result.movies.length) {
                page.sorting     = sortingUrl(page.url, sorting);
                page.pagination  = createPagination(page.url, sorting, num, all);
            }

            if (config.default.sorting !== sorting || num !== 1) {
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
    if (modules.adv.status) {
        page.adv = CP_adv.codes(options, 'category');
    }
    if (config.cache.p2p) {
        page.codes.footer = page.codes.footer + CP_cachep2p.code();
    }

    result.page = page;
    callback(null, result);

}

/**
 * Adding basic information on the categories page:
 * protocol, domain, email, url, urls, codes, seo, title,
 * description.
 *
 * Data from modules:
 * viewed, continue, social, schema, mobile, episode, adv.
 *
 * @param {Object} result
 * @param {String} category
 * @param {Object} [options]
 * @param {Callback} callback
 */

function pageCategories(result, category, options, callback) {

    if (arguments.length === 1) {
        options = {};
        options.domain = '' + config.domain;
    }

    var page = {};

    var categories = {
        "year"     : "years",
        "genre"    : "genres",
        "actor"    : "actors",
        "country"  : "countries",
        "director" : "directors"
    };

    page.protocol = config.protocol;
    page.domain   = options.domain;
    page.email    = config.email;
    page.language = config.language;
    page.country  = config.country;
    page.urls     = formatUrls(config.urls);
    page.codes    = formatCodes(config.codes);
    page.url      = categoriesUrl(config.urls[category], options);
    page.pathname = categoriesUrl(config.urls[category], {protocol: '', domain: ''});
    page.seo      = CP_text.formatting(config.descriptions[categories[category]]);

    page.title       = optimalLength(CP_text.formatting(config.titles[categories[category]]));
    page.description = optimalLength(page.seo);

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
    if (modules.adv.status) {
        page.adv = CP_adv.codes(options, 'categories');
    }
    if (config.cache.p2p) {
        page.codes.footer = page.codes.footer + CP_cachep2p.code();
    }

    result.page = page;
    callback(null, result);

}

/**
 * Adding basic information on the content:
 * protocol, domain, email, url, urls, codes, seo, title,
 * description, sorting, pagination.
 *
 * Data from modules:
 * viewed, continue, social, schema, comments, mobile, adv.
 *
 * @param {Object} result
 * @param {String} url - The unique key page.
 * @param {Number} num
 * @param {String} sorting
 * @param {Object} [options]
 * @param {Callback} callback
 */

function pageContent(result, url, num, sorting, options, callback) {

    if (arguments.length === 3) {
        options = {};
        options.domain = '' + config.domain;
    }

    var all = result.count;
    delete result.count;
    var page = {};
    var keys = {};

    keys['sorting'] = (config.default.sorting !== sorting)
        ? config.titles.sorting[sorting] || ''
        : '';
    keys['page'] = (num !== 1)
        ? config.titles.num.replace('[num]', ('' + num))
        : '';

    page.protocol = config.protocol;
    page.domain   = options.domain;
    page.email    = config.email;
    page.language = config.language;
    page.country  = config.country;
    page.urls     = formatUrls(config.urls);
    page.codes    = formatCodes(config.codes);

    page.title       = optimalLength(CP_text.formatting(result.content.title));
    page.description = optimalLength(result.content.description);
    page.url         = config.protocol + options.domain + '/' + modules.content.data.url + '/' + url;
    page.pathname    = '/' + modules.content.data.url + '/' + url;

    if (result.movies.length) {
        page.sorting    = sortingUrl(page.url, sorting);
        page.pagination = createPagination(page.url, sorting, num, all);
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
        page.codes.head = CP_schema.content(result.content, options) + page.codes.head;
    }
    if (modules.comments.status) {
        page.codes.head = CP_comments.head() + page.codes.head;
        page.comments = CP_comments.codes(page.url, page.pathname);
    }
    if (modules.mobile.status) {
        page.codes.head = CP_mobile.mobile(page.url) + page.codes.head;
    }
    if (modules.adv.status) {
        page.adv = CP_adv.codes(options, 'category');
    }
    if (config.cache.p2p) {
        page.codes.footer = page.codes.footer + CP_cachep2p.code();
    }

    result.page = page;
    callback(null, result);

}

/**
 * Adding basic information on the contents:
 * protocol, domain, email, url, urls, codes, seo, title,
 * description.
 *
 * Data from modules:
 * viewed, continue, social, schema, mobile, episode, adv.
 *
 * @param {Object} query
 * @param {Object} result
 * @param {Object} [options]
 * @param {Callback} callback
 */

function pageContents(query, result, options, callback) {

    if (!arguments.length) {
        options = {};
        options.domain = '' + config.domain;
    }

    var page = {};

    page.protocol = config.protocol;
    page.domain   = options.domain;
    page.email    = config.email;
    page.language = config.language;
    page.country  = config.country;
    page.urls     = formatUrls(config.urls);
    page.codes    = formatCodes(config.codes);
    page.url      = categoriesUrl(modules.content.data.url, options);
    page.pathname = categoriesUrl(modules.content.data.url, {protocol: '', domain: ''});
    page.seo      = (!query.content_tags)
        ? CP_text.formatting(modules.content.data.description)
        : '';

    page.title       = (!query.content_tags)
        ? optimalLength(CP_text.formatting(modules.content.data.title))
        : optimalLength(query.content_tags);
    page.description = (!query.content_tags)
        ? optimalLength(page.seo)
        : optimalLength(query.content_tags);

    if (modules.viewed.status) {
        page.codes.footer = CP_viewed.code() + page.codes.footer;
    }
    if (modules.continue.status) {
        page.codes.footer = CP_continue.code() + page.codes.footer;
    }
    if (modules.social.status) {
        page.social = CP_social.pages();
    }
    if (modules.mobile.status) {
        page.codes.head = CP_mobile.mobile(page.url) + page.codes.head;
    }
    if (modules.adv.status) {
        page.adv = CP_adv.codes(options, 'categories');
    }
    if (config.cache.p2p) {
        page.codes.footer = page.codes.footer + CP_cachep2p.code();
    }

    result.page = page;
    callback(null, result);

}

/**
 * Create URL for category/content.
 *
 * @param {String} category
 * @param {String} name
 * @param {Object} [options]
 * @return {String}
 */

function categoryUrl(category, name, options) {

    if (arguments.length === 2) {
        options = {};
        options.domain = '' + config.domain;
    }

    return config.protocol + options.domain + '/' + category + '/' + ((category === config.urls.type)
        ? name
        : CP_translit.text(name));

}

/**
 * Create URL for categories/contents.
 *
 * @param {String} category
 * @param {Object} [options]
 * @return {String}
 */

function categoriesUrl(category, options) {

    if (arguments.length === 1) {
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

        if (sorting === s) {
            s = sorting.replace('up', 'down');
            a = 'up';
        }
        else if (sortingDown[sorting] === s) {
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
    delete urls.translit;

    urls.genres = ["аниме","биография","боевик","вестерн","военный","детектив","детский","документальный","драма","игра","история","комедия","концерт","короткометражка","криминал","мелодрама","музыка","мультфильм","мюзикл","новости","приключения","реальное ТВ","семейный","спорт","ток-шоу","триллер","ужасы","фантастика","фильм-нуар","фэнтези","церемония"].map(function (genre) {
        return {
            "title" : genre,
            "url"   : "/" + urls.genre + "/" + CP_translit.text(genre)
        }
    });

    urls.countries = ["США","Россия","СССР","Индия","Франция","Япония","Великобритания","Испания","Италия","Канада"].map(function (country) {
        return {
            "title" : country,
            "url"   : "/" + urls.country + "/" + CP_translit.text(country)
        }
    });

    urls.years = [];
    for (var year = parseInt(new Date().getFullYear()), len = year - 10; year >= len; year--) {
        urls.years.push({
            "title" : year + "",
            "url"   : "/" + urls.year + "/" + year
        });
    }

    if (modules.content.status) {
        urls.content = modules.content.data.url;
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
 * SEO description and title.
 *
 * @param {String} text
 * @return {String}
 */

function optimalLength(text) {

    text = text
        .replace(/<(?:.|\n)*?>/gm, '')
        .replace(/\s+/g, ' ')
        .replace(/(^\s*)|(\s*)$/g, '')
        .replace(/"([^"]*?)"/gi, '«$1»')
        .replace('"', '&quot;');

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
 * @param {Number} last
 * @return {Object}
 */

function createPagination(url, sorting, current, last) {

    if (!last) return false;

    var pagination = {};
    pagination.prev = [];
    pagination.next = [];
    pagination.current = current;

    var number_prev = current;
    var number_next = current;

    var pages = (current <= config.default.pages / 2)
        ? config.default.pages - current + 1
        : (current >= (last - config.default.pages / 2))
            ? config.default.pages - (last - current)
            : config.default.pages/2;

    var sorting_page = (
        !sorting ||
        (sorting === config.default.sorting &&
        url.indexOf('/' + modules.content.data.url + '/') === -1))
        ? ''
        : '?sorting=' + sorting;

    pagination.first = {
        "number" : 1,
        "link"   : url + sorting_page
    };
    pagination.last = {
        "number" : last,
        "link"   : url + '/' + last + sorting_page
    };

    for (var i = 1; i <= pages; i++) {
        number_prev = number_prev - 1;
        if (number_prev >= 1) {
            pagination.prev.push({
                "number" : number_prev,
                "link"   : url + '/' + number_prev + sorting_page
            });
        }
        number_next = number_next + 1;
        if (number_next <= last) {
            pagination.next.push({
                "number" : number_next,
                "link"   : url + '/' + number_next + sorting_page
            });
        }
        if (number_next === last || current === last) {
            pagination.last = null;
        }
        if (number_prev === 1 || current === 1) {
            pagination.first = null;
        }
    }

    pagination.prev.reverse();

    return pagination;

}

module.exports = {
    "index"      : pageIndex,
    "movie"      : pageMovie,
    "category"   : pageCategory,
    "categories" : pageCategories,
    "content"    : pageContent,
    "contents"   : pageContents
};