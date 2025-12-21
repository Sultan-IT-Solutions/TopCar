import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    MaxLength,
} from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsString({ message: 'Username must be a string' })
    @IsNotEmpty({ message: 'Username is required' })
    username: string;

    @IsOptional()
    @IsString({ message: 'Phone must be a string' })
    phone: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(20, { message: 'Password must not exceed 20 characters' })
    password: string;
}
