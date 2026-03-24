'use client';

import { useState, useMemo, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    XMarkIcon,
    ChevronDownIcon,
    CheckCircleIcon,
    BookmarkSquareIcon,
} from '@heroicons/react/24/outline';
import { Car } from '@/types';
import { getSupabase, hasPublicSupabaseConfig } from '@/lib/supabase';
import FormattedPrice from './FormattedPrice';
import BookingModal from './BookingModal';
import { useAuth } from '@/context/AuthContext';
import { csrfClientHelper } from '@/lib/csrf-client';
import { useTranslations } from '@/lib/i18n';
import {
    calculateRentalTotal,
    formatPriceTierLabel,
    formatRentalDaysLabel,
    formatRentalPeriod,
    getMatchingPrice,
    getRentalDays,
    isCarAvailable,
} from '@/lib/car-utils';

type CalculatorModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type ServiceType = 'withDriver' | 'withoutDriver';

type BookingDetails = {
    serviceType: string;
    duration: string;
    price: number;
    conditions?: string;
    carId?: number;
    startDate?: string;
    endDate?: string;
};

type StatusMessage = {
    type: 'success' | 'error' | 'info';
    text: string;
} | null;

const today = new Date().toISOString().split('T')[0];

export default function CalculatorModal({
    isOpen,
    onClose,
}: CalculatorModalProps) {
    const { locale } = useTranslations();
    const { user, session } = useAuth();
    const [carsData, setCarsData] = useState<Car[]>([]);
    const [isCarsLoading, setIsCarsLoading] = useState(true);
    const [selectedCarId, setSelectedCarId] = useState<number | string>('');
    const [serviceType, setServiceType] =
        useState<ServiceType>('withoutDriver');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bookingInfo, setBookingInfo] = useState<{
        car: Car;
        details: BookingDetails;
    } | null>(null);
    const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);
    const [isSavingCalculation, setIsSavingCalculation] = useState(false);

    const copy =
        locale === 'en'
            ? {
                  configMissing:
                      'The rental calculator is being updated and will be available shortly.',
                  loadError:
                      'We could not load the catalog for the calculation right now. Please try again a bit later.',
                  withDriver: 'With driver',
                  withoutDriver: 'Without driver',
                  loginToSave: 'Sign in to your account to save calculations.',
                  saved: 'The calculation has been saved to your account.',
                  saveError:
                      'We could not save the estimate right now. Please try again again in a moment.',
                  fillParams: 'Fill in the calculation details first.',
                  title: 'Rental Calculator',
                  subtitle:
                      'Choose a car, rental format, and travel dates. We will estimate the total cost for the full period and let you continue with a request right away.',
                  availabilityNotice:
                      'Only cars currently available in the active fleet are included in the calculation.',
                  selectCar: '1. Choose a car',
                  loading: 'Loading...',
                  carPlaceholder: 'Car model...',
                  noCars: 'No available cars',
                  format: '2. Rental format',
                  startDate: '3. Start date',
                  endDate: '4. Return date',
                  noTariff:
                      'There is no matching tariff for the selected period yet. Leave a request and a manager will prepare an individual quote.',
                  noFormatTariff:
                      'This rental format is being confirmed individually for the selected car. Leave a request and a manager will prepare the final offer.',
                  summary: 'Preliminary estimate',
                  total: 'Total price',
                  tariff: 'Tariff',
                  perDay: 'Daily rate',
                  availability: 'Availability',
                  availableForDates: 'Available for selected dates',
                  saveButton: 'Save estimate',
                  saving: 'Saving...',
                  requestButton: 'Create request',
              }
            : locale === 'kk'
              ? {
                    configMissing:
                        'Жалдау калькуляторы жаңартылып жатыр және жақын арада қолжетімді болады.',
                    loadError:
                        'Қазір есептеу үшін каталогты жүктеу мүмкін болмады. Сәл кейінірек қайталап көріңіз.',
                    withDriver: 'Жүргізушімен',
                    withoutDriver: 'Жүргізушісіз',
                    loginToSave:
                        'Есептерді сақтау үшін жеке кабинетке кіріңіз.',
                    saved: 'Есеп жеке кабинетке сақталды.',
                    saveError:
                        'Есепті қазір сақтау мүмкін болмады. Сәл кейінірек қайталап көріңіз.',
                    fillParams: 'Алдымен есептеу параметрлерін толтырыңыз.',
                    title: 'Жалдау калькуляторы',
                    subtitle:
                        'Көлікті, жалдау форматын және сапар күндерін таңдаңыз. Біз бүкіл кезең үшін алдын ала құнын есептеп, сұранысты бірден рәсімдеуге көмектесеміз.',
                    availabilityNotice:
                        'Есепке тек қолжетімді автопарктегі көліктер ғана енгізілген.',
                    selectCar: '1. Көлікті таңдаңыз',
                    loading: 'Жүктелуде...',
                    carPlaceholder: 'Көлік моделі...',
                    noCars: 'Қолжетімді көлік жоқ',
                    format: '2. Жалдау форматы',
                    startDate: '3. Басталу күні',
                    endDate: '4. Қайтару күні',
                    noTariff:
                        'Таңдалған кезеңге сәйкес тариф әзірге жоқ. Өтінім қалдырыңыз, менеджер жеке есеп дайындайды.',
                    noFormatTariff:
                        'Осы көлік үшін таңдалған жалдау форматы жеке нақтыланады. Өтінім қалдырыңыз, менеджер соңғы ұсынысты дайындайды.',
                    summary: 'Алдын ала есеп',
                    total: 'Жалпы құны',
                    tariff: 'Тариф',
                    perDay: 'Тәуліктік баға',
                    availability: 'Қолжетімділік',
                    availableForDates: 'Таңдалған күндерге қолжетімді',
                    saveButton: 'Есепті сақтау',
                    saving: 'Сақталуда...',
                    requestButton: 'Өтінім рәсімдеу',
                }
              : {
                    configMissing:
                        'Калькулятор аренды обновляется и скоро станет доступен.',
                    loadError:
                        'Сейчас не удалось загрузить каталог для расчета. Попробуйте еще раз немного позже.',
                    withDriver: 'С водителем',
                    withoutDriver: 'Без водителя',
                    loginToSave:
                        'Войдите в личный кабинет, чтобы сохранять расчеты.',
                    saved: 'Расчет сохранен в личный кабинет.',
                    saveError:
                        'Сейчас не удалось сохранить расчет. Попробуйте еще раз немного позже.',
                    fillParams: 'Сначала заполните параметры расчета.',
                    title: 'Калькулятор аренды',
                    subtitle:
                        'Выберите автомобиль, формат аренды и даты поездки. Мы рассчитаем предварительную стоимость за весь период и поможем сразу перейти к заявке.',
                    availabilityNotice:
                        'В расчет включены только доступные автомобили из текущего ассортимента.',
                    selectCar: '1. Выберите автомобиль',
                    loading: 'Загрузка...',
                    carPlaceholder: 'Модель автомобиля...',
                    noCars: 'Нет доступных автомобилей',
                    format: '2. Формат аренды',
                    startDate: '3. Дата начала',
                    endDate: '4. Дата возврата',
                    noTariff:
                        'Для выбранного периода пока нет подходящего тарифа. Оставьте заявку, и менеджер подготовит индивидуальный расчет.',
                    noFormatTariff:
                        'Для выбранного формата аренды условия уточняются индивидуально. Оставьте заявку, и менеджер подготовит подходящий вариант.',
                    summary: 'Предварительный расчет',
                    total: 'Итоговая стоимость',
                    tariff: 'Тариф',
                    perDay: 'Цена в сутки',
                    availability: 'Доступность',
                    availableForDates: 'В выбранные даты',
                    saveButton: 'Сохранить расчет',
                    saving: 'Сохранение...',
                    requestButton: 'Оформить заявку',
                };

    useEffect(() => {
        if (!isOpen) return;

        const fetchCars = async () => {
            setIsCarsLoading(true);
            if (!hasPublicSupabaseConfig()) {
                setCarsData([]);
                setStatusMessage({
                    type: 'info',
                    text: copy.configMissing,
                });
                setIsCarsLoading(false);
                return;
            }

            const supabase = getSupabase();
            const { data, error } = await supabase
                .from('cars')
                .select('*, prices (*)')
                .order('brand')
                .order('name');

            if (error) {
                console.error('Ошибка загрузки автомобилей с ценами:', error);
                setStatusMessage({
                    type: 'error',
                    text: copy.loadError,
                });
            } else if (data) {
                setCarsData(data as Car[]);
            }
            setIsCarsLoading(false);
        };

        void fetchCars();
    }, [copy.configMissing, copy.loadError, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        setStatusMessage(null);
    }, [isOpen]);

    useEffect(() => {
        if (startDate && endDate && endDate < startDate) {
            setEndDate(startDate);
        }
    }, [startDate, endDate]);

    const availableCars = useMemo(
        () => carsData.filter(isCarAvailable),
        [carsData],
    );

    const selectedCar = useMemo(
        () =>
            availableCars.find((car) => car.id === Number(selectedCarId)) ||
            null,
        [availableCars, selectedCarId],
    );

    const rentalDays = useMemo(
        () => getRentalDays(startDate, endDate),
        [startDate, endDate],
    );

    const servicePrices = useMemo(() => {
        if (!selectedCar) {
            return [];
        }

        return (selectedCar.prices || []).filter(
            (price) => price.with_driver === (serviceType === 'withDriver'),
        );
    }, [selectedCar, serviceType]);

    const selectedPriceInfo = useMemo(() => {
        if (!selectedCar || !rentalDays) return null;
        const matchedPrice = getMatchingPrice(
            selectedCar.prices || [],
            rentalDays,
            serviceType === 'withDriver',
        );

        if (matchedPrice) {
            return matchedPrice;
        }

        // Fallback for cars that only have a base daily price in the cars table
        // but do not yet have explicit price tiers in the prices table.
        if (serviceType === 'withoutDriver') {
            const fallbackPrice =
                selectedCar.price_per_day || selectedCar.price || 0;

            if (fallbackPrice > 0) {
                return {
                    id: 0,
                    car_id: selectedCar.id,
                    days_from: rentalDays,
                    days_to: rentalDays,
                    price_per_day: fallbackPrice,
                    with_driver: false,
                    conditions:
                        locale === 'en'
                            ? 'Base daily rate'
                            : locale === 'kk'
                              ? 'Негізгі тәуліктік тариф'
                              : 'Базовый посуточный тариф',
                };
            }
        }

        return null;
    }, [locale, selectedCar, rentalDays, serviceType]);

    const tariffWarningText = useMemo(() => {
        if (!selectedCar || !startDate || !endDate || selectedPriceInfo) {
            return null;
        }

        if (serviceType === 'withDriver' && servicePrices.length === 0) {
            return copy.noFormatTariff;
        }

        return copy.noTariff;
    }, [
        copy.noFormatTariff,
        copy.noTariff,
        endDate,
        selectedCar,
        selectedPriceInfo,
        servicePrices.length,
        serviceType,
        startDate,
    ]);

    const totalPrice = useMemo(
        () => calculateRentalTotal(selectedPriceInfo, rentalDays),
        [selectedPriceInfo, rentalDays],
    );

    const calculation = useMemo(() => {
        if (!selectedCar || !selectedPriceInfo || !rentalDays) {
            return null;
        }

        return {
            carId: selectedCar.id,
            carName: selectedCar.name,
            serviceType:
                serviceType === 'withDriver'
                    ? copy.withDriver
                    : copy.withoutDriver,
            duration: formatRentalDaysLabel(rentalDays, locale),
            rentalPeriod: formatRentalPeriod(startDate, endDate, locale),
            pricePerDay: selectedPriceInfo.price_per_day,
            price: totalPrice,
            tariffLabel: formatPriceTierLabel(selectedPriceInfo, locale),
            conditions: selectedPriceInfo.conditions,
            startDate,
            endDate,
        };
    }, [
        copy.withDriver,
        copy.withoutDriver,
        endDate,
        locale,
        rentalDays,
        selectedCar,
        selectedPriceInfo,
        serviceType,
        startDate,
        totalPrice,
    ]);

    const handleCarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCarId(e.target.value);
        setStatusMessage(null);
    };

    const handleSaveCalculation = async () => {
        if (!calculation) return;

        if (!user) {
            setStatusMessage({
                type: 'error',
                text: copy.loginToSave,
            });
            return;
        }

        setIsSavingCalculation(true);
        setStatusMessage(null);

        try {
            const response = await fetch('/api/save-calculation', {
                method: 'POST',
                headers: csrfClientHelper.addTokenToHeaders({
                    'Content-Type': 'application/json',
                    ...(session?.access_token
                        ? {
                              Authorization: `Bearer ${session.access_token}`,
                          }
                        : {}),
                }),
                body: JSON.stringify({ calculation }),
            });

            await response.json();
            if (!response.ok) {
                throw new Error(copy.saveError);
            }

            setStatusMessage({
                type: 'success',
                text: copy.saved,
            });
        } catch (error) {
            setStatusMessage({
                type: 'error',
                text:
                    error instanceof Error ? error.message : copy.saveError,
            });
        } finally {
            setIsSavingCalculation(false);
        }
    };

    const handleBookingSubmit = () => {
        if (!selectedCar || !calculation) {
            setStatusMessage({
                type: 'error',
                text: copy.fillParams,
            });
            return;
        }

        setBookingInfo({
            car: selectedCar,
            details: {
                carId: selectedCar.id,
                serviceType: calculation.serviceType,
                duration: `${calculation.duration} • ${calculation.rentalPeriod}`,
                price: calculation.price,
                conditions: calculation.conditions,
                startDate,
                endDate,
            },
        });
        onClose();
    };

    const shouldShowAvailabilityNotice =
        !isCarsLoading && carsData.length > availableCars.length;

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl border border-neutral-700 bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all sm:p-8">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-2xl font-bold leading-6 text-white"
                                    >
                                        {copy.title}
                                    </Dialog.Title>
                                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400">
                                        {copy.subtitle}
                                    </p>

                                    <button
                                        onClick={onClose}
                                        className="absolute right-4 top-4 text-neutral-500 transition-colors hover:text-white"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>

                                    <div className="mt-8 space-y-6">
                                        {shouldShowAvailabilityNotice && (
                                            <div className="rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f0dca0]">
                                                {copy.availabilityNotice}
                                            </div>
                                        )}

                                        <div>
                                            <label
                                                htmlFor="carSelectCalc"
                                                className="mb-2 block text-sm font-medium text-neutral-300"
                                            >
                                                {copy.selectCar}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="carSelectCalc"
                                                    className="w-full appearance-none rounded-xl border border-neutral-600 bg-neutral-800 py-3 pl-3 pr-10 text-base text-white focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                                                    value={selectedCarId}
                                                    onChange={handleCarChange}
                                                    disabled={isCarsLoading}
                                                >
                                                    <option
                                                        value=""
                                                        disabled
                                                        className="text-neutral-500"
                                                    >
                                                        {isCarsLoading
                                                            ? copy.loading
                                                            : availableCars.length
                                                              ? copy.carPlaceholder
                                                              : copy.noCars}
                                                    </option>
                                                    {availableCars.map(
                                                        (car) => (
                                                            <option
                                                                key={car.id}
                                                                value={car.id}
                                                                className="bg-neutral-800 text-white"
                                                            >
                                                                {car.brand} •{' '}
                                                                {car.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <ChevronDownIcon className="pointer-events-none absolute inset-y-0 right-0 mr-3 h-full w-5 text-neutral-400" />
                                            </div>
                                        </div>

                                        {selectedCar && (
                                            <>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                                                        {copy.format}
                                                    </label>
                                                    <div className="grid grid-cols-2 rounded-xl bg-neutral-800 p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setServiceType(
                                                                    'withoutDriver',
                                                                )
                                                            }
                                                            className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${serviceType === 'withoutDriver' ? 'bg-[#d4af37] text-black shadow' : 'text-neutral-300 hover:bg-neutral-700'}`}
                                                        >
                                                            {copy.withoutDriver}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setServiceType(
                                                                    'withDriver',
                                                                )
                                                            }
                                                            className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${serviceType === 'withDriver' ? 'bg-[#d4af37] text-black shadow' : 'text-neutral-300 hover:bg-neutral-700'}`}
                                                        >
                                                            {copy.withDriver}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label
                                                            htmlFor="calcStartDate"
                                                            className="mb-2 block text-sm font-medium text-neutral-300"
                                                        >
                                                            {copy.startDate}
                                                        </label>
                                                        <input
                                                            id="calcStartDate"
                                                            type="date"
                                                            min={today}
                                                            value={startDate}
                                                            onChange={(event) =>
                                                                setStartDate(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-neutral-600 bg-neutral-800 px-3 py-3 text-base text-white focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor="calcEndDate"
                                                            className="mb-2 block text-sm font-medium text-neutral-300"
                                                        >
                                                            {copy.endDate}
                                                        </label>
                                                        <input
                                                            id="calcEndDate"
                                                            type="date"
                                                            min={
                                                                startDate ||
                                                                today
                                                            }
                                                            value={endDate}
                                                            onChange={(event) =>
                                                                setEndDate(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            disabled={
                                                                !startDate
                                                            }
                                                            className="w-full rounded-xl border border-neutral-600 bg-neutral-800 px-3 py-3 text-base text-white focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:cursor-not-allowed disabled:opacity-60"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {tariffWarningText && (
                                                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                                    {tariffWarningText}
                                                </div>
                                            )}

                                        {calculation && (
                                            <div className="rounded-3xl border border-neutral-700 bg-neutral-950/80 p-5">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f0dca0]">
                                                            {copy.summary}
                                                        </p>
                                                        <h4 className="mt-2 text-xl font-bold text-white">
                                                            {
                                                                calculation.carName
                                                            }
                                                        </h4>
                                                        <p className="mt-1 text-sm text-neutral-400">
                                                            {
                                                                calculation.serviceType
                                                            }{' '}
                                                            •{' '}
                                                            {
                                                                calculation.duration
                                                            }
                                                        </p>
                                                        <p className="text-sm text-neutral-400">
                                                            {
                                                                calculation.rentalPeriod
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-sm text-neutral-400">
                                                            {copy.total}
                                                        </p>
                                                        <p className="text-3xl font-bold text-[#d4af37]">
                                                            <FormattedPrice
                                                                value={
                                                                    calculation.price
                                                                }
                                                            />{' '}
                                                            ₸
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                                                        <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                                                            {copy.tariff}
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-white">
                                                            {
                                                                calculation.tariffLabel
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                                                        <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                                                            {copy.perDay}
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-white">
                                                            <FormattedPrice
                                                                value={
                                                                    calculation.pricePerDay
                                                                }
                                                            />{' '}
                                                            ₸
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                                                        <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                                                            {copy.availability}
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-white">
                                                            {
                                                                copy.availableForDates
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                {statusMessage && (
                                                    <div
                                                        className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                                                            statusMessage.type ===
                                                            'success'
                                                                ? 'border-green-500/30 bg-green-500/10 text-green-200'
                                                                : statusMessage.type ===
                                                                    'info'
                                                                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-200'
                                                                  : 'border-red-500/30 bg-red-500/10 text-red-200'
                                                        }`}
                                                    >
                                                        {statusMessage.text}
                                                    </div>
                                                )}

                                                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleSaveCalculation
                                                        }
                                                        disabled={
                                                            isSavingCalculation
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-600 bg-neutral-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-neutral-500 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <BookmarkSquareIcon className="h-5 w-5" />
                                                        {isSavingCalculation
                                                            ? copy.saving
                                                            : copy.saveButton}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleBookingSubmit
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#c0982c]"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5" />
                                                        {copy.requestButton}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
