'use strict';

/**
 * Module dependencies.
 */

var CP_blocking = require('./CP_blocking');

/**
 * Configuration dependencies.
 */

var config  = require('../config/production/config');
var modules = require('../config/production/modules');

/**
 * Node dependencies.
 */

var async   = require('async');

/**
 * Adding a page player.
 *
 * @param {String} type
 * @param {Object} movie
 * @param {Object} [options]
 * @return {Object}
 */

function codePlayer(type, movie, options) {

    if (arguments.length === 2) {
        options = {};
        options.domain = '' + config.domain;
    }

    var code = {};
    code.head = '';
    code.player = '';
    code.footer = '';

    var serial = {};
    serial.season = '';
    serial.episode = '';
    serial.translate = '';

    var regexpEpisode = new RegExp('^s([0-9]{1,4})e([0-9]{1,4})(_([0-9]{1,3})|)$', 'ig');
    var execEpisode = regexpEpisode.exec(type);
    if (execEpisode) {
        serial.season = execEpisode[1];
        serial.episode = execEpisode[2];
        serial.translate = execEpisode[4];
    }

    var title = encodeURIComponent(movie.title_full);

    if (type === 'picture') {

        var pictures = '';

        if (movie.pictures.length) {
            movie.pictures.forEach(function (picture) {
                pictures += '<img src="' + picture.picture_big + '" alt="Кадр ' + movie.title + '">';
            });
        }
        else {
            pictures += '<img src="' + config.default.image + '" alt="Кадр ' + movie.title + '">';
        }

        code.head = '' +
            '<link rel="stylesheet" href="/themes/default/public/desktop/css/ideal-image-slider.css">';

        code.player = '' +
            '<div id="slider" class="img_tmhover">' + pictures + '</div>';

        code.footer = '' +
            '<script src="/themes/default/public/desktop/js/ideal-image-slider.min.js"></script>' +
            '<script>var sldr = new IdealImageSlider.Slider("#slider");sldr.start();</script>';

    }
    else if (type === 'trailer') {

        yohohoPlayer('trailer');

    }
    else {

        if (modules.abuse.status && modules.abuse.data.movies.indexOf('' + movie.kp_id)+1) {

            code.player = '' +
                '<div style="position:absolute;background:#000 url(' + config.default.image + ') 100% 100% no-repeat;z-index:9999;top:0;left:0;width:100%;height:100%;color:#fff;text-align:center">' +
                '<div style="margin:80px auto 0;width:70%">' + modules.abuse.data.message + '</div>' +
                '</div>';

            return code;

        }

        if (type === 'download') {
            yohohoPlayer('torrent');
        }
        else if (serial.season && serial.episode) {
            yohohoPlayer();
        }
        else if (movie.player) {
            yohohoPlayer();
        }
        else if (modules.player.data.display === 'yohoho') {
            yohohoPlayer(modules.player.data.yohoho.player);
        }
        else {
            yohohoPlayer();
        }

        code = CP_blocking.code(code, movie, options);

    }

    /**
     * Yohoho player.
     */

    function yohohoPlayer(player) {

        var data = {};

        data.player = (player)
            ? player
            : (modules.player.data.yohoho.player)
                ? modules.player.data.yohoho.player
                : '';
        data.bg = (modules.player.data.yohoho.bg)
            ? modules.player.data.yohoho.bg
            : '';
        data.button = (modules.player.data.yohoho.button)
            ? modules.player.data.yohoho.button
            : '';
        data.title = (title)
            ? title
            : '';
        data.kinopoisk = (movie.kp_id)
            ? movie.kp_id
            : '';
        data.season = (serial.season)
            ? serial.season
            : '';
        data.episode = (serial.episode)
            ? serial.episode
            : '';
        data.translate = (serial.translate)
            ? serial.translate
            : '';
        data.country = (config.country)
            ? config.country
            : '';
        data.language = (config.language)
            ? config.language
            : '';
        data.moonwalk = (modules.player.data.moonwalk.token)
            ? modules.player.data.moonwalk.token
            : '';
        data.hdgo = (modules.player.data.hdgo.token)
            ? modules.player.data.hdgo.token
            : '';
        data.youtube = (modules.player.data.youtube.token)
            ? modules.player.data.youtube.token
            : '';
        data.start_time = (options.start_time)
            ? options.start_time
            : '';
        data.start_episode = (options.start_episode)
            ? options.start_episode
            : '';
        data.moonlight = (modules.player.data.moonlight.domain)
            ? modules.player.data.moonlight.domain
            : '';

        var div = '';
        for (var data_key in data) {
            if (data.hasOwnProperty(data_key) && data[data_key]) {
                data[data_key] = (''+data[data_key]).trim();
                div += ' data-' + data_key + '="' + encodeURIComponent(data[data_key]) + '"';
            }
        }

        var param = {};

        param.id = (movie.kp_id)
            ? movie.kp_id
            : '';
        param.season = (serial.season)
            ? serial.season
            : '';
        param.episode = (serial.episode)
            ? serial.episode
            : '';
        param.translate = (serial.translate)
            ? serial.translate
            : '';
        param.start_time = (options.start_time)
            ? options.start_time
            : '';
        param.start_episode = (options.start_episode)
            ? options.start_episode
            : '';
        param.player = (movie.player)
            ? movie.player
            : '';

        var script = '';
        for (var param_key in param) {
            if (param.hasOwnProperty(param_key) && param[param_key]) {
                param[param_key] = (''+param[param_key]).trim();
                script += '&' + param_key + '=' + encodeURIComponent(param[param_key]);
            }
        }

        code.player = '' +
            '<div id="yohoho" ' + div + '></div>';

        if (player) {
            code.footer = '' +
                '<script data-cfasync="false" src="//yohoho.cc/yo.js"></script>';
        }
        else {
            code.footer = '' +
                '<script data-cfasync="false" src="/iframe.player?' + script + '"></script>';
        }

    }

    return code;

}

module.exports = {
    "code" : codePlayer
};