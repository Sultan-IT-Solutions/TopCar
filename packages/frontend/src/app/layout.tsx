// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import Script from 'next/script'; // <-- Импортируем компонент Script
import '@/styles/globals.css';

import { AuthProvider } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';
import FloatingWidget from '@/components/FloatingWidget';

const manrope = Manrope({
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        template: '%s | TopCar Almaty',
        default: 'TopCar - Премиум Аренда Авто в Алматы | Elite Cars Rental',
    },
    description:
        'Эксклюзивный автопарк премиум-класса в Алматы: элитные авто, электрокары, luxury cars для туристов. VIP-сервис, трансферы, аренда с водителем и без. Premium car rental, elite vehicles, electric cars for tourists in Almaty.',
    keywords:
        'аренда авто Алматы, элитные авто, премиум автомобили, электрокары, для туристов, car rental Almaty, luxury cars, premium vehicles, elite cars, electric cars, VIP service, трансфер аэропорт',
    manifest: '/manifest.json',
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'TopCar Almaty',
    },
};

export const viewport: Viewport = {
    themeColor: '#0a0a0a',
    colorScheme: 'dark',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru" className={manrope.className}>
            <head>
                {/* --- Google tag (gtag.js) --- */}
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-RN8FMGTC04"
                    strategy="beforeInteractive"
                />
                <Script id="ga4-init" strategy="beforeInteractive">
                    {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-RN8FMGTC04');
          `}
                </Script>
                {/* --- End Google tag (gtag.js) --- */}

                {/* --- SEO: alternate, canonical, language redirect --- */}
                <link
                    rel="alternate"
                    href="https://topcar.club/"
                    hrefLang="ru"
                />
                <link
                    rel="alternate"
                    href="https://topcar.club/en/"
                    hrefLang="en"
                />
                <link
                    rel="alternate"
                    href="https://topcar.club/kk/"
                    hrefLang="kk"
                />
                <link rel="canonical" href="https://topcar.club/" />
                <Script id="lang-redirect" strategy="afterInteractive">
                    {`
            document.addEventListener("DOMContentLoaded", function() {
              var userLang = navigator.language || navigator.userLanguage;
              if (userLang.startsWith("en")) {
                window.location.href = "https://topcar.club/en/";
              } else if (userLang.startsWith("kk")) {
                window.location.href = "https://topcar.club/kk/";
              }
            });
          `}
                </Script>
                {process.env.NODE_ENV === 'development' && (
                    <Script id="dev-cache-reset" strategy="beforeInteractive">
                        {`
              (function() {
                if (typeof window === 'undefined') return;
                var host = window.location.hostname;
                if (host !== 'localhost' && host !== '127.0.0.1') return;
                var reloadKey = '__topcar_dev_cache_reset__';

                try {
                  var swPromise = Promise.resolve([]);
                  var cachePromise = Promise.resolve([]);

                  if ('serviceWorker' in navigator) {
                    swPromise = navigator.serviceWorker.getRegistrations()
                      .then(function(registrations) {
                        return Promise.all(
                          registrations.map(function(registration) {
                            return registration.unregister().then(function() {
                              return registration.scope;
                            });
                          })
                        );
                      })
                      .catch(function() {
                        return [];
                      });
                  }

                  if ('caches' in window) {
                    cachePromise = caches.keys()
                      .then(function(keys) {
                        return Promise.all(
                          keys.map(function(key) {
                            return caches.delete(key).then(function(deleted) {
                              return deleted ? key : null;
                            });
                          })
                        );
                      })
                      .catch(function() {
                        return [];
                      });
                  }

                  Promise.all([swPromise, cachePromise]).then(function(results) {
                    var registrations = (results[0] || []).filter(Boolean);
                    var cachesCleared = (results[1] || []).filter(Boolean);
                    var hadStaleRuntime = registrations.length > 0 || cachesCleared.length > 0;
                    var wasReloaded = window.sessionStorage.getItem(reloadKey) === '1';

                    if (hadStaleRuntime && !wasReloaded) {
                      window.sessionStorage.setItem(reloadKey, '1');
                      window.location.reload();
                      return;
                    }

                    if (!hadStaleRuntime && wasReloaded) {
                      window.sessionStorage.removeItem(reloadKey);
                    }
                  });
                } catch (_) {}
              })();
            `}
                    </Script>
                )}
                {/* --- END SEO --- */}
            </head>
            <body className="bg-background text-foreground">
                <LocaleProvider locale="ru">
                    <AuthProvider>{children}</AuthProvider>
                </LocaleProvider>
                <FloatingWidget />
            </body>
        </html>
    );
}
