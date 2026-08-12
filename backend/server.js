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
import emergencyRoutes from './routes/emergencyRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

// Force Node.js to use public DNS resolvers
dns.setServers(['1.1.1.1', '8.8.8.8']);

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/labs', labTestRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contact', contactRoutes);

// Base Route
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Server is running healthily' });
});

// Port Configuration
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] running in development mode on port ${PORT}`);
});
