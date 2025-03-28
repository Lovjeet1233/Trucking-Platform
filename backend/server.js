// server.js
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/api/auth');
const shippers = require('./routes/api/shippers');
const truckers = require('./routes/api/truckers');
const loads = require('./routes/api/loads');
const bids = require('./routes/api/bids');
const tracking = require('./routes/api/tracking');
const financial = require('./routes/api/financial');
const benefits = require('./routes/api/benefits');
const admin = require('./routes/api/admin');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());
// const cors = require('cors');
// app.use(cors());
// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/shippers', shippers);
app.use('/api/v1/truckers', truckers);
app.use('/api/v1/loads', loads);
app.use('/api/v1/bids', bids);
app.use('/api/v1/tracking', tracking);
app.use('/api/v1/financial', financial);
app.use('/api/v1/benefits', benefits);
app.use('/api/v1/admin', admin);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});


