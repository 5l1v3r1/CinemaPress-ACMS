'use strict';

/**
 * Configuration dependencies.
 */

var config  = require('../config/config');

/**
 * Adding a page episodes list id="#episodesList".
 * Adding a page updates serials list id="#serialsList".
 *
 * @param {String} [type]
 * @return {Object}
 */

function codeEpisode(type) {

    var code = {};

    code.episodes = 'function episodes(){var a=document.querySelector("#episodesList");if(!a)return!1;var b=a.dataset.id||1,c=new XMLHttpRequest;c.open("GET","/episode.list?id="+b,!0),c.onload=function(b){if(4===c.readyState)if(200===c.status){var d=JSON.parse(c.responseText),e=d[Object.keys(d)[0]];for(var f in e)if(e.hasOwnProperty(f)){var g=document.createElement("ul"),h=document.createElement("li"),i=document.createElement("li"),j=document.createElement("span");g.setAttribute("style","margin:0;padding:0;float:none"),h.setAttribute("style","list-style-type:none;cursor:pointer;float:none;border-radius:5px;padding:5px;background:#666;color:#fff;margin:10px auto;"),h.setAttribute("class","cinemapress_li"),h.setAttribute("data-click",f),i.setAttribute("style","list-style-type:none;display:none;float:none;margin:0"),i.setAttribute("data-show",f),h.textContent="► "+f,j.setAttribute("style","float:right"),j.textContent="▼",h.appendChild(j),g.appendChild(h);var k=document.createElement("ul");k.setAttribute("style","float:none;margin:0 0 0 20px;");for(var l in e[f])if(e[f].hasOwnProperty(l)){var m=document.createElement("li"),n=document.createElement("li"),o=document.createElement("span");m.setAttribute("style","list-style-type:none;cursor:pointer;float:none;border-radius:5px;padding:5px;background:#666;color:#fff;margin:10px auto;"),m.setAttribute("class","cinemapress_li"),m.setAttribute("data-click",f+l),n.setAttribute("style","list-style-type:none;display:none;float:none;margin:0"),n.setAttribute("data-show",f+l),m.textContent="► "+l,o.setAttribute("style","float:right"),o.textContent="▼",m.appendChild(o),k.appendChild(m);var p=document.createElement("ul");p.setAttribute("style","float:none;margin:0 0 0 20px;");for(var q in e[f][l])if(e[f][l].hasOwnProperty(q)){var r=document.createElement("li"),s=document.createElement("a");r.setAttribute("style","list-style-type:none;float:none;margin:0"),s.setAttribute("href",e[f][l][q].url),s.setAttribute("target","_blank"),s.setAttribute("style","text-decoration:none;float:none"),s.textContent="► "+e[f][l][q].translate+" "+e[f][l][q].season+" "+e[f][l][q].episode,r.appendChild(s),p.appendChild(r)}n.appendChild(p),k.appendChild(n)}i.appendChild(k),g.appendChild(i),a.appendChild(g);var t=document.querySelectorAll(".episodesListBlock");if(t&&t.length)for(var u=0;u<t.length;u++)t[u].style.display="block"}var v=document.querySelectorAll(".cinemapress_li");if(v&&v.length)for(var w=0;w<v.length;w++)v[w].addEventListener("click",function(){var a=document.querySelector("li[data-show=\'"+this.dataset.click+"\']");a.style.display="block"==a.style.display?"none":"block"})}else console.error(c.statusText)},c.onerror=function(a){console.error(c.statusText)},c.send(null)}document.addEventListener("DOMContentLoaded",episodes);';

    code.serials = 'function serials(){var a=document.querySelector("#serialsList");if(!a)return!1;var b=new XMLHttpRequest;b.open("GET","/episode.list",!0),b.onload=function(c){if(4===b.readyState)if(200===b.status){var d=JSON.parse(b.responseText),e=document.createElement("ul");for(var f in d)if(d.hasOwnProperty(f))for(var g in d[f])if(d[f].hasOwnProperty(g))for(var h in d[f][g])if(d[f][g].hasOwnProperty(h))for(var i in d[f][g][h])if(d[f][g][h].hasOwnProperty(i)){var j=document.createElement("li"),k=document.createElement("a");j.setAttribute("style","list-style-type:none"),k.setAttribute("href",d[f][g][h][i].url),k.innerHTML=d[f][g][h][i].title_ru+" "+d[f][g][h][i].season+" "+d[f][g][h][i].episode+" ["+d[f][g][h][i].translate+"]",j.appendChild(k),e.appendChild(j)}a.appendChild(e);var l=document.querySelectorAll(".serialsListBlock");if(l&&l.length)for(var m=0;m<l.length;m++)l[m].style.display="block"}else console.error(b.statusText)},b.onerror=function(a){console.error(b.statusText)},b.send(null)}document.addEventListener("DOMContentLoaded",serials);';

    return (type)
        ? '<script>' + code[type] + '</script>'
        : '<script>' + code.episodes + code.serials + '</script>';

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
            if (parseInt(translates[i].id) == parseInt(serial.translate_id)) {
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