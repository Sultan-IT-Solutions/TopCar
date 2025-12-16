import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Услуги аренды элитных авто — TopCar Club Алматы',
  description: 'Премиум-услуги аренды элитных авто в Алматы: аренда с водителем, VIP-трансферы в аэропорт, электрокары для туристов, автомобили на мероприятия. Elite car rental services, luxury transfers, premium vehicles for tourists in Almaty.',
  keywords: 'услуги аренды авто, элитные авто с водителем, VIP трансфер, электрокары для туристов, premium car services, luxury chauffeur, elite vehicle rental Almaty',
  alternates: { canonical: 'https://topcar.club/services' },
  robots: { index: true, follow: true },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}