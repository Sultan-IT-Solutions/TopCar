import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../../user/user.schema';

interface JwtPayload {
    id: string;
    role: UserRole;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers['authorization'];

        if (!authHeader)
            throw new UnauthorizedException('No authorization header');

        const token = authHeader.split(' ')[1];
        if (!token) throw new UnauthorizedException('Invalid token');

        try {
            const payload = this.jwtService.verify<JwtPayload>(token);

            const user = await this.userModel.findById(payload.id).exec();
            if (!user) throw new UnauthorizedException('User not found');

            request.user = user;
            return true;
        } catch (err) {
            console.error('JWT verification failed:', err);
            throw new UnauthorizedException('Invalid token');
        }
    }
}
