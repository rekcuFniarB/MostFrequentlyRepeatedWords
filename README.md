MostFrequentlyRepeatedWords
===========================

Example REST API written in Node.js

This service receives list of URLs and returns PDF file with stats of most repeated words in the pages.

Installing
----------

Download the project and run `npm install`.

To change default settings, copy `config.default.js` to `config.local.js` and edit the second.

Usage
-----

Start the service with command `npm run`.

Requests should be made from AJAX to the URL `/api/wordstats/` using `POST` method in `application/x-www-form-urlencoded` format. 

URLs should be passed in `url` params. Example request:

    url=http://example.com&url=http://example.net&url=http://example.org

Optional request params:

* `showcount`: show words count.
* `nocache`: ignore cache, generage new PDF file.
* `fontsize`: override font size. Default 7pt. Any CSS dimensions accepted.
* `redirect`: Redirect to PDF file instead of JSON response.

By default response is in JSON format. Example response:

```json
    {
        "pdf": "/cache/pdf/a4c3dfc4da64dc7c814a3225c49c86f1.pdf",
        "cached": false
    }
```

where:

* pdf: relative PDF file path to download.
* cached: `false` if PDF file was generated new and `true` if file was already cached.

Example request using `curl`:

```bash
curl  --data url='https://habr.com/ru/' --data url='https://news.ycombinator.com/item?id=20685944' 'http://localhost:8080/api/wordstats/'
```

### Exaple resulting PDF files:

![screenshot](https://i.imgur.com/TW2YEqz.png)

With `showcount` param:

![screenshot](https://i.imgur.com/jIdtLCm.png)

[Read in russian](./README.RU.md#readme)
