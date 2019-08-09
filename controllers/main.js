'use strict';
// API main controller

const http = require('http');
const https = require('https');
const url = require('url');
const striptags = require('striptags');
const sanitizeHtml = require('sanitize-html');

/**
 * POST request handler for url /parse-pages/.
 * @param {object} request   request instance
 * @param {object} response  response instance
 */
function parsePages(request, response) {
    console.log(request.query);
}

/**
 * Fetch pages from supplied URLs
 * @param {array} list of URLs.
 */
function getPages(URLs) {
    for (let i=0; i<URLs.length; i++) {
        let URL = new url.URL(URLs[i]);
        let www;
        // This is strange. No idea why Node uses different modules for https
        if (URL.protocol == 'http:')
            www = http;
        else if (URL.protocol == 'https:')
            www = https;
        else
            throw new Error(`Wrong protocol in URL ${URL}.`);
        
        // Make request and pass response to 'parsePage' callback.
        const req = www.request(URL, parsePage);
        // console.log('__DEBUG__: after request'); // checking if above is async.
        
        req.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
        });
        
        req.end();
    } // for()
} // getPage()

/**
 * Parse page callback. Called from 'getPage()'.
 * @param {https.ServerResponse} response  Response from server.
 */
function parsePage(response) {
    if (response.statusCode >= 400) {
        console.error('__DEBUG__: response code:', response.statusCode);
        // TODO
    }
    
    //response.on('error', (e) => {
            //console.error(`Response error: ${e.message}`);
    //});
    
    var page = '';
    response.on('data', (chunk) => {
        page += chunk;
    }).
      on('end', () => {
          // Sanitize (remove <sctipt>, <style> and other blocks) and strip html tags.
          page = striptags(sanitizeHtml(page));
          console.log(page);
    });
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
