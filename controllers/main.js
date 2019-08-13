'use strict';
// API main controller

const url = require('url');
// My custom http/https module wrapper:
const httpRequest = require('../lib/httprequest');
// Importing my custom text processing module:
const textprocess = require('../lib/textprocess');
// Importing HTML template renderer
const pug = require('pug');
const path = require('path');
//Importing HTML to PDF converter tool
const pdf = require('html-pdf');
const md5 = require('md5');
const fs = require('fs');


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
function wordStats(request, response) {
    if (typeof(request.body.url) === 'undefined') {
        // No urls specified, send error response
        return errorResponse(request, response, 'Bad request. No URL specified.', 400);
    }
    
    let URLs;
    if (typeof(request.body.url) === 'string')
        // only one URL was supplied, make it an array
        URLs = [request.body.url];
    else
        URLs = request.body.url;
    
    // Checking some request params:
    // Should we show words count
    let showcount = false;
    let wordCut = 16;
    if (typeof(request.body.showcount) !== 'undefined') {
        showcount = true;
        wordCut = 13;
    }
    
    // Font size
    let fontSize = '7pt';
    if(typeof(request.body.fontsize) !== 'undefined')
        fontSize = request.body.fontsize;
    
    // should we skip cache?
    let nocache = false;
    if (typeof(request.body.nocache) !== 'undefined')
        nocache = true;
     
    // should we redirect to PDF file instead of returning JSON
    let redirect = false;
    if (typeof(request.body.redirect) !== 'undefined')
        redirect = true;
    
    // this will be used for PDF filename.
    const reqID = md5(JSON.stringify(request.body));
    // file, PDF will be written to
    const pdfFile = path.join(request.app.get('static_dir'), request.app.get('pdfs_dir'), `${reqID}.pdf`);
    // preparing AJAX JSON response
    const jsresp = ({
        pdf: path.join(request.app.get('static_url'), request.app.get('pdfs_dir'), `${reqID}.pdf`),
        cached: false,
        error: false
    });
    
    // Check if PDF file exists and reuse already cached file.
    let fileExists = false;
    if (!nocache) {
        // use cached if exists
        fileExists = true;
        try {
            fs.statSync(pdfFile);
            // file already exists, just return it
            jsresp.cached = true;
        } catch (e) {
            // file not found
            fileExists = false;
        }
    } else {
        // Refresh cached file if "nocache" param in request.
        fileExists = false;
    }
    
    if (fileExists) {
        // File already cached, skip parsing, just return existing file.
        if (redirect)
            // redirect to PDF file
            return response.redirect(jsresp.pdf);
        else
            // return link to PDF in AJAX JSON response
            return response.json(jsresp);
    }
    
    // Parsing all urls asynchronously. getPages() returns array of
    // promises for each URL.
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
                // Cut long words
                words[j] = textprocess.cutString(words[j], wordCut, true);
                // add words count if requested
                if (showcount)
                    words[j] += ` (${count})`;
            } // foreach word
            
            // Cut long urls.
            let URL = textprocess.cutString(data[i].URL, 54, true);
            
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
        const template = path.join(request.app.get('views'), 'parse-page.pug');
        const html = pug.renderFile(template, {
            title: 'Most repeating words',
            rows: rows,
            fontSize: fontSize
        });
        //response.send(html);
        const pdfOpts = {
            format: 'A4',
            orientation: 'portrait',
            border: '4mm'
        };
        
        
        pdf.create(html, pdfOpts).toFile(pdfFile, (error, result) => {
            if (error) {
                return errorResponse(request, response, error, 400);
            }
            if (redirect)
                // redirect to PDF file
                return response.redirect(jsresp.pdf);
            else
                // return link to PDF with AJAX JSON response
                return response.json(jsresp);
        }); // pdf.create()
        
    }). // promise.all.then
        catch((error) => {
            return errorResponse(request, response, error, 400);
        });
}

/**
 * Asynchronously fetch pages from supplied URLs
 *  and return array of promises.
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
function frontPage(request, response) {
    response.send('See "README.md" for usage.');
}


module.exports.frontPage = frontPage;
module.exports.wordStats = wordStats;
