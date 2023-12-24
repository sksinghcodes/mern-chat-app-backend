import { Schema, model } from 'mongoose';
import { MESSAGE_STATUS } from '../constants';

const messageSchema = new Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxLength: 2000,
    },
    status: {
      type: Number,
      enum: Object.values(MESSAGE_STATUS),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const messageModel = model('User', messageSchema);

export default messageModel;
