declare namespace Express {
  export interface Request {
    userId: string;
  }
}

declare namespace JwtPayload {
  export interface Request {
    userId: string;
  }
}
