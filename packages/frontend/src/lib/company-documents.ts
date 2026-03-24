export type SupportedLocale = 'ru' | 'en' | 'kk';

type LocalizedValue = Record<SupportedLocale, string>;

export type CompanyDocumentDefinition = {
    slug: string;
    sortOrder: number;
    title: LocalizedValue;
    description: LocalizedValue;
};

export type CompanyDocumentStatus = 'available' | 'pending';
export type CompanyDocumentSource = 'uploaded' | 'missing';

export type CompanyDocumentRecord = {
    slug: string;
    title: string;
    description: string;
    sortOrder: number;
    status: CompanyDocumentStatus;
    source: CompanyDocumentSource;
    fileName?: string;
    mimeType?: string | null;
    sizeBytes?: number | null;
    updatedAt?: string | null;
    viewUrl?: string;
    downloadUrl?: string;
};

export const COMPANY_DOCUMENTS_BUCKET = 'company-documents';
export const COMPANY_DOCUMENTS_MAX_FILE_SIZE = 20 * 1024 * 1024;
export const COMPANY_DOCUMENTS_ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
]);

export const companyDocumentDefinitions: CompanyDocumentDefinition[] = [
    {
        slug: 'registration-documents',
        sortOrder: 10,
        title: {
            ru: 'Регистрационные документы компании',
            en: 'Company registration documents',
            kk: 'Компанияның тіркеу құжаттары',
        },
        description: {
            ru: 'Скан-копии официальных регистрационных документов компании для подтверждения правового статуса.',
            en: 'Official registration copies confirming the legal status of the company.',
            kk: 'Компанияның құқықтық мәртебесін растайтын ресми тіркеу құжаттарының көшірмелері.',
        },
    },
    {
        slug: 'licenses-certificates',
        sortOrder: 20,
        title: {
            ru: 'Лицензии и сертификаты',
            en: 'Licenses and certificates',
            kk: 'Лицензиялар мен сертификаттар',
        },
        description: {
            ru: 'Подтверждающие лицензии, сертификаты и иные официальные разрешительные материалы.',
            en: 'Supporting licenses, certificates and other official permitting materials.',
            kk: 'Растайтын лицензиялар, сертификаттар және өзге де ресми рұқсат материалдары.',
        },
    },
    {
        slug: 'insurance-coverage',
        sortOrder: 30,
        title: {
            ru: 'Памятка по страховому покрытию',
            en: 'Insurance coverage memo',
            kk: 'Сақтандыру жабыны туралы жадынама',
        },
        description: {
            ru: 'Краткое описание базового страхового контура и условий подтверждения перед выдачей автомобиля.',
            en: 'A short overview of the base insurance scope and how coverage is confirmed before handover.',
            kk: 'Негізгі сақтандыру жабыны мен көлік берілгенге дейін оны растау тәртібі туралы қысқаша түсіндірме.',
        },
    },
    {
        slug: 'privacy-summary',
        sortOrder: 40,
        title: {
            ru: 'Краткая памятка по защите данных',
            en: 'Data protection summary',
            kk: 'Деректерді қорғау туралы қысқаша жадынама',
        },
        description: {
            ru: 'Какие данные используются в сервисе и как запросить уточнение или удаление информации.',
            en: 'What data the service uses and how to request clarification or deletion.',
            kk: 'Қандай деректер қолданылатыны және оларды нақтылау не жоюды қалай сұратуға болатыны туралы материал.',
        },
    },
    {
        slug: 'client-verification-checklist',
        sortOrder: 50,
        title: {
            ru: 'Чек-лист проверки клиента и автомобиля',
            en: 'Client and vehicle verification checklist',
            kk: 'Клиент пен көлікті тексеру чек-парағы',
        },
        description: {
            ru: 'Прозрачный порядок проверки документов, комплектации автомобиля и стартовых условий аренды.',
            en: 'A transparent sequence for checking documents, vehicle equipment and rental start conditions.',
            kk: 'Құжаттарды, көлік жинақтамасын және жалдау басталу шарттарын тексерудің ашық тәртібі.',
        },
    },
];

export function getCompanyDocumentDefinition(slug: string) {
    return companyDocumentDefinitions.find((document) => document.slug === slug) ?? null;
}

export function getLocalizedDocumentText(
    definition: CompanyDocumentDefinition,
    locale: SupportedLocale,
) {
    return {
        title: definition.title[locale] || definition.title.ru,
        description: definition.description[locale] || definition.description.ru,
    };
}

export function normalizeSupportedLocale(value?: string | null): SupportedLocale {
    if (value === 'en' || value === 'kk') {
        return value;
    }

    return 'ru';
}
