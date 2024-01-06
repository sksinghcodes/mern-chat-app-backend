import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET_KEY } from '../constants';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies['jwt-token'];
  jwt.verify(token, JWT_SECRET_KEY, function (err: VerifyErrors, decoded: JwtPayload) {
    if (err) {
      res.status(401).json({
        success: false,
        error: err,
      });
    } else {
      req.userId = decoded.userId;
      next();
    }
  } as jwt.VerifyOptions);
};

export default isAuthenticated;
