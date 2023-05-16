const path = require('path');
const express = require('express');


const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const cookieParser = require('cookie-parser');

const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routers/userRouters');
const messengerRouter = require('./routers/messengerRouters');
const houseRouter = require('./routers/houseRouters');
const reviewRouter = require('./routers/reviewRouters');

// const chatRouter = require('./routes/chatRoutes');
// const viewRouter = require('./routes/viewRouters');

const app = express();


// 1) GLOBAL MIDDLEWARES
app.use(cors());

app.options('*', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(
  helmet()
);

// Body parser, reading data from body into req.body
app.use(express.json({
  limit: '10kb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});


//app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/messenger', messengerRouter);
app.use('/api/v1/house', houseRouter);
<<<<<<< HEAD
app.use('/api/v1/reviews', reviewRouter);

// app.use('/api/v1/chat', chatRouter);
// app.use('/api/v1/booking', bookingRouter);
=======
>>>>>>> 982061ee1c2b4d107dbc08b7498024d8164f0339

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;