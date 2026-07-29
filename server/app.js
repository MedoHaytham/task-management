const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const usersRouter = require('./routes/userRoutes');
const projectRouter = require('./routes/projectRoutes');

const app = express();

app.set('trust proxy', 1);

// 1) GLOBAL MIDDLEWARES
// Enable CORS for all routes
app.use(cors());
app.options('*', cors());

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// set security headers
app.use(helmet());


// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser (reading data from body into req.body)
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['status', 'priority', 'assignee', 'sort', 'fields']
}));

// Compression
app.use(compression());

// 2) ROUTES
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/projects', projectRouter);

// 3) Handling unhandled routes (404)
app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
});

// 4) Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;