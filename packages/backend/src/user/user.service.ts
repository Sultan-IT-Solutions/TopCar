import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    private users: User[] = [];

    create(dto: CreateUserDto): User {
        const user: User = {
            id: Date.now(),
            ...dto,
        };

        this.users.push(user);
        return user;
    }

    findAll(): User[] {
        return this.users;
    }

    findOne(id: number): User | undefined {
        return this.users.find((u) => u.id === id);
    }
}
