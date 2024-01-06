import { Server } from 'socket.io';
import { ALLOWED_CLIENTS, EVENT_TYPE, JWT_SECRET_KEY } from '../constants';
import { Server as ServerType } from 'node:http';
import User from '../models/user';
import jwt, { JwtPayload } from 'jsonwebtoken';
import getCookies from '../utils/getCookies';
// import getCookies from '../utils/getCookies';

// Initialize socket.io and pass the server instance
const initializeSocket = (server: ServerType) => {
  const io = new Server(server, {
    path: '/api/socket-io',
    cors: {
      origin: ALLOWED_CLIENTS.split(' '),
      credentials: true,
    },
  });

  io.on('connection', async (socket) => {
    try {
      const token = getCookies(socket)['jwt-token'];
      const decoded = jwt.verify(token || '', JWT_SECRET_KEY) as JwtPayload;

      try {
        await User.findByIdAndUpdate(decoded.userId, { socketId: socket.id });
        socket.emit(EVENT_TYPE.SOCKET_CONNECTION_STATUS, {
          success: true,
          message: 'socket.io connection successful',
        });
      } catch (error) {
        console.log(error);
        socket.emit(EVENT_TYPE.SOCKET_CONNECTION_STATUS, {
          success: false,
          message: 'socket.io connection failed',
        });
        socket.disconnect();
      }

      socket.on('disconnect', async () => {
        try {
          await User.findByIdAndUpdate(decoded.userId, { socketId: '' });
          socket.emit(EVENT_TYPE.SOCKET_CONNECTION_STATUS, {
            success: true,
            message: 'socket.io disconnected successfully',
          });
        } catch (error) {
          console.log(error);
          socket.emit(EVENT_TYPE.SOCKET_CONNECTION_STATUS, {
            success: false,
            message: 'socket.io failed to disconnect',
          });
        }
      });

      socket.on(EVENT_TYPE.MESSAGE, async (data) => {
        const fromUser = await User.findById(decoded.userId);
        const toUser = await User.findById(data.toUserId);
        if (toUser && fromUser && toUser.socketId && fromUser.firstName) {
          io.to(toUser.socketId).emit(EVENT_TYPE.MESSAGE, {
            from: fromUser.firstName,
            message: data.message,
          });
        }
        decoded.userId;
      });
    } catch (error) {
      console.log(error);
      socket.emit(EVENT_TYPE.SOCKET_CONNECTION_STATUS, {
        success: false,
        message: 'socket.io failed to disconnect',
      });
      socket.disconnect();
    }
  });

  return io;
};

export default initializeSocket;
