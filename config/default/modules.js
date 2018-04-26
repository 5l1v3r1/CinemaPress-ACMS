module.exports = {
    "comments": {
        "status": true,
        "data": {
            "cackle": {
                "id": "",
                "siteApiKey": "",
                "accountApiKey": ""
            },
            "hypercomments": {
                "widget_id": "",
                "sekretkey": "",
                "recent": {
                    "num_items": 0,
                    "excerpt_length": 250,
                    "display": [
                        "index"
                    ]
                }
            },
            "disqus": {
                "shortname": "cinemapress-acms",
                "api_key": "",
                "recent": {
                    "num_items": 5,
                    "excerpt_length": 250,
                    "hide_avatars": 0,
                    "display": [
                        "index"
                    ]
                }
            },
            "facebook": {
                "admins": ""
            },
            "vk": {
                "app_id": ""
            },
            "gplus": {
                "admins": ""
            },
            "sigcomments": {
                "host_id": ""
            }
        }
    },
    "slider": {
        "status": true,
        "data": {
            "movies": ["623250","493271","679486","538225","839650","470178","462849","497011","669089","818144","822709","589290","453397","841263","690593","677638","102383","575180","468940","484628","462682","420923"]
        }
    },
    "abuse": {
        "status": true,
        "data": {
            "imap": {
                "user": "",
                "password": "",
                "host": "",
                "port": 993,
                "tls": 1
            },
            "country": 0,
            "message": "Просмотр запрещен, сайт соблюдает<br>закон об авторском праве в цифровую эпоху!<br><br><img src=\"/themes/default/public/desktop/img/dmca.png\">",
            "movies": ["957762","927771","893880","893520","861616","838952","882285","948999","840818","932512","843821","908406","840234","839818"]
        }
    },
    "top": {
        "status": true,
        "data": {
            "sorting": "imdb-vote-up",
            "count": 15
        }
    },
    "soon": {
        "status": true,
        "data": {
            "count": 2,
            "movies": []
        }
    },
    "social": {
        "status": false,
        "data": {
            "vk": "https://vk.com/CinemaPress",
            "facebook": "https://www.facebook.com/CinemaPress.org",
            "twitter": "https://twitter.com/CinemaPress_org",
            "gplus": "https://plus.google.com/+CinemaPressOrg",
            "instagram": "https://www.instagram.com/CinemaPressOrg",
            "youtube": "https://www.youtube.com/channel/UCRW63_nu-cWw2obv6k04Pow"
        }
    },
    "related": {
        "status": true,
        "data": {
            "display": [
                "year"
            ],
            "types": {
                "year": {
                    "count": 6,
                    "name": "Фильмы [year] года",
                    "sorting": "kinopoisk-vote-up"
                },
                "genre": {
                    "count": 5,
                    "name": "Фильмы в жанре - [genre]",
                    "sorting": "kinopoisk-vote-up"
                },
                "country": {
                    "count": 10,
                    "name": "Фильмы из страны - [country]",
                    "sorting": "kinopoisk-vote-up"
                },
                "actor": {
                    "count": 15,
                    "name": "Лучшие фильмы актера - [actor]",
                    "sorting": "kinopoisk-vote-up"
                },
                "director": {
                    "count": 5,
                    "name": "Лучшие фильмы режиссера - [director]",
                    "sorting": "kinopoisk-vote-up"
                }
            }
        }
    },
    "schema": {
        "status": false
    },
    "continue": {
        "status": false
    },
    "viewed": {
        "status": true
    },
    "player": {
        "status": true,
        "data": {
            "display": "yohoho",
            "yohoho": {
                "player": "moonwalk,hdgo,newvideo,iframe,kodik,allserials,trailer",
                "bg": "#14181C",
                "button": ""
            },
            "moonwalk": {
                "token": ""
            },
            "hdgo": {
                "token": ""
            },
            "iframe": {
                "show": 0
            },
            "kodik": {
                "show": 0
            },
            "moonlight": {
                "domain": ""
            },
            "youtube": {
                "token": ""
            },
            "newvideo": {
                "api_key": ""
            }
        }
    },
    "blocking": {
        "status": true,
        "data": {
            "display": "legal",
            "share": {
                "time": 60,
                "message": "Поделитесь фильмом в одну из социальных сетей чтобы начать просмотр или подождите [timer] секунд и данное сообщение исчезнет."
            },
            "sub": {
                "keys": ["CP06368342850052267","CP10020891099182505","CP46955642915431706"],
                "message": "Просмотр доступен только по подписке. Приобретите подписку и активируйте ключ. <p><a href=\"https://digiseller.ru/\" target=\"_blank\" style=\"color:white;\">Купить подписку</a></p>"
            },
            "adv": {
                "time": 10,
                "code": "<div class=\"rklma\">Блок с Вашей рекламой в плеере</div>",
                "message": "Реклама позволяет Вам смотреть фильмы бесплатно. Пожалуйста отнеситесь к этому с пониманием. Вы сможете начать просмотр через [timer] секунд.",
                "skip": ""
            },
            "adblock": {
                "time": 60,
                "message": "Вы используете AdBlock или другие блокировщики рекламы. Пожалуйста отключите их на Нашем сайте чтобы не ждать. Вы сможете начать просмотр через [timer] секунд."
            },
            "legal": {
                "time": 20,
                "countries": "",
                "message": "Трейлер появится, через [timer] секунд. Чтобы отображать на этом месте плеер фильма, отключите <a href=\"/admin/blocking\" target=\"_blank\" style=\"color:white;\">в админ-панели модуль «Блокировка»</a>.\n\n<br><br>\n\n<div class=search-ggl onclick=\"window.open('https://href.li/?https://google.com/search?&tbm=vid&q=[title] [year] смотреть онлайн','_blank')\">Смотреть онлайн в <span class=g>G</span><span class=o>o</span><span class=o>o</span><span class=g>g</span><span class=l>l</span><span class=e>e</span></div>\n\n<div class=search-ynd  onclick=\"window.open('https://href.li/?https://yandex.ru/video/search?text=[title] [year] смотреть онлайн','_blank')\">Смотреть онлайн в <span class=y>Я</span>ндекс</div>"
            }
        }
    },
    "mobile": {
        "status": false,
        "data": {
            "theme": "light",
            "custom": {
                "a": "#99AABB",
                "hover": "#FFFFFF",
                "body_color": "#FFFFFF",
                "body_bg": "#14181C",
                "title_color": "#FFFFFF",
                "title_bg": "#445566",
                "description_color": "#FFFFFF",
                "description_bg": "#242D35",
                "block": "#2C3641",
                "form": "#2C3641",
                "btn_color": "#FFFFFF",
                "btn_bg": "#14181C"
            }
        }
    },
    "episode": {
        "status": false,
        "data": {
            "title": "[title] [season] сезон [episode] серия в озвучке [translate]",
            "description": "[title] [season] сезон [episode] серия в озвучке [translate]",
            "season": "сезон",
            "episode": "серия",
            "translate": "Перевод:",
            "default": "Оригинал",
            "index": {
                "name": "Новые серии сериалов",
                "count": 12,
                "order": 2
            }
        }
    },
    "adv": {
        "status": false,
        "data": {
            "target": 0,
            "desktop": {
                "all": {
                    "over": "<div class=\"rklma\">Блок с Вашей рекламой над плеером</div>",
                    "under": "<div class=\"rklma\">Блок с Вашей рекламой под плеером</div>",
                    "top": "<div class=\"rklma\">Блок с Вашей рекламой вверху страницы</div>",
                    "bottom": "<div class=\"rklma\">Блок с Вашей рекламой внизу страницы</div>",
                    "left": "<div class=\"rklma\">Блок с Вашей рекламой слева страницы</div>",
                    "right": "<div class=\"rklma\">Блок с Вашей рекламой справа страницы</div>"
                },
                "index": {
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "category": {
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "categories": {
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "movie": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "online": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "download": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "picture": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "trailer": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "episode": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                }
            },
            "mobile": {
                "all": {
                    "over": "<div class=\"rklma\">Блок с Вашей рекламой над плеером</div>",
                    "under": "<div class=\"rklma\">Блок с Вашей рекламой под плеером</div>",
                    "top": "<div class=\"rklma\">Блок с Вашей рекламой вверху страницы</div>",
                    "bottom": "<div class=\"rklma\">Блок с Вашей рекламой внизу страницы</div>",
                    "left": "<div class=\"rklma\">Блок с Вашей рекламой слева страницы</div>",
                    "right": "<div class=\"rklma\">Блок с Вашей рекламой справа страницы</div>"
                },
                "index": {
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "category": {
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "categories": {
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "movie": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "online": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "download": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "picture": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "trailer": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                },
                "episode": {
                    "over": "",
                    "under": "",
                    "top": "",
                    "bottom": "",
                    "left": "",
                    "right": ""
                }
            }
        }
    },
    "content": {
        "status": true,
        "data": {
            "title": "Страницы сайта",
            "description": "Страницы сайта",
            "url": "content",
            "news": {
                "count": 2,
                "tags": "новость"
            },
            "index": {
                "count": 12,
                "url": "poslednie-obnovleniya-filmov",
                "order": 2
            },
            "movie": {
                "count": 2
            },
            "auto": {
                "moonwalk_movies": {
                    "count": 12,
                    "url": "poslednie-obnovleniya-filmov"
                },
                "moonwalk_serials": {
                    "count": 12,
                    "url": ""
                },
                "hdgo_movies": {
                    "count": 12,
                    "url": "poslednie-obnovleniya-filmov"
                },
                "hdgo_serials": {
                    "count": 12,
                    "url": ""
                },
                "kodik_movies": {
                    "count": 12,
                    "url": "poslednie-obnovleniya-filmov"
                },
                "kodik_serials": {
                    "count": 12,
                    "url": ""
                }
            }
        }
    },
    "rss": {
        "status": false
    },
    "unique": {
        "status": false,
        "data": {
            "token": ""
        }
    },
    "voting": {
        "status": false
    },
    "bots": {
        "status": false,
        "data": {
            "token": ""
        }
    }
};