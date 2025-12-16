'use client'

// `useState` и `LoginModal` больше не нужны
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper'
import FadeInWhenVisible from '@/components/FadeInWhenVisible'
import {
  ArrowDownTrayIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  CheckBadgeIcon,
  HomeIcon,
  GiftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

export default function DownloadPage() {
  // `useState` для модального окна удален

  const benefits = [
    {
      name: "Мгновенный доступ",
      description: "Весь наш автопарк и услуги у вас под рукой, в любое время.",
      Icon: DevicePhoneMobileIcon,
    },
    {
      name: "Эксклюзивные предложения",
      description: "Получайте специальные скидки и предложения, доступные только в приложении.",
      Icon: SparklesIcon,
    },
    {
      name: "Упрощенное бронирование",
      description: "Бронируйте автомобили в несколько касаний с сохраненными данными.",
      Icon: CheckBadgeIcon,
    },
  ];

  const handleGoToCatalog = () => {
    window.location.href = '/#car-catalog';
  }

  return (
    <AnimatedPageWrapper>
      {/* ИСПРАВЛЕНИЕ: Убрали лишнюю пропсу `onLoginClick` */}
      <Header />
      {/* `LoginModal` удален, так как Header теперь сам им управляет */}

      <main className="min-h-screen bg-neutral-950 text-white font-sans">
        {/* Hero/Intro Section */}
        <section className="relative py-20 sm:py-28 md:py-36 text-center bg-gradient-to-b from-black via-neutral-900 to-neutral-950 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]">
            {/* <Image src="/patterns/luxury-lines.svg" alt="Abstract Lines" layout="fill" objectFit="cover" /> */}
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
            <FadeInWhenVisible>
              <div className="mb-8">
                <Image src="/logo.png" alt="TopCar Logo" width={88} height={88} className="mx-auto rounded-lg shadow-xl" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                Приложение <span className="text-[#d4af37]">TopCar</span>
              </h1>
              <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                Установите наше прогрессивное веб-приложение (PWA) на главный экран вашего устройства для максимального удобства и эксклюзивных преимуществ.
              </p>
              <span className="block w-20 h-1 bg-[#d4af37]/50 mx-auto mt-8"></span>
            </FadeInWhenVisible>
          </div>
        </section>

        {/* Benefits & Instructions Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column: PWA Mockup Placeholder */}
              <FadeInWhenVisible className="w-full">
                <div className="relative aspect-[9/16] sm:aspect-square md:aspect-[9/16] bg-neutral-800/60 rounded-2xl shadow-2xl 
                                p-4 border border-neutral-700
                                flex items-center justify-center text-neutral-500 italic">
                  <div className="text-center">
                    <ArrowDownTrayIcon className="h-20 w-20 mx-auto mb-4 text-[#d4af37]/60" />
                    <p className="text-lg">(Изображение PWA на телефоне)</p>
                    <p className="text-sm">Демонстрация интерфейса приложения</p>
                  </div>
                </div>
              </FadeInWhenVisible>

              {/* Right Column: Benefits & Instructions */}
              <FadeInWhenVisible className="w-full">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Преимущества приложения:</h2>
                    <ul className="space-y-5">
                      {benefits.map((benefit) => (
                        <li key={benefit.name} className="flex items-start gap-3">
                          <benefit.Icon className="h-7 w-7 text-[#d4af37] flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-lg font-semibold text-white">{benefit.name}</h3>
                            <p className="text-sm text-neutral-400">{benefit.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-700/80 rounded-xl p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-white">Как установить:</h3>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      1. Откройте этот сайт в вашем мобильном браузере (Chrome, Safari и др.).
                      <br/>
                      2. Нажмите на иконку <strong className="text-[#d4af37]">меню браузера</strong> (обычно три точки или кнопка &quot;Поделиться&quot;).
                      <br/>
                      3. Выберите опцию <strong className="text-[#d4af37]">&quot;Добавить на главный экран&quot;</strong> или <strong className="text-[#d4af37]">&quot;Установить приложение&quot;</strong>.
                    </p>
                    <p className="text-xs text-neutral-500">
                      После установки TopCar появится среди ваших приложений для быстрого доступа.
                    </p>
                  </div>
                  
                  {/* === ИЗМЕНЕННЫЙ БЛОК ПРОМОКОДА === */}
                  <div className="bg-gradient-to-r from-[#d4af37]/20 via-neutral-900 to-neutral-900 border border-[#d4af37]/50 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center mb-3 gap-2">
                        <GiftIcon className="h-6 w-6 text-[#d4af37]" />
                        <p className="text-base text-white">
                          <strong className="text-[#d4af37]">Ваш персональный бонус</strong>
                        </p>
                    </div>
                    <p className="text-sm text-neutral-400 mb-3">
                    Здесь появится ваше персональное предложение.
                    Больше просматривайте наш сайт, чтобы получить его!
                    </p>
                  </div>
                  
                  <button
                    onClick={handleGoToCatalog}
                    className="w-full mt-4 px-8 py-4 bg-[#d4af37] text-black rounded-lg text-base sm:text-lg font-semibold 
                                hover:bg-[#c0982c] focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50
                                transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl
                                flex items-center justify-center gap-2 group"
                  >
                    <span>Перейти в автопарк</span>
                    <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ml-1" />
                  </button>
                </div>
              </FadeInWhenVisible>
            </div>
            
            <FadeInWhenVisible className="mt-16 text-center">
                <Link
                    href="/"
                    className="group inline-flex items-center justify-center px-8 py-3 bg-neutral-800 border border-neutral-700 
                                text-neutral-300 rounded-lg text-sm sm:text-base font-medium
                                hover:bg-neutral-700 hover:text-white hover:border-neutral-600 transition-all duration-300 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-[#d4af37]/80"
                >
                    <HomeIcon className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                    Вернуться на главную
                </Link>
            </FadeInWhenVisible>

          </div>
        </section>
      </main>

      <Footer />
    </AnimatedPageWrapper>
  )
}