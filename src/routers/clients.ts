import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  CreateClientBodySchema,
  UpdateClientBodySchema,
  ListClientsQuerySchema,
  IdParamsSchema,
} from '../models/clients.js';
import { ClientController } from '../controllers/ClientController.js';

const router = Router();

router.post('/', validate({ body: CreateClientBodySchema }), asyncHandler(ClientController.create));
router.get('/', validate({ query: ListClientsQuerySchema }), asyncHandler(ClientController.list));
router.get('/:id', validate({ params: IdParamsSchema }), asyncHandler(ClientController.getById));
router.patch('/:id', validate({ params: IdParamsSchema, body: UpdateClientBodySchema }), asyncHandler(ClientController.update));
router.delete('/:id', validate({ params: IdParamsSchema }), asyncHandler(ClientController.remove));

export default router;
