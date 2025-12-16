'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ServicesSection from '@/components/ServicesSection';
import FAQ from '@/components/FAQ';
import Subscription from '@/components/Subscription';
import Footer from '@/components/Footer';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import LoginModal from '@/components/LoginModal';
import { ArrowRightIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import Head from 'next/head';
import Hero from '@/components/Hero';
import SEOBlock from '@/components/SEOBlock';
import CalculatorModal from '@/components/CalculatorModal';
// import FloatingWidget from '@/components/FloatingWidget';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
              telephone: '+7 (777) 666-02-95',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'ул. Байтурсынова, 179/2',
                addressLocality: 'Алматы',
                addressCountry: 'KZ',
              },
              openingHours: 'Mo-Su 00:00-24:00',
              priceRange: '₸₸₸',
              email: 'topcar_club@mail.ru',
              sameAs: [
                'https://wa.me/77776660295',
                'https://t.me/topcar_elite_kz_support',
              ],
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

        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        <CalculatorModal isOpen={showCalcModal} onClose={() => setShowCalcModal(false)} />

        <Hero setShowCalcModal={setShowCalcModal} />

        {/* Removed <CarCatalog /> to avoid empty state on home. */}
        <ServicesSection />
        <FAQ />
        <Subscription />
        <SEOBlock page="home" />
        <Footer />
      </main>
    </AnimatedPageWrapper>
  );
}