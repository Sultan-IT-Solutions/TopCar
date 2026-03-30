'use client';

// `useState` и `LoginModal` больше не нужны
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import FadeInWhenVisible from '@/components/FadeInWhenVisible';
import LocalizedLink from '@/components/LocalizedLink';
import PushSubscriptionCard from '@/components/PushSubscriptionCard';
import { useTranslations } from '@/lib/i18n';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { getLocaleFromPath, localizeHref } from '@/lib/locale-routing';
import {
    DevicePhoneMobileIcon,
    SparklesIcon,
    CheckBadgeIcon,
    HomeIcon,
    GiftIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function DownloadPage() {
    const { locale } = useTranslations();
    const { profile } = useSiteConfig();
    const pathname = usePathname();
    const content =
        locale === 'en'
            ? {
                  title: 'TopCar',
                  accent: 'App',
                  description:
                      'Install our progressive web app on your home screen for faster access, booking convenience, and exclusive offers.',
                  benefitsTitle: 'Why install it:',
                  benefits: [
                      {
                          name: 'Instant access',
                          description:
                              'Your fleet, services, and contacts are always one tap away.',
                      },
                      {
                          name: 'Exclusive offers',
                          description:
                              'Receive app-only discounts and limited personal offers.',
                      },
                      {
                          name: 'Faster booking',
                          description:
                              'Book vehicles in a few taps with saved data and direct access.',
                      },
                  ],
                  installTitle: 'How to install:',
                  installSteps:
                      '1. Open this website in your mobile browser (Chrome, Safari, etc.).\n2. Tap the browser menu icon or the Share button.\n3. Choose "Add to Home Screen" or "Install App".',
                  installHint:
                      'After installation, TopCar will appear among your apps for quick access.',
                  bonusTitle: 'Your personal bonus',
                  bonusDescription:
                      'Your personal offer will appear here. Explore the site a bit more to unlock it.',
                  fleetCta: 'Go to fleet',
                  homeCta: 'Back to home',
                  installCta: 'Open installation page',
                  qrHint: 'Scan the QR code from your phone to open the installation page instantly.',
                  qrPlaceholder: 'A quick-install QR code will be shown in this block.',
              }
            : locale === 'kk'
              ? {
                    title: 'TopCar',
                    accent: 'Қолданбасы',
                    description:
                        'Тез қолжетімділік, ыңғайлы брондау және эксклюзивті ұсыныстар үшін PWA қолданбамызды құрылғыңыздың басты экранына орнатыңыз.',
                    benefitsTitle: 'Қолданбаның артықшылықтары:',
                    benefits: [
                        {
                            name: 'Жедел қолжетімділік',
                            description:
                                'Автопарк, қызметтер және байланыс әрқашан қолыңызда болады.',
                        },
                        {
                            name: 'Эксклюзивті ұсыныстар',
                            description:
                                'Тек қолданба пайдаланушыларына арналған жеңілдіктер мен жеке ұсыныстар алыңыз.',
                        },
                        {
                            name: 'Жеңіл брондау',
                            description:
                                'Сақталған деректер арқылы көлікті бірнеше қадамда брондаңыз.',
                        },
                    ],
                    installTitle: 'Қалай орнатуға болады:',
                    installSteps:
                        '1. Бұл сайтты мобильді браузеріңізде ашыңыз (Chrome, Safari және т.б.).\n2. Браузер мәзірі белгішесін немесе "Бөлісу" батырмасын басыңыз.\n3. "Басты экранға қосу" немесе "Қолданбаны орнату" опциясын таңдаңыз.',
                    installHint:
                        'Орнатудан кейін TopCar тез қолжетімділік үшін қолданбалар тізімінде пайда болады.',
                    bonusTitle: 'Сіздің жеке бонусыңыз',
                    bonusDescription:
                        'Жеке ұсынысыңыз осында көрсетіледі. Оны алу үшін сайтты көбірек зерттеңіз.',
                    fleetCta: 'Автопаркке өту',
                    homeCta: 'Басты бетке оралу',
                    installCta: 'Орнату бетін ашу',
                    qrHint: 'Орнату бетін телефоннан бірден ашу үшін QR-кодты сканерлеңіз.',
                    qrPlaceholder:
                        'Қолданбаны жылдам орнатуға арналған QR-код осы жерде көрсетіледі.',
                }
              : {
                    title: 'Приложение',
                    accent: 'TopCar',
                    description:
                        'Установите наше прогрессивное веб-приложение (PWA) на главный экран вашего устройства для максимального удобства и эксклюзивных преимуществ.',
                    benefitsTitle: 'Преимущества приложения:',
                    benefits: [
                        {
                            name: 'Мгновенный доступ',
                            description:
                                'Весь наш автопарк и услуги у вас под рукой, в любое время.',
                        },
                        {
                            name: 'Эксклюзивные предложения',
                            description:
                                'Получайте специальные скидки и предложения, доступные только в приложении.',
                        },
                        {
                            name: 'Упрощенное бронирование',
                            description:
                                'Бронируйте автомобили в несколько касаний с сохраненными данными.',
                        },
                    ],
                    installTitle: 'Как установить:',
                    installSteps:
                        '1. Откройте этот сайт в вашем мобильном браузере (Chrome, Safari и др.).\n2. Нажмите на иконку меню браузера или кнопку "Поделиться".\n3. Выберите опцию "Добавить на главный экран" или "Установить приложение".',
                    installHint:
                        'После установки TopCar появится среди ваших приложений для быстрого доступа.',
                    bonusTitle: 'Ваш персональный бонус',
                    bonusDescription:
                        'Здесь появится ваше персональное предложение. Больше просматривайте наш сайт, чтобы получить его.',
                    fleetCta: 'Перейти в автопарк',
                    homeCta: 'Вернуться на главную',
                    installCta: 'Открыть страницу установки',
                    qrHint: 'Отсканируйте QR-код с телефона, чтобы сразу открыть страницу установки.',
                    qrPlaceholder:
                        'QR-код для быстрой установки приложения будет показан в этом блоке.',
                };

    const benefits = [
        {
            ...content.benefits[0],
            Icon: DevicePhoneMobileIcon,
        },
        {
            ...content.benefits[1],
            Icon: SparklesIcon,
        },
        {
            ...content.benefits[2],
            Icon: CheckBadgeIcon,
        },
    ];

    const handleGoToCatalog = () => {
        window.location.href = localizeHref(
            '/#car-catalog',
            getLocaleFromPath(pathname),
        );
    };

    return (
        <AnimatedPageWrapper>
            <Header />

            <main className="min-h-screen bg-neutral-950 pt-20 text-white font-sans">
                <section className="relative overflow-hidden bg-gradient-to-b from-black via-neutral-900 to-neutral-950 px-4 pb-12 pt-8 text-center sm:px-6 sm:pb-16 sm:pt-12">
                    <div className="absolute inset-0 opacity-[0.025]"></div>
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <FadeInWhenVisible>
                            <div className="mb-8">
                                <Image
                                    src="/logo.png"
                                    alt="TopCar Logo"
                                    width={88}
                                    height={88}
                                    className="mx-auto rounded-lg shadow-xl"
                                />
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                                {content.title}{' '}
                                <span className="text-[#d4af37]">
                                    {content.accent}
                                </span>
                            </h1>
                            <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                                {content.description}
                            </p>
                            <span className="block w-20 h-1 bg-[#d4af37]/50 mx-auto mt-8"></span>
                        </FadeInWhenVisible>
                    </div>
                </section>

                <section className="px-4 pb-16 pt-0 sm:px-6 sm:pb-20">
                    <div className="max-w-4xl mx-auto">
                        <FadeInWhenVisible className="w-full">
                            <div className="space-y-8">
                                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8">
                                    <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">
                                        {content.benefitsTitle}
                                    </h2>
                                    <ul className="space-y-5">
                                        {benefits.map((benefit) => (
                                            <li
                                                key={benefit.name}
                                                className="flex items-start gap-3"
                                            >
                                                <benefit.Icon className="mt-0.5 h-7 w-7 flex-shrink-0 text-[#d4af37]" />
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {benefit.name}
                                                    </h3>
                                                    <p className="text-sm text-neutral-400">
                                                        {benefit.description}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8">
                                    <h3 className="text-xl font-semibold text-white">
                                        {content.installTitle}
                                    </h3>
                                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-300">
                                        {content.installSteps}
                                    </p>
                                    <p className="mt-3 text-xs text-neutral-500">
                                        {content.installHint}
                                    </p>
                                    <div className="mt-6 grid gap-5 rounded-2xl border border-neutral-800 bg-black/20 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                                        <div>
                                            <LocalizedLink
                                                href={profile.pwaDownloadUrl || '/download'}
                                                className="inline-flex items-center justify-center rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#c0982c]"
                                            >
                                                {content.installCta}
                                            </LocalizedLink>
                                            <p className="mt-3 text-xs text-neutral-500">
                                                {content.qrHint}
                                            </p>
                                        </div>
                                        <div className="flex justify-center sm:justify-end">
                                            {profile.pwaQrImageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={profile.pwaQrImageUrl}
                                                    alt="TopCar QR"
                                                    className="h-32 w-32 rounded-2xl border border-neutral-800 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 px-4 text-center text-xs text-neutral-500">
                                                    {content.qrPlaceholder}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <PushSubscriptionCard />

                                <div className="rounded-3xl border border-[#d4af37]/35 bg-gradient-to-r from-[#d4af37]/15 via-neutral-900 to-neutral-900 p-6 text-center sm:p-8">
                                    <div className="mb-3 flex items-center justify-center gap-2">
                                        <GiftIcon className="h-6 w-6 text-[#d4af37]" />
                                        <p className="text-base text-white">
                                            <strong className="text-[#d4af37]">
                                                {content.bonusTitle}
                                            </strong>
                                        </p>
                                    </div>
                                    <p className="mb-3 text-sm text-neutral-400">
                                        {content.bonusDescription}
                                    </p>
                                </div>

                                <button
                                    onClick={handleGoToCatalog}
                                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#d4af37] px-8 py-4 text-base font-semibold text-black shadow-lg transition-all duration-300 ease-in-out hover:bg-[#c0982c] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50 sm:text-lg"
                                >
                                    <span>{content.fleetCta}</span>
                                    <ArrowRightIcon className="ml-1 h-5 w-5 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                                </button>
                            </div>
                        </FadeInWhenVisible>

                        <FadeInWhenVisible className="mt-16 text-center">
                            <LocalizedLink
                                href="/"
                                className="group inline-flex items-center justify-center px-8 py-3 bg-neutral-800 border border-neutral-700 
                                text-neutral-300 rounded-lg text-sm sm:text-base font-medium
                                hover:bg-neutral-700 hover:text-white hover:border-neutral-600 transition-all duration-300 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-[#d4af37]/80"
                            >
                                <HomeIcon className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                                {content.homeCta}
                            </LocalizedLink>
                        </FadeInWhenVisible>
                    </div>
                </section>
            </main>

            <Footer />
        </AnimatedPageWrapper>
    );
}
