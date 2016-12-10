'use strict';

/**
 * Module dependencies.
 */

var CP_get  = require('./CP_get');
var CP_save = require('./CP_save');

/**
 * Configuration dependencies.
 */

var config  = require('../config/config');
var modules = require('../config/modules');

/**
 * Node dependencies.
 */

var Imap   = require('imap');
var unrtf  = require('unrtf');
var base64 = require('base64-stream');

/**
 * Route dependencies.
 */

var movie = require('../routes/paths/movie');

/**
 * Type cron.
 */

if (process.argv[2] == 'publish') {

    CP_get.publishIds(function (err, ids) {

        if (!ids) {
            console.log('[publish] Not Movies.');
            config.publish.every.hours = 0;
            config.publish.every.movies = 0;
        }
        else if (ids.start_id == config.publish.start && ids.stop_id == config.publish.stop) {
            console.log('[publish] All movies published.');
            config.publish.every.hours = 0;
            config.publish.every.movies = 0;
        }
        else {
            console.log('[publish] New IDs: ' + ids.start_id + ' - ' + ids.stop_id);
            config.publish.start = ids.start_id;
            config.publish.stop = ids.stop_id;
        }

        CP_save.save(config, 'config', function (err, result) {
            if (err) return console.log(err);
            console.log(result);
            var rand = Math.floor(Math.random() * 91) + 10;
            setTimeout(function () {
                CP_save.restart(function (err, result) {
                    if (err) return console.log(err);
                    console.log(result);
                });
            }, rand*10);
        });

    });

}
else if (process.argv[2] == 'abuse') {

    if (!modules.abuse.data.imap.user || !modules.abuse.data.imap.password || !modules.abuse.data.imap.host) {
        return null;
    }

    var options = JSON.stringify(modules.abuse.data.imap);
    options = JSON.parse(options);

    options.tls = (options.tls !== 0);

    var imap = new Imap(options);

    imap.once('ready', function() {

        function saveData() {
            CP_save.save(modules, 'modules', function (err, result) {
                if (err) return console.log(err);
                console.log(result);
                var rand = Math.floor(Math.random() * 91) + 10;
                setTimeout(function () {
                    CP_save.restart(function (err, result) {
                        if (err) return console.log(err);
                        console.log(result);
                    });
                }, rand*10);
            });
        }

        imap.openBox('INBOX', true, function(err) {

            if (err) {
                console.log(new Date(), err); imap.end(); process.exit(0); return null;
            }

            var date = new Date();
            date = date.setDate(date.getDate()-1);

            imap.search([ 'ALL', ['SINCE', date ] ], function(err, results) {

                if (err || !results || !results.length) {
                    console.log(new Date(), err); imap.end(); process.exit(0); return null;
                }

                var save_text = false;

                var f = imap.fetch(results, {
                    bodies: ['TEXT', 'HEADER.FIELDS (TO FROM SUBJECT)'],
                    struct: true
                });

                f.on('message', function(msg) {

                    msg.on('body', function(stream) {
                        stream.on('data', function(chunk) {
                            var urls;
                            var expr = new RegExp(config.domain + '/[a-zа-яё0-9./_\\-]*', 'ig');
                            while ((urls = expr.exec(chunk.toString('utf8'))) != null) {
                                var id = movie.id(urls[0]);
                                if (id >= 298 && id <= 1100000 && !(modules.abuse.data.movies.indexOf(id)+1)) {
                                    modules.abuse.data.movies.push(id);
                                    save_text = true;
                                }
                            }
                        });
                    });

                    msg.once('attributes', function(attrs) {

                        function toUpper(thing) {

                            return thing && thing.toUpperCase ? thing.toUpperCase() : thing;

                        }

                        function findAttachmentParts(struct, attachments) {

                            attachments = attachments ||  [];

                            for (var i = 0, len = struct.length; i < len; ++i) {
                                if (Array.isArray(struct[i])) {
                                    findAttachmentParts(struct[i], attachments);
                                } else {
                                    if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type))+1) {
                                        attachments.push(struct[i]);
                                    }
                                }
                            }

                            return attachments;

                        }

                        function buildAttMessageFunction(attachment) {

                            var encoding = attachment.encoding;

                            return function (msg) {
                                msg.on('body', function(stream) {
                                    if (encoding === 'BASE64') {
                                        stream = stream.pipe(base64.decode());
                                    }
                                    var chunks = [];
                                    stream.on('data', function (chunk) {
                                        chunks.push(chunk);
                                    });
                                    stream.on('end', function () {
                                        unrtf(chunks.join(''), function (err, res) {
                                            if (err || !res || !res.html) return;
                                            var urls;
                                            var expr = new RegExp(config.domain + '/[a-zа-яё0-9./_\\-]*', 'ig');
                                            while ((urls = expr.exec(res.html)) != null) {
                                                var id = movie.id(urls[0]);
                                                if (id >= 298 && id <= 1100000 && !(modules.abuse.data.movies.indexOf(id)+1)) {
                                                    modules.abuse.data.movies.push(id);
                                                    saveData();
                                                }
                                            }
                                        });
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
                                attachment.disposition.params.filename.indexOf('.rtf')+1 &&
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

                f.once('error', function(err) {
                    console.log(err);
                });

                f.once('end', function() {
                    imap.end();
                    if (save_text) {
                        saveData();
                    }
                });

            });

        });

    });

    imap.once('error', function(err) {
        console.log(err);
    });

    imap.connect();

}