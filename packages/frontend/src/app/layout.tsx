// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import Script from 'next/script'; // <-- Импортируем компонент Script
import '@/styles/globals.css';

import { AuthProvider } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';

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
  description: 'Эксклюзивный автопарк премиум-класса в Алматы: элитные авто, электрокары, luxury cars для туристов. VIP-сервис, трансферы, аренда с водителем и без. Premium car rental, elite vehicles, electric cars for tourists in Almaty.',
  keywords: 'аренда авто Алматы, элитные авто, премиум автомобили, электрокары, для туристов, car rental Almaty, luxury cars, premium vehicles, elite cars, electric cars, VIP service, трансфер аэропорт',
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
        <link rel="alternate" href="https://topcar.club/" hrefLang="ru" />
        <link rel="alternate" href="https://topcar.club/en/" hrefLang="en" />
        <link rel="alternate" href="https://topcar.club/kk/" hrefLang="kk" />
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
        {/* --- END SEO --- */}
      </head>
      <body className="bg-background text-foreground">

        <LocaleProvider locale="ru">
          <AuthProvider>
            {children}
          </AuthProvider>
        </LocaleProvider>

        {/* --- WhatsApp Widget (Waplus) --- */}
        <Script id="whatsapp-widget" strategy="afterInteractive">
          {`
            (function(){
              var url = 'https://cdn.waplus.io/waplus-crm/settings/ossembed.js';
              var s = document.createElement('script');
              s.type = 'text/javascript';
              s.async = true;
              s.src = url;
              var options = {
                "enabled": true,
                "chatButtonSetting": {
                  "backgroundColor": "#16BE45",
                  "ctaText": "",
                  "borderRadius": "8",
                  "marginLeft": "20",
                  "marginBottom": "20",
                  "marginRight": "20",
                  "position": "right",
                  "textColor": "#000000",
                  "phoneNumber": "77776660295",
                  "messageText": "Hello",
                  "trackClick": true
                }
              };
              s.onload = function() {
                if (typeof CreateWhatsappBtn === 'function') {
                  CreateWhatsappBtn(options);
                }
                // Attach bounce class and ensure label text is hidden
                try {
                  var applied = false;
                  var side = (options && options.chatButtonSetting && options.chatButtonSetting.position) || 'right';
                  function isCandidate(el){
                    try {
                      if (!el || el.nodeType !== 1) return false;
                      var cs = window.getComputedStyle(el);
                      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return false;
                      var rect = el.getBoundingClientRect();
                      var bottom = parseInt(cs.bottom || '0', 10);
                      var right = parseInt(cs.right || '9999', 10);
                      var left = parseInt(cs.left || '9999', 10);
                      var nearBottom = (bottom >= 0 && bottom <= 180) || (window.innerHeight - rect.bottom <= 180);
                      var nearSide = side === 'right' ? (right >= 0 && right <= 180) : (left >= 0 && left <= 180);
                      var minSize = rect.width >= 40 && rect.height >= 40;
                      return nearBottom && nearSide && minSize;
                    } catch(_) { return false; }
                  }
                  function removeTextNodes(node){
                    try {
                      var children = Array.prototype.slice.call(node.childNodes || []);
                      for (var i = 0; i < children.length; i++) {
                        var n = children[i];
                        if (n.nodeType === 3) { n.textContent = ''; }
                      }
                    } catch(_) {}
                  }
                  function attachBounce(){
                    if (applied) return;
                    var btn = document.querySelector('[id*="wa" i], [class*="wa" i], [data-waplus], a[href*="wa.me"], button');
                    if (!btn || !isCandidate(btn)) {
                      var all = document.querySelectorAll('a,button,div,span');
                      for (var i=0; i<all.length; i++) { if (isCandidate(all[i])) { btn = all[i]; break; } }
                    }
                    if (btn && isCandidate(btn)) {
                      if (!btn.classList.contains('waplus-bounce')) btn.classList.add('waplus-bounce');
                      removeTextNodes(btn);
                      applied = true;
                      if (observer) observer.disconnect();
                    }
                  }
                  var observer = new MutationObserver(function(){ attachBounce(); });
                  observer.observe(document.body, { childList: true, subtree: true });
                  setTimeout(attachBounce, 300);
                  setTimeout(attachBounce, 1200);
                  setTimeout(attachBounce, 2400);
                } catch(_) {}
              };
              var x = document.getElementsByTagName('script')[0];
              x.parentNode && x.parentNode.insertBefore(s, x);
            })();
          `}
        </Script>
        {/* --- END WhatsApp Widget (Waplus) --- */}
      </body>
    </html>
  );
}