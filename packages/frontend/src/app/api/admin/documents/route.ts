import { NextRequest } from 'next/server';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { ensureProtectedMutationRequest } from '@/lib/request-security';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { getCompanyDocuments, uploadCompanyDocument } from '@/lib/company-documents-server';
import { normalizeSupportedLocale } from '@/lib/company-documents';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const admin = await requireAdminRequest(request);
    if (admin instanceof Response) {
        return admin;
    }

    try {
        const locale = normalizeSupportedLocale(
            request.nextUrl.searchParams.get('locale'),
        );
        const documents = await getCompanyDocuments(locale);
        return jsonNoStore(documents);
    } catch (error) {
        console.error('Admin documents GET failed:', error);
        return jsonNoStore(
            { message: 'Не удалось загрузить документы.' },
            { status: 500 },
        );
    }
}

export const POST = withRateLimit(async (request: NextRequest) => {
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
        const slug = String(formData.get('slug') || '').trim();
        const file = formData.get('file');

        if (!slug) {
            return jsonNoStore(
                { message: 'Укажите тип документа.' },
                { status: 400 },
            );
        }

        if (!(file instanceof File)) {
            return jsonNoStore(
                { message: 'Выберите файл документа.' },
                { status: 400 },
            );
        }

        const document = await uploadCompanyDocument(slug, file);

        return jsonNoStore(document, { status: 201 });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Не удалось загрузить документ.';

        return jsonNoStore({ message }, { status: 500 });
    }
}, RateLimitPresets.FORM_SUBMISSION, 'admin-documents-upload');
