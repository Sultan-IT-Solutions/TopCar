'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

type CarClass = 'Эконом' | 'Бизнес' | 'Премиум' | 'Люкс';

export default function AdminUploadPanel() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState<number | null>(null);
    const [brand, setBrand] = useState('');
    const [carClass, setCarClass] = useState<CarClass>('Бизнес');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');

    const handleUpload = async () => {
        if (!name || !price || !brand || !carClass || !imageFile) {
            setMessage('Пожалуйста, заполните все поля.');
            return;
        }

        const supabase = getSupabase();

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${name.toLowerCase().replace(/\s+/g, '')}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('cars')
            .upload(fileName, imageFile, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            setMessage(`Ошибка загрузки изображения: ${uploadError.message}`);
            return;
        }

        const { error: insertError } = await supabase.from('cars').insert([
            {
                name,
                price,
                brand,
                class: carClass,
                image_url: `/storage/v1/object/public/cars/${fileName}`,
            },
        ]);

        if (insertError) {
            setMessage(`Ошибка записи в базу: ${insertError.message}`);
        } else {
            setMessage('🚗 Успешно загружено!');
            setName('');
            setPrice(null);
            setBrand('');
            setCarClass('Бизнес');
            setImageFile(null);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-12 bg-white/5 border border-white/10 p-6 rounded-xl text-white">
            <h2 className="text-2xl font-bold mb-6">Загрузка нового авто</h2>

            <div className="space-y-4">
                <input
                    placeholder="Название авто"
                    className="w-full p-3 bg-black border border-white/20 rounded-md"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    placeholder="Цена (₸)"
                    type="number"
                    className="w-full p-3 bg-black border border-white/20 rounded-md"
                    value={price ?? ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                />
                <input
                    placeholder="Марка"
                    className="w-full p-3 bg-black border border-white/20 rounded-md"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                />
                <select
                    className="w-full p-3 bg-black border border-white/20 rounded-md"
                    value={carClass}
                    onChange={(e) => setCarClass(e.target.value as CarClass)}
                >
                    <option value="Эконом">Эконом</option>
                    <option value="Бизнес">Бизнес</option>
                    <option value="Премиум">Премиум</option>
                    <option value="Люкс">Люкс</option>
                </select>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="text-white/70"
                />

                <button
                    onClick={handleUpload}
                    className="w-full px-4 py-3 bg-white text-black font-semibold rounded-full hover:bg-[#d4af37] hover:text-white transition"
                >
                    Загрузить авто
                </button>

                {message && (
                    <p className="mt-4 text-sm text-white/70">{message}</p>
                )}
            </div>
        </div>
    );
}
