// src/app/cars/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import CarDetailPageView from '@/components/CarDetailPageView';
import { ensureCarSlug } from '@/lib/car-utils';
import { loadCarBySlug } from '@/lib/cars-server';

// Если вы хотите использовать динамические метаданные
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string; locale?: string }>;
}) {
    const { slug, locale = 'ru' } = await params;
    const localePrefix = locale === 'en' || locale === 'kk' ? `/${locale}` : '';
    const canonical = `https://topcar.club${localePrefix}/cars/${slug}`;
    const { car } = await loadCarBySlug(slug);

    if (!car) {
        return {
            title:
                locale === 'en'
                    ? 'Car not found | TopCar Almaty'
                    : locale === 'kk'
                      ? 'Көлік табылмады | TopCar Almaty'
                      : 'Автомобиль не найден | TopCar Almaty',
            description:
                locale === 'en'
                    ? 'The requested car was not found in our fleet.'
                    : locale === 'kk'
                      ? 'Сұралған көлік біздің автопарктен табылмады.'
                      : 'Запрашиваемый автомобиль не найден в нашем автопарке.',
            alternates: { canonical },
            robots: { index: false, follow: false },
        } as const;
    }

    const title =
        locale === 'en'
            ? `${car.name} | Car Rental in Almaty | TopCar`
            : locale === 'kk'
              ? `${car.name} | Алматыда көлік жалдау | TopCar`
              : `${car.name} | Аренда Авто в Алматы | TopCar`;
    const description =
        locale === 'en'
            ? `Rent ${car.name} in Almaty with TopCar. Premium booking, transparent terms and support 24/7.`
            : locale === 'kk'
              ? `${car.name} көлігін Алматыда TopCar арқылы жалға алыңыз. Ашық шарттар, премиум сервис және 24/7 қолдау.`
              : `${car.name} в аренду в Алматы. Бронируйте на TopCar.`;

    return {
        title,
        description,
        alternates: { canonical },
        robots: { index: true, follow: true },
        openGraph: {
            type: 'website', // исправлено с 'product'
            url: canonical,
            siteName: 'TopCar',
            title,
            description,
            images: car.image_url ? [{ url: car.image_url }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: car.image_url ? [car.image_url] : undefined,
        },
    } as const;
}

// Отключаем статическую генерацию для динамического рендеринга
export const dynamic = 'force-dynamic';

export default async function CarDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const { car } = await loadCarBySlug(slug);

    if (!car) {
        notFound();
    }

    const canonicalSlug = ensureCarSlug(car);
    if (canonicalSlug && canonicalSlug !== slug) {
        redirect(`/cars/${canonicalSlug}`);
    }

    return <CarDetailPageView car={car} slug={slug} />;
}
