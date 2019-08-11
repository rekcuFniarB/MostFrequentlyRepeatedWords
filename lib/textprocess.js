// My text processing module.

// Importing 3rd party tokenizer and stemming functions:
const natural = require('natural');
// Importing HTML filtering functions:
const striptags = require('striptags');
const sanitizeHtml = require('sanitize-html');

/**
 * Parse HTML page.
 * @param {String} html  HTML or plain text.
 * @return {Array} List of most repeated words in format of
 *     ['stem', count, ['word', ...]]
 */
module.exports.parsePage = function(html) {
    // Tokenizing input text
    const text = striptags(sanitizeHtml(html)).
        // stupid tokenizer bug workaround:
        split('ё').join('ъщьжъ').split('Ё').join('ЪЩЬЖЪ');
    const tokenizer = new natural.WordTokenizer();
    const words = tokenizer.tokenize(text);
    let stems = []; // contains list of [stem, count, [word, ...]]
    for (let i=0; i<words.length; i++) {
        if (words[i].length < 5)
            // skip short words
            continue;
        
        // Fixing word back (tokenizer bug workaround)
        words[i] = words[i].split('ъщьжъ').join('ё').split('ЪЩЬЖЪ').join('Ё');
        
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
    
    // sort stems list placing most repeated words to the top
    stems = stems.sort((a, b) => {
        return b[1] - a[1];
    });
    
    return stems;
}; // parsePage()

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
 * Search for shortest word in the list.
 * @param {Array}   List of words.
 * @return {String} Shortest word from input list.
 */
module.exports.shortestWord = function(words) {
    return words.sort((a, b) => b.length - a.length).pop();
};
