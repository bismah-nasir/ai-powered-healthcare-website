import mongoose from 'mongoose';

// Long-running server (server.js): connect once at startup and stop if the database is unreachable
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

// Serverless (api/index.js): a warm function instance handles many requests, so share one
// connection between them. A failed attempt is forgotten so the next request tries again.
let connection;

export const connectDBCached = () => {
  connection ??= mongoose.connect(process.env.MONGODB_URI).catch((error) => {
    connection = undefined;
    throw error;
  });
  return connection;
};

export default connectDB;
