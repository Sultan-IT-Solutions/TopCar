import { NextRequest } from 'next/server';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import {
    addRateLimitHeaders,
    rateLimitMiddleware,
    RateLimitPresets,
} from '@/lib/rate-limit';
import { deleteUploadedCompanyDocument } from '@/lib/company-documents-server';

export const runtime = 'nodejs';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> },
) {
    const limit = rateLimitMiddleware(
        request,
        RateLimitPresets.FORM_SUBMISSION,
        'admin-documents-delete',
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

    try {
        const { slug } = await context.params;
        const documents = await deleteUploadedCompanyDocument(slug);
        const response = jsonNoStore({ success: true, documents });
        addRateLimitHeaders(response.headers, {
            remaining: limit.remaining,
            resetAt: limit.resetAt,
        });
        return response;
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Не удалось удалить документ.';

        return jsonNoStore({ message }, { status: 500 });
    }
}
