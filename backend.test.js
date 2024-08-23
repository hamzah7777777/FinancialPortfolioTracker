const request = require('supertest');
const app = require('./backend'); // Assuming you export your Express app in backend.js

test('GET /portfolio/:username should return portfolio data', async () => {
  const response = await request(app).get('/portfolio/testuser');

  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
});

test('POST /users/add should add a new user', async () => {
  const response = await request(app)
    .post('/users/add')
    .send({ username: 'newuser', email: 'newuser@example.com' });

  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe('User added successfully!');
});

test('POST /portfolio/add should add a new stock to portfolio', async () => {
  const response = await request(app)
    .post('/portfolio/add')
    .send({ username: 'testuser', ticker: 'AAPL', quantity: 10, purchasePrice: 150, purchaseDate: '2024-08-01' });

  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe('Stock added to portfolio successfully!');
});
