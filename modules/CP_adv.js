'use strict';

/**
 * Configuration dependencies.
 */

var modules = require('../config/modules');

/**
 * Add adv to site.
 *
 * @return {String}
 */

function codesAdv(options, type) {

    var positions = JSON.stringify(modules.adv.data[options.device][type]);
    positions = JSON.parse(positions);

    if (modules.adv.status) {

        for (var position in positions) {
            if (positions.hasOwnProperty(position) && options.adv) {
                if (positions[position]) {
                    filterAdv(position);
                }
                else if (positions.all) {
                    filterAdv('adv');
                }
            }
        }

    }
    
    return positions;

    function filterAdv(position) {
        var dflt = true;
        for (var key in options.adv) {
            if (options.adv.hasOwnProperty(key) && options.adv[key]) {
                var keywordRegExp = ('' + options.adv[key]).replace(/[-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
                var listKeys = '(' + keywordRegExp + '|' + keywordRegExp + ',.*|.*,' + keywordRegExp + ')';
                var allSpecific = new RegExp('(\\s*\\(\\s*' + listKeys + '\\s*\\)\\s*```([^`]*?)```\\s*)', 'gi');
                var match = allSpecific.exec(positions[position]);
                if (match) {dflt = false;}
                positions[position] = positions[position].replace(allSpecific, ' $3 ');
            }
        }
        if (dflt) {
            var defaultSpecific = new RegExp('(\\s*\\(\\s*default\\s*\\)\\s*```([^`]*?)```\\s*)', 'gi');
            positions[position] = positions[position].replace(defaultSpecific, ' $2 ');
        }
        var otherSpecific = new RegExp('(\\s*\\(\\s*[^)]*?\\s*\\)\\s*```([^`]*?)```\\s*)', 'gi');
        positions[position] = positions[position].replace(otherSpecific, '');
    }

}

module.exports = {
    "codes" : codesAdv
};