'use strict';

/**
 * Configuration dependencies.
 */

var modules = require('../config/modules');

/**
 * Add adv to site.
 *
 * @return {Object}
 */

function codesAdv(options, type) {

    var positions = JSON.stringify(modules.adv.data[options.adv.device]);
    positions = JSON.parse(positions);

    if (modules.adv.status) {

        for (var position in positions[type]) {
            if (positions[type].hasOwnProperty(position) && typeof options.adv === 'object') {
                if (positions[type][position]) {
                    filterAdv(position);
                }
                else if (positions['all'][position]) {
                    positions[type][position] = positions['all'][position];
                    filterAdv(position);
                }
            }
        }

    }
    
    return positions[type];

    function filterAdv(position) {
        var dflt = true;
        for (var key in options.adv) {
            if (options.adv.hasOwnProperty(key) && options.adv[key]) {
                var keywordRegExp = ('' + options.adv[key]).replace(/[-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
                var listKeys = '(' + keywordRegExp + '|' + keywordRegExp + ',.*|.*,' + keywordRegExp + ')';
                var allSpecific = new RegExp('(\\s*\\(\\s*' + listKeys + '\\s*\\)\\s*```([^`]*?)```\\s*)', 'gi');
                var match = allSpecific.exec(positions[type][position]);
                if (match) {dflt = false;}
                positions[type][position] = positions[type][position].replace(allSpecific, '$3');
            }
        }
        if (dflt) {
            var defaultSpecific = new RegExp('(\\s*\\(\\s*default\\s*\\)\\s*```([^`]*?)```\\s*)', 'gi');
            positions[type][position] = positions[type][position].replace(defaultSpecific, '$2');
        }
        var otherSpecific = new RegExp('(\\s*\\(\\s*[^)]*?\\s*\\)\\s*```([^`]*?)```\\s*)', 'gi');
        positions[type][position] = positions[type][position].replace(otherSpecific, '');
    }

}

module.exports = {
    "codes" : codesAdv
};