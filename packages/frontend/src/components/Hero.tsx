'use client';

import { motion } from 'framer-motion';
import {
    ArrowDownIcon,
    ArrowRightIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { useTranslations } from '@/lib/i18n';

// Анимации
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: 'easeInOut' as const,
        },
    },
};

export default function Hero({
    setShowCalcModal,
}: {
    setShowCalcModal?: (value: boolean) => void;
}) {
    const { t } = useTranslations();
    const scrollToCatalog = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        document
            .getElementById('car-catalog')
            ?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
            {/* --- НАЧАЛО: Правильно настроенное фоновое видео --- */}
            <video
                src="/videos/hero-rolls.mp4"
                poster="/images/hero-car.jpg" // Постер, пока видео грузится
                className="absolute inset-0 w-full h-full object-cover filter brightness-75"
                autoPlay // 👈 Автоматическое воспроизведение
                muted // 👈 ОБЯЗАТЕЛЬНО: без звука, иначе браузеры блокируют autoplay
                loop // 👈 Проигрывать по кругу
                playsInline // 👈 КЛЮЧЕВОЙ АТРИБУТ для мобильных
                preload="auto"
            />
            {/* --- КОНЕЦ --- */}

            <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/20 to-black/80" />

            {/* Контент с анимацией (без изменений) */}
            <motion.div
                className="relative z-10 px-4 max-w-5xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="inline-flex items-center gap-2 px-4 py-1 mb-4 text-sm bg-border text-brand-accent rounded-full"
                    variants={itemVariants}
                >
                    <SparklesIcon className="h-4 w-4" />
                    <span>{t('hero.subtitle')}</span>
                </motion.div>

                <motion.h1
                    className="text-4xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight text-white"
                    variants={itemVariants}
                >
                    {t('hero.ownTheMoment')} <br className="hidden sm:block" />
                    {t('hero.rentLuxury')
                        .split(' ')
                        .map((word, i) =>
                            i === 1 ? (
                                <span
                                    key={i}
                                    className="text-transparent bg-clip-text bg-linear-to-r from-[#d4af37] via-[#f0dca0] to-[#d4af37]"
                                >
                                    {word}
                                </span>
                            ) : (
                                ' ' + word + ' '
                            ),
                        )}
                </motion.h1>

                <motion.p
                    className="mt-6 md:mt-8 text-lg sm:text-2xl text-neutral-200 max-w-2xl mx-auto"
                    variants={itemVariants}
                >
                    {t('hero.mainDescription')}
                </motion.p>

                <motion.div
                    className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
                    variants={itemVariants}
                >
                    <button
                        type="button"
                        onClick={() => setShowCalcModal?.(true)}
                        className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 bg-[#d4af37] text-black rounded-lg text-lg font-bold hover:bg-[#c0982c] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                    >
                        <span>{t('hero.seePrices')}</span>
                        <ArrowRightIcon className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </button>
                    <a
                        href="tel:+77776660295"
                        className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 border border-white text-white rounded-lg text-lg font-bold hover:bg-white hover:text-black transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                    >
                        <span>{t('hero.contact')}</span>
                    </a>
                </motion.div>
            </motion.div>

            <div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce cursor-pointer hidden sm:block"
                onClick={scrollToCatalog}
                aria-label={t('common.next')}
            >
                <ArrowDownIcon className="h-8 w-8 text-white/70 hover:text-white" />
            </div>
        </section>
    );
}
