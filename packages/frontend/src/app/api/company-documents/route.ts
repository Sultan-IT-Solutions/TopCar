import { NextRequest, NextResponse } from 'next/server';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import {
    getCompanyDocuments,
} from '@/lib/company-documents-server';
import { normalizeSupportedLocale } from '@/lib/company-documents';

export const runtime = 'nodejs';

function jsonNoStore(data: unknown, init?: ResponseInit) {
    const response = NextResponse.json(data, init);
    response.headers.set('Cache-Control', 'private, no-store, no-cache, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
}

export const GET = withRateLimit(async (request: NextRequest) => {
    try {
        const locale = normalizeSupportedLocale(
            request.nextUrl.searchParams.get('locale'),
        );
        const documents = await getCompanyDocuments(locale);
        return jsonNoStore(documents);
    } catch (error) {
        console.error('Public company documents GET failed:', error);
        return jsonNoStore(
            { message: 'Не удалось загрузить документы.' },
            { status: 500 },
        );
    }
}, RateLimitPresets.API_MODERATE, 'company-documents-public');
