// My http/https modules wrapper returning promise

const url = require('url');
const http = require('http');
const https = require('https');

module.exports = function request(_URL) {
    return new Promise((resolve, reject) => {
        let URL = new url.URL(_URL);
        let www;
        // This is strange. No idea why Node uses different module for https
        if (URL.protocol == 'http:')
            www = http;
        else if (URL.protocol == 'https:')
            www = https;
        else
            //throw new Error(`Wrong protocol in URL ${URL}.`);
            reject(`Wrong protocol in URL ${URL}.`);
        
        // Make request and pass response to 'parsePage' callback.
        const req = www.request(URL, (response) => {
            if (response.statusCode >= 400) {
                reject(`HTTP Error: URL ${_URL} returned ${response.statusCode}`);
            }
            
            let page = '';
            response.on('data', (chunk) => {
                page += chunk;
            }).
                // got complete page
                on('end', () => {
                    resolve(page);
                });
        }); // www.request()
        
        req.on('error', (e) => {
            reject(`Problem with request: ${e.message}, URL: ${_URL}`);
        });
        
        req.end();
    }); // Promise()
}
