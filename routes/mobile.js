'use strict';

/**
 * Module dependencies.
 */

var CP_cache  = require('../lib/CP_cache');
var CP_decode = require('../lib/CP_decode');

/**
 * Configuration dependencies.
 */

var config  = require('../config/config');
var modules = require('../config/modules');

/**
 * Node dependencies.
 */

var maxmind = require('maxmind');
var parser  = require('ua-parser-js');
var md5     = require('md5');
var express = require('express');
var router  = express.Router();

/**
 * Route dependencies.
 */

var index    = require('./paths/index');
var movie    = require('./paths/movie');
var category = require('./paths/category');
var sitemap  = require('./paths/sitemap');

/**
 * Route CP modules dependencies.
 */

var collection = require('./paths/collection');

/**
 * Callback.
 *
 * @callback Callback
 * @param {Object} err
 * @param {Object} [render]
 */

router.get('/:level1?/:level2?/:level3?/:level4?', function (req, res, next) {

    // -----------------------------------------------------------------
    // Checking activation module the mobile site.
    // -----------------------------------------------------------------

    if (!modules.mobile.status) {
        return next({
            "status": 404,
            "message": "Мобильная версия сайта не активирована. Сайт адаптируется под экран и одинаково прекрасно отображается, как на больших экранах, так и на мобильных устройствах под управлением iOS, Android или WindowsPhone."
        });
    }

    // -----------------------------------------------------------------

    var options = {};
    options.domain = 'm.' + config.domain;
    options.sub = req.cookies.CP_sub || '';

    if (modules.adv.status) {
        options.adv = {};
        options.adv.device = 'mobile';
        if (parseInt(modules.adv.data.target)) {
            var lookup = maxmind.openSync('/home/' + config.domain + '/config/default/GeoLite2-City.mmdb', {
                cache: {
                    max: 1000,
                    maxAge: 1000 * 60 * 60 * 60 * 24
                }
            });
            var info = lookup.get(req.ip);
            var user = parser(req.headers['user-agent']);
            options.adv.ip = (req.ip)
                ? req.ip
                : '';
            options.adv.country = (info.country && info.country.names && info.country.names.ru)
                ? info.country.names.ru
                : '';
            options.adv.city = (info.city && info.city.names && info.city.names.ru)
                ? info.city.names.ru
                : '';
            options.adv.browser = (user.browser && user.browser.name)
                ? user.browser.name
                : '';
            options.adv.os = (user.os && user.os.name)
                ? user.os.name
                : '';
            options.adv.type = (user.device && user.device.type)
                ? user.device.type
                : '';
            options.adv.vendor = (user.device && user.device.vendor)
                ? user.device.vendor
                : '';
            options.adv.model = (user.device && user.device.model)
                ? user.device.model
                : '';
        }
    }

    var url = parseUrl();
    var urlHash = md5(options.sub + url.toLowerCase());

    var level1  = clearString(req.params.level1) || null;
    var level2  = clearString(req.query.q)       || clearString(req.params.level2) || null;
    var level3  = clearString(req.params.level3) || null;
    var sorting = clearString(req.query.sorting) || config.default.sorting;

    console.time(url);

    var template = setTemplate();

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

        switch (template) {
            case 'mobile/movie':
                movie.data(
                    movie.id(level2),
                    'movie',
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url == render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'mobile/online':
                movie.data(
                    movie.id(level2),
                    'online',
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url == render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'mobile/download':
                movie.data(
                    movie.id(level2),
                    'download',
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url == render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'mobile/trailer':
                movie.data(
                    movie.id(level2),
                    'trailer',
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url == render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'mobile/picture':
                movie.data(
                    movie.id(level2),
                    'picture',
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url == render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'mobile/episode':
                movie.data(
                    movie.id(level2),
                    level3,
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url == render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'mobile/category':
                category.one(
                    level1,
                    level2,
                    parseInt(level3),
                    sorting,
                    options,
                    function (err, render) {
                        callback(err, render);
                    });
                break;
            case 'mobile/categories':
                category.all(
                    level1,
                    options,
                    function (err, render) {
                        callback(err, render);
                    });
                break;
            case 'mobile/collection':
                template = 'mobile/category';
                collection.one(
                    level2,
                    parseInt(level3),
                    sorting,
                    options,
                    function (err, render) {
                        callback(err, render);
                    });
                break;
            case 'mobile/collections':
                template = 'mobile/categories';
                collection.all(
                    options,
                    function (err, render) {
                        callback(err, render);
                    });
                break;
            case 'mobile/index':
                index.data(
                    options,
                    function (err, render) {
                        callback(err, render);
                    });
                break;
            default:
                callback('Данной страницы нет на сайте. Возможно Вы ошиблись в URL или это внутренняя ошибка сайта, о которой администратор уже знает и предпринимает действия для её устранения.');
        }

    }

    /**
     * Parse URL.
     *
     * @return {String}
     */

    function parseUrl() {

        var parts = req.originalUrl.split('?');

        var url = config.protocol + options.domain + parts[0].replace('/mobile-version', '');

        if (parts[1]) {
            if (req.query.sorting && config.sorting[req.query.sorting]) {
                url += '?sorting=' + req.query.sorting;
            }
            else if (req.query.q) {
                url += '?q=' + req.query.q.replace(/[^A-zА-яЁё0-9 -]/g, '');
            }
        }

        return CP_decode.text(url);

    }

    /**
     * Set template.
     *
     * @return {String}
     */

    function setTemplate() {

        switch (level1) {
            case config.urls.movie:
                return (movie.id(level2))
                    ? 'mobile/' + movie.type(level3)
                    : 'error';
                break;
            case config.urls.year:
                return (level2)
                    ? 'mobile/category'
                    : 'mobile/categories';
                break;
            case config.urls.genre:
                return (level2)
                    ? 'mobile/category'
                    : 'mobile/categories';
                break;
            case config.urls.country:
                return (level2)
                    ? 'mobile/category'
                    : 'mobile/categories';
                break;
            case config.urls.actor:
                return (level2)
                    ? 'mobile/category'
                    : 'mobile/categories';
                break;
            case config.urls.director:
                return (level2)
                    ? 'mobile/category'
                    : 'mobile/categories';
                break;
            case config.urls.type:
                return (level2)
                    ? 'mobile/category'
                    : 'error';
                break;
            case config.urls.search:
                return (level2)
                    ? 'mobile/category'
                    : 'error';
                break;
            case modules.collections.data.url:
                if (!modules.collections.status)
                    return 'error';
                return (level2)
                    ? 'mobile/collection'
                    : 'mobile/collections';
                break;
            case null:
                return 'mobile/index';
                break;
            default:
                return 'error';
        }

    }

    /**
     * Clear string.
     *
     * @param {String} string
     * @return {String}
     */

    function clearString(string) {

        return (string) ? string.replace(/[^\w\sа-яё._-]/gi, '') : null;

    }

    /**
     * Render data.
     *
     * @param {Object} err
     * @param {Object} render
     */

    function renderData(err, render) {

        if (err) {
            console.log('[routes/website.js] Error:', url, err);

            return next({
                "status": 404,
                "message": err
            });
        }

        if (typeof render === 'object') {

            if (config.theme == 'default') {

                res.json(render);

            }
            else {

                if (template == 'sitemap')
                    res.header('Content-Type', 'application/xml');

                res.render(template, render, function(err, html) {

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
        }
        else {

            res.send(render);

        }

        console.timeEnd(url);

    }

});

module.exports = router;