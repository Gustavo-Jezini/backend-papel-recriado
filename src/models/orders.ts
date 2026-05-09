import { z } from 'zod';

const orderStatusEnum = z.enum([
  'pending',
  'in_production',
  'ready',
  'delivered',
  'cancelled',
]);

export const CreateOrderBodySchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  amount: z.string().optional(),
  deliveryDeadline: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateOrderBodySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  amount: z.string().optional(),
  deliveryDeadline: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateOrderStatusBodySchema = z.object({
  status: orderStatusEnum,
});

export const ListOrdersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  status: orderStatusEnum.optional(),
});

export const OrderIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateOrderBody = z.infer<typeof CreateOrderBodySchema>;
export type UpdateOrderBody = z.infer<typeof UpdateOrderBodySchema>;
export type UpdateOrderStatusBody = z.infer<typeof UpdateOrderStatusBodySchema>;
export type ListOrdersQuery = z.infer<typeof ListOrdersQuerySchema>;
export type OrderIdParams = z.infer<typeof OrderIdParamsSchema>;
