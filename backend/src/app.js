const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Uploaded complaint images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check (used by Render, Docker and Jenkins)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'HostelCare API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Feature routers are mounted here in later phases.

app.use(notFound);
app.use(errorHandler);

module.exports = app;
