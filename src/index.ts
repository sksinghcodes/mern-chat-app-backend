import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import { checkDBConnection, connectToDB } from './db';
import checkClient from './middlewares/checkClient';
import userRoutes from './routes/user';
import { PORT } from './constants';

const app = express();
connectToDB();

app.use(express.json());
app.use(cookieParser());
app.use(checkDBConnection);
app.use(checkClient);

app.use('/api/user/', userRoutes);

app.listen(PORT, () => {
  console.log('server is running on port: ' + PORT);
});
