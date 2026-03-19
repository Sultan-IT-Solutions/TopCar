'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import FadeInWhenVisible from '@/components/FadeInWhenVisible';
import { useTranslations } from '@/lib/i18n';
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
    const { locale } = useTranslations();
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

    const content =
        locale === 'en'
            ? {
                  heroTitle: 'Always',
                  heroAccent: 'Connected',
                  heroDescription:
                      'Your comfort comes first. Choose the channel that works best for you or leave a request and our team will reply within 15 minutes.',
                  directTitle: 'Direct Contact',
                  messengersTitle: 'Messengers:',
                  formTitle: 'Send a Request',
                  nameLabel: 'Your name',
                  namePlaceholder: 'John Smith',
                  contactLabel: 'Email or phone',
                  contactPlaceholder: 'your@email.com or +7 XXX XXX XX XX',
                  messageLabel: 'Your message',
                  messagePlaceholder: 'Tell us briefly how we can help...',
                  sending: 'Sending...',
                  submit: 'Send message',
                  validation:
                      'Please fill in all fields before sending the form.',
                  crmError: 'Failed to send data to CRM.',
                  success:
                      'Your request was sent successfully. We will contact you shortly.',
                  error: 'We could not send your request. Please try again.',
                  formCarName: 'Contact form',
                  formServiceType: 'Message from contacts form',
                  address: '179/2 Baitursynova St., Almaty',
                  addressAria: 'Address: 179/2 Baitursynova St., Almaty',
                  phoneAria: 'Call +7 (777) 666-02-95',
                  emailAria: 'Send email to topcarelite.kz@gmail.com',
                  workingHours: 'Available 24/7',
                  workingHoursAria: 'Working hours: 24/7',
                  whatsapp: 'Message on WhatsApp',
                  telegram: 'Contact via Telegram',
              }
            : locale === 'kk'
              ? {
                    heroTitle: 'Әрқашан',
                    heroAccent: 'байланыстамыз',
                    heroDescription:
                        'Сіздің жайлылығыңыз біз үшін маңызды. Өзіңізге ыңғайлы арнаны таңдаңыз немесе өтінім қалдырыңыз, біздің команда 15 минут ішінде жауап береді.',
                    directTitle: 'Тікелей байланыс',
                    messengersTitle: 'Мессенджерлерде:',
                    formTitle: 'Өтінім қалдыру',
                    nameLabel: 'Атыңыз',
                    namePlaceholder: 'Айдос Сәрсенов',
                    contactLabel: 'Email немесе телефон',
                    contactPlaceholder:
                        'your@email.com немесе +7 XXX XXX XX XX',
                    messageLabel: 'Хабарламаңыз',
                    messagePlaceholder:
                        'Сізге қалай көмектесе алатынымызды жазыңыз...',
                    sending: 'Жіберілуде...',
                    submit: 'Хабарлама жіберу',
                    validation: 'Форманы жіберу үшін барлық өрісті толтырыңыз.',
                    crmError: 'CRM жүйесіне деректерді жіберу сәтсіз аяқталды.',
                    success:
                        'Өтінім сәтті жіберілді. Жақын арада сізбен хабарласамыз.',
                    error: 'Өтінімді жіберу мүмкін болмады. Қайталап көріңіз.',
                    formCarName: 'Байланыс формасы',
                    formServiceType: 'Байланыс формасынан хабарлама',
                    address: 'Алматы қ., Байтұрсынова көш., 179/2',
                    addressAria:
                        'Мекенжай: Алматы қ., Байтұрсынова көш., 179/2',
                    phoneAria: '+7 (777) 666-02-95 нөміріне қоңырау шалу',
                    emailAria: 'topcarelite.kz@gmail.com поштасына хат жазу',
                    workingHours: 'Тәулік бойы, 24/7',
                    workingHoursAria: 'Жұмыс уақыты: тәулік бойы',
                    whatsapp: 'WhatsApp-қа жазу',
                    telegram: 'Telegram арқылы байланысу',
                }
              : {
                    heroTitle: 'Всегда',
                    heroAccent: 'на связи',
                    heroDescription:
                        'Ваш комфорт – наш приоритет. Выберите удобный способ для связи или оставьте заявку, и наша команда экспертов ответит вам в течение 15 минут.',
                    directTitle: 'Прямая связь',
                    messengersTitle: 'Мы в мессенджерах:',
                    formTitle: 'Оставить заявку',
                    nameLabel: 'Ваше имя',
                    namePlaceholder: 'Иван Петров',
                    contactLabel: 'Email или телефон',
                    contactPlaceholder: 'your@email.com или +7 XXX XXX XX XX',
                    messageLabel: 'Ваше сообщение',
                    messagePlaceholder: 'Расскажите, чем мы можем помочь...',
                    sending: 'Отправка...',
                    submit: 'Отправить сообщение',
                    validation: 'Пожалуйста, заполните все поля формы.',
                    crmError: 'Ошибка при отправке данных в CRM.',
                    success:
                        'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
                    error: 'Не удалось отправить заявку. Пожалуйста, попробуйте снова.',
                    formCarName: 'Контактная форма',
                    formServiceType: 'Сообщение с формы контактов',
                    address: 'г. Алматы, ул. Байтурсынова, 179/2',
                    addressAria: 'Адрес: г. Алматы, ул. Байтурсынова, 179/2',
                    phoneAria: 'Позвонить по номеру +7 (777) 666-02-95',
                    emailAria: 'Написать на email topcarelite.kz@gmail.com',
                    workingHours: 'Работаем круглосуточно, 24/7',
                    workingHoursAria: 'Время работы: круглосуточно',
                    whatsapp: 'Написать в WhatsApp',
                    telegram: 'Связаться в Telegram',
                };

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
                message: content.validation,
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
                    carName: content.formCarName,
                    bookingDetails: {
                        serviceType: content.formServiceType,
                        duration: '',
                        price: 0,
                    },
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || content.crmError);
            }

            setFormStatus({
                type: 'success',
                message: content.success,
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
                message: content.error,
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
            text: content.address,
            href: 'https://go.2gis.com/xxxxx',
            ariaLabel: content.addressAria,
        },
        {
            Icon: PhoneIcon,
            text: '+7 (777) 666-02-95',
            href: 'tel:+77776660295',
            ariaLabel: content.phoneAria,
        },
        {
            Icon: EnvelopeIcon,
            text: 'topcarelite.kz@gmail.com',
            href: 'mailto:topcarelite.kz@gmail.com',
            ariaLabel: content.emailAria,
        },
        {
            Icon: ClockIcon,
            text: content.workingHours,
            ariaLabel: content.workingHoursAria,
        },
    ];

    const messengerLinks = [
        {
            name: 'WhatsApp',
            Icon: () => <MessengerIconPlaceholder name="WA" />,
            href: 'https://wa.me/77776660295',
            text: content.whatsapp,
        },
        {
            name: 'Telegram',
            Icon: () => <MessengerIconPlaceholder name="TG" />,
            href: 'https://t.me/topcar_elite_kz_support',
            text: content.telegram,
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
            <Header />

            <main className="min-h-screen bg-neutral-950 pt-20 text-white font-sans">
                <section className="relative overflow-hidden bg-gradient-to-b from-black via-neutral-900 to-neutral-950 px-4 pb-12 pt-8 text-center sm:px-6 sm:pb-16 sm:pt-12">
                    <div className="absolute inset-0 opacity-[0.03]">
                        {/* <Image src="/patterns/luxury-pattern.svg" alt="Luxury Pattern" layout="fill" objectFit="cover" /> */}
                    </div>
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <FadeInWhenVisible>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                                {content.heroTitle}{' '}
                                <span className="text-[#d4af37]">
                                    {content.heroAccent}
                                </span>
                            </h1>
                            <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                                {content.heroDescription}
                            </p>
                            <span className="block w-20 h-1 bg-[#d4af37]/50 mx-auto mt-8"></span>
                        </FadeInWhenVisible>
                    </div>
                </section>

                <section className="px-4 pb-16 pt-0 sm:px-6 sm:pb-20">
                    <div className="max-w-5xl mx-auto">
                        <FadeInWhenVisible>
                            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
                                <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-8">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center">
                                            <ChatBubbleLeftRightIcon className="h-8 w-8 text-[#d4af37] mr-3" />
                                            {content.directTitle}
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
                                            {content.messengersTitle}
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
                                        {content.formTitle}
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
                                                {content.nameLabel}{' '}
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
                                                placeholder={
                                                    content.namePlaceholder
                                                }
                                                required
                                                className="w-full py-3 px-3.5 text-base text-white bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] placeholder-neutral-500"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="contact"
                                                className="block text-sm font-medium text-neutral-300 mb-1.5"
                                            >
                                                {content.contactLabel}{' '}
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
                                                placeholder={
                                                    content.contactPlaceholder
                                                }
                                                required
                                                className="w-full py-3 px-3.5 text-base text-white bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] placeholder-neutral-500"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="message"
                                                className="block text-sm font-medium text-neutral-300 mb-1.5"
                                            >
                                                {content.messageLabel}{' '}
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
                                                placeholder={
                                                    content.messagePlaceholder
                                                }
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
                                                    <span>
                                                        {content.sending}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>
                                                        {content.submit}
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
