import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    login(id): string {
        return `${id} privet`;
    }
}
