const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const hbs = require('hbs');
const mongoose = require('mongoose');
const passport = require('passport');
const favicon = require('serve-favicon');
const dotenv = require('dotenv');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

dotenv.config({
  path: path.join(__dirname, '.env'),
});

mongoose.set('useCreateIndex', true);
mongoose
    .connect(
        process.env.MONGO_URL, {
          useNewUrlParser: true,
        },
    )
    .then(() => {
      console.log('Connection mongodb success!!!');
    })
    .catch((error) => console.log(error));

const app = express();

// view engine setup
app.set('view engine', 'hbs');
app.set('view options', {
  layout: 'layouts/layout',
});

app.use(passport.initialize());
require('./middleware/passport')(passport);

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/auth', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
