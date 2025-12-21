import { UserDocument } from '../user/user.schema';

declare module 'express-serve-static-core' {
    interface Request {
        user?: UserDocument;
    }
}
