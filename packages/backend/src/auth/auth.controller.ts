import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get()
    login(@Query() queryParams: { id: string }): string {
        return this.authService.login(queryParams.id);
    }
}
