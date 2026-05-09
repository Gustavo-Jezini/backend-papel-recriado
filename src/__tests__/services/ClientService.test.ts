import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { AppDataSource } from '../../data-source.js';
import { Client } from '../../entities/Client.js';
import {
  initializeTestDatabase,
  closeTestDatabase,
  clearAllTables,
} from '../helpers/testDatabase.js';
import { generateToken } from '../helpers/authHelper.js';

async function seedClient(override: Partial<{ name: string; phone: string; email: string }> = {}): Promise<Client> {
  const repo = AppDataSource.getRepository(Client);
  return repo.save(repo.create({ name: 'Maria Silva', phone: '11999999999', ...override }));
}

describe('/api/v1/clientes', () => {
  let token: string;

  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    await clearAllTables();
    token = generateToken();
  });

  // ─── POST /api/v1/clientes ─────────────────────────────────────────
  describe('POST /', () => {
    it('returns 201 with created client', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Ana Oliveira', phone: '11988887777' })
        .expect(201);

      // Assert — formato da resposta
      expect(response.body).toMatchObject({
        data: {
          id: expect.any(String),
          name: 'Ana Oliveira',
          phone: '11988887777',
        },
      });

      // Assert — persistência no banco
      const saved = await AppDataSource.getRepository(Client).findOne({
        where: { id: response.body.data.id },
      });
      expect(saved).not.toBeNull();
      expect(saved!.name).toBe('Ana Oliveira');
    });

    it('returns 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '11999999999' })
        .expect(400);

      expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    });

    it('returns 401 without authorization', async () => {
      await request(app)
        .post('/api/v1/clientes')
        .send({ name: 'Ana' })
        .expect(401);
    });
  });

  // ─── GET /api/v1/clientes ──────────────────────────────────────────
  describe('GET /', () => {
    it('returns 200 with empty list when no clients exist', async () => {
      const response = await request(app)
        .get('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        data: [],
        meta: { hasMore: false },
      });
    });

    it('returns 200 with clients list', async () => {
      // Arrange
      await seedClient({ name: 'Ana' });
      await seedClient({ name: 'Beatriz' });

      // Act
      const response = await request(app)
        .get('/api/v1/clientes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toHaveProperty('hasMore');
    });

    it('returns cursor pagination meta when there are more results', async () => {
      // Arrange
      await seedClient({ name: 'Ana' });
      await seedClient({ name: 'Beatriz' });
      await seedClient({ name: 'Carla' });

      // Act
      const response = await request(app)
        .get('/api/v1/clientes?limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.hasMore).toBe(true);
      expect(response.body.meta.nextCursor).toBeDefined();
    });
  });

  // ─── GET /api/v1/clientes/:id ──────────────────────────────────────
  describe('GET /:id', () => {
    it('returns 200 with client when id exists', async () => {
      // Arrange
      const client = await seedClient({ name: 'Maria Silva' });

      // Act
      const response = await request(app)
        .get(`/api/v1/clientes/${client.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        data: { id: client.id, name: 'Maria Silva' },
      });
    });

    it('returns 404 when client does not exist', async () => {
      const response = await request(app)
        .get('/api/v1/clientes/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
    });
  });

  // ─── PATCH /api/v1/clientes/:id ───────────────────────────────────
  describe('PATCH /:id', () => {
    it('returns 200 with updated client', async () => {
      // Arrange
      const client = await seedClient({ name: 'Maria Silva' });

      // Act
      const response = await request(app)
        .patch(`/api/v1/clientes/${client.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Maria Oliveira' })
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        data: { id: client.id, name: 'Maria Oliveira' },
      });

      // Assert — persistência no banco
      const updated = await AppDataSource.getRepository(Client).findOne({
        where: { id: client.id },
      });
      expect(updated!.name).toBe('Maria Oliveira');
    });

    it('returns 404 when client does not exist', async () => {
      const response = await request(app)
        .patch('/api/v1/clientes/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
    });
  });

  // ─── DELETE /api/v1/clientes/:id ──────────────────────────────────
  describe('DELETE /:id', () => {
    it('returns 204 and removes client from database', async () => {
      // Arrange
      const client = await seedClient();

      // Act
      await request(app)
        .delete(`/api/v1/clientes/${client.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Assert — remoção no banco
      const deleted = await AppDataSource.getRepository(Client).findOne({
        where: { id: client.id },
      });
      expect(deleted).toBeNull();
    });

    it('returns 404 when client does not exist', async () => {
      const response = await request(app)
        .delete('/api/v1/clientes/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
    });
  });
});
