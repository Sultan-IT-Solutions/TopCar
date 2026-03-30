export type SupportedLocale = 'ru' | 'en' | 'kk';

export type LocalizedText = Record<SupportedLocale, string>;
export type LocalizedList = Record<SupportedLocale, string[]>;

export type CompanyProfile = {
    id: string;
    phoneDisplay: string;
    phoneRaw: string;
    email: string;
    address: LocalizedText;
    supportHours: LocalizedText;
    whatsappUrl: string;
    telegramUrl: string;
    instagramUrl: string;
    viberUrl: string;
    maxUrl: string;
    pwaDownloadUrl: string;
    pwaQrImageUrl: string;
    subscriptionEnabled: boolean;
};

export type FAQItem = {
    id: string;
    question: LocalizedText;
    answer: LocalizedText;
};

export type TermsSection = {
    id: string;
    icon: string;
    title: LocalizedText;
    points: LocalizedList;
};

export type SiteConfig = {
    profile: CompanyProfile;
    faqItems: FAQItem[];
    termsSections: TermsSection[];
};

export const emptyLocalizedText: LocalizedText = { ru: '', en: '', kk: '' };
export const emptyLocalizedList: LocalizedList = { ru: [], en: [], kk: [] };

export const defaultCompanyProfile: CompanyProfile = {
    id: 'primary',
    phoneDisplay: '+7 (777) 666-02-95',
    phoneRaw: '+77776660295',
    email: 'topcar_club@mail.ru',
    address: {
        ru: 'г. Алматы, ул. Байтурсынова, 179/2',
        en: '179/2 Baitursynova St., Almaty',
        kk: 'Алматы қ., Байтұрсынова көш., 179/2',
    },
    supportHours: {
        ru: 'Работаем круглосуточно, 24/7',
        en: 'Available 24/7',
        kk: 'Тәулік бойы, 24/7',
    },
    whatsappUrl: 'https://wa.me/77776660295',
    telegramUrl: 'https://t.me/topcarqz',
    instagramUrl:
        'https://www.instagram.com/topcar.qz?igsh=MXJjbTZ5M3BwdTkzMA==',
    viberUrl: '',
    maxUrl: '',
    pwaDownloadUrl: '/download',
    pwaQrImageUrl: '',
    subscriptionEnabled: false,
};

export const defaultFaqItems: FAQItem[] = [
    {
        id: 'payment',
        question: {
            ru: 'Как происходит оплата аренды?',
            en: 'How do I pay for the rental?',
            kk: 'Жалдау ақысын қалай төлеймін?',
        },
        answer: {
            ru: 'Оплата подтверждается до передачи автомобиля. Менеджер заранее согласует удобный формат оплаты и итоговую сумму.',
            en: 'Payment is confirmed before the vehicle handover. A manager will agree on a convenient payment format and the final amount in advance.',
            kk: 'Төлем көлік берілгенге дейін расталады. Менеджер төлемнің ыңғайлы тәсілін және соңғы соманы алдын ала келіседі.',
        },
    },
    {
        id: 'terms',
        question: {
            ru: 'Какие основные условия аренды?',
            en: 'What are the main rental requirements?',
            kk: 'Жалдаудың негізгі талаптары қандай?',
        },
        answer: {
            ru: 'Минимальный возраст водителя — 23 года, минимальный стаж — 3 года. Для некоторых автомобилей премиум-класса требования могут быть выше.',
            en: 'The minimum driver age is 23 and the minimum driving experience is 3 years. Some premium vehicles may require a higher threshold.',
            kk: 'Жүргізушінің ең төменгі жасы — 23 жас, жүргізу өтілі — кемінде 3 жыл. Кейбір премиум көліктер үшін талап жоғары болуы мүмкін.',
        },
    },
    {
        id: 'return',
        question: {
            ru: 'Как проходит возврат автомобиля?',
            en: 'How does the vehicle return work?',
            kk: 'Көлікті қайтару қалай өтеді?',
        },
        answer: {
            ru: 'Перед возвратом менеджер согласует время и место, после чего автомобиль проходит стандартную проверку состояния и комплектации.',
            en: 'Before the return, a manager confirms the time and location, and the vehicle goes through a standard condition and equipment check.',
            kk: 'Қайтару алдында менеджер уақыт пен орынды келіседі, содан кейін көлік стандартты техникалық және жинақтама тексеруінен өтеді.',
        },
    },
    {
        id: 'out-of-city',
        question: {
            ru: 'Можно ли выезжать за пределы города?',
            en: 'Can I drive outside the city?',
            kk: 'Қала сыртына шығуға бола ма?',
        },
        answer: {
            ru: 'Да, но маршрут нужно согласовать заранее. Для отдельных автомобилей и направлений могут действовать дополнительные условия.',
            en: 'Yes, but the route should be approved in advance. Some vehicles and destinations may have additional conditions.',
            kk: 'Иә, бірақ бағыт алдын ала келісілген болуы керек. Кейбір көліктер мен бағыттар үшін қосымша шарттар қолданылады.',
        },
    },
];

