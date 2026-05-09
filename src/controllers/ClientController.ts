import type { Request, Response } from 'express';
import { ClientService } from '../services/ClientService.js';
import { ClientRepository } from '../repositories/ClientRepository.js';
import type { CreateClientBody, UpdateClientBody, ListClientsQuery, IdParams } from '../models/clients.js';

const clientService = new ClientService(ClientRepository);

export const ClientController = {
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateClientBody;
    const client = await clientService.createClient(dto);
    res.status(201).json({ data: client });
  },

  async list(req: Request, res: Response): Promise<void> {
    const { limit, cursor } = req.query as unknown as ListClientsQuery;
    const result = await clientService.listClients(limit, cursor);
    res.json({ data: result.clients, meta: result.meta });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as unknown as IdParams;
    const client = await clientService.getClientById(id);
    res.json({ data: client });
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as unknown as IdParams;
    const dto = req.body as UpdateClientBody;
    const client = await clientService.updateClient(id, dto);
    res.json({ data: client });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as unknown as IdParams;
    await clientService.deleteClient(id);
    res.status(204).send();
  },
};
