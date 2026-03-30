import type { CompanyProfile } from '@/lib/site-config';

/**
 * =================================================================
 * ГЛАВНЫЕ ТИПЫ ДАННЫХ ВАШЕГО ПРИЛОЖЕНИЯ
 * =================================================================
 */

export type DurationUnit = 'day' | 'hour';
export type RequestType = 'contact' | 'calculation' | 'booking';
export type RequestStatus =
    | 'new'
    | 'reviewed'
    | 'contacted'
    | 'confirmed'
    | 'cancelled'
    | 'archived';
export type PromoScope = 'public' | 'personal';
export type DiscountType = 'percent' | 'amount';

// Тип для цен из таблицы `prices`
export type Price = {
    id: number;
    car_id: number;
    days_from: number;
    days_to: number;
    price_per_day: number;
    with_driver: boolean;
    conditions?: string;
    duration_unit?: DurationUnit;
    created_at?: string;
};

/**
 * Тип для автомобиля.
 */
export type Car = {
    id: number;
    name: string;
    slug: string;
    brand: string;
    class: 'Economy' | 'Business' | 'Premium' | 'Luxury';
    description: string;
    full_description?: string;
    image_url: string;
    gallery_images?: string[];
    prices?: Price[];
    price?: number;
    price_per_day: number;
    power?: number;
    acceleration?: number;
    fuel_type?: string;
    drive_type?: string;
    seats?: number;
    year?: number;
    is_available?: boolean;
    available?: boolean;
    status?: string | { available?: boolean; isNew?: boolean };
    is_featured_home?: boolean;
    featured_order?: number;
};

/**
 * Тип для master-промокода.
 */
export type PromoCode = {
    id: string;
    code: string;
    title?: string | null;
    description?: string | null;
    scope: PromoScope;
    discount_type: DiscountType;
    discount_value: number;
    is_active: boolean;
    starts_at?: string | null;
    expires_at?: string | null;
    usage_limit?: number | null;
    per_user_limit?: number | null;
    assigned_user_id?: string | null;
    car_id?: number | null;
    applicable_duration_unit?: DurationUnit | null;
    with_driver?: boolean | null;
    legacy_source?: string | null;
    legacy_id?: number | null;
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at?: string;
};

/**
 * Базовый тип для пользователя.
 */
export type User = {
    id: string;
    email?: string;
    full_name?: string;
    phone?: string;
};

/**
 * Базовый тип для бронирования.
 */
export type Booking = {
    id: string;
    car_id: number | null;
    user_id: string | null;
    request_id?: string | null;
    promo_code_id?: string | null;
    promo_code?: string | null;
    car_name: string;
    user_name?: string | null;
    user_phone: string;
    date_from: string;
    date_to: string;
    starts_at?: string | null;
    ends_at?: string | null;
    total_price: number;
    discount_amount?: number;
    final_amount?: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    created_at: string;
    duration_unit?: DurationUnit;
    duration_value?: number | null;
};

export type Request = {
    id: string;
    request_type: RequestType;
    source: string;
    status: RequestStatus;
    user_id?: string | null;
    car_id?: number | null;
    tariff_id?: number | null;
    car_name?: string | null;
    user_name?: string | null;
    user_phone?: string | null;
    user_email?: string | null;
    message?: string | null;
    service_type?: string | null;
    with_driver?: boolean | null;
    duration_unit?: DurationUnit;
    duration_value?: number | null;
    requested_date_from?: string | null;
    requested_date_to?: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
    subtotal_amount: number;
    discount_amount: number;
    final_amount: number;
    promo_code?: string | null;
    promo_code_id?: string | null;
    locale?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at?: string;
};

export type PromoRedemption = {
    id: string;
    promo_code_id: string;
    user_id?: string | null;
    request_id?: string | null;
    booking_id?: string | null;
    redeemed_code: string;
    discount_amount: number;
    final_amount: number;
    metadata?: Record<string, unknown>;
    redeemed_at: string;
};

export type AnalyticsEventName =
    | 'pwa_install'
    | 'registration'
    | 'login'
    | 'messenger_click'
    | 'phone_click'
    | 'contact_form_submit'
    | 'calc_saved'
    | 'booking_created'
    | 'promo_applied'
    | 'car_view'
    | 'car_cta_click';

export type AnalyticsEvent = {
    id: number;
    event_name: AnalyticsEventName | string;
    user_id?: string | null;
    request_id?: string | null;
    booking_id?: string | null;
    car_id?: number | null;
    promo_code_id?: string | null;
    source: string;
    locale: string;
    page_path?: string | null;
    event_value?: number | null;
    metadata?: Record<string, unknown>;
    created_at: string;
};

export type PushSubscriptionRecord = {
    id: string;
    user_id?: string | null;
    endpoint: string;
    p256dh: string;
    auth: string;
    locale: string;
    user_agent?: string | null;
    is_active: boolean;
    metadata?: Record<string, unknown>;
    last_seen_at: string;
    created_at: string;
    updated_at?: string;
};

export type { CompanyProfile };
