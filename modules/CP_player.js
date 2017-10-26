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

var request = require('request');
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
            code.player = '' +
                '<div id="yohoho" ' +
                'data-player="' + modules.player.data.yohoho.player + '" ' +
                'data-bg="' + modules.player.data.yohoho.bg + '" ' +
                'data-button="' + modules.player.data.yohoho.button + '" ' +
                'data-title="' + title + '" ' +
                'data-kinopoisk="' + movie.kp_id + '" ' +
                'data-season="' + serial.season + '" ' +
                'data-episode="' + serial.episode + '" ' +
                'data-translate="' + serial.translate + '" ' +
                'data-country="' + config.country + '" ' +
                'data-language="' + config.language + '" ' +
                'data-moonwalk="' + modules.player.data.moonwalk.token + '" ' +
                'data-start_time="' + options.start_time + '" ' +
                'data-start_episode="' + options.start_episode + '" ' +
                'data-youtube="' + modules.player.data.youtube.token + '" ' +
                'data-moonlight="' + modules.player.data.moonlight.domain + '" ' +
                'data-hdgo="' + modules.player.data.hdgo.token + '"></div>';
            code.footer = '<script data-cfasync="false" src="/iframe.player?player=' + encodeURIComponent(movie.player) + '"></script>';
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

        code.player = '' +
            '<div id="yohoho" ' +
            'data-player="' + (player || modules.player.data.yohoho.player) + '" ' +
            'data-bg="' + modules.player.data.yohoho.bg + '" ' +
            'data-button="' + modules.player.data.yohoho.button + '" ' +
            'data-title="' + title + '" ' +
            'data-kinopoisk="' + movie.kp_id + '" ' +
            'data-season="' + serial.season + '" ' +
            'data-episode="' + serial.episode + '" ' +
            'data-translate="' + serial.translate + '" ' +
            'data-country="' + config.country + '" ' +
            'data-language="' + config.language + '" ' +
            'data-moonwalk="' + modules.player.data.moonwalk.token + '" ' +
            'data-start_time="' + options.start_time + '" ' +
            'data-start_episode="' + options.start_episode + '" ' +
            'data-youtube="' + modules.player.data.youtube.token + '" ' +
            'data-moonlight="' + modules.player.data.moonlight.domain + '" ' +
            'data-hdgo="' + modules.player.data.hdgo.token + '"></div>';

        if (player) {
            code.footer = '' +
                '<script data-cfasync="false" src="//yohoho.cc/yo.js"></script>';
        }
        else {
            code.footer = '' +
                '<script data-cfasync="false" src="/iframe.player?' +
                '&id=' + movie.kp_id +
                '&season=' + serial.season +
                '&episode=' + serial.episode +
                '&translate=' + serial.translate +
                '&start_time=' + options.start_time +
                '&start_episode=' + options.start_episode + '"></script>';
        }

    }

    return code;

}

module.exports = {
    "code" : codePlayer
};