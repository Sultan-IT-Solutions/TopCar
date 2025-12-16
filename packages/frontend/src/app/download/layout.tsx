import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Скачать приложение — TopCar Club Алматы',
  description: 'Скачайте мобильное приложение TopCar Club для удобного бронирования элитных авто и электрокаров в Алматы. Download our app for premium car rental in Almaty.',
  alternates: { canonical: 'https://topcar.club/download' },
  robots: { index: true, follow: true },
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return children;
}