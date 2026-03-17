// =========================================================================
// Server Entry Point
// Smart Automotive Monitoring and Predictive Maintenance System
// =========================================================================

const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const dotenv     = require('dotenv');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const connectDB     = require('./config/db');
const socketService = require('./services/socketService');

// -------------------------------------------------------------------
// Import Route Modules
// -------------------------------------------------------------------
const authRoutes        = require('./routes/authRoutes');
const environmentRoutes = require('./routes/environmentRoutes');
const adasRoutes        = require('./routes/adasRoutes');
const safetyRoutes      = require('./routes/safetyRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const driverRoutes      = require('./routes/driverRoutes');
const dataRoutes        = require('./routes/dataRoutes');

// -------------------------------------------------------------------
// Initialise Express
// -------------------------------------------------------------------
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------------------
// Health Check
// -------------------------------------------------------------------
app.get('/', (_req, res) => {
  res.json({
    message: 'Smart Automotive Monitoring API is running 🚛',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------------
// Mount Routes
// -------------------------------------------------------------------
app.use('/api/auth',        authRoutes);
app.use('/api/environment', environmentRoutes);
app.use('/api/adas',        adasRoutes);
app.use('/api/safety',      safetyRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/driver',      driverRoutes);
app.use('/api',             dataRoutes);

// -------------------------------------------------------------------
// 404 Handler
// -------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// -------------------------------------------------------------------
// Global Error Handler
// -------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// -------------------------------------------------------------------
// Create HTTP Server & attach Socket.io
// -------------------------------------------------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Initialise the socket service
socketService.init(io);

// -------------------------------------------------------------------
// Connect to DB & Start Listening
// -------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Socket.io   : enabled`);
  });
});

module.exports = { app, server, io };
