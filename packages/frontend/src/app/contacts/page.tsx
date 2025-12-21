'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import FadeInWhenVisible from '@/components/FadeInWhenVisible';
// LoginModal больше не нужен здесь
import {
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/20/solid';

const MessengerIconPlaceholder = ({
    name,
    className,
}: {
    name: string;
    className?: string;
}) => (
    <div
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-700 text-xs text-white group-hover:bg-[#d4af37] ${className}`}
    >
        {name.substring(0, 1)}
    </div>
);

export default function ContactPage() {
    // `showLoginModal` и `setShowLoginModal` удалены
    const [formValues, setFormValues] = useState({
        name: '',
        contact: '',
        message: '',
    });
    const [formStatus, setFormStatus] = useState<{
        type: 'success' | 'error' | '';
        message: string;
    }>({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    // GTM helper: безопасно пушим события, если dataLayer доступен
    function pushEvent(event: Record<string, unknown>) {
        if (
            window &&
            (window as unknown as { dataLayer?: unknown }).dataLayer
        ) {
            (
                window as unknown as {
                    dataLayer?: {
                        push: (event: Record<string, unknown>) => void;
                    };
                }
            ).dataLayer?.push(event);
        }
    }

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setFormStatus({ type: '', message: '' });

        if (!formValues.name || !formValues.contact || !formValues.message) {
            setFormStatus({
                type: 'error',
                message: 'Пожалуйста, заполните все поля формы.',
            });
            setIsLoading(false);
            // Analytics: form validation error
            pushEvent({
                event: 'contact_form_submit',
                form_status: 'validation_error',
                page: 'contacts',
            });
            return;
        }

        console.log('Form submitted:', formValues);
        try {
            const response = await fetch('/api/create-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: formValues.name,
                    userPhone: formValues.contact,
                    carName: 'Контактная форма',
                    bookingDetails: {
                        serviceType: 'Сообщение с формы Контакты',
                        duration: '',
                        price: 0,
                    },
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Ошибка при отправке данных в CRM.',
                );
            }

            setFormStatus({
                type: 'success',
                message:
                    'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
            });
            setFormValues({ name: '', contact: '', message: '' });

            // Analytics: form submit success
            pushEvent({
                event: 'contact_form_submit',
                form_status: 'success',
                page: 'contacts',
            });
        } catch (error) {
            console.error('Ошибка при отправке в Bitrix24:', error);
            setFormStatus({
                type: 'error',
                message:
                    'Не удалось отправить заявку. Пожалуйста, попробуйте снова.',
            });

            // Analytics: form submit error
            pushEvent({
                event: 'contact_form_submit',
                form_status: 'error',
                page: 'contacts',
            });
        }
    };

    const contactDetails = [
        {
            Icon: MapPinIcon,
            text: 'г. Алматы, ул. Байтурсынова, 179/2',
            href: 'https://go.2gis.com/xxxxx',
            ariaLabel: 'Адрес: г. Алматы, ул. Байтурсынова, 179/2',
        },
        {
            Icon: PhoneIcon,
            text: '+7 (777) 666-02-95',
            href: 'tel:+77776660295',
            ariaLabel: 'Позвонить по номеру +7 (777) 666-02-95',
        },
        {
            Icon: EnvelopeIcon,
            text: 'topcarelite.kz@gmail.com',
            href: 'mailto:topcarelite.kz@gmail.com',
            ariaLabel: 'Написать на email topcarelite.kz@gmail.com',
        },
        {
            Icon: ClockIcon,
            text: 'Работаем круглосуточно, 24/7',
            ariaLabel: 'Время работы: круглосуточно',
        },
    ];

    const messengerLinks = [
        {
            name: 'WhatsApp',
            Icon: () => <MessengerIconPlaceholder name="WA" />,
            href: 'https://wa.me/77776660295',
            text: 'Написать в WhatsApp',
        },
        {
            name: 'Telegram',
            Icon: () => <MessengerIconPlaceholder name="TG" />,
            href: 'https://t.me/topcar_elite_kz_support',
            text: 'Связаться в Telegram',
        },
    ];

    // Click handlers for analytics
    const handleContactClick = (href?: string, label?: string) => () => {
        if (!href) return;
        if (href.startsWith('tel:')) {
            pushEvent({
                event: 'phone_click',
                method: 'tel',
                label: label ?? href,
                page: 'contacts',
            });
        } else if (href.startsWith('mailto:')) {
            pushEvent({
                event: 'email_click',
                method: 'mailto',
                label: label ?? href,
                page: 'contacts',
            });
        } else if (href.startsWith('http')) {
            pushEvent({
                event: 'external_link_click',
                label: label ?? href,
                page: 'contacts',
            });
        }
    };

    const handleMessengerClick = (name: string, href: string) => () => {
        pushEvent({
            event: 'messenger_click',
            messenger: name,
            label: href,
            page: 'contacts',
        });
    };

    return (
        <AnimatedPageWrapper>
            {/* ИСПРАВЛЕНИЕ: Убрали лишнюю пропсу `onLoginClick` */}
            <Header />
            {/* Модальное окно LoginModal удалено, так как Header теперь управляет им */}

            <main className="min-h-screen bg-neutral-950 text-white font-sans">
                <section className="relative py-24 sm:py-32 md:py-40 text-center bg-gradient-to-b from-black via-neutral-900 to-neutral-950 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03]">
                        {/* <Image src="/patterns/luxury-pattern.svg" alt="Luxury Pattern" layout="fill" objectFit="cover" /> */}
                    </div>
                    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
                        <FadeInWhenVisible>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                                Всегда{' '}
                                <span className="text-[#d4af37]">на связи</span>
                            </h1>
                            <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                                Ваш комфорт – наш приоритет. Выберите удобный
                                способ для связи или оставьте заявку, и наша
                                команда экспертов ответит вам в течение 15
                                минут.
                            </p>
                            <span className="block w-20 h-1 bg-[#d4af37]/50 mx-auto mt-8"></span>
                        </FadeInWhenVisible>
                    </div>
                </section>

                <section className="py-16 sm:py-20 px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto">
                        <FadeInWhenVisible>
                            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
                                <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-8">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center">
                                            <ChatBubbleLeftRightIcon className="h-8 w-8 text-[#d4af37] mr-3" />
                                            Прямая связь
                                        </h2>
                                        <ul className="space-y-4">
                                            {contactDetails.map(
                                                (item, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start"
                                                    >
                                                        <item.Icon className="h-6 w-6 text-[#d4af37] mr-3 mt-0.5 flex-shrink-0" />
                                                        {item.href ? (
                                                            <a
                                                                href={item.href}
                                                                target={
                                                                    item.href.startsWith(
                                                                        'http',
                                                                    )
                                                                        ? '_blank'
                                                                        : undefined
                                                                }
                                                                rel="noopener noreferrer"
                                                                aria-label={
                                                                    item.ariaLabel
                                                                }
                                                                className="text-base text-neutral-200 hover:text-[#d4af37] transition-colors duration-200 break-all"
                                                                onClick={handleContactClick(
                                                                    item.href,
                                                                    item.text,
                                                                )}
                                                            >
                                                                {item.text}
                                                            </a>
                                                        ) : (
                                                            <span className="text-base text-neutral-200">
                                                                {item.text}
                                                            </span>
                                                        )}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                    <div className="border-t border-neutral-700 pt-8">
                                        <h3 className="text-xl font-semibold text-white mb-5">
                                            Мы в мессенджерах:
                                        </h3>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {messengerLinks.map((linkItem) => (
                                                <a
                                                    key={linkItem.name}
                                                    href={linkItem.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex-1 inline-flex items-center justify-center gap-3 px-6 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 hover:text-black hover:bg-[#d4af37] transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#d4af37]/80"
                                                    onClick={handleMessengerClick(
                                                        linkItem.name,
                                                        linkItem.href,
                                                    )}
                                                >
                                                    <linkItem.Icon />
                                                    <span className="text-sm font-medium">
                                                        {linkItem.text}
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl p-6 sm:p-8">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                                        Оставить заявку
                                    </h2>
                                    <form
                                        onSubmit={handleContactSubmit}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-medium text-neutral-300 mb-1.5"
                                            >
                                                Ваше имя{' '}
                                                <span className="text-[#d4af37]">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={formValues.name}
                                                onChange={handleInputChange}
                                                placeholder="Иван Петров"
                                                required
                                                className="w-full py-3 px-3.5 text-base text-white bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] placeholder-neutral-500"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="contact"
                                                className="block text-sm font-medium text-neutral-300 mb-1.5"
                                            >
                                                Email или телефон{' '}
                                                <span className="text-[#d4af37]">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="contact"
                                                id="contact"
                                                value={formValues.contact}
                                                onChange={handleInputChange}
                                                placeholder="your@email.com или +7 XXX XXX XX XX"
                                                required
                                                className="w-full py-3 px-3.5 text-base text-white bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] placeholder-neutral-500"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="message"
                                                className="block text-sm font-medium text-neutral-300 mb-1.5"
                                            >
                                                Ваше сообщение{' '}
                                                <span className="text-[#d4af37]">
                                                    *
                                                </span>
                                            </label>
                                            <textarea
                                                name="message"
                                                id="message"
                                                rows={5}
                                                value={formValues.message}
                                                onChange={handleInputChange}
                                                placeholder="Расскажите, чем мы можем помочь..."
                                                required
                                                className="w-full py-3 px-3.5 text-base text-white bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] placeholder-neutral-500 resize-none"
                                            />
                                        </div>

                                        {formStatus.message && (
                                            <div
                                                className={`flex items-center gap-2 p-3 rounded-md text-sm
                        ${formStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-300' : ''}
                        ${formStatus.type === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-300' : ''}
                      `}
                                            >
                                                {formStatus.type ===
                                                    'success' && (
                                                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                                                )}
                                                {formStatus.type ===
                                                    'error' && (
                                                    <XCircleIcon className="h-5 w-5 flex-shrink-0" />
                                                )}
                                                <span>
                                                    {formStatus.message}
                                                </span>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full mt-2 px-8 py-3.5 bg-[#d4af37] text-black rounded-lg text-base sm:text-lg font-semibold 
                                hover:bg-[#c0982c] focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50
                                disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 ease-in-out
                                flex items-center justify-center gap-2 group"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin h-5 w-5 text-black"
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
                                                    <span>Отправка...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>
                                                        Отправить сообщение
                                                    </span>
                                                    <PaperAirplaneIcon className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </FadeInWhenVisible>
                    </div>
                </section>
            </main>

            <Footer />
        </AnimatedPageWrapper>
    );
}
