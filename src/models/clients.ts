import { z } from 'zod';

export const CreateClientBodySchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  instagram: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateClientBodySchema = CreateClientBodySchema.partial();

export const ListClientsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const IdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateClientBody = z.infer<typeof CreateClientBodySchema>;
export type UpdateClientBody = z.infer<typeof UpdateClientBodySchema>;
export type ListClientsQuery = z.infer<typeof ListClientsQuerySchema>;
export type IdParams = z.infer<typeof IdParamsSchema>;
