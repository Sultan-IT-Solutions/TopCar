// src/app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper'
import FadeInWhenVisible from '@/components/FadeInWhenVisible'
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  // Squares2X2Icon, // REMOVED
  TicketIcon,
  TruckIcon,
  // UsersIcon, // REMOVED
  // AdjustmentsHorizontalIcon, // REMOVED
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

type AdminNavItem = {
  name: string;
  description: string;
  href: string;
  Icon: React.ForwardRefExoticComponent<Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
    title?: string | undefined;
    titleId?: string | undefined;
  } & React.RefAttributes<SVGSVGElement>>;
  bgColorClass: string;
  textColorClass: string;
};

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<{ email: string; name?: string } | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('topcar-user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          setAdminUser(user)
        } else {
          router.push('/')
        }
      } catch (err) { 
        console.error("Auth error:", err);
        router.push('/')
      }
    } else {
      router.push('/')
    }
    setIsLoadingAuth(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('topcar-user');
    setAdminUser(null);
    router.push('/login'); 
  };

  const adminNavItems: AdminNavItem[] = [
    {
      name: 'Управление Бронированиями',
      description: 'Просмотр, поиск и управление всеми заявками на аренду.',
      href: '/admin/bookings',
      Icon: TicketIcon,
      bgColorClass: 'from-blue-900/30 to-neutral-900/30',
      textColorClass: 'text-blue-400',
    },
    {
      name: 'Управление Автопарком',
      description: 'Добавление, редактирование и удаление автомобилей из каталога.',
      href: '/admin/cars',
      Icon: TruckIcon,
      bgColorClass: 'from-green-900/30 to-neutral-900/30',
      textColorClass: 'text-green-400',
    },
  ];

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <ArrowPathIcon className="h-12 w-12 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-8">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Доступ запрещен</h1>
            <p className="text-neutral-400 mb-6 text-center">У вас нет прав для доступа к этой странице.</p>
            <Link href="/" className="px-6 py-2 bg-[#d4af37] text-black rounded-md font-medium hover:bg-[#c0982c] transition-colors">
                На главную
            </Link>
        </div>
    );
  }

  return (
    <AnimatedPageWrapper>
      <div className="min-h-screen bg-neutral-950 text-white font-sans">
        <header className="sticky top-0 z-40 bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-700/80 shadow-sm">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Cog6ToothIcon className="h-7 w-7 text-[#d4af37] mr-2"/>
                <h1 className="text-xl font-bold text-white">TopCar Admin</h1>
              </div>
              <button
                onClick={handleLogout}
                title="Выйти"
                className="flex items-center text-sm text-neutral-400 hover:text-[#d4af37] transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5" />
                Выйти
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <FadeInWhenVisible className="mb-10 sm:mb-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    Панель <span className="text-[#d4af37]">Управления</span>
                  </h2>
                  <p className="mt-1 text-lg text-neutral-400">
                    Добро пожаловать, {adminUser.name || adminUser.email}!
                  </p>
                </div>
              </div>
            </FadeInWhenVisible>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {adminNavItems.map((item, idx) => (
                <FadeInWhenVisible key={item.name} delay={idx * 0.1}>
                  <Link
                    href={item.href}
                    className={`group block p-6 sm:p-8 rounded-2xl border border-neutral-700/70 
                               bg-gradient-to-br ${item.bgColorClass} hover:border-[#d4af37]/60
                               shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 p-3 rounded-lg bg-black/30 border border-neutral-600 group-hover:border-[#d4af37]/50`}>
                        <item.Icon className={`h-8 w-8 ${item.textColorClass} group-hover:text-[#d4af37] transition-colors`} />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-[#d4af37] transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors leading-relaxed">
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
  )
}
