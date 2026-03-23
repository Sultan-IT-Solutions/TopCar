import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import {
    addRateLimitHeaders,
    rateLimitMiddleware,
    RateLimitPresets,
} from '@/lib/rate-limit';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const limit = rateLimitMiddleware(
        request,
        RateLimitPresets.FORM_SUBMISSION,
        'admin-bookings-delete',
    );

    if (limit.isLimited) {
        const response = jsonNoStore(
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
        addRateLimitHeaders(response.headers, {
            remaining: 0,
            resetAt: limit.resetAt,
        });
        return response;
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

    try {
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from('bookings').delete().eq('id', id);

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
        console.error('Admin bookings DELETE failed:', error);
        return jsonNoStore(
            { message: 'Не удалось удалить бронирование.' },
            { status: 500 },
        );
    }
}
