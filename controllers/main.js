'use strict';
// API main controller

const http = require('http');
const https = require('https');
const url = require('url');
const striptags = require('striptags');
const sanitizeHtml = require('sanitize-html');

/**
 * Fetch pages from supplied URLs
 * @param {array} list of URLs.
 */
function getPage(URLs) {
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
    
        // TODO 404 errors not handled
    
        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });
        
        req.end();
    } // for()
} // getPage()

/**
 * Parse page callback. Called from 'getPage()'.
 * @param {https.ServerResponse} response  Response from server.
 */
function parsePage(response) {
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

module.exports.getPage = getPage;
