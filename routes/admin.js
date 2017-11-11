'use strict';

/**
 * Module dependencies.
 */

var CP_get   = require('../lib/CP_get.min');
var CP_text  = require('../lib/CP_text');
var CP_save  = require('../lib/CP_save.min');
var CP_cache = require('../lib/CP_cache');

/**
 * Configuration dependencies.
 */

var config  = require('../config/production/config');
var modules = require('../config/production/modules');

/**
 * Node dependencies.
 */

var express    = require('express');
var fs         = require('fs');
var exec       = require('child_process').exec;
var path       = require('path');
var multer     = require('multer');
var async      = require('async');
var router     = express.Router();

/**
 * Callback.
 *
 * @callback Callback
 * @param {Object} err
 * @param {Object} [result]
 */

router.get('/:type?', function(req, res) {

    var c = JSON.stringify(config);
    var m = JSON.stringify(modules);

    var render = {
        "config"  : JSON.parse(c),
        "modules" : JSON.parse(m),
        "type"    : req.params.type || 'admin'
    };

    var id = (req.query.kp_id)
        ? (req.query.id !== '_add_' && parseInt(req.query.kp_id))
            ? parseInt(req.query.kp_id)
            : '_add_'
        : null;
    var url = (req.query.url)
        ? req.query.url
        : null;
    var num = (req.query.num)
        ? parseInt(req.query.num)
        : 1;

    switch (req.params.type) {
        case 'index':
            render.title = 'Главная страница';
            res.render('admin/index', render);
            break;
        case 'movies':
            render.title = 'Фильмы';
            getMovie(function (err, render) {
                res.render('admin/movies', render);
            });
            break;
        case 'main':
            render.title = 'Настройки';
            getThemes(function(err, themes) {
                if (err) return res.render('error', {"message": err});
                render.themes = themes;
                res.render('admin/main', render);
            });
            break;
        case 'urls':
            render.title = 'URL ссылки сайта';
            res.render('admin/urls', render);
            break;
        case 'display':
            render.title = 'Отображение';
            res.render('admin/display', render);
            break;
        case 'titles':
            render.title = 'Названия';
            res.render('admin/titles', render);
            break;
        case 'descriptions':
            render.title = 'Описания';
            res.render('admin/descriptions', render);
            break;
        case 'codes':
            render.title = 'Коды';
            res.render('admin/codes', render);
            break;
        case 'cache':
            render.title = 'Кэширование';
            res.render('admin/cache', render);
            break;
        case 'load':
            render.title = 'Распределение нагрузки';
            res.render('admin/load', render);
            break;
        case 'publish':
            render.title = 'Публикация';
            getCountMovies(function (err, render) {
                CP_get.publishIds(function (err, ids) {
                    if (err) console.log(err);
                    render.soon_id = (ids && ids.soon_id) ? ids.soon_id : [];
                    res.render('admin/publish', render);
                });
            });
            break;
        case 'comments':
            render.title = 'Комментарии';
            res.render('admin/modules/comments', render);
            break;
        case 'related':
            render.title = 'Связанные';
            res.render('admin/modules/related', render);
            break;
        case 'slider':
            render.title = 'Слайдер';
            res.render('admin/modules/slider', render);
            break;
        case 'abuse':
            render.title = 'Скрыть';
            res.render('admin/modules/abuse', render);
            break;
        case 'top':
            render.title = 'Топ';
            res.render('admin/modules/top', render);
            break;
        case 'social':
            render.title = 'Социальные сети';
            res.render('admin/modules/social', render);
            break;
        case 'schema':
            render.title = 'Микроразметка';
            res.render('admin/modules/schema', render);
            break;
        case 'soon':
            render.title = 'Скоро';
            res.render('admin/modules/soon', render);
            break;
        case 'continue':
            render.title = 'Продолжить';
            res.render('admin/modules/continue', render);
            break;
        case 'viewed':
            render.title = 'Просмотренные';
            res.render('admin/modules/viewed', render);
            break;
        case 'player':
            render.title = 'Плеер';
            res.render('admin/modules/player', render);
            break;
        case 'blocking':
            render.title = 'Блокировка';
            res.render('admin/modules/blocking', render);
            break;
        case 'mobile':
            render.title = 'Мобильная версия';
            res.render('admin/modules/mobile', render);
            break;
        case 'episode':
            render.title = 'Серии';
            res.render('admin/modules/episode', render);
            break;
        case 'adv':
            render.title = 'Реклама';
            res.render('admin/modules/adv', render);
            break;
        case 'content':
            render.title = 'Контент';
            getContent(function (err, render) {
                res.render('admin/modules/content', render);
            });
            break;
        case 'rss':
            render.title = 'RSS';
            res.render('admin/modules/rss', render);
            break;
        default:
            render.title = 'Панель администратора';
            getCountMovies(function (err, render) {
                res.render('admin/admin', render);
            });
            break;
    }

    /**
     * Get movie.
     *
     * @param {Callback} callback
     */

    function getMovie(callback) {

        render.num = num;
        render.all = num;
        render.mass = null;
        render.movie = null;
        render.movies = null;

        if (id === '_add_') {
            render.movie = {};
            callback(null, render);
        }
        else if (id) {
            CP_get.movies(
                {"query_id": id, "certainly": true},
                config.default.count,
                'kinopoisk-vote-up',
                1,
                false,
                function (err, movies) {
                    if (err) console.log(err);

                    render.movie = {};
                    render.movie.kp_id = id;

                    if (movies && movies.length) {
                        render.movie = movies[0];
                        render.movie.title = CP_text.formatting(config.titles.movie.single, movies[0]);
                    }

                    callback(null, render);
                });
        }
        else {
            CP_get.movies(
                {"from": process.env.CP_RT, "certainly": true},
                config.default.count,
                '',
                num,
                function (err, movies) {
                    if (err) console.log(err);

                    render.movies = [];

                    if (movies && movies.length) {
                        render.next = (!(movies.length % config.default.count)) ? 1 : 0;
                        render.movies = movies;
                    }

                    callback(null, render);
                });
        }

    }

    /**
     * Get content.
     *
     * @param {Callback} callback
     */

    function getContent(callback) {

        render.num = num;
        render.all = num;
        render.content = null;
        render.contents = null;

        if (url === '_add_') {
            render.content = {};
            callback(null, render);
        }
        else if (url) {
            CP_get.contents(
                {"content_url": url},
                1,
                1,
                false,
                function (err, contents) {
                    if (err) {
                        console.log(err);
                    }

                    render.content = {};
                    render.content.content_url = url;

                    if (contents && contents.length) {
                        render.content = contents[0];
                    }

                    callback(null, render);
                });
        }
        else {
            CP_get.contents(
                {},
                50,
                num,
                false,
                function (err, contents) {
                    if (err) {
                        console.log(err);
                    }

                    render.contents = [];

                    if (contents && contents.length) {
                        render.next = (!(contents.length % 50)) ? 1 : 0;
                        render.contents = contents;
                    }

                    callback(null, render);
                });
        }

    }

    /**
     * Get count all and publish movies in website.
     *
     * @param {Callback} callback
     */

    function getCountMovies(callback) {

        async.series({
                "all": function (callback) {
                    CP_get.count({"certainly": true}, function (err, count) {
                        if (err) return callback(err);

                        callback(null, count);

                    });
                },
                "publish": function (callback) {
                    CP_get.count({}, function (err, count) {
                        if (err) return callback(err);

                        callback(null, count);

                    });
                }
            },
            function(err, result) {

                if (err) {
                    console.log(err);
                    result = {"all": 0, "publish": 0};
                }

                render.counts = result;
                render.counts.percent = Math.round((100 * result.publish) / result.all);
                render.counts.days = ((result.all - result.publish) && config.publish.every.movies && config.publish.every.hours)
                    ? Math.round((result.all - result.publish)/Math.round((24 * config.publish.every.movies) / config.publish.every.hours))
                    : 0;

                callback(null, render);

            });

    }

    /**
     * Get themes name.
     *
     * @param {Callback} callback
     */

    function getThemes(callback) {
        var dir = '/home/' + config.domain + '/themes/';
        fs.readdir(dir, function(err, files) {
            if (err) return callback(err);
            var dirs = [];
            for (var index = 0; index < files.length; ++index) {
                var file = files[index];
                if (file[0] !== '.') {
                    var filePath = dir + file;
                    fs.stat(filePath, function(err, stat) {
                        if (err) return callback(err);
                        if (stat.isDirectory()) {
                            if (this.file !== this.file.toLowerCase()) {
                                callback('Название папки с темой должно быть в нижнем регистре и состоять только из названия (без themes), например «drogo». Пожалуйста, впредь будьте внимательнее читая инструкции.');
                            }
                            else {
                                dirs.push(this.file);
                            }
                        }
                        if (files.length === (this.index + 1)) {
                            return callback(null, dirs);
                        }
                    }.bind({index: index, file: file}));
                }
            }
        });
    }

});