export const defaultTermsSections: TermsSection[] = [
    {
        id: 'requirements',
        icon: 'IdentificationIcon',
        title: {
            ru: 'Требования к арендатору',
            en: 'Renter requirements',
            kk: 'Жалдаушыға қойылатын талаптар',
        },
        points: {
            ru: [
                'Минимальный возраст: 21 год.',
                'Стаж вождения: не менее 3 лет.',
                'Наличие оригинала паспорта и водительского удостоверения.',
            ],
            en: [
                'Minimum age: 21 years.',
                'Driving experience: at least 3 years.',
                "Original passport and driver's license are required.",
            ],
            kk: [
                'Ең төменгі жас: 21 жас.',
                'Жүргізу өтілі: кемінде 3 жыл.',
                'Төлқұжат пен жүргізуші куәлігінің түпнұсқасы қажет.',
            ],
        },
    },
    {
        id: 'payment',
        icon: 'CurrencyDollarIcon',
        title: {
            ru: 'Оплата и депозит',
            en: 'Payment and deposit',
            kk: 'Төлем және депозит',
        },
        points: {
            ru: [
                'Полная предоплата за весь период аренды.',
                'Внесение страхового депозита зависит от класса автомобиля.',
                'Депозит возвращается после проверки автомобиля.',
            ],
            en: [
                'Full prepayment for the entire rental period.',
                'A security deposit depends on the car class.',
                'The deposit is returned after the vehicle inspection.',
            ],
            kk: [
                'Жалдау мерзімі үшін толық алдын ала төлем жасалады.',
                'Сақтандыру депозиті көлік класына байланысты.',
                'Депозит көлік тексерілгеннен кейін қайтарылады.',
            ],
        },
    },
    {
        id: 'restrictions',
        icon: 'NoSymbolIcon',
        title: {
            ru: 'Ограничения и запреты',
            en: 'Restrictions and prohibitions',
            kk: 'Шектеулер мен тыйымдар',
        },
        points: {
            ru: [
                'Курение в салоне запрещено.',
                'Передача управления третьим лицам без согласования запрещена.',
                'Выезд за пределы согласованной территории запрещен.',
            ],
            en: [
                'Smoking inside the vehicle is prohibited.',
                'Handing the car to third parties without approval is prohibited.',
                'Driving outside the approved operating area is prohibited.',
            ],
            kk: [
                'Көлік салонында темекі шегуге тыйым салынады.',
                'Үшінші тұлғаларға жүргізуді беруге болмайды.',
                'Келісілген пайдалану аумағынан тыс шығуға болмайды.',
            ],
        },
    },
    {
        id: 'insurance',
        icon: 'ShieldCheckIcon',
        title: {
            ru: 'Страхование и ответственность',
            en: 'Insurance and liability',
            kk: 'Сақтандыру және жауапкершілік',
        },
        points: {
            ru: [
                'Все автомобили застрахованы.',
                'Арендатор отвечает за штрафы в период аренды.',
                'В случае ДТП необходимо сразу связаться с менеджером.',
            ],
            en: [
                'All vehicles are insured.',
                'The renter is responsible for traffic fines during the rental.',
                'In case of an accident, contact the manager immediately.',
            ],
            kk: [
                'Барлық көліктер сақтандырылған.',
                'Жалдаушы жалдау кезеңіндегі айыппұлдар үшін жауап береді.',
                'ЖКО болған жағдайда менеджермен дереу байланысу қажет.',
            ],
        },
    },
];

export const defaultSiteConfig: SiteConfig = {
    profile: defaultCompanyProfile,
    faqItems: defaultFaqItems,
    termsSections: defaultTermsSections,
};

function normalizeLocalizedText(
    value: unknown,
    fallback: LocalizedText,
): LocalizedText {
    if (!value || typeof value !== 'object') {
        return fallback;
    }

    const record = value as Partial<Record<SupportedLocale, unknown>>;
    return {
        ru: typeof record.ru === 'string' ? record.ru : fallback.ru,
        en: typeof record.en === 'string' ? record.en : fallback.en,
        kk: typeof record.kk === 'string' ? record.kk : fallback.kk,
    };
}

