import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { Car, CarSchema } from './car.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }]),
    ],
    controllers: [CarController],
    providers: [CarService],
})
export class CarModule {}
