export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || '';
export const MAIN_EMAIL_PASSWORD = process.env.MAIN_EMAIL_PASSWORD || '';
export const MAIN_EMAIL_ADDRESS = process.env.MAIN_EMAIL_ADDRESS || '';
export const MAIN_EMAIL_SERVICE = process.env.MAIN_EMAIL_SERVICE || '';
export const BCRYPT_SECRET_KEY = process.env.BCRYPT_SECRET_KEY || '';
export const ENV_TYPE_IS_PROD = process.env.ENV_TYPE_IS_PROD || '0';
export const ALLOWED_CLIENTS = process.env.ALLOWED_CLIENTS || '';
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '';
export const SECRET = process.env.SECRET || '';
export const PORT = process.env.PORT || '5000';

console.log(process.env.DB_CONNECTION_STRING);

export const MESSAGE_STATUS = {
  SENT: 0,
  DELIVERED: 1,
  READ: 2,
};

export const CODE_PURPOSE = {
  PROFILE_VERIFICATION: 0,
  PASSWORD_RESET: 1,
};