import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { useTestDatabase, createUser } from './helpers.js';
import app from '../app.js';
import Medicine from '../models/Medicine.js';
import Order from '../models/Order.js';

useTestDatabase();

const createMedicine = (overrides = {}) =>
  Medicine.create({
    name: 'Test Tablets',
    category: 'Pain Relief',
    manufacturer: 'Test Pharma',
    price: 1000,
    description: 'Test medicine',
    activeIngredients: ['Paracetamol'],
    stock: 5,
    ...overrides,
  });

const checkout = {
  shippingAddress: '1 Test Street, Lahore',
  contactPhone: '0300-1234567',
};

const placeOrder = (auth, items, body = {}) =>
  request(app)
    .post('/api/orders')
    .set(auth)
    .send({ ...checkout, items, ...body });

const stockOf = async (medicine) => (await Medicine.findById(medicine._id)).stock;

describe('POST /api/orders', () => {
  it('requires login', async () => {
    const medicine = await createMedicine();

    const res = await request(app)
      .post('/api/orders')
      .send({ ...checkout, items: [{ _id: medicine._id, quantity: 1 }] });

    assert.equal(res.status, 401);
  });

  it('prices the order from the catalog, adds delivery and deducts stock', async () => {
    const { auth } = await createUser();
    const medicine = await createMedicine();

    // The client-sent price is ignored
    const res = await placeOrder(auth, [{ _id: medicine._id, name: 'Test Tablets', price: 1, quantity: 1 }]);

    assert.equal(res.status, 201);
    assert.equal(res.body.data.status, 'pending');
    assert.equal(res.body.data.paymentMethod, 'COD');
    assert.equal(res.body.data.subtotal, 1000);
    assert.equal(res.body.data.deliveryFee, 150);
    assert.equal(res.body.data.orderTotal, 1150);
    assert.equal(await stockOf(medicine), 4);
  });

  it('gives free delivery above Rs 1500 and merges duplicate cart lines', async () => {
    const { auth } = await createUser();
    const medicine = await createMedicine();

    const res = await placeOrder(auth, [
      { _id: medicine._id, quantity: 1 },
      { _id: medicine._id, quantity: 1 },
    ]);

    assert.equal(res.status, 201);
    assert.equal(res.body.data.items.length, 1);
    assert.equal(res.body.data.items[0].quantity, 2);
    assert.equal(res.body.data.subtotal, 2000);
    assert.equal(res.body.data.deliveryFee, 0);
    assert.equal(await stockOf(medicine), 3);
  });

  it('rejects the whole order when one item is short and puts back stock already taken', async () => {
    const { auth } = await createUser();
    const plenty = await createMedicine({ name: 'Plenty' });
    const scarce = await createMedicine({ name: 'Scarce', stock: 1 });

    const res = await placeOrder(auth, [
      { _id: plenty._id, name: 'Plenty', quantity: 2 },
      { _id: scarce._id, name: 'Scarce', quantity: 2 },
    ]);

    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'INSUFFICIENT_STOCK');
    assert.equal(res.body.item.available, 1);
    assert.equal(await stockOf(plenty), 5);
    assert.equal(await stockOf(scarce), 1);
    assert.equal(await Order.countDocuments(), 0);
  });

  it('validates the cart and checkout details', async () => {
    const { auth } = await createUser();
    const medicine = await createMedicine();
    const item = { _id: medicine._id, quantity: 1 };

    const cases = [
      await placeOrder(auth, []),
      await placeOrder(auth, [{ _id: medicine._id, quantity: 0 }]),
      await placeOrder(auth, [{ _id: medicine._id, quantity: 1.5 }]),
      await placeOrder(auth, [{ _id: 'not-an-id', quantity: 1 }]),
      await placeOrder(auth, [item], { shippingAddress: '   ' }),
      await placeOrder(auth, [item], { paymentMethod: 'Bitcoin' }),
    ];

    for (const res of cases) {
      assert.equal(res.status, 400, res.body.message);
    }
    assert.equal(await stockOf(medicine), 5);
  });
});

describe('GET /api/orders/my-orders', () => {
  it("lists only the logged-in patient's orders", async () => {
    const mine = await createUser();
    const theirs = await createUser();
    const medicine = await createMedicine();
    await placeOrder(mine.auth, [{ _id: medicine._id, quantity: 1 }]);
    await placeOrder(theirs.auth, [{ _id: medicine._id, quantity: 1 }]);

    const res = await request(app).get('/api/orders/my-orders').set(mine.auth);

    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
  });
});

describe('PATCH /api/orders/:id/status', () => {
  it('is closed to patients', async () => {
    const { auth } = await createUser();
    const medicine = await createMedicine();
    const order = await placeOrder(auth, [{ _id: medicine._id, quantity: 1 }]);

    const res = await request(app)
      .patch(`/api/orders/${order.body.data._id}/status`)
      .set(auth)
      .send({ status: 'cancelled' });

    assert.equal(res.status, 403);
  });

  it('returns stock when an admin cancels and takes it again when reopened', async () => {
    const patient = await createUser();
    const admin = await createUser({ role: 'admin' });
    const medicine = await createMedicine();
    const order = await placeOrder(patient.auth, [{ _id: medicine._id, quantity: 2 }]);
    const url = `/api/orders/${order.body.data._id}/status`;
    assert.equal(await stockOf(medicine), 3);

    const cancelled = await request(app).patch(url).set(admin.auth).send({ status: 'cancelled' });
    assert.equal(cancelled.status, 200);
    assert.equal(await stockOf(medicine), 5);

    const reopened = await request(app).patch(url).set(admin.auth).send({ status: 'processing' });
    assert.equal(reopened.status, 200);
    assert.equal(reopened.body.data.status, 'processing');
    assert.equal(await stockOf(medicine), 3);
  });
});
