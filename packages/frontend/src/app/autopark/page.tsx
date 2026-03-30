// src/app/autopark/page.tsx
import AutoparkPageView from '@/components/AutoparkPageView';
import { loadCarsCatalog } from '@/lib/cars-server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Автопарк — Элитные Авто и Электрокары | TopCar Almaty',
    description:
        'Каталог элитных автомобилей премиум-класса для аренды в Алматы: роскошные седаны, внедорожники, спорткары и электрокары для туристов. Luxury cars, premium vehicles, electric cars rental in Almaty. Прозрачные цены, VIP-сервис.',
    keywords:
        'автопарк Алматы, элитные авто, электрокары, премиум автомобили, для туристов, luxury car fleet, electric vehicles, premium car catalog Almaty',
    alternates: {
        canonical: 'https://topcar.club/autopark',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function AutoparkPage() {
    const { cars, error, configMissing } = await loadCarsCatalog({
        includeUnavailable: true,
    });

    return (
        <AutoparkPageView
            cars={cars}
            isLoading={!!error}
            configMissing={configMissing}
        />
    );
}
