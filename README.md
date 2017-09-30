# CinemaPress ACMS

 ![Admin panel CinemaPress ACMS](https://raw.githubusercontent.com/CinemaPress/CinemaPress.github.io/master/images/cinemapress-acms/new_admin.png)
 
 :movie_camera: Автоматическая система управления сайтом.

- [DEMO.CinemaPress.org](http://DEMO.CinemaPress.org)
- [DEMO.CinemaPress.org/admin](http://DEMO.CinemaPress.org/admin)

## Установка:
- [Где зарегистрировать домен?](https://cinemapress.org/article/gde-kupit-domen.html)
- [Где арендовать VPS сервер?](https://cinemapress.org/article/gde-kupit-server.html)
- [Как установить CinemaPress ACMS?](https://cinemapress.org/article/kak-ustanovit-cinemapress-acms.html)
- [Первые шаги после создания сайта](https://cinemapress.org/article/cinemapress-acms.html)
- [Что означают опции установочного меню?](https://cinemapress.org/article/opcii-ustanovki-cinemapress-acms.html)

Работает на чистом Debian 8 «Jessie» (64-bit) или Debian 9 «Stretch» (64-bit) без никаких панелей управления:

```
~# wget cinemapress.org/i -qO i && chmod +x i && ./i
```

### Проблема с установкой?

 Если команду установки не получилось запустить, выполните эту команду, а затем повторите попытку:
 
```
~# apt-get -y -qq update && apt-get -y -qq install wget ca-certificates
```

Когда по каким-то причинам основной сервер недоступен, можете воспользоваться одним из запасных:

```
~# wget cinemapress.aerobatic.io/i -qO a && chmod +x a && ./a
~# wget cinemapress.bitbucket.io/i -qO b && chmod +x b && ./b
~# wget cinemapress.coding.me/i -qO c && chmod +x c && ./c
~# wget cinemapress.gitlab.io/i -qO l && chmod +x l && ./l
~# wget cinemapress.github.io/i -qO h && chmod +x h && ./h
```

## Обновление:

Обновление **CinemaPress ACMS** до последней версии в репозитории. [Подробнее ...](https://cinemapress.org/article/opcii-ustanovki-cinemapress-acms.html#option2)

```
~# wget cinemapress.org/i -qO i && chmod +x i && ./i 2
```

## Мониторинг работы сайта

**CinemaPress ACMS** использует менеджер процессов ``PM2``, поэтому чтобы отслеживать работоспособность сайта, Вы можете использовать [keymetrics](https://app.keymetrics.io).

- регистрируетесь;
- создаете ``New bucket``;
- получаете ключи;
- соединяетесь с сервером командами:

```
~# pm2 link [secret key] [public key] CinemaPress
~# pm2 install pm2-server-monit
```

 ![Мониторинг CinemaPress ACMS](https://raw.githubusercontent.com/CinemaPress/CinemaPress.github.io/master/images/admin/pm2.png)

## Распределение нагрузки

Если Ваш сайт стал достаточно посещаемым, то для распределения нагрузки, можно вынести некоторые пакеты на отдельные сервера. [Подробнее ...](https://cinemapress.org/article/opcii-ustanovki-cinemapress-acms.html#option5)

###### Установка CinemaPress ACMS сервера:

```
~# wget cinemapress.org/i -qO i && chmod +x i && ./i 5
```

###### Установка Sphinx сервера:

```
~# wget cinemapress.org/i -qO i && chmod +x i && ./i 6
```

###### Установка Memcached сервера:

```
~# wget cinemapress.org/i -qO i && chmod +x i && ./i 7
```

## Массовая установка/обновление/добавление
Установка нескольких сайтов одной командой поможет сэкономить дорогие минуты простоя сайтов в случае переезда на другой сервер. [Подробнее ...](https://cinemapress.org/article/chto-takoe-massovaya-ustanovka.html)

```
~# wget cinemapress.org/i -qO i && chmod +x i && ./i 8
```

# CinemaPress DataBase
 :minidisc: База данных ~ **600 000 фильмов/сериалов** (все фильмы/сериалы планеты).

## Импорт:
После успешного запуска и разобравшись с работой в админ-панели **CinemaPress ACMS**, можете [приобрести](https://cinemapress.org/) и импортировать полную базу данных. [Подробнее ...](https://cinemapress.org/article/kak-dobavit-vse-filmy-v-mire.html)

```
~# wget cinemapress.org/i -qO i && chmod +x i && ./i 4
```

# CinemaPress Themes

Бесплатные шаблоны оформления, которые Вы можете использовать на своих сайтах. Установка нового шаблона, как и установка CinemaPress ACMS сводится к выполнению одной команды. [Подробнее ...](https://cinemapress.org/article/kak-ustanovit-shablon.html)

```
~# wget cinemapress.org/i -qO i && chmod +x i && ./i 3
```

## Шаблон «hodor»

- Скачать с [GitHub](https://github.com/CinemaPress/Theme-Hodor/) или [GitLab](https://gitlab.com/CinemaPress/Theme-Hodor/) или [BitBucket](https://bitbucket.org/cinemapress/theme-hodor/) или [Coding](https://coding.net/u/CinemaPress/p/Theme-Hodor/)
- DEMO: [Hodor.CinemaPress.org](http://Hodor.CinemaPress.org/)

![Тема оформления «hodor»](https://raw.githubusercontent.com/CinemaPress/Theme-Hodor/master/screenshot.png)

## Шаблон «sansa»

- Скачать с [GitHub](https://github.com/CinemaPress/Theme-Sansa/) или [GitLab](https://gitlab.com/CinemaPress/Theme-Sansa/) или [BitBucket](https://bitbucket.org/cinemapress/theme-sansa/) или [Coding](https://coding.net/u/CinemaPress/p/Theme-Sansa/)
- DEMO: [Sansa.CinemaPress.org](http://Sansa.CinemaPress.org/)

![Тема оформления «sansa»](https://raw.githubusercontent.com/CinemaPress/Theme-Sansa/master/screenshot.png)

## Шаблон «robb»

- Скачать с [GitHub](https://github.com/CinemaPress/Theme-Robb/) или [GitLab](https://gitlab.com/CinemaPress/Theme-Robb/) или [BitBucket](https://bitbucket.org/cinemapress/theme-robb/) или [Coding](https://coding.net/u/CinemaPress/p/Theme-Robb/)
- DEMO: [Robb.CinemaPress.org](http://Robb.CinemaPress.org/)

![Тема оформления «robb»](https://raw.githubusercontent.com/CinemaPress/Theme-Robb/master/screenshot.png)

## Шаблон «ramsay»

- Скачать с [GitHub](https://github.com/CinemaPress/Theme-Ramsay/) или [GitLab](https://gitlab.com/CinemaPress/Theme-Ramsay/) или [BitBucket](https://bitbucket.org/cinemapress/theme-ramsay/) или [Coding](https://coding.net/u/CinemaPress/p/Theme-Ramsay/)
- DEMO: [Ramsay.CinemaPress.org](http://Ramsay.CinemaPress.org/)

![Тема оформления «ramsay»](https://raw.githubusercontent.com/CinemaPress/Theme-Ramsay/master/screenshot.png)

## Шаблон «tyrion»

- Скачать с [GitHub](https://github.com/CinemaPress/Theme-Tyrion/) или [GitLab](https://gitlab.com/CinemaPress/Theme-Tyrion/) или [BitBucket](https://bitbucket.org/cinemapress/theme-tyrion/) или [Coding](https://coding.net/u/CinemaPress/p/Theme-Tyrion/)
- DEMO: [Tyrion.CinemaPress.org](http://Tyrion.CinemaPress.org/)

![Тема оформления «tyrion»](https://raw.githubusercontent.com/CinemaPress/Theme-Tyrion/master/screenshot.png)

## Шаблон «cersei»

- Скачать с [GitHub](https://github.com/CinemaPress/Theme-Cersei/) или [GitLab](https://gitlab.com/CinemaPress/Theme-Cersei/) или [BitBucket](https://bitbucket.org/cinemapress/theme-cersei/) или [Coding](https://coding.net/u/CinemaPress/p/Theme-Cersei/)
- DEMO: [Cersei.CinemaPress.org](http://Cersei.CinemaPress.org/)

![Тема оформления «cersei»](https://raw.githubusercontent.com/CinemaPress/Theme-Cersei/master/screenshot.png)

## Шаблон «joffrey»

- Скачать с [GitHub](https://github.com/CinemaPress/Theme-Joffrey/) или [GitLab](https://gitlab.com/CinemaPress/Theme-Joffrey/) или [BitBucket](https://bitbucket.org/cinemapress/theme-joffrey/) или [Coding](https://coding.net/u/CinemaPress/p/Theme-Joffrey/)
- DEMO: [Joffrey.CinemaPress.org](http://Joffrey.CinemaPress.org/)

![Тема оформления «joffrey»](https://raw.githubusercontent.com/CinemaPress/Theme-Joffrey/master/screenshot.png)

## Шаблон «drogo»

- Скачать с [GitHub](https://github.com/CinemaPress/Theme-Drogo/) или [GitLab](https://gitlab.com/CinemaPress/Theme-Drogo/) или [BitBucket](https://bitbucket.org/cinemapress/theme-drogo/) или [Coding](https://coding.net/u/CinemaPress/p/Theme-Drogo/)
- DEMO: [Drogo.CinemaPress.org](http://Drogo.CinemaPress.org/)

![Тема оформления «drogo»](https://raw.githubusercontent.com/CinemaPress/Theme-Drogo/master/screenshot.png)

## Шаблон «bran»

- Скачать с [GitHub](https://github.com/CinemaPress/Theme-Bran/) или [GitLab](https://gitlab.com/CinemaPress/Theme-Bran/) или [BitBucket](https://bitbucket.org/cinemapress/theme-bran/) или [Coding](https://coding.net/u/CinemaPress/p/Theme-Bran/)
- DEMO: [Bran.CinemaPress.org](http://Bran.CinemaPress.org/)

![Тема оформления «bran»](https://raw.githubusercontent.com/CinemaPress/Theme-Bran/master/screenshot.png)

# Параметры и модули CinemaPress ACMS

Подробную информацию о всех параметрах и модулях системы Вы найдете в [документации](https://cinemapress.org/admin/admin.html).

# Использование CinemaPress ACMS

CinemaPress ACMS распространяется под [MIT лицензией](https://github.com/CinemaPress/CinemaPress-ACMS/blob/master/LICENSE.txt).

© 2016-2017 CinemaPress ACMS