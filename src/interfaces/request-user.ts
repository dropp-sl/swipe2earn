import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    sub: string;
    userInfo: {
      userId: string;
      email: string;
      role: string;
      encodeURI: string;
    };
  };
}
