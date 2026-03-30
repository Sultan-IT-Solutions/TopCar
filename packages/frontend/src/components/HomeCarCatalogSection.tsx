'use client';

import { useEffect, useState } from 'react';
import CarCatalog from '@/components/CarCatalog';
import LocalizedLink from '@/components/LocalizedLink';
import { Car } from '@/types';
import { useTranslations } from '@/lib/i18n';

export default function HomeCarCatalogSection() {
    const { locale } = useTranslations();
    const [cars, setCars] = useState<Car[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [configMissing, setConfigMissing] = useState(false);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await fetch('/api/cars?includeUnavailable=1', {
                    cache: 'no-store',
                });
                const payload = await response.json();

                if (!response.ok) {
                    throw new Error(
                        payload.message || 'Не удалось загрузить автопарк.',
                    );
                }

                setCars(Array.isArray(payload.cars) ? (payload.cars as Car[]) : []);
                setConfigMissing(Boolean(payload.configMissing));
            } catch (error) {
                console.error('Failed to initialize home car catalog:', error);
                setCars([]);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchCars();
    }, []);

    const copy =
        locale === 'en'
            ? {
                  title: 'The fleet is temporarily unavailable in this block. You can still open the main catalog page.',
                  action: 'Open fleet page',
              }
            : locale === 'kk'
              ? {
                    title: 'Автопарк осы блокта уақытша қолжетімсіз. Негізгі каталог бетін ашуға болады.',
                    action: 'Автопаркке өту',
                }
              : {
                    title: 'Автопарк в этом блоке временно недоступен. Вы можете открыть основную страницу каталога.',
                    action: 'Открыть автопарк',
                };

    return (
        <>
            <CarCatalog cars={cars} isLoading={isLoading} />
            {configMissing && (
                <section className="px-4 pb-4 sm:px-6 sm:pb-8">
                    <div className="mx-auto max-w-4xl rounded-2xl border border-[#d4af37]/25 bg-neutral-900/80 px-6 py-5 text-center text-sm text-neutral-200">
                        <p>{copy.title}</p>
                        <LocalizedLink
                            href="/autopark"
                            className="mt-3 inline-flex items-center justify-center rounded-full border border-[#d4af37]/50 px-4 py-2 font-semibold text-[#f0dca0] transition hover:border-[#d4af37] hover:text-white"
                        >
                            {copy.action}
                        </LocalizedLink>
                    </div>
                </section>
            )}
        </>
    );
}
