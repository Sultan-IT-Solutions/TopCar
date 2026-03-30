import { jsonNoStore } from '@/lib/admin-route';
import { loadCarsCatalog } from '@/lib/cars-server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const scope = request.nextUrl.searchParams.get('scope');
    const limit = Number(request.nextUrl.searchParams.get('limit') || 0);
    const includeUnavailable =
        request.nextUrl.searchParams.get('includeUnavailable') === '1';
    const { cars, configMissing, error } = await loadCarsCatalog({
        featuredOnly: scope === 'featured',
        limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
        includeUnavailable,
    });

    if (error) {
        return jsonNoStore(
            {
                cars: [],
                configMissing,
                message: 'Не удалось загрузить автомобили.',
            },
            { status: 500 },
        );
    }

    return jsonNoStore({ cars, configMissing });
}
