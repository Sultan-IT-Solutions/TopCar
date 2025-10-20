'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import LoginModal from '@/components/LoginModal'
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper'
import Footer from '@/components/Footer'

export default function PWABonusPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <AnimatedPageWrapper>
      <main className="min-h-screen bg-neutral-950 text-white font-sans">
       <Header />

        {showLoginModal && (
          <LoginModal
            onClose={() => {
              setShowLoginModal(false);
              const storedUser = localStorage.getItem('topcar-user');
              if (storedUser) {
                try {
                  JSON.parse(storedUser);
                } catch {
                  localStorage.removeItem('topcar-user');
                }
              }
            }}
          />
        )}

        <section className="px-6 py-20 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Бонус за установку приложения</h1>
          <p className="text-lg mb-4">
            Установите наше PWA-приложение и получите приятный бонус к вашей первой аренде.
          </p>
          <p className="text-base text-neutral-400">
            Просто добавьте сайт на главный экран, и мы вышлем вам промокод после входа в личный кабинет.
          </p>
        </section>

        <Footer />
      </main>
    </AnimatedPageWrapper>
  )
}