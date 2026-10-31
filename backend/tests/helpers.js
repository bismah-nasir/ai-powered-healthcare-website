import { before, after, beforeEach } from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';

// Tests never read backend/.env, so they can't touch a real database
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';

// Starts a throwaway in-memory MongoDB for the current test file and empties it before each test
export const useTestDatabase = () => {
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    await mongoose.syncIndexes(); // Unique email index must exist before the first signup
  });

  beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
};

let userCount = 0;

// Creates a user straight in the database and returns it with a valid login token
// (skips the signup/login endpoints, whose rate limits would trip in larger test files)
export const createUser = async (overrides = {}) => {
  userCount += 1;
  const user = await User.create({
    name: `Test User ${userCount}`,
    email: `user${userCount}@example.com`,
    password: 'password123',
    ...overrides,
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { user, token, auth: { Authorization: `Bearer ${token}` } };
};
