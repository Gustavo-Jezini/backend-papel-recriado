import type { DeepPartial, DeleteResult } from 'typeorm';
import type { Client } from '../entities/Client.js';
import { NotFoundError } from '../middleware/errors.js';

interface IClientRepository {
  findByIdOrNull(id: string): Promise<Client | null>;
  findManyWithCursor(
    limit: number,
    cursor?: string,
  ): Promise<{ items: Client[]; nextCursor?: string; hasMore: boolean }>;
  save(client: DeepPartial<Client>): Promise<Client>;
  delete(id: string): Promise<DeleteResult | void>;
}

export class ClientService {
  constructor(private repo: IClientRepository) {}

  async createClient(dto: DeepPartial<Client>): Promise<Client> {
    return this.repo.save(dto);
  }

  async listClients(
    limit: number,
    cursor?: string,
  ): Promise<{ clients: Client[]; meta: { nextCursor?: string; hasMore: boolean } }> {
    const { items, nextCursor, hasMore } = await this.repo.findManyWithCursor(
      limit,
      cursor,
    );
    return { clients: items, meta: { nextCursor, hasMore } };
  }

  async getClientById(id: string): Promise<Client> {
    const client = await this.repo.findByIdOrNull(id);
    if (!client) {
      throw new NotFoundError(`Client with id ${id} not found`);
    }
    return client;
  }

  async updateClient(id: string, dto: DeepPartial<Client>): Promise<Client> {
    const existing = await this.repo.findByIdOrNull(id);
    if (!existing) {
      throw new NotFoundError(`Client with id ${id} not found`);
    }
    return this.repo.save({ ...existing, ...dto, id });
  }

  async deleteClient(id: string): Promise<void> {
    const existing = await this.repo.findByIdOrNull(id);
    if (!existing) {
      throw new NotFoundError(`Client with id ${id} not found`);
    }
    await this.repo.delete(id);
  }
}
