'use client';

import { useTranslations } from '@/lib/i18n';

interface SEOBlockProps {
  page: 'home' | 'autopark' | 'services' | 'contacts' | 'terms' | 'privacy' | 'download' | 'security';
}

export default function SEOBlock({ page }: SEOBlockProps) {
  const { t } = useTranslations();

  const getSEOContent = () => {
    switch (page) {
      case 'home':
        return {
          title: t('seo.home.title'),
          content: t('seo.home.content')
        };
      case 'autopark':
        return {
          title: t('seo.autopark.title'),
          content: t('seo.autopark.content')
        };
      case 'services':
        return {
          title: t('seo.services.title'),
          content: t('seo.services.content')
        };
      case 'contacts':
        return {
          title: t('seo.contacts.title'),
          content: t('seo.contacts.content')
        };
      case 'terms':
        return {
          title: t('seo.terms.title'),
          content: t('seo.terms.content')
        };
      case 'privacy':
        return {
          title: t('seo.privacy.title'),
          content: t('seo.privacy.content')
        };
      case 'download':
        return {
          title: t('seo.download.title'),
          content: t('seo.download.content')
        };
      case 'security':
        return {
          title: t('seo.security.title'),
          content: t('seo.security.content')
        };
      default:
        return {
          title: 'TopCar Club Алматы',
          content: 'Премиум аренда автомобилей в Алматы'
        };
    }
  };

  const { title, content } = getSEOContent();

  return (
    <section className="bg-neutral-900 py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {title}
          </h2>
          <div className="prose prose-invert prose-lg mx-auto">
            <div 
              className="text-neutral-300 leading-relaxed text-base sm:text-lg"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
