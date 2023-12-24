import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET_KEY } from '../constants';

interface DecodedToken extends JwtPayload {
  userId: string;
}

interface UserIdRequest extends Request {
  userId: string;
}

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies['jwt-token'];
  jwt.verify(token, JWT_SECRET_KEY, function (err: VerifyErrors, decoded: DecodedToken) {
    if (err) {
      res.json({
        success: false,
        error: err,
      });
    } else {
      (req as UserIdRequest).userId = decoded.userId;
      next();
    }
  } as jwt.VerifyOptions);
};

export default isAuthenticated;
