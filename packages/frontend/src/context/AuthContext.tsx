// src/context/AuthContext.tsx
'use client';

import {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
    useRef,
} from 'react';
import { getSupabase, hasPublicSupabaseConfig } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// Определяем тип для нашего контекста
type AuthContextType = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
};

// Создаем контекст с начальным значением undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Создаем компонент-провайдер
export function AuthProvider({ children }: { children: ReactNode }) {
    const supabase = hasPublicSupabaseConfig() ? getSupabase() : null;
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Защита от race conditions - используем ref для отслеживания активных операций
    const mountedRef = useRef(true);
    const sessionLoadingRef = useRef(false);

    useEffect(() => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        // Флаг что компонент примонтирован
        mountedRef.current = true;

        // Эта функция будет вызываться при первом рендере
        // и сразу проверит, есть ли активная сессия
        const getActiveSession = async () => {
            // Предотвращаем параллельные загрузки сессии
            if (sessionLoadingRef.current) {
                return;
            }

            sessionLoadingRef.current = true;

            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                // Проверяем что компонент еще примонтирован перед обновлением state
                if (mountedRef.current) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error loading session:', error);
                if (mountedRef.current) {
                    setIsLoading(false);
                }
            } finally {
                sessionLoadingRef.current = false;
            }
        };

        getActiveSession();

        // onAuthStateChange - это "волшебная" функция Supabase.
        // Она автоматически вызывается каждый раз, когда пользователь
        // входит в систему, выходит из нее или его сессия обновляется.
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            // Обновляем state только если компонент примонтирован
            if (mountedRef.current) {
                setSession(session);
                setUser(session?.user ?? null);

                // Синхронизируем localStorage для совместимости со старым кодом, если нужно
                if (session) {
                    // Важно: Сохраняем только неконфиденциальные данные
                    try {
                        localStorage.setItem(
                            'topcar-user',
                            JSON.stringify({
                                id: session.user.id,
                                email: session.user.email,
                                name: session.user.user_metadata.name,
                            }),
                        );
                    } catch (error) {
                        console.error('Error saving to localStorage:', error);
                    }
                } else {
                    try {
                        localStorage.removeItem('topcar-user');
                    } catch (error) {
                        console.error(
                            'Error removing from localStorage:',
                            error,
                        );
                    }
                }
            }
        });

        // Отписываемся от слушателя при размонтировании компонента
        return () => {
            mountedRef.current = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    // Функция для выхода из системы с защитой от race conditions
    const signOut = async () => {
        if (!mountedRef.current || !supabase) return;

        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const value = {
        session,
        user,
        isLoading,
        signOut,
    };

    // Передаем значение контекста всем дочерним компонентам
    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

// Создаем кастомный хук для удобного использования контекста
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
