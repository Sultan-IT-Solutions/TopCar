import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';
import { getDateRangeBounds } from '@/lib/analytics-events-server';

function formatDateKey(value: string) {
    return value.slice(0, 10);
}

export async function GET(request: NextRequest) {
    const admin = await requireAdminRequest(request);
    if (admin instanceof Response) {
        return admin;
    }

    const range =
        request.nextUrl.searchParams.get('range') === 'today' ||
        request.nextUrl.searchParams.get('range') === '7d' ||
        request.nextUrl.searchParams.get('range') === '30d' ||
        request.nextUrl.searchParams.get('range') === '90d' ||
        request.nextUrl.searchParams.get('range') === 'custom'
            ? (request.nextUrl.searchParams.get('range') as
                  | 'today'
                  | '7d'
                  | '30d'
                  | '90d'
                  | 'custom')
            : '30d';
    const from = request.nextUrl.searchParams.get('from');
    const to = request.nextUrl.searchParams.get('to');
    const bounds = getDateRangeBounds(range, from, to);

    try {
        const supabase = getSupabaseAdmin();
        let eventsQuery = supabase
            .from('analytics_events')
            .select('*')
            .order('created_at', { ascending: false });
        let requestsQuery = supabase
            .from('requests')
            .select('*')
            .order('created_at', { ascending: false });
        let bookingsQuery = supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });
        let redemptionsQuery = supabase
            .from('promo_redemptions')
            .select('*')
            .order('redeemed_at', { ascending: false });

        if (bounds.from) {
            eventsQuery = eventsQuery.gte('created_at', bounds.from);
            requestsQuery = requestsQuery.gte('created_at', bounds.from);
            bookingsQuery = bookingsQuery.gte('created_at', bounds.from);
            redemptionsQuery = redemptionsQuery.gte('redeemed_at', bounds.from);
        }

        if (bounds.to) {
            eventsQuery = eventsQuery.lte('created_at', bounds.to);
            requestsQuery = requestsQuery.lte('created_at', bounds.to);
            bookingsQuery = bookingsQuery.lte('created_at', bounds.to);
            redemptionsQuery = redemptionsQuery.lte('redeemed_at', bounds.to);
        }

        const [{ data: events, error: eventsError }, { data: requests, error: requestsError }, { data: bookings, error: bookingsError }, { data: redemptions, error: redemptionsError }, { data: cars, error: carsError }] =
            await Promise.all([
                eventsQuery,
                requestsQuery,
                bookingsQuery,
                redemptionsQuery,
                supabase.from('cars').select('id, name, brand'),
            ]);

        if (eventsError) throw eventsError;
        if (requestsError) throw requestsError;
        if (bookingsError) throw bookingsError;
        if (redemptionsError) throw redemptionsError;
        if (carsError) throw carsError;

        const summary = {
            requestsCount: requests?.length ?? 0,
            bookingsCount: bookings?.length ?? 0,
            calculationsCount:
                requests?.filter((item) => item.request_type === 'calculation')
                    .length ?? 0,
            contactsCount:
                requests?.filter((item) => item.request_type === 'contact')
                    .length ?? 0,
            registrationsCount:
                events?.filter((item) => item.event_name === 'registration')
                    .length ?? 0,
            loginsCount:
                events?.filter((item) => item.event_name === 'login').length ??
                0,
            pwaInstallsCount:
                events?.filter((item) => item.event_name === 'pwa_install')
                    .length ?? 0,
            messengerClicksCount:
                events?.filter(
                    (item) => item.event_name === 'messenger_click',
                ).length ?? 0,
            phoneClicksCount:
                events?.filter((item) => item.event_name === 'phone_click')
                    .length ?? 0,
            promoAppliedCount:
                events?.filter((item) => item.event_name === 'promo_applied')
                    .length ?? 0,
            discountTotal:
                redemptions?.reduce(
                    (sum, item) => sum + Number(item.discount_amount ?? 0),
                    0,
                ) ?? 0,
            bookingsRevenue:
                bookings?.reduce(
                    (sum, item) =>
                        sum +
                        Number(item.final_amount ?? item.total_price ?? 0),
                    0,
                ) ?? 0,
        };

        const dailyMap = new Map<
            string,
            {
                requests: number;
                bookings: number;
                revenue: number;
            }
        >();

        for (const item of requests ?? []) {
            const key = formatDateKey(item.created_at);
            const current = dailyMap.get(key) ?? {
                requests: 0,
                bookings: 0,
                revenue: 0,
            };
            current.requests += 1;
            dailyMap.set(key, current);
        }

        for (const item of bookings ?? []) {
            const key = formatDateKey(item.created_at);
            const current = dailyMap.get(key) ?? {
                requests: 0,
                bookings: 0,
                revenue: 0,
            };
            current.bookings += 1;
            current.revenue += Number(item.final_amount ?? item.total_price ?? 0);
            dailyMap.set(key, current);
        }

        const revenueByCar = new Map<number, { revenue: number; count: number }>();
        for (const item of bookings ?? []) {
            if (!item.car_id) continue;
            const current = revenueByCar.get(item.car_id) ?? {
                revenue: 0,
                count: 0,
            };
            current.revenue += Number(item.final_amount ?? item.total_price ?? 0);
            current.count += 1;
            revenueByCar.set(item.car_id, current);
        }

        return jsonNoStore({
            summary,
            timeline: Array.from(dailyMap.entries())
                .sort((left, right) => left[0].localeCompare(right[0]))
                .map(([date, values]) => ({
                    date,
                    ...values,
                })),
            topCars: Array.from(revenueByCar.entries())
                .map(([carId, values]) => ({
                    carId,
                    ...(cars?.find((car) => car.id === carId) ?? {
                        name: 'Неизвестный автомобиль',
                        brand: '—',
                    }),
                    ...values,
                }))
                .sort((left, right) => right.revenue - left.revenue)
                .slice(0, 10),
            range: {
                range,
                from: bounds.from,
                to: bounds.to,
            },
        });
    } catch (error) {
        console.error('Admin analytics GET failed:', error);
        return jsonNoStore(
            { message: 'Не удалось загрузить аналитику.' },
            { status: 500 },
        );
    }
}
