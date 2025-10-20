'use client';
import { useState } from 'react';
import { TagIcon, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const UserPromoCodes = () => {
    const [promoCode, setPromoCode] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApplyPromoCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!promoCode) return;

        setLoading(true);
        setMessage('');
        setError('');

        try {
            // Здесь будет логика проверки промокода через ваш API
            // const response = await fetch('/api/promocodes/apply', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ code: promoCode }),
            // });
            // const data = await response.json();
            // if (!response.ok) throw new Error(data.message);

            // Имитация задержки и ответа
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (promoCode.toUpperCase() === 'SALE15') {
                setMessage('Промокод "SALE15" успешно применен! Скидка 15% добавлена к вашему аккаунту.');
            } else {
                throw new Error('Неверный или истекший промокод.');
            }
            setPromoCode('');
        } catch (err: unknown) { // ИЗМЕНЕНИЕ ЗДЕСЬ
            setError((err as Error).message || 'Произошла ошибка.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <div className="flex items-center mb-6">
                <TagIcon className="h-8 w-8 text-[#d4af37] mr-3 shrink-0" />
                <h2 className="text-2xl font-bold text-white">Промокоды</h2>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8">
                <p className="text-sm text-neutral-400 mb-4">
                    Введите промокод, чтобы получить скидку на следующие поездки.
                </p>
                <form onSubmit={handleApplyPromoCode} className="flex flex-col sm:flex-row gap-4">
                    <input 
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Ваш промокод"
                        disabled={loading}
                        className="flex-grow px-4 py-3 rounded-lg bg-neutral-800 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                    <button
                        type="submit"
                        disabled={loading || !promoCode}
                        className="px-6 py-3 rounded-lg bg-[#d4af37] text-background font-semibold hover:bg-[#c0982c] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        Применить
                    </button>
                </form>
                {message && (
                    <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle size={18} />
                        <span>{message}</span>
                    </div>
                )}
                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
                        <XCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </section>
    );
};

export default UserPromoCodes;