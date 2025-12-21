import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { Car, CarSchema } from './car.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }]),
        AuthModule,
        UserModule,
    ],
    controllers: [CarController],
    providers: [CarService],
})
export class CarModule {}
