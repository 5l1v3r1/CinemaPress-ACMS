'use strict';

/**
 * Configuration dependencies.
 */

var modules = require('../config/production/modules');

/**
 * Add the function to continue viewing.
 * All pages in footer should be a block: id="recentlyViewed"
 *
 * @return {String}
 */

function codeViewed() {

    var code = '';

    if (modules.viewed.status) {

        code = '<script>function getCookie(e){var t=document.cookie.match(new RegExp("(?:^|; )"+e.replace(/([.$?*|{}()\\[\\]\\\\\\/+^])/g,"\\\\$1")+"=([^;]*)"));return t?decodeURIComponent(t[1]):void 0}function setCookie(e,t,n){var o=(n=n||{}).expires;if("number"==typeof o&&o){var i=new Date;i.setTime(i.getTime()+1e3*o),o=n.expires=i}o&&o.toUTCString&&(n.expires=o.toUTCString());var r=e+"="+(t=encodeURIComponent(t));for(var d in n)if(n.hasOwnProperty(d)){r+="; "+d;var c=n[d];!0!==c&&(r+="="+c)}document.cookie=r}window.addEventListener("load",function(){function e(){var e=new RegExp("([htps:]{5,6}//[^/]*/[^/]*/[^/]*)","ig").exec(window.location.href);return e&&e[1]?e[1]:""}var t,n,o,i,r=(n=e(),o=(t=document.getElementById("cinemapress-poster"))&&t.src?t.src:"",i=document.title?encodeURIComponent(document.title):"",n&&o&&i?n+"|"+o+"|"+i:""),d=e(),c=getCookie("CP_viewed"),a=document.getElementById("recentlyViewed");if(c&&a){var l=document.querySelectorAll(".recentlyViewedBlock");if(l&&l.length)for(var p=0;p<l.length;p++)l[p].style.display="block";for(var s=c.split(","),m=0;m<s.length;m++)if(s[m]){var u=s[m].split("|"),f=document.createElement("a");f.setAttribute("href",u[0]);var g=document.createElement("img");g.setAttribute("src",u[1]),g.setAttribute("style","width: 52px; height: 72px; margin: 3px; border-radius:3px;"),g.setAttribute("alt",decodeURIComponent(u[2])),g.setAttribute("title",decodeURIComponent(u[2])),f.appendChild(g),a.appendChild(f)}}if(r){if(c&&d)for(var v=c.split(","),h=0;h<(v.length>=11?11:v.length);h++)-1===v[h].indexOf(""+d)&&(r+=","+v[h]);setCookie("CP_viewed",r,{expires:2592e3,path:"/"})}});</script>';

    }

    return code;

}

module.exports = {
    "code" : codeViewed
};