import { Schema, model } from 'mongoose';

const connectionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    connection: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

const Connection = model('Connection', connectionSchema);

export default Connection;
