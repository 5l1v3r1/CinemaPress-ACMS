'use strict';

/**
 * Configuration dependencies.
 */

var config  = require('../config/config');
var modules = require('../config/modules');

/**
 * Create full schema data for movie.
 *
 * @param {Object} movie
 * @param {Object} movies - The related movies.
 * @param {Object} [options]
 * @return {String}
 */

function fullMovieSchema(movie, movies, options) {

    if (arguments.length == 2) {
        options = {};
        options.domain = '' + config.domain;
    }

    if (!movie) return '';

    var result = [];

    if (movies) {
        for (var category in movies) {
            if (movies.hasOwnProperty(category)) {

                movies[category].forEach(function(data) {

                    var schemaItemList = {};
                    schemaItemList['@context'] = 'http://schema.org';
                    schemaItemList['@type'] = 'ItemList';
                    schemaItemList['name'] = data.name.replace(/<\/?[^>]+(>|$)/g, '');
                    schemaItemList['numberOfItems'] = data.movies.length;
                    schemaItemList['itemListOrder'] = 'Descending';
                    schemaItemList['itemListElement'] = [];

                    data.movies.forEach(function(m, key) {

                        schemaItemList['itemListElement'].push({
                            "@type": "ListItem",
                            "position": key+1,
                            "item": onlyMovieSchema(m, options)
                        });

                    });

                    result.push(schemaItemList);

                });

            }
        }
    }

    var schemaBreadcrumbList = {};

    schemaBreadcrumbList['@context'] = 'http://schema.org';
    schemaBreadcrumbList['@type'] = 'BreadcrumbList';
    schemaBreadcrumbList['itemListElement'] = [];

    schemaBreadcrumbList['itemListElement'].push({
        "@type": "ListItem",
        "position": 1,
        "item": {
            "@id": "/",
            "name": "Главная",
            "url":  config.protocol + options.domain
        }
    });

    schemaBreadcrumbList['itemListElement'].push({
        "@type": "ListItem",
        "position": 2,
        "item": {
            "@id": "/" + encodeURIComponent(config.urls.genre) + "/" + encodeURIComponent(movie.genre),
            "name": movie.genre,
            "url": config.protocol + options.domain + "/" + encodeURIComponent(config.urls.genre) + "/" + encodeURIComponent(movie.genre)
        }
    });

    schemaBreadcrumbList['itemListElement'].push({
        "@type": "ListItem",
        "position": 3,
        "item": {
            "@id": movie.url,
            "name": movie.title,
            "url": movie.url
        }
    });

    if (options.url && options.url != movie.url) {

        schemaBreadcrumbList['itemListElement'].push({
            "@type": "ListItem",
            "position": 4,
            "item": {
                "@id": options.url,
                "name": options.title,
                "url": options.url
            }
        });

    }

    result.push(onlyMovieSchema(movie, options));
    result.push(schemaBreadcrumbList);

    var schema = '<script type="application/ld+json">' + JSON.stringify(result) + '</script>';

    var opengraph = '';
    opengraph += '<meta name="twitter:card" content="summary_large_image" />';
    opengraph += '<meta property="og:locale" content="ru_RU" />';
    opengraph += '<meta property="og:site_name" content="' + movie.title + '" />';
    opengraph += '<meta property="og:title" content="' + movie.title + '" />';
    opengraph += '<meta property="og:description" content="' + movie.title + ' смотреть онлайн, скачать, трейлер, кадры." />';
    opengraph += '<meta property="og:type" content="video.movie" />';
    opengraph += '<meta property="og:url" content="' + movie.url + '" />';
    opengraph += '<meta property="og:image" content="' + movie.picture + '" />';
    opengraph += (movie.poster.indexOf('http')+1)
        ? '<meta property="og:image" content="' + movie.poster + '" />'
        : '<meta property="og:image" content="' + config.protocol + config.domain + movie.poster + '" />';

    return schema + opengraph;

}

/**
 * Create schema data for one movie.
 *
 * @param {Object} movie
 * @param {Object} [options]
 * @return {Object}
 */

function onlyMovieSchema(movie, options) {

    if (arguments.length == 1) {
        options = {};
        options.domain = '' + config.domain;
    }

    var result = {};

    result['@context'] = 'http://schema.org';
    result['@type'] = 'Movie';
    result['name'] = movie.title_ru;
    result['alternativeHeadline'] = movie.title_en;
    result['description'] = movie.description;
    result['dateCreated'] = movie.premiere;
    result['image'] = (movie.poster.indexOf('http')+1)
        ? movie.poster
        : config.protocol + config.domain + movie.poster;
    result['sameAs'] = movie.url;
    result['url'] = options.url || movie.url;
    result['actor'] = [];
    result['director'] = [];
    result['genre'] = [];
    result['aggregateRating'] = (movie.rating)
        ? {
        "@type": "AggregateRating",
        "bestRating": 10,
        "ratingCount": movie.vote,
        "ratingValue": movie.rating/10
    }
        : null;

    if (movie.actors_arr) {
        movie.actors_arr.forEach(function (actor) {
            result['actor'].push({
                "@type": "Person",
                "name": actor,
                "sameAs": config.protocol + options.domain + "/" + encodeURIComponent(config.urls.actor) + "/" + encodeURIComponent(actor)
            });
        });
    }

    if (movie.directors_arr) {
        movie.directors_arr.forEach(function (director) {
            result['director'].push({
                "@type": "Person",
                "name": director,
                "sameAs": config.protocol + options.domain + "/" + encodeURIComponent(config.urls.director) + "/" + encodeURIComponent(director)
            });
        });
    }

    if (movie.genres_arr) {
        movie.genres_arr.forEach(function (genre) {
            result['genre'].push(genre);
        });
    }

    return result;

}

