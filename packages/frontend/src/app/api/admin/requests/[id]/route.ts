import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import {
    addRateLimitHeaders,
    rateLimitMiddleware,
    RateLimitPresets,
} from '@/lib/rate-limit';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const limit = rateLimitMiddleware(
        request,
        RateLimitPresets.FORM_SUBMISSION,
        'admin-requests-update',
    );

    if (limit.isLimited) {
        return jsonNoStore(
            { message: RateLimitPresets.FORM_SUBMISSION.message || 'Too many requests' },
            { status: 429 },
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

    try {
        const body = await request.json();
        const nextStatus = String(body.status ?? '').trim();

        if (!nextStatus) {
            return jsonNoStore(
                { message: 'Укажите новый статус заявки.' },
                { status: 400 },
            );
        }

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('requests')
            .update({
                status: nextStatus,
                metadata:
                    body.metadata && typeof body.metadata === 'object'
                        ? body.metadata
                        : undefined,
            })
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        const response = jsonNoStore(data);
        addRateLimitHeaders(response.headers, {
            remaining: limit.remaining,
            resetAt: limit.resetAt,
        });
        return response;
    } catch (error) {
        console.error('Admin requests PATCH failed:', error);
        return jsonNoStore(
            { message: 'Не удалось обновить заявку.' },
            { status: 500 },
        );
    }
}
