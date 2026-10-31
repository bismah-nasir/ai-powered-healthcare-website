import dns from 'dns';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import labTestRoutes from './routes/labTestRoutes.js';
import labBookingRoutes from './routes/labBookingRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import triageRoutes from './routes/triageRoutes.js';

// Force Node.js to use public DNS resolvers
dns.setServers(['1.1.1.1', '8.8.8.8']);

// Load environment variables
dotenv.config();

// Fail fast if required configuration is missing, instead of failing on every request later
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  console.error(`[Server] Missing required environment variables: ${missingEnv.join(', ')}. Add them to backend/.env`);
  process.exit(1);
}

// Connect to Database
connectDB();

const app = express();

// Only the frontend may call the API from a browser (Origin has no trailing slash, so strip one from the env value)
const clientOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

// Middleware
app.use(cors({ origin: clientOrigin }));
app.use(express.json());
// Express 5 leaves req.body undefined when no JSON body is sent; default it so destructuring is safe
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

// Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/labs', labTestRoutes);
app.use('/api/lab-bookings', labBookingRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/triage', triageRoutes);

// Base Route
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Server is running healthily' });
});

// Unknown routes return JSON instead of Express's default HTML page
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler: malformed JSON and uncaught errors return JSON, never an HTML stack trace
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON in request body',
    });
  }

  const status = err.status || err.statusCode || 500;

  // Client errors raised by Express/body-parser (e.g. payload too large) are safe to describe
  if (status >= 400 && status < 500 && err.expose) {
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }

  console.error(`[Server] Unhandled error on ${req.method} ${req.originalUrl}: ${err.stack || err.message}`);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Port Configuration
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
