import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакты — TopCar Club Алматы',
  description: 'Контакты TopCar Club для аренды элитных авто и электрокаров в Алматы. Адрес, телефон, WhatsApp, Telegram. Premium car rental contacts in Almaty.',
  keywords: 'контакты TopCar, аренда элитных авто Алматы, телефон бронирования, электрокары для туристов, premium car rental contacts, elite car booking Almaty',
  alternates: { canonical: 'https://topcar.club/contacts' },
  robots: { index: true, follow: true },
};

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}