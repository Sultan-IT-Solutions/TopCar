import 'server-only';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
    CompanyProfile,
    FAQItem,
    TermsSection,
    defaultCompanyProfile,
    defaultSiteConfig,
    normalizeCompanyProfile,
    normalizeFaqItems,
    normalizeTermsSections,
} from '@/lib/site-config';

type CompanySettingsRow = {
    id: string;
    phone_display: string;
    phone_raw: string;
    email: string;
    address_ru: string;
    address_en: string;
    address_kk: string;
    support_hours_ru: string;
    support_hours_en: string;
    support_hours_kk: string;
    whatsapp_url: string;
    telegram_url: string;
    instagram_url: string | null;
    viber_url: string | null;
    max_url: string | null;
    pwa_download_url: string;
    pwa_qr_image_url: string | null;
    subscription_enabled: boolean;
};

function canUseSupabaseAdmin() {
    return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function mapCompanySettingsRow(row?: CompanySettingsRow | null): CompanyProfile {
    if (!row) {
        return defaultCompanyProfile;
    }

    return normalizeCompanyProfile({
        id: row.id,
        phoneDisplay: row.phone_display,
        phoneRaw: row.phone_raw,
        email: row.email,
        address: {
            ru: row.address_ru,
            en: row.address_en,
            kk: row.address_kk,
        },
        supportHours: {
            ru: row.support_hours_ru,
            en: row.support_hours_en,
            kk: row.support_hours_kk,
        },
        whatsappUrl: row.whatsapp_url,
        telegramUrl: row.telegram_url,
        instagramUrl: row.instagram_url ?? '',
        viberUrl: row.viber_url ?? '',
        maxUrl: row.max_url ?? '',
        pwaDownloadUrl: row.pwa_download_url,
        pwaQrImageUrl: row.pwa_qr_image_url ?? '',
        subscriptionEnabled: row.subscription_enabled,
    });
}

export async function loadSiteConfig() {
    if (!canUseSupabaseAdmin()) {
        return defaultSiteConfig;
    }

    try {
        const supabase = getSupabaseAdmin();
        const [{ data: profileData }, { data: sectionsData }] = await Promise.all([
            supabase.from('company_settings').select('*').eq('id', 'primary').maybeSingle(),
            supabase
                .from('site_sections')
                .select('slug, data')
                .in('slug', ['faq', 'terms']),
        ]);

        const faqSection = sectionsData?.find((item) => item.slug === 'faq');
        const termsSection = sectionsData?.find((item) => item.slug === 'terms');

        return {
            profile: mapCompanySettingsRow(profileData as CompanySettingsRow | null),
            faqItems: normalizeFaqItems((faqSection?.data as { items?: FAQItem[] } | null)?.items),
            termsSections: normalizeTermsSections(
                (termsSection?.data as { sections?: TermsSection[] } | null)?.sections,
            ),
        };
    } catch (error) {
        console.error('Failed to load site config:', error);
        return defaultSiteConfig;
    }
}

export async function saveCompanyProfile(profile: CompanyProfile) {
    const supabase = getSupabaseAdmin();
    const nextProfile = normalizeCompanyProfile(profile);

    const payload = {
        id: 'primary',
        phone_display: nextProfile.phoneDisplay,
        phone_raw: nextProfile.phoneRaw,
        email: nextProfile.email,
        address_ru: nextProfile.address.ru,
        address_en: nextProfile.address.en,
        address_kk: nextProfile.address.kk,
        support_hours_ru: nextProfile.supportHours.ru,
        support_hours_en: nextProfile.supportHours.en,
        support_hours_kk: nextProfile.supportHours.kk,
        whatsapp_url: nextProfile.whatsappUrl,
        telegram_url: nextProfile.telegramUrl,
        instagram_url: nextProfile.instagramUrl || null,
        viber_url: nextProfile.viberUrl || null,
        max_url: nextProfile.maxUrl || null,
        pwa_download_url: nextProfile.pwaDownloadUrl,
        pwa_qr_image_url: nextProfile.pwaQrImageUrl || null,
        subscription_enabled: nextProfile.subscriptionEnabled,
    };

    const { data, error } = await supabase
        .from('company_settings')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .single();

    if (error) {
        throw error;
    }

    return mapCompanySettingsRow(data as CompanySettingsRow);
}

async function saveSection(slug: 'faq' | 'terms', data: Record<string, unknown>) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
        .from('site_sections')
        .upsert({ slug, data }, { onConflict: 'slug' });

    if (error) {
        throw error;
    }
}

export async function saveFaqItems(items: FAQItem[]) {
    const nextItems = normalizeFaqItems(items);
    await saveSection('faq', { items: nextItems });
    return nextItems;
}

export async function saveTermsSections(sections: TermsSection[]) {
    const nextSections = normalizeTermsSections(sections);
    await saveSection('terms', { sections: nextSections });
    return nextSections;
}
