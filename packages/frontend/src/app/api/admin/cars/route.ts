import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { ensureCarSlug } from '@/lib/car-utils';

export const runtime = 'nodejs';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
]);

export async function GET(request: NextRequest) {
    const admin = await requireAdminRequest(request);

    if (admin instanceof Response) {
        return admin;
    }

    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('cars')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return jsonNoStore(data ?? []);
    } catch (error) {
        console.error('Admin cars GET failed:', error);
        return jsonNoStore(
            { message: 'Не удалось загрузить список автомобилей.' },
            { status: 500 },
        );
    }
}

export const POST = withRateLimit(
    async (request: NextRequest) => {
        const admin = await requireAdminRequest(request);

        if (admin instanceof Response) {
            return admin;
        }

        const securityError = ensureProtectedMutationRequest(request);
        if (securityError) {
            return securityError;
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

            if (!(file instanceof File)) {
                return jsonNoStore(
                    { message: 'Выберите изображение автомобиля.' },
                    { status: 400 },
                );
            }

            const year = yearRaw ? Number(yearRaw) : null;
            const seats = seatsRaw ? Number(seatsRaw) : null;
            const power = powerRaw ? Number(powerRaw) : null;
            const acceleration = accelerationRaw ? Number(accelerationRaw) : null;

            if (yearRaw && (year === null || !Number.isFinite(year) || year <= 0)) {
                return jsonNoStore(
                    { message: 'Год выпуска указан некорректно.' },
                    { status: 400 },
                );
            }

            if (
                seatsRaw &&
                (seats === null || !Number.isFinite(seats) || seats <= 0)
            ) {
                return jsonNoStore(
                    { message: 'Количество мест указано некорректно.' },
                    { status: 400 },
                );
            }

            if (
                powerRaw &&
                (power === null || !Number.isFinite(power) || power <= 0)
            ) {
                return jsonNoStore(
                    { message: 'Мощность указана некорректно.' },
                    { status: 400 },
                );
            }

            if (
                accelerationRaw &&
                (acceleration === null ||
                    !Number.isFinite(acceleration) ||
                    acceleration <= 0)
            ) {
                return jsonNoStore(
                    { message: 'Разгон до 100 указан некорректно.' },
                    { status: 400 },
                );
            }

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

            const supabase = getSupabaseAdmin();
            const baseSlug = ensureCarSlug({
                id: 0,
                slug: '',
                name,
                brand,
            });
            const { data: existingSlugRow } = await supabase
                .from('cars')
                .select('id')
                .eq('slug', baseSlug)
                .maybeSingle();
            const slug = existingSlugRow
                ? `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`
                : baseSlug;
            const extension = file.name.includes('.')
                ? file.name.split('.').pop()
                : 'jpg';
            const filePath = `admin/${crypto.randomUUID()}.${extension}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            const { error: uploadError } = await supabase.storage
                .from('cars')
                .upload(filePath, buffer, {
                    contentType: file.type,
                    upsert: false,
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: publicUrl } = supabase.storage
                .from('cars')
                .getPublicUrl(filePath);

            const { data, error } = await supabase
                .from('cars')
                .insert([
                    {
                        name,
                        slug,
                        brand,
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
                        image_url: publicUrl.publicUrl,
                    },
                ])
                .select()
                .single();

            if (error) {
                await supabase.storage.from('cars').remove([filePath]);
                throw error;
            }

            const { error: priceError } = await supabase.from('prices').insert([
                {
                    car_id: data.id,
                    days_from: 1,
                    days_to: 365,
                    price_per_day: price,
                    with_driver: false,
                    conditions: 'Базовый тариф',
                },
            ]);

            if (priceError) {
                await supabase.from('cars').delete().eq('id', data.id);
                await supabase.storage.from('cars').remove([filePath]);
                throw priceError;
            }

            return jsonNoStore(data, { status: 201 });
        } catch (error) {
            console.error('Admin cars POST failed:', error);
            return jsonNoStore(
                { message: 'Не удалось добавить автомобиль.' },
                { status: 500 },
            );
        }
    },
    RateLimitPresets.FORM_SUBMISSION,
    'admin-cars-create',
);
