module.exports = {
    "protocol": "http://",
    "domain": "example.com",
    "email": "support@example.com",
    "theme": "default",
    "image": {
        "addr": "st.kp.yandex.net"
    },
    "cache": {
        "time": 0,
        "addr": "127.0.0.1:11211"
    },
    "sphinx": {
        "addr": "127.0.0.1:9306"
    },
    "nginx": {
        "addr": "127.0.0.1:3000"
    },
    "publish": {
        "start": 335,
        "stop": 355,
        "every" : {
            "hours": 1,
            "movies": 2
        },
        "text": 0,
        "required": [
            "title_ru"
        ],
        "thematic": {
            "type": "",
            "year": "",
            "genre": "",
            "country": "",
            "actor": "",
            "director": "",
            "query_id": ""
        }
    },
    "default": {
        "count": 15,
        "sorting": "kinopoisk-vote-up",
        "votes": {
            "kp": 2000,
            "imdb": 2000
        }
    },
    "codes": {
        "head": "",
        "footer": "",
        "robots": "User-agent: *\nAllow: /\nDisallow: /type/*/*\nDisallow: /movie/*/*\nDisallow: /year/*/*\nDisallow: /genre/*/*\nDisallow: /country/*/*\nDisallow: /director/*/*\nDisallow: /actor/*/*\nDisallow: /search\nDisallow: /*?sorting*"
    },
    "index": {
        "type": {
            "name": "Лучшие [type] онлайн",
            "keys": "фильмы",
            "sorting": "kinopoisk-vote-up",
            "count": 10,
            "order": 1
        },
        "year": {
            "name": "Фильмы [year] года",
            "keys": "2000",
            "sorting": "kinopoisk-vote-up",
            "count": 10,
            "order": 2
        },
        "genre": {
            "name": "Фильмы в жанре [genre]",
            "keys": "комедия,ужасы",
            "sorting": "kinopoisk-vote-up",
            "count": 10,
            "order": 3
        },
        "country": {
            "name": "Фильмы из страны [country]",
            "keys": "США",
            "sorting": "kinopoisk-vote-up",
            "count": 10,
            "order": 4
        },
        "actor": {
            "name": "Лучшие фильмы [actor]",
            "keys": "Киану Ривз",
            "sorting": "kinopoisk-vote-up",
            "count": 10,
            "order": 5
        },
        "director": {
            "name": "Лучшие фильмы [director]",
            "keys": "Дэвид Финчер",
            "sorting": "kinopoisk-vote-up",
            "count": 10,
            "order": 6
        },
        "ids": {
            "name": "Новые фильмы онлайн",
            "keys": "335,336,337,338,339",
            "order": 7
        },
        "collections": {
            "keys": "choice",
            "count": 5,
            "order": 8
        }
    },
    "titles": {
        "index": "Фильмы онлайн",
        "year" : "Фильмы [year] года [sorting] [page]",
        "years" : "Фильмы по годам",
        "genre": "Фильмы в жанре [genre] [sorting] [page]",
        "genres" : "Фильмы по жанрам",
        "country": "Фильмы из страны [country] [sorting] [page]",
        "countries": "Фильмы по странам",
        "actor": "Фильмы с участием [actor] [sorting] [page]",
        "actors": "Самые популярные актеры",
        "director": "Фильмы которые срежиссировал [director] [sorting] [page]",
        "directors": "Самые популярные режиссеры",
        "type": "[type] онлайн [sorting] [page]",
        "search": "Поиск фильма [search] [sorting] [page]",
        "num": "на странице [num]",
        "movie": {
            "movie": "[title_ru]",
            "online": "[title_ru] онлайн",
            "download": "[title_ru] скачать",
            "trailer": "[title_ru] трейлер",
            "picture": "[title_ru] кадры"
        },
        "sorting": {
            "kinopoisk-rating-up": "отсортировано по рейтингу КиноПоиска",
            "kinopoisk-rating-down": "отсортировано по рейтингу КиноПоиска",
            "imdb-rating-up": "отсортировано по рейтингу IMDb",
            "imdb-rating-down": "отсортировано по рейтингу IMDb",
            "kinopoisk-vote-up": "отсортировано по популярности на КиноПоиске",
            "kinopoisk-vote-down": "отсортировано по популярности на КиноПоиске",
            "imdb-vote-up": "отсортировано по популярности на IMDb",
            "imdb-vote-down": "отсортировано по популярности на IMDb",
            "year-up": "отсортировано по году",
            "year-down": "отсортировано по году",
            "premiere-up": "отсортировано по дате премьеры",
            "premiere-down": "отсортировано по дате премьеры"
        }
    },
    "descriptions": {
        "index": "Все фильмы в мире на нашем сайте",
        "year" : "Фильмы [year] года",
        "years" : "Фильмы по годам",
        "genre": "Фильмы в жанре [genre]",
        "genres" : "Фильмы по жанрам",
        "country": "Фильмы из страны [country]",
        "countries": "Фильмы по странам",
        "actor": "Фильмы с участием [actor]",
        "actors": "Самые популярные актеры",
        "director": "Фильмы которые срежиссировал [director]",
        "directors": "Самые популярные режиссеры",
        "type": "[type]",
        "search" : "Поиск фильма [search]",
        "movie": {
            "movie": "[title_ru] смотреть онлайн",
            "online": "[title_ru] смотреть онлайн",
            "download": "[title_ru] скачать",
            "trailer": "[title_ru] трейлер",
            "picture": "[title_ru] кадры"
        }
    },
    "sorting": {
        "kinopoisk-rating-up": "По рейтингу КП ⬆",
        "kinopoisk-rating-down": "По рейтингу КП ⬇",
        "imdb-rating-up": "По рейтингу IMDb ⬆",
        "imdb-rating-down": "По рейтингу IMDb ⬇",
        "kinopoisk-vote-up": "По популярности КП ⬆",
        "kinopoisk-vote-down": "По популярности КП ⬇",
        "imdb-vote-up": "По популярности IMDb ⬆",
        "imdb-vote-down": "По популярности IMDb ⬇",
        "year-up": "По году ⬆",
        "year-down": "По году ⬇",
        "premiere-up": "По дате премьеры ⬆",
        "premiere-down": "По дате премьеры ⬇"
    },
    "urls": {
        "prefix_id": "id",
        "unique_id": 0,
        "separator": "-",
        "movie_url": "[prefix_id][separator][title_ru][separator][title_en]",
        "movie": "movie",
        "year" : "year",
        "genre": "genre",
        "country": "country",
        "actor": "actor",
        "director": "director",
        "type": "type",
        "search" : "search",
        "sitemap" : "sitemap",
        "admin": "admin",
        "types": {
            "serial": "сериалы",
            "movie": "фильмы",
            "mult": "мультфильмы",
            "tv": "тв-передачи",
            "anime": "аниме"
        },
        "movies": {
            "online": "online",
            "download": "download",
            "trailer": "trailer",
            "picture": "picture"
        }
    }
};