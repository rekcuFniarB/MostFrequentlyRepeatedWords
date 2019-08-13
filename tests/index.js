// Some tests. I didn't cover whole project due to my laziness :) It's just a demo.

const assert = require ('assert');
const textprocess = require('../lib/textprocess');
const http = require('../lib/httprequest');

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
            let stats = textprocess.parsePage('<p>бугага</p> <p>ололо</p>');
            assert.deepEqual(stats, [['бугаг', 1, ['бугага']], ['олол', 1, ['ололо']]]);
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
