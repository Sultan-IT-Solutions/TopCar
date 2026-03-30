'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import {
    ArrowPathIcon,
    ArrowRightOnRectangleIcon,
    ChartBarSquareIcon,
    BuildingOffice2Icon,
    Cog6ToothIcon,
    DocumentTextIcon,
    InboxIcon,
    TagIcon,
    TicketIcon,
    TruckIcon,
} from '@heroicons/react/24/outline';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import FadeInWhenVisible from '@/components/FadeInWhenVisible';
import { useAdminSession } from '@/hooks/useAdminSession';

const adminNavItems = [
    {
        name: 'Управление бронированиями',
        description: 'Просмотр, поиск и удаление заявок на аренду.',
        href: '/admin/bookings',
        Icon: TicketIcon,
        accent: 'text-blue-400',
    },
    {
        name: 'Управление автопарком',
        description: 'Добавление и удаление автомобилей каталога через серверные admin API.',
        href: '/admin/cars',
        Icon: TruckIcon,
        accent: 'text-emerald-400',
    },
    {
        name: 'Тарифы и форматы',
        description:
            'Отдельные цены без водителя и с водителем по диапазонам дней для калькулятора аренды.',
        href: '/admin/tariffs',
        Icon: TagIcon,
        accent: 'text-violet-300',
    },
    {
        name: 'Промокоды и скидки',
        description:
            'Публичные и персональные промокоды, ограничения применения и статистика использования.',
        href: '/admin/promos',
        Icon: TagIcon,
        accent: 'text-fuchsia-300',
    },
    {
        name: 'Заявки и лиды',
        description:
            'Единая лента всех запросов с фильтрами по источнику, статусу, автомобилю и промокоду.',
        href: '/admin/requests',
        Icon: InboxIcon,
        accent: 'text-orange-300',
    },
    {
        name: 'Аналитика',
        description:
            'Установки PWA, регистрации, клики по мессенджерам, заявки, брони и выручка по датам.',
        href: '/admin/analytics',
        Icon: ChartBarSquareIcon,
        accent: 'text-lime-300',
    },
    {
        name: 'Документы компании',
        description: 'Загрузка и замена документов для раздела безопасности.',
        href: '/admin/upload',
        Icon: DocumentTextIcon,
        accent: 'text-amber-300',
    },
    {
        name: 'Контакты и компания',
        description:
            'Телефоны, мессенджеры, адрес, почта, PWA-ссылка и общие настройки витрины.',
        href: '/admin/company',
        Icon: BuildingOffice2Icon,
        accent: 'text-cyan-300',
    },
    {
        name: 'FAQ и условия аренды',
        description:
            'Редактирование вопросов-ответов и секций условий аренды сразу для трех языков.',
        href: '/admin/content',
        Icon: DocumentTextIcon,
        accent: 'text-rose-300',
    },
];

export default function AdminDashboardPage() {
    const { admin, isLoading, logout } = useAdminSession();

    if (isLoading || !admin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950">
                <ArrowPathIcon className="h-12 w-12 animate-spin text-[#d4af37]" />
            </div>
        );
    }

    return (
        <AnimatedPageWrapper>
            <div className="min-h-screen bg-neutral-950 text-white">
                <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <Cog6ToothIcon className="h-7 w-7 text-[#d4af37]" />
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                                    TopCar
                                </p>
                                <h1 className="text-lg font-bold text-white">
                                    Админ-панель
                                </h1>
                            </div>
                        </div>
                        <button
                            onClick={() => void logout()}
                            className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Выйти
                        </button>
                    </div>
                </header>

                <main className="px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <FadeInWhenVisible className="mb-10">
                            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Панель <span className="text-[#d4af37]">управления</span>
                            </h2>
                            <p className="mt-2 text-neutral-400">
                                Активная admin-сессия: {admin.username}
                            </p>
                        </FadeInWhenVisible>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                            {adminNavItems.map((item, index) => (
                                <FadeInWhenVisible key={item.href} delay={index * 0.08}>
                                    <Link
                                        href={item.href}
                                        className="group block rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl transition hover:-translate-y-1 hover:border-[#d4af37]/40"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-2xl border border-neutral-700 bg-black/30 p-3">
                                                <item.Icon className={`h-8 w-8 ${item.accent}`} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">
                                                    {item.name}
                                                </h3>
                                                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </FadeInWhenVisible>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </AnimatedPageWrapper>
    );
}
