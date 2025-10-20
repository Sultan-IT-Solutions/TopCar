'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { getSupabase } from '@/lib/supabase';
import FormattedPrice from '@/components/FormattedPrice';
// import UserPromoCodes from '@/components/dashboard/UserPromoCodes';

// --- Компонент для сохраненных расчетов (остается без изменений) ---
type SavedCalculation = {
    id: number;
    car_name: string;
    service_type: string;
    duration: string;
    price: number;
    created_at: string;
}

function SavedCalculations() {
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
        return <div className="text-center p-8"><ArrowPathIcon className="h-6 w-6 animate-spin mx-auto text-muted-foreground"/></div>;
    }

    return (
        <section>
            <div className="flex items-center mb-6">
                <CalculatorIcon className="h-8 w-8 text-[#d4af37] mr-3 shrink-0" />
                <h2 className="text-2xl font-bold text-white">Сохраненные расчеты</h2>
            </div>
            {calculations.length > 0 ? (
                <div className="space-y-4">
                    {calculations.map(calc => (
                        <div key={calc.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-white">{calc.car_name}</p>
                                    <p className="text-sm text-neutral-400">{calc.service_type} ({calc.duration})</p>
                                </div>
                                <p className="text-lg font-bold text-[#d4af37]"><FormattedPrice value={calc.price}/> ₸</p>
                            </div>
                            <p className="text-xs text-neutral-500 mt-2 text-right">
                                {new Date(calc.created_at).toLocaleDateString('ru-RU')}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-6 bg-neutral-900 border border-dashed border-neutral-700 rounded-2xl">
                    <p className="text-neutral-400">У вас пока нет сохраненных расчетов.</p>
                </div>
            )}
        </section>
    )
}

// --- ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ---
export default function DashboardPage() {
    // 2. ПОЛУЧАЕМ ДАННЫЕ ИЗ КОНТЕКСТА
    const { user, isLoading, signOut } = useAuth();
    const router = useRouter();

    // 3. ЭФФЕКТ ДЛЯ ЗАЩИТЫ СТРАНИЦЫ
    useEffect(() => {
        // Если загрузка завершена и пользователя нет, перенаправляем его
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    // 4. ПОКА ИДЕТ ПРОВЕРКА СЕССИИ, ПОКАЗЫВАЕМ ЗАГРУЗКУ
    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <ArrowPathIcon className="h-12 w-12 text-[#d4af37] animate-spin" />
            </div>
        );
    }

    // 5. КОГДА ДАННЫЕ ЗАГРУЖЕНЫ, ОТОБРАЖАЕМ КОНТЕНТ
    return (
        <AnimatedPageWrapper>
            {/* Header уже использует useAuth, поэтому он тоже обновится */}
            <Header />
            <main className="min-h-[80vh] bg-neutral-950 text-white font-sans py-16 sm:py-24 px-4">
                <div className="max-w-3xl mx-auto space-y-12">
                    <section>
                        <div className="flex items-center mb-6">
                            <UserCircleIcon className="h-8 w-8 text-[#d4af37] mr-3 shrink-0" />
                            <h1 className="text-2xl font-bold text-white">Ваш профиль</h1>
                            {/* Кнопка выхода теперь использует функцию из контекста */}
                            <button 
                                onClick={signOut} 
                                title="Выйти" 
                                className="ml-auto p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-full hover:bg-neutral-800"
                            >
                                <ArrowRightOnRectangleIcon className="h-6 w-6"/>
                            </button>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-4">
                            {/* Данные берем из объекта user, полученного от Supabase */}
                            <div className="flex items-center">
                                <UserCircleIcon className="h-5 w-5 text-neutral-500 mr-4 shrink-0" />
                                <span className="text-sm text-neutral-400">Имя:</span>
                                <span className="ml-auto font-medium text-white text-right">{user.user_metadata.name || 'Не указано'}</span>
                            </div>
                            <div className="flex items-center">
                                <PhoneSolidIcon className="h-5 w-5 text-neutral-500 mr-4 shrink-0" />
                                <span className="text-sm text-neutral-400">Телефон:</span>
                                <span className="ml-auto font-medium text-white">{user.user_metadata.phone || 'Не указан'}</span>
                            </div>
                            <div className="flex items-center">
                                <EnvelopeSolidIcon className="h-5 w-5 text-neutral-500 mr-4 shrink-0" />
                                <span className="text-sm text-neutral-400">Email:</span>
                                <span className="ml-auto font-medium text-white text-right">{user.email || 'Не указан'}</span>
                            </div>
                        </div>
                    </section>

                    <SavedCalculations />
                    
                    {/* <UserPromoCodes /> */}

                </div>
            </main>
            <Footer />
        </AnimatedPageWrapper>
    );
}