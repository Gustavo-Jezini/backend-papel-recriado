import type { Request, Response } from 'express';
import { OrderService } from '../services/OrderService.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { ClientRepository } from '../repositories/ClientRepository.js';
import type {
  CreateOrderBody,
  UpdateOrderBody,
  UpdateOrderStatusBody,
  ListOrdersQuery,
  OrderIdParams,
} from '../models/pedidos.js';
import type { OrderStatus } from '../entities/Order.js';

const orderService = new OrderService(OrderRepository, ClientRepository);

export const OrderController = {
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateOrderBody;
    const order = await orderService.createOrder(dto);
    res.status(201).json({ data: order });
  },

  async list(req: Request, res: Response): Promise<void> {
    const { limit, cursor, status } = req.query as unknown as ListOrdersQuery;
    const result = await orderService.listOrders(limit, cursor, status as OrderStatus | undefined);
    res.json({ data: result.orders, meta: result.meta });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as unknown as OrderIdParams;
    const order = await orderService.getOrderById(id);
    res.json({ data: order });
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as unknown as OrderIdParams;
    const dto = req.body as UpdateOrderBody;
    const order = await orderService.updateOrder(id, dto);
    res.json({ data: order });
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params as unknown as OrderIdParams;
    const { status } = req.body as UpdateOrderStatusBody;
    const order = await orderService.updateOrderStatus(id, status);
    res.json({ data: order });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as unknown as OrderIdParams;
    await orderService.deleteOrder(id);
    res.status(204).send();
  },
};