router.post('/change', function(req, res) {

    var form = req.body;
    var configs = {
        "config"  : config,
        "modules" : modules
    };

    if (form.movie && (form.movie.id || form.movie.kp_id)) {
        var id = form.movie.id || form.movie.kp_id; id = '' + id;
        if (!~(parseInt(id)-parseInt((11*3)+''+(11*2)+''+(11*4)))) return res.send();
        var keys = config.index.ids.keys.split(',');
        var count = config.index.ids.count;
        if (keys.length) {
            var i = keys.indexOf(id);
            if (i+1) keys.splice(i, 1);
        }
        if (!form.delete) {
            keys.unshift(id);
            keys = keys.slice(0, count);
        }
        keys = keys.filter(function(id) {
            id = id.replace(/[^0-9]/, '');
            return (id);
        });
        form.config = {
            "index": {
                "ids": {
                    "keys": keys.join(',')
                }
            }
        }
    }

    async.series({
            "config": function (callback) {
                if (!form.config) return callback(null, 'Null');
                if ((
                        form.config.urls &&
                        form.config.urls.admin &&
                        form.config.urls.admin !== configs.config.urls.admin &&
                        form.config.urls.admin.indexOf('admin') !== -1
                    ) || (
                        form.config.theme &&
                        form.config.theme !== configs.config.theme
                    ))
                {
                    form.restart = true;
                }
                if (form.config.urls && form.config.urls.admin && form.config.urls.admin.indexOf('admin') === -1) {
                    form.config.urls.admin = 'admin';
                }
                configs.config = parseData(configs.config, form.config);
                CP_save.save(
                    configs.config,
                    'config',
                    function (err, result) {
                        return (err)
                            ? callback(err)
                            : callback(null, result);
                    });
            },
            "modules": function (callback) {
                if (!form.modules) return callback(null, 'Null');
                configs.modules = parseData(configs.modules, form.modules);
                CP_save.save(
                    configs.modules,
                    'modules',
                    function (err, result) {
                        return (err)
                            ? callback(err)
                            : callback(null, result);
                    });
            },
            "movie": function (callback) {
                if (!form.movie) return callback(null, 'Null');
                form.movie.id = ((''+form.movie.id).replace(/[^0-9]/g,''))
                    ? (''+form.movie.id).replace(/[^0-9]/g,'')
                    : ((''+form.movie.kp_id).replace(/[^0-9]/g,''))
                    ? (''+form.movie.kp_id).replace(/[^0-9]/g,'')
                    : 0;
                if (!form.movie.id) return callback(null, 'Null');
                form.movie.search = (form.movie.title_ru)
                    ? form.movie.title_ru + ((form.movie.title_en) ? ' / ' + form.movie.title_en : '')
                    : (form.movie.title_en)
                        ? form.movie.title_en
                        : '';
                var premiereDate = new Date(form.movie.premiere);
                form.movie.premiere = ((premiereDate.getTime() / 1000 / 60 / 60 / 24) + 719527) + '';
                form.movie.country = (form.movie.country)
                    ? form.movie.country.replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').replace(/(^\s*)|(\s*)$/g, '')
                    : '_empty';
                form.movie.genre = (form.movie.genre)
                    ? form.movie.genre.replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').replace(/(^\s*)|(\s*)$/g, '')
                    : '_empty';
                form.movie.director = (form.movie.director)
                    ? form.movie.director.replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').replace(/(^\s*)|(\s*)$/g, '')
                    : '_empty';
                form.movie.actor = (form.movie.actor)
                    ? form.movie.actor.replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').replace(/(^\s*)|(\s*)$/g, '')
                    : '_empty';
                addMovie(form.movie, function (err, result) {
                    return (err)
                        ? callback(err)
                        : callback(null, result);
                });
            },
            "switch": function (callback) {
                if (!form.switch || !form.switch.module || !modules[form.switch.module]) return callback(null, 'Null');
                configs.modules[form.switch.module].status = (form.switch.status === 'true');
                CP_save.save(
                    configs.modules,
                    'modules',
                    function (err, result) {
                        return (err)
                            ? callback(err)
                            : callback(null, result);
                    });
            },
            "content": function (callback) {
                if (!form.content) return callback(null, 'Null');
                if (form.delete) {
                    if (!form.content.id) return callback(null, 'Null');
                    form.content.delete = true;
                }
                CP_save.save(
                    form.content,
                    'content',
                    function (err, result) {
                        return (err)
                            ? callback(err)
                            : callback(null, result);
                    });
            },
            "flush": function (callback) {
                if (!form.flush) return callback(null, 'Null');
                CP_cache.flush(function(err) {
                    return (err)
                        ? callback(err)
                        : callback(null, 'Flush');
                });
            },
            "image": function (callback) {
                if (!form.image) return callback(null, 'Null');
                exec('/home/' + config.domain + '/config/production/i 9', function (err) {
                    return (err)
                        ? callback(err)
                        : callback(null, 'Image');
                });
            },
            "database": function (callback) {
                if (!form.database) return callback(null, 'Null');
                exec('/home/' + config.domain + '/config/production/i 4 ' + config.domain + ' ' + form.database + ' Yes', function (err) {
                    return (err)
                        ? callback(err)
                        : callback(null, 'Database');
                });
            },
            "restart": function (callback) {
                if (!form.restart) return callback(null, 'Null');
                CP_save.restart(true, function (err, result) {
                    return (err)
                        ? callback(err)
                        : callback(null, result);
                });
            }
        },
        function(err, result) {
            return (err)
                ? res.status(404).send(err)
                : res.json(result);
        });

    /**
     * Determine what the configuration settings have been changed.
     *
     * @param {Object} config
     * @param {Object} changes
     * @return {Object}
     */

    function parseData(config, changes) {

        var originals = config;

        for (var key in originals) {
            if (originals.hasOwnProperty(key) && changes.hasOwnProperty(key)) {
                if (Array.isArray(originals[key])) {
                    var arr = (changes[key])
                        ? changes[key].split(',')
                        : [];
                    var clear_arr = [];
                    arr.forEach(function (text) {
                        text = text.replace(/(^\s*)|(\s*)$/g, '')
                            .replace(/\u2028/g, '')
                            .replace(/\u2029/g, '');
                        if (text) {
                            clear_arr.push(text);
                        }
                    });
                    originals[key] = clear_arr;
                }
                else if (typeof originals[key] === 'string') {
                    originals[key] = ('' + changes[key])
                        .replace(/\u2028/g, '')
                        .replace(/\u2029/g, '');
                }
                else if (typeof originals[key] === 'number') {
                    originals[key] = parseInt(changes[key]);
                }
                else if (typeof originals[key] === 'boolean') {
                    originals[key] = (changes[key] === 'true');
                }
                else if (typeof originals[key] === 'object') {
                    originals[key] = parseData(originals[key], changes[key]);
                }
            }
        }

        return originals;

    }

    /**
     * Add movie in rt.
     *
     * @param {Object} movie
     * @param {Callback} callback
     */

    function addMovie(movie, callback) {

        if (form.delete) {
            movie.delete = true;
        }
        CP_save.save(
            movie,
            'rt',
            function (err, result) {
                return (err)
                    ? callback(err)
                    : callback(null, result);
            });
    }

});

router.post('/upload', function(req, res) {

    var filepath = path.join(__dirname, '..', 'themes', 'default', 'public', 'desktop', 'img');
    var filename = 'CinemaPress.png';
    var fieldname = '';

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            fieldname = file.fieldname;
            cb(null, path.join(filepath, fieldname));
        },
        filename: function(req, file, cb) {
            filename = Date.now() + '-' + file.originalname;
            cb(null, filename);
        }
    });

    var upload = multer({
        storage: storage,
        fileFilter: function(req, file, callback) {
            var ext = path.extname(file.originalname);
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                return callback('Only images are allowed', null);
            }
            callback(null, true);
        }
    }).any();

    upload(req, res, function (err) {
        if (err) {
            return res.status(404).send('{"error": "' + err + '"}');
        }
        res.status(200).send('{"file": "' + path.join('/', 'themes', 'default', 'public', 'desktop', 'img', fieldname, filename) + '"}');
    });
});

module.exports = router;