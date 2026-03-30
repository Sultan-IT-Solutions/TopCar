import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';
import { DurationUnit, Request } from '@/types';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export type CreateRequestInput = {
    requestType: Request['request_type'];
    source?: string;
    status?: Request['status'];
    userId?: string | null;
    carId?: number | null;
    tariffId?: number | null;
    carName?: string | null;
    userName?: string | null;
    userPhone?: string | null;
    userEmail?: string | null;
    message?: string | null;
    serviceType?: string | null;
    withDriver?: boolean | null;
    durationUnit?: DurationUnit;
    durationValue?: number | null;
    requestedDateFrom?: string | null;
    requestedDateTo?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
    subtotalAmount?: number;
    discountAmount?: number;
    finalAmount?: number;
    promoCode?: string | null;
    promoCodeId?: string | null;
    locale?: string;
    metadata?: Record<string, unknown>;
};

type BookingSyncInput = {
    requestId: string;
    promoCodeId?: string | null;
    promoCode?: string | null;
    discountAmount?: number;
    finalAmount?: number;
    carId?: number | null;
    userId?: string | null;
    carName: string;
    userName?: string | null;
    userPhone: string;
    dateFrom: string;
    dateTo: string;
    startsAt?: string | null;
    endsAt?: string | null;
    durationUnit?: DurationUnit;
    durationValue?: number | null;
    totalPrice: number;
    status?: string;
};

export function deriveDateRangeFromWindow(
    startsAt?: string | null,
    endsAt?: string | null,
) {
    const start = startsAt ? new Date(startsAt) : null;
    const end = endsAt ? new Date(endsAt) : null;

    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return {
            requestedDateFrom: null,
            requestedDateTo: null,
        };
    }

    return {
        requestedDateFrom: start.toISOString().slice(0, 10),
        requestedDateTo: end.toISOString().slice(0, 10),
    };
}

export async function createRequestRecord(
    input: CreateRequestInput,
    client?: SupabaseClient,
) {
    const supabase = client ?? getSupabaseAdmin();

    const { data, error } = await supabase
        .from('requests')
        .insert([
            {
                request_type: input.requestType,
                source: input.source ?? 'website',
                status: input.status ?? 'new',
                user_id: input.userId ?? null,
                car_id: input.carId ?? null,
                tariff_id: input.tariffId ?? null,
                car_name: input.carName ?? null,
                user_name: input.userName ?? null,
                user_phone: input.userPhone ?? null,
                user_email: input.userEmail ?? null,
                message: input.message ?? null,
                service_type: input.serviceType ?? null,
                with_driver: input.withDriver ?? null,
                duration_unit: input.durationUnit ?? 'day',
                duration_value: input.durationValue ?? null,
                requested_date_from: input.requestedDateFrom ?? null,
                requested_date_to: input.requestedDateTo ?? null,
                starts_at: input.startsAt ?? null,
                ends_at: input.endsAt ?? null,
                subtotal_amount: input.subtotalAmount ?? 0,
                discount_amount: input.discountAmount ?? 0,
                final_amount: input.finalAmount ?? input.subtotalAmount ?? 0,
                promo_code: input.promoCode ?? null,
                promo_code_id: input.promoCodeId ?? null,
                locale: input.locale ?? 'ru',
                metadata: input.metadata ?? {},
            },
        ])
        .select('*')
        .single();

    if (error) {
        throw error;
    }

    return data as Request;
}

export async function createBookingForRequest(
    input: BookingSyncInput,
    client?: SupabaseClient,
) {
    const supabase = client ?? getSupabaseAdmin();

    const { data, error } = await supabase
        .from('bookings')
        .insert([
            {
                request_id: input.requestId,
                promo_code_id: input.promoCodeId ?? null,
                promo_code: input.promoCode ?? null,
                discount_amount: input.discountAmount ?? 0,
                final_amount: input.finalAmount ?? input.totalPrice,
                car_id: input.carId ?? null,
                user_id: input.userId ?? null,
                car_name: input.carName,
                user_name: input.userName ?? null,
                user_phone: input.userPhone,
                date_from: input.dateFrom,
                date_to: input.dateTo,
                starts_at: input.startsAt ?? null,
                ends_at: input.endsAt ?? null,
                duration_unit: input.durationUnit ?? 'day',
                duration_value: input.durationValue ?? null,
                total_price: input.totalPrice,
                status: input.status ?? 'pending',
            },
        ])
        .select('*')
        .single();

    if (error) {
        throw error;
    }

    return data;
}
