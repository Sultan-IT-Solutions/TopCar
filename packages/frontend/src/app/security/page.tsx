'use client';

import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LocalizedLink from '@/components/LocalizedLink';
import { useTranslations } from '@/lib/i18n';
import {
    ArrowDownTrayIcon,
    CheckBadgeIcon,
    DocumentTextIcon,
    EyeIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function SecurityPage() {
    const { locale } = useTranslations();
    const content =
        locale === 'en'
            ? {
                  title: 'Security and',
                  accent: 'documents',
                  intro: 'We keep rentals transparent and predictable: every car is checked before handover, the conditions are described in advance, and key client materials are available on one page.',
                  highlights: [
                      {
                          title: 'Verified fleet',
                          text: 'Every vehicle is inspected, photographed, and checked for full equipment before handover.',
                      },
                      {
                          title: 'Transparent rules',
                          text: 'The client sees age, experience, deposit, and return conditions in advance.',
                      },
                      {
                          title: '24/7 support',
                          text: 'Managers and support remain available throughout the rental period.',
                      },
                  ],
                  documents: [
                      {
                          name: 'Company registration documents',
                          description:
                              'Official registration scans will be published after final legal verification.',
                          status: 'pending' as const,
                      },
                      {
                          name: 'Licenses and certificates',
                          description:
                              'This block is prepared for official TopCar licenses and certificates.',
                          status: 'pending' as const,
                      },
                      {
                          name: 'Insurance coverage memo',
                          description:
                              'A short overview of the base insurance scope and how conditions are confirmed before handover.',
                          fileUrl: '/docs/insurance-coverage.txt',
                          status: 'available' as const,
                      },
                      {
                          name: 'Data protection summary',
                          description:
                              'What data the service uses and how to request clarification or deletion.',
                          fileUrl: '/docs/privacy-summary.txt',
                          status: 'available' as const,
                      },
                      {
                          name: 'Client and vehicle verification checklist',
                          description:
                              'A transparent sequence for checking documents, vehicle equipment, and starting rental conditions.',
                          fileUrl: '/docs/client-verification-checklist.txt',
                          status: 'available' as const,
                      },
                  ],
                  availableLabel: 'Available for review',
                  pendingLabel: 'Pending upload',
                  view: 'View',
                  download: 'Download',
                  pendingNotice:
                      'After legally approved files are uploaded, they will appear here without changing the page structure.',
                  ctaTitle: 'Need originals or official confirmation?',
                  ctaText:
                      'For corporate clients and special requests, our manager can provide up-to-date supporting materials and agree on a convenient transfer format.',
                  ctaButton: 'Contact a manager',
              }
            : locale === 'kk'
              ? {
                    title: 'Қауіпсіздік және',
                    accent: 'құжаттар',
                    intro: 'Жалдау процесі ашық әрі түсінікті ұйымдастырылған: көлік алдын ала тексеріледі, шарттар алдын ала түсіндіріледі, ал негізгі материалдар бір бетте жиналған.',
                    highlights: [
                        {
                            title: 'Тексерілген автопарк',
                            text: 'Көлік тапсыру алдында техникалық қараудан, фототексеруден және жинақтама бақылауынан өтеді.',
                        },
                        {
                            title: 'Ашық шарттар',
                            text: 'Клиент жас, жүргізу өтілі, депозит және қайтару тәртібі туралы маңызды талаптарды алдын ала көреді.',
                        },
                        {
                            title: '24/7 қолдау',
                            text: 'Менеджер мен қолдау қызметі бүкіл жалдау бағыты бойынша байланыста болады.',
                        },
                    ],
                    documents: [
                        {
                            name: 'Компанияның тіркеу құжаттары',
                            description:
                                'Ресми тіркеу құжаттарының скан-көшірмелері соңғы заңдық тексеруден кейін жарияланады.',
                            status: 'pending' as const,
                        },
                        {
                            name: 'Лицензиялар мен сертификаттар',
                            description:
                                'Бұл блок TopCar-дың растаушы лицензиялары мен сертификаттарын орналастыруға дайындалған.',
                            status: 'pending' as const,
                        },
                        {
                            name: 'Сақтандыру жабыны туралы жадынама',
                            description:
                                'Негізгі сақтандыру контуры мен шарттарды көлік берілгенге дейін растау тәртібі туралы қысқаша түсіндірме.',
                            fileUrl: '/docs/insurance-coverage.txt',
                            status: 'available' as const,
                        },
                        {
                            name: 'Деректерді қорғау туралы қысқаша жадынама',
                            description:
                                'Қандай деректер қолданылатыны және оларды нақтылау не жоюды қалай сұратуға болатыны көрсетілген.',
                            fileUrl: '/docs/privacy-summary.txt',
                            status: 'available' as const,
                        },
                        {
                            name: 'Клиент пен көлікті тексеру чек-парағы',
                            description:
                                'Құжаттарды, көлік жинақтамасын және жалдау басталу шарттарын тексерудің ашық тәртібі.',
                            fileUrl: '/docs/client-verification-checklist.txt',
                            status: 'available' as const,
                        },
                    ],
                    availableLabel: 'Қарауға қолжетімді',
                    pendingLabel: 'Жүктеу күтілуде',
                    view: 'Қарау',
                    download: 'Жүктеу',
                    pendingNotice:
                        'Заңды түрде келісілген файлдар жүктелгеннен кейін олар осы жерде бет құрылымын өзгертпей көрсетіледі.',
                    ctaTitle: 'Түпнұсқалар немесе растау керек пе?',
                    ctaText:
                        'Корпоративтік клиенттер мен арнайы сұраныстар үшін менеджер өзекті растаушы материалдарды ыңғайлы форматта ұсына алады.',
                    ctaButton: 'Менеджерге жазу',
                }
              : {
                    title: 'Безопасность и',
                    accent: 'документы',
                    intro: 'Мы выстраиваем аренду вокруг прозрачной проверки автомобиля, понятных правил и доступных материалов. На этой странице собраны ключевые документы и памятки для клиента.',
                    highlights: [
                        {
                            title: 'Проверенный автопарк',
                            text: 'Перед выдачей автомобиль проходит технический осмотр, фотопроверку и контроль комплектации.',
                        },
                        {
                            title: 'Прозрачные условия',
                            text: 'Клиент заранее видит ключевые требования по возрасту, стажу, депозиту и формату возврата автомобиля.',
                        },
                        {
                            title: 'Поддержка 24/7',
                            text: 'Менеджер и служба поддержки остаются на связи на всем маршруте аренды.',
                        },
                    ],
                    documents: [
                        {
                            name: 'Регистрационные документы компании',
                            description:
                                'Скан-копии официальных регистрационных документов публикуются после финальной юридической верификации.',
                            status: 'pending' as const,
                        },
                        {
                            name: 'Лицензии и сертификаты',
                            description:
                                'Блок подготовлен для размещения подтверждающих лицензий и сертификатов TopCar.',
                            status: 'pending' as const,
                        },
                        {
                            name: 'Памятка по страховому покрытию',
                            description:
                                'Краткое описание базового страхового контура и порядка подтверждения условий до выдачи автомобиля.',
                            fileUrl: '/docs/insurance-coverage.txt',
                            status: 'available' as const,
                        },
                        {
                            name: 'Краткая памятка по защите данных',
                            description:
                                'Какие данные используются в сервисе и по каким каналам можно запросить уточнение или удаление информации.',
                            fileUrl: '/docs/privacy-summary.txt',
                            status: 'available' as const,
                        },
                        {
                            name: 'Чек-лист проверки клиента и автомобиля',
                            description:
                                'Прозрачный порядок проверки документов, комплектации автомобиля и стартовых условий аренды.',
                            fileUrl: '/docs/client-verification-checklist.txt',
                            status: 'available' as const,
                        },
                    ],
                    availableLabel: 'Доступно для просмотра',
                    pendingLabel: 'Ожидает загрузки',
                    view: 'Просмотр',
                    download: 'Скачать',
                    pendingNotice:
                        'После загрузки юридически согласованных файлов документы появятся здесь без смены структуры страницы.',
                    ctaTitle: 'Нужны оригиналы или подтверждение?',
                    ctaText:
                        'Для корпоративных клиентов и специальных запросов менеджер может предоставить актуальные подтверждающие материалы по запросу и согласовать удобный формат передачи документов.',
                    ctaButton: 'Связаться с менеджером',
                };

    const publishedDocuments = content.documents.filter(
        (doc) => doc.status === 'available',
    );

    return (
        <AnimatedPageWrapper>
            <Header />
            <main className="min-h-screen bg-neutral-950 pt-20 text-white">
                <section className="px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
                            {content.title}{' '}
                            <span className="text-[#d4af37]">
                                {content.accent}
                            </span>
                            <span className="mx-auto mt-4 block h-1 w-24 bg-[#d4af37]"></span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-3xl text-center text-lg text-neutral-400">
                            {content.intro}
                        </p>

                        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
                            {content.highlights.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6"
                                >
                                    <ShieldCheckIcon className="h-8 w-8 text-[#d4af37]" />
                                    <h2 className="mt-4 text-xl font-bold text-white">
                                        {item.title}
                                    </h2>
                                    <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 space-y-4">
                            {publishedDocuments.map((doc) => {
                                return (
                                    <div
                                        key={doc.name}
                                        className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 sm:p-6"
                                    >
                                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="max-w-3xl">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <DocumentTextIcon className="h-6 w-6 text-[#d4af37]" />
                                                    <p className="text-lg font-semibold text-white">
                                                        {doc.name}
                                                    </p>
                                                </div>
                                                <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                                                    {doc.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={doc.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-neutral-500 hover:bg-neutral-800"
                                                    title={content.view}
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                    {content.view}
                                                </a>
                                                <a
                                                    href={doc.fileUrl}
                                                    download
                                                    className="inline-flex items-center gap-2 rounded-2xl bg-[#d4af37] px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#c0982c]"
                                                    title={content.download}
                                                >
                                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                                    {content.download}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-12 rounded-3xl border border-[#d4af37]/20 bg-[#d4af37]/10 p-6 sm:p-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <CheckBadgeIcon className="h-7 w-7 text-[#f0dca0]" />
                                        <h2 className="text-2xl font-bold text-white">
                                            {content.ctaTitle}
                                        </h2>
                                    </div>
                                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#f5e7b1]">
                                        {content.ctaText}
                                    </p>
                                </div>

                                <LocalizedLink
                                    href="/contacts"
                                    className="inline-flex items-center justify-center rounded-2xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#c0982c]"
                                >
                                    {content.ctaButton}
                                </LocalizedLink>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </AnimatedPageWrapper>
    );
}
