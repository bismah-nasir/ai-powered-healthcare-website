// Vercel entry point: Vercel runs this file as a serverless function instead of starting server.js.
// backend/vercel.json sends every request here, and Express routes it as usual.
// Environment variables come from the Vercel project settings, not backend/.env.
import { connectDBCached } from '../config/db.js';
import { getMissingEnv } from '../config/env.js';
import app from '../app.js';

// Vercel's proxy puts the visitor's address in X-Forwarded-For (and overwrites any value the
// client sent), so req.ip is the real visitor and each one gets their own rate limit budget
app.set('trust proxy', true);

// These errors happen before Express sees the request, so reply with plain Node response methods
const sendError = (res, status, message) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: false, message }));
};

export default async function handler(req, res) {
  const missingEnv = getMissingEnv();
  if (missingEnv.length > 0) {
    console.error(`[Vercel] Missing required environment variables: ${missingEnv.join(', ')}. Add them in the Vercel project settings`);
    return sendError(res, 500, 'Server is not configured');
  }

  try {
    await connectDBCached();
  } catch (error) {
    console.error(`[Database] Error: ${error.message}`);
    return sendError(res, 503, 'Database is unavailable, please try again shortly');
  }

  return app(req, res);
}
