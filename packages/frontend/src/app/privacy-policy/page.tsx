'use client';

import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LocalizedLink from '@/components/LocalizedLink';
import { useTranslations } from '@/lib/i18n';

export default function PrivacyPolicyPage() {
    const { locale } = useTranslations();
    const content =
        locale === 'en'
            ? {
                  title: 'Privacy',
                  accent: 'Policy',
                  intro: 'We value your privacy. This page explains what data we collect, how we use it, and how we protect it when you use our website and services.',
                  sections: [
                      {
                          title: '1. Data Collection',
                          text: 'We collect only the information required to provide our services: name, contact details, booking details, and related operational data.',
                      },
                      {
                          title: '2. Data Usage',
                          text: 'Your data is used only for processing requests, bookings, and communication. We do not transfer it to third parties without consent except where required by law.',
                      },
                      {
                          title: '3. Data Protection',
                          text: 'We take reasonable technical and organizational measures to protect your information from unauthorized access, changes, or deletion.',
                      },
                      {
                          title: '4. Cookies',
                          text: 'We use cookies to improve website performance and convenience. You can disable cookies in your browser settings.',
                      },
                      {
                          title: '5. Policy Updates',
                          text: 'We may update this policy from time to time. The current version is always available on this page.',
                      },
                      {
                          title: '6. Contacts',
                          text: 'If you have questions about personal data processing, contact us through the',
                      },
                  ],
                  contactsLabel: 'contacts page',
              }
            : locale === 'kk'
              ? {
                    title: 'Құпиялылық',
                    accent: 'саясаты',
                    intro: 'Біз сіздің құпиялылығыңызды құрметтейміз. Бұл бөлімде сайт пен қызметтерді пайдаланған кезде қандай деректер жиналатыны, қалай қолданылатыны және қалай қорғалатыны түсіндіріледі.',
                    sections: [
                        {
                            title: '1. Деректерді жинау',
                            text: 'Біз қызмет көрсету үшін қажет ақпаратты ғана жинаймыз: аты-жөні, байланыс деректері, брондау ақпараты және соған қатысты мәліметтер.',
                        },
                        {
                            title: '2. Деректерді пайдалану',
                            text: 'Сіздің деректеріңіз тек өтінімдерді, брондауларды және кері байланысты өңдеу үшін пайдаланылады. Заң талап етпесе, деректер үшінші тұлғаларға берілмейді.',
                        },
                        {
                            title: '3. Деректерді қорғау',
                            text: 'Ақпаратты рұқсатсыз қолжетімділіктен, өзгертуден немесе жоюдан қорғау үшін техникалық және ұйымдастырушылық шаралар қабылдаймыз.',
                        },
                        {
                            title: '4. Cookies',
                            text: 'Сайттың жұмысын жақсарту үшін cookies қолданылады. Қаласаңыз, оларды браузер баптауларында өшіре аласыз.',
                        },
                        {
                            title: '5. Саясаттағы өзгерістер',
                            text: 'Бұл саясат мерзімді түрде жаңартылуы мүмкін. Ағымдағы нұсқасы әрқашан осы бетте жарияланады.',
                        },
                        {
                            title: '6. Байланыс',
                            text: 'Жеке деректерді өңдеу бойынша сұрақтарыңыз болса,',
                        },
                    ],
                    contactsLabel: 'байланыс беті арқылы хабарласыңыз',
                }
              : {
                    title: 'Политика',
                    accent: 'конфиденциальности',
                    intro: 'Мы заботимся о вашей конфиденциальности. В этом разделе описано, как мы собираем, используем и защищаем вашу личную информацию при использовании нашего сайта и услуг.',
                    sections: [
                        {
                            title: '1. Сбор информации',
                            text: 'Мы собираем только ту информацию, которая необходима для предоставления наших услуг: имя, контактные данные, детали бронирования и сопутствующие сведения.',
                        },
                        {
                            title: '2. Использование информации',
                            text: 'Ваши данные используются исключительно для обработки заявок, бронирований и обратной связи. Мы не передаем ваши данные третьим лицам без вашего согласия, за исключением случаев, предусмотренных законом.',
                        },
                        {
                            title: '3. Защита информации',
                            text: 'Мы принимаем необходимые технические и организационные меры для защиты ваших данных от несанкционированного доступа, изменения или уничтожения.',
                        },
                        {
                            title: '4. Cookies',
                            text: 'Мы используем cookies для улучшения работы сайта. Вы можете отключить cookies в настройках вашего браузера.',
                        },
                        {
                            title: '5. Изменения политики',
                            text: 'Мы можем периодически обновлять данную политику. Актуальная версия всегда доступна на этой странице.',
                        },
                        {
                            title: '6. Контакты',
                            text: 'Если у вас есть вопросы по поводу обработки ваших данных, свяжитесь с нами через',
                        },
                    ],
                    contactsLabel: 'страницу Контакты',
                };

    return (
        <AnimatedPageWrapper>
            <Header />
            <main className="min-h-screen bg-neutral-950 pt-20 text-white">
                <section className="px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center tracking-tight">
                            {content.title}{' '}
                            <span className="text-[#d4af37]">
                                {content.accent}
                            </span>
                            <span className="block w-24 h-1 bg-[#d4af37] mx-auto mt-4"></span>
                        </h1>
                        <p className="text-lg text-neutral-400 mb-8 text-center max-w-2xl mx-auto">
                            {content.intro}
                        </p>
                        <div className="space-y-6 text-neutral-300 text-base">
                            {content.sections.map((section, index) => (
                                <div key={section.title}>
                                    <h2 className="mb-2 text-lg font-semibold">
                                        {section.title}
                                    </h2>
                                    {index === content.sections.length - 1 ? (
                                        <p>
                                            {section.text}{' '}
                                            <LocalizedLink
                                                href="/contacts"
                                                className="text-[#d4af37] underline"
                                            >
                                                {content.contactsLabel}
                                            </LocalizedLink>
                                            .
                                        </p>
                                    ) : (
                                        <p>{section.text}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </AnimatedPageWrapper>
    );
}
