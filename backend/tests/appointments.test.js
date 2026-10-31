import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { useTestDatabase, createUser } from './helpers.js';
import app from '../app.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { DAY_MS, startOfUtcDay } from '../utils/slotDates.js';

useTestDatabase();

const createDoctor = (slots = [{ day: 'Monday', time: '10:00 AM' }]) =>
  Doctor.create({
    name: 'Dr. Test',
    specialization: 'Family Physician',
    department: 'General Medicine',
    experience: 5,
    consultationFee: 1500,
    about: 'Test doctor',
    availableSlots: slots,
  });

const book = (auth, doctor, body = {}) =>
  request(app)
    .post('/api/appointments')
    .set(auth)
    .send({ doctorId: doctor._id, slotId: doctor.availableSlots[0]._id, ...body });

describe('POST /api/appointments', () => {
  it('requires login', async () => {
    const doctor = await createDoctor();

    const res = await request(app)
      .post('/api/appointments')
      .send({ doctorId: doctor._id, slotId: doctor.availableSlots[0]._id });

    assert.equal(res.status, 401);
  });

  it('books a free slot on its next date and marks the slot booked', async () => {
    const { user, auth } = await createUser();
    const doctor = await createDoctor();

    const res = await book(auth, doctor, { symptoms: 'Headache' });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.status, 'confirmed');
    assert.equal(res.body.data.patient, String(user._id));
    assert.equal(res.body.data.consultationFee, 1500);

    const date = new Date(res.body.data.date);
    assert.equal(date.getUTCDay(), 1, 'Monday slot must be booked on a Monday');
    assert.ok(date > startOfUtcDay(), 'slot date must be in the future');

    const slot = (await Doctor.findById(doctor._id)).availableSlots[0];
    assert.equal(slot.isBooked, true);
    assert.equal(slot.date.getTime(), date.getTime());
  });

  it('does not let a second patient book the same slot', async () => {
    const first = await createUser();
    const second = await createUser();
    const doctor = await createDoctor();

    assert.equal((await book(first.auth, doctor)).status, 201);
    const res = await book(second.auth, doctor);

    assert.equal(res.status, 400);
    assert.match(res.body.message, /already booked/);
    assert.equal(await Appointment.countDocuments(), 1);
  });

  it('returns 404 for an unknown doctor or slot', async () => {
    const { auth } = await createUser();
    const doctor = await createDoctor();

    const unknownDoctor = await book(auth, doctor, { doctorId: new mongoose.Types.ObjectId() });
    const malformedDoctor = await book(auth, doctor, { doctorId: 'not-an-id' });
    const unknownSlot = await book(auth, doctor, { slotId: new mongoose.Types.ObjectId() });

    assert.equal(unknownDoctor.status, 404);
    assert.equal(malformedDoctor.status, 404);
    assert.equal(unknownSlot.status, 404);
  });
});

describe('PUT /api/appointments/:id/cancel', () => {
  it('lets the patient cancel and frees the slot', async () => {
    const { auth } = await createUser();
    const doctor = await createDoctor();
    const booked = await book(auth, doctor);

    const res = await request(app).put(`/api/appointments/${booked.body.data._id}/cancel`).set(auth);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'cancelled');
    assert.equal((await Doctor.findById(doctor._id)).availableSlots[0].isBooked, false);
  });

  it("does not let a patient cancel someone else's appointment", async () => {
    const owner = await createUser();
    const other = await createUser();
    const doctor = await createDoctor();
    const booked = await book(owner.auth, doctor);

    const res = await request(app).put(`/api/appointments/${booked.body.data._id}/cancel`).set(other.auth);

    assert.equal(res.status, 403);
    assert.equal((await Appointment.findById(booked.body.data._id)).status, 'confirmed');
  });

  it('does not cancel the same appointment twice', async () => {
    const { auth } = await createUser();
    const doctor = await createDoctor();
    const booked = await book(auth, doctor);
    const url = `/api/appointments/${booked.body.data._id}/cancel`;

    await request(app).put(url).set(auth);
    const res = await request(app).put(url).set(auth);

    assert.equal(res.status, 400);
    assert.match(res.body.message, /already cancelled/);
  });
});

describe('GET /api/appointments/my', () => {
  it("lists only the logged-in patient's appointments", async () => {
    const mine = await createUser();
    const theirs = await createUser();
    const doctor = await createDoctor([
      { day: 'Monday', time: '10:00 AM' },
      { day: 'Tuesday', time: '10:00 AM' },
    ]);
    await book(mine.auth, doctor);
    await book(theirs.auth, doctor, { slotId: doctor.availableSlots[1]._id });

    const res = await request(app).get('/api/appointments/my').set(mine.auth);

    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0].doctor.name, 'Dr. Test');
  });
});

describe('Admin appointment routes', () => {
  it('are closed to patients', async () => {
    const { auth } = await createUser();

    const res = await request(app).get('/api/appointments').set(auth);

    assert.equal(res.status, 403);
  });

  it('complete a visit due today and offer its slot again a week later', async () => {
    const admin = await createUser({ role: 'admin' });
    const { user } = await createUser();
    const today = startOfUtcDay();
    const doctor = await createDoctor([{ day: 'Monday', time: '10:00 AM', date: today, isBooked: true }]);
    const slot = doctor.availableSlots[0];
    const appointment = await Appointment.create({
      patient: user._id,
      doctor: doctor._id,
      slotId: slot._id,
      day: slot.day,
      date: today,
      time: slot.time,
      consultationFee: doctor.consultationFee,
    });

    const res = await request(app).patch(`/api/appointments/${appointment._id}/complete`).set(admin.auth);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'completed');
    const freed = (await Doctor.findById(doctor._id)).availableSlots[0];
    assert.equal(freed.isBooked, false);
    assert.equal(freed.date.getTime(), today.getTime() + 7 * DAY_MS);
  });
});
