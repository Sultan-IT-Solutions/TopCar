'use client'

import { useState, ChangeEvent } from 'react';
import { getSupabase } from '@/lib/supabase';
import { formatPhoneNumber } from '@/lib/formatters';
import InputField from '@/components/ui/InputField'; 
import { Loader2 } from 'lucide-react';

type Props = {
  onClose: () => void;
};

export default function LoginModal({ onClose }: Props) {
  const [isSignup, setIsSignup] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const supabase = getSupabase();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              phone: formData.phone.replace(/[^\d]/g, ''),
            },
          },
        });

        if (error) throw error;
        alert('Регистрация прошла успешно! Пожалуйста, подтвердите ваш email.');
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        onClose();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="bg-black border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 tracking-tight text-white">
          {isSignup ? 'Регистрация в TopCar' : 'Вход в TopCar'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <InputField
              id="name"
              label="Имя"
              name="name"
              type="text"
              placeholder="Как к вам обращаться"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          )}
          <InputField
            id="email"
            label="Email"
            name="email"
            type="email"
            placeholder="example@mail.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {isSignup && (
            <InputField
              id="phone"
              label="Телефон"
              name="phone"
              type="tel"
              placeholder="+7 (___) ___-__-__"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          )}
          <InputField
            id="password"
            label="Пароль"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

          {error && <p className="text-red-400 text-sm pt-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-white text-black py-3 rounded-full font-semibold tracking-wide hover:bg-white/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? (isSignup ? 'Регистрация...' : 'Вход...') : (isSignup ? 'Зарегистрироваться' : 'Продолжить')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-white/60">
            {isSignup ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <button
              className="underline hover:text-white transition"
              disabled={loading}
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
            >
              {isSignup ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
          <button
            onClick={onClose}
            disabled={loading}
            className="mt-3 text-sm text-white/60 hover:underline disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
