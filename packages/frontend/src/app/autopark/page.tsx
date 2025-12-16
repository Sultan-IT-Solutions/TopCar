// src/app/autopark/page.tsx
// 'use client' удалён для SSR
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import CarCatalog from "@/components/CarCatalog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabase } from "@/lib/supabase";
import type { Metadata } from 'next';
import Link from "next/link";
import SEOBlock from "@/components/SEOBlock";

export const metadata: Metadata = {
  title: 'Автопарк — Элитные Авто и Электрокары | TopCar Almaty',
  description: 'Каталог элитных автомобилей премиум-класса для аренды в Алматы: роскошные седаны, внедорожники, спорткары и электрокары для туристов. Luxury cars, premium vehicles, electric cars rental in Almaty. Прозрачные цены, VIP-сервис.',
  keywords: 'автопарк Алматы, элитные авто, электрокары, премиум автомобили, для туристов, luxury car fleet, electric vehicles, premium car catalog Almaty',
  alternates: {
    canonical: 'https://topcar.club/autopark',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function AutoparkPage() {
  const supabase = getSupabase();
  const { data: cars, error } = await supabase
    .from('cars')
    .select('*, prices (* )')
    .order('id');

  // SSR: передаем данные каталога как пропсы
  return (
    <AnimatedPageWrapper>
      <Header />
      <main className="bg-background pt-24 pb-16">
        {/* Breadcrumbs JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://topcar.club/' },
                { '@type': 'ListItem', position: 2, name: 'Автопарк', item: 'https://topcar.club/autopark' },
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
              <li aria-current="page" className="text-foreground font-medium">Автопарк</li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4">
            Наш <span className="text-brand-accent">Автопарк</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Выберите идеальный автомобиль для вашей следующей поездки. Мы предлагаем широкий выбор моделей, от элегантных седанов до мощных внедорожников.
          </p>
          <CarCatalog cars={cars || []} isLoading={!!error} />
        </div>
        <SEOBlock page="autopark" />
      </main>
      <Footer />
    </AnimatedPageWrapper>
  );
}