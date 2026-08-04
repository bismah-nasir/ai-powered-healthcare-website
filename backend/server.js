import dns from 'dns';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

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
