import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticates';
import {
  acceptConnectionInvitation,
  getConnectionInvitations,
  rejectConnectionInvitation,
  sendConnectionInvitation,
  deleteConnectionInvitation,
} from '../controllers/connectionInvitation';

const router = express.Router();

router.get('/list', isAuthenticated, getConnectionInvitations);
router.post('/send/:toUserId', isAuthenticated, sendConnectionInvitation);
router.put('/accept/:connectionInvitationId', isAuthenticated, acceptConnectionInvitation);
// user who received the invitation can reject
router.delete('/reject/:connectionInvitationId', isAuthenticated, rejectConnectionInvitation);
// user who sent the invitation can access delete
router.delete('/delete/:connectionInvitationId', isAuthenticated, deleteConnectionInvitation);

export default router;
