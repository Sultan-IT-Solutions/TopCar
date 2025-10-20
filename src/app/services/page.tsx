// src/app/services/page.tsx
'use client'

// import type { Metadata } from 'next';
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";
import FadeInWhenVisible from "@/components/FadeInWhenVisible";
import SEOBlock from "@/components/SEOBlock";

// export const metadata: Metadata = {
//   title: 'Услуги аренды авто — TopCar Club Алматы',
//   description: 'Профессиональные услуги: аренда с водителем, трансферы, обслуживание мероприятий и индивидуальные решения. Премиум-сервис 24/7.',
//   alternates: { canonical: 'https://topcar.club/services' },
//   robots: { index: true, follow: true },
// };

export default function ServicesPage() {
  return (
    <AnimatedPageWrapper>
      <Header />
      <main className="min-h-screen bg-neutral-950 text-white font-sans">
        <section className="relative py-24 sm:py-32 text-center bg-gradient-to-b from-black via-neutral-900 to-neutral-950">
           <div className="absolute inset-0 opacity-[0.03] bg-[url('/patterns/geometric-luxury.svg')] bg-repeat"></div>
           <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
            <FadeInWhenVisible>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                    Наши <span className="text-[#d4af37]">Услуги</span>
                </h1>
                <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                    Мы предлагаем полный спектр услуг по аренде автомобилей премиум-класса, чтобы удовлетворить любые ваши потребности.
                </p>
            </FadeInWhenVisible>
           </div>
        </section>

        {/* Only the ServicesSection component remains */}
        <ServicesSection />
        <SEOBlock page="services" />

      </main>
      <Footer />
    </AnimatedPageWrapper>
  );
}