'use client'

import { useState, useMemo, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ChevronDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Car, Price } from '@/types';
import { getSupabase } from '@/lib/supabase';
// import Image from 'next/image'; // <-- СТРОКА УДАЛЕНА
import FormattedPrice from './FormattedPrice';
import BookingModal from './BookingModal';

type CalculatorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ServiceType = 'withDriver' | 'withoutDriver';
type DurationOption = {
  label: string;
  value: string;
};

type BookingDetails = {
  serviceType: string;
  duration: string;
  price: number;
  conditions?: string;
};

export default function CalculatorModal({ isOpen, onClose }: CalculatorModalProps) {
  const [carsData, setCarsData] = useState<Car[]>([]);
  const [isCarsLoading, setIsCarsLoading] = useState(true);

  const [selectedCarId, setSelectedCarId] = useState<number | string>('');
  const [serviceType, setServiceType] = useState<ServiceType>('withoutDriver');
  const [selectedDurationKey, setSelectedDurationKey] = useState<string>('');
  
  const [bookingInfo, setBookingInfo] = useState<{ car: Car, details: BookingDetails } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchCars = async () => {
        setIsCarsLoading(true);
        const supabase = getSupabase();
        const { data, error } = await supabase.from('cars').select('*, prices (*)').order('id');
        
        if (error) console.error("Ошибка загрузки автомобилей с ценами:", error);
        else if (data) setCarsData(data as Car[]);
        setIsCarsLoading(false);
      };
      fetchCars();
    }
  }, [isOpen]);

  const selectedCar = useMemo(() => carsData.find(c => c.id === Number(selectedCarId)) || null, [selectedCarId, carsData]);

  const { availableDurations, totalPrice, selectedPriceInfo } = useMemo(() => {
    if (!selectedCar || !selectedCar.prices) {
      return { availableDurations: [], totalPrice: 0, selectedPriceInfo: null };
    }

    const isWithDriver = serviceType === 'withDriver';
    const relevantPrices = selectedCar.prices.filter(p => p.with_driver === isWithDriver).sort((a,b) => a.days_from - b.days_from);
    
    const durationOptions: DurationOption[] = relevantPrices.map(p => {
        const durationLabel = p.days_from === p.days_to ? `${p.days_from}ч` : `${p.days_from}-${p.days_to} дней`;
        return {
            label: durationLabel,
            value: `${p.id}-${p.days_from}`,
        }
    });

    let price = 0;
    let priceInfo: Price | null = null;
    if (selectedDurationKey) {
        const priceId = Number(selectedDurationKey.split('-')[0]);
        const foundPrice = relevantPrices.find(p => p.id === priceId);
        if (foundPrice) {
            price = foundPrice.price_per_day;
            priceInfo = foundPrice;
        }
    }

    return { availableDurations: durationOptions, totalPrice: price, selectedPriceInfo: priceInfo };
  }, [selectedCar, serviceType, selectedDurationKey]);

  const handleCarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCarId(e.target.value);
    setServiceType('withoutDriver');
    setSelectedDurationKey('');
  };

  const handleServiceTypeChange = (type: ServiceType) => {
    setServiceType(type);
    setSelectedDurationKey('');
  }

  const handleBookingSubmit = () => {
    if (!selectedCar || !selectedPriceInfo) {
      alert("Пожалуйста, выберите все опции.");
      return;
    }

    const bookingDetails: BookingDetails = {
      serviceType: serviceType === 'withDriver' ? 'С водителем' : 'Без водителя',
      duration: `${selectedPriceInfo.days_from}ч`,
      price: selectedPriceInfo.price_per_day,
      conditions: selectedPriceInfo.conditions,
    };
    
    setBookingInfo({ car: selectedCar, details: bookingDetails });
    onClose();
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                    <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-700 p-6 sm:p-8 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white">Калькулятор аренды</Dialog.Title>
                        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"><XMarkIcon className="h-6 w-6" /></button>
                        <div className="mt-6 space-y-6">
                            <div>
                                <label htmlFor="carSelectCalc" className="block text-sm font-medium text-neutral-300 mb-2">1. Выберите автомобиль</label>
                                <div className="relative">
                                    <select id="carSelectCalc" className="w-full pl-3 pr-10 py-3 text-base text-white bg-neutral-800 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] appearance-none" value={selectedCarId} onChange={handleCarChange} disabled={isCarsLoading}>
                                        <option value="" disabled className="text-neutral-500">{isCarsLoading ? 'Загрузка...' : 'Модель автомобиля...'}</option>
                                        {carsData.map((car) => (<option key={car.id} value={car.id} className="bg-neutral-800 text-white">{car.name}</option>))}
                                    </select>
                                    <ChevronDownIcon className="pointer-events-none absolute inset-y-0 right-0 mr-3 h-full w-5 text-neutral-400" />
                                </div>
                            </div>
                            {selectedCar && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">2. Выберите тип услуги</label>
                                    <div className="grid grid-cols-2 rounded-lg bg-neutral-800 p-1">
                                        <button type="button" onClick={() => handleServiceTypeChange('withoutDriver')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${serviceType === 'withoutDriver' ? 'bg-[#d4af37] text-black shadow' : 'text-neutral-300 hover:bg-neutral-700'}`}>Без водителя</button>
                                        <button type="button" onClick={() => handleServiceTypeChange('withDriver')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${serviceType === 'withDriver' ? 'bg-[#d4af37] text-black shadow' : 'text-neutral-300 hover:bg-neutral-700'}`}>С водителем</button>
                                    </div>
                                </div>
                            )}
                            {selectedCar && availableDurations.length > 0 && (
                                <div>
                                    <label htmlFor="durationSelect" className="block text-sm font-medium text-neutral-300 mb-2">3. Выберите продолжительность</label>
                                    <div className="relative">
                                        <select id="durationSelect" className="w-full pl-3 pr-10 py-3 text-base text-white bg-neutral-800 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] appearance-none" value={selectedDurationKey} onChange={(e) => setSelectedDurationKey(e.target.value)}>
                                            <option value="" disabled className="text-neutral-500">Время аренды...</option>
                                            {availableDurations.map(d => (<option key={d.value} value={d.value} className="bg-neutral-800 text-white">{d.label}</option>))}
                                        </select>
                                        <ChevronDownIcon className="pointer-events-none absolute inset-y-0 right-0 mr-3 h-full w-5 text-neutral-400" />
                                    </div>
                                </div>
                            )}
                            {totalPrice > 0 && (
                                <div className="mt-6 pt-6 border-t border-neutral-700 text-center">
                                    <p className="text-sm text-neutral-300 mb-1">Итоговая стоимость:</p>
                                    <p className="text-3xl font-bold text-[#d4af37]"><FormattedPrice value={totalPrice} /> ₸</p>
                                </div>
                            )}
                            <button type="button" onClick={handleBookingSubmit} disabled={totalPrice === 0} className="w-full mt-6 px-8 py-3 bg-[#d4af37] text-black rounded-lg text-base font-semibold hover:bg-[#c0982c] transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50 disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="flex items-center justify-center"><CheckCircleIcon className="h-5 w-5 mr-2" /> Оформить заявку</span>
                            </button>
                        </div>
                    </Dialog.Panel>
                </Transition.Child>
                </div>
            </div>
        </Dialog>
      </Transition>

      {bookingInfo && (
        <BookingModal 
          isOpen={!!bookingInfo}
          onClose={() => setBookingInfo(null)}
          carName={bookingInfo.car.name}
          bookingDetails={bookingInfo.details}
        />
      )}
    </>
  );
}