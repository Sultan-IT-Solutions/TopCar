// src/context/AuthContext.tsx
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getSupabase } from '@/lib/supabase';
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
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Эта функция будет вызываться при первом рендере
    // и сразу проверит, есть ли активная сессия
    const getActiveSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getActiveSession();

    // onAuthStateChange - это "волшебная" функция Supabase.
    // Она автоматически вызывается каждый раз, когда пользователь
    // входит в систему, выходит из нее или его сессия обновляется.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Синхронизируем localStorage для совместимости со старым кодом, если нужно
        if (session) {
          // Важно: Сохраняем только неконфиденциальные данные
          localStorage.setItem('topcar-user', JSON.stringify({ id: session.user.id, email: session.user.email, name: session.user.user_metadata.name }));
        } else {
          localStorage.removeItem('topcar-user');
        }
      }
    );

    // Отписываемся от слушателя при размонтировании компонента
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Функция для выхода из системы
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
  };

  // Передаем значение контекста всем дочерним компонентам
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Создаем кастомный хук для удобного использования контекста
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}