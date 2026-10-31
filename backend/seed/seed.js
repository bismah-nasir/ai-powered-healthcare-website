// Fills the database in MONGODB_URI with sample data for local development.
//
//   npm run seed            Add sample data to empty collections and create the demo accounts.
//                           Collections that already have data and existing accounts are left alone.
//   npm run seed -- --reset Delete ALL data (users, bookings, orders, catalog, ...) and seed from scratch.
import 'dotenv/config';
import mongoose from 'mongoose';
import applyDnsOverride from '../config/dns.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Medicine from '../models/Medicine.js';
import LabTest from '../models/LabTest.js';
import Emergency from '../models/Emergency.js';
import Blog from '../models/Blog.js';
import Appointment from '../models/Appointment.js';
import Order from '../models/Order.js';
import LabBooking from '../models/LabBooking.js';
import Contact from '../models/Contact.js';
import { users, doctors, medicines, labTests, emergencies, blogs } from './seedData.js';

const reset = process.argv.includes('--reset');

const catalog = [
  { model: Doctor, data: doctors },
  { model: Medicine, data: medicines },
  { model: LabTest, data: labTests },
  { model: Emergency, data: emergencies },
  { model: Blog, data: blogs },
];

// Everything --reset clears. Bookings and orders point at catalog documents, so they go too.
const allModels = [User, Appointment, Order, LabBooking, Contact, ...catalog.map(({ model }) => model)];

const seedCatalog = async () => {
  for (const { model, data } of catalog) {
    const existing = await model.countDocuments();
    if (existing > 0) {
      console.log(`[Seed] ${model.collection.name}: skipped, already has ${existing} documents`);
      continue;
    }

    await model.insertMany(data);
    console.log(`[Seed] ${model.collection.name}: added ${data.length}`);
  }
};

const seedUsers = async () => {
  for (const user of users) {
    if (await User.exists({ email: user.email })) {
      console.log(`[Seed] users: ${user.email} already exists, skipped`);
      continue;
    }

    // create() (not insertMany) so the pre-save hook hashes the password
    await User.create(user);
    console.log(`[Seed] users: created ${user.role} ${user.email} / ${user.password}`);
  }
};

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('[Seed] MONGODB_URI is not set. Add it to backend/.env first.');
    process.exit(1);
  }

  if (reset && process.env.NODE_ENV === 'production') {
    console.error('[Seed] Refusing to run --reset with NODE_ENV=production.');
    process.exit(1);
  }

  applyDnsOverride('Seed');

  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`[Seed] Connected to database "${conn.connection.name}" on ${conn.connection.host}`);

  try {
    if (reset) {
      for (const model of allModels) {
        const { deletedCount } = await model.deleteMany({});
        console.log(`[Seed] ${model.collection.name}: deleted ${deletedCount}`);
      }
    }

    await seedCatalog();
    await seedUsers();
    console.log('[Seed] Done.');
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(`[Seed] Failed: ${error.message}`);
  process.exit(1);
});
