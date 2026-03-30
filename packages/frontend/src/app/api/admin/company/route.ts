import { NextRequest } from 'next/server';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { loadSiteConfig, saveCompanyProfile } from '@/lib/site-config-server';
import { normalizeCompanyProfile } from '@/lib/site-config';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const admin = await requireAdminRequest(request);
    if (admin instanceof Response) {
        return admin;
    }

    try {
        const config = await loadSiteConfig();
        return jsonNoStore(config.profile);
    } catch (error) {
        console.error('Admin company GET failed:', error);
        return jsonNoStore(
            { message: 'Не удалось загрузить данные компании.' },
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
            const payload = normalizeCompanyProfile(await request.json());
            const profile = await saveCompanyProfile(payload);
            return jsonNoStore(profile);
        } catch (error) {
            console.error('Admin company PUT failed:', error);
            const message =
                error instanceof Error
                    ? error.message
                    : 'Не удалось сохранить данные компании.';
            return jsonNoStore({ message }, { status: 500 });
        }
    },
    RateLimitPresets.FORM_SUBMISSION,
    'admin-company-update',
);
