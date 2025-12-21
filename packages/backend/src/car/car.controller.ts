import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cars')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CarController {
    constructor(private readonly carService: CarService) {}

    @Post()
    @Roles('client')
    async create(@Body() createCarDto: CreateCarDto) {
        return this.carService.create(createCarDto);
    }

    @Get()
    @Roles('admin')
    async findAll() {
        return this.carService.findAll();
    }

    @Get(':id')
    @Roles('admin')
    async findOne(@Param('id') id: string) {
        return this.carService.findOne(id);
    }

    @Patch(':id')
    @Roles('admin')
    async update(
        @Param('id') id: string,
        @Body() updateCarDto: Partial<CreateCarDto>,
    ) {
        return this.carService.update(id, updateCarDto);
    }

    @Delete(':id')
    @Roles('admin')
    async remove(@Param('id') id: string) {
        return this.carService.remove(id);
    }
}
