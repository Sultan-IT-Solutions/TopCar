import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
} from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';

@Controller('cars')
export class CarController {
    constructor(private readonly carService: CarService) {}

    @Post()
    async create(@Body() createCarDto: CreateCarDto) {
        return this.carService.create(createCarDto);
    }

    @Get()
    async findAll() {
        return this.carService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.carService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateCarDto: Partial<CreateCarDto>,
    ) {
        return this.carService.update(id, updateCarDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.carService.remove(id);
    }
}
