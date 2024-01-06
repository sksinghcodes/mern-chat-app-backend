import { Request, Response } from 'express';
import Connection from '../models/connection';

export const getConnections = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.perPage as string) || 10;

  try {
    const totalCount = await Connection.countDocuments({ userId: req.userId });
    const totalPages = Math.ceil(totalCount / perPage);
    const connections = (await Connection.find({ userId: req.userId })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate({
        path: 'connection',
        select: {
          firstName: 1,
          lastName: 1,
          username: 1,
        },
      })) as (Document & {
      connection: {
        _id: string;
        firstName: string;
        lastName: string;
        username: string;
      };
    })[];

    res.status(200).json({
      success: true,
      data: connections.length ? connections.map(({ connection }) => connection) : [],
      perPage,
      totalPages,
      totalCount,
      page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const removeConnnection = async (req: Request, res: Response) => {
  const userIdToRemove = req.params.userIdToRemove;

  try {
    if (userIdToRemove && req.userId) {
      await Connection.findOneAndDelete({ userId: userIdToRemove, connection: req.userId });
      await Connection.findOneAndDelete({ userId: req.userId, connection: userIdToRemove });

      res.status(200).json({
        success: true,
        message: 'connection removed successfully',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
