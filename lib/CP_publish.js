'use strict';

/**
 * Configuration dependencies.
 */

var config = require('../config/production/config');

/**
 * Formation of the query term.
 *
 * @param {Object} q
 * @param {Object} [certainly]
 * @return {Object}
 */

function queryConditionPublish(q, certainly) {

    var where = (config.publish.required.length)
        ? config.publish.required.map(function (ctgry) {
        return ' AND `' + ctgry.trim() + '` != \'\' ';
    })
        : [];
    where = (where.length) ? where.join(' ') : '';

    q._select = (certainly)
        ? ', ( ' +
            'kp_id >= 1' +
            ' AND ' +
            'kp_id <= 3000000' +
            ' ) AS movie '
        : ', ( ' +
            'kp_id >= ' + config.publish.start +
            ' AND ' +
            'kp_id <= ' + config.publish.stop +
            ' ) AS movie';

    q._where = ' AND movie > 0 ' + where;

    return q;

}

/**
 * Terms thematic site.
 *
 * @return {Object}
 */

function thematicPublish() {

    var publish = {};
    publish.where_config = [];
    publish.match_config = [];

    if (config.publish.thematic.type) {
        publish.where_config.push('`type` = ' + parseInt(config.publish.thematic.type));
    }

    Object.keys(config.publish.thematic).forEach(function (key) {
        if (config.publish.thematic[key] && key !== 'type') {
            publish.match_config.push('@' + key + ' ' + config.publish.thematic[key]);
        }
    });

    return publish;

}

module.exports = {
    "queryCondition" : queryConditionPublish,
    "thematic"       : thematicPublish
};