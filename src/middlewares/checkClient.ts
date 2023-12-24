import cors from 'cors';
import { ALLOWED_CLIENTS } from '../constants';

export default cors({
  credentials: true,
  origin: ALLOWED_CLIENTS.split(' '),
});
