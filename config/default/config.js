module.exports = {
    "database": {
        "key": "FREE",
        "date": ""
    },
    "protocol": "http://",
    "domain": "example.com",
    "email": "support@example.com",
    "theme": "default",
    "country": "RU",
    "language": "ru",
    "image": {
        "addr": "cdn.cinemapress.org",
        "size": 180
    },
    "cache": {
        "time": 0,
        "addr": "127.0.0.1:11211",
        "p2p": 0
    },
    "sphinx": {
        "addr": "127.0.0.1:9306"
    },
    "nginx": {
        "addr": "127.0.0.1:3000"
    },
    "publish": {
        "start": 400000,
        "stop": 900000,
        "every" : {
            "hours": 1,
            "movies": 2
        },
        "text": 0,
        "required": [
            "title_ru",
            "poster"
        ],
        "thematic": {
            "type": "",
            "year": "",
            "genre": "",
            "country": "",
            "actor": "",
            "director": "",
            "query_id": "",
            "search": ""
        }
    },
    "default": {
        "count": 15,
        "sorting": "kinopoisk-vote-up",
        "pages": 4,
        "lastpage": 0,
        "days": 0,
        "image": "/themes/default/public/desktop/img/player.png",
        "votes": {
            "kp": 5000,
            "imdb": 5000
        },
        "donotuse": ["actor","director","search"]
    },
    "codes": {
        "head": "",
        "footer": "",
        "robots": "User-agent: *\nDisallow: /\nDisallow: /type/*/*\nDisallow: /movie/*/*\nDisallow: /year/*/*\nDisallow: /genre/*/*\nDisallow: /country/*/*\nDisallow: /director/*/*\nDisallow: /actor/*/*\nDisallow: /search\nDisallow: /*?sorting*\nDisallow: /*?tag*\nDisallow: /*?q*\nDisallow: /iframe\nDisallow: /admin*"
    },
    "index": {
        "type": {
            "name": "Лучшие [type]",
            "keys": "",
            "sorting": "kinopoisk-rating-up",
            "count": 15,
            "order": 2
        },
        "year": {
            "name": "Фильмы [year] года",
            "keys": "2017",
            "sorting": "kinopoisk-vote-up",
            "count": 15,
            "order": 3
        },
        "genre": {
            "name": "Фильмы в жанре [genre]",
            "keys": "",
            "sorting": "imdb-vote-up",
            "count": 10,
            "order": 4
        },
        "country": {
            "name": "Фильмы из страны [country]",
            "keys": "",
            "sorting": "imdb-rating-up",
            "count": 10,
            "order": 5
        },
        "actor": {
            "name": "Лучшие фильмы [actor]",
            "keys": "",
            "sorting": "kinopoisk-vote-up",
            "count": 10,
            "order": 6
        },
        "director": {
            "name": "Лучшие фильмы [director]",
            "keys": "",
            "sorting": "kinopoisk-vote-up",
            "count": 10,
            "order": 7
        },
        "ids": {
            "name": "Новые фильмы",
            "keys": "",
            "count": 10,
            "order": 1
        },
        "count": {
            "type": "year",
            "key": "2017",
            "sorting": "kinopoisk-vote-up"
        }
    },
    "titles": {
        "index": "Легальный каталог фильмов",
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
        "type": "[type] [sorting] [page]",
        "search": "Поиск фильма «[search]» [sorting] [page]",
        "num": "на странице [num]",
        "movie": {
            "movie": "[title]",
            "online": "[title] онлайн",
            "download": "[title] скачать",
            "trailer": "[title] трейлер",
            "picture": "[title] кадры"
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
        "index": "Сколько фильмов Вам удалось посмотреть на данный момент? Вероятней всего, довольно много, несколько сотен, а может и тысяч, если Вы заядлый киноман и не представляете себе вечер, без просмотра одного или нескольких кинолент. Либо Вы возможно очень любите сериалы и вечера проводите за просмотром нескольких серий увлекательного сериала. Как бы там ни было, Мы очень рады что Вы выбрали Наш сайт, как площадку для обсуждения и дискуссий с такими же кинолюбителями, как и Вы. Усаживайтесь поудобней, заварите чаю и да начнётся <span style='text-decoration:line-through'>срач</span> критика :)",
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
        "search" : "Поиск фильма «[search]»",
        "movie": {
            "movie": "Картина «[title]» была выпущена в [year] году и сразу завоевала внимание зрителей в разных [уголках Земли|частях планеты]. Киноленты из жанра [genre] всегда пользовались особой популярностью, к тому же, когда их снимают такие именитые режиссеры, как [director]. Страна, которая приложила руку к этому кинопроизведению считается [country], потому зрители уже могут приблизительно представить уровень [красочности|логики|картинки|искусства] по аналогичным творениям.",
            "online": "[title] онлайн",
            "download": "[title] скачать",
            "trailer": "[title] трейлер",
            "picture": "[title] кадры"
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
        "translit": 0,
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
            "tv": "передачи",
            "anime": "аниме"
        },
        "movies": {
            "online": "",
            "download": "",
            "trailer": "",
            "picture": ""
        }
    }
};