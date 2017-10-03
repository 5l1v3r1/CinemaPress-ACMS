'use strict';

/**
 * Module dependencies.
 */

var CP_get  = require('./CP_get.min');
var CP_save = require('./CP_save.min');

/**
 * Configuration dependencies.
 */

var config  = require('../config/production/config');
var modules = require('../config/production/modules');

/**
 * Node dependencies.
 */

var request = require('request');
var path    = require('path');
var fs      = require('fs');
var Imap    = require('imap');
var base64  = require('base64-stream');

/**
 * Route dependencies.
 */

var movie = require('../routes/paths/movie');

var hour = new Date().getHours();

/**
 * Download new translators.
 */

if (modules.player.data.moonwalk.token && hour === 3) {

    request({url: 'http://translators.cinemapress.org/' + config.domain, method: 'POST'}, function (error, response, translators) {
        if (error) return console.log(error);
        if (response.statusCode === 200 && translators) {
            fs.writeFile(
                path.join(path.dirname(__dirname), 'files', 'translators.json'),
                translators,
                function (err) {
                    if (err) console.log(err);
                });
        }
    });

}

/**
 * Publish new movies.
 */

if (config.publish.every.hours && config.publish.every.movies) {

    CP_get.publishIds(function (err, ids) {

        if (!ids) {
            console.log('[publish] Not Movies.');
            config.publish.every.hours = 0;
            config.publish.every.movies = 0;
        }
        else if (ids.start_id === config.publish.start && ids.stop_id === config.publish.stop) {
            console.log('[publish] All movies published.');
            config.publish.every.hours = 0;
            config.publish.every.movies = 0;
        }
        else {
            console.log('[publish] New IDs: ' + ids.start_id + ' - ' + ids.stop_id);
            config.publish.start = ids.start_id;
            config.publish.stop = ids.stop_id;
        }

        CP_save.save(config, 'config', function (err) {
            if (err) return console.log(err);
            var rand = Math.floor(Math.random() * 91) + 10;
            setTimeout(function () {
                CP_save.restart(function (err) {
                    if (err) return console.log(err);
                });
            }, rand * 100);
        });

    });

}

/**
 * Delete abuse movies.
 */

