export interface AuthUser {
  userId: string;
  email: string;
  orgId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
