'use client'

// `useState` and `LoginModal` are no longer needed here
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper'
import FadeInWhenVisible from '@/components/FadeInWhenVisible'
import {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  IdentificationIcon,
  NoSymbolIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const terms = [
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
];


export default function TermsPage() {
    // The state for the login modal has been removed
    // const [showLoginModal, setShowLoginModal] = useState(false);

    return (
        <AnimatedPageWrapper>
            {/* The `onLoginClick` prop has been removed from the Header */}
            <Header />
            {/* The LoginModal component has been removed */}

            <main className="min-h-screen bg-neutral-950 text-white font-sans">
                <section className="relative py-24 sm:py-32 bg-gradient-to-b from-black via-neutral-900 to-neutral-950">
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('/patterns/geometric-luxury.svg')] bg-repeat"></div>
                    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <FadeInWhenVisible>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                                Условия <span className="text-[#d4af37]">Аренды</span>
                            </h1>
                            <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                                Прозрачные и понятные условия для вашего спокойствия и комфортного пользования нашими автомобилями.
                            </p>
                        </FadeInWhenVisible>
                    </div>
                </section>

                <section className="py-16 sm:py-24 px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                        {terms.map((term, idx) => (
                             <FadeInWhenVisible key={idx} delay={idx * 0.1}>
                                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 h-full">
                                    <div className="flex items-center gap-4 mb-5">
                                        <term.Icon className="h-8 w-8 text-[#d4af37]" />
                                        <h2 className="text-2xl font-bold text-white">{term.title}</h2>
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
    )
}