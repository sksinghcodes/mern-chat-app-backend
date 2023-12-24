import bcrypt from 'bcrypt';

const authenticatePassword = async (plainPassword: string, hashedPassword: string) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export default authenticatePassword;
