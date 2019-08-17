// Some tests

const assert = require ('assert');
const textprocess = require('../lib/textprocess');
const http = require('../lib/httprequest');
const express = require('express');
const controller = require('../controllers/main');
const path = require('path');
const fs = require('fs');

describe('TextProcess module', function() {
    describe('cutString', function() {
        it('cuts string to N chars', function() {
            let txt = textprocess.cutString('qwertyuiop', 5);
            assert.equal(txt, 'qwert'); 
        });
    });
    
    describe('shortestWord', function() {
        it('finds shortest word in list', function() {
            let word = textprocess.shortestWord(['xxxx', 'yyy', 'zzzzzz']);
            assert.equal(word, 'yyy');
        });
    });
    
    describe('parsePage', function() {
        it('parses page to list of words stats', function() {
            let stats = textprocess.parsePage('<p>в августе дождь</p>\n<p>август, дожди блин, 17 августа</p>');
            assert.deepEqual(stats, [
                ['август', 3, ['августе', 'август', 'августа']],
                ['дожд', 2, ['дождь', 'дожди']]
            ]);
        });
    });
});

describe('My custom http request module.', function() {
    describe('HTTP request:', function() {
        it('downloads a page from URL', function () {
            let URL = 'https://example.com'
            let p = http('https://example.com');
            p.then(response => {
                assert.deepEqual([URL, 1270], [response.URL, response.content.length]);
            });
        });
    });
});

describe('Controller', function() {
    describe('wordstats', function() {
        it('Generates a PDF file and returns proper response.', function(done) {
            const app = express();
            app.set('static_dir', path.join(__dirname, '..', 'public'));
            app.set('pdfs_dir', path.join('cache', 'pdf'));
            app.set('static_url', app.get('static_dir'));
            // view engine setup
            app.set('views', path.join(__dirname, '..', 'views'));
            app.set('view engine', 'pug');
            app.request.body = {url: ['https://example.com'], showcount: 1, nocache: 1};
            // Mocking response.send() and response.json() methods.
            let res = new Promise((resolve, reject) => {
                app.response.send = resolve;
            });
            app.response.json = app.response.send;
            controller.wordStats(app.request, app.response);
            res.then(rsp => {
                rsp.fileExists = false;
                try {
                    // check if PDF file created
                    fs.statSync(rsp.pdf);
                    rsp.fileExists = true;
                } catch (e) {
                    // file not found
                    pdf.fileExists = false;
                }
                assert.deepEqual([rsp.error, rsp.fileExists], [false, true]);
                done();
            });
        });
    });
});
