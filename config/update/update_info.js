'use strict';

/**
 * Module dependencies.
 */

var CP_save = require('../../lib/CP_save.min');
var CP_get  = require('../../lib/CP_get.min');

/**
 * Node dependencies.
 */

var async = require('async');

(function upd(i) {

    i = i || 1;
    var ii = i+1;

    if (i >= 300) {
        return;
    }

    CP_get.movies(
        {"from": process.env.CP_RT, "certainly": true, "full": true},
        10000,
        '',
        i,
        false,
        function (err, movies) {
            if (err) {
                console.log(err);
                return;
            }

            if (movies && movies.length) {
                async.eachOfLimit(movies, 1, function (movie, key, callback) {
                    delete movie.year;
                    delete movie.actor;
                    delete movie.genre;
                    delete movie.country;
                    delete movie.director;
                    delete movie.premiere;
                    delete movie.kp_rating;
                    delete movie.kp_vote;
                    delete movie.imdb_rating;
                    delete movie.imdb_vote;
                    movie.id = movie.kp_id;
                    CP_save.save(
                        movie,
                        'rt',
                        function (err, result) {
                            console.log(result);
                            return callback(err);
                        });
                }, function (err) {
                    console.log(err);
                    upd(ii);
                });
            }
            else {
                upd(ii);
            }
        });

})();