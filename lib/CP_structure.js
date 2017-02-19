'use strict';

/**
 * Module dependencies.
 */

var CP_text = require('./CP_text');

/**
 * Configuration dependencies.
 */

var config  = require('../config/config');
var modules = require('../config/modules');
var texts   = require('../config/texts');

/**
 * Node dependencies.
 */

var getSlug = require('speakingurl');

/**
 * A data structure for a categories.
 *
 * @param {String} type
 * @param {Object} movies
 * @param {Object} [options]
 * @return {Array}
 */

function structureCategories(type, movies, options) {

    if (arguments.length == 2) {
        options = {};
        options.domain = '' + config.domain;
    }

    var categories = [];

    movies.forEach(function(movie) {

        var one_cat_one_image = true;

        ('' + movie[type]).split(',').forEach(function(cat_new) {

            if (cat_new == '_empty') return;

            var there_is = false;
            one_cat_one_image = (type == 'actor' || type == 'director') ? true : one_cat_one_image;

            categories.forEach(function(cat_old, i) {

                if (categories[i].name == cat_new) {

                    there_is = true;

                    if (categories[i].image == '/themes/default/public/desktop/img/player.png') {

                        categories[i].image = createImgUrl(movie, 'picture', 'small');

                    }

                }

            });

            if (!there_is) {

                categories.push({
                    "url"   : createCategoryUrl(type, cat_new),
                    "name"  : cat_new,
                    "image" : (one_cat_one_image)
                        ? createImgUrl(movie, 'picture', 'small')
                        : '/themes/default/public/desktop/img/player.png'
                });

                one_cat_one_image = false;

            }

        });

    });

    /**
     * Create URL for category page.
     *
     * @param {String} type
     * @param {String} category
     * @return {String}
     */

    function createCategoryUrl(type, category) {

        return config.protocol + options.domain + '/' + config.urls[type] + '/' + encodeURIComponent(category);

    }

    if (type == 'year') {
        categories.sort(function(x, y) {return parseInt(y.name) - parseInt(x.name);});
    }

    return categories;

}

/**
 * A data structure for a collections.
 *
 * @param {Object} collection
 * @param {Object} movies
 * @param {Object} [options]
 * @return {Object}
 */

function structureCollections(collection, movies, options) {

    if (arguments.length == 2) {
        options = {};
        options.domain = '' + config.domain;
    }

    var collections = {
        "url"   : createCollectionUrl(collection.url),
        "name"  : collection.title,
        "image" : collection.image || ''
    };

    if (movies.length && !collections.image) {

        for (var i = 0; i < movies.length; i++) {

            if (movies[i].picture_min && !collections.image) {
                collections.image = movies[i].picture_min
            }

            if (movies[i].picture_min && Math.random() < 0.5) {
                collections.image = movies[i].picture_min;
            }

        }
        
    }

    /**
     * Create URL for collection page.
     *
     * @param {String} url
     * @return {String}
     */

    function createCollectionUrl(url) {

        return config.protocol + options.domain + '/' + modules.collections.data.url + '/' + encodeURIComponent(url);

    }

    return collections;

}

/**
 * A data structure for a movie/movies.
 *
 * @param {Object} movies
 * @param {Object} [options]
 * @return {Object}
 */

