import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { LoginBodySchema } from '../models/auth.js';
import { AuthController } from '../controllers/AuthController.js';

const router = Router();

router.post('/login', validate({ body: LoginBodySchema }), asyncHandler(AuthController.login));

export default router;
