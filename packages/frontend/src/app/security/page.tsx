// /app/security/page.tsx
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline";

const documents = [
  { name: "Лицензия на осуществление деятельности", fileUrl: "/docs/license.pdf" },
  { name: "Сертификат соответствия", fileUrl: "/docs/certificate.pdf" },
  { name: "Политика страхования", fileUrl: "/docs/insurance.pdf" },
];

export default function SecurityPage() {
  return (
    <AnimatedPageWrapper>
      <Header />
      <main className="min-h-screen bg-neutral-950 text-white pt-24 sm:pt-32">
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center tracking-tight">
              Безопасность и <span className="text-[#d4af37]">документы</span>
              <span className="block w-24 h-1 bg-[#d4af37] mx-auto mt-4"></span>
            </h1>
            <p className="text-lg text-neutral-400 mb-16 text-center max-w-2xl mx-auto">
              Мы работаем полностью официально и прозрачно. Здесь вы можете ознакомиться с нашими ключевыми документами, подтверждающими нашу надежность и соответствие стандартам.
            </p>

            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="bg-neutral-900 border border-neutral-700 rounded-xl p-5 flex items-center justify-between gap-4">
                  <p className="font-semibold text-white">{doc.name}</p>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 text-neutral-400 hover:text-[#d4af37] transition-colors"
                      title="Просмотреть"
                    >
                      <EyeIcon className="h-6 w-6" />
                    </a>
                    <a 
                      href={doc.fileUrl} 
                      download 
                      className="p-2 text-neutral-400 hover:text-[#d4af37] transition-colors"
                      title="Скачать"
                    >
                      <ArrowDownTrayIcon className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </AnimatedPageWrapper>
  );
}