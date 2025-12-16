// src/app/admin/cars/page.tsx
'use client'

import { useEffect, useState, ChangeEvent, FormEvent, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getSupabase } from '@/lib/supabase'
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper'
import FadeInWhenVisible from '@/components/FadeInWhenVisible'
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  TagIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline'

type Car = {
  id: number
  name: string
  brand: string
  class: string
  price: number
  image_url: string
  created_at?: string
}

const formatPrice = (price: number) => {
  return price.toLocaleString('ru-RU');
}

interface FormInputFieldProps {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    accept?: string;
    min?: string;
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const initialNewCarState = {
    name: '',
    brand: '',
    class: '',
    price: '',
    file: null as File | null,
  }
  const [newCar, setNewCar] = useState(initialNewCarState)
  const [preview, setPreview] = useState<string | null>(null)
  const [adminUser, setAdminUser] = useState<{ email: string } | null>(null)
  const [formMessage, setFormMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const router = useRouter()

  const fetchCars = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const supabase = getSupabase()
    const { data, error: dbError } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Fetch cars error:', dbError)
      setError('Не удалось загрузить список автомобилей.')
    } else if (data) {
      setCars(data as Car[])
    }
    setIsLoading(false)
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('topcar-user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          setAdminUser(user)
          fetchCars()
        } else {
          router.push('/')
        }
      } catch (err) {
        console.error("Auth Error:", err);
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [router, fetchCars])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewCar((prev) => ({ ...prev, file }))
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file);
    } else {
      setNewCar((prev) => ({ ...prev, file: null }));
      setPreview(null);
    }
  }

  const handleAddCar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newCar.name || !newCar.brand || !newCar.class || !newCar.price || !newCar.file) {
      setFormMessage({type: 'error', text: 'Пожалуйста, заполните все поля и выберите изображение.'})
      return
    }
    setIsSubmitting(true)
    setFormMessage(null)
    const supabase = getSupabase()

    const fileExt = newCar.file.name.split('.').pop()
    const fileName = `car_${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('cars')
      .upload(filePath, newCar.file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setFormMessage({type: 'error', text: `Ошибка загрузки изображения: ${uploadError.message}`})
      setIsSubmitting(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('cars').getPublicUrl(filePath)
    const imageUrl = publicUrlData?.publicUrl

    if (!imageUrl) {
        setFormMessage({type: 'error', text: 'Не удалось получить публичный URL для изображения.'})
        setIsSubmitting(false)
        await supabase.storage.from('cars').remove([filePath]);
        return;
    }
    
    const carDataToInsert = {
      name: newCar.name,
      brand: newCar.brand,
      class: newCar.class,
      price: parseInt(newCar.price),
      image_url: imageUrl,
    }

    const { error: insertError } = await supabase.from('cars').insert([carDataToInsert]).select()

    if (insertError) {
      console.error('Insert error:', insertError)
      setFormMessage({type: 'error', text: `Ошибка добавления автомобиля в базу: ${insertError.message}`})
      await supabase.storage.from('cars').remove([filePath]);
    } else {
      setFormMessage({type: 'success', text: `Автомобиль "${newCar.name}" успешно добавлен!`})
      setNewCar(initialNewCarState)
      setPreview(null)
      if (document.getElementById('carImageFile')) {
        (document.getElementById('carImageFile') as HTMLInputElement).value = "";
      }
      fetchCars()
      setTimeout(() => setFormMessage(null), 4000);
    }
    setIsSubmitting(false)
  }

  const handleDeleteCar = async (carToDelete: Car) => {
    if (!window.confirm(`Вы уверены, что хотите удалить автомобиль "${carToDelete.name}"? Это действие необратимо.`)) {
      return
    }

    const supabase = getSupabase()
    
    let imagePath = '';
    try {
        const url = new URL(carToDelete.image_url);
        imagePath = url.pathname.substring(url.pathname.indexOf('/cars/') + '/cars/'.length);
    } catch (err) {
        console.error("Invalid image URL, cannot extract path for deletion:", carToDelete.image_url, err);
        alert("Не удалось определить путь к файлу изображения для удаления. Удаление из базы данных будет продолжено.");
    }

    if (imagePath) {
        const { error: storageError } = await supabase.storage.from('cars').remove([imagePath])
        if (storageError) {
            console.error('Storage delete error:', storageError)
            alert(`Ошибка при удалении изображения из хранилища: ${storageError.message}. Запись из базы данных будет удалена.`);
        }
    }

    const { error: dbError } = await supabase.from('cars').delete().eq('id', carToDelete.id)
    if (dbError) {
      console.error('DB delete error:', dbError)
      alert(`Ошибка при удалении автомобиля из базы данных: ${dbError.message}`)
    } else {
      setCars((prev) => prev.filter((car) => car.id !== carToDelete.id))
      alert(`Автомобиль "${carToDelete.name}" успешно удален.`)
    }
  }
  
  const handleLogout = () => {
    localStorage.removeItem('topcar-user');
    setAdminUser(null);
    router.push('/login');
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <ArrowPathIcon className="h-12 w-12 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  const FormInputField = ({id, label, type = "text", placeholder, value, onChange, required = true, accept, min}: FormInputFieldProps) => (
    <div>
        <label htmlFor={id} className="block text-xs font-medium text-neutral-400 mb-1">{label}</label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            accept={accept}
            min={min}
            className="w-full py-2.5 px-3 text-sm text-white bg-neutral-800 border border-neutral-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]"
        />
    </div>
  );

  return (
    <AnimatedPageWrapper>
      <div className="min-h-screen bg-neutral-950 text-white font-sans">
        <header className="sticky top-0 z-40 bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-700/80 shadow-sm">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Cog6ToothIcon className="h-7 w-7 text-[#d4af37] mr-2"/>
                        <h1 className="text-xl font-bold text-white">TopCar Admin: Автомобили</h1>
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
            <div className="mb-8 sm:mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Управление <span className="text-[#d4af37]">Автопарком</span>
              </h2>
            </div>

            <FadeInWhenVisible className="mb-10 sm:mb-12">
              <form 
                onSubmit={handleAddCar} 
                className="p-6 sm:p-8 bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-xl space-y-6"
              >
                <h3 className="text-xl sm:text-2xl font-semibold text-white flex items-center">
                  <PlusCircleIcon className="h-7 w-7 text-[#d4af37] mr-2.5"/>
                  Добавить новый автомобиль
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <FormInputField id="name" label="Название модели" placeholder="Mercedes-Benz S580" value={newCar.name} onChange={(e) => setNewCar({ ...newCar, name: e.target.value })} />
                    <FormInputField id="brand" label="Марка" placeholder="Mercedes-Benz" value={newCar.brand} onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })} />
                    <FormInputField id="class" label="Класс" placeholder="Люкс, Премиум, Бизнес" value={newCar.class} onChange={(e) => setNewCar({ ...newCar, class: e.target.value })} />
                    <FormInputField id="price" label="Цена (₸/день)" type="number" placeholder="150000" value={newCar.price} onChange={(e) => setNewCar({ ...newCar, price: e.target.value })} min="0" />
                </div>

                <div>
                    <label htmlFor="carImageFile" className="block text-xs font-medium text-neutral-400 mb-1">Изображение автомобиля</label>
                    <input
                        type="file"
                        id="carImageFile"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        required
                        className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#d4af37]/20 file:text-[#d4af37] hover:file:bg-[#d4af37]/30 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] border border-neutral-600 rounded-lg cursor-pointer bg-neutral-800 p-1"
                    />
                </div>

                {preview && (
                  <div className="mt-3 p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg inline-block">
                    <p className="text-xs text-neutral-400 mb-1.5">Предпросмотр:</p>
                    <Image
                      src={preview}
                      alt="Предпросмотр нового авто"
                      width={200}
                      height={120}
                      className="rounded-md object-cover aspect-[16/10]"
                    />
                  </div>
                )}

                {formMessage && (
                    <div className={`flex items-center gap-2 p-3 rounded-md text-sm mt-1 ${formMessage.type === 'success' ? 'bg-green-900/30 border border-green-700/50 text-green-300' : ''} ${formMessage.type === 'error' ? 'bg-red-900/30 border border-red-700/50 text-red-300' : ''}`}>
                        {formMessage.type === 'success' && <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />}
                        {formMessage.type === 'error' && <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />}
                        <span>{formMessage.text}</span>
                    </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto mt-2 px-8 py-3 bg-[#d4af37] text-black rounded-lg text-sm sm:text-base font-semibold hover:bg-[#c0982c] focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      Добавление...
                    </>
                  ) : (
                    <>
                      <PlusCircleIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                      Добавить автомобиль
                    </>
                  )}
                </button>
              </form>
            </FadeInWhenVisible>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-white">Список автомобилей ({cars.length})</h3>
                <button
                    onClick={fetchCars}
                    disabled={isLoading}
                    title="Обновить список"
                    className="p-1.5 text-neutral-500 hover:text-[#d4af37] disabled:opacity-50 transition-colors rounded-md hover:bg-neutral-800"
                >
                    <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {isLoading && cars.length === 0 ? (
                <div className="text-center py-16">
                  <ArrowPathIcon className="h-10 w-10 text-[#d4af37] animate-spin mx-auto" />
                  <p className="mt-3 text-neutral-400">Загрузка автомобилей...</p>
                </div>
              ) : error && cars.length === 0 ? (
                 <div className="text-center py-16 px-6 bg-red-900/20 border border-red-700/50 rounded-lg">
                    <ExclamationTriangleIcon className="h-10 w-10 text-red-500 mx-auto mb-3" />
                    <p className="text-lg font-medium text-red-300 mb-1">Ошибка</p>
                    <p className="text-sm text-red-400">{error}</p>
                 </div>
              ) : cars.length === 0 ? (
                <div className="text-center py-16 px-6 bg-neutral-800/30 border border-neutral-700 rounded-lg">
                  <NoSymbolIcon className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
                  <p className="text-lg font-medium text-neutral-300">Автомобили не найдены.</p>
                  <p className="text-sm text-neutral-400">Добавьте свой первый автомобиль с помощью формы выше.</p>
                </div>
              ) : (
                <ul className="space-y-5">
                  {cars.map((car) => (
                    <li
                      key={car.id}
                      className="bg-neutral-800/60 border border-neutral-700/70 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-neutral-600"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 p-4 sm:p-5">
                        <div className="w-full sm:w-40 h-32 sm:h-28 flex-shrink-0 relative rounded-lg overflow-hidden bg-neutral-700/50">
                          <Image
                            src={car.image_url || '/cars/placeholder-car.png'}
                            alt={car.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 160px"
                            className="object-cover"
                            onError={(imgEvent) => { (imgEvent.target as HTMLImageElement).src = '/cars/placeholder-car.png'; }}
                          />
                        </div>
                        <div className="flex-grow space-y-1 text-center sm:text-left">
                          <h4 className="text-lg font-semibold text-white leading-tight">{car.name}</h4>
                          <p className="text-xs text-neutral-400">
                            <IdentificationIcon className="h-3.5 w-3.5 inline mr-1 opacity-70" />
                            {car.brand} &bull; {car.class}
                          </p>
                          <p className="text-sm font-medium text-[#d4af37]">
                            <TagIcon className="h-3.5 w-3.5 inline mr-1 opacity-70" />
                            {formatPrice(car.price)} ₸ / день
                          </p>
                           <p className="text-xs text-neutral-500 pt-0.5">
                             ID: {car.id}
                           </p>
                        </div>
                        <div className="flex-shrink-0 mt-3 sm:mt-0">
                          <button
                            onClick={() => handleDeleteCar(car)}
                            title="Удалить автомобиль"
                            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-400 bg-red-900/30 hover:bg-red-800/50 border border-red-700/50 hover:border-red-600 rounded-lg transition-colors"
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
          </div>
        </main>
      </div>
    </AnimatedPageWrapper>
  )
}