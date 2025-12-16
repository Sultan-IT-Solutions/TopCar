import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <AnimatedPageWrapper>
      <Header />
      <main className="min-h-screen bg-neutral-950 text-white pt-24 sm:pt-32">
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center tracking-tight">
              Политика <span className="text-[#d4af37]">конфиденциальности</span>
              <span className="block w-24 h-1 bg-[#d4af37] mx-auto mt-4"></span>
            </h1>
            <p className="text-lg text-neutral-400 mb-8 text-center max-w-2xl mx-auto">
              Мы заботимся о вашей конфиденциальности. В этом разделе описано, как мы собираем, используем и защищаем вашу личную информацию при использовании нашего сайта и услуг.
            </p>
            <div className="space-y-6 text-neutral-300 text-base">
              <div>
                <h2 className="font-semibold text-lg mb-2">1. Сбор информации</h2>
                <p>Мы собираем только ту информацию, которая необходима для предоставления наших услуг: имя, контактные данные, детали бронирования и т.д.</p>
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">2. Использование информации</h2>
                <p>Ваши данные используются исключительно для обработки заявок, бронирований и обратной связи. Мы не передаем ваши данные третьим лицам без вашего согласия, за исключением случаев, предусмотренных законом.</p>
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">3. Защита информации</h2>
                <p>Мы принимаем все необходимые меры для защиты ваших данных от несанкционированного доступа, изменения или уничтожения.</p>
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">4. Cookies</h2>
                <p>Мы используем cookies для улучшения работы сайта. Вы можете отключить cookies в настройках вашего браузера.</p>
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">5. Изменения политики</h2>
                <p>Мы можем периодически обновлять данную политику. Актуальная версия всегда доступна на этой странице.</p>
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">6. Контакты</h2>
                <p>Если у вас есть вопросы по поводу обработки ваших данных, свяжитесь с нами через форму на странице <a href="/contacts" className="text-[#d4af37] underline">Контакты</a>.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </AnimatedPageWrapper>
  );
}