import { NextRequest } from 'next/server';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import {
    normalizeFaqItems,
    normalizeTermsSections,
} from '@/lib/site-config';
import {
    loadSiteConfig,
    saveFaqItems,
    saveTermsSections,
} from '@/lib/site-config-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const admin = await requireAdminRequest(request);
    if (admin instanceof Response) {
        return admin;
    }

    try {
        const config = await loadSiteConfig();
        return jsonNoStore({
            faqItems: config.faqItems,
            termsSections: config.termsSections,
        });
    } catch (error) {
        console.error('Admin content GET failed:', error);
        return jsonNoStore(
            { message: 'Не удалось загрузить FAQ и условия.' },
            { status: 500 },
        );
    }
}

export const PUT = withRateLimit(
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
            const payload = (await request.json()) as {
                section?: 'faq' | 'terms';
                faqItems?: unknown;
                termsSections?: unknown;
            };

            if (payload.section === 'faq') {
                const faqItems = await saveFaqItems(
                    normalizeFaqItems(payload.faqItems),
                );
                return jsonNoStore({ faqItems });
            }

            if (payload.section === 'terms') {
                const termsSections = await saveTermsSections(
                    normalizeTermsSections(payload.termsSections),
                );
                return jsonNoStore({ termsSections });
            }

            return jsonNoStore(
                { message: 'Укажите корректный раздел.' },
                { status: 400 },
            );
        } catch (error) {
            console.error('Admin content PUT failed:', error);
            const message =
                error instanceof Error
                    ? error.message
                    : 'Не удалось сохранить контент.';
            return jsonNoStore({ message }, { status: 500 });
        }
    },
    RateLimitPresets.FORM_SUBMISSION,
    'admin-content-update',
);
