import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import {
  initializeTestDatabase,
  closeTestDatabase,
  clearAllTables,
} from '../helpers/testDatabase.js';
import {
  seedTestAdmin,
  generateToken,
  TEST_ADMIN_EMAIL,
  TEST_ADMIN_PASSWORD,
} from '../helpers/authHelper.js';

describe('POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    await clearAllTables();
    await seedTestAdmin();
  });

  it('returns 200 with token when credentials are valid', async () => {
    // Act
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
      .expect(200);

    // Assert
    expect(response.body).toMatchObject({
      data: {
        token: expect.any(String),
        expiresIn: expect.any(String),
      },
    });
    expect(response.body.data.token.split('.')).toHaveLength(3);
  });

  it('returns 401 when email does not exist', async () => {
    // Act
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'any-password' })
      .expect(401);

    // Assert
    expect(response.body).toMatchObject({
      error: { code: 'UNAUTHORIZED' },
    });
  });

  it('returns 401 when password is incorrect', async () => {
    // Act
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: 'wrong-password' })
      .expect(401);

    // Assert
    expect(response.body).toMatchObject({
      error: { code: 'UNAUTHORIZED' },
    });
  });

  it('error message is identical for missing email and wrong password', async () => {
    // Act
    const [responseNoUser, responseWrongPass] = await Promise.all([
      request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'any-password' }),
      request(app)
        .post('/api/v1/auth/login')
        .send({ email: TEST_ADMIN_EMAIL, password: 'wrong-password' }),
    ]);

    // Assert
    expect(responseNoUser.body.error.message).toBe(responseWrongPass.body.error.message);
  });

  it('returns 400 when body is missing email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'any-password' })
      .expect(400);

    expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });
});

describe('Authentication middleware', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it('returns 401 without Authorization header on protected route', async () => {
    await request(app).get('/api/v1/clients').expect(401);
  });

  it('returns 401 with invalid token on protected route', async () => {
    await request(app)
      .get('/api/v1/clients')
      .set('Authorization', 'Bearer token-invalido')
      .expect(401);
  });

  it('returns 200 with valid token on protected route', async () => {
    const token = generateToken();
    await request(app)
      .get('/api/v1/clients')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
