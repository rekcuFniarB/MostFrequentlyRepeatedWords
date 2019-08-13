// Default config. Don't edit this file,
// instead copy this file to "config.local.js".

const path = require('path');

module.exports = {
    // port listen to
    port: 8080,
    // Is it behind proxy?
    proxy: false,
    // Production mode
    production: false,
    // Static files directory
    static: path.join(__dirname, 'public'),
    // Directory where to store generated PDF files relative to static dir
    pdfs_dir: path.join('cache', 'pdf'),
    // Static URL
    static_url: '/'
};
