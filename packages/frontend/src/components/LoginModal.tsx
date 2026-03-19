'use client';

import { useState, ChangeEvent } from 'react';
import { getSupabase, hasPublicSupabaseConfig } from '@/lib/supabase';
import { formatPhoneNumber } from '@/lib/formatters';
import InputField from '@/components/ui/InputField';
import { Loader2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

type Props = {
    onClose: () => void;
};

export default function LoginModal({ onClose }: Props) {
    const { locale } = useTranslations();
    const [isSignup, setIsSignup] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const supabase = hasPublicSupabaseConfig() ? getSupabase() : null;
    const copy =
        locale === 'en'
            ? {
                  unavailable:
                      'Sign-in is temporarily unavailable right now. Please try again a little later.',
                  signupSuccess:
                      'Registration was successful. Please confirm your email.',
                  genericError: 'An error occurred. Please try again.',
                  signupTitle: 'Create a TopCar account',
                  loginTitle: 'Sign in to TopCar',
                  nameLabel: 'Name',
                  namePlaceholder: 'How should we address you?',
                  phoneLabel: 'Phone',
                  passwordLabel: 'Password',
                  envWarning: 'Sign-in is temporarily unavailable right now.',
                  signupLoading: 'Signing up...',
                  loginLoading: 'Signing in...',
                  signupButton: 'Create account',
                  loginButton: 'Continue',
                  hasAccount: 'Already have an account?',
                  noAccount: 'No account yet?',
                  signIn: 'Sign in',
                  signUp: 'Register',
                  cancel: 'Cancel',
              }
            : locale === 'kk'
              ? {
                    unavailable:
                        'Қазір кіру уақытша қолжетімсіз. Сәл кейінірек қайталап көріңіз.',
                    signupSuccess:
                        'Тіркелу сәтті аяқталды. Email-ыңызды растаңыз.',
                    genericError: 'Қате орын алды. Қайталап көріңіз.',
                    signupTitle: 'TopCar-ға тіркелу',
                    loginTitle: 'TopCar-ға кіру',
                    nameLabel: 'Аты',
                    namePlaceholder: 'Сізге қалай жүгінейік?',
                    phoneLabel: 'Телефон',
                    passwordLabel: 'Құпиясөз',
                    envWarning: 'Қазір кіру уақытша қолжетімсіз.',
                    signupLoading: 'Тіркелуде...',
                    loginLoading: 'Кіру...',
                    signupButton: 'Тіркелу',
                    loginButton: 'Жалғастыру',
                    hasAccount: 'Аккаунтыңыз бар ма?',
                    noAccount: 'Аккаунт жоқ па?',
                    signIn: 'Кіру',
                    signUp: 'Тіркелу',
                    cancel: 'Бас тарту',
                }
              : {
                    unavailable:
                        'Вход временно недоступен. Попробуйте еще раз немного позже.',
                    signupSuccess:
                        'Регистрация прошла успешно! Пожалуйста, подтвердите ваш email.',
                    genericError: 'Произошла ошибка. Попробуйте еще раз.',
                    signupTitle: 'Регистрация в TopCar',
                    loginTitle: 'Вход в TopCar',
                    nameLabel: 'Имя',
                    namePlaceholder: 'Как к вам обращаться',
                    phoneLabel: 'Телефон',
                    passwordLabel: 'Пароль',
                    envWarning: 'Вход временно недоступен.',
                    signupLoading: 'Регистрация...',
                    loginLoading: 'Вход...',
                    signupButton: 'Зарегистрироваться',
                    loginButton: 'Продолжить',
                    hasAccount: 'Уже есть аккаунт?',
                    noAccount: 'Нет аккаунта?',
                    signIn: 'Войти',
                    signUp: 'Зарегистрироваться',
                    cancel: 'Отмена',
                };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            setFormData((prev) => ({
                ...prev,
                [name]: formatPhoneNumber(value),
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!supabase) {
                throw new Error(copy.unavailable);
            }

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
                alert(copy.signupSuccess);
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
            setError((err as Error).message || copy.genericError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
            <div className="bg-black border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-xl backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-white">
                    {isSignup ? copy.signupTitle : copy.loginTitle}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignup && (
                        <InputField
                            id="name"
                            label={copy.nameLabel}
                            name="name"
                            type="text"
                            placeholder={copy.namePlaceholder}
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
                        readOnly={!supabase}
                    />
                    {isSignup && (
                        <InputField
                            id="phone"
                            label={copy.phoneLabel}
                            name="phone"
                            type="tel"
                            placeholder="+7 (___) ___-__-__"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={loading}
                            readOnly={!supabase}
                        />
                    )}
                    <InputField
                        id="password"
                        label={copy.passwordLabel}
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        readOnly={!supabase}
                    />

                    {error && (
                        <p className="text-red-400 text-sm pt-2">{error}</p>
                    )}
                    {!supabase && !error && (
                        <p className="text-amber-300 text-sm pt-2">
                            {copy.envWarning}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !supabase}
                        className="w-full mt-6 bg-white text-black py-3 rounded-full font-semibold tracking-wide hover:bg-white/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <Loader2 size={20} className="animate-spin" />
                        )}
                        {loading
                            ? isSignup
                                ? copy.signupLoading
                                : copy.loginLoading
                            : isSignup
                              ? copy.signupButton
                              : copy.loginButton}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm text-white/60">
                        {isSignup ? copy.hasAccount : copy.noAccount}{' '}
                        <button
                            className="underline hover:text-white transition"
                            disabled={loading}
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setError('');
                            }}
                        >
                            {isSignup ? copy.signIn : copy.signUp}
                        </button>
                    </p>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="mt-3 text-sm text-white/60 hover:underline disabled:opacity-50"
                    >
                        {copy.cancel}
                    </button>
                </div>
            </div>
        </div>
    );
}
