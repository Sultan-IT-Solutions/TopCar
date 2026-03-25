import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import {
    addRateLimitHeaders,
    rateLimitMiddleware,
    RateLimitPresets,
} from '@/lib/rate-limit';
import { ensureCarSlug } from '@/lib/car-utils';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
]);

function extractStoragePath(imageUrl?: string | null) {
    if (!imageUrl) {
        return null;
    }

    try {
        const url = new URL(imageUrl);
        const marker = '/storage/v1/object/public/cars/';
        const index = url.pathname.indexOf(marker);

        if (index === -1) {
            return null;
        }

        return url.pathname.slice(index + marker.length);
    } catch {
        return null;
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const limit = rateLimitMiddleware(
        request,
        RateLimitPresets.FORM_SUBMISSION,
        'admin-cars-delete',
    );

    if (limit.isLimited) {
        return jsonNoStore(
            {
                message:
                    RateLimitPresets.FORM_SUBMISSION.message ||
                    'Too many requests',
            },
            {
                status: 429,
                headers: {
                    'Retry-After': Math.ceil(
                        (limit.resetAt - Date.now()) / 1000,
                    ).toString(),
                },
            },
        );
    }

    const admin = await requireAdminRequest(request);

    if (admin instanceof Response) {
        return admin;
    }

    const securityError = ensureProtectedMutationRequest(request);
    if (securityError) {
        return securityError;
    }

    const { id } = await context.params;
    const carId = Number(id);

    if (!Number.isFinite(carId)) {
        return jsonNoStore(
            { message: 'Некорректный идентификатор автомобиля.' },
            { status: 400 },
        );
    }

    try {
        const supabase = getSupabaseAdmin();
        const { data: existingCar, error: loadError } = await supabase
            .from('cars')
            .select('id, image_url')
            .eq('id', carId)
            .single();

        if (loadError) {
            throw loadError;
        }

        const imagePath = extractStoragePath(existingCar.image_url);
        if (imagePath) {
            const { error: storageError } = await supabase.storage
                .from('cars')
                .remove([imagePath]);

            if (storageError) {
                console.error('Failed to remove car image:', storageError);
            }
        }

        const { error } = await supabase.from('cars').delete().eq('id', carId);

        if (error) {
            throw error;
        }

        const response = jsonNoStore({ success: true });
        addRateLimitHeaders(response.headers, {
            remaining: limit.remaining,
            resetAt: limit.resetAt,
        });
        return response;
    } catch (error) {
        console.error('Admin cars DELETE failed:', error);
        return jsonNoStore(
            { message: 'Не удалось удалить автомобиль.' },
            { status: 500 },
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const limit = rateLimitMiddleware(
        request,
        RateLimitPresets.FORM_SUBMISSION,
        'admin-cars-update',
    );

    if (limit.isLimited) {
        return jsonNoStore(
            {
                message:
                    RateLimitPresets.FORM_SUBMISSION.message ||
                    'Too many requests',
            },
            {
                status: 429,
                headers: {
                    'Retry-After': Math.ceil(
                        (limit.resetAt - Date.now()) / 1000,
                    ).toString(),
                },
            },
        );
    }

    const admin = await requireAdminRequest(request);

    if (admin instanceof Response) {
        return admin;
    }

    const securityError = ensureProtectedMutationRequest(request);
    if (securityError) {
        return securityError;
    }

    const { id } = await context.params;
    const carId = Number(id);

    if (!Number.isFinite(carId)) {
        return jsonNoStore(
            { message: 'Некорректный идентификатор автомобиля.' },
            { status: 400 },
        );
    }

    try {
        const formData = await request.formData();
        const name = String(formData.get('name') || '').trim();
        const brand = String(formData.get('brand') || '').trim();
        const carClass = String(formData.get('class') || '').trim();
        const price = Number(formData.get('price') || 0);
        const description = String(formData.get('description') || '').trim();
        const fuelType = String(formData.get('fuel_type') || '').trim();
        const driveType = String(formData.get('drive_type') || '').trim();
        const yearRaw = String(formData.get('year') || '').trim();
        const seatsRaw = String(formData.get('seats') || '').trim();
        const powerRaw = String(formData.get('power') || '').trim();
        const accelerationRaw = String(formData.get('acceleration') || '').trim();
        const file = formData.get('file');

        if (!name || !brand || !carClass || !Number.isFinite(price) || price <= 0) {
            return jsonNoStore(
                { message: 'Заполните название, бренд, класс и цену автомобиля.' },
                { status: 400 },
            );
        }

        const parsedYear = yearRaw ? Number(yearRaw) : null;
        const parsedSeats = seatsRaw ? Number(seatsRaw) : null;
        const parsedPower = powerRaw ? Number(powerRaw) : null;
        const parsedAcceleration = accelerationRaw ? Number(accelerationRaw) : null;

        if (
            yearRaw &&
            (parsedYear === null || !Number.isFinite(parsedYear) || parsedYear <= 0)
        ) {
            return jsonNoStore(
                { message: 'Год выпуска указан некорректно.' },
                { status: 400 },
            );
        }

        if (
            seatsRaw &&
            (parsedSeats === null ||
                !Number.isFinite(parsedSeats) ||
                parsedSeats <= 0)
        ) {
            return jsonNoStore(
                { message: 'Количество мест указано некорректно.' },
                { status: 400 },
            );
        }

        if (
            powerRaw &&
            (parsedPower === null ||
                !Number.isFinite(parsedPower) ||
                parsedPower <= 0)
        ) {
            return jsonNoStore(
                { message: 'Мощность указана некорректно.' },
                { status: 400 },
            );
        }

        if (
            accelerationRaw &&
            (parsedAcceleration === null ||
                !Number.isFinite(parsedAcceleration) ||
                parsedAcceleration <= 0)
        ) {
            return jsonNoStore(
                { message: 'Разгон до 100 указан некорректно.' },
                { status: 400 },
            );
        }

        const year = parsedYear;
        const seats = parsedSeats;
        const power = parsedPower;
        const acceleration = parsedAcceleration;

        const supabase = getSupabaseAdmin();
        const { data: existingCar, error: existingCarError } = await supabase
            .from('cars')
            .select('id, slug, image_url')
            .eq('id', carId)
            .single();

        if (existingCarError) {
            throw existingCarError;
        }

        let nextImageUrl = existingCar.image_url;
        let newImagePath: string | null = null;

        if (file instanceof File && file.size > 0) {
            if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
                return jsonNoStore(
                    {
                        message:
                            'Разрешены только изображения JPEG, PNG, WEBP или AVIF.',
                    },
                    { status: 400 },
                );
            }

            if (file.size > MAX_IMAGE_SIZE) {
                return jsonNoStore(
                    { message: 'Размер изображения не должен превышать 8 MB.' },
                    { status: 400 },
                );
            }

            const extension = file.name.includes('.')
                ? file.name.split('.').pop()
                : 'jpg';
            newImagePath = `admin/${crypto.randomUUID()}.${extension}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            const { error: uploadError } = await supabase.storage
                .from('cars')
                .upload(newImagePath, buffer, {
                    contentType: file.type,
                    upsert: false,
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: publicUrl } = supabase.storage
                .from('cars')
                .getPublicUrl(newImagePath);
            nextImageUrl = publicUrl.publicUrl;
        }

        const nextSlug = existingCar.slug || ensureCarSlug({
            id: carId,
            slug: existingCar.slug,
            name,
            brand,
        });

        const { data: updatedCar, error: updateError } = await supabase
            .from('cars')
            .update({
                name,
                brand,
                slug: nextSlug,
                class: carClass,
                price,
                price_per_day: price,
                description,
                fuel_type: fuelType || null,
                drive_type: driveType || null,
                year,
                seats,
                power,
                acceleration,
                image_url: nextImageUrl,
            })
            .eq('id', carId)
            .select('*')
            .single();

        if (updateError) {
            if (newImagePath) {
                await supabase.storage.from('cars').remove([newImagePath]);
            }
            throw updateError;
        }

        const { data: baseTariff, error: baseTariffError } = await supabase
            .from('prices')
            .select('id')
            .eq('car_id', carId)
            .eq('with_driver', false)
            .eq('duration_unit', 'day')
            .eq('days_from', 1)
            .eq('days_to', 365)
            .eq('conditions', 'Базовый тариф')
            .maybeSingle();

        if (baseTariffError) {
            console.error('Failed to load base tariff for car update:', baseTariffError);
        } else if (baseTariff?.id) {
            const { error: updateTariffError } = await supabase
                .from('prices')
                .update({ price_per_day: price })
                .eq('id', baseTariff.id);

            if (updateTariffError) {
                console.error('Failed to update base tariff:', updateTariffError);
            }
        } else {
            const { error: insertTariffError } = await supabase.from('prices').insert([
                {
                    car_id: carId,
                    days_from: 1,
                    days_to: 365,
                    price_per_day: price,
                    with_driver: false,
                    duration_unit: 'day',
                    conditions: 'Базовый тариф',
                },
            ]);

            if (insertTariffError) {
                console.error('Failed to insert base tariff:', insertTariffError);
            }
        }

        if (newImagePath) {
            const previousImagePath = extractStoragePath(existingCar.image_url);
            if (previousImagePath) {
                const { error: removeError } = await supabase.storage
                    .from('cars')
                    .remove([previousImagePath]);
                if (removeError) {
                    console.error('Failed to remove previous car image:', removeError);
                }
            }
        }

        const response = jsonNoStore(updatedCar);
        addRateLimitHeaders(response.headers, {
            remaining: limit.remaining,
            resetAt: limit.resetAt,
        });
        return response;
    } catch (error) {
        console.error('Admin cars PATCH failed:', error);
        return jsonNoStore(
            { message: 'Не удалось обновить автомобиль.' },
            { status: 500 },
        );
    }
}
