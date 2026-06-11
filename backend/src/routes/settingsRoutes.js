import { Router } from 'express';
import { getSocialSetup } from '../controllers/settingsController.js';

export const settingsRoutes = Router();

settingsRoutes.get('/social', getSocialSetup);
