import { User } from '../user/user.entity';

declare global {
  namespace Express {
    interface Request {
      currentUser: User | null;
    }
  }
}
