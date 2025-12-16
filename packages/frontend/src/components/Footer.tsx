// src/components/Footer.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/20/solid'
import { useTranslations } from '@/lib/i18n'

// --- НОВЫЕ SVG-ИКОНКИ ---

// Иконка для Instagram
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// Иконка для Telegram
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-1.4.2-1.75l15.5-5.25c.83-.28 1.5.2 1.28 1.28l-5.25 15.5c-.35.83-1.4.88-1.75.2L9.78 18.65z"></path>
  </svg>
);

// Иконка для WhatsApp
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.1-.3.2-.5.1-.3-.1-.9-.3-1.8-.9-.6-.5-1.1-1-1.2-1.2-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.3.1-.1.2-.3.2-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2 1 2.3.1.1 1.5 2.3 3.6 3.2.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.5.2-1 0-1.1-.1-.1-.3-.2-.5-.2zM12 2a10 10 0 100 20 10 10 0 000-20z"></path>
  </svg>
);


export default function Footer() {
  const { t } = useTranslations();
  const currentYear = new Date().getFullYear();

  // --- ОБНОВЛЕННЫЙ МАССИВ ССЫЛОК ---
  const socialLinks: { name: string; href: string; Icon: React.FC<{ className?: string }> }[] = [
    { name: 'Instagram', href: 'https://www.instagram.com/topcar.qz?igsh=MXJjbTZ5M3BwdTkzMA==', Icon: InstagramIcon },
    { name: 'Telegram', href: 'https://t.me/topcarqz', Icon: TelegramIcon },
    { name: 'WhatsApp', href: 'https://wa.me/77776660295', Icon: WhatsAppIcon },
  ];

  return (
    <footer className="bg-neutral-950 text-white border-t border-neutral-800">
      <div className="max-w-7xl mx-auto pt-16 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 xl:gap-12">

          <div className="md:col-span-4 xl:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <Image src="/logo.png" alt="TopCar Logo" width={40} height={40} className="rounded-sm" />
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f0dca0]">
                TOPCAR
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-sm sm:text-base max-w-md mb-6">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-[#d4af37] group transition-colors duration-200"
                  aria-label={item.name}
                >
                  <item.Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 xl:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-5 sm:mb-6">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3 text-sm sm:text-base">
              <li><Link href="/autopark" className="text-neutral-300 hover:text-[#d4af37] transition-colors">{t('nav.autopark')}</Link></li>
              <li><Link href="/services" className="text-neutral-300 hover:text-[#d4af37] transition-colors">{t('nav.services')}</Link></li>
              <li><Link href="/#faq" className="text-neutral-300 hover:text-[#d4af37] transition-colors">FAQ</Link></li>
              <li><Link href="/contacts" className="text-neutral-300 hover:text-[#d4af37] transition-colors">{t('nav.contacts')}</Link></li>
              <li><Link href="/terms" className="text-neutral-300 hover:text-[#d4af37] transition-colors">{t('nav.terms')}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3 xl:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-5 sm:mb-6">{t('footer.contacts')}</h4>
            <ul className="space-y-3 text-sm sm:text-base text-neutral-300">
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-[#d4af37] mr-2.5 mt-0.5 flex-shrink-0" />
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-start">
                <PhoneIcon className="h-5 w-5 text-[#d4af37] mr-2.5 mt-0.5 flex-shrink-0" />
                <a href="tel:+77776660295" className="hover:text-[#d4af37] transition-colors">{t('footer.phone')}</a>
              </li>
              <li className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 text-[#d4af37] mr-2.5 mt-0.5 flex-shrink-0" />
                <a href="mailto:topcarelite.kz@gmail.com" className="hover:text-[#d4af37] transition-colors">{t('footer.email')}</a>
              </li>
              <li className="text-xs text-neutral-500 mt-2">{t('contacts.workingTime')}</li>
            </ul>
          </div>
          
          <div className="md:col-span-3 xl:col-span-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-5 sm:mb-6">{t('contacts.getInTouch')}</h4>
             <ul className="space-y-3 text-sm sm:text-base">
               <li>
                 <a href="https://wa.me/77776660295" target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-[#d4af37] transition-colors flex items-center group">
                   <WhatsAppIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
                   WhatsApp
                 </a>
               </li>
               <li>
                 <a href="https://t.me/topcarqz" target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-[#d4af37] transition-colors flex items-center group">
                   <TelegramIcon className="h-5 w-5 mr-2 text-[#d4af37]" />
                   Telegram
                 </a>
               </li>
               <li>
                 <a href="mailto:topcarelite.kz@gmail.com" className="text-neutral-300 hover:text-[#d4af37] transition-colors flex items-center">
                   <EnvelopeIcon className="h-5 w-5 text-[#d4af37] mr-2" />
                   {t('contacts.email')}
                 </a>
               </li>
             </ul>
          </div>
        </div>

        <div className="mt-16 sm:mt-20 pt-8 border-t border-neutral-800 text-center sm:flex sm:justify-between">
          <p className="text-xs text-neutral-500 mb-3 sm:mb-0">
            © {currentYear} TopCar Club. {t('footer.rights')}
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/privacy-policy" className="text-xs text-neutral-500 hover:text-[#d4af37] transition-colors">{t('footer.privacy')}</Link>
            <Link href="/terms" className="text-xs text-neutral-500 hover:text-[#d4af37] transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}