// Load environment variables first: imports are evaluated in order, and app.js reads CLIENT_URL when it loads
import 'dotenv/config';
import applyDnsOverride from './config/dns.js';
import connectDB from './config/db.js';
import app from './app.js';

// Use custom DNS resolvers only if DNS_SERVERS is set (see backend/.env.example)
applyDnsOverride('Server');

// Fail fast if required configuration is missing, instead of failing on every request later
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  console.error(`[Server] Missing required environment variables: ${missingEnv.join(', ')}. Add them to backend/.env`);
  process.exit(1);
}

// Connect to Database
connectDB();

// Port Configuration
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
