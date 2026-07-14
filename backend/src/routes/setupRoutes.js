import { Router } from 'express';
import { getSetupStatus } from '../controllers/setupController.js';

export const setupRoutes = Router();

setupRoutes.get('/status', getSetupStatus);
