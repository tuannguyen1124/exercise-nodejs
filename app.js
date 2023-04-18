const express = require('express');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routers/userRouters');
// const houseRouter = require('./routes/houseRoutes');
// const chatRouter = require('./routes/chatRoutes');
// const viewRouter = require('./routes/viewRouters');

const app = express();

app.use(express.json({ limit: '10kb' }));

//app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
// app.use('/api/v1/house', houseRouter);
// app.use('/api/v1/chat', chatRouter);
// app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
