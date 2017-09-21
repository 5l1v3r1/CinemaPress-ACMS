'use strict';

/**
 * Configuration dependencies.
 */

var config  = require('../config/production/config');
var modules = require('../config/production/modules');

/**
 * Node dependencies.
 */

var async   = require('async');
var request = require('request');
var express = require('express');
var router  = express.Router();

/**
 * Player.
 */

router.get('/?', function(req, res) {

    var id        = (parseInt(req.query.id))        ? parseInt(req.query.id)        : 0;
    var season    = (parseInt(req.query.season))    ? parseInt(req.query.season)    : 0;
    var episode   = (parseInt(req.query.episode))   ? parseInt(req.query.episode)   : 0;
    var translate = (parseInt(req.query.translate)) ? parseInt(req.query.translate) : null;

    var script = 'function player(){var a=document.querySelector("#yohoho");if(!a)return!1;var b,c,d;b=document.createElement("iframe"),b.setAttribute("id","player-iframe"),b.setAttribute("frameborder","0"),b.setAttribute("allowfullscreen","allowfullscreen"),b.setAttribute("src","iframe-src"),a.appendChild(b),c=parseInt(a.offsetWidth)?parseInt(a.offsetWidth):parseInt(a.parentNode.offsetWidth)?a.parentNode.offsetWidth:610,d=parseInt(a.offsetHeight)&&c/3<parseInt(a.offsetHeight)?parseInt(a.offsetHeight):parseInt(a.parentNode.offsetHeight)&&c/3<parseInt(a.parentNode.offsetHeight)?parseInt(a.parentNode.offsetHeight):c/2;var e="width:"+c+"px;height:"+d+"px";b.setAttribute("style",e),b.setAttribute("width",c),b.setAttribute("height",d),a.setAttribute("style",e)}document.addEventListener("DOMContentLoaded",player);';

    if (req.query.player) {
        res.setHeader('Content-Type', 'application/javascript');
        return res.send(script.replace('iframe-src', req.query.player));
    }

    if (!/googlebot|crawler|spider|robot|crawling|bot/i.test(req.get('User-Agent'))) {

        async.parallel({
                "moonwalk": function (callback) {
                    if (modules.player.data.moonwalk.token) {
                        getMoonwalk(function(result) {
                            callback(null, result);
                        });
                    }
                    else {
                        callback(null, '');
                    }
                },
                "hdgo": function (callback) {
                    if (modules.player.data.hdgo.token) {
                        getHdgo(function(result) {
                            callback(null, result);
                        });
                    }
                    else {
                        callback(null, '');
                    }
                },
                "iframe": function (callback) {
                    if (modules.player.data.iframe.show) {
                        getIframe(function(result) {
                            callback(null, result);
                        });
                    }
                    else {
                        callback(null, '');
                    }
                },
                "kodik": function (callback) {
                    if (modules.player.data.kodik.show) {
                        getKodik(function(result) {
                            callback(null, result);
                        });
                    }
                    else {
                        callback(null, '');
                    }
                },
                "yohoho": function (callback) {
                    if (modules.player.data.yohoho.player) {
                        getYohoho(function (result) {
                            callback(null, result);
                        });
                    }
                    else {
                        callback(null, '');
                    }
                }
            },
            function(err, result) {

                if (err) {
                    return res.send(err);
                }

                if (modules.episode.status && season && result['moonwalk']) {
                    script = script.replace('iframe-src', result['moonwalk']);
                }
                else if (result[modules.player.data.display]) {
                    if (modules.player.data.display === 'yohoho') {
                        script = result['yohoho'];
                    }
                    else {
                        script = script.replace('iframe-src', result[modules.player.data.display]);
                    }
                }
                else if (result['moonwalk']) {
                    script = script.replace('iframe-src', result['moonwalk']);
                }
                else if (result['hdgo']) {
                    script = script.replace('iframe-src', result['hdgo']);
                }
                else if (result['iframe']) {
                    script = script.replace('iframe-src', result['iframe']);
                }
                else if (result['kodik']) {
                    script = script.replace('iframe-src', result['kodik']);
                }
                else if (result['yohoho']) {
                    script = result['yohoho'];
                }
                else {
                    script = '';
                }

                res.setHeader('Content-Type', 'application/javascript');
                res.send(script);

            });

    }
    else {

        res.setHeader('Content-Type', 'application/javascript');
        res.send('console.log(\'Hello CinemaPress!\');');

    }

    /**
     * Get Moonwalk player.
     */

    function getMoonwalk(callback) {

        api('http://moonwalk.cc/api/videos.json?' +
            'api_token=' + modules.player.data.moonwalk.token.trim() + '&' +
            'kinopoisk_id=' + id,
            function (json) {
                var iframe = '';
                if (json && !json.error && json.length) {
                    var iframe_url = '';
                    var added = 0;
                    for (var i = 0; i < json.length; i++) {
                        if (season && episode && translate === json[i].translator_id) {
                            iframe_url = getMoonlight(json[i].iframe_url) + '?season=' + season + '&episode=' + episode;
                            break;
                        }
                        else {
                            var d = json[i].added_at || json[i].last_episode_time || 0;
                            var publish = (new Date(d).getTime()/1000);
                            if (publish >= added) {
                                iframe_url = getMoonlight(json[i].iframe_url);
                                added = publish;
                            }
                        }
                    }
                    iframe = iframe_url;
                }
                callback(iframe);
            });

        function getMoonlight(iframe_url) {
            var pat = /\/[a-z]{1,20}\/[a-z0-9]{1,40}\/iframe/i;
            var str = pat.exec(iframe_url);
            if (str && str[0]) {
                if (modules.player.data.moonlight.domain) {
                    var domain = modules.player.data.moonlight.domain;
                    domain = (domain[domain.length-1] === '/')
                        ? domain.slice(0, -1)
                        : domain;
                    domain = (domain.indexOf('://') === -1)
                        ? config.protocol + domain
                        : domain;
                    iframe_url = domain + str[0];
                }
                else {
                    iframe_url = 'https://streamguard.cc' + str[0];
                }
            }
            return iframe_url;
        }

    }

    /**
     * Get HDGO player.
     */

    function getHdgo(callback) {

        api('http://hdgo.cc/api/video.json?' +
            'token=' + modules.player.data.hdgo.token.trim() + '&' +
            'kinopoisk_id=' + id,
            function (json) {
                var iframe_url = '';
                if (json && !json.error && json.length && json[0].iframe_url) {
                    iframe_url = json[0].iframe_url.replace('.cc', '.cx').replace('http:', 'https:');
                }
                callback(iframe_url);
            });

    }

    /**
     * Get Iframe player.
     */

    function getIframe(callback) {

        var iframe = '';
        async.waterfall([
            function(callback) {
                api('http://iframe.video/api/v1/movies/&' +
                    'kp_id=' + id,
                    function (json) {
                        if (json && json.total && parseInt(json.total) && json.results) {
                            var key = Object.keys(json.results)[0];
                            if (parseInt(json.results[key].kp_id) === id) {
                                iframe = json.results[key].path;
                            }
                        }
                        callback(null, iframe);
                    });
            },
            function(iframe, callback) {
                if (iframe) {
                    return callback(null, iframe);
                }
                api('http://iframe.video/api/v1/tv-series/&' +
                    'kp_id=' + id,
                    function (json) {
                        if (json && json.total && parseInt(json.total) && json.results) {
                            var key = Object.keys(json.results)[0];
                            if (parseInt(json.results[key].kp_id) === id) {
                                iframe = json.results[key].path;
                            }
                        }
                        callback(null, iframe);
                    });
            },
            function(iframe, callback) {
                if (iframe) {
                    return callback(null, iframe);
                }
                api('http://iframe.video/api/v1/tv/&' +
                    'kp_id=' + id,
                    function (json) {
                        if (json && json.total && parseInt(json.total) && json.results) {
                            var key = Object.keys(json.results)[0];
                            if (parseInt(json.results[key].kp_id) === id) {
                                iframe = json.results[key].path;
                            }
                        }
                        callback(null, iframe);
                    });
            }
        ], function (err, iframe) {
            callback(iframe);
        });

    }

    /**
     * Get Kodik player.
     */

    function getKodik(callback) {

        api('http://kodik.cc/api.js?' +
            'kp_id=' + id,
            function (json, body) {
                var iframe_url = '';
                var matches = /(\/\/kodik\.cc\/[a-z]{1,10}\/[0-9]{1,7}\/[a-z0-9]{5,50}\/[a-z0-9]{1,10})/i.exec(body);
                if (matches && matches[1]) {
                    iframe_url = matches[1];
                }
                callback(iframe_url);
            });

    }

    /**
     * Get Yohoho player.
     */

    function getYohoho(callback) {

        api('https://yohoho.cc/yo.js',
            function (json, body) {
                callback(body);
            });

    }

    /**
     * Request.
     */

    function api(url, callback) {
        request({url: url, timeout: 1500}, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var json = tryParseJSON(body);
                callback(json, body);
            }
            else {
                callback(null, '');
            }
        });
    }

    /**
     * Valid JSON.
     */

    function tryParseJSON(jsonString) {
        try {
            var o = JSON.parse(jsonString);
            if (o && typeof o === "object") {
                return o;
            }
        }
        catch (e) { }
        return null;
    }

});

module.exports = router;