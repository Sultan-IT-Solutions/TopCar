import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';

export async function GET(request: NextRequest) {
    const admin = await requireAdminRequest(request);

    if (admin instanceof Response) {
        return admin;
    }

    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return jsonNoStore(data ?? []);
    } catch (error) {
        console.error('Admin bookings GET failed:', error);
        return jsonNoStore(
            { message: 'Не удалось загрузить бронирования.' },
            { status: 500 },
        );
    }
}
