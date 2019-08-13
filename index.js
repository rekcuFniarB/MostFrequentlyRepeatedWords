'use stict';

const express = require('express')
const app = express();
const controller = require('./controllers/main');
const path = require('path');
// load config
let config;
try {
    // Try to load custom config
    config = require('./config.local');
} catch (e) {
    // or default config if custom not exists
    config = require('./config.default');
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('pdfs_dir', config.pdfs_dir);
app.set('static_dir', config.static);
app.set('static_url', config.static_url);

if (config.proxy)
    app.enable('trust proxy');

// Not sure if it will work this way.
if (config.production)
    app.set('env', 'production');

//// Express middlewares setup (copied from MDN)
//app.use(logger('dev'));
//app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
// Serve static files from './public' directory
app.use(express.static(app.get('static_dir')));

// Routing
app.get('/', controller.frontPage);
app.post('/api/wordstats/', controller.wordStats);

app.listen(config.port, () => {
  console.error(`Listening on port ${config.port}!`);
});
