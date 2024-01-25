var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
const MemoryStore = require('memorystore')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var statsRouter = require('./routes/stats');
var editRouter = require('./routes/edit');
var settingsRouter = require('./routes/settings');
var chatRouter = require('./routes/chat');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'key',
  resave: true,
  cookie: {
      maxAge: 3000000,
  },
  saveUninitialized: false,
    store: new MemoryStore({

        checkPeriod: 86400000,
    }),
}));

app.use((req, res, next) => {
  if (
      req.path === '/users/login' ||
      req.path === '/users/login-user' ||
      req.path === '/users/register' ||
      req.path === '/users/save-user'
  ) {
    return next();
  }
    const userSession = req.session.user;
  if (userSession) {
    const userRole = userSession.role;
    if (userRole === 'admin') {
      return next();
    }

    if (
        (userRole === 'uposlenik' || !userRole) &&
        (req.path === '/stats' ||
            req.path.startsWith('edit/adminEdit/fetch') ||
            req.path.startsWith('edit/menagerEdit/fetch'))
    ) {
      return res
          .status(403)
          .render('user/notAuthorized', {
            title: 'Error',
            message: 'Zabranjen pristup.',
            additionalInfo: ' Nemate odgovarajuće dozvole za pristup ovoj stranici.',
          });
    }
    return next();
  } else {
    return res
        .status(403)
        .render('user/notAuthorized', {
          title: 'Error',
          message: 'Zabranjen pristup.',
          additionalInfo: ' Nemate odgovarajuće dozvole za pristup ovoj stranici.',
        });
  }
});

app.use('/index', indexRouter);
app.use('/users', usersRouter);
app.use('/stats', statsRouter);
app.use('/edit', editRouter);
app.use('/settings', settingsRouter);
app.use('/chat', chatRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
