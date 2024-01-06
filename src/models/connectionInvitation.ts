import { Schema, model } from 'mongoose';

const connectionInvitationSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

const ConnectionInvitation = model('ConnectionInvitation', connectionInvitationSchema);

export default ConnectionInvitation;
