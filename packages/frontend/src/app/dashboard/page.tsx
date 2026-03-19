'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // 1. ИМПОРТИРУЕМ ГЛАВНЫЙ ХУК
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import {
    UserCircleIcon,
    PhoneIcon as PhoneSolidIcon,
    EnvelopeIcon as EnvelopeSolidIcon,
    ArrowRightOnRectangleIcon,
    ArrowPathIcon,
    CalculatorIcon,
} from '@heroicons/react/24/outline';
import { getSupabase } from '@/lib/supabase';
import FormattedPrice from '@/components/FormattedPrice';
import UserPromoCodes from '@/components/dashboard/UserPromoCodes';
import { useTranslations } from '@/lib/i18n';
import { getLocaleFromPath, localizeHref } from '@/lib/locale-routing';

// --- Компонент для сохраненных расчетов (остается без изменений) ---
type SavedCalculation = {
    id: number;
    car_name: string;
    service_type: string;
    duration: string;
    price: number;
    created_at: string;
};

function SavedCalculations() {
    const { locale } = useTranslations();
    const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCalculations = async () => {
            const supabase = getSupabase();
            // Запрос защищен политикой RLS, поэтому пользователь получит только свои расчеты
            const { data, error } = await supabase
                .from('saved_calculations')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setCalculations(data);
            }
            setLoading(false);
        };
        fetchCalculations();
    }, []);

    if (loading) {
        return (
            <div className="text-center p-8">
                <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
        );
    }

    const labels =
        locale === 'en'
            ? {
                  title: 'Saved calculations',
                  empty: 'You do not have any saved calculations yet.',
              }
            : locale === 'kk'
              ? {
                    title: 'Сақталған есептер',
                    empty: 'Сізде әзірге сақталған есептер жоқ.',
                }
              : {
                    title: 'Сохраненные расчеты',
                    empty: 'У вас пока нет сохраненных расчетов.',
                };

    return (
        <section>
            <div className="flex items-center mb-6">
                <CalculatorIcon className="h-8 w-8 text-[#d4af37] mr-3 shrink-0" />
                <h2 className="text-2xl font-bold text-white">
                    {labels.title}
                </h2>
            </div>
            {calculations.length > 0 ? (
                <div className="space-y-4">
                    {calculations.map((calc) => (
                        <div
                            key={calc.id}
                            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-white">
                                        {calc.car_name}
                                    </p>
                                    <p className="text-sm text-neutral-400">
                                        {calc.service_type} ({calc.duration})
                                    </p>
                                </div>
                                <p className="text-lg font-bold text-[#d4af37]">
                                    <FormattedPrice value={calc.price} /> ₸
                                </p>
                            </div>
                            <p className="text-xs text-neutral-500 mt-2 text-right">
                                {new Date(calc.created_at).toLocaleDateString(
                                    'ru-RU',
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-6 bg-neutral-900 border border-dashed border-neutral-700 rounded-2xl">
                    <p className="text-neutral-400">{labels.empty}</p>
                </div>
            )}
        </section>
    );
}

// --- ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ---
export default function DashboardPage() {
    const { locale } = useTranslations();
    const { user, isLoading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const content =
        locale === 'en'
            ? {
                  profileTitle: 'Your profile',
                  logout: 'Log out',
                  name: 'Name:',
                  phone: 'Phone:',
                  email: 'Email:',
                  notSpecified: 'Not specified',
              }
            : locale === 'kk'
              ? {
                    profileTitle: 'Профиль',
                    logout: 'Шығу',
                    name: 'Аты:',
                    phone: 'Телефон:',
                    email: 'Email:',
                    notSpecified: 'Көрсетілмеген',
                }
              : {
                    profileTitle: 'Ваш профиль',
                    logout: 'Выйти',
                    name: 'Имя:',
                    phone: 'Телефон:',
                    email: 'Email:',
                    notSpecified: 'Не указано',
                };

    useEffect(() => {
        if (!isLoading && !user) {
            router.push(localizeHref('/', getLocaleFromPath(pathname)));
        }
    }, [isLoading, pathname, router, user]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <ArrowPathIcon className="h-12 w-12 text-[#d4af37] animate-spin" />
            </div>
        );
    }

    return (
        <AnimatedPageWrapper>
            <Header />
            <main className="min-h-[80vh] bg-neutral-950 text-white font-sans py-16 sm:py-24 px-4">
                <div className="max-w-3xl mx-auto space-y-12">
                    <section>
                        <div className="flex items-center mb-6">
                            <UserCircleIcon className="h-8 w-8 text-[#d4af37] mr-3 shrink-0" />
                            <h1 className="text-2xl font-bold text-white">
                                {content.profileTitle}
                            </h1>
                            <button
                                onClick={signOut}
                                title={content.logout}
                                className="ml-auto p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-full hover:bg-neutral-800"
                            >
                                <ArrowRightOnRectangleIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-4">
                            <div className="flex items-center">
                                <UserCircleIcon className="h-5 w-5 text-neutral-500 mr-4 shrink-0" />
                                <span className="text-sm text-neutral-400">
                                    {content.name}
                                </span>
                                <span className="ml-auto font-medium text-white text-right">
                                    {user.user_metadata.name ||
                                        content.notSpecified}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <PhoneSolidIcon className="h-5 w-5 text-neutral-500 mr-4 shrink-0" />
                                <span className="text-sm text-neutral-400">
                                    {content.phone}
                                </span>
                                <span className="ml-auto font-medium text-white">
                                    {user.user_metadata.phone ||
                                        content.notSpecified}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <EnvelopeSolidIcon className="h-5 w-5 text-neutral-500 mr-4 shrink-0" />
                                <span className="text-sm text-neutral-400">
                                    {content.email}
                                </span>
                                <span className="ml-auto font-medium text-white text-right">
                                    {user.email || content.notSpecified}
                                </span>
                            </div>
                        </div>
                    </section>

                    <SavedCalculations />

                    <UserPromoCodes />
                </div>
            </main>
            <Footer />
        </AnimatedPageWrapper>
    );
}
