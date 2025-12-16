// src/app/services/[slug]/page.tsx

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import Link from "next/link";

// This is sample data. In the future, you will get this from a database.
const servicesData: { [key: string]: { title: string, description: string, content: string } } = {
    'arenda-s-voditelem': {
        title: 'Аренда с водителем',
        description: 'Максимальный комфорт и безопасность с нашими профессиональными водителями.',
        content: 'Наша услуга аренды автомобиля с водителем идеально подходит для деловых поездок, специальных мероприятий или просто для тех, кто ценит свое время и комфорт. Наши водители - это опытные профессионалы, знающие город и готовые обеспечить вашу безопасность на дороге.'
    },
    'transfer-v-aeroport': {
        title: 'Трансфер в аэропорт',
        description: 'Пунктуальная и комфортная доставка в аэропорт и из него.',
        content: 'Мы предлагаем надежные трансферы в/из международного аэропорта Алматы. Встретим вас или ваших гостей с табличкой, поможем с багажом и обеспечим быструю и комфортную поездку до места назначения на автомобиле премиум-класса.'
    },
    'arenda-na-meropriyatiya': {
        title: 'Аренда на мероприятия',
        description: 'Сделайте ваше событие незабываемым с нашими премиальными автомобилями.',
        content: 'Свадьбы, юбилеи, корпоративные вечера или фотосессии — наши автомобили станут украшением любого события. Мы предлагаем гибкие условия аренды для мероприятий любого масштаба.'
    }
}

// This function generates the page title and description for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const service = servicesData[slug];

    if (!service) {
        return {
            title: 'Услуга не найдена',
            robots: { index: false, follow: false },
        }
    }

    return {
        title: `${service.title} | TopCar`,
        description: service.description,
        alternates: { canonical: `https://topcar.club/services/${slug}` },
        robots: { index: true, follow: true },
    }
}

// This is the main page component that renders the HTML
export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const service = servicesData[slug];

    // If a service with the given slug is not found, show an error message
    if (!service) {
        return (
            <AnimatedPageWrapper>
                <Header />
                <main className="container mx-auto px-4 py-24 text-center">
                    <h1 className="text-3xl font-bold">Услуга не найдена</h1>
                    <p className="text-muted-foreground mt-4">К сожалению, мы не смогли найти запрашиваемую вами услугу.</p>
                </main>
                <Footer />
            </AnimatedPageWrapper>
        );
    }
    
    // If the service is found, display its details
    return (
        <AnimatedPageWrapper>
            <Header />
            <main className="bg-background py-16 sm:py-24">
                {/* Breadcrumbs JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                                { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://topcar.club/' },
                                { '@type': 'ListItem', position: 2, name: 'Услуги', item: 'https://topcar.club/services' },
                                { '@type': 'ListItem', position: 3, name: service.title, item: `https://topcar.club/services/${slug}` },
                            ],
                        }),
                    }}
                />
                <div className="container mx-auto px-4">
                    <nav aria-label="Хлебные крошки" className="mb-6 text-sm text-muted-foreground">
                        <ol className="flex items-center gap-2">
                            <li>
                                <Link href="/" className="hover:text-foreground transition-colors">Главная</Link>
                            </li>
                            <li className="opacity-60">/</li>
                            <li>
                                <Link href="/services" className="hover:text-foreground transition-colors">Услуги</Link>
                            </li>
                            <li className="opacity-60">/</li>
                            <li aria-current="page" className="text-foreground font-medium">{service.title}</li>
                        </ol>
                    </nav>
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            {service.title}
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            {service.description}
                        </p>
                        <div className="prose prose-invert lg:prose-xl prose-p:text-muted-foreground">
                           <p>{service.content}</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </AnimatedPageWrapper>
    );
}