'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import HomeCarCatalogSection from '@/components/HomeCarCatalogSection';
import ServicesSection from '@/components/ServicesSection';
import FAQ from '@/components/FAQ';
import Subscription from '@/components/Subscription';
import Footer from '@/components/Footer';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import Head from 'next/head';
import Hero from '@/components/Hero';
import NeedHelpCTA from '@/components/NeedHelpCTA';
import SEOBlock from '@/components/SEOBlock';
import CalculatorModal from '@/components/CalculatorModal';
import PersonalPromoPopup from '@/components/PersonalPromoPopup';
import { useSiteConfig } from '@/context/SiteConfigContext';
// import FloatingWidget from '@/components/FloatingWidget';

export default function HomePage() {
    const [showCalcModal, setShowCalcModal] = useState(false);
    const { profile } = useSiteConfig();

    return (
        <AnimatedPageWrapper>
            <Head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': ['LocalBusiness', 'CarRental'],
                            name: 'TopCar Club',
                            image: 'https://topcar.club/logo.png',
                            url: 'https://topcar.club/',
                            telephone: profile.phoneDisplay,
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: profile.address.ru,
                                addressLocality: 'Алматы',
                                addressCountry: 'KZ',
                            },
                            openingHours: 'Mo-Su 00:00-24:00',
                            priceRange: '₸₸₸',
                            email: profile.email,
                            sameAs: [
                                profile.whatsappUrl,
                                profile.telegramUrl,
                                profile.instagramUrl,
                                profile.viberUrl,
                                profile.maxUrl,
                            ].filter(Boolean),
                        }),
                    }}
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function () { var widget = document.createElement('script'); widget.defer = true; widget.dataset.pfId = '16d9cc23-1faa-402c-a45e-7af9bcebd9c1'; widget.src = 'https://widget.yourgood.app/script/widget.js?id=16d9cc23-1faa-402c-a45e-7af9bcebd9c1&now='+Date.now(); document.head.appendChild(widget); })()`,
                    }}
                />
            </Head>
            <main className="min-h-screen bg-neutral-950 text-white font-sans">
                <Header />
                <CalculatorModal
                    isOpen={showCalcModal}
                    onClose={() => setShowCalcModal(false)}
                />
                <PersonalPromoPopup />

                <Hero setShowCalcModal={setShowCalcModal} />
                <HomeCarCatalogSection />
                <ServicesSection />
                <FAQ />
                <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
                    <NeedHelpCTA source="home" />
                </div>
                {profile.subscriptionEnabled && <Subscription />}
                <SEOBlock page="home" />
                <Footer />
            </main>
        </AnimatedPageWrapper>
    );
}
