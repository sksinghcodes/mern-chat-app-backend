import { Schema, model } from 'mongoose';
import { CODE_PURPOSE } from '../constants';

const confirmationCodeSchema = new Schema({
  code: {
    type: String,
    default: String(Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)),
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  purpose: {
    type: Number,
    enum: [CODE_PURPOSE.PROFILE_VERIFICATION, CODE_PURPOSE.PASSWORD_RESET],
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

const ConfirmationCodeModel = model('ConfirmationCode', confirmationCodeSchema);

export default ConfirmationCodeModel;
