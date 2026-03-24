import { jsonNoStore } from '@/lib/admin-route';
import { loadCarsCatalog } from '@/lib/cars-server';

export async function GET() {
    const { cars, configMissing, error } = await loadCarsCatalog();

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