if (modules.abuse.data.imap.user &&
    modules.abuse.data.imap.password &&
    modules.abuse.data.imap.host &&
    hour === 0) {

    var options = JSON.stringify(modules.abuse.data.imap);
    options = JSON.parse(options);

    options.tls = (options.tls !== 0);

    var imap = new Imap(options);

    imap.once('ready', function () {

        function saveData() {
            CP_save.save(modules, 'modules', function (err) {
                if (err) return console.log(err);
                var rand = Math.floor(Math.random() * 91) + 10;
                setTimeout(function () {
                    CP_save.restart(function (err) {
                        if (err) return console.log(err);
                    });
                }, rand * 10);
            });
        }

        imap.openBox('INBOX', true, function (err) {

            if (err) {
                console.log(new Date(), err);
                imap.end();
                process.exit(0);
                return null;
            }

            var date = new Date();
            date = date.setDate(date.getDate() - 1);

            imap.search(['ALL', ['SINCE', date]], function (err, results) {

                if (err || !results || !results.length) {
                    console.log(new Date(), err);
                    imap.end();
                    process.exit(0);
                    return null;
                }

                var save = false;

                var f = imap.fetch(results, {
                    bodies: ['TEXT', 'HEADER.FIELDS (TO FROM SUBJECT)'],
                    struct: true
                });

                f.on('message', function (msg) {

                    msg.on('body', function (stream) {
                        stream.on('data', function (chunk) {
                            var urls;
                            var expr = new RegExp(config.domain + '/[a-zа-яё0-9./_\\\'-]*', 'ig');
                            while ((urls = expr.exec(chunk.toString('utf8'))) !== null) {
                                var id = movie.id(urls[0]);
                                if (id >= 1 && id <= 3000000 && !(modules.abuse.data.movies.indexOf(''+id) + 1)) {
                                    console.log('TEXT', id);
                                    modules.abuse.data.movies.push(''+id);
                                    save = true;
                                }
                            }
                        });
                    });

                    msg.once('attributes', function (attrs) {

                        function toUpper(thing) {

                            return thing && thing.toUpperCase ? thing.toUpperCase() : thing;

                        }

                        function findAttachmentParts(struct, attachments) {

                            attachments = attachments || [];

                            for (var i = 0, len = struct.length; i < len; ++i) {
                                if (Array.isArray(struct[i])) {
                                    findAttachmentParts(struct[i], attachments);
                                } else {
                                    if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) + 1) {
                                        attachments.push(struct[i]);
                                    }
                                }
                            }

                            return attachments;

                        }

                        function buildAttMessageFunction(attachment) {

                            var encoding = attachment.encoding;

                            return function (msg) {
                                msg.on('body', function (stream) {
                                    if (encoding === 'BASE64') {
                                        stream = stream.pipe(base64.decode());
                                    }
                                    var chunks = [];
                                    stream.on('data', function (chunk) {
                                        chunks.push(chunk);
                                    });
                                    stream.on('end', function () {
                                        var urls;
                                        var string = chunks.join('')
                                            .replace(/\\u33\\\'3f/gi, '!')
                                            .replace(/\\u34\\\'3f/gi, '"')
                                            .replace(/\\u35\\\'3f/gi, '#')
                                            .replace(/\\u36\\\'3f/gi, '$')
                                            .replace(/\\u37\\\'3f/gi, '%')
                                            .replace(/\\u38\\\'3f/gi, '&')
                                            .replace(/\\u39\\\'3f/gi, "'")
                                            .replace(/\\u40\\\'3f/gi, '(')
                                            .replace(/\\u41\\\'3f/gi, ')')
                                            .replace(/\\u42\\\'3f/gi, '*')
                                            .replace(/\\u43\\\'3f/gi, '+')
                                            .replace(/\\u44\\\'3f/gi, ',')
                                            .replace(/\\u45\\\'3f/gi, '-')
                                            .replace(/\\u46\\\'3f/gi, '.')
                                            .replace(/\\u47\\\'3f/gi, '/')
                                            .replace(/\\u58\\\'3f/gi, ':')
                                            .replace(/\\u64\\\'3f/gi, '@')
                                            .replace(/\\u91\\\'3f/gi, '[')
                                            .replace(/\\u92\\\'3f/gi, '\\')
                                            .replace(/\\u93\\\'3f/gi, ']')
                                            .replace(/\\u94\\\'3f/gi, '^')
                                            .replace(/\\u95\\\'3f/gi, '_')
                                            .replace(/\\u123\\\'3f/gi, '{')
                                            .replace(/\\u124\\\'3f/gi, '|')
                                            .replace(/\\u125\\\'3f/gi, '}')
                                            .replace(/\\u126\\\'3f/gi, '~');
                                        var expr = new RegExp(config.domain + '/[a-zа-яё0-9./_\\\'-]*', 'ig');
                                        while ((urls = expr.exec(string)) !== null) {
                                            var id = movie.id(urls[0]);
                                            if (id >= 1 && id <= 3000000 && !(modules.abuse.data.movies.indexOf(''+id) + 1)) {
                                                modules.abuse.data.movies.push(''+id);
                                                saveData();
                                            }
                                        }
                                    });
                                });
                            };
                        }

                        var attachments = findAttachmentParts(attrs.struct);

                        for (var i = 0, len = attachments.length; i < len; i++) {

                            var attachment = attachments[i];

                            if (
                                attachment &&
                                attachment.disposition &&
                                attachment.disposition.params &&
                                attachment.disposition.params.filename &&
                                attachment.disposition.params.filename.indexOf('.rtf') + 1 &&
                                attachment.disposition.params.filename.indexOf('.sig') === -1
                            ) {
                                var f = imap.fetch(attrs.uid, {
                                    bodies: [attachment.partID],
                                    struct: true
                                });

                                f.on('message', buildAttMessageFunction(attachment));
                            }

                        }

                    });

                });

                f.once('error', function (err) {
                    console.log(err);
                });

                f.once('end', function () {
                    imap.end();
                    if (save) {
                        saveData();
                    }
                });

            });

        });

    });

    imap.once('error', function (err) {
        console.log(err);
    });

    imap.connect();

}