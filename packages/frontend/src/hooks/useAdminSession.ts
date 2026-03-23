'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { csrfClientHelper } from '@/lib/csrf-client';

type AdminSessionState = {
    username: string;
};

export function useAdminSession() {
    const router = useRouter();
    const [admin, setAdmin] = useState<AdminSessionState | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadSession = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/me', {
                cache: 'no-store',
                credentials: 'same-origin',
            });

            if (!response.ok) {
                router.replace('/admin/login');
                return;
            }

            const data = (await response.json()) as AdminSessionState;
            setAdmin(data);
        } catch {
            router.replace('/admin/login');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        void loadSession();
    }, [loadSession]);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/admin/logout', {
                method: 'POST',
                credentials: 'same-origin',
                headers: csrfClientHelper.addTokenToHeaders(),
            });
        } finally {
            setAdmin(null);
            router.replace('/admin/login');
            router.refresh();
        }
    }, [router]);

    return {
        admin,
        isLoading,
        reload: loadSession,
        logout,
    };
}