function normalizeLocalizedList(
    value: unknown,
    fallback: LocalizedList,
): LocalizedList {
    if (!value || typeof value !== 'object') {
        return fallback;
    }

    const record = value as Partial<Record<SupportedLocale, unknown>>;
    const normalizeList = (input: unknown, fallbackList: string[]) =>
        Array.isArray(input)
            ? input.filter((item): item is string => typeof item === 'string')
            : fallbackList;

    return {
        ru: normalizeList(record.ru, fallback.ru),
        en: normalizeList(record.en, fallback.en),
        kk: normalizeList(record.kk, fallback.kk),
    };
}

export function normalizeCompanyProfile(
    value?: Partial<CompanyProfile> | null,
): CompanyProfile {
    return {
        id:
            typeof value?.id === 'string' && value.id.trim()
                ? value.id
                : defaultCompanyProfile.id,
        phoneDisplay:
            typeof value?.phoneDisplay === 'string' && value.phoneDisplay.trim()
                ? value.phoneDisplay
                : defaultCompanyProfile.phoneDisplay,
        phoneRaw:
            typeof value?.phoneRaw === 'string' && value.phoneRaw.trim()
                ? value.phoneRaw
                : defaultCompanyProfile.phoneRaw,
        email:
            typeof value?.email === 'string' && value.email.trim()
                ? value.email
                : defaultCompanyProfile.email,
        address: normalizeLocalizedText(value?.address, defaultCompanyProfile.address),
        supportHours: normalizeLocalizedText(
            value?.supportHours,
            defaultCompanyProfile.supportHours,
        ),
        whatsappUrl:
            typeof value?.whatsappUrl === 'string'
                ? value.whatsappUrl
                : defaultCompanyProfile.whatsappUrl,
        telegramUrl:
            typeof value?.telegramUrl === 'string'
                ? value.telegramUrl
                : defaultCompanyProfile.telegramUrl,
        instagramUrl:
            typeof value?.instagramUrl === 'string'
                ? value.instagramUrl
                : defaultCompanyProfile.instagramUrl,
        viberUrl:
            typeof value?.viberUrl === 'string'
                ? value.viberUrl
                : defaultCompanyProfile.viberUrl,
        maxUrl:
            typeof value?.maxUrl === 'string'
                ? value.maxUrl
                : defaultCompanyProfile.maxUrl,
        pwaDownloadUrl:
            typeof value?.pwaDownloadUrl === 'string' && value.pwaDownloadUrl.trim()
                ? value.pwaDownloadUrl
                : defaultCompanyProfile.pwaDownloadUrl,
        pwaQrImageUrl:
            typeof value?.pwaQrImageUrl === 'string'
                ? value.pwaQrImageUrl
                : defaultCompanyProfile.pwaQrImageUrl,
        subscriptionEnabled:
            typeof value?.subscriptionEnabled === 'boolean'
                ? value.subscriptionEnabled
                : defaultCompanyProfile.subscriptionEnabled,
    };
}

export function normalizeFaqItems(value: unknown): FAQItem[] {
    if (!Array.isArray(value) || value.length === 0) {
        return defaultFaqItems;
    }

    return value.map((item, index) => {
        const source = item as Partial<FAQItem> | null;
        return {
            id:
                typeof source?.id === 'string' && source.id.trim()
                    ? source.id
                    : `faq-${index + 1}`,
            question: normalizeLocalizedText(
                source?.question,
                defaultFaqItems[index]?.question ?? emptyLocalizedText,
            ),
            answer: normalizeLocalizedText(
                source?.answer,
                defaultFaqItems[index]?.answer ?? emptyLocalizedText,
            ),
        };
    });
}

export function normalizeTermsSections(value: unknown): TermsSection[] {
    if (!Array.isArray(value) || value.length === 0) {
        return defaultTermsSections;
    }

    return value.map((item, index) => {
        const source = item as Partial<TermsSection> | null;
        return {
            id:
                typeof source?.id === 'string' && source.id.trim()
                    ? source.id
                    : `terms-${index + 1}`,
            icon:
                typeof source?.icon === 'string' && source.icon.trim()
                    ? source.icon
                    : defaultTermsSections[index]?.icon ?? 'ShieldCheckIcon',
            title: normalizeLocalizedText(
                source?.title,
                defaultTermsSections[index]?.title ?? emptyLocalizedText,
            ),
            points: normalizeLocalizedList(
                source?.points,
                defaultTermsSections[index]?.points ?? emptyLocalizedList,
            ),
        };
    });
}

export function getLocalizedText(
    value: LocalizedText,
    locale: SupportedLocale,
): string {
    return value[locale] || value.ru;
}

export function getLocalizedList(
    value: LocalizedList,
    locale: SupportedLocale,
): string[] {
    return value[locale]?.length ? value[locale] : value.ru;
}