/**
 * Create schema data for category.
 *
 * @param {Object} page
 * @param {Object} movies
 * @param {Object} [options]
 * @return {String}
 */

function categorySchema(page, movies, options) {

    if (arguments.length == 2) {
        options = {};
        options.domain = '' + config.domain;
    }

    var result = [];

    var schemaItemList = {};
    var schemaBreadcrumbList = {};

    schemaItemList['@context'] = 'http://schema.org';
    schemaItemList['@type'] = 'ItemList';
    schemaItemList['name'] = page.title;
    schemaItemList['numberOfItems'] = movies.length;
    schemaItemList['itemListOrder'] = 'Descending';
    schemaItemList['itemListElement'] = [];

    movies.forEach(function(movie, key) {

        schemaItemList['itemListElement'].push({
            "@type": "ListItem",
            "position": key+1,
            "item": onlyMovieSchema(movie, options)
        });

    });

    schemaBreadcrumbList['@context'] = 'http://schema.org';
    schemaBreadcrumbList['@type'] = 'BreadcrumbList';
    schemaBreadcrumbList['itemListElement'] = [];

    schemaBreadcrumbList['itemListElement'].push({
        "@type": "ListItem",
        "position": 1,
        "item": {
            "@id": "/",
            "name": "Главная",
            "url": config.protocol + options.domain
        }
    });

    schemaBreadcrumbList['itemListElement'].push({
        "@type": "ListItem",
        "position": 2,
        "item": {
            "@id": page.url,
            "name": page.title,
            "url": page.url
        }
    });

    result.push(schemaItemList);
    result.push(schemaBreadcrumbList);

    var schema = '<script type="application/ld+json">' + JSON.stringify(result) + '</script>';

    var opengraph = '';
    opengraph += '<meta name="twitter:card" content="summary_large_image" />';
    opengraph += '<meta property="og:locale" content="ru_RU" />';
    opengraph += '<meta property="og:site_name" content="' + page.title + '" />';
    opengraph += '<meta property="og:title" content="' + page.title + '" />';
    opengraph += '<meta property="og:description" content="' + page.description + '" />';
    opengraph += '<meta property="og:type" content="website" />';
    opengraph += '<meta property="og:url" content="' + page.url + '" />';
    opengraph += '<meta property="og:image" content="' + config.protocol + config.domain + '/themes/default/public/desktop/img/og.png" />';

    return schema + opengraph;

}

/**
 * Create schema data for index/categories/collections page.
 *
 * @param {Object} page
 * @param {Object} [options]
 * @return {String}
 */

function generalSchema(page, options) {

    if (arguments.length == 1) {
        options = {};
        options.domain = '' + config.domain;
    }

    var result = {};

    result['@context'] = 'http://schema.org';
    result['@type'] = 'WebSite';
    result['name'] = page.title;
    result['url'] = config.protocol + options.domain;
    result['potentialAction'] = {
        "@type": "SearchAction",
        "target": config.protocol + options.domain + "/" + config.urls.search + "/title?&q={query}",
        "query-input": "required name=query"
    };
    if (modules.social.status) {
        result['sameAs'] = [];
        if (modules.social.data.vk) {
            result['sameAs'].push(modules.social.data.vk);
        }
        if (modules.social.data.facebook) {
            result['sameAs'].push(modules.social.data.facebook);
        }
        if (modules.social.data.twitter) {
            result['sameAs'].push(modules.social.data.twitter);
        }
        if (modules.social.data.gplus) {
            result['sameAs'].push(modules.social.data.gplus);
        }
    }

    var schema = '<script type="application/ld+json">' + JSON.stringify(result) + '</script>';

    var opengraph = '';
    opengraph += '<meta name="twitter:card" content="summary_large_image" />';
    opengraph += '<meta property="og:locale" content="ru_RU" />';
    opengraph += '<meta property="og:site_name" content="' + page.title + '" />';
    opengraph += '<meta property="og:title" content="' + page.title + '" />';
    opengraph += '<meta property="og:description" content="' + page.description + '" />';
    opengraph += '<meta property="og:type" content="website" />';
    opengraph += '<meta property="og:url" content="' + config.protocol + options.domain + '" />';
    opengraph += '<meta property="og:image" content="' + config.protocol + config.domain + '/themes/default/public/desktop/img/og.png" />';

    return schema + opengraph;

}

module.exports = {
    "fullMovie" : fullMovieSchema,
    "category"  : categorySchema,
    "general"   : generalSchema
};