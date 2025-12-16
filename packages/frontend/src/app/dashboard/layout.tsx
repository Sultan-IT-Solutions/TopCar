import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Личный кабинет — TopCar',
  description: 'Управление профилем и сохраненными расчётами. Доступно только авторизованным пользователям.',
  alternates: { canonical: 'https://topcar.club/dashboard' },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}