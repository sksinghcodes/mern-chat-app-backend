import { Schema, model } from 'mongoose';

const conversationSchema = new Schema(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    isGroupChat: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Conversation = model('Conversation', conversationSchema);

export default Conversation;
