import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import {
    addRateLimitHeaders,
    rateLimitMiddleware,
    RateLimitPresets,
} from '@/lib/rate-limit';

function normalizePromoPayload(payload: Record<string, unknown>) {
    return {
        code: String(payload.code ?? '')
            .trim()
            .toUpperCase(),
        title: String(payload.title ?? '').trim() || null,
        description: String(payload.description ?? '').trim() || null,
        scope: payload.scope === 'personal' ? 'personal' : 'public',
        discount_type: payload.discountType === 'amount' ? 'amount' : 'percent',
        discount_value: Number(payload.discountValue ?? 0),
        is_active: payload.isActive !== false,
        starts_at:
            typeof payload.startsAt === 'string' && payload.startsAt
                ? payload.startsAt
                : null,
        expires_at:
            typeof payload.expiresAt === 'string' && payload.expiresAt
                ? payload.expiresAt
                : null,
        usage_limit:
            Number.isFinite(Number(payload.usageLimit)) &&
            Number(payload.usageLimit) >= 0
                ? Number(payload.usageLimit)
                : null,
        per_user_limit:
            Number.isFinite(Number(payload.perUserLimit)) &&
            Number(payload.perUserLimit) >= 0
                ? Number(payload.perUserLimit)
                : null,
        assigned_user_id:
            typeof payload.assignedUserId === 'string' && payload.assignedUserId
                ? payload.assignedUserId
                : null,
        car_id:
            Number.isFinite(Number(payload.carId)) && Number(payload.carId) > 0
                ? Number(payload.carId)
                : null,
        applicable_duration_unit:
            payload.applicableDurationUnit === 'hour' ||
            payload.applicableDurationUnit === 'day'
                ? payload.applicableDurationUnit
                : null,
        with_driver:
            typeof payload.withDriver === 'boolean'
                ? payload.withDriver
                : null,
    };
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const limit = rateLimitMiddleware(
        request,
        RateLimitPresets.FORM_SUBMISSION,
        'admin-promos-update',
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
        const payload = normalizePromoPayload(await request.json());
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('promo_codes')
            .update(payload)
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
        console.error('Admin promos PATCH failed:', error);
        return jsonNoStore(
            { message: 'Не удалось обновить промокод.' },
            { status: 500 },
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const limit = rateLimitMiddleware(
        request,
        RateLimitPresets.FORM_SUBMISSION,
        'admin-promos-delete',
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
        const supabase = getSupabaseAdmin();
        const { error } = await supabase
            .from('promo_codes')
            .delete()
            .eq('id', id);

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
        console.error('Admin promos DELETE failed:', error);
        return jsonNoStore(
            { message: 'Не удалось удалить промокод.' },
            { status: 500 },
        );
    }
}
