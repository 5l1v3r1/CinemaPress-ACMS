'use strict';

/**
 * Module dependencies.
 */

var CP_cache    = require('../lib/CP_cache');
var CP_cachep2p = require('../lib/CP_cachep2p');
var CP_decode   = require('../lib/CP_decode');
var CP_translit = require('../lib/CP_translit');

/**
 * Configuration dependencies.
 */

var config  = require('../config/production/config');
var modules = require('../config/production/modules');

/**
 * Node dependencies.
 */

var cheerio = require('cheerio');
var crypto  = require('crypto');
var minify  = require('html-minifier').minify;
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

var content = require('./paths/content');

/**
 * Callback.
 *
 * @callback Callback
 * @param {Object} err
 * @param {Object} [render]
 */

router.get('/:level1?/:level2?/:level3?/:level4?', function (req, res, next) {

    // -----------------------------------------------------------------
    // Detection of the mobile device and a redirect to the mobile site.
    // -----------------------------------------------------------------

    var ua = (req.get('user-agent')) ? req.get('user-agent').toLowerCase() : '';
    var mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4));

    if (modules.mobile.status && mobile && !req.cookies.CP_desktop) {
        var redirect = config.protocol + 'm.' + config.domain + req.originalUrl;
        return res.redirect(302, redirect);
    }

    // -----------------------------------------------------------------

    var options = {};
    options.domain = '' + config.domain;
    options.sub = req.cookies.CP_sub || '';

    if (modules.adv.status || modules.blocking.status) {
        options.userinfo = {};
        options.userinfo.device = 'desktop';
        if (parseInt(modules.adv.data.target) || (modules.blocking.data.display === 'legal' && modules.blocking.data.legal.countries)) {
            var lookup = maxmind.openSync('/home/' + config.domain + '/files/GeoLite2-City.mmdb', {
                cache: {
                    max: 1000,
                    maxAge: 1000 * 60 * 60 * 60 * 24
                }
            });
            var info = lookup.get(req.ip);
            var user = parser(req.headers['user-agent']);
            options.userinfo.ip = (req.ip)
                ? req.ip
                : '';
            options.userinfo.country = (info.country && info.country.names && info.country.names.ru)
                ? info.country.names.ru
                : '';
            options.userinfo.city = (info.city && info.city.names && info.city.names.ru)
                ? info.city.names.ru
                : '';
            options.userinfo.browser = (user.browser && user.browser.name)
                ? user.browser.name
                : '';
            options.userinfo.os = (user.os && user.os.name)
                ? user.os.name
                : '';
            options.userinfo.type = (user.device && user.device.type)
                ? user.device.type
                : '';
            options.userinfo.vendor = (user.device && user.device.vendor)
                ? user.device.vendor
                : '';
            options.userinfo.model = (user.device && user.device.model)
                ? user.device.model
                : '';
        }
    }

    var url = parseUrl();
    var urlHash = md5(JSON.stringify(options) + url.toLowerCase());

    var level1  = clearString(req.params.level1) || null;
    var level2  = clearString(req.query.q)       || clearString(CP_translit.text(req.params.level2, true)) || null;
    var level3  = clearString(req.params.level3) || null;
    var sorting = clearString(req.query.sorting) || config.default.sorting;
    var tag     = clearString(req.query.tag)     || null;

    var development = process.env.NODE_ENV !== 'production';

    if (development) {
        console.time(url);
    }

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
            case 'movie':
                movie.data(
                    movie.id(level2),
                    'movie',
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url === render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'online':
                movie.data(
                    movie.id(level2),
                    'online',
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url === render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'download':
                movie.data(
                    movie.id(level2),
                    'download',
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url === render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'trailer':
                movie.data(
                    movie.id(level2),
                    'trailer',
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url === render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'picture':
                movie.data(
                    movie.id(level2),
                    'picture',
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url === render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'episode':
                movie.data(
                    movie.id(level2),
                    level3,
                    options,
                    function (err, render) {
                        if (err) {
                            callback(err);
                        }
                        else if (url === render.page.url) {
                            callback(null, render);
                        }
                        else {
                            return res.redirect(301, render.page.url);
                        }
                    });
                break;
            case 'category':
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
            case 'categories':
                category.all(
                    level1,
                    options,
                    function (err, render) {
                        callback(err, render);
                    });
                break;
            case 'content':
                template = 'category';
                content.one(
                    level2,
                    parseInt(level3),
                    sorting,
                    options,
                    function (err, render) {
                        callback(err, render);
                    });
                break;
            case 'contents':
                template = 'categories';
                content.all(
                    tag,
                    options,
                    function (err, render) {
                        callback(err, render);
                    });
                break;
            case 'desktop/sitemap':
                return (level2)
                    ? sitemap.one(
                    level2,
                    level3,
                    function (err, render) {
                        callback(err, render);
                    })
                    : sitemap.all(
                    function (err, render) {
                        callback(err, render);
                    });
                break;
            case 'index':
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

        var url = config.protocol + options.domain + parts[0];

        if (parts[1]) {
            if (req.query.sorting && config.sorting[req.query.sorting]) {
                url += '?sorting=' + req.query.sorting;
            }
            else if (req.query.q) {
                url += '?q=' + req.query.q.replace(/[^A-zА-яЁё0-9 \-]/g, '');
            }
            else if (req.query.tag) {
                url += '?tag=' + req.query.tag.replace(/[^A-zА-яЁё0-9 \-]/g, '');
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
                    ? movie.type(level3)
                    : 'error';
                break;
            case config.urls.year:
                return (level2)
                    ? 'category'
                    : 'categories';
                break;
            case config.urls.genre:
                return (level2)
                    ? 'category'
                    : 'categories';
                break;
            case config.urls.country:
                return (level2)
                    ? 'category'
                    : 'categories';
                break;
            case config.urls.actor:
                return (level2)
                    ? 'category'
                    : 'categories';
                break;
            case config.urls.director:
                return (level2)
                    ? 'category'
                    : 'categories';
                break;
            case config.urls.type:
                return (level2)
                    ? 'category'
                    : 'error';
                break;
            case config.urls.search:
                return (level2)
                    ? 'category'
                    : 'error';
                break;
            case config.urls.sitemap:
                return 'desktop/sitemap';
                break;
            case modules.content.data.url:
                if (!modules.content.status)
                    return 'error';
                return (level2)
                    ? 'content'
                    : 'contents';
                break;
            case null:
                return 'index';
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

            if (config.theme === 'default') {

                res.json(render);

            }
            else {

                if (template === 'desktop/sitemap') {
                    res.header('Content-Type', 'application/xml');
                }

                res.render(template, render, function(err, html) {

                    if (err) console.log('[renderData] Render Error:', err);

                    if (template !== 'desktop/sitemap' && (config.cache.time || config.cache.p2p)) {
                        html = minify(html, {
                            removeComments: true,
                            removeCommentsFromCDATA: true,
                            collapseWhitespace: true,
                            collapseBooleanAttributes: true,
                            removeRedundantAttributes: true,
                            useShortDoctype: true,
                            removeAttributeQuotes: true,
                            removeEmptyAttributes: true,
                            minifyCSS: true,
                            minifyJS: true
                        });
                    }

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
                    if (config.cache.p2p && html) {
                        var $ = cheerio.load(html);
                        CP_cachep2p.set(
                            url,
                            crypto.createHash('sha1').update($('html').html()).digest('hex')
                        );
                    }

                });

            }
        }
        else {

            res.send(render);

        }

        if (development) {
            console.timeEnd(url);
        }

    }

});

module.exports = router;