'use client';

// `useState` and `LoginModal` are no longer needed here
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';
import FadeInWhenVisible from '@/components/FadeInWhenVisible';
import { useTranslations } from '@/lib/i18n';
import {
    ShieldCheckIcon,
    CurrencyDollarIcon,
    IdentificationIcon,
    NoSymbolIcon,
    MapPinIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const termsContent = {
    ru: {
        title: 'Условия',
        accent: 'Аренды',
        description:
            'Прозрачные и понятные условия для вашего спокойствия и комфортного пользования нашими автомобилями.',
        sections: [
            {
                Icon: IdentificationIcon,
                title: 'Требования к арендатору',
                points: [
                    'Минимальный возраст: 21 год.',
                    'Стаж вождения: не менее 3 лет.',
                    'Наличие оригинала паспорта и водительского удостоверения.',
                ],
            },
            {
                Icon: CurrencyDollarIcon,
                title: 'Оплата и депозит',
                points: [
                    'Полная предоплата за весь период аренды.',
                    'Внесение страхового депозита (сумма зависит от класса авто).',
                    'Депозит возвращается в течение 3-5 дней после возврата авто при отсутствии нарушений.',
                ],
            },
            {
                Icon: NoSymbolIcon,
                title: 'Ограничения и запреты',
                points: [
                    'Курение в салоне автомобиля строго запрещено (штраф).',
                    'Передача управления третьим лицам без согласования запрещена.',
                    'Выезд за пределы согласованной территории эксплуатации запрещен.',
                ],
            },
            {
                Icon: MapPinIcon,
                title: 'Территория эксплуатации',
                points: [
                    'Стандартная территория: город Алматы и Алматинская область.',
                    'Выезд в другие регионы Казахстана возможен по предварительному согласованию.',
                ],
            },
            {
                Icon: ShieldCheckIcon,
                title: 'Страхование',
                points: [
                    'Все автомобили застрахованы по программам КАСКО и ОГПО.',
                    'Ответственность арендатора ограничивается суммой безусловной франшизы.',
                ],
            },
            {
                Icon: ExclamationTriangleIcon,
                title: 'Ответственность',
                points: [
                    'Арендатор несет полную ответственность за все штрафы ПДД в период аренды.',
                    'В случае ДТП или повреждения автомобиля необходимо немедленно связаться с нашим менеджером.',
                ],
            },
        ],
    },
    en: {
        title: 'Rental',
        accent: 'Terms',
        description:
            'Clear and transparent rules so you know exactly what to expect before the booking starts.',
        sections: [
            {
                Icon: IdentificationIcon,
                title: 'Renter Requirements',
                points: [
                    'Minimum age: 21 years.',
                    'Driving experience: at least 3 years.',
                    "Original passport and driver's license are required.",
                ],
            },
            {
                Icon: CurrencyDollarIcon,
                title: 'Payment and Deposit',
                points: [
                    'Full prepayment for the entire rental period.',
                    'A security deposit is required and depends on the car class.',
                    'The deposit is returned within 3-5 days after the vehicle is returned with no violations or damage.',
                ],
            },
            {
                Icon: NoSymbolIcon,
                title: 'Restrictions and Prohibitions',
                points: [
                    'Smoking inside the vehicle is strictly prohibited and subject to a penalty.',
                    'Handing over the car to third parties without approval is prohibited.',
                    'Driving outside the approved operating area is prohibited.',
                ],
            },
            {
                Icon: MapPinIcon,
                title: 'Operating Area',
                points: [
                    'Standard area: Almaty and Almaty region.',
                    'Trips to other regions of Kazakhstan are possible only by prior approval.',
                ],
            },
            {
                Icon: ShieldCheckIcon,
                title: 'Insurance',
                points: [
                    'All vehicles are covered by CASCO and mandatory liability insurance.',
                    'The renter liability is limited to the deductible stated in the agreement.',
                ],
            },
            {
                Icon: ExclamationTriangleIcon,
                title: 'Responsibility',
                points: [
                    'The renter is fully responsible for all traffic fines issued during the rental period.',
                    'In case of an accident or damage, contact our manager immediately.',
                ],
            },
        ],
    },
    kk: {
        title: 'Жалдау',
        accent: 'Шарттары',
        description:
            'Көлікті жайлы әрі сенімді пайдалану үшін барлық негізгі талаптар алдын ала ашық көрсетілген.',
        sections: [
            {
                Icon: IdentificationIcon,
                title: 'Жалдаушыға қойылатын талаптар',
                points: [
                    'Ең төменгі жас: 21 жас.',
                    'Жүргізу өтілі: кемінде 3 жыл.',
                    'Төлқұжат пен жүргізуші куәлігінің түпнұсқасы қажет.',
                ],
            },
            {
                Icon: CurrencyDollarIcon,
                title: 'Төлем және депозит',
                points: [
                    'Жалдау мерзімі үшін толық алдын ала төлем жасалады.',
                    'Сақтандыру депозиті енгізіледі, оның сомасы көлік класына байланысты.',
                    'Көлік бұзушылықсыз қайтарылған жағдайда депозит 3-5 күн ішінде қайтарылады.',
                ],
            },
            {
                Icon: NoSymbolIcon,
                title: 'Шектеулер мен тыйымдар',
                points: [
                    'Көлік салонында темекі шегуге қатаң тыйым салынады.',
                    'Үшінші тұлғаларға рұқсатсыз көлік жүргізуді беруге болмайды.',
                    'Келісілген пайдалану аумағынан тыс шығуға болмайды.',
                ],
            },
            {
                Icon: MapPinIcon,
                title: 'Пайдалану аумағы',
                points: [
                    'Негізгі аумақ: Алматы қаласы және Алматы облысы.',
                    'Қазақстанның басқа өңірлеріне шығу алдын ала келісіммен мүмкін.',
                ],
            },
            {
                Icon: ShieldCheckIcon,
                title: 'Сақтандыру',
                points: [
                    'Барлық көліктер КАСКО және міндетті сақтандыру бағдарламаларымен қорғалған.',
                    'Жалдаушының жауапкершілігі шарттағы франшиза сомасымен шектеледі.',
                ],
            },
            {
                Icon: ExclamationTriangleIcon,
                title: 'Жауапкершілік',
                points: [
                    'Жалдаушы жалдау кезеңіндегі барлық жол айыппұлдары үшін толық жауап береді.',
                    'ЖКО немесе зақым болған жағдайда менеджермен дереу байланысу қажет.',
                ],
            },
        ],
    },
} as const;

export default function TermsPage() {
    const { locale } = useTranslations();
    const currentContent = termsContent[locale] || termsContent.ru;

    return (
        <AnimatedPageWrapper>
            <Header />

            <main className="min-h-screen bg-neutral-950 pt-20 text-white font-sans">
                <section className="relative bg-gradient-to-b from-black via-neutral-900 to-neutral-950 px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('/patterns/geometric-luxury.svg')] bg-repeat"></div>
                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        <FadeInWhenVisible>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                                {currentContent.title}{' '}
                                <span className="text-[#d4af37]">
                                    {currentContent.accent}
                                </span>
                            </h1>
                            <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                                {currentContent.description}
                            </p>
                        </FadeInWhenVisible>
                    </div>
                </section>

                <section className="px-4 pb-16 pt-0 sm:px-6 sm:pb-20">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                        {currentContent.sections.map((term, idx) => (
                            <FadeInWhenVisible key={idx} delay={idx * 0.1}>
                                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 h-full">
                                    <div className="flex items-center gap-4 mb-5">
                                        <term.Icon className="h-8 w-8 text-[#d4af37]" />
                                        <h2 className="text-2xl font-bold text-white">
                                            {term.title}
                                        </h2>
                                    </div>
                                    <ul className="space-y-2.5 text-neutral-300 list-disc list-inside">
                                        {term.points.map((point, pIdx) => (
                                            <li key={pIdx}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            </FadeInWhenVisible>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </AnimatedPageWrapper>
    );
}
