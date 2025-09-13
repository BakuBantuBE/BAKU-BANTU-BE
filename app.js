const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require("path");
const authRoutes = require('./routes/authRoutes');
const pantiRoutes = require('./routes/pantiRoutes');
const wilayahRoutes = require('./routes/wilayahRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const yayasanRoutes = require('./routes/yayasanRoutes');
const cronJobService = require('./services/cronJobService');

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://fe-bakubantu.vercel.app",
  "https://fe-bakubantuu.vercel.app",
  "https://fe-bakubantu-829j.vercel.app",
  "www.bakubantusulut.org",
  "https://www.bakubantusulut.org"

];
// Middleware untuk mengizinkan CORS dengan credentials (cookies)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization"
}));

// Middlewares
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', authRoutes,volunteerRoutes);
app.use('/panti', pantiRoutes);
app.use('/wilayah', wilayahRoutes);
app.use('/volunteers', volunteerRoutes);
app.use('/yayasan', yayasanRoutes); 

// Start cron jobs for testing
cronJobService.startCronJobs();

// Test routes for manual control
app.get('/test/inject-wilayah', async (req, res) => {
  try {
    await cronJobService.manualInject();
    res.json({ success: true, message: 'Wilayah injection completed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/test/cleanup-wilayah', async (req, res) => {
  try {
    await cronJobService.manualCleanup();
    res.json({ success: true, message: 'Wilayah cleanup completed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/test/tracked-ids', (req, res) => {
  const trackedIds = cronJobService.getTrackedIds();
  res.json({ success: true, trackedIds });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Static files (jika diperlukan)
app.use("/public", express.static(path.join(__dirname, "../public")));

module.exports = app;