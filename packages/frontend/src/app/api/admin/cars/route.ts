import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';

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
                        brand,
                        class: carClass,
                        price,
                        price_per_day: price,
                        image_url: publicUrl.publicUrl,
                    },
                ])
                .select()
                .single();

            if (error) {
                await supabase.storage.from('cars').remove([filePath]);
                throw error;
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
