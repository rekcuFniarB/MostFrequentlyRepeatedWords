'use stict';

const express = require('express')
const app = express();
const controller = require('./controllers/main');
const path = require('path');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//// Express middlewares setup (copied from MDN)
//app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
// Serve static files from './public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routing
app.get('/', controller.hello);
app.get('/api/parse-pages/', controller.parsePages);

app.listen(8080, () => {
  console.error('Listening on port 8080!');
});
