'use strict';

/**
 * Configuration dependencies.
 */

var modules = require('../config/production/modules');

/**
 * Add the function to continue viewing.
 * All pages should be a button: id="continueViewing"
 * On the page movie should be a button: id="watchLater"
 *
 * @return {String}
 */

function codeContinue() {

    var code = '';

    if (modules.continue.status) {

        code = '<script>function getCookie(e){var t=document.cookie.match(new RegExp("(?:^|; )"+e.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,"\\$1")+"=([^;]*)"));return t?decodeURIComponent(t[1]):void 0}function setCookie(e,t,n){var o=(n=n||{}).expires;if("number"==typeof o&&o){var i=new Date;i.setTime(i.getTime()+1e3*o),o=n.expires=i}o&&o.toUTCString&&(n.expires=o.toUTCString());var a=e+"="+(t=encodeURIComponent(t));for(var r in n)if(n.hasOwnProperty(r)){a+="; "+r;var c=n[r];!0!==c&&(a+="="+c)}document.cookie=a}function continueViewing(){var e=getCookie("CP_continue");e&&(window.location.href=e)}function watchLater(e){document.querySelector("#watchLater").textContent="Сохранено",setCookie("CP_continue",window.location.href.split("?")[0].split("#")[0]+e,{expires:31104e3,path:"/"})}window.addEventListener("load",function(){function e(e){if(e.data&&"MW_PLAYER_TIME_UPDATE"==e.data.message){l=Math.floor(e.data.value);var t=Math.floor(e.data.value),n=Math.floor(t/60),o=Math.floor(n/60),i=t%60?t%60<10?"0"+t%60:t%60:"00",a=n%60?n%60<10?"0"+n%60:n%60:"00",r=o%24?o%60<10?"0"+o%60:o%24:"00";c.innerHTML=d+" ["+r+":"+a+":"+i+"]"}}function t(){l&&(l="?start_time="+l),watchLater(l),c.removeEventListener("click",t),window.addEventListener?window.removeEventListener("message",e):window.detachEvent("onmessage",e)}var n=document.querySelectorAll(".continueViewingBlock");if(n&&n.length)for(var o=0;o<n.length;o++)n[o].style.display="block";var i=document.querySelector("#continueViewing");i&&i.addEventListener("click",continueViewing);var a=document.querySelectorAll(".watchLaterBlock");if(a&&a.length)for(var r=0;r<a.length;r++)a[r].style.display="block";var c=document.querySelector("#watchLater"),d=c.innerHTML,l=0;window.addEventListener?window.addEventListener("message",e):window.attachEvent("onmessage",e),c&&c.addEventListener("click",t)});</script>';

    }
    
    return code;

}

module.exports = {
    "code" : codeContinue
};