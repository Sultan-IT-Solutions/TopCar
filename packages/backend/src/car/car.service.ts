import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCarDto } from './dto/create-car.dto';
import { Car } from './car.schema';

@Injectable()
export class CarService {
    constructor(@InjectModel(Car.name) private readonly carModel: Model<Car>) {}

    async create(createCarDto: CreateCarDto): Promise<Car> {
        try {
            const newCar = new this.carModel(createCarDto);
            return await newCar.save();
        } catch (error: any) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (error.code === 11000 && error.keyPattern?.slug) {
                throw new BadRequestException({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    message: `Car with slug "${error.keyValue.slug}" already exists`,
                    field: 'slug',
                });
            }
            throw error;
        }
    }

    async findAll(): Promise<Car[]> {
        return this.carModel.find().exec();
    }

    async findOne(id: string): Promise<Car> {
        const car = await this.carModel.findById(id).exec();
        if (!car) {
            throw new NotFoundException(`Car with ID "${id}" not found`);
        }
        return car;
    }

    async update(
        id: string,
        updateCarDto: Partial<CreateCarDto>,
    ): Promise<Car> {
        const updatedCar = await this.carModel
            .findByIdAndUpdate(id, updateCarDto, { new: true })
            .exec();
        if (!updatedCar) {
            throw new NotFoundException(`Car with ID "${id}" not found`);
        }
        return updatedCar;
    }

    async remove(id: string): Promise<void> {
        const result = await this.carModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Car with ID "${id}" not found`);
        }
    }
}
