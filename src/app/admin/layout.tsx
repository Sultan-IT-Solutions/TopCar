import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Админ-панель — TopCar Club',
  description: 'Административная панель для управления сайтом TopCar Club. Только для авторизованных администраторов.',
  alternates: { canonical: 'https://topcar.club/admin' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}