import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import { checkDBConnection, connectToDB } from './db';
import checkClient from './middlewares/checkClient';
import userRoutes from './routes/user';
import connectionRoutes from './routes/connection';
import connectionInvitationRoutes from './routes/connectionInvitation';
import { PORT } from './constants';
import { createServer } from 'node:http';
import initializeSocket from './sockets/sockerHandler';

// import getCookies from './utils/getCookies';

const app = express();
const server = createServer(app);
export const io = initializeSocket(server);

connectToDB();

app.use(checkClient);
app.use(express.json());
app.use(cookieParser());
app.use(checkDBConnection);

app.use('/api/user/', userRoutes);
app.use('/api/connection/', connectionRoutes);
app.use('/api/connection-invitation/', connectionInvitationRoutes);

server.listen(PORT, () => {
  console.log('server is running on port: ' + PORT);
});
