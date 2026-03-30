import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';

export async function GET(request: NextRequest) {
    const admin = await requireAdminRequest(request);
    if (admin instanceof Response) {
        return admin;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const requestType = searchParams.get('type');
    const source = searchParams.get('source');
    const promoCode = searchParams.get('promoCode');
    const carId = searchParams.get('carId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    try {
        const supabase = getSupabaseAdmin();
        let query = supabase
            .from('requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (requestType) query = query.eq('request_type', requestType);
        if (source) query = query.eq('source', source);
        if (promoCode) query = query.eq('promo_code', promoCode.toUpperCase());
        if (carId && Number.isFinite(Number(carId))) {
            query = query.eq('car_id', Number(carId));
        }
        if (from) query = query.gte('created_at', `${from}T00:00:00.000Z`);
        if (to) query = query.lte('created_at', `${to}T23:59:59.999Z`);

        const [{ data: requests, error: requestsError }, { data: cars, error: carsError }, { data: bookings, error: bookingsError }, { data: users, error: usersError }] =
            await Promise.all([
                query,
                supabase.from('cars').select('id, name, brand'),
                supabase.from('bookings').select('*'),
                supabase.from('users').select('id, email, full_name'),
            ]);

        if (requestsError) throw requestsError;
        if (carsError) throw carsError;
        if (bookingsError) throw bookingsError;
        if (usersError) throw usersError;

        const carsById = new Map((cars ?? []).map((car) => [car.id, car]));
        const bookingsByRequestId = new Map(
            (bookings ?? [])
                .filter((booking) => booking.request_id)
                .map((booking) => [booking.request_id, booking]),
        );
        const usersById = new Map((users ?? []).map((user) => [user.id, user]));

        return jsonNoStore({
            requests:
                (requests ?? []).map((item) => ({
                    ...item,
                    car: item.car_id ? carsById.get(item.car_id) ?? null : null,
                    booking: bookingsByRequestId.get(item.id) ?? null,
                    user:
                        item.user_id && usersById.has(item.user_id)
                            ? usersById.get(item.user_id)
                            : null,
                })) ?? [],
            filters: {
                status: status ?? '',
                requestType: requestType ?? '',
                source: source ?? '',
                promoCode: promoCode ?? '',
                carId: carId ?? '',
                from: from ?? '',
                to: to ?? '',
            },
            cars: cars ?? [],
        });
    } catch (error) {
        console.error('Admin requests GET failed:', error);
        return jsonNoStore(
            { message: 'Не удалось загрузить заявки.' },
            { status: 500 },
        );
    }
}
