import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticates';
import { getConnections, removeConnnection } from '../controllers/connection';

const router = express.Router();

router.get('/list', isAuthenticated, getConnections);
router.delete('remove/:userIdToRemove', isAuthenticated, removeConnnection);

export default router;
