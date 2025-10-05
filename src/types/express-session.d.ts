import 'express-session';
import { UserSession } from './User';

declare module 'express-session' {
  interface SessionData {
    user?: UserSession;
  }
}