import { Schema, model } from 'mongoose';

const conversationSchema = new Schema(
  {
    participants: {
      type: [Schema.Types.ObjectId],
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

const conversationModel = model('Conversation', conversationSchema);

export default conversationModel;
