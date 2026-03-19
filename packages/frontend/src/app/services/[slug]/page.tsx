// src/app/services/[slug]/page.tsx
import ServiceDetailPageView from '@/components/ServiceDetailPageView';
import {
    defaultServiceSlugs,
    serviceDetailsByLocale,
} from '@/lib/service-details';

// This function generates the page title and description for SEO
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const service = serviceDetailsByLocale.ru[slug];

    if (!service) {
        return {
            title: 'Услуга не найдена',
            robots: { index: false, follow: false },
        };
    }

    return {
        title: `${service.title} | TopCar`,
        description: service.description,
        alternates: { canonical: `https://topcar.club/services/${slug}` },
        robots: { index: true, follow: true },
    };
}

// This is the main page component that renders the HTML
export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const serviceExists = defaultServiceSlugs.includes(slug);

    if (!serviceExists) {
        return <ServiceDetailPageView slug={slug} />;
    }

    return <ServiceDetailPageView slug={slug} />;
}
