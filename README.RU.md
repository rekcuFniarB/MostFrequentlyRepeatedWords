MostFrequentlyRepeatedWords
===========================

Пример реализации REST API на Node.js

Сервис принимает URL страниц возвращает PDF файл с таблицей наиболее часто встречающихся слов.

Установка
---------

Скачать проект, запустить `npm install`.

При необходимости можно изменить настройки по умолчанию, для этого необходимо скопировать файл `config.defalt.js` в `config.local.js` и редактировать последний.

Использование
-------------

Запускать командой `npm run`.

Запросы следует отправлять из AJAX на URL `/api/wordstats/` методом `POST` в формате `application/x-www-form-urlencoded`.

Адреса страниц передаются в параметре `url`. Для передачи нескольких ссылок следует передать несколько параметров `url`, например:

    url=http://example.com&url=http://example.net&url=http://example.org

Другие опциональные параметры запроса:

* `showcount`: показывать число найденных слов.
* `nocache`: игнорировать кеш, сгенерировать PDF заново.
* `fontsize`: использовать другой размер шрифта. По умолчанию 7pt. Принимаются любые размеры, доступные в CSS.
* `redirect`: вместо JSON ответить редиректом на PDF файл.

Ответ приходит в формате JSON. Пример возвращаемого результата:

```json
    {
        "pdf": "/cache/pdf/a4c3dfc4da64dc7c814a3225c49c86f1.pdf",
        "cached": false
    }
```

где:

* pdf: относительная ссылка на сгенерированный PDF файл.
* cached: `false`, если файл сгенерирован новый и `true`, если файл уже был в кеше.

Пример отправки запроса с помощью `curl`:

```bash
curl  --data url='https://habr.com/ru/' --data url='https://news.ycombinator.com/item?id=20685944' 'http://localhost:8080/api/wordstats/'
```

### Примеры генерируемого PDF файла:

![screenshot](https://i.imgur.com/TW2YEqz.png)

С параметром `showcount`:

![screenshot](https://i.imgur.com/jIdtLCm.png)

[Read in english](https://github.com/rekcuFniarB/MostFrequentlyRepeatedWords#readme)
