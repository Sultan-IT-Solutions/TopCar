import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BrandDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

class ModelDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

class StatusDto {
    @IsBoolean()
    isNew: boolean;

    @IsBoolean()
    available: boolean;
}

class ClassDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

class EngineDto {
    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    label: string;
}

class SpecsDto {
    @IsInt()
    year: number;

    @ValidateNested()
    @Type(() => EngineDto)
    engine: EngineDto;

    @IsInt()
    power_hp: number;

    @IsString()
    @IsNotEmpty()
    drive: string;

    @IsString()
    @IsNotEmpty()
    driveLabel: string;

    @IsString()
    @IsNotEmpty()
    transmission: string;
}

class PricingDailyDto {
    @IsInt()
    fromDays: number;

    @IsInt()
    toDays: number;

    @IsInt()
    price: number;

    @IsOptional()
    @IsInt()
    discountPercent?: number;
}

class PricingMonthlyDto {
    @IsInt()
    from: number;

    @IsString()
    @IsNotEmpty()
    currency: string;
}

class PricingWithDriverDto {
    @IsBoolean()
    enabled: boolean;

    @IsOptional()
    @IsInt()
    pricePerHour?: number;
}

class PricingDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PricingDailyDto)
    daily: PricingDailyDto[];

    @ValidateNested()
    @Type(() => PricingMonthlyDto)
    monthly: PricingMonthlyDto;

    @ValidateNested()
    @Type(() => PricingWithDriverDto)
    withDriver: PricingWithDriverDto;
}

class OptionDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsInt()
    priceFrom?: number;

    @IsOptional()
    @IsInt()
    pricePerHour?: number;

    @IsOptional()
    @IsInt()
    price?: number;

    @IsOptional()
    @IsString()
    description?: string;
}

class InsuranceDto {
    @IsBoolean()
    kaskoIncluded: boolean;

    @IsBoolean()
    fullProtectionAvailable: boolean;
}

class LocationDto {
    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    officeId: string;
}

class MediaDto {
    @IsString()
    @IsNotEmpty()
    coverImage: string;

    @IsArray()
    @IsString({ each: true })
    gallery: string[];

    @IsOptional()
    @IsString()
    videoReview?: string;
}

class SeoDto {
    @IsString()
    @IsNotEmpty()
    h1: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}

export class CreateCarDto {
    @IsString()
    @IsNotEmpty()
    _id: string;

    @ValidateNested()
    @Type(() => BrandDto)
    brand: BrandDto;

    @ValidateNested()
    @Type(() => ModelDto)
    model: ModelDto;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @ValidateNested()
    @Type(() => StatusDto)
    status: StatusDto;

    @ValidateNested()
    @Type(() => ClassDto)
    class: ClassDto;

    @IsArray()
    @IsString({ each: true })
    categories: string[];

    @ValidateNested()
    @Type(() => SpecsDto)
    specs: SpecsDto;

    @ValidateNested()
    @Type(() => PricingDto)
    pricing: PricingDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionDto)
    options: OptionDto[];

    @ValidateNested()
    @Type(() => InsuranceDto)
    insurance: InsuranceDto;

    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @ValidateNested()
    @Type(() => MediaDto)
    media: MediaDto;

    @ValidateNested()
    @Type(() => SeoDto)
    seo: SeoDto;
}
