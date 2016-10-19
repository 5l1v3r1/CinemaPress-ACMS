'use strict';

/**
 * Configuration dependencies.
 */

var modules = require('../config/modules');

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

    var script = 'function player(){var a=document.querySelector("#cinemapress-player");if(a){try{if("https:"==window.top.location.protocol)return window.top.location.href="http:"+window.top.location.href.substring(window.top.location.protocol.length),console.log("Error: redirect to http protocol - http:"+window.top.location.href.substring(window.top.location.protocol.length)),!1}catch(a){console.log(a)}var b=a.dataset,c=[],d="",e="";b.title=b.title||"",b.single=b.single||0,e=parseInt(b.single)?"&single="+b.single:"",c.border=a.style.border||0,c.margin=a.style.margin||0,c.padding=a.style.padding||0,c.width=a.style.width||"100%",c.height=a.style.height||"370px",c["overflow-x"]=a.style["overflow-x"]||"hidden",c.background=a.style.background||"none",c.display=a.style.display||"block";for(var f in c)c.hasOwnProperty(f)&&(d+=f+":"+c[f]+";");var g=document.createElement("iframe");g.setAttribute("src","iframe-src"),g.setAttribute("style",d),g.setAttribute("id",a.id),g.setAttribute("data-title",b.title),g.setAttribute("data-single",b.single),g.setAttribute("allowfullscreen",""),a.parentNode.replaceChild(g,a)}return!1}document.addEventListener("DOMContentLoaded",player);';

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
                "yohoho": function (callback) {
                    getYohoho(function (result) {
                        callback(null, result);
                    });
                }
            },
            function(err, result) {

                if (err) return res.send(err);

                if (modules.episode.status && result['moonwalk']) {
                    script = script.replace('iframe-src', result['moonwalk']);
                }
                else if (result[modules.player.data.display]) {
                    script = script.replace('iframe-src', result[modules.player.data.display]);
                }
                else if (result['moonwalk']) {
                    script = script.replace('iframe-src', result['moonwalk']);
                }
                else if (result['hdgo']) {
                    script = script.replace('iframe-src', result['hdgo']);
                }
                else {
                    script = script.replace('iframe-src', result['yohoho']);
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
     * Get HDGO player.
     */

    function getHdgo(callback) {

        request('http://hdgo.cc/api/video.json?token=' + modules.player.data.hdgo.token.trim() + '&kinopoisk_id=' + id, function (error, response, body) {

            var iframe = '';

            if (!error && response.statusCode == 200) {

                var result = JSON.parse(body);

                if (!result.error && result.length && result[0].iframe_url) {

                    iframe = result[0].iframe_url;

                }

            }

            callback(iframe);

        });

    }

    /**
     * Get Moonwalk player.
     */

    function getMoonwalk(callback) {

        request('http://moonwalk.cc/api/videos.json?api_token=' + modules.player.data.moonwalk.token.trim() + '&kinopoisk_id=' + id, function (error, response, body) {

            var iframe = '';

            if (!error && response.statusCode == 200) {

                var result = JSON.parse(body);

                if (!result.error && result.length) {

                    var iframe_url = '';
                    var added = 0;

                    for (var i = 0; i < result.length; i++) {

                        if (season && episode && translate == result[i].translator_id) {
                            iframe_url = result[i].iframe_url + '?nocontrols=1&season=' + season + '&episode=' + episode;
                            break;
                        }
                        else {
                            var d = result[i].added_at || result[i].last_episode_time || 0;
                            var publish = (new Date(d).getTime()/1000);

                            if (publish >= added) {
                                iframe_url = result[i].iframe_url;
                                added = publish;
                            }
                        }

                    }

                    iframe = iframe_url;

                }

            }

            callback(iframe);

        });

    }

    /**
     * Get Yohoho player.
     */

    function getYohoho(callback) {

        callback('http://yohoho.xyz/online?title=" + encodeURIComponent(b.title) + e + "');

    }

});

module.exports = router;