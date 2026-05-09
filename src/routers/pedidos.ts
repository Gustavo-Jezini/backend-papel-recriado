import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  CreateOrderBodySchema,
  UpdateOrderBodySchema,
  UpdateOrderStatusBodySchema,
  ListOrdersQuerySchema,
  OrderIdParamsSchema,
} from '../models/pedidos.js';
import { OrderController } from '../controllers/OrderController.js';

const router = Router();

router.post('/', validate({ body: CreateOrderBodySchema }), asyncHandler(OrderController.create));
router.get('/', validate({ query: ListOrdersQuerySchema }), asyncHandler(OrderController.list));
router.get('/:id', validate({ params: OrderIdParamsSchema }), asyncHandler(OrderController.getById));
router.patch('/:id', validate({ params: OrderIdParamsSchema, body: UpdateOrderBodySchema }), asyncHandler(OrderController.update));
router.patch('/:id/status', validate({ params: OrderIdParamsSchema, body: UpdateOrderStatusBodySchema }), asyncHandler(OrderController.updateStatus));
router.delete('/:id', validate({ params: OrderIdParamsSchema }), asyncHandler(OrderController.remove));

export default router;
