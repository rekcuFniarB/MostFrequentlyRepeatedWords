'use strict';
// API main controller

const url = require('url');
const striptags = require('striptags');
const sanitizeHtml = require('sanitize-html');
// My custom http/https module wrapper:
const httpRequest = require('httprequest');
// Importing 3rd party tokenizer and stemming functions:
const natural = require('natural');


/**
 * Error Response (JSON)
 * @param {Object} request   Request object.
 * @param {Object} response  Response object.
 * @param {String} message   Error message.
 * @param {Number} code     HTTP error code.
 * @return {Object}
 */
function errorResponse(request, response, message, code) {
    if (typeof(code) === 'undefined')
        code = 404;
    response.status(code);
    return response.json({
        error: true,
        errorMessage: message
    });
} // errorResponse()

/**
 * POST request handler for url /parse-pages/.
 * @param {object} request   request instance
 * @param {object} response  response instance
 */
function parsePages(request, response) {
    if (typeof(request.query.url) === 'undefined') {
        // No urls specified, send error response
        return errorResponse(request, response, 'Bad request.', 400);
    }
    
    let URLs;
    if (typeof(request.query.url) === 'string')
        // only one URL was supplied, make it an array
        URLs = [request.query.url];
    else
        URLs = request.query.url;
    
    let promises = getPages(URLs);
    
    let pages = '';
    Promise.all(promises).then(data => {
        for (let i=0; i<data.length; i++) {
            pages += parsePage(data[i]);
        }
        response.send(pages);
    }).
        catch((error) => {
            errorResponse(request, response, error, 400);
        });
}

/**
 * Fetch pages from supplied URLs
 * @param {Array}  list of URLs.
 * @return {Array} list of promises
 */
function getPages(URLs) {
    var promises = [];
    // fetch each page and store promises in array
    for (let i=0; i<URLs.length; i++) {
        // fill array with promises
        promises.push(httpRequest(URLs[i]));
    } // for()
    return promises;
} // getPage()

/**
 * Parse HTML page.
 * @param {String} html  Response from server.
 * @return {Array} List of stems and words occurence stats.
 */
function parsePage(html) {
    // Tokenizing input text
    const text = striptags(sanitizeHtml(html));
    const tokenizer = new natural.WordTokenizer();
    const words = tokenizer.tokenize(text);
    let stems = []; // contains list of [stem, count, [word, ...]]
    for (let i=0; i<words.length; i++) {
        if (words[i].length < 3)
            // skip short words
            continue;
        
        let stem = '';
        // check if word is russian and use russian stemming
        // or use english sttemming otherwise.
        if (isRussian(words[i]))
            stem = natural.PorterStemmerRu.stem(words[i]);
        else
            stem = natural.PorterStemmer.stem(words[i]);
        
        // search for this stem in stems stats
        let index;
        let search = stems.filter((item, ind) => {
            if (item[0] == stem) {
                index = ind;
                return true;
            }
        });
        
        if (search.length == 0) {
            // not found, create new stat for this stem
            stems.push([stem, 1, [words[i]]]);
        }
        else {
            // stem was already stored, just update stats
            stems[index][1]++; // increasing word occurence counter
            
            // storing word
            if (!stems[index][2].includes(words[i]))
                stems[index][2].push(words[i]);
        }
    } // for()
    
    return stems;
} // parsePage()

/**
 * Test if given string is in russian.
 * @param {String} input string
 * @return {Bool}
 */
function isRussian(string) {
    const cyr = /^[\s\u0410-\u0451]+$/;
    return cyr.test(string);
}


/**
 * Main page GET request handler for url '/'.
 * @param {object} request   request instance
 * @param {object} response  response instance
 */
function hello(request, response) {
    response.send('Hello World!');
}

module.exports.getPage = getPages;
module.exports.hello = hello;
module.exports.parsePages = parsePages;
