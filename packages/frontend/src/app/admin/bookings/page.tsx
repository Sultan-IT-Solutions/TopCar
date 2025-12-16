// src/app/admin/bookings/page.tsx
'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import Image from 'next/image'
import { QRCodeCanvas } from 'qrcode.react'
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper'
import FadeInWhenVisible from '@/components/FadeInWhenVisible'
import {
  UserCircleIcon,
  PhoneIcon as PhoneSolidIcon,
  CalendarDaysIcon as CalendarSolidIcon,
  ClockIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightOnRectangleIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

type Booking = {
  id: string
  car_name: string
  user_name?: string
  user_phone: string
  date_from: string
  date_to: string
  created_at: string
  status?: 'confirmed' | 'active' | 'completed' | 'cancelled' 
  total_price?: number
  car_image_url?: string
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch (err) { 
    console.error("Date formatting error:", err);
    return "N/A";
  }
}
const formatDateTime = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleString('ru-RU', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch(err) { 
        console.error("DateTime formatting error:", err);
        return "N/A";
    }
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at_desc')
  const [adminUser, setAdminUser] = useState<{ email: string } | null>(null)

  const fetchBookings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const supabase = getSupabase()
    let query = supabase.from('bookings').select('*')

    if (sortBy === 'created_at_desc') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'created_at_asc') {
      query = query.order('created_at', { ascending: true })
    } else if (sortBy === 'date_from_desc') {
      query = query.order('date_from', { ascending: false })
    } else if (sortBy === 'date_from_asc') {
      query = query.order('date_from', { ascending: true })
    }

    const { data, error: dbError } = await query

    if (dbError) {
      console.error('Booking fetch error:', dbError)
      setError('Не удалось загрузить бронирования. Пожалуйста, попробуйте снова.')
    } else if (data) {
      setBookings(data as Booking[])
    }
    setIsLoading(false)
  }, [sortBy]);

  useEffect(() => {
    const storedUser = localStorage.getItem('topcar-user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          setAdminUser(user)
          fetchBookings()
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
  }, [router, fetchBookings])

  const deleteBooking = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это бронирование? Это действие необратимо.')) {
      return
    }
    const supabase = getSupabase()
    const { error: deleteError } = await supabase.from('bookings').delete().eq('id', id)
    if (deleteError) {
      console.error('Delete error:', deleteError)
      alert('Ошибка при удалении бронирования.')
    } else {
      setBookings((prev) => prev.filter((b) => b.id !== id))
      alert('Бронирование успешно удалено.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('topcar-user');
    setAdminUser(null); 
    router.push('/login'); 
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking =>
      booking.car_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.user_name && booking.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      booking.user_phone.includes(searchTerm) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);

  const getCarImagePath = (carName: string, carImageUrl?: string) => {
    if (carImageUrl) return carImageUrl; 
    const formattedName = carName.toLowerCase().replace(/mercedes-benz /g, '').replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '');
    if (formattedName.includes('g63')) return '/cars/g63.jpg';
    if (formattedName.includes('w223') || formattedName.includes('s580')) return '/cars/w223.jpg';
    return `/cars/placeholder-car.png`;
  }

  if (!adminUser) { 
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <ArrowPathIcon className="h-12 w-12 text-[#d4af37] animate-spin" />
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
                <h1 className="text-xl font-bold text-white">TopCar Admin Panel</h1>
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
            <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Управление <span className="text-[#d4af37]">Бронированиями</span>
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchBookings}
                  disabled={isLoading}
                  title="Обновить список"
                  className="p-2 text-neutral-400 hover:text-[#d4af37] disabled:opacity-50 transition-colors rounded-md hover:bg-neutral-800"
                >
                  <ArrowPathIcon className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <FadeInWhenVisible className="mb-6 sm:mb-8 p-4 sm:p-6 bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                <div className="relative sm:col-span-2 md:col-span-1">
                  <label htmlFor="searchTerm" className="block text-xs font-medium text-neutral-400 mb-1">Поиск</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input
                      type="text"
                      id="searchTerm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ID, Имя, Телефон, Авто..."
                      className="w-full pl-10 pr-3 py-2.5 text-sm text-white bg-neutral-800 border border-neutral-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="sortBy" className="block text-xs font-medium text-neutral-400 mb-1">Сортировать по</label>
                   <div className="relative">
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); }}
                        className="w-full pl-3 pr-10 py-2.5 text-sm text-white bg-neutral-800 border border-neutral-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] appearance-none"
                    >
                        <option value="created_at_desc">Новые сначала (по созданию)</option>
                        <option value="created_at_asc">Старые сначала (по созданию)</option>
                        <option value="date_from_desc">Новые сначала (по дате аренды)</option>
                        <option value="date_from_asc">Старые сначала (по дате аренды)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                        <FunnelIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>

            {isLoading ? (
              <div className="text-center py-20">
                <ArrowPathIcon className="h-12 w-12 text-[#d4af37] animate-spin mx-auto" />
                <p className="mt-4 text-neutral-400">Загрузка бронирований...</p>
              </div>
            ) : error ? (
                <div className="text-center py-20 px-6 bg-red-900/20 border border-red-700/50 rounded-lg">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <p className="text-lg font-medium text-red-300 mb-1">Ошибка загрузки</p>
                    <p className="text-sm text-red-400">{error}</p>
                    <button 
                        onClick={fetchBookings}
                        className="mt-6 px-5 py-2 bg-[#d4af37] text-black text-sm font-semibold rounded-md hover:bg-[#c0982c] transition-colors"
                    >
                        Попробовать снова
                    </button>
                </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-20 px-6 bg-neutral-800/30 border border-neutral-700 rounded-lg">
                <NoSymbolIcon className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-xl font-semibold text-neutral-300 mb-2">
                  {searchTerm ? "Бронирования не найдены" : "Нет активных бронирований"}
                </p>
                <p className="text-neutral-400">
                  {searchTerm ? "По вашему запросу ничего не найдено." : "Как только появятся новые бронирования, они будут отображены здесь."}
                </p>
              </div>
            ) : (
              <ul className="space-y-6">
                {filteredBookings.map((b) => (
                  <li
                    key={b.id}
                    className="bg-neutral-800/60 border border-neutral-700/70 rounded-xl shadow-lg 
                               overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-neutral-600"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 p-4 sm:p-5 items-center">
                      <div className="md:col-span-2 aspect-video sm:aspect-square md:aspect-[4/3] relative rounded-lg overflow-hidden bg-neutral-700/50">
                        <Image
                          src={getCarImagePath(b.car_name, b.car_image_url)}
                          alt={b.car_name}
                          layout="fill"
                          objectFit="cover"
                          onError={(imgEvent) => { (imgEvent.target as HTMLImageElement).src = '/cars/placeholder-car.png'; }}
                        />
                      </div>
                      <div className="md:col-span-5 space-y-1.5">
                        <h3 className="text-lg font-semibold text-white leading-tight">{b.car_name}</h3>
                        <p className="text-sm text-neutral-300 flex items-center">
                          <UserCircleIcon className="h-4 w-4 mr-2 text-[#d4af37]/80 flex-shrink-0" />
                          {b.user_name || 'Имя не указано'}
                        </p>
                        <p className="text-sm text-neutral-300 flex items-center">
                          <PhoneSolidIcon className="h-4 w-4 mr-2 text-[#d4af37]/80 flex-shrink-0" />
                          {b.user_phone}
                        </p>
                        <p className="text-sm text-neutral-300 flex items-center">
                          <CalendarSolidIcon className="h-4 w-4 mr-2 text-[#d4af37]/80 flex-shrink-0" />
                          {formatDate(b.date_from)} - {formatDate(b.date_to)}
                        </p>
                      </div>
                      <div className="md:col-span-3 flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
                        <div className="p-2 bg-neutral-900 rounded-md border border-neutral-700">
                          <QRCodeCanvas
                            value={JSON.stringify({ bookingId: b.id, car: b.car_name, client: b.user_phone })}
                            size={64}
                            bgColor="transparent"
                            fgColor="#FFFFFF"
                            level="M"
                            className="rounded-sm"
                          />
                        </div>
                        <p className="text-xs text-neutral-500 flex items-center mt-1">
                          <ClockIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                          Создано: {formatDateTime(b.created_at)}
                        </p>
                      </div>
                      <div className="md:col-span-2 flex flex-col sm:flex-row md:flex-col gap-2 items-stretch md:items-end justify-center md:justify-end">
                        <button
                          onClick={() => deleteBooking(b.id)}
                          title="Удалить бронирование"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-400 bg-red-900/30 hover:bg-red-800/50 border border-red-700/50 hover:border-red-600 rounded-md transition-colors w-full md:w-auto"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Удалить
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </AnimatedPageWrapper>
  )
}
