// src/components/CarModal.tsx (без изменений, просто для справки)
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Car } from '@/types';
import { X, Clock, Users, Zap, Fuel, Dna, Info, MessageSquare } from 'lucide-react';
import BookingForm from './BookingForm';
import FormattedPrice from './FormattedPrice';
import { useAuth } from '@/context/AuthContext';
import LoginModal from './LoginModal';

// GTM helper for click analytics
const pushEvent = (event: string, payload: Record<string, unknown> = {}) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).dataLayer = (window as any).dataLayer || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).dataLayer.push({ event, ...payload });
  } catch {
    // noop
  }
};

type SelectedTariff = {
  serviceType: string;
  duration: string;
  price: number;
};

type Props = {
    car: Car;
    onClose: () => void;
    onBook: (carToBook: Car, tariff: SelectedTariff) => void;
};

export default function CarModal({ car, onClose, onBook }: Props) {
    const { user } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    
    const dailyPrice = car.prices?.find(p => !p.with_driver && p.days_from === 24)?.price_per_day || car.price_per_day || 0;

    const handleBooking = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        const exampleTariff = {
            serviceType: 'withoutDriver',
            duration: '24h',
            price: dailyPrice,
        };
        onBook(car, exampleTariff);
    };

    const features = [
      { icon: Zap, label: 'Мощность', value: car.power ? `${car.power} л.с.` : 'н/д' },
      { icon: Clock, label: 'Разгон до 100', value: car.acceleration ? `${car.acceleration} сек` : 'н/д' },
      { icon: Fuel, label: 'Тип топлива', value: car.fuel_type || 'н/д' },
      { icon: Dna, label: 'Привод', value: car.drive_type || 'н/д' },
      { icon: Users, label: 'Кол-во мест', value: car.seats || 'н/д' },
      { icon: Info, label: 'Год выпуска', value: car.year || 'н/д' },
    ];
    
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-background border border-border rounded-2xl flex flex-col"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-20">
                        <X size={24} />
                    </button>
                    
                    <div className="flex-grow overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="aspect-video w-full relative rounded-lg overflow-hidden border border-border">
                                <Image src={car.image_url} alt={car.name} fill className="object-cover transition-transform duration-300 hover:scale-105" sizes="(max-width: 1024px) 100vw, 50vw"/>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                {features.map(f => (
                                    <div key={f.label} className="bg-neutral-900 p-3 rounded-md border border-border">
                                        <f.icon className="w-5 h-5 text-brand-accent mb-1.5" />
                                        <p className="text-muted-foreground">{f.label}</p>
                                        <p className="font-semibold text-foreground">{f.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="mb-auto">
                                <p className="text-brand-accent font-semibold mb-1">{car.brand}</p>
                                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{car.name}</h2>
                                <p className="text-muted-foreground leading-relaxed">{car.description}</p>
                            </div>

                            <div className="border-t border-border mt-6 pt-6 space-y-4">
                                <div>
                                    <p className="text-3xl font-bold text-brand-accent">
                                        <FormattedPrice value={dailyPrice} /> ₸
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button 
                                        onClick={handleBooking} 
                                        className="w-full bg-brand-accent text-background font-semibold py-3.5 rounded-lg hover:bg-brand-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        Оставить заявку
                                    </button>
                                    <a 
                                        href="https://wa.me/77776660295"
                                        target="_blank" rel="noopener noreferrer"
                                        className="w-full bg-border text-foreground font-semibold py-3.5 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                                        onClick={() => pushEvent('contact_click', { channel: 'whatsapp', label: 'wa.me/77776660295', location: 'car_modal' })}
                                    >
                                        <MessageSquare size={18}/>
                                        Перейти в WhatsApp
                                    </a>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-xl font-semibold mb-3">Быстрая заявка</h3>
                                    <BookingForm initialCarName={car.name} />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
                {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
            </div>
        </AnimatePresence>
    );
}