function structureMovie(movies, options) {

    if (arguments.length == 1) {
        options = {};
        options.domain = '' + config.domain;
    }

    return movies.map(function(movie) {

        var id = parseInt(movie.kp_id) + parseInt(config.urls.unique_id);

        var images = createImages(movie);

        for (var key in movie) {
            if (movie.hasOwnProperty(key) && movie[key] == '_empty') {
                movie[key] = '';
            }
        }

        movie = userData(movie);
        
        movie = {
            "id"            : id,
            "kp_id"         : movie.kp_id,
            "title"         : movie.title_ru || movie.title_en,
            "title_ru"      : movie.title_ru,
            "title_en"      : movie.title_en,
            "description"   : movie.description,
            "poster"        : images.poster,
            "poster_big"    : images.poster_big,
            "poster_min"    : images.poster_min,
            "picture"       : images.picture,
            "picture_big"   : images.picture_big,
            "picture_min"   : images.picture_min,
            "pictures"      : images.pictures,
            "year"          : movie.year,
            "year_url"      : createCategoryUrl('year', movie.year),
            "countries"     : randPos(movie.country),
            "directors"     : randPos(movie.director),
            "genres"        : randPos(movie.genre),
            "actors"        : randPos(movie.actor),
            "country"       : movie.country.split(',')[0],
            "director"      : movie.director.split(',')[0],
            "genre"         : movie.genre.split(',')[0],
            "actor"         : movie.actor.split(',')[0],
            "countries_url" : randPos(createCategoryUrl('country', movie.country)),
            "directors_url" : randPos(createCategoryUrl('director', movie.director)),
            "genres_url"    : randPos(createCategoryUrl('genre', movie.genre)),
            "actors_url"    : randPos(createCategoryUrl('actor', movie.actor)),
            "country_url"   : createCategoryUrl('country', movie.country.split(',')[0]),
            "director_url"  : createCategoryUrl('director', movie.director.split(',')[0]),
            "genre_url"     : createCategoryUrl('genre', movie.genre.split(',')[0]),
            "actor_url"     : createCategoryUrl('actor', movie.actor.split(',')[0]),
            "countries_arr" : (movie.country)  ? movie.country.split(',') : [],
            "directors_arr" : (movie.director) ? movie.director.split(',') : [],
            "genres_arr"    : (movie.genre)    ? movie.genre.split(',') : [],
            "actors_arr"    : (movie.actor)    ? movie.actor.split(',') : [],
            "rating"        : createRating(movie, 'rating'),
            "vote"          : createRating(movie, 'vote'),
            "kp_rating"     : movie.kp_rating,
            "kp_vote"       : movie.kp_vote,
            "imdb_rating"   : movie.imdb_rating,
            "imdb_vote"     : movie.imdb_vote,
            "type"          : movie.type,
            "premiere"      : toDate(movie.premiere),
            "url"           : createMovieUrl(movie)
        };

        movie.description_short = changeDescription(movie.description, true);
        movie.description       = changeDescription(movie.description);
        movie                   = userData(movie, 'poster');
        movie                   = userData(movie, 'picture');

        return movie;

    });

    /**
     * Change description.
     *
     * @param {String} description
     * @param {Boolean} [short]
     * @return {String}
     */

    function changeDescription(description, short) {

        var text = '';

        var reg = new RegExp('(\\s*\\*\\*\\s*([^]*?)\\s*\\*\\*\\s*)', 'i');

        if (short) {
            var match = reg.exec(description);
            if (match && match.length) {
                text = match[2];
            }
            text = (text || description)
                .replace(/<\/?[^>]+>/g, '')
                .replace(/\s+/g, ' ')
                .replace(/(^\s*)|(\s*)$/g, '')
                .substr(0, 200);
        }
        else {
            text = description
                .replace(reg, ' ')
                .replace(/\s+/g, ' ')
                .replace(/(^\s*)|(\s*)$/g, '');
        }

        return text;

    }

    /**
     * Create a string with the categories in random order.
     *
     * @param {String} items
     * @return {String}
     */

    function randPos(items) {

        var itemsArr = shuffle(('' + items).split(','));
        if (itemsArr.length > 1) {
            var lastArr = itemsArr.pop();
            items = (itemsArr.join(', ')) + ' и ' + lastArr;
        }
        else {
            items = itemsArr.join(', ');
        }

        return items;

    }

    /**
     * Shuffle array.
     *
     * @param {Array} array
     * @return {Array}
     */

    function shuffle(array) {

        var currentIndex = array.length, temporaryValue, randomIndex;

        while (0 !== currentIndex) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;

    }

    /**
     * Changing the standard of the movie data.
     *
     * @param {Object} movie
     * @param {String} [type]
     * @return {Object}
     */

    function userData(movie, type) {

        var id = parseInt(movie.kp_id);

        if (texts.ids.indexOf(id)+1) {
            if (type && texts.movies[id].hasOwnProperty(type)) {
                movie[type] = CP_text.formatting(texts.movies[id][type]);
            }
            else {
                for (var field in texts.movies[id]) {
                    if (texts.movies[id].hasOwnProperty(field)) {
                        movie[field] = CP_text.formatting(texts.movies[id][field]);
                    }
                }
            }
        }

        return movie;

    }

    /**
     * Create URL for category page.
     *
     * @param {String} type
     * @param {String} items
     * @return {String}
     */

    function createCategoryUrl(type, items) {

        var itemsArr = ('' + items).split(',');

        itemsArr = itemsArr.map(function(item) {

            return '<a href="' + config.protocol + options.domain + '/' + config.urls[type] + '/' + encodeURIComponent(item) +'">' + item +'</a>';

        });

        return itemsArr.join(', ');

    }

    /**
     * Create URL for movie page.
     *
     * @param {Object} movie
     * @return {String}
     */

    function createMovieUrl(movie) {

        var id = parseInt(movie.kp_id) + parseInt(config.urls.unique_id);

        var data = {
            "title_ru"  : movie.title_ru,
            "title_en"  : movie.title_en,
            "year"      : movie.year,
            "country"   : movie.country.split(',')[0],
            "director"  : movie.director.split(',')[0],
            "genre"     : movie.genre.split(',')[0],
            "actor"     : movie.actor.split(',')[0]
        };

        var separator = config.urls.separator;
        var prefix_id = config.urls.prefix_id + '' + id;
        var url = config.urls.movie_url;

        url = url.replace(/\[prefix_id]/g, prefix_id);
        url = url.replace(/\[separator]/g, separator);

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (!data[key]) {
                    url = url.replace(separator + '[' + key + ']' + separator, separator);
                    url = url.replace('[' + key + ']' + separator, '');
                    url = url.replace(separator + '[' + key + ']', '');
                }
                else {
                    url = url.replace('[' + key + ']', getSlug(data[key], separator));
                }
            }
        }

        return config.protocol + options.domain + '/' + config.urls.movie + '/' + url;

    }

    /**
     * Images for website.
     *
     * @param {Object} movie
     * @return {Object}
     */

    function createImages(movie) {

        var images = {};

        images.pictures   = [];

        images.poster_min = createImgUrl(movie, 'poster', 'small');
        images.poster     = createImgUrl(movie, 'poster', 'medium');
        images.poster_big = createImgUrl(movie, 'poster', 'big');

        images.picture_min = images.poster_min;
        images.picture     = images.poster;
        images.picture_big = images.poster_big;

        if (movie.pictures) {

            images.picture_min = createImgUrl(movie, 'picture', 'small');
            images.picture     = createImgUrl(movie, 'picture', 'medium');
            images.picture_big = createImgUrl(movie, 'picture', 'big');

            movie.pictures.split(',').forEach(function(id) {
                images.pictures.push({
                    "picture_min" : createImgUrl(movie, 'picture', 'small', id),
                    "picture"     : createImgUrl(movie, 'picture', 'medium', id),
                    "picture_big" : createImgUrl(movie, 'picture', 'big', id)
                });
            });

        }

        return images;

    }

    /**
     * Create overall rating.
     *
     * @param {Object} movie
     * @param {String} type
     * @return {Object}
     */

    function createRating(movie, type) {

        var result = {};
        result.rating = 0;
        result.vote = 0;

        if (movie.kp_vote > 0 && movie.imdb_vote > 0) {
            if (movie.kp_rating && movie.imdb_rating) {
                result.rating += Math.round((parseInt(movie.kp_rating) + parseInt(movie.imdb_rating))/2);
                result.vote += parseInt(movie.kp_vote);
                result.vote += parseInt(movie.imdb_vote);
            }
        }
        else if (movie.kp_vote > 0) {
            if (movie.kp_rating) {
                result.rating += parseInt(movie.kp_rating);
                result.vote += parseInt(movie.kp_vote);
            }
        }
        else if (movie.imdb_vote > 0) {
            if (movie.imdb_rating) {
                result.rating += parseInt(movie.imdb_rating);
                result.vote += parseInt(movie.imdb_vote);
            }
        }

        return result[type];

    }

    /**
     * Create date format dd-mm-YYYY.
     *
     * @param {Number} days
     * @return {String}
     */

    function toDate(days) {

        days = (days - 719528) * 1000 * 60 * 60 * 24;

        return new Date(days).toJSON().substr(0, 10);

    }

}

