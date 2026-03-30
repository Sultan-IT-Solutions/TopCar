// src/app/api/user/promocodes/route.ts
import { NextRequest } from 'next/server';
import { jsonNoStore } from '@/lib/admin-route';
import { RateLimitPresets, withRateLimit } from '@/lib/rate-limit';
import { getRequestUser } from '@/lib/user-session';
import { listUserPromoCodes } from '@/lib/promos-server';

export const GET = withRateLimit(async (request: NextRequest) => {
    try {
        const user = await getRequestUser(request);

        if (!user) {
            return jsonNoStore(
                { message: 'Пользователь не авторизован' },
                { status: 401 },
            );
        }

        const promoCodes = await listUserPromoCodes(user.id);
        return jsonNoStore(promoCodes);
    } catch (err: unknown) {
        return jsonNoStore(
            { message: (err as Error).message || 'Внутренняя ошибка сервера' },
            { status: 500 },
        );
    }
}, RateLimitPresets.API_MODERATE, 'user-promocodes');
