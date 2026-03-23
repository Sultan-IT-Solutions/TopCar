import { NextRequest } from 'next/server';
import { jsonNoStore, requireAdminRequest } from '@/lib/admin-route';

export async function GET(request: NextRequest) {
    const admin = await requireAdminRequest(request);

    if (admin instanceof Response) {
        return admin;
    }

    return jsonNoStore({ username: admin.u });
}
