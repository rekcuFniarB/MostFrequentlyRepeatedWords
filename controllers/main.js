'use strict';
// API main controller

const url = require('url');
// My custom http/https module wrapper:
const httpRequest = require('../lib/httprequest');
// Importing my custom text processing module:
const textprocess = require('../lib/textprocess');

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
    
    let showcount = false;
    if (typeof(request.query.showcount) !== 'undefined')
        showcount = true;
    
    let promises = getPages(URLs);
    
    let rows = [];
    let words;
    Promise.all(promises).then(data => {
        // Prepare data for template:
        for (let i=0; i<data.length; i++) {
            // this is a list containing stats of words for a page
            words = textprocess.parsePage(data[i].content);
            // Get 3 most repeated words
            words = words.slice(0,3);
            for (let j=0; j<words.length; j++) {
                // Find shortest form of word
                let count = words[j][1];
                words[j] = textprocess.shortestWord(words[j][2]);
                // add words count if requested
                if (showcount)
                    words[j] += ` (${count})`;
            } // foreach word
            
            // Cut long urls.
            let URL = data[i].URL;
            if (URL.length > 64)
                URL = URL.slice(0, 64) + '...'
            
            // add page URL
            words.unshift(URL);
            
            // Add missing columns, we need exactly 4
            if (words.length < 4)
                words[3] = '';
            
            rows.push(words);
        } // for each response
        
        // Now we should have such format to pass into template:
        //     [
        //       [url, word, word, word],
        //       [url, word, word, word],
        //       ...
        //     ]
        response.render('parse-page.pug', {title: 'Most repeating words', rows: rows});
        //pug.renderFile(path, ?options, ?callback)
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
 * Main page GET request handler for url '/'.
 * @param {object} request   request instance
 * @param {object} response  response instance
 */
function hello(request, response) {
    response.send('Hello World!');
}


module.exports.hello = hello;
module.exports.parsePages = parsePages;
