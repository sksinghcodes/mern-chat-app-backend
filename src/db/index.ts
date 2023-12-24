import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { DB_CONNECTION_STRING } from '../constants';

export const connectToDB = async function () {
  return await mongoose
    .connect(DB_CONNECTION_STRING)
    .then(() => {
      console.log('Database connection successfull');
    })
    .catch((e) => {
      console.log('Database connection failed');
      console.log(e);
    });
};

export const checkDBConnection = function (req: Request, res: Response, next: NextFunction) {
  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    res.json({
      success: false,
      error: {
        message: 'Database connection issue',
      },
    });
  }
};
