import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly jwtService: JwtService,
    ) {}

    async register(
        email: string,
        username: string,
        phone: string,
        password: string,
    ) {
        // Check if user already exists
        const existingUser = await this.userModel.findOne({
            $or: [{ email }, { username }, { phone }],
        });

        if (existingUser) {
            throw new ConflictException(
                'User with this email, username, or phone already exists',
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new this.userModel({
            email,
            username,
            phone,
            password: hashedPassword,
        });
        return user.save();
    }

    async login(identifier: string, password: string) {
        const user = await this.userModel
            .findOne({ $or: [{ email: identifier }, { username: identifier }] })
            .select('+password');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { id: user._id };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}
