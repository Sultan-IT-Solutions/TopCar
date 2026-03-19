import type { Locale } from '@/lib/i18n';

export const serviceDetailsByLocale: Record<
    Locale,
    Record<string, { title: string; description: string; content: string }>
> = {
    ru: {
        'arenda-s-voditelem': {
            title: 'Аренда с водителем',
            description:
                'Максимальный комфорт и безопасность с нашими профессиональными водителями.',
            content:
                'Наша услуга аренды автомобиля с водителем идеально подходит для деловых поездок, специальных мероприятий или тех, кто ценит свое время и комфорт. Наши водители хорошо знают город и готовы обеспечить безопасную и точную поездку.',
        },
        'transfer-v-aeroport': {
            title: 'Трансфер в аэропорт',
            description:
                'Пунктуальная и комфортная доставка в аэропорт и из него.',
            content:
                'Мы организуем надежные трансферы в международный аэропорт Алматы и обратно. Встретим вас или ваших гостей, поможем с багажом и обеспечим быструю комфортную поездку на автомобиле премиум-класса.',
        },
        'arenda-na-meropriyatiya': {
            title: 'Аренда на мероприятия',
            description:
                'Сделайте ваше событие незабываемым с нашими премиальными автомобилями.',
            content:
                'Свадьбы, юбилеи, корпоративные вечера и фотосессии становятся выразительнее с правильно подобранным автомобилем. Мы предлагаем гибкие условия аренды и персональное сопровождение под формат вашего мероприятия.',
        },
    },
    en: {
        'arenda-s-voditelem': {
            title: 'Chauffeur Service',
            description:
                'Maximum comfort and safety with our professional drivers.',
            content:
                'This service is ideal for business trips, formal meetings, special events, or anyone who values time and comfort. Our drivers know the city well and provide a safe, discreet, and punctual experience.',
        },
        'transfer-v-aeroport': {
            title: 'Airport Transfer',
            description:
                'Comfortable and punctual rides to and from the airport.',
            content:
                'We arrange reliable premium transfers to and from Almaty International Airport. We can meet you or your guests, assist with luggage, and provide a smooth, high-comfort ride to the destination.',
        },
        'arenda-na-meropriyatiya': {
            title: 'Event Rental',
            description:
                'Make your event more memorable with our premium vehicles.',
            content:
                'Weddings, anniversaries, corporate evenings, and photo shoots all benefit from the right vehicle. We offer flexible rental formats and personal coordination tailored to your event.',
        },
    },
    kk: {
        'arenda-s-voditelem': {
            title: 'Жүргізушімен жалдау',
            description:
                'Кәсіби жүргізушілермен бірге барынша жайлылық пен қауіпсіздік.',
            content:
                'Бұл қызмет іскерлік сапарларға, арнайы кездесулерге, іс-шараларға және уақытын бағалайтын клиенттерге ыңғайлы. Біздің жүргізушілер қаланы жақсы біледі және сапарыңызды қауіпсіз әрі нақты ұйымдастырады.',
        },
        'transfer-v-aeroport': {
            title: 'Әуежай трансфері',
            description:
                'Әуежайға және әуежайдан жайлы әрі дәл уақытылы жеткізу.',
            content:
                'Біз Алматы халықаралық әуежайына және одан сенімді премиум трансфер ұйымдастырамыз. Қонақтарды қарсы алып, жүкке көмектесіп, межелі жерге дейін жайлы сапарды қамтамасыз етеміз.',
        },
        'arenda-na-meropriyatiya': {
            title: 'Іс-шараларға жалдау',
            description: 'Премиум көліктермен іс-шараңызды әсерлі етіңіз.',
            content:
                'Той, мерейтой, корпоративтік кеш немесе фотосессия болсын, дұрыс таңдалған көлік әсерді күшейтеді. Біз іс-шара форматына сай икемді жалдау шарттары мен жеке сүйемелдеуді ұсынамыз.',
        },
    },
};

export const defaultServiceSlugs = Object.keys(serviceDetailsByLocale.ru);
