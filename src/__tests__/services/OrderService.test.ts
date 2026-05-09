import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import { AppDataSource } from '../../data-source.js';
import { Client } from '../../entities/Client.js';
import { Order, type OrderStatus } from '../../entities/Order.js';
import {
  initializeTestDatabase,
  closeTestDatabase,
  clearAllTables,
} from '../helpers/testDatabase.js';
import { generateToken } from '../helpers/authHelper.js';

async function seedClient(): Promise<Client> {
  const repo = AppDataSource.getRepository(Client);
  return repo.save(repo.create({ name: 'Maria Silva', phone: '11999999999' }));
}

async function seedOrder(clientId: string, override: Partial<{ status: OrderStatus; title: string }> = {}): Promise<Order> {
  const repo = AppDataSource.getRepository(Order);
  return repo.save(
    repo.create({
      clientId,
      title: 'Caderno artesanal',
      description: 'Caderno com capa de papel semente',
      status: 'pending' as OrderStatus,
      ...override,
    }),
  );
}

describe('/api/v1/pedidos', () => {
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

  // ─── POST /api/v1/pedidos ──────────────────────────────────────────
  describe('POST /', () => {
    it('returns 201 with created order when clientId is valid', async () => {
      // Arrange
      const client = await seedClient();

      // Act
      const response = await request(app)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clientId: client.id,
          title: 'Caderno artesanal',
          description: 'Caderno com capa de papel semente',
        })
        .expect(201);

      // Assert — formato da resposta
      expect(response.body).toMatchObject({
        data: {
          id: expect.any(String),
          clientId: client.id,
          title: 'Caderno artesanal',
          status: 'pending',
        },
      });

      // Assert — persistência no banco
      const saved = await AppDataSource.getRepository(Order).findOne({
        where: { id: response.body.data.id },
      });
      expect(saved).not.toBeNull();
      expect(saved!.status).toBe('pending');
    });

    it('returns 404 when clientId does not exist', async () => {
      const response = await request(app)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clientId: '00000000-0000-0000-0000-000000000000',
          title: 'Caderno artesanal',
          description: 'Descrição',
        })
        .expect(404);

      expect(response.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
    });

    it('returns 400 when body is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Sem clientId e sem description' })
        .expect(400);

      expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    });

    it('returns 401 without authorization', async () => {
      await request(app)
        .post('/api/v1/pedidos')
        .send({ clientId: '00000000-0000-0000-0000-000000000000', title: 'X', description: 'Y' })
        .expect(401);
    });
  });

  // ─── GET /api/v1/pedidos ───────────────────────────────────────────
  describe('GET /', () => {
    it('returns 200 with empty list when no orders exist', async () => {
      const response = await request(app)
        .get('/api/v1/pedidos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        data: [],
        meta: { hasMore: false },
      });
    });

    it('returns 200 with orders list', async () => {
      // Arrange
      const client = await seedClient();
      await seedOrder(client.id, { title: 'Pedido 1' });
      await seedOrder(client.id, { title: 'Pedido 2' });

      // Act
      const response = await request(app)
        .get('/api/v1/pedidos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(2);
    });

    it('returns cursor pagination meta when there are more results', async () => {
      // Arrange
      const client = await seedClient();
      await seedOrder(client.id, { title: 'Pedido 1' });
      await seedOrder(client.id, { title: 'Pedido 2' });
      await seedOrder(client.id, { title: 'Pedido 3' });

      // Act
      const response = await request(app)
        .get('/api/v1/pedidos?limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.hasMore).toBe(true);
      expect(response.body.meta.nextCursor).toBeDefined();
    });
  });

  // ─── GET /api/v1/pedidos/:id ───────────────────────────────────────
  describe('GET /:id', () => {
    it('returns 200 with order when id exists', async () => {
      // Arrange
      const client = await seedClient();
      const order = await seedOrder(client.id, { title: 'Caderno artesanal' });

      // Act
      const response = await request(app)
        .get(`/api/v1/pedidos/${order.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        data: { id: order.id, title: 'Caderno artesanal' },
      });
    });

    it('returns 404 when order does not exist', async () => {
      const response = await request(app)
        .get('/api/v1/pedidos/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
    });
  });

  // ─── PATCH /api/v1/pedidos/:id/status ─────────────────────────────
  describe('PATCH /:id/status', () => {
    it('returns 200 for valid transition pending → in_production', async () => {
      // Arrange
      const client = await seedClient();
      const order = await seedOrder(client.id, { status: 'pending' });

      // Act
      const response = await request(app)
        .patch(`/api/v1/pedidos/${order.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'in_production' })
        .expect(200);

      // Assert
      expect(response.body.data.status).toBe('in_production');

      // Assert — persistência no banco
      const updated = await AppDataSource.getRepository(Order).findOne({
        where: { id: order.id },
      });
      expect(updated!.status).toBe('in_production');
    });

    it('returns 400 for invalid transition delivered → in_production', async () => {
      // Arrange
      const client = await seedClient();
      const order = await seedOrder(client.id, { status: 'delivered' });

      // Act
      const response = await request(app)
        .patch(`/api/v1/pedidos/${order.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'in_production' })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    });

    it('returns 400 for invalid transition cancelled → pending', async () => {
      // Arrange
      const client = await seedClient();
      const order = await seedOrder(client.id, { status: 'cancelled' });

      // Act
      const response = await request(app)
        .patch(`/api/v1/pedidos/${order.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'pending' })
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    });

    it('returns 404 when order does not exist', async () => {
      const response = await request(app)
        .patch('/api/v1/pedidos/00000000-0000-0000-0000-000000000000/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'in_production' })
        .expect(404);

      expect(response.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
    });
  });

  // ─── DELETE /api/v1/pedidos/:id ───────────────────────────────────
  describe('DELETE /:id', () => {
    it('returns 204 and removes order from database', async () => {
      // Arrange
      const client = await seedClient();
      const order = await seedOrder(client.id);

      // Act
      await request(app)
        .delete(`/api/v1/pedidos/${order.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Assert — remoção no banco
      const deleted = await AppDataSource.getRepository(Order).findOne({
        where: { id: order.id },
      });
      expect(deleted).toBeNull();
    });

    it('returns 404 when order does not exist', async () => {
      const response = await request(app)
        .delete('/api/v1/pedidos/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
    });
  });
});