/**
 * Create image URL.
 *
 * @param {Object} movie
 * @param {String} type
 * @param {String} size
 * @param {Number} [id]
 * @return {String}
 */

function createImgUrl(movie, type, size, id) {

    var st = config.image.addr;

    var img = '';

    if (type == 'picture') {
        if (!id) {
            var p = movie.pictures.split(',');
            var r = Math.floor(Math.random() * p.length);
            id = p[r];
        }
        if (st == config.domain && (size == 'big' || size == 'medium')) {
            st = 'st.kp.yandex.net';
        }
        if (st != config.domain) {
            switch (size) {
                case 'small':
                    img = config.protocol + st + '/images/kadr/sm_' + id + '.jpg';
                    break;
                case 'big':
                    img = config.protocol + st + '/images/kadr/' + id + '.jpg';
                    break;
                default:
                    img = config.protocol + st + '/images/kadr/' + id + '.jpg';
            }
            return img;
        }
    }
    else {
        if (!id) {
            id = movie.kp_id;
        }
        if (st == config.domain && (size == 'big')) {
            st = 'st.kp.yandex.net';
        }
        if (st != config.domain) {
            switch (size) {
                case 'small':
                    img = config.protocol + st + '/images/sm_film/' + id + '.jpg';
                    break;
                case 'big':
                    img = config.protocol + st + '/images/film_big/' + id + '.jpg';
                    break;
                default:
                    img = config.protocol + st + '/images/film_iphone/iphone360_' + id + '.jpg';
            }
            return img;
        }
    }

    var separator = config.urls.separator;
    var prefix_id = 'img' + id;
    var url = config.urls.movie_url;

    url = url.replace(/\[prefix_id]/gi, prefix_id);
    url = url.replace(/\[separator]/gi, separator);

    var keys = {
        "title_ru"  : movie.title_ru,
        "title_en"  : movie.title_en,
        "year"      : movie.year,
        "country"   : movie.country.split(',')[0],
        "director"  : movie.director.split(',')[0],
        "genre"     : movie.genre.split(',')[0],
        "actor"     : movie.actor.split(',')[0]
    };

    for (var key in keys) {
        if (keys.hasOwnProperty(key)) {
            if (!keys[key]) {
                url = url.replace(separator + '[' + key + ']' + separator, separator);
                url = url.replace('[' + key + ']' + separator, '');
                url = url.replace(separator + '[' + key + ']', '');
            }
            else {
                url = url.replace('[' + key + ']', getSlug(keys[key], separator));
            }
        }
    }

    url = url.split('.')[0];

    img = '/images/' + type + '/' + size + '/' + url + '.jpg';

    return img;

}

module.exports = {
    "categories"  : structureCategories,
    "collections" : structureCollections,
    "movie"       : structureMovie
};