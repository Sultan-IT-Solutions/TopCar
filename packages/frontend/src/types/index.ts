/**
 * =================================================================
 * ГЛАВНЫЕ ТИПЫ ДАННЫХ ВАШЕГО ПРИЛОЖЕНИЯ
 * =================================================================
 */

// Тип для цен из таблицы `prices`
export type Price = {
  id: number;
  car_id: number;
  days_from: number;
  days_to: number;
  price_per_day: number;
  with_driver: boolean;
  conditions?: string;
};

/**
 * Тип для автомобиля.
 */
export type Car = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  class: 'Economy' | 'Business' | 'Premium' | 'Luxury';
  description: string;
  full_description?: string;
  image_url: string;
  gallery_images?: string[];
  prices?: Price[];
  price_per_day: number;
  power?: number;
  acceleration?: number;
  fuel_type?: string;
  drive_type?: string;
  seats?: number;
  year?: number;
};

/**
 * Тип для промокода.
 */
export type PromoCode = {
  id: number;
  code: string;
  is_active: boolean;
  discount_perc: number;
  expires_at: string;
  times_used: number;
  usage_limit: number | null;
  is_personal: boolean;
  user_id: string | null;
  created_at: string;
};

/**
 * Базовый тип для пользователя.
 */
export type User = {
    id: string;
    email?: string;
    full_name?: string;
    phone?: string;
};

/**
 * Базовый тип для бронирования.
 */
export type Booking = {
    id: number;
    car_id: number;
    user_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    created_at: string;
};