import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Аренда авто в Алматы — премиальные автомобили | TopCar Club',
  description: 'Аренда премиум‑автомобилей в Алматы: прозрачные условия, круглосуточная поддержка, безупречный сервис. Выберите идеальный автомобиль для деловой поездки или события.',
  alternates: { canonical: 'https://topcar.club/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'TopCar Club — аренда премиальных автомобилей в Алматы',
    description: 'Премиальные автомобили, прозрачные условия, поддержка 24/7. Бронируйте онлайн на TopCar Club.',
    url: 'https://topcar.club/',
    siteName: 'TopCar Club',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TopCar Club — аренда премиальных автомобилей в Алматы',
    description: 'Премиальные автомобили, прозрачные условия, поддержка 24/7. Бронируйте онлайн на TopCar Club.',
  },
};

export default function HomeRouteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}