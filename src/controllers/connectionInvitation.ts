import { Request, Response } from 'express';
import ConnectionInvitation from '../models/connectionInvitation';
import Connection from '../models/connection';
import { io } from '..';
import User from '../models/user';
import { CONNECTION_INVITATION_ACTION, EVENT_TYPE, NOTIFICATION_TYPE } from '../constants';
import { Document } from 'mongoose';

const { ACCEPT, REJECT, DELETE } = CONNECTION_INVITATION_ACTION;

export const getConnectionInvitations = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.perPage as string) || 10;

  try {
    const totalCount = await ConnectionInvitation.countDocuments({ to: req.userId });
    const totalPages = Math.ceil(totalCount / perPage);
    const invitations = (await ConnectionInvitation.find({ to: req.userId })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate({
        path: 'from',
        select: {
          firstName: 1,
          lastName: 1,
          username: 1,
        },
      })) as (Document & {
      _id: string;
      from: {
        _id: string;
        firstName: string;
        lastName: string;
        username: string;
      };
    })[];

    res.status(200).json({
      success: true,
      data: invitations.length
        ? invitations.map(({ _id, from }) => ({
            _id,
            userId: from._id,
            firstName: from.firstName,
            lastName: from.lastName,
            username: from.username,
          }))
        : [],
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

export const sendConnectionInvitation = async (req: Request, res: Response) => {
  try {
    const { toUserId } = req.params;

    if (toUserId === req.userId) {
      return res.status(400).json({
        result: false,
        mesage: 'How lonely are you?',
      });
    }

    const prevConnectionInvitationOne = await ConnectionInvitation.findOne({
      from: req.userId,
      to: toUserId,
    });

    const prevConnectionInvitationTwo = await ConnectionInvitation.findOne({
      from: toUserId,
      to: req.userId,
    });

    const prevConnection = await Connection.findOne({ userId: req.userId, connection: toUserId });

    let errorMessage;

    if (prevConnectionInvitationOne) {
      errorMessage = 'You have already sent connection invitation to this User';
    }

    if (prevConnectionInvitationTwo) {
      errorMessage = 'This user has send you a connection invitation. You can accept that';
    }

    if (prevConnection) {
      errorMessage = 'User is already in your connection list';
    }

    if (errorMessage) {
      return res.status(409).json({
        result: false,
        mesage: errorMessage,
      });
    }

    const toUser = await User.findById(toUserId);
    const fromUser = await User.findById(req.userId, {
      first_name: 1,
      last_name: 1,
      username: 1,
    });

    if (!toUser) {
      return res.status(404).json({
        result: false,
        mesage: 'user not found',
      });
    }

    const newConnectionInvitation = new ConnectionInvitation({
      from: req.userId,
      to: toUser._id,
    });

    await newConnectionInvitation.save();

    if (toUser.socketId && fromUser) {
      io.to(toUser.socketId).emit(EVENT_TYPE.NOTIFICATION, {
        type: NOTIFICATION_TYPE.NEW_CONNECTION_INVITATION,
        data: {
          message: `${fromUser.firstName} is inviting you to connect`,
        },
      });
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptConnectionInvitation = (req: Request, res: Response) => {
  updateConnectionInvitations(req, res, ACCEPT);
};

export const rejectConnectionInvitation = (req: Request, res: Response) => {
  updateConnectionInvitations(req, res, REJECT);
};

export const deleteConnectionInvitation = (req: Request, res: Response) => {
  updateConnectionInvitations(req, res, DELETE);
};

const updateConnectionInvitations = async (req: Request, res: Response, action: number) => {
  try {
    const { connectionInvitationId } = req.params;

    const { userId } = req;

    const connectionInvitation = (await ConnectionInvitation.findById(connectionInvitationId)
      .populate('from')
      .populate('to')) as Document & {
      from: { _id: string; socketId?: string };
      to: { _id: string; socketId?: string; firstName: string };
    };

    if (!connectionInvitation) {
      return res.status(404).json({
        result: false,
        mesage: 'connection invitation not found',
      });
    }

    if ((action === ACCEPT || action === REJECT) && connectionInvitation.to._id !== userId) {
      return res.status(403).json({
        result: false,
        mesage: `you are not authorised to ${
          action === ACCEPT ? 'accept' : 'reject'
        } this invitation`,
      });
    } else if (action === DELETE && connectionInvitation.from._id !== userId) {
      return res.status(403).json({
        result: false,
        mesage: `you are not authorised to delete this invitation`,
      });
    }

    if (action === ACCEPT) {
      const connection1 = new Connection({
        userId: connectionInvitation.to._id,
        connection: connectionInvitation.from._id,
      });

      const connection2 = new Connection({
        userId: connectionInvitation.from._id,
        connection: connectionInvitation.to._id,
      });
      await connection1.save();
      await connection2.save();

      if (connectionInvitation.from.socketId) {
        io.to(connectionInvitation.from.socketId).emit(EVENT_TYPE.NOTIFICATION, {
          type: NOTIFICATION_TYPE.CONNECTION_INVITATION_ACCEPTED,
          message: {
            message: `${connectionInvitation.to.firstName} has accepted your connection invitation. You can chat with them now`,
          },
        });
      }
    }

    await ConnectionInvitation.deleteOne({ _id: connectionInvitation._id });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
