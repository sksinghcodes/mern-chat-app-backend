import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      maxLength: 20,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      maxLength: 20,
      trim: true,
    },
    username: {
      type: String,
      maxLength: 50,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = model('User', userSchema);

export default UserModel;
