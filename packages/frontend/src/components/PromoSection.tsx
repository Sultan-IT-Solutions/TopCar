'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

const PromoSection = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            // Здесь должна быть логика отправки данных на ваш API
            // Например:
            // const response = await fetch('/api/subscribe', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ email }),
            // });
            // if (!response.ok) throw new Error('Не удалось подписаться.');

            // Имитация задержки сети
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('Подписка на промокоды для email:', email);
            setMessage('Спасибо! Мы выслали промокод на вашу почту.');
            setEmail('');
        } catch (err: unknown) { // ИЗМЕНЕНИЕ ЗДЕСЬ
            setError((err as Error).message || 'Произошла ошибка, попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gradient-to-t from-background to-neutral-900 py-20">
            <motion.div 
                className="container mx-auto px-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Получите <span className="text-brand-accent">Скидку 15%</span> на Первую Поездку
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                    Подпишитесь на нашу рассылку и получите эксклюзивный промокод. Будьте в курсе наших лучших предложений и новостей.
                </p>
                
                <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Введите ваш E-mail"
                        required
                        disabled={loading}
                        className="flex-grow px-4 py-3 rounded-lg bg-neutral-800 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 rounded-lg bg-brand-accent text-background font-semibold hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Отправка...' : 'Получить промокод'}
                    </button>
                </form>

                {message && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                        <CheckCircle size={18} />
                        <span>{message}</span>
                    </div>
                )}
                {error && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-red-400">
                        <XCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}
            </motion.div>
        </section>
    );
};

export default PromoSection;