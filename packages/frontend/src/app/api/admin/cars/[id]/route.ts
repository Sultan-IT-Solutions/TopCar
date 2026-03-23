import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import {
    addRateLimitHeaders,
    rateLimitMiddleware,
    RateLimitPresets,
} from '@/lib/rate-limit';

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
