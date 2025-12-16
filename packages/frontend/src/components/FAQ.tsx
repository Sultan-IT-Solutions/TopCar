// src/components/FAQ.tsx
'use client'

import FadeInWhenVisible from './FadeInWhenVisible'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useTranslations } from '@/lib/i18n';

// More structured FAQ data
export default function FAQ() {
  const { t } = useTranslations();
  const faqData = [
    { question: t('faq.payment'), answer: t('faq.paymentDesc') },
    { question: t('faq.terms'), answer: t('faq.termsDesc') },
    { question: t('faq.return'), answer: t('faq.returnDesc') },
    { question: t('faq.outOfCity'), answer: t('faq.outOfCityDesc') },
  ];
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqData.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  };
  return (
    <section id="faq" className="py-24 sm:py-32 px-4 sm:px-6 bg-neutral-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-4xl mx-auto">
        <FadeInWhenVisible>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-16 sm:mb-20 text-center tracking-tight text-white">
            {t('faq.title').split(' ')[0]} <span className="text-[#d4af37]">{t('faq.title').split(' ')[1]}</span>
            <span className="block w-24 h-1 bg-[#d4af37] mx-auto mt-4"></span>
          </h2>
        </FadeInWhenVisible>
        <div className="space-y-5">
          {faqData.map((item, idx) => (
            <FadeInWhenVisible key={idx} delay={idx * 0.05}>
              <details className="group bg-neutral-900 border border-neutral-700/70 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:border-[#d4af37]/50">
                <summary 
                  className="flex justify-between items-center p-6 cursor-pointer list-none group-hover:bg-neutral-800/50 rounded-t-xl transition-colors"
                >
                  <span className="text-lg sm:text-xl font-semibold text-white group-hover:text-[#d4af37] transition-colors">
                    {item.question}
                  </span>
                  <ChevronDownIcon className="h-6 w-6 text-neutral-400 group-hover:text-[#d4af37] transition-transform duration-300 ease-in-out group-open:rotate-180" />
                </summary>
                <div className="p-6 pt-0 text-sm sm:text-base text-neutral-300 leading-relaxed opacity-0 max-h-0 group-open:opacity-100 group-open:max-h-screen group-open:pt-2 transition-all duration-500 ease-in-out">
                  <p className="whitespace-pre-line">{item.answer}</p>
                </div>
              </details>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  )
}
