// src/components/BookingForm.tsx
'use client';

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import {
    CalendarDaysIcon,
    UserIcon as UserSolidIcon,
    PhoneIcon as PhoneSolidIcon,
    CheckCircleIcon,
    XCircleIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/20/solid';

import InputField, { HeroIconType } from '@/components/ui/InputField';
import { csrfClientHelper } from '@/lib/csrf-client';
import { formatPhoneNumber } from '@/lib/formatters';
import { useTranslations } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';

// Иконка-заглушка для автомобиля
const CarIconPlaceholder: HeroIconType = React.forwardRef<
    SVGSVGElement,
    React.SVGProps<SVGSVGElement>
>(function CarIconPlaceholder(props, ref) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
            ref={ref}
            {...props}
        >
            <path d="M8.25 18.75a1.5 1.5 0 0 1-3 0V6.75a1.5 1.5 0 0 1 3 0v12ZM18.75 18.75a1.5 1.5 0 0 1-3 0V6.75a1.5 1.5 0 0 1 3 0v12ZM22.5 12a1.5 1.5 0 0 1-1.5 1.5h-1.5a1.5 1.5 0 0 1-1.5-1.5V6.75a1.5 1.5 0 0 1 1.5-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v5.25ZM1.5 12a1.5 1.5 0 0 1 1.5-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5V6.75a1.5 1.5 0 0 1-1.5-1.5H3a1.5 1.5 0 0 1-1.5 1.5v5.25Z" />
        </svg>
    );
});

type BookingFormProps = {
    initialCarName?: string;
};

export default function BookingForm({ initialCarName = '' }: BookingFormProps) {
    const { t, locale } = useTranslations();
    const { session } = useAuth();
    const [formData, setFormData] = useState({
        carName: initialCarName,
        dateFrom: '',
        dateTo: '',
        userName: '',
        userPhone: '',
    });

    const [loading, setLoading] = useState(false);
    const [formStatus, setFormStatus] = useState<{
        type: 'success' | 'error' | '';
        message: string;
    }>({ type: '', message: '' });

    const bookingSourceLabel =
        locale === 'en'
            ? 'General website request'
            : locale === 'kk'
              ? 'Сайттан жалпы өтінім'
              : 'Общая заявка с сайта';

    useEffect(() => {
        setFormData((prev) => ({ ...prev, carName: initialCarName }));
    }, [initialCarName]);

    const today = new Date().toISOString().split('T')[0];

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const finalValue =
            name === 'userPhone' ? formatPhoneNumber(value) : value;
        setFormData((prev) => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setFormStatus({ type: '', message: '' });

        const { carName, dateFrom, dateTo, userName, userPhone } = formData;
        const cleanedPhone = userPhone.replace(/[^\d]/g, '');

        if (!carName || !dateFrom || !dateTo || !userName || !cleanedPhone) {
            setFormStatus({ type: 'error', message: t('errors.required') });
            setLoading(false);
            return;
        }
        if (new Date(dateFrom) > new Date(dateTo)) {
            setFormStatus({ type: 'error', message: t('booking.error') });
            setLoading(false);
            return;
        }

        const submissionData = {
            userName,
            userPhone: cleanedPhone,
            carName,
            bookingDetails: {
                serviceType: bookingSourceLabel,
                duration: `${t('common.from')} ${dateFrom} ${t('common.to')} ${dateTo}`,
                price: 0,
                dateFrom,
                dateTo,
            },
        };

        try {
            const response = await fetch('/api/create-lead', {
                method: 'POST',
                headers: csrfClientHelper.addTokenToHeaders({
                    'Content-Type': 'application/json',
                    ...(session?.access_token
                        ? {
                              Authorization: `Bearer ${session.access_token}`,
                          }
                        : {}),
                }),
                body: JSON.stringify(submissionData),
            });
            const responseData = await response.json();
            if (!response.ok)
                throw new Error(responseData.message || t('errors.server'));

            setFormStatus({ type: 'success', message: t('booking.success') });
            setFormData({
                carName: '',
                dateFrom: '',
                dateTo: '',
                userName: '',
                userPhone: '',
            });
            setTimeout(() => setFormStatus({ type: '', message: '' }), 7000);
        } catch (apiError: unknown) {
            console.error('Ошибка при отправке в amoCRM:', apiError);
            const errorMessage =
                apiError instanceof Error
                    ? apiError.message
                    : t('booking.error');
            setFormStatus({ type: 'error', message: errorMessage });
        }

        setLoading(false);
    };

    return (
        // Убраны внешний <section> и центрирующий div.
        // Родительский компонент теперь контролирует расположение.
        <form
            onSubmit={handleSubmit}
            className="space-y-6 sm:space-y-8 bg-neutral-900 border border-neutral-700 p-6 sm:p-10 rounded-2xl shadow-2xl"
        >
            {/* Заголовок формы перенесен в page.tsx, поэтому убран отсюда */}

            <InputField
                id="carName"
                name="carName"
                label={t('booking.car')}
                placeholder={t('booking.car')}
                value={formData.carName}
                onChange={handleChange}
                icon={CarIconPlaceholder}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField
                    id="dateFrom"
                    name="dateFrom"
                    label={`${t('booking.dates')} (${t('common.from')})`}
                    type="date"
                    placeholder=""
                    value={formData.dateFrom}
                    onChange={handleChange}
                    icon={CalendarDaysIcon}
                    min={today}
                />
                <InputField
                    id="dateTo"
                    name="dateTo"
                    label={`${t('booking.dates')} (${t('common.to')})`}
                    type="date"
                    placeholder=""
                    value={formData.dateTo}
                    onChange={handleChange}
                    icon={CalendarDaysIcon}
                    min={formData.dateFrom || today}
                    disabled={!formData.dateFrom}
                />
            </div>

            <InputField
                id="userName"
                name="userName"
                label={t('booking.name')}
                placeholder={t('booking.name')}
                value={formData.userName}
                onChange={handleChange}
                icon={UserSolidIcon}
            />
            <InputField
                id="userPhone"
                name="userPhone"
                label={t('booking.phone')}
                type="tel"
                placeholder={t('form.phone')}
                value={formData.userPhone}
                onChange={handleChange}
                icon={PhoneSolidIcon}
                maxLength={18}
            />

            {formStatus.message && (
                <div
                    className={`flex items-center gap-2 p-3 rounded-md text-sm mt-1
          ${formStatus.type === 'success' ? 'bg-green-900/30 border border-green-700/50 text-green-300' : ''}
          ${formStatus.type === 'error' ? 'bg-red-900/30 border border-red-700/50 text-red-300' : ''}
        `}
                >
                    {formStatus.type === 'success' && (
                        <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                    )}
                    {formStatus.type === 'error' && (
                        <XCircleIcon className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span>{formStatus.message}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 sm:mt-4 px-8 py-4 bg-[#d4af37] text-black rounded-lg text-base sm:text-lg font-semibold hover:bg-[#c0982c] focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center justify-center gap-2 group"
            >
                {loading ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <span>{t('common.loading')}</span>
                    </>
                ) : (
                    <>
                        {t('form.send')}
                        <PaperAirplaneIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ml-1" />
                    </>
                )}
            </button>
        </form>
    );
}
