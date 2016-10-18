'use strict';

/**
 * Configuration dependencies.
 */

var config  = require('../config/config');

/**
 * Adding a page episodes list id="#episodesList".
 * Adding a page updates serials list id="#serialsList".
 *
 * @return {Object}
 */

function codeEpisode() {

    var code = {};

    code.footer = 'function episodes(){var a=document.querySelector("#episodesList");if(!a)return!1;var b=a.dataset.id||1,c=new XMLHttpRequest;c.open("GET","/episode.list?id="+b,!0),c.onload=function(b){if(4===c.readyState)if(200===c.status){var d=JSON.parse(c.responseText),e=d[Object.keys(d)[0]];for(var f in e)if(e.hasOwnProperty(f)){var g=document.createElement("ul"),h=document.createElement("li"),i=document.createElement("li");h.setAttribute("style","list-style-type:none"),i.setAttribute("style","list-style-type:none"),h.innerHTML=f,g.appendChild(h);var j=document.createElement("ul");for(var k in e[f])if(e[f].hasOwnProperty(k))for(var l in e[f][k])if(e[f][k].hasOwnProperty(l)){var m=document.createElement("li"),n=document.createElement("a");m.setAttribute("style","list-style-type:none"),n.setAttribute("href",e[f][k][l].url),n.innerHTML=e[f][k][l].translate+" "+e[f][k][l].season+" "+e[f][k][l].episode,m.appendChild(n),j.appendChild(m)}i.appendChild(j),g.appendChild(i),a.appendChild(g);var o=document.querySelectorAll(".episodesListBlock");if(o&&o.length)for(var p=0;p<o.length;p++)o[p].style.display="block"}}else console.error(c.statusText)},c.onerror=function(a){console.error(c.statusText)},c.send(null)}function serials(){var a=document.querySelector("#serialsList");if(!a)return!1;var b=new XMLHttpRequest;b.open("GET","/episode.list",!0),b.onload=function(c){if(4===b.readyState)if(200===b.status){var d=JSON.parse(b.responseText),e=document.createElement("ul");for(var f in d)if(d.hasOwnProperty(f))for(var g in d[f])if(d[f].hasOwnProperty(g))for(var h in d[f][g])if(d[f][g].hasOwnProperty(h))for(var i in d[f][g][h])if(d[f][g][h].hasOwnProperty(i)){var j=document.createElement("li"),k=document.createElement("a");j.setAttribute("style","list-style-type:none"),k.setAttribute("href",d[f][g][h][i].url),k.innerHTML=d[f][g][h][i].title_ru+" "+d[f][g][h][i].season+" "+d[f][g][h][i].episode+" ["+d[f][g][h][i].translate+"]",j.appendChild(k),e.appendChild(j)}a.appendChild(e);var l=document.querySelectorAll(".serialsListBlock");if(l&&l.length)for(var m=0;m<l.length;m++)l[m].style.display="block"}else console.error(b.statusText)},b.onerror=function(a){console.error(b.statusText)},b.send(null)}document.addEventListener("DOMContentLoaded",episodes),document.addEventListener("DOMContentLoaded",serials);';

}

/**
 * Parse data episode.
 *
 * @param {String} type
 * @param {Object} options
 * @return {Object}
 */

function parseEpisode(type, options) {

    if (arguments.length == 1) {
        options = {};
        options.domain = '' + config.domain;
    }

    var regexpEpisode = new RegExp('^s([0-9]{1,4})e([0-9]{1,4})(_([0-9]{1,3})|)$', 'ig');
    var execEpisode   = regexpEpisode.exec(type);

    var serial = {};
    serial.season = (execEpisode && execEpisode[1]) ? parseInt(execEpisode[1]) + '' : '';
    serial.episode = (execEpisode && execEpisode[2]) ? parseInt(execEpisode[2]) + '' : '';
    serial.translate_id = (execEpisode && execEpisode[4]) ? parseInt(execEpisode[4]) + '' : '';
    serial.translate = 'Оригинал';

    var translates = require('../config/translates.json');
    if (translates && translates.length) {
        for (var i = 0, len = translates.length; i < len; i++) {
            if (parseInt(translates[i].id) == parseInt(serial.translate)) {
                serial.translate = translates[i].name;
                break;
            }
        }
    }

    return serial;

}

module.exports = {
    "code"  : codeEpisode,
    "parse" : parseEpisode
};