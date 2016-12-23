'use strict';

/**
 * Module dependencies.
 */

var CP_blocking = require('./CP_blocking');

/**
 * Configuration dependencies.
 */

var config  = require('../config/config');
var modules = require('../config/modules');

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

    if (arguments.length == 2) {
        options = {};
        options.domain = '' + config.domain;
    }

    var code = {};
    code.head = '';
    code.player = '';
    code.footer = '';

    var d1 = new Date(movie.premiere);
    var d2 = new Date();

    var serial = {};

    var regexpEpisode = new RegExp('^s([0-9]{1,4})e([0-9]{1,4})(_([0-9]{1,3})|)$', 'ig');
    var execEpisode   = regexpEpisode.exec(type);

    if (execEpisode) {
        serial.season = execEpisode[1];
        serial.episode = execEpisode[2];
        serial.translate = execEpisode[4];
    }

    var id = 'yohoho';
    var title = movie.title + ' (' + movie.year + ')';

    if (type == 'picture') {

        code.head = '<link rel="stylesheet" href="/themes/default/public/desktop/css/ideal-image-slider.css">';

        code.footer = '<script src="/themes/default/public/desktop/js/ideal-image-slider.min.js"></script><script>new IdealImageSlider.Slider("#slider");</script>';

        var pictures = '';
        if (movie.pictures.length) {
            movie.pictures.forEach(function (picture) {
                pictures += '<img src="' + picture.picture_big + '" alt="Кадр ' + movie.title + '">';
            });
        }

        code.player = '<div id="slider">' + pictures + '</div>';

    }
    else if (type == 'trailer' || (modules.player.data.display == 'yohoho' && d1 > d2)) {

        title += ' трейлер';

        yohohoPlayer();

    }
    else {

        if (modules.abuse.status && modules.abuse.data.movies.indexOf((movie.kp_id + ''))+1) {

            code.player = '<div style="position:absolute;background:#000 url(/themes/default/public/desktop/img/player.png) 100% 100% no-repeat;z-index:9999;top:0;left:0;width:100%;height:100%;color:#fff;text-align:center"><div style="margin:80px auto 0;width:70%">' + modules.abuse.data.message + '</div></div>';

        }
        else {

            if (type == 'download') {

                id = 'yohoho-torrent';
                yohohoPlayer();

            }
            else {

                if (serial.season && serial.episode) {
                    allPlayer();
                }
                else if (modules.player.data.display == 'yohoho') {
                    yohohoPlayer();
                }
                else {
                    allPlayer();
                }

            }

            code = CP_blocking.code(code, options);

        }

    }

    /**
     * Yohoho player.
     */

    function yohohoPlayer() {

        code.player = '<div ' +
            'id="' + id + '" ' +
            'data-title="' + title + '" ' +
            'data-season="' + serial.season + '" ' +
            'data-episode="' + serial.episode + '" ' +
            'data-translate="' + serial.translate + '" ' +
            'data-single="' + modules.player.data.yohoho.show + '"></div>';
        code.footer = '<script src="https://yohoho.xyz/yo.js"></script>';

    }

    /**
     * All players.
     */

    function allPlayer() {

        code.player = '<div ' +
            'id="cinemapress-player" ' +
            'data-title="' + title + '" ' +
            'data-season="' + serial.season + '" ' +
            'data-episode="' + serial.episode + '" ' +
            'data-translate="' + serial.translate + '" ' +
            'data-single="' + modules.player.data.yohoho.show + '" ' +
            'style="width: 100%; height: 100%"></div>';
        code.footer = '<script src="/iframe.player?' +
            '&id=' + movie.kp_id +
            '&season=' + serial.season +
            '&episode=' + serial.episode +
            '&translate=' + serial.translate +
            '"></script>';

    }

    return code;

}

module.exports = {
    "code" : codePlayer
};