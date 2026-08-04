import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Force Node.js to use public DNS resolvers
dns.setServers(['1.1.1.1', '8.8.8.8']);

// Load environment variables
dotenv.config();

const verifyConnection = async () => {
  const uri = process.env.MONGODB_URI;
  
  // Safe logging: print connection string with masked password
  let maskedUri = 'undefined';
  if (uri) {
    // Replaces password between the first colon (after username) and the @ symbol
    maskedUri = uri.replace(/(mongodb\+srv:\/\/.*?):([^@]+)@/, '$1:*****@');
  }
  
  console.log(`[Test] Attempting connection to: ${maskedUri}`);

  if (!uri || uri.includes('YOUR_SECRET_PASSWORD')) {
    console.error('[Test] Error: Please replace YOUR_SECRET_PASSWORD with your actual database password in .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log('\n==================================================');
    console.log('🎉 SUCCESS: Connected to MongoDB Atlas Cloud Database!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    console.log('==================================================\n');
    await mongoose.disconnect();
    console.log('[Test] Disconnected successfully.');
    process.exit(0);
  } catch (error) {
    console.error('\n==================================================');
    console.error('❌ FAILURE: Could not connect to MongoDB Atlas!');
    console.error(`Error details: ${error.message}`);
    console.log('==================================================\n');
    console.error('Possible fixes:');
    console.error('1. Did you double check that you replaced YOUR_SECRET_PASSWORD with your actual password?');
    console.error('2. Make sure you have whitelisted your IP in Atlas Network Access tab (0.0.0.0/0).');
    console.error('3. If this dns resolver fix did not work, try getting the legacy standard connection string (mongodb:// instead of mongodb+srv://) from Atlas.');
    process.exit(1);
  }
};

verifyConnection();